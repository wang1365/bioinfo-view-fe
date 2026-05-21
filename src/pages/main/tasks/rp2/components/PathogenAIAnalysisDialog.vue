<template>
    <q-dialog v-model="visible" persistent>
        <q-card class="pathogen-ai-dialog">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">
                    <q-icon name="auto_awesome" color="primary" class="q-mr-sm" />
                    AI 病原检测解读
                </div>
                <q-space />
                <q-btn flat round dense icon="close" v-close-popup @click="cancelStream" />
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-card flat bordered class="bg-grey-1">
                    <q-card-section class="q-pa-sm">
                        <div class="row q-gutter-md">
                            <div class="col-auto">
                                <span class="text-grey-7">样本:</span>
                                <span class="text-weight-bold text-primary q-ml-xs">{{ sampleLabel }}</span>
                            </div>
                            <div v-if="summary.bacteria" class="col-auto">
                                <span class="text-grey-7">细菌:</span>
                                <span class="q-ml-xs">{{ summary.bacteria }}</span>
                            </div>
                            <div v-if="summary.fungus" class="col-auto">
                                <span class="text-grey-7">真菌:</span>
                                <span class="q-ml-xs">{{ summary.fungus }}</span>
                            </div>
                            <div v-if="summary.virus" class="col-auto">
                                <span class="text-grey-7">病毒:</span>
                                <span class="q-ml-xs">{{ summary.virus }}</span>
                            </div>
                            <div v-if="summary.resistance" class="col-auto">
                                <q-badge color="orange" :label="`耐药基因: ${summary.resistance}`" />
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </q-card-section>

            <q-card-section class="col overflow-auto" ref="scrollContainer">
                <div v-if="error && !content" class="column items-center q-pa-lg">
                    <q-icon name="error_outline" color="negative" size="48px" />
                    <div class="text-negative q-mt-md">{{ error }}</div>
                    <q-btn color="primary" label="重试" class="q-mt-md" @click="retry" />
                </div>

                <div v-if="thinking" class="q-mb-md">
                    <q-expansion-item
                        v-model="thinkingExpanded"
                        dense
                        header-class="thinking-header"
                        expand-icon-class="text-grey-6"
                    >
                        <template v-slot:header>
                            <q-item-section side>
                                <q-icon
                                    :name="streaming ? 'hourglass_top' : 'psychology'"
                                    :class="streaming ? 'rotating' : ''"
                                    color="grey-6"
                                    size="18px"
                                />
                            </q-item-section>
                            <q-item-section>
                                <span class="text-caption text-grey-6">
                                    {{ streaming && !content ? '正在思考...' : '思考过程' }}
                                </span>
                            </q-item-section>
                        </template>
                        <div ref="thinkingRef" class="thinking-content q-pa-sm" v-html="formattedThinking"></div>
                    </q-expansion-item>
                </div>

                <div v-if="content || (streaming && !thinking)" class="ai-result">
                    <div class="text-caption text-grey-6 q-mb-sm">
                        <q-icon name="info" size="xs" class="q-mr-xs" />
                        以下解读由 AI 生成，仅供参考，临床决策需由专业医生做出
                    </div>
                    <div class="ai-result-content" v-html="formattedContent"></div>
                    <span v-if="streaming" class="cursor-blink">▎</span>
                </div>

                <div v-if="streaming && !thinking && !content" class="column items-center q-pa-lg">
                    <q-spinner-dots color="primary" size="36px" />
                    <div class="text-grey-7 q-mt-sm">正在连接 AI 服务...</div>
                </div>
            </q-card-section>

            <q-card-actions class="bg-white q-pa-md dialog-actions" style="border-top: 1px solid #e0e0e0">
                <div class="dialog-actions__left">
                    <q-btn
                        v-if="content && !streaming"
                        flat
                        label="导出Word"
                        color="primary"
                        icon="description"
                        @click="downloadWord"
                    />
                    <q-btn
                        v-if="content && !streaming"
                        flat
                        label="导出PDF"
                        color="primary"
                        icon="picture_as_pdf"
                        :loading="exportingPdf"
                        @click="downloadPdf"
                    />
                </div>
                <div class="dialog-actions__right">
                    <q-btn flat label="关闭" color="grey" v-close-popup @click="cancelStream" />
                    <q-btn v-if="streaming" flat label="停止" color="warning" icon="stop" @click="cancelStream" />
                    <q-btn v-if="content && !streaming" flat label="复制" color="primary" icon="content_copy" @click="copyResult" />
                    <q-btn v-if="content && !streaming" color="primary" label="重新分析" icon="refresh" @click="retry" />
                </div>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import MarkdownIt from 'markdown-it'
import { computed, nextTick, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { analyzePathogenWithAI } from 'src/boot/pathogenAIAnalysis'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    record: { type: Object, default: null },
    fields: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue'])
const $q = useQuasar()

const markdownRenderer = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    typographer: true,
})

const defaultLinkOpen = markdownRenderer.renderer.rules.link_open || ((tokens, idx, options, _env, self) => {
    return self.renderToken(tokens, idx, options)
})

markdownRenderer.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
    return defaultLinkOpen(tokens, idx, options, env, self)
}

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const streaming = ref(false)
const thinking = ref('')
const content = ref('')
const error = ref(null)
const thinkingExpanded = ref(true)
const abortController = ref(null)
const thinkingRef = ref(null)
const scrollContainer = ref(null)
const exportingPdf = ref(false)

const sampleLabel = computed(() => props.record?.displaySampleName || props.record?.dataIdentifier || '-')
const summary = computed(() => ({
    bacteria: props.fields.bacteria || '',
    fungus: props.fields.fungus || '',
    virus: props.fields.virus || '',
    resistance: props.fields.resistance || '',
}))

const formattedThinking = computed(() => markdownToHtml(thinking.value))
const formattedContent = computed(() => markdownToHtml(content.value))
const reportFileBaseName = computed(() => {
    const safeName = String(sampleLabel.value || 'sample')
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
    return `${safeName}_AI_pathogen_interpretation`
})

watch(
    () => props.modelValue,
    (val) => {
        if (val) {
            runAnalysis()
        } else {
            cancelStream()
            resetState()
        }
    }
)

function markdownToHtml(text) {
    return text ? markdownRenderer.render(text) : ''
}

function resetState() {
    thinking.value = ''
    content.value = ''
    error.value = null
    streaming.value = false
    thinkingExpanded.value = true
}

function cancelStream() {
    if (abortController.value) {
        abortController.value.abort()
        abortController.value = null
    }
    streaming.value = false
}

function autoScrollMain() {
    nextTick(() => {
        if (scrollContainer.value) {
            const el = scrollContainer.value.$el || scrollContainer.value
            el.scrollTop = el.scrollHeight
        }
    })
}

function autoScrollThinking() {
    nextTick(() => {
        if (thinkingRef.value) {
            thinkingRef.value.scrollTop = thinkingRef.value.scrollHeight
        }
    })
}

function runAnalysis() {
    resetState()
    streaming.value = true
    abortController.value = analyzePathogenWithAI(props.fields, {
        onThinking(chunk) {
            thinking.value += chunk
            if (content.value) thinkingExpanded.value = false
            autoScrollThinking()
        },
        onContent(chunk) {
            content.value += chunk
            if (thinking.value) thinkingExpanded.value = false
            autoScrollMain()
        },
        onDone() {
            streaming.value = false
            abortController.value = null
        },
        onError(err) {
            streaming.value = false
            error.value = err.message || '分析失败，请稍后重试'
            abortController.value = null
        },
    }, {
        sampleName: sampleLabel.value,
    })
}

function retry() {
    cancelStream()
    runAnalysis()
}

async function copyResult() {
    try {
        await copyText(content.value)
        $q.notify({ message: '已复制到剪贴板', type: 'positive' })
    } catch {
        $q.notify({ message: '复制失败，请手动选择内容复制', type: 'negative' })
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function buildSummaryHtml() {
    const rows = [
        ['样本', sampleLabel.value],
        ['患者姓名', props.fields.patientName],
        ['患者识别号', props.fields.patientIdentifier],
        ['样本识别号', props.fields.sampleIdentifier],
        ['数据识别号', props.fields.dataIdentifier],
        ['细菌', summary.value.bacteria],
        ['真菌', summary.value.fungus],
        ['病毒', summary.value.virus],
        ['耐药基因', summary.value.resistance],
    ].filter(([, value]) => value)

    return rows.map(([label, value]) => `
        <tr>
            <th>${escapeHtml(label)}</th>
            <td>${escapeHtml(value)}</td>
        </tr>
    `).join('')
}

function buildReportStyles(selector = 'body') {
    return `
        ${selector} {
            color: #1f2937;
            font-family: "Microsoft YaHei", Arial, sans-serif;
            line-height: 1.75;
            padding: 28px;
        }
        ${selector} h1 {
            color: #1d4ed8;
            font-size: 22px;
            margin: 0 0 18px;
        }
        ${selector} h2,
        ${selector} h3,
        ${selector} h4 {
            color: #1d4ed8;
            margin: 18px 0 8px;
        }
        ${selector} table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 20px;
        }
        ${selector} th,
        ${selector} td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
        }
        ${selector} th {
            width: 120px;
            background: #f3f4f6;
            color: #374151;
        }
        ${selector} blockquote {
            margin: 10px 0;
            padding: 8px 12px;
            color: #1e3a8a;
            background: #eff6ff;
            border-left: 3px solid #1976d2;
        }
        ${selector} .meta {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 12px;
        }
        ${selector} .disclaimer {
            color: #92400e;
            background: #fffbeb;
            border: 1px solid #fde68a;
            padding: 10px 12px;
            margin-bottom: 16px;
        }
    `
}

function buildReportBodyHtml() {
    const generatedAt = new Date().toLocaleString()
    return `
    <h1>AI 病原检测解读</h1>
    <div class="meta">生成时间：${escapeHtml(generatedAt)}</div>
    <div class="disclaimer">以下解读由 AI 生成，仅供参考，临床决策需由专业医生结合患者情况、指南和药敏试验结果作出。</div>
    <table>
        <tbody>${buildSummaryHtml()}</tbody>
    </table>
    <main>${formattedContent.value}</main>
`
}

function buildReportHtml() {
    return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(reportFileBaseName.value)}</title>
    <style>
        ${buildReportStyles('body')}
        @media print {
            body { padding: 0; }
        }
    </style>
</head>
<body>
    ${buildReportBodyHtml()}
</body>
</html>`
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function downloadWord() {
    const blob = new Blob(['\ufeff', buildReportHtml()], { type: 'application/msword;charset=utf-8' })
    triggerDownload(blob, `${reportFileBaseName.value}.doc`)
}

async function downloadPdf() {
    exportingPdf.value = true
    const report = document.createElement('div')
    report.className = 'pdf-report-renderer'
    report.style.position = 'absolute'
    report.style.left = '-10000px'
    report.style.top = '0'
    report.style.width = '794px'
    report.style.background = '#ffffff'
    report.innerHTML = `<style>${buildReportStyles('.pdf-report-renderer')}</style>${buildReportBodyHtml()}`
    document.body.appendChild(report)

    try {
        await nextTick()
        const canvas = await html2canvas(report, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: report.scrollWidth,
        })
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margin = 10
        const imgWidth = pageWidth - margin * 2
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        const imgData = canvas.toDataURL('image/png')

        let remainingHeight = imgHeight
        let offsetY = margin
        pdf.addImage(imgData, 'PNG', margin, offsetY, imgWidth, imgHeight)
        remainingHeight -= pageHeight - margin * 2

        while (remainingHeight > 0) {
            pdf.addPage()
            offsetY = margin - (imgHeight - remainingHeight)
            pdf.addImage(imgData, 'PNG', margin, offsetY, imgWidth, imgHeight)
            remainingHeight -= pageHeight - margin * 2
        }

        pdf.save(`${reportFileBaseName.value}.pdf`)
    } catch (e) {
        $q.notify({ message: e.message || 'PDF 导出失败，请稍后重试', type: 'negative' })
    } finally {
        document.body.removeChild(report)
        exportingPdf.value = false
    }
}

async function copyText(text) {
    if (!text) return
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
        const ok = document.execCommand('copy')
        if (!ok) throw new Error('copy command failed')
    } finally {
        document.body.removeChild(textarea)
    }
}
</script>

<style scoped>
.pathogen-ai-dialog {
    display: flex;
    flex-direction: column;
    width: 80vw;
    max-width: 80vw;
    height: 90vh;
    max-height: 90vh;
    margin: auto;
    border-radius: 12px;
}

@media (max-width: 768px) {
    .pathogen-ai-dialog {
        width: 96vw;
        max-width: 96vw;
        height: 92vh;
        max-height: 92vh;
    }
}

.dialog-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.dialog-actions__left,
.dialog-actions__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.dialog-actions__right {
    justify-content: flex-end;
}

.thinking-header {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 4px 8px;
}

.thinking-content {
    background: #fafafa;
    border-left: 3px solid #e0e0e0;
    color: #666;
    font-size: 13px;
    line-height: 1.6;
    max-height: 250px;
    overflow-y: auto;
}

.ai-result-content,
.thinking-content {
    line-height: 1.8;
    font-size: 14px;
}

.ai-result-content :deep(p),
.thinking-content :deep(p) {
    margin: 0 0 10px;
}

.ai-result-content :deep(h1),
.ai-result-content :deep(h2),
.ai-result-content :deep(h3),
.ai-result-content :deep(h4),
.ai-result-content :deep(h5),
.ai-result-content :deep(h6),
.thinking-content :deep(h1),
.thinking-content :deep(h2),
.thinking-content :deep(h3),
.thinking-content :deep(h4),
.thinking-content :deep(h5),
.thinking-content :deep(h6) {
    font-weight: bold;
    line-height: 1.35;
    margin: 14px 0 8px;
    color: #1976d2;
}

.ai-result-content :deep(h1),
.thinking-content :deep(h1) {
    font-size: 20px;
}

.ai-result-content :deep(h2),
.thinking-content :deep(h2) {
    font-size: 18px;
}

.ai-result-content :deep(h3),
.thinking-content :deep(h3) {
    font-size: 16px;
}

.ai-result-content :deep(ul),
.ai-result-content :deep(ol),
.thinking-content :deep(ul),
.thinking-content :deep(ol) {
    margin: 8px 0 10px;
    padding-left: 22px;
}

.ai-result-content :deep(blockquote),
.thinking-content :deep(blockquote) {
    margin: 10px 0;
    padding: 8px 12px;
    color: #1e3a8a;
    background: rgba(25, 118, 210, 0.08);
    border-left: 3px solid #1976d2;
    border-radius: 0 8px 8px 0;
}

.cursor-blink {
    color: #1976d2;
    animation: blink 1s infinite;
}

.rotating {
    animation: rotate 1.5s linear infinite;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>

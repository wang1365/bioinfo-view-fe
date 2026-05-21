<template>
    <q-dialog v-model="visible" persistent maximized>
        <q-card class="mutation-ai-dialog">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">
                    <q-icon name="auto_awesome" color="primary" class="q-mr-sm" />
                    AI {{ titleLabel }}
                    <q-badge v-if="isBatch" color="primary" class="q-ml-sm">
                        {{ records.length }} 条
                    </q-badge>
                </div>
                <q-space />
                <q-btn flat round dense icon="close" v-close-popup @click="cancelStream" />
            </q-card-section>

            <!-- 概要 -->
            <q-card-section class="q-pt-none">
                <q-card flat bordered class="bg-grey-1">
                    <q-card-section class="q-pa-sm">
                        <!-- 单条模式 -->
                        <template v-if="!isBatch">
                            <div class="row q-gutter-md">
                                <div v-if="summary.gene" class="col-auto">
                                    <span class="text-grey-7">基因:</span>
                                    <span class="text-weight-bold text-primary q-ml-xs">{{ summary.gene }}</span>
                                </div>
                                <div v-if="summary.variant" class="col-auto">
                                    <span class="text-grey-7">变异:</span>
                                    <span class="text-weight-bold q-ml-xs">{{ summary.variant }}</span>
                                </div>
                                <div v-if="summary.position" class="col-auto">
                                    <span class="text-grey-7">位置:</span>
                                    <span class="q-ml-xs">{{ summary.position }}</span>
                                </div>
                                <div v-if="summary.clinvar" class="col-auto">
                                    <q-badge
                                        :color="clinvarColor"
                                        :label="summary.clinvar"
                                        class="q-ml-xs"
                                    />
                                </div>
                                <div v-if="summary.cnvType" class="col-auto">
                                    <q-badge
                                        :color="summary.cnvType === 'DUP' ? 'blue' : 'red'"
                                        :label="summary.cnvType === 'DUP' ? '扩增 DUP' : '缺失 DEL'"
                                        class="q-ml-xs"
                                    />
                                </div>
                            </div>
                        </template>
                        <!-- 批量模式 -->
                        <template v-else>
                            <div class="text-caption text-grey-7 q-mb-xs">
                                已选择 {{ records.length }} 条记录进行批量解读
                            </div>
                            <div class="row q-gutter-xs" style="flex-wrap: wrap;">
                                <q-chip
                                    v-for="(item, idx) in batchSummaries"
                                    :key="idx"
                                    dense
                                    size="sm"
                                    :color="item.color"
                                    text-color="white"
                                >
                                    {{ item.label }}
                                </q-chip>
                            </div>
                        </template>
                    </q-card-section>
                </q-card>
            </q-card-section>

            <!-- AI 分析结果 -->
            <q-card-section class="col overflow-auto" ref="scrollContainer">
                <!-- 错误状态 -->
                <div v-if="error && !content" class="column items-center q-pa-lg">
                    <q-icon name="error_outline" color="negative" size="48px" />
                    <div class="text-negative q-mt-md">{{ error }}</div>
                    <q-btn
                        color="primary"
                        label="重试"
                        class="q-mt-md"
                        @click="retry"
                    />
                </div>

                <!-- 思维过程 -->
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

                <!-- 正文内容（流式展示） -->
                <div v-if="content || (streaming && !thinking)" class="ai-result">
                    <div class="text-caption text-grey-6 q-mb-sm">
                        <q-icon name="info" size="xs" class="q-mr-xs" />
                        以下解读由 AI 生成，仅供参考，临床决策需由专业医生做出
                    </div>
                    <div class="ai-result-content" v-html="formattedContent"></div>
                    <span v-if="streaming" class="cursor-blink">▎</span>
                </div>

                <!-- 仅加载态（无思维也无内容时） -->
                <div v-if="streaming && !thinking && !content" class="column items-center q-pa-lg">
                    <q-spinner-dots color="primary" size="36px" />
                    <div class="text-grey-7 q-mt-sm">正在连接 AI 服务...</div>
                </div>
            </q-card-section>

            <!-- 底部操作 -->
            <q-card-actions align="right" class="bg-white q-pa-md" style="border-top: 1px solid #e0e0e0">
                <q-btn flat label="关闭" color="grey" v-close-popup @click="cancelStream" />
                <q-btn
                    v-if="streaming"
                    flat
                    label="停止"
                    color="warning"
                    icon="stop"
                    @click="cancelStream"
                />
                <q-btn
                    v-if="content && !streaming"
                    flat
                    label="复制"
                    color="primary"
                    icon="content_copy"
                    @click="copyResult"
                />
                <q-btn
                    v-if="content && !streaming"
                    color="primary"
                    label="重新分析"
                    icon="refresh"
                    @click="retry"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import MarkdownIt from 'markdown-it'
import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import {
    extractMutationFields,
    extractWESMutationFields,
    extractFusionFields,
    extractCNVFields,
    extractCNVWESFields,
    analyzeMutationWithAI,
    buildBatchPrompt,
} from 'src/boot/mutationAIAnalysis'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    record: { type: [Object, Array], default: null },
    records: { type: Array, default: null },
    type: { type: String, default: 'somatic' },
    header: { type: Array, default: null },
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

const isBatch = computed(() => props.records && props.records.length > 1)

// 类型标签
const titleLabel = computed(() => {
    const map = {
        somatic: '突变解读',
        germline: '突变解读',
        wes: '突变解读',
        'fusion-single': '融合解读',
        'fusion-somatic': '融合解读',
        cnv: 'CNV解读',
        'cnv-wes': 'CNV解读',
    }
    const base = map[props.type] || '解读'
    return isBatch.value ? `批量${base}` : base
})

// 单条概要信息
const summary = computed(() => {
    if (!props.record) return {}

    if (props.type === 'wes') {
        return {
            gene: props.record['Gene.refGene'] || '',
            variant: props.record.AAChange || props.record.NUChange || '',
            position: props.record.Chr ? `${props.record.Chr}:${props.record.Start}` : '',
            clinvar: props.record.Clinvar || '',
        }
    }

    if (props.type.startsWith('fusion')) {
        const r = props.record
        const h = props.header || []
        let gene = ''
        let variant = ''
        let position = ''
        for (let i = 0; i < h.length; i++) {
            const val = r[i + 1] || ''
            const hLow = (h[i] || '').toLowerCase()
            if (hLow.includes('gene') || hLow.includes('fusion') || hLow.includes('基因')) {
                gene = gene ? `${gene} | ${val}` : val
            }
            if (hLow.includes('chr') || hLow.includes('chromosome') || hLow.includes('染色体')) {
                position = val
            }
        }
        return { gene, variant, position }
    }

    if (props.type === 'cnv') {
        return {
            gene: props.record.Gene || '',
            position: props.record.Chr ? `${props.record.Chr}:${props.record.Start}-${props.record.End}` : '',
            cnvType: props.record.Type || '',
        }
    }
    if (props.type === 'cnv-wes') {
        return {
            gene: props.record.Gene || '',
            position: props.record.Chr ? `${props.record.Chr}:${props.record.Start}-${props.record.End}` : '',
            cnvType: props.record.CNV_Type || '',
        }
    }

    const colMap = props.type === 'somatic'
        ? { gene: 15, variant: 20, chr: 1, start: 2, clinvar: 25 }
        : { gene: 11, variant: 16, chr: 1, start: 2, clinvar: 21 }
    return {
        gene: props.record[`col${colMap.gene}`] || '',
        variant: props.record[`col${colMap.variant}`] || '',
        position: props.record[`col${colMap.chr}`]
            ? `${props.record[`col${colMap.chr}`]}:${props.record[`col${colMap.start}`]}`
            : '',
        clinvar: props.record[`col${colMap.clinvar}`] || '',
    }
})

// 批量模式概要
const batchSummaries = computed(() => {
    if (!isBatch.value) return []
    return props.records.map((record, idx) => {
        let label = `#${idx + 1}`
        let color = 'grey'

        if (props.type === 'wes') {
            label = record['Gene.refGene'] || label
        } else if (props.type.startsWith('fusion')) {
            const h = props.header || []
            for (let i = 0; i < h.length; i++) {
                const hLow = (h[i] || '').toLowerCase()
                if (hLow.includes('gene') || hLow.includes('fusion')) {
                    label = record[i + 1] || label
                    break
                }
            }
        } else if (props.type === 'cnv') {
            label = record.Gene || label
            color = record.Type === 'DUP' ? 'blue' : record.Type === 'DEL' ? 'red' : 'grey'
        } else if (props.type === 'cnv-wes') {
            label = record.Gene || label
            color = record.CNV_Type === 'DUP' ? 'blue' : record.CNV_Type === 'DEL' ? 'red' : 'grey'
        } else {
            const geneCol = props.type === 'somatic' ? 'col15' : 'col11'
            label = record[geneCol] || label
        }

        return { label, color }
    })
})

const clinvarColor = computed(() => {
    const s = (summary.value.clinvar || '').toLowerCase()
    if (s.includes('pathogenic') && !s.includes('likely')) return 'red'
    if (s.includes('likely pathogenic')) return 'orange'
    if (s.includes('benign') && !s.includes('likely')) return 'green'
    if (s.includes('likely benign')) return 'light-green'
    return 'grey'
})

function markdownToHtml(text) {
    return text ? markdownRenderer.render(text) : ''
}

const formattedThinking = computed(() => markdownToHtml(thinking.value))
const formattedContent = computed(() => markdownToHtml(content.value))

// 自动滚动辅助
function autoScrollThinking() {
    nextTick(() => {
        if (thinkingRef.value) {
            thinkingRef.value.scrollTop = thinkingRef.value.scrollHeight
        }
    })
}

function autoScrollMain() {
    nextTick(() => {
        if (scrollContainer.value) {
            const el = scrollContainer.value.$el || scrollContainer.value
            el.scrollTop = el.scrollHeight
        }
    })
}

// 当弹窗打开时自动分析
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

function extractFields(record) {
    const t = props.type
    if (t === 'wes') return extractWESMutationFields(record)
    if (t.startsWith('fusion')) return extractFusionFields(record, props.header)
    if (t === 'cnv') return extractCNVFields(record)
    if (t === 'cnv-wes') return extractCNVWESFields(record)
    return extractMutationFields(record, t, props.header)
}

function runAnalysis() {
    resetState()
    streaming.value = true

    if (isBatch.value) {
        // 批量模式
        const fieldsList = props.records.map(r => extractFields(r))
        const prompt = buildBatchPrompt(fieldsList, props.type)
        const maxTokens = Math.min(2000 + fieldsList.length * 800, 8000)

        abortController.value = analyzeMutationWithAI({}, props.type, {
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
        }, { customPrompt: prompt, maxTokens, recordCount: fieldsList.length })
    } else {
        // 单条模式
        const fields = extractFields(props.record)
        abortController.value = analyzeMutationWithAI(fields, props.type, {
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
        })
    }
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
.mutation-ai-dialog {
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: auto;
    border-radius: 12px;
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

.ai-result-content :deep(p:last-child),
.thinking-content :deep(p:last-child) {
    margin-bottom: 0;
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

.ai-result-content :deep(h4),
.ai-result-content :deep(h5),
.ai-result-content :deep(h6),
.thinking-content :deep(h4),
.thinking-content :deep(h5),
.thinking-content :deep(h6) {
    font-size: 15px;
    color: #333;
}

.ai-result-content :deep(ul),
.ai-result-content :deep(ol),
.thinking-content :deep(ul),
.thinking-content :deep(ol) {
    margin: 8px 0 10px;
    padding-left: 22px;
}

.ai-result-content :deep(li),
.thinking-content :deep(li) {
    margin: 4px 0;
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

.ai-result-content :deep(pre),
.thinking-content :deep(pre) {
    margin: 10px 0;
    padding: 12px 14px;
    overflow-x: auto;
    color: #e2e8f0;
    background: #0f172a;
    border-radius: 8px;
    line-height: 1.6;
}

.ai-result-content :deep(code),
.thinking-content :deep(code) {
    padding: 2px 6px;
    color: #1d4ed8;
    background: rgba(25, 118, 210, 0.1);
    border-radius: 4px;
    font-size: 0.9em;
}

.ai-result-content :deep(pre code),
.thinking-content :deep(pre code) {
    padding: 0;
    color: inherit;
    background: transparent;
}

.ai-result-content :deep(table),
.thinking-content :deep(table) {
    width: 100%;
    margin: 10px 0;
    border-collapse: collapse;
}

.ai-result-content :deep(th),
.ai-result-content :deep(td),
.thinking-content :deep(th),
.thinking-content :deep(td) {
    padding: 8px 10px;
    border: 1px solid #dbeafe;
    text-align: left;
    vertical-align: top;
}

.ai-result-content :deep(th),
.thinking-content :deep(th) {
    background: #eff6ff;
    font-weight: 700;
}

.ai-result-content :deep(a),
.thinking-content :deep(a) {
    color: #1976d2;
    text-decoration: none;
    border-bottom: 1px solid rgba(25, 118, 210, 0.35);
}

.ai-result-content :deep(a:hover),
.thinking-content :deep(a:hover) {
    color: #0d47a1;
    border-bottom-color: rgba(13, 71, 161, 0.75);
}

.ai-result-content :deep(strong),
.thinking-content :deep(strong) {
    color: #1a1a1a;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.cursor-blink {
    color: #1976d2;
    animation: blink 1s infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.rotating {
    animation: rotate 1.5s linear infinite;
}
</style>

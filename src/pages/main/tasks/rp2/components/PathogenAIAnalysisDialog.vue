<template>
    <q-dialog v-model="visible" persistent maximized>
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

            <q-card-actions align="right" class="bg-white q-pa-md" style="border-top: 1px solid #e0e0e0">
                <q-btn flat label="关闭" color="grey" v-close-popup @click="cancelStream" />
                <q-btn v-if="streaming" flat label="停止" color="warning" icon="stop" @click="cancelStream" />
                <q-btn v-if="content && !streaming" flat label="复制" color="primary" icon="content_copy" @click="copyResult" />
                <q-btn v-if="content && !streaming" color="primary" label="重新分析" icon="refresh" @click="retry" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
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

const sampleLabel = computed(() => props.record?.displaySampleName || props.record?.dataIdentifier || '-')
const summary = computed(() => ({
    bacteria: props.fields.bacteria || '',
    fungus: props.fields.fungus || '',
    virus: props.fields.virus || '',
    resistance: props.fields.resistance || '',
}))

const formattedThinking = computed(() => markdownToHtml(thinking.value))
const formattedContent = computed(() => markdownToHtml(content.value))

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
    max-width: 860px;
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

<template>
    <q-dialog v-model="visible" persistent maximized>
        <q-card class="mutation-ai-dialog">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">
                    <q-icon name="auto_awesome" color="primary" class="q-mr-sm" />
                    AI {{ titleLabel }}
                </div>
                <q-space />
                <q-btn flat round dense icon="close" v-close-popup @click="cancelStream" />
            </q-card-section>

            <!-- 概要 -->
            <q-card-section class="q-pt-none">
                <q-card flat bordered class="bg-grey-1">
                    <q-card-section class="q-pa-sm">
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
import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import {
    extractMutationFields,
    extractWESMutationFields,
    extractFusionFields,
    extractCNVFields,
    extractCNVWESFields,
    analyzeMutationWithAI,
} from 'src/boot/mutationAIAnalysis'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    record: { type: [Object, Array], default: null },
    type: { type: String, default: 'somatic' },
    header: { type: Array, default: null },
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()

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
    return map[props.type] || '解读'
})

// 概要信息
const summary = computed(() => {
    if (!props.record) return {}

    // 突变类型
    if (props.type === 'wes') {
        return {
            gene: props.record['Gene.refGene'] || '',
            variant: props.record.AAChange || props.record.NUChange || '',
            position: props.record.Chr ? `${props.record.Chr}:${props.record.Start}` : '',
            clinvar: props.record.Clinvar || '',
        }
    }

    // Fusion 类型 - record 是数组
    if (props.type.startsWith('fusion')) {
        const r = props.record
        const h = props.header || []
        // 尝试从 header 中找基因列
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

    // CNV 类型 - record 是对象
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

    // Somatic / Germline
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

const clinvarColor = computed(() => {
    const s = (summary.value.clinvar || '').toLowerCase()
    if (s.includes('pathogenic') && !s.includes('likely')) return 'red'
    if (s.includes('likely pathogenic')) return 'orange'
    if (s.includes('benign') && !s.includes('likely')) return 'green'
    if (s.includes('likely benign')) return 'light-green'
    return 'grey'
})

// 简单 Markdown → HTML
function markdownToHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        .replace(/^(\d+)\. (.+)$/gm, '<div class="q-ml-md">$1. $2</div>')
        .replace(/^- (.+)$/gm, '<div class="q-ml-md">• $1</div>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>')
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
        if (val && props.record) {
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

function extractFields() {
    const r = props.record
    const t = props.type

    if (t === 'wes') return extractWESMutationFields(r)
    if (t.startsWith('fusion')) return extractFusionFields(r, props.header)
    if (t === 'cnv') return extractCNVFields(r)
    if (t === 'cnv-wes') return extractCNVWESFields(r)
    return extractMutationFields(r, t, props.header)
}

function runAnalysis() {
    resetState()
    streaming.value = true

    const fields = extractFields()

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

function retry() {
    cancelStream()
    runAnalysis()
}

async function copyResult() {
    try {
        await navigator.clipboard.writeText(content.value)
        $q.notify({ message: '已复制到剪贴板', type: 'positive' })
    } catch {
        $q.notify({ message: '复制失败', type: 'negative' })
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

.ai-result-content {
    line-height: 1.8;
    font-size: 14px;
}

.ai-result-content :deep(h2) {
    font-size: 18px;
    font-weight: bold;
    margin: 12px 0 8px;
    color: #1976d2;
}

.ai-result-content :deep(h3) {
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0 6px;
    color: #1976d2;
}

.ai-result-content :deep(h4) {
    font-size: 15px;
    font-weight: bold;
    margin: 8px 0 4px;
    color: #333;
}

.ai-result-content :deep(strong) {
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

<template>
    <div>
        <TextFileTable
            :task-id="taskId"
            :task-root-dir="taskRootDir"
            cn-file="menu/analysis_positive_negative_stats.CN.txt"
            en-file="menu/analysis_positive_negative_stats.EN.txt"
            :sortable="false"
        />
        <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
                <q-card flat bordered class="rp2-chart-card rp2-chart-card--positive">
                    <q-card-section class="text-subtitle2 text-weight-medium q-pb-none">
                        {{ t('Rp2SamplePosNegStatTitle') }}
                    </q-card-section>
                    <q-card-section>
                        <div ref="positiveBarRef" class="rp2-chart rp2-chart--positive"></div>
                    </q-card-section>
                </q-card>
            </div>
            <div class="col-12 col-md-4">
                <q-card flat bordered class="rp2-chart-card rp2-chart-card--positive">
                    <q-card-section class="text-subtitle2 text-weight-medium q-pb-none">
                        {{ t('Rp2SamplePosNegDistTitle') }}
                    </q-card-section>
                    <q-card-section>
                        <div ref="positivePieRef" class="rp2-chart rp2-chart--positive"></div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="js">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'
import { readTaskFile } from 'src/api/task'
import { getRp2LangSuffix, parseTabText } from '../rp2File'
import TextFileTable from '../TextFileTable.vue'

const props = defineProps({
    taskId: { type: [String, Number], required: true },
    taskRootDir: { type: String, default: '' },
    active: { type: Boolean, default: false }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)
const positiveBarRef = ref(null)
const positivePieRef = ref(null)
let positiveBarChart = null
let positivePieChart = null
let renderTimer = null

const normalize = (text) => String(text ?? '').trim().replace(/\s+/g, '').toLowerCase()
const findHeader = (headers, aliases) => {
    const aliasSet = new Set(aliases.map((item) => normalize(item)))
    return headers.find((header) => aliasSet.has(normalize(header))) || ''
}
const parseNumber = (value) => {
    const text = String(value ?? '').replace(/,/g, '').trim()
    const n = Number(text)
    return Number.isFinite(n) ? n : 0
}
const findTotalRow = (rows, firstHeader) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        return null
    }
    const matched = rows.find((row) => {
        const keyValue = String(row?.[firstHeader] ?? '').trim().toLowerCase()
        return ['总计', '合计', 'total', 'sum'].includes(keyValue)
    })
    return matched || rows[rows.length - 1]
}
const ensureChartInstance = (chartRef, instance, setInstance) => {
    const dom = chartRef?.value
    if (!dom) {
        return null
    }
    let current = instance
    if (current && current.getDom && current.getDom() !== dom) {
        current.dispose()
        current = null
        setInstance(null)
    }
    if (!current) {
        current = echarts.init(dom)
        setInstance(current)
    }
    return current
}

const renderCharts = async () => {
    const suffix = getRp2LangSuffix(langCode.value)
    const filePath = `menu/analysis_positive_negative_stats.${suffix}.txt`
    const raw = await readTaskFile(props.taskId, filePath, true, true)
    const text = typeof raw === 'string' ? raw : ''
    const { headers, rows } = parseTabText(text, { hasHeader: true })
    if (!headers.length || !rows.length) {
        return
    }

    const firstHeader = headers[0]
    const positiveHeader =
        findHeader(headers, ['阳性数量', 'positive', 'positivecount', 'positive_number', 'positivecounts']) ||
        headers[1] ||
        ''
    const negativeHeader =
        findHeader(headers, ['阴性数量', 'negative', 'negativecount', 'negative_number', 'negativecounts']) ||
        headers[2] ||
        ''

    const totalRow = findTotalRow(rows, firstHeader)
    const positiveCount = parseNumber(totalRow?.[positiveHeader])
    const negativeCount = parseNumber(totalRow?.[negativeHeader])

    await nextTick()

    positiveBarChart = ensureChartInstance(positiveBarRef, positiveBarChart, (next) => {
        positiveBarChart = next
    })
    if (positiveBarChart) {
        positiveBarChart.setOption({
            animation: false,
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: [t('Rp2PositiveLabel'), t('Rp2NegativeLabel')] },
            yAxis: { type: 'value' },
            series: [
                {
                    type: 'bar',
                    data: [positiveCount, negativeCount],
                    barWidth: 56,
                    itemStyle: { color: (params) => (params.dataIndex === 0 ? '#d9534f' : '#94a3b8') }
                }
            ],
            grid: { top: 20, left: 40, right: 20, bottom: 30 }
        })
        positiveBarChart.resize()
    }

    positivePieChart = ensureChartInstance(positivePieRef, positivePieChart, (next) => {
        positivePieChart = next
    })
    if (positivePieChart) {
        positivePieChart.setOption({
            animation: false,
            tooltip: { trigger: 'item' },
            series: [
                {
                    type: 'pie',
                    radius: '64%',
                    data: [
                        { name: t('Rp2PositiveLabel'), value: positiveCount, itemStyle: { color: '#d9534f' } },
                        { name: t('Rp2NegativeLabel'), value: negativeCount, itemStyle: { color: '#94a3b8' } }
                    ],
                    label: { formatter: '{b}: {d}%' },
                    itemStyle: { borderColor: '#fff', borderWidth: 1 }
                }
            ]
        })
        positivePieChart.resize()
    }
}

const scheduleRender = () => {
    if (renderTimer) {
        clearTimeout(renderTimer)
        renderTimer = null
    }
    renderTimer = setTimeout(async () => {
        try {
            await renderCharts()
        } catch (error) {
            // keep silent to avoid blocking the page when chart data is missing
        } finally {
            renderTimer = null
        }
    }, 80)
}

watch(
    () => [props.taskId, langCode.value, props.active],
    async ([taskId, lang, active]) => {
        if (!taskId || !lang || !active) {
            return
        }
        await nextTick()
        scheduleRender()
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (renderTimer) {
        clearTimeout(renderTimer)
    }
    positiveBarChart?.dispose()
    positivePieChart?.dispose()
})
</script>

<style scoped>
.rp2-chart-card {
    min-height: 450px;
}

.rp2-chart-card--positive {
    min-height: 372px;
}

.rp2-chart {
    width: 100%;
    height: 350px;
}

.rp2-chart--positive {
    width: 100%;
    height: 233px;
}
</style>

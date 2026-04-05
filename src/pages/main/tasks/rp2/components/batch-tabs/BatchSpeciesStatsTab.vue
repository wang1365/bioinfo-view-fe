<template>
    <div>
        <TextFileTable
            :task-id="taskId"
            cn-file="menu/analysis_pathogen_summary.CN.txt"
            en-file="menu/analysis_pathogen_summary.EN.txt"
            :column-widths="[120, 120, 480]"
            :sortable="false"
        />
        <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-6">
                <q-card flat bordered class="rp2-chart-card">
                    <q-card-section class="text-subtitle2 text-weight-medium q-pb-none">
                        {{ t('Rp2PathogenDetectDistPieTitle') }}
                    </q-card-section>
                    <q-card-section>
                        <div ref="speciesPieRef" class="rp2-chart"></div>
                    </q-card-section>
                </q-card>
            </div>
            <div class="col-12 col-md-6">
                <q-card flat bordered class="rp2-chart-card">
                    <q-card-section class="text-subtitle2 text-weight-medium q-pb-none">
                        {{ t('Rp2PathogenDetectDistBarTitle') }}
                    </q-card-section>
                    <q-card-section>
                        <div ref="speciesBarRef" class="rp2-chart"></div>
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
    active: { type: Boolean, default: false }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)
const speciesBarRef = ref(null)
const speciesPieRef = ref(null)
let speciesBarChart = null
let speciesPieChart = null
let renderTimer = null

const normalize = (text) => String(text ?? '').trim().replace(/\s+/g, '').toLowerCase()
const findHeader = (headers, aliases) => {
    const aliasSet = new Set(aliases.map((item) => normalize(item)))
    return headers.find((header) => aliasSet.has(normalize(header))) || ''
}
const parsePathogenCountText = (text) => {
    const source = String(text ?? '').trim()
    if (!source || source === '-') {
        return []
    }
    const segments = source
        .split(/[\uFF0C,\u3001\uFF1B;\n\r]+/)
        .map((item) => item.trim())
        .filter((item) => item && item !== '-')
    const results = []
    const countPattern = /^(.+?)\s*[\(\uFF08]\s*(\d+)\s*(?:\u6B21|times?)?\s*[\)\uFF09]\s*$/i
    segments.forEach((item) => {
        const match = item.match(countPattern)
        if (!match) {
            return
        }
        const name = String(match[1] ?? '').trim()
        const count = Number(match[2] ?? 0)
        if (!name || !Number.isFinite(count)) {
            return
        }
        results.push({ name, count })
    })
    return results
}
const extractSpeciesDistribution = (headers, rows) => {
    const detailHeader = headers[2] || findHeader(headers, ['具体病原', 'specificpathogen', 'pathogens'])
    if (!detailHeader) {
        return []
    }
    const map = new Map()
    rows.forEach((row) => {
        parsePathogenCountText(row?.[detailHeader]).forEach(({ name, count }) => {
            map.set(name, (map.get(name) || 0) + count)
        })
    })
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
}
const lerp = (a, b, t) => a + (b - a) * t
const redByCount = (count, min, max) => {
    if (!Number.isFinite(count) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
        return '#d9534f'
    }
    const ratio = Math.min(1, Math.max(0, (count - min) / (max - min)))
    const light = { r: 248, g: 196, b: 196 }
    const dark = { r: 168, g: 28, b: 28 }
    return `rgb(${Math.round(lerp(light.r, dark.r, ratio))}, ${Math.round(lerp(light.g, dark.g, ratio))}, ${Math.round(lerp(light.b, dark.b, ratio))})`
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
const getDynamicBarWidth = (chartRef, count, { min = 8, max = 28, ratio = 0.55 } = {}) => {
    const total = Number(count) || 0
    if (total <= 0) {
        return min
    }
    const chartWidth = chartRef?.value?.clientWidth || 0
    if (!chartWidth) {
        return Math.max(min, Math.min(max, 16))
    }
    const estimatedGridWidth = Math.max(chartWidth - 90, 120)
    const width = Math.floor((estimatedGridWidth / total) * ratio)
    return Math.max(min, Math.min(max, width))
}
const getNiceAxisInterval = (maxValue) => {
    const safeMax = Math.max(0, Number(maxValue) || 0)
    if (safeMax <= 10) {
        return 1
    }
    const roughStep = safeMax / 6
    const magnitude = 10 ** Math.floor(Math.log10(roughStep))
    const normalized = roughStep / magnitude
    if (normalized <= 1) {
        return magnitude
    }
    if (normalized <= 2) {
        return 2 * magnitude
    }
    if (normalized <= 5) {
        return 5 * magnitude
    }
    return 10 * magnitude
}
const getRoundedAxisMax = (maxValue, interval) => {
    const safeMax = Math.max(0, Number(maxValue) || 0)
    const safeInterval = Math.max(1, Number(interval) || 1)
    return Math.max(safeInterval, Math.ceil(safeMax / safeInterval) * safeInterval)
}
const getXAxisLabelInterval = (count) => {
    const total = Math.max(0, Number(count) || 0)
    if (total <= 12) {
        return 0
    }
    if (total <= 24) {
        return 1
    }
    if (total <= 36) {
        return 2
    }
    return Math.max(3, Math.ceil(total / 12) - 1)
}

const renderCharts = async () => {
    const suffix = getRp2LangSuffix(langCode.value)
    const filePath = `menu/analysis_pathogen_summary.${suffix}.txt`
    const raw = await readTaskFile(props.taskId, filePath, true, true)
    const text = typeof raw === 'string' ? raw : ''
    const { headers, rows } = parseTabText(text, { hasHeader: true })
    if (!headers.length || !rows.length) {
        return
    }

    const distribution = extractSpeciesDistribution(headers, rows)
    const labels = distribution.map((item) => item.name)
    const values = distribution.map((item) => item.value)
    const minValue = values.length ? Math.min(...values) : 0
    const maxValue = values.length ? Math.max(...values) : 0
    const yAxisInterval = getNiceAxisInterval(maxValue)
    const yAxisMax = getRoundedAxisMax(maxValue, yAxisInterval)
    const xAxisLabelInterval = getXAxisLabelInterval(labels.length)

    await nextTick()

    speciesBarChart = ensureChartInstance(speciesBarRef, speciesBarChart, (next) => {
        speciesBarChart = next
    })
    if (speciesBarChart) {
        speciesBarChart.setOption({
            animation: false,
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: labels,
                axisLabel: {
                    interval: xAxisLabelInterval,
                    rotate: labels.length > 6 ? 30 : 0
                }
            },
            yAxis: {
                type: 'value',
                name: t('Rp2DetectCount'),
                min: 0,
                interval: yAxisInterval,
                minInterval: yAxisInterval,
                splitNumber: Math.max(3, Math.ceil(yAxisMax / yAxisInterval)),
                max: Math.max(3, yAxisMax),
                axisLabel: {
                    formatter: (value) => {
                        if (yAxisInterval <= 1) {
                            return value
                        }
                        return value % yAxisInterval === 0 ? value : ''
                    }
                }
            },
            series: [
                {
                    type: 'bar',
                    barWidth: getDynamicBarWidth(speciesBarRef, labels.length, { min: 6, max: 24, ratio: 0.52 }),
                    barMaxWidth: 24,
                    data: values,
                    itemStyle: { color: (params) => redByCount(Number(params.value ?? 0), minValue, maxValue) },
                    label: { show: true, position: 'top' }
                }
            ],
            grid: { top: 30, left: 50, right: 20, bottom: labels.length > 6 ? 80 : 40 }
        })
        speciesBarChart.resize()
    }

    speciesPieChart = ensureChartInstance(speciesPieRef, speciesPieChart, (next) => {
        speciesPieChart = next
    })
    if (speciesPieChart) {
        speciesPieChart.setOption({
            animation: false,
            tooltip: { trigger: 'item' },
            series: [
                {
                    type: 'pie',
                    radius: '62%',
                    data: distribution,
                    label: { formatter: '{b}: {d}%' },
                    itemStyle: { borderColor: '#fff', borderWidth: 1 }
                }
            ]
        })
        speciesPieChart.resize()
    }
}

const scheduleRender = () => {
    if (renderTimer) {
        clearTimeout(renderTimer)
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
    speciesBarChart?.dispose()
    speciesPieChart?.dispose()
})
</script>

<style scoped>
.rp2-chart-card {
    min-height: 450px;
}

.rp2-chart {
    width: 100%;
    height: 350px;
}
</style>

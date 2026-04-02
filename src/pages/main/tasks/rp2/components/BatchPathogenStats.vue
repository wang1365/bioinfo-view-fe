<template>
    <div class="rp2-batch-pathogen-stats">
        <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary" class="rp2-stats-tabs">
            <q-tab name="positive" :label="t('Rp2PositiveStatsTab')" />
            <q-tab name="species" :label="t('Rp2PathogenSummaryTab')" />
            <q-tab name="pathogenType" :label="t('Rp2PathogenTypeTab')" />
            <q-tab name="ncOverlap" :label="t('Rp2NcOverlapTab')" />
            <q-tab name="similarity" :label="t('Rp2SimilarityTab')" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated class="rp2-batch-pathogen-stats__panels">
            <q-tab-panel name="positive">
                <TextFileTable
                    :task-id="taskId"
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
            </q-tab-panel>

            <q-tab-panel name="species">
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
            </q-tab-panel>

            <q-tab-panel name="pathogenType" class="rp2-pathogen-type-panel">
                <div class="rp2-panel-scroll">
                    <TextFileTable
                        :task-id="taskId"
                        cn-file="menu/analysis_sample_pathogen_count.CN.add.txt"
                        en-file="menu/analysis_sample_pathogen_count.EN.add.txt"
                    />
                    <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12">
                            <q-card flat bordered class="rp2-chart-card">
                                <q-card-section class="text-subtitle2 text-weight-medium q-pb-none">
                                    {{ t('Rp2PathogenTypeDistTitle') }}
                                </q-card-section>
                                <q-card-section class="rp2-pathogen-type-chart-section">
                                    <div class="rp2-pathogen-type-chart-wrap">
                                        <div
                                            ref="pathogenTypeStackRef"
                                            class="rp2-chart rp2-chart--pathogen-type"
                                            :style="pathogenTypeChartStyle"
                                        ></div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </div>
            </q-tab-panel>

            <q-tab-panel name="ncOverlap">
                <TextFileTable
                    :task-id="taskId"
                    :title="t('Rp2NcOverlapTab')"
                    cn-file="menu/analysis_NC_overlap_stats.CN.add.txt"
                    en-file="menu/analysis_NC_overlap_stats.EN.add.txt"
                    :column-widths="[120, 120, 120, 120, 120, 120, 80, 80, 80, 80, 360]"
                />
            </q-tab-panel>

            <q-tab-panel name="similarity" class="rp2-similarity-panel">
                <div class="rp2-panel-scroll">
                    <TextFileTable
                        :task-id="taskId"
                        cn-file="menu/analysis_sample_similarity.CN.add.txt"
                        en-file="menu/analysis_sample_similarity.EN.add.txt"
                        matrix-hover-enabled
                        :fixed-left-column-count="6"
                        :fixed-column-widths="[120, 120, 120, 130, 90, 110]"
                        :default-column-width="110"
                        :matrix-start-after-aliases="['姓名', 'name']"
                        :matrix-row-identifier-aliases="['数据识别号', 'data identifier', 'dataid', 'identifier']"
                    />
                    <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12">
                            <q-card flat bordered class="rp2-chart-card">
                                <q-card-section class="text-subtitle2 text-weight-medium q-pb-none">
                                    {{ t('Rp2SimilarityHeatmapTitle') }}
                                </q-card-section>
                                <q-card-section>
                                    <div
                                        ref="similarityHeatmapRef"
                                        class="rp2-chart rp2-chart--similarity"
                                        :style="similarityHeatmapStyle"
                                    ></div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup lang="js">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'
import { readTaskFile } from 'src/api/task'
import { getRp2LangSuffix, parseTabText } from './rp2File'
import TextFileTable from './TextFileTable.vue'

const props = defineProps({
    taskId: {
        type: [String, Number],
        required: true
    },
    taskRootDir: {
        type: String,
        default: ''
    }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)
const tab = ref('positive')
const positiveBarRef = ref(null)
const positivePieRef = ref(null)
const speciesBarRef = ref(null)
const speciesPieRef = ref(null)
const pathogenTypeStackRef = ref(null)
const similarityHeatmapRef = ref(null)
let positiveBarChart = null
let positivePieChart = null
let speciesBarChart = null
let speciesPieChart = null
let pathogenTypeStackChart = null
let similarityHeatmapChart = null
let positiveRenderTimer = null
let speciesRenderTimer = null
let pathogenTypeRenderTimer = null
let similarityRenderTimer = null
let similarityHoverPosition = null
const pathogenTypeChartWidth = ref(0)
const pathogenTypeChartStyle = computed(() => {
    const width = Number(pathogenTypeChartWidth.value)
    return width > 0 ? { width: `${width}px` } : {}
})
const similarityHeatmapHeight = ref(350)
const similarityHeatmapStyle = computed(() => ({
    height: `${similarityHeatmapHeight.value}px`
}))

const normalize = (text) => String(text ?? '').trim().replace(/\s+/g, '').toLowerCase()

const findHeader = (headers, aliases) => {
    const aliasSet = new Set(aliases.map((item) => normalize(item)))
    return headers.find((header) => aliasSet.has(normalize(header))) || ''
}

const findHeaderIncludes = (headers, keywords) => {
    const normalized = keywords.map((item) => normalize(item))
    return headers.find((header) => {
        const value = normalize(header)
        return normalized.some((keyword) => value.includes(keyword))
    })
}

const parseNumber = (value) => {
    const text = String(value ?? '').replace(/,/g, '').trim()
    const n = Number(text)
    return Number.isFinite(n) ? n : 0
}

const lerp = (a, b, t) => a + (b - a) * t

const redByCount = (count, min, max) => {
    if (!Number.isFinite(count) || !Number.isFinite(min) || !Number.isFinite(max)) {
        return '#d9534f'
    }
    if (max <= min) {
        return '#d9534f'
    }
    const ratio = Math.min(1, Math.max(0, (count - min) / (max - min)))
    const light = { r: 248, g: 196, b: 196 }
    const dark = { r: 168, g: 28, b: 28 }
    const r = Math.round(lerp(light.r, dark.r, ratio))
    const g = Math.round(lerp(light.g, dark.g, ratio))
    const b = Math.round(lerp(light.b, dark.b, ratio))
    return `rgb(${r}, ${g}, ${b})`
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
    const detailHeader = headers[2] || findHeader(headers, ['\u5177\u4F53\u75C5\u539F', 'specificpathogen', 'pathogens'])
    if (!detailHeader) {
        return []
    }
    const map = new Map()
    rows.forEach((row) => {
        const value = row?.[detailHeader]
        const pairs = parsePathogenCountText(value)
        pairs.forEach(({ name, count }) => {
            map.set(name, (map.get(name) || 0) + count)
        })
    })
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
}

const extractPathogenTypeStack = (headers, rows) => {
    const sampleHeader =
        findHeader(headers, ['\u6837\u672C\u8BC6\u522B\u53F7', 'sampleidentifier', 'sampleid']) ||
        findHeaderIncludes(headers, ['\u6837\u672C', 'sample']) ||
        headers[0] ||
        ''
    const bacteriaHeader =
        findHeader(headers, ['\u7EC6\u83CC', 'bacteria']) || findHeaderIncludes(headers, ['\u7EC6\u83CC', 'bacteria'])
    const fungusHeader =
        findHeader(headers, ['\u771F\u83CC', 'fungus', 'fungi']) || findHeaderIncludes(headers, ['\u771F\u83CC', 'fung'])
    const virusHeader =
        findHeader(headers, ['\u75C5\u6BD2', 'virus']) || findHeaderIncludes(headers, ['\u75C5\u6BD2', 'virus'])

    const labels = []
    const bacteria = []
    const fungus = []
    const virus = []

    rows.forEach((row, index) => {
        const sampleName = String(row?.[sampleHeader] ?? '').trim()
        const key = sampleName.toLowerCase()
        if (['\u603B\u8BA1', '\u5408\u8BA1', 'total', 'sum'].includes(key)) {
            return
        }
        labels.push(sampleName || String(index + 1))
        bacteria.push(parseNumber(row?.[bacteriaHeader]))
        fungus.push(parseNumber(row?.[fungusHeader]))
        virus.push(parseNumber(row?.[virusHeader]))
    })

    return { labels, bacteria, fungus, virus }
}


const findTotalRow = (rows, firstHeader) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        return null
    }

    const matched = rows.find((row) => {
        const keyValue = String(row?.[firstHeader] ?? '').trim().toLowerCase()
        return ['\u603B\u8BA1', '\u5408\u8BA1', 'total', 'sum'].includes(keyValue)
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

const getDynamicHeatmapHeight = (count, { min = 350, max = 1100, rowHeight = 24, padding = 90 } = {}) => {
    const total = Number(count) || 0
    if (total <= 0) {
        return min
    }

    const height = total * rowHeight + padding
    return Math.max(min, Math.min(max, height))
}

const getPathogenTypeChartWidth = (count, { min = 480, minStep = 72, maxStep = 100 } = {}) => {
    const total = Number(count) || 0
    if (total <= 0) {
        return min
    }

    const step = total > 24 ? minStep : total > 12 ? 82 : maxStep
    return Math.max(min, total * step)
}

const buildSimilarityAxisData = (labels, activeIndex, activeColor) =>
    labels.map((label, index) => ({
        value: label,
        textStyle:
            index === activeIndex
                ? {
                      color: '#0f172a',
                      fontWeight: 700,
                      backgroundColor: activeColor,
                      padding: [3, 6],
                      borderRadius: 4
                  }
                : {
                      color: '#334155'
                  }
    }))

const buildSimilaritySeriesData = (points, hoveredPosition) =>
    points.map(([xIndex, yIndex, value]) => {
        const isHovered = hoveredPosition && hoveredPosition.x === xIndex && hoveredPosition.y === yIndex
        const isRelated = hoveredPosition && (hoveredPosition.x === xIndex || hoveredPosition.y === yIndex)
        const itemStyle = {
            borderColor: isHovered ? '#4b5d73' : isRelated ? '#9fb3c8' : '#d6dee8',
            borderWidth: isHovered ? 2 : 1
        }

        if (isHovered) {
            itemStyle.shadowBlur = 10
            itemStyle.shadowColor = 'rgba(0, 0, 0, 0.22)'
        }

        return {
            value: [xIndex, yIndex, value],
            itemStyle
        }
    })

const renderPositiveCharts = async () => {
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
        findHeader(headers, ['\u9633\u6027\u6570\u91CF', 'positive', 'positivecount', 'positive_number', 'positivecounts']) ||
        headers[1] ||
        ''
    const negativeHeader =
        findHeader(headers, ['\u9634\u6027\u6570\u91CF', 'negative', 'negativecount', 'negative_number', 'negativecounts']) ||
        headers[2] ||
        ''

    const totalRow = findTotalRow(rows, firstHeader)
    const positiveCount = parseNumber(totalRow?.[positiveHeader])
    const negativeCount = parseNumber(totalRow?.[negativeHeader])
    await nextTick()

    if (positiveBarRef.value) {
        positiveBarChart = ensureChartInstance(positiveBarRef, positiveBarChart, (next) => {
            positiveBarChart = next
        })
        if (!positiveBarChart) {
            return
        }
        positiveBarChart.setOption({
            animation: false,
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: [t('Rp2PositiveLabel'), t('Rp2NegativeLabel')]
            },
            yAxis: { type: 'value' },
            series: [
                {
                    type: 'bar',
                    data: [positiveCount, negativeCount],
                    barWidth: 56,
                    itemStyle: {
                        color: (params) => (params.dataIndex === 0 ? '#d9534f' : '#94a3b8')
                    }
                }
            ],
            grid: {
                top: 20,
                left: 40,
                right: 20,
                bottom: 30
            }
        })
    }

    if (positivePieRef.value) {
        positivePieChart = ensureChartInstance(positivePieRef, positivePieChart, (next) => {
            positivePieChart = next
        })
        if (!positivePieChart) {
            return
        }
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
                    label: {
                        formatter: '{b}: {d}%'
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            ]
        })
    }
}

const renderSpeciesCharts = async () => {
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

    await nextTick()

    if (speciesBarRef.value) {
        speciesBarChart = ensureChartInstance(speciesBarRef, speciesBarChart, (next) => {
            speciesBarChart = next
        })
        if (!speciesBarChart) {
            return
        }
        const dynamicBarWidth = getDynamicBarWidth(speciesBarRef, labels.length, {
            min: 6,
            max: 24,
            ratio: 0.52
        })
        speciesBarChart.setOption({
            animation: false,
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: labels,
                axisLabel: {
                    interval: 0,
                    rotate: labels.length > 6 ? 30 : 0
                }
            },
            yAxis: {
                type: 'value',
                name: t('Rp2DetectCount'),
                min: 0,
                interval: 1,
                max: (axis) => Math.max(3, Math.ceil(Number(axis?.max || 0)))
            },
            series: [
                {
                    type: 'bar',
                    barWidth: dynamicBarWidth,
                    barMaxWidth: 24,
                    data: values,
                    itemStyle: {
                        color: (params) => redByCount(Number(params.value ?? 0), minValue, maxValue)
                    },
                    label: {
                        show: true,
                        position: 'top'
                    }
                }
            ],
            grid: {
                top: 30,
                left: 50,
                right: 20,
                bottom: labels.length > 6 ? 80 : 40
            }
        })
    }

    if (speciesPieRef.value) {
        speciesPieChart = ensureChartInstance(speciesPieRef, speciesPieChart, (next) => {
            speciesPieChart = next
        })
        if (!speciesPieChart) {
            return
        }
        speciesPieChart.setOption({
            animation: false,
            tooltip: { trigger: 'item' },
            series: [
                {
                    type: 'pie',
                    radius: '62%',
                    data: distribution,
                    label: {
                        formatter: '{b}: {d}%'
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            ]
        })
    }
}

const renderPathogenTypeStackChart = async () => {
    const suffix = getRp2LangSuffix(langCode.value)
    const filePath = `menu/analysis_sample_pathogen_count.${suffix}.add.txt`
    const raw = await readTaskFile(props.taskId, filePath, true, true)
    const text = typeof raw === 'string' ? raw : ''
    const { headers, rows } = parseTabText(text, { hasHeader: true })
    if (!headers.length || !rows.length) {
        return
    }

    const { labels, bacteria, fungus, virus } = extractPathogenTypeStack(headers, rows)
    pathogenTypeChartWidth.value = getPathogenTypeChartWidth(labels.length, {
        min: 480,
        minStep: 72,
        maxStep: 100
    })

    await nextTick()
    if (!pathogenTypeStackRef.value) {
        return
    }

    pathogenTypeStackChart = ensureChartInstance(pathogenTypeStackRef, pathogenTypeStackChart, (next) => {
        pathogenTypeStackChart = next
    })
    if (!pathogenTypeStackChart) {
        return
    }

    pathogenTypeStackChart.setOption({
        animation: false,
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: {
            top: 0
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLabel: {
                interval: 0,
                rotate: labels.length > 8 ? 35 : 0
            }
        },
        yAxis: {
            type: 'value',
            name: t('Rp2PathogenCount')
        },
        series: [
            {
                name: t('Rp2Xijun'),
                type: 'bar',
                stack: 'pathogen',
                barWidth: 36,
                barMaxWidth: 36,
                barCategoryGap: '8%',
                data: bacteria,
                itemStyle: { color: '#d9534f' }
            },
            {
                name: t('Rp2Zhenjun'),
                type: 'bar',
                stack: 'pathogen',
                barWidth: 36,
                barMaxWidth: 36,
                barCategoryGap: '8%',
                data: fungus,
                itemStyle: { color: '#f6c343' }
            },
            {
                name: t('Rp2Bingdu'),
                type: 'bar',
                stack: 'pathogen',
                barWidth: 36,
                barMaxWidth: 36,
                barCategoryGap: '8%',
                data: virus,
                itemStyle: { color: '#f39c12' }
            }
        ],
        grid: {
            top: 45,
            left: 50,
            right: 20,
            bottom: labels.length > 8 ? 95 : 45
        }
    })
}

const renderSimilarityHeatmap = async () => {
    const suffix = getRp2LangSuffix(langCode.value)
    const filePath = `menu/analysis_sample_similarity.${suffix}.add.txt`
    const raw = await readTaskFile(props.taskId, filePath, true, true)
    const text = typeof raw === 'string' ? raw : ''
    const { headers, rows } = parseTabText(text, { hasHeader: true })
    if (!headers.length || !rows.length) {
        return
    }

    const nameHeader =
        findHeader(headers, ['\u59D3\u540D', 'name']) || findHeaderIncludes(headers, ['\u59D3\u540D', 'name']) || ''
    const dataIdentifierHeader =
        findHeader(headers, ['\u6570\u636E\u8BC6\u522B\u53F7', 'dataidentifier', 'dataid']) ||
        findHeaderIncludes(headers, ['\u6570\u636E\u8BC6\u522B\u53F7', 'dataidentifier', 'dataid']) ||
        headers[0] ||
        ''

    const nameHeaderIndex = Math.max(headers.indexOf(nameHeader), 0)
    const xLabels = headers
        .slice(nameHeaderIndex + 1)
        .map((header) => String(header ?? '').trim())
        .filter((header) => header && !['\u603B\u8BA1', '\u5408\u8BA1', 'total', 'sum'].includes(header.toLowerCase()))
    const matrixRows = rows.filter((row) => {
        const yValue = String(row?.[dataIdentifierHeader] ?? '').trim().toLowerCase()
        return yValue && !['\u603B\u8BA1', '\u5408\u8BA1', 'total', 'sum'].includes(yValue)
    })
    const yLabels = matrixRows.map(
        (row, index) => String(row?.[dataIdentifierHeader] ?? '').trim() || String(index + 1)
    )
    const points = []

    similarityHeatmapHeight.value = getDynamicHeatmapHeight(yLabels.length, {
        min: 350,
        max: 1100,
        rowHeight: 24,
        padding: 90
    })

    yLabels.forEach((_, yIndex) => {
        xLabels.forEach((header, xIndex) => {
            const value = parseNumber(matrixRows?.[yIndex]?.[header])
            points.push([xIndex, yIndex, value])
        })
    })

    const heatmapGridTop = 30
    const heatmapGridBottom = 90

    await nextTick()
    if (!similarityHeatmapRef.value) {
        return
    }

    similarityHeatmapChart = ensureChartInstance(similarityHeatmapRef, similarityHeatmapChart, (next) => {
        similarityHeatmapChart = next
    })
    if (!similarityHeatmapChart) {
        return
    }

    similarityHeatmapChart.setOption({
        animation: false,
        tooltip: {
            position: 'top',
            formatter: (params) => {
                const [x, y, value] = params.value || []
                return `${yLabels[y]} <-> ${xLabels[x]}: ${Number(value).toFixed(3)}`
            }
        },
        grid: {
            top: heatmapGridTop,
            left: 90,
            right: 90,
            bottom: heatmapGridBottom
        },
        xAxis: {
            type: 'category',
            data: xLabels,
            splitArea: { show: true },
            axisLabel: {
                interval: 0,
                rotate: xLabels.length > 4 ? 55 : 0
            }
        },
        yAxis: {
            type: 'category',
            data: yLabels,
            inverse: true,
            splitArea: { show: true }
        },
        visualMap: {
            show: true,
            min: 0,
            max: 1,
            calculable: false,
            orient: 'vertical',
            right: 18,
            top: heatmapGridTop,
            bottom: heatmapGridBottom,
            itemWidth: 18,
            text: ['1', '0'],
            textGap: 8,
            precision: 0,
            realtime: false,
            formatter: (value) => (Number(value) === 1 ? '1' : Number(value) === 0 ? '0' : ''),
            inRange: {
                color: ['#f4f1df', '#f7bf6d', '#e53935']
            },
            textStyle: {
                color: '#475569',
                fontSize: 12
            }
        },
        series: [
            {
                name: t('Rp2SimilarityScore'),
                type: 'heatmap',
                data: points,
                itemStyle: {
                    borderColor: '#d6dee8',
                    borderWidth: 1
                },
                label: {
                    show: true,
                    formatter: ({ value }) => Number(value?.[2] ?? 0).toFixed(3),
                    fontSize: 11
                },
                emphasis: {
                    itemStyle: {
                        borderColor: '#9fb3c8',
                        borderWidth: 1,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.35)'
                    }
                }
            }
        ]
    })

    const updateSimilarityHoverState = () => {
        similarityHeatmapChart.setOption({
            xAxis: {
                data: buildSimilarityAxisData(xLabels, similarityHoverPosition?.x ?? -1, '#dbeafe')
            },
            yAxis: {
                data: buildSimilarityAxisData(yLabels, similarityHoverPosition?.y ?? -1, '#fde68a')
            },
            series: [
                {
                    data: buildSimilaritySeriesData(points, similarityHoverPosition)
                }
            ]
        })
    }

    similarityHeatmapChart.off('mouseover')
    similarityHeatmapChart.on('mouseover', (params) => {
        const [x, y] = params?.value || []
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            return
        }
        if (similarityHoverPosition?.x === x && similarityHoverPosition?.y === y) {
            return
        }
        similarityHoverPosition = { x, y }
        updateSimilarityHoverState()
    })

    similarityHeatmapChart.off('mouseout')
    similarityHeatmapChart.on('mouseout', () => {
        if (!similarityHoverPosition) {
            return
        }
        similarityHoverPosition = null
        updateSimilarityHoverState()
    })
}

const scheduleRenderPositiveCharts = () => {
    if (positiveRenderTimer) {
        clearTimeout(positiveRenderTimer)
        positiveRenderTimer = null
    }
    positiveRenderTimer = setTimeout(async () => {
        try {
            await renderPositiveCharts()
            positiveBarChart?.resize()
            positivePieChart?.resize()
        } catch (error) {
            // keep silent to avoid blocking the page when chart data is missing
        } finally {
            positiveRenderTimer = null
        }
    }, 80)
}

const scheduleRenderSpeciesCharts = () => {
    if (speciesRenderTimer) {
        clearTimeout(speciesRenderTimer)
        speciesRenderTimer = null
    }
    speciesRenderTimer = setTimeout(async () => {
        try {
            await renderSpeciesCharts()
            speciesBarChart?.resize()
            speciesPieChart?.resize()
        } catch (error) {
            // keep silent to avoid blocking the page when chart data is missing
        } finally {
            speciesRenderTimer = null
        }
    }, 80)
}

const scheduleRenderPathogenTypeStackChart = () => {
    if (pathogenTypeRenderTimer) {
        clearTimeout(pathogenTypeRenderTimer)
        pathogenTypeRenderTimer = null
    }
    pathogenTypeRenderTimer = setTimeout(async () => {
        try {
            await renderPathogenTypeStackChart()
            pathogenTypeStackChart?.resize()
        } catch (error) {
            // keep silent to avoid blocking the page when chart data is missing
        } finally {
            pathogenTypeRenderTimer = null
        }
    }, 80)
}

const scheduleRenderSimilarityHeatmap = () => {
    if (similarityRenderTimer) {
        clearTimeout(similarityRenderTimer)
        similarityRenderTimer = null
    }
    similarityRenderTimer = setTimeout(async () => {
        try {
            await renderSimilarityHeatmap()
            similarityHeatmapChart?.resize()
        } catch (error) {
            // keep silent to avoid blocking the page when chart data is missing
        } finally {
            similarityRenderTimer = null
        }
    }, 80)
}

watch(
    () => [props.taskId, langCode.value, tab.value],
    async ([taskId, lang, currentTab]) => {
        if (!taskId || !lang) {
            return
        }
        await nextTick()
        if (currentTab === 'positive') {
            scheduleRenderPositiveCharts()
        }
        if (currentTab === 'species') {
            scheduleRenderSpeciesCharts()
        }
        if (currentTab === 'pathogenType') {
            scheduleRenderPathogenTypeStackChart()
        }
        if (currentTab === 'similarity') {
            scheduleRenderSimilarityHeatmap()
        }
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (positiveRenderTimer) {
        clearTimeout(positiveRenderTimer)
        positiveRenderTimer = null
    }
    if (positiveBarChart) {
        positiveBarChart.dispose()
        positiveBarChart = null
    }
    if (positivePieChart) {
        positivePieChart.dispose()
        positivePieChart = null
    }
    if (speciesRenderTimer) {
        clearTimeout(speciesRenderTimer)
        speciesRenderTimer = null
    }
    if (speciesBarChart) {
        speciesBarChart.dispose()
        speciesBarChart = null
    }
    if (speciesPieChart) {
        speciesPieChart.dispose()
        speciesPieChart = null
    }
    if (pathogenTypeRenderTimer) {
        clearTimeout(pathogenTypeRenderTimer)
        pathogenTypeRenderTimer = null
    }
    if (pathogenTypeStackChart) {
        pathogenTypeStackChart.dispose()
        pathogenTypeStackChart = null
    }
    if (similarityRenderTimer) {
        clearTimeout(similarityRenderTimer)
        similarityRenderTimer = null
    }
    if (similarityHeatmapChart) {
        similarityHeatmapChart.dispose()
        similarityHeatmapChart = null
    }
})
</script>

<style scoped>
.rp2-batch-pathogen-stats {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.rp2-batch-pathogen-stats__panels {
    min-height: 0;
}

.rp2-batch-pathogen-stats__panels :deep(.q-tab-panel) {
    padding-left: 0;
    padding-right: 0;
}

.rp2-batch-pathogen-stats__panels :deep(.rp2-pathogen-type-panel),
.rp2-batch-pathogen-stats__panels :deep(.rp2-similarity-panel) {
    padding-bottom: 0;
}

.rp2-panel-scroll {
    height: calc(100vh - 290px);
    min-height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 12px;
}

.rp2-chart-card {
    min-height: 450px;
}

.rp2-chart {
    width: 100%;
    height: 350px;
}

.rp2-chart--similarity {
    min-height: 350px;
}

.rp2-chart-card--positive {
    min-height: 372px;
}

.rp2-chart--positive {
    width: 100%;
    height: 233px;
}

.rp2-pathogen-type-chart-section {
    overflow-x: auto;
}

.rp2-pathogen-type-chart-wrap {
    width: 100%;
}

.rp2-chart--pathogen-type {
    height: 350px;
}

:deep(.rp2-stats-tabs) {
    border-bottom: 1px solid #d8e2ef;
    padding: 0 4px;
}

:deep(.rp2-stats-tabs .q-tab) {
    margin-right: 6px;
    border: 1px solid #d8e2ef;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    background: #f4f7fb;
    min-height: 34px;
    padding: 0 12px;
    color: #4f5d75;
}

:deep(.rp2-stats-tabs .q-tab__content) {
    min-width: 0;
    padding: 0;
}

:deep(.rp2-stats-tabs .q-tab__label) {
    font-size: 13px;
    line-height: 1.1;
}

:deep(.rp2-stats-tabs .q-tab:last-child) {
    margin-right: 0;
}

:deep(.rp2-stats-tabs .q-tab--active) {
    background: #fff;
    border-color: #78a9ff;
    color: #1677ff;
    font-weight: 600;
}

:deep(.rp2-stats-tabs .q-tab__indicator) {
    height: 2px;
}
</style>


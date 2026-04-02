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
                <BatchPositiveStatsTab :task-id="taskId" :active="tab === 'positive'" />
            </q-tab-panel>

            <q-tab-panel name="species">
                <BatchSpeciesStatsTab :task-id="taskId" :active="tab === 'species'" />
            </q-tab-panel>

            <q-tab-panel name="pathogenType">
                <BatchPathogenTypeStatsTab :task-id="taskId" :active="tab === 'pathogenType'" />
            </q-tab-panel>

            <q-tab-panel name="ncOverlap">
                <BatchNcOverlapStatsTab :task-id="taskId" />
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
import BatchPositiveStatsTab from './batch-tabs/BatchPositiveStatsTab.vue'
import BatchSpeciesStatsTab from './batch-tabs/BatchSpeciesStatsTab.vue'
import BatchPathogenTypeStatsTab from './batch-tabs/BatchPathogenTypeStatsTab.vue'
import BatchNcOverlapStatsTab from './batch-tabs/BatchNcOverlapStatsTab.vue'

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
const similarityHeatmapRef = ref(null)
let similarityHeatmapChart = null
let similarityRenderTimer = null
let similarityHoverPosition = null
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

const getDynamicHeatmapHeight = (count, { min = 350, max = 1100, rowHeight = 24, padding = 90 } = {}) => {
    const total = Number(count) || 0
    if (total <= 0) {
        return min
    }

    const height = total * rowHeight + padding
    return Math.max(min, Math.min(max, height))
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
        findHeader(headers, ['姓名', 'name']) || findHeaderIncludes(headers, ['姓名', 'name']) || ''
    const dataIdentifierHeader =
        findHeader(headers, ['数据识别号', 'dataidentifier', 'dataid']) ||
        findHeaderIncludes(headers, ['数据识别号', 'dataidentifier', 'dataid']) ||
        headers[0] ||
        ''

    const nameHeaderIndex = Math.max(headers.indexOf(nameHeader), 0)
    const xLabels = headers
        .slice(nameHeaderIndex + 1)
        .map((header) => String(header ?? '').trim())
        .filter((header) => header && !['总计', '合计', 'total', 'sum'].includes(header.toLowerCase()))
    const matrixRows = rows.filter((row) => {
        const yValue = String(row?.[dataIdentifierHeader] ?? '').trim().toLowerCase()
        return yValue && !['总计', '合计', 'total', 'sum'].includes(yValue)
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
        if (currentTab === 'similarity') {
            scheduleRenderSimilarityHeatmap()
        }
    },
    { immediate: true }
)

onBeforeUnmount(() => {
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

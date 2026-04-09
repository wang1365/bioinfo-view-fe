<template>
    <div class="rp2-panel-scroll">
        <TextFileTable
            :task-id="taskId"
            :task-root-dir="taskRootDir"
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
</template>

<script setup lang="js">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
const pathogenTypeStackRef = ref(null)
const pathogenTypeChartWidth = ref(0)
const pathogenTypeChartStyle = computed(() => {
    const width = Number(pathogenTypeChartWidth.value)
    return width > 0 ? { width: `${width}px` } : {}
})
let pathogenTypeStackChart = null
let renderTimer = null

const normalize = (text) => String(text ?? '').trim().replace(/\s+/g, '').toLowerCase()
const findHeader = (headers, aliases) => {
    const aliasSet = new Set(aliases.map((item) => normalize(item)))
    return headers.find((header) => aliasSet.has(normalize(header))) || ''
}
const findHeaderIncludes = (headers, keywords) => {
    const normalized = keywords.map((item) => normalize(item))
    return headers.find((header) => normalized.some((keyword) => normalize(header).includes(keyword)))
}
const parseNumber = (value) => {
    const text = String(value ?? '').replace(/,/g, '').trim()
    const n = Number(text)
    return Number.isFinite(n) ? n : 0
}
const extractPathogenTypeStack = (headers, rows) => {
    const sampleHeader =
        findHeader(headers, ['样本识别号', 'sampleidentifier', 'sampleid']) ||
        findHeaderIncludes(headers, ['样本', 'sample']) ||
        headers[0] ||
        ''
    const bacteriaHeader =
        findHeader(headers, ['细菌', 'bacteria']) || findHeaderIncludes(headers, ['细菌', 'bacteria'])
    const fungusHeader =
        findHeader(headers, ['真菌', 'fungus', 'fungi']) || findHeaderIncludes(headers, ['真菌', 'fung'])
    const virusHeader = findHeader(headers, ['病毒', 'virus']) || findHeaderIncludes(headers, ['病毒', 'virus'])

    const labels = []
    const bacteria = []
    const fungus = []
    const virus = []
    rows.forEach((row, index) => {
        const sampleName = String(row?.[sampleHeader] ?? '').trim()
        const key = sampleName.toLowerCase()
        if (['总计', '合计', 'total', 'sum'].includes(key)) {
            return
        }
        labels.push(sampleName || String(index + 1))
        bacteria.push(parseNumber(row?.[bacteriaHeader]))
        fungus.push(parseNumber(row?.[fungusHeader]))
        virus.push(parseNumber(row?.[virusHeader]))
    })

    return { labels, bacteria, fungus, virus }
}
const getPathogenTypeChartWidth = (count, { min = 480, minStep = 72, maxStep = 100 } = {}) => {
    const total = Number(count) || 0
    if (total <= 0) {
        return min
    }
    const step = total > 24 ? minStep : total > 12 ? 82 : maxStep
    return Math.max(min, total * step)
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

const renderChart = async () => {
    const suffix = getRp2LangSuffix(langCode.value)
    const filePath = `menu/analysis_sample_pathogen_count.${suffix}.add.txt`
    const raw = await readTaskFile(props.taskId, filePath, true, true)
    const text = typeof raw === 'string' ? raw : ''
    const { headers, rows } = parseTabText(text, { hasHeader: true })
    if (!headers.length || !rows.length) {
        return
    }

    const { labels, bacteria, fungus, virus } = extractPathogenTypeStack(headers, rows)
    pathogenTypeChartWidth.value = getPathogenTypeChartWidth(labels.length, { min: 480, minStep: 72, maxStep: 100 })

    await nextTick()

    pathogenTypeStackChart = ensureChartInstance(pathogenTypeStackRef, pathogenTypeStackChart, (next) => {
        pathogenTypeStackChart = next
    })
    if (!pathogenTypeStackChart) {
        return
    }

    pathogenTypeStackChart.setOption({
        animation: false,
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { top: 0 },
        xAxis: { type: 'category', data: labels, axisLabel: { interval: 0, rotate: labels.length > 8 ? 35 : 0 } },
        yAxis: { type: 'value', name: t('Rp2PathogenCount') },
        series: [
            { name: t('Rp2Xijun'), type: 'bar', stack: 'pathogen', barWidth: 36, barMaxWidth: 36, barCategoryGap: '8%', data: bacteria, itemStyle: { color: '#d9534f' } },
            { name: t('Rp2Zhenjun'), type: 'bar', stack: 'pathogen', barWidth: 36, barMaxWidth: 36, barCategoryGap: '8%', data: fungus, itemStyle: { color: '#f6c343' } },
            { name: t('Rp2Bingdu'), type: 'bar', stack: 'pathogen', barWidth: 36, barMaxWidth: 36, barCategoryGap: '8%', data: virus, itemStyle: { color: '#f39c12' } }
        ],
        grid: { top: 45, left: 50, right: 20, bottom: labels.length > 8 ? 95 : 45 }
    })
    pathogenTypeStackChart.resize()
}

const scheduleRender = () => {
    if (renderTimer) {
        clearTimeout(renderTimer)
    }
    renderTimer = setTimeout(async () => {
        try {
            await renderChart()
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
    pathogenTypeStackChart?.dispose()
})
</script>

<style scoped>
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

.rp2-pathogen-type-chart-section {
    overflow-x: auto;
}

.rp2-pathogen-type-chart-wrap {
    width: 100%;
}

.rp2-chart--pathogen-type {
    height: 350px;
}
</style>

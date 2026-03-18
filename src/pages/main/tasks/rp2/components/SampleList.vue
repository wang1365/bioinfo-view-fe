<template>
    <div class="sample-list">
        <div class="q-mb-md">
            <q-input
                class="search-input"
                v-model="searchKeyword"
                dense
                outlined
                clearable
                :label="t('Search')"
                :placeholder="t('Rp2SampleSearchPlaceholder')"
            />
        </div>

        <a-table
            :data-source="filteredRows"
            :columns="columns"
            :pagination="paginationConfig"
            :loading="loading"
            row-key="sampleName"
            bordered
            size="small"
        >
            <template #bodyCell="{ record, column }">
                <template v-if="column.dataIndex === 'sampleName'">
                    <span
                        :class="record.isNC ? 'text-red text-weight-medium' : ''"
                        >{{ record.displaySampleName }}</span
                    >
                </template>

                <template v-if="column.dataIndex === 'operation'">
                    <div class="operation-buttons">
                        <q-btn
                            flat
                            size="sm"
                            color="primary"
                            style="font-size: 12px;"
                            :label="t('Rp2ViewResult')"
                            @click="viewResult(record)"
                        />
                        <q-btn
                            flat
                            size="sm"
                            color="secondary"
                            style="font-size: 12px;"
                            :label="t('Rp2ConfigReport')"
                            @click="showPending"
                        />
                        <q-btn
                            flat
                            size="sm"
                            color="positive"
                            style="font-size: 12px;"
                            :label="t('Rp2DownloadReport')"
                            @click="showPending"
                        />
                    </div>
                </template>
            </template>
        </a-table>

        <div class="q-mt-md chart-wrapper">
            <div ref="summaryChartRef" class="summary-chart"></div>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { readTaskFile } from 'src/api/task'
import { infoMessage } from 'src/utils/notify'
import { getRp2LangSuffix, isDetected, parseTabText } from './rp2File'

const props = defineProps({
    taskId: {
        type: [String, Number],
        required: true
    }
})

const router = useRouter()
const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const rows = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const summaryChartRef = ref(null)
let summaryChart = null

const columns = computed(() => [
    {
        title: t('Rp2SampleName'),
        dataIndex: 'sampleName',
        key: 'sampleName',
        width: 160,
        sorter: (a, b) => a.sampleName.localeCompare(b.sampleName)
    },
    {
        title: t('Rp2Xijun'),
        dataIndex: 'bacteria',
        key: 'bacteria',
        sorter: (a, b) => String(a.bacteria || '').localeCompare(String(b.bacteria || '')),
        customCell: () => ({
            style: {
                whiteSpace: 'normal',
                wordBreak: 'break-all'
            }
        })
    },
    {
        title: t('Rp2Zhenjun'),
        dataIndex: 'fungus',
        key: 'fungus',
        sorter: (a, b) => String(a.fungus || '').localeCompare(String(b.fungus || '')),
        customCell: () => ({
            style: {
                whiteSpace: 'normal',
                wordBreak: 'break-all'
            }
        })
    },
    {
        title: t('Rp2Bingdu'),
        dataIndex: 'virus',
        key: 'virus',
        sorter: (a, b) => String(a.virus || '').localeCompare(String(b.virus || '')),
        customCell: () => ({
            style: {
                whiteSpace: 'normal',
                wordBreak: 'break-all'
            }
        })
    },
    {
        title: t('Rp2Operation'),
        dataIndex: 'operation',
        key: 'operation',
        width: 360,
        align: 'center'
    }
])

const paginationConfig = computed(() => ({
    pageSize: 10,
    showLessItems: false,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
    showTotal: (total) => t('PaginationTotal', { total })
}))

const filteredRows = computed(() => {
    if (!searchKeyword.value) {
        return rows.value
    }

    const keyword = searchKeyword.value.toLowerCase()
    return rows.value.filter((row) => {
        return [row.displaySampleName, row.bacteria, row.fungus, row.virus]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(keyword))
    })
})

const summaryCounts = computed(() => {
    let bacteria = 0
    let fungus = 0
    let virus = 0

    filteredRows.value.forEach((row) => {
        if (isDetected(row.bacteria)) {
            bacteria += 1
        }
        if (isDetected(row.fungus)) {
            fungus += 1
        }
        if (isDetected(row.virus)) {
            virus += 1
        }
    })

    return { bacteria, fungus, virus }
})

const loadData = async () => {
    loading.value = true

    try {
        const suffix = getRp2LangSuffix(langCode.value)
        const filePath = `menu/merged_results.${suffix}.add.txt`
        const response = await readTaskFile(props.taskId, filePath, true, true)
        const text = typeof response === 'string' ? response : ''

        if (!text) {
            rows.value = []
            renderSummaryChart()
            return
        }

        const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: true })
        rows.value = parsedRows.map((row) => {
            const byIndex = (index) => {
                const key = headers[index]
                return key ? row[key] : ''
            }

            const sampleName = row['样本'] || row['Sample'] || byIndex(0) || ''
            const ncValue = row['是否NC'] || row['IsNC'] || byIndex(1) || '0'
            const bacteria = row['细菌'] || row['Bacteria'] || byIndex(2) || ''
            const fungus = row['真菌'] || row['Fungus'] || byIndex(3) || ''
            const virus = row['病毒'] || row['Virus'] || byIndex(4) || ''

            const isNC = String(ncValue).trim() === '1'

            return {
                sampleName,
                displaySampleName: isNC ? `${sampleName}(NC)` : sampleName,
                isNC,
                bacteria,
                fungus,
                virus
            }
        })

        renderSummaryChart()
    } catch (error) {
        rows.value = []
        renderSummaryChart()
    } finally {
        loading.value = false
    }
}

const viewResult = (record) => {
    const encoded = encodeURIComponent(record.sampleName)
    router.push(`/main/tasks/${props.taskId}/sample/${encoded}/report`)
}

const showPending = () => {
    infoMessage(t('Rp2PendingFeature'))
}

const renderSummaryChart = async () => {
    await nextTick()

    if (!summaryChartRef.value) {
        return
    }

    if (!summaryChart) {
        summaryChart = echarts.init(summaryChartRef.value)
    }

    const data = summaryCounts.value
    summaryChart.setOption({
        animation: false,
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: [t('Rp2Xijun'), t('Rp2Zhenjun'), t('Rp2Bingdu')]
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: t('Rp2PositiveSampleCount'),
                type: 'bar',
                data: [data.bacteria, data.fungus, data.virus],
                barWidth: 36,
                itemStyle: {
                    color: '#1890ff'
                }
            }
        ],
        grid: {
            top: 20,
            right: 16,
            bottom: 30,
            left: 40
        }
    })
}

watch(
    () => [props.taskId, langCode.value],
    loadData,
    { immediate: true }
)

watch(filteredRows, () => {
    renderSummaryChart()
})

onBeforeUnmount(() => {
    if (summaryChart) {
        summaryChart.dispose()
        summaryChart = null
    }
})
</script>

<style lang="scss" scoped>
.sample-list {
    padding: 8px;
}

.search-input {
    width: 33.3333%;
    min-width: 280px;
}

.operation-buttons {
    display: flex;
    gap: 0;
    justify-content: center;
    flex-wrap: nowrap;
}

.chart-wrapper {
    width: 50%;
    min-width: 320px;
}

.summary-chart {
    width: 100%;
    height: 180px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
}
</style>

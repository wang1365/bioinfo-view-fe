<template>
    <div class="sample-list">
        <div class="list-toolbar q-mb-md">
            <q-input
                class="search-input"
                v-model="searchKeyword"
                dense
                outlined
                clearable
                :label="t('Search')"
                :placeholder="t('Rp2SampleSearchPlaceholder')"
            >
                <template #prepend>
                    <q-icon name="search" />
                </template>
            </q-input>
            <IntroHelpButton :title="t('Rp2SampleList')" :disable-float="true" />
        </div>

        <a-table
            class="rp2-grid-table"
            :data-source="filteredRows"
            :columns="columns"
            :pagination="paginationConfig"
            :loading="loading"
            :row-key="rowKey"
            bordered
            size="small"
        >
            <template #bodyCell="{ record, column }">
                <template v-if="column.dataIndex === 'patientInfo'">
                    <div class="patient-info-cell">
                        <div>
                            {{ record.patientName || '-' }}
                        </div>
                        <div>
                            <a class="identifier-link" @click.prevent="openPatientDetail(record)">
                                {{ record.patientIdentifier || '-' }}
                            </a>
                        </div>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'sampleDataInfo'">
                    <div class="sample-data-cell">
                        <div>
                            <a class="identifier-link" @click.prevent="openSampleDetail(record)">
                                {{ record.sampleIdentifier || '-' }}
                            </a>
                        </div>
                        <div>
                            <a
                                class="identifier-link"
                                :class="record.isNC ? 'text-red text-weight-medium' : ''"
                                @click.prevent="openDataDetail(record)"
                            >
                                {{ record.displaySampleName || '-' }}
                            </a>
                        </div>
                    </div>
                </template>

                <template v-if="column.dataIndex === 'operation'">
                    <div class="operation-buttons">
                        <a class="operation-link" @click.prevent="viewResult(record)">{{ t('Rp2ViewResult') }}</a>
                        <q-btn-dropdown
                            flat
                            dense
                            color="secondary"
                            class="report-dropdown"
                            style="font-size: 12px;"
                            :label="t('Report')"
                            dropdown-icon="arrow_drop_down"
                            auto-close
                        >
                            <q-list dense>
                                <q-item clickable v-close-popup @click="openCustomReportDialog(record)">
                                    <q-item-section>{{ t('Rp2ConfigReport') }}</q-item-section>
                                </q-item>
                                <q-item clickable v-close-popup @click="showPending">
                                    <q-item-section>{{ t('Rp2DownloadReport') }}</q-item-section>
                                </q-item>
                            </q-list>
                        </q-btn-dropdown>
                    </div>
                </template>
            </template>
        </a-table>

        <div class="q-mt-md chart-wrapper">
            <div ref="summaryChartRef" class="summary-chart"></div>
        </div>

        <CustomReportDialog v-model="customReportVisible" :task-id="taskId" :sample-name="customReportSampleName" />

        <q-dialog v-model="showPatientInfo">
            <div class="rp2-patient-dialog-wrap">
                <q-card v-if="!patientInfoId" style="width: 100%">
                    <q-card-section class="text-center q-py-xl">
                        <q-spinner color="primary" size="32px" />
                    </q-card-section>
                </q-card>
                <PatientInfo v-else :key="`rp2-patient-${patientInfoId}`" :id="String(patientInfoId)" />
            </div>
        </q-dialog>
        <q-dialog v-model="showSampleInfo">
            <q-card v-if="!sampleInfoId" style="width: 420px; max-width: 70vw">
                <q-card-section class="text-center q-py-xl">
                    <q-spinner color="primary" size="32px" />
                </q-card-section>
            </q-card>
            <SampleInfo v-else :key="`rp2-sample-${sampleInfoId}`" :id="String(sampleInfoId)" />
        </q-dialog>
        <q-dialog v-model="showDataInfo">
            <q-card v-if="!dataInfoId" style="width: 420px; max-width: 70vw">
                <q-card-section class="text-center q-py-xl">
                    <q-spinner color="primary" size="32px" />
                </q-card-section>
            </q-card>
            <DataInfo v-else :key="`rp2-data-${dataInfoId}`" :id="String(dataInfoId)" />
        </q-dialog>
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
import { api } from 'src/boot/axios'
import { infoMessage } from 'src/utils/notify'
import { getRp2LangSuffix, isDetected, parseTabText } from './rp2File'
import CustomReportDialog from './CustomReportDialog.vue'
import IntroHelpButton from './IntroHelpButton.vue'
import PatientInfo from '../../../patients/PatientInfo.vue'
import SampleInfo from '../../../samples/SampleInfo.vue'
import DataInfo from '../../../data/DataInfo.vue'

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
const tableHeaders = ref([])
const sampleColumnKey = ref('')
const ncColumnKey = ref('')
const bacteriaColumnKey = ref('')
const fungusColumnKey = ref('')
const virusColumnKey = ref('')
const patientIdentifierKey = ref('')
const sampleIdentifierKey = ref('')
const patientIdKey = ref('')
const patientNameKey = ref('')

const loading = ref(false)
const searchKeyword = ref('')
const summaryChartRef = ref(null)
const customReportVisible = ref(false)
const customReportSampleName = ref('')
const showPatientInfo = ref(false)
const showSampleInfo = ref(false)
const showDataInfo = ref(false)
const patientInfoId = ref(0)
const sampleInfoId = ref(0)
const dataInfoId = ref(0)
let summaryChart = null

const normalizeKey = (value) => String(value || '').replace(/\s+/g, '').replace(/[_-]/g, '').toLowerCase()

const findHeaderByAliases = (headers, aliases) => {
    const normalizedAliases = aliases.map((alias) => normalizeKey(alias))
    return headers.find((header) => normalizedAliases.includes(normalizeKey(header))) || ''
}

const isLongTextColumn = (header) => {
    const normalized = normalizeKey(header)
    return [
        '细菌',
        'bacteria',
        '真菌',
        'fungus',
        '病毒',
        'virus',
        '耐药基因',
        'resistancegene',
        'amr'
    ].includes(normalized)
}

const columns = computed(() => {
    const hiddenHeaders = new Set(
        [
            patientIdentifierKey.value,
            patientIdKey.value,
            patientNameKey.value,
            ncColumnKey.value,
            sampleIdentifierKey.value,
            sampleColumnKey.value
        ].filter(Boolean)
    )
    const visibleHeaders = tableHeaders.value.filter((header) => !hiddenHeaders.has(header))

    const dynamicColumns = visibleHeaders.map((header, index) => {
        const col = {
            title: header,
            dataIndex: header,
            key: `${header}-${index}`,
            sorter: (a, b) => String(a?.[header] || '').localeCompare(String(b?.[header] || ''))
        }

        if (header === fungusColumnKey.value) {
            col.width = 180
        }

        if (header === virusColumnKey.value) {
            col.width = 180
        }

        if (header === bacteriaColumnKey.value) {
            col.width = 260
        }

        if (header === ncColumnKey.value) {
            col.width = 50
        }

        if (isLongTextColumn(header)) {
            col.customCell = () => ({
                style: {
                    whiteSpace: 'normal',
                    wordBreak: 'break-all'
                }
            })
        }

        return col
    })

    dynamicColumns.unshift({
        title: t('Rp2SampleAndData'),
        dataIndex: 'sampleDataInfo',
        key: 'sampleDataInfo',
        width: 150
    })

    dynamicColumns.unshift({
        title: t('Rp2PatientInfo'),
        dataIndex: 'patientInfo',
        key: 'patientInfo',
        width: 150
    })

    dynamicColumns.push({
        title: t('Rp2Operation'),
        dataIndex: 'operation',
        key: 'operation',
        width: 140,
        align: 'center'
    })

    return dynamicColumns
})

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
        const values = tableHeaders.value.map((header) => row?.[header])
        if (sampleColumnKey.value) {
            values.push(row.displaySampleName)
        }
        values.push(row.patientInfoSearch)

        return values
            .filter((field) => field !== null && field !== undefined && String(field).length > 0)
            .some((field) => String(field).toLowerCase().includes(keyword))
    })
})

const summaryCounts = computed(() => {
    let bacteria = 0
    let fungus = 0
    let virus = 0

    filteredRows.value.forEach((row) => {
        if (bacteriaColumnKey.value && isDetected(row[bacteriaColumnKey.value])) {
            bacteria += 1
        }
        if (fungusColumnKey.value && isDetected(row[fungusColumnKey.value])) {
            fungus += 1
        }
        if (virusColumnKey.value && isDetected(row[virusColumnKey.value])) {
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
            tableHeaders.value = []
            renderSummaryChart()
            return
        }

        const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: true })
        tableHeaders.value = headers

        sampleColumnKey.value =
            findHeaderByAliases(headers, ['数据识别号', 'Data Identifier', 'Data ID']) ||
            findHeaderByAliases(headers, ['样本', 'Sample']) ||
            headers[0] || ''

        patientIdentifierKey.value = findHeaderByAliases(headers, ['患者识别号', 'Patient Identifier'])
        sampleIdentifierKey.value = findHeaderByAliases(headers, ['样本识别号', 'Sample Identifier'])
        patientIdKey.value = findHeaderByAliases(headers, ['患者ID', 'Patient ID'])
        patientNameKey.value = findHeaderByAliases(headers, ['姓名', 'Name'])
        ncColumnKey.value = findHeaderByAliases(headers, ['是否NC', 'IsNC', 'NC'])
        bacteriaColumnKey.value = findHeaderByAliases(headers, ['细菌', 'Bacteria']) || headers[2] || ''
        fungusColumnKey.value = findHeaderByAliases(headers, ['真菌', 'Fungus']) || headers[3] || ''
        virusColumnKey.value = findHeaderByAliases(headers, ['病毒', 'Virus']) || headers[4] || ''

        rows.value = parsedRows.map((row) => {
            const sampleName = sampleColumnKey.value ? row[sampleColumnKey.value] : row.__rowKey
            const ncValue = ncColumnKey.value ? row[ncColumnKey.value] : '0'
            const isNC = String(ncValue).trim() === '1'
            const patientIdentifier = patientIdentifierKey.value ? row[patientIdentifierKey.value] || '-' : '-'
            const patientId = patientIdKey.value ? row[patientIdKey.value] || '' : ''
            const patientName = patientNameKey.value
                ? row[patientNameKey.value] || '-'
                : patientIdKey.value
                  ? row[patientIdKey.value] || '-'
                  : '-'
            const patientInfoLines = [patientName, patientIdentifier]

            return {
                ...row,
                dataIdentifier: sampleName || row.__rowKey,
                sampleIdentifier: sampleIdentifierKey.value ? row[sampleIdentifierKey.value] || '-' : '-',
                patientIdentifier,
                patientId,
                patientName,
                displaySampleName: isNC ? `${sampleName}(NC)` : sampleName,
                isNC,
                patientInfoLines,
                patientInfoSearch: patientInfoLines.join(' ')
            }
        })

        renderSummaryChart()
    } catch (error) {
        rows.value = []
        tableHeaders.value = []
        renderSummaryChart()
    } finally {
        loading.value = false
    }
}

const rowKey = (record) => record.dataIdentifier || record.__rowKey

const viewResult = (record) => {
    const encoded = encodeURIComponent(record.dataIdentifier || '')
    router.push(`/main/tasks/${props.taskId}/sample/${encoded}/report`)
}

const showPending = () => {
    infoMessage(t('Rp2PendingFeature'))
}

const openCustomReportDialog = (record) => {
    customReportSampleName.value = record.dataIdentifier || ''
    customReportVisible.value = true
}

const toResultList = (response) => {
    if (Array.isArray(response)) {
        return response
    }
    if (Array.isArray(response?.results)) {
        return response.results
    }
    if (Array.isArray(response?.data?.results)) {
        return response.data.results
    }
    return []
}

const toPositiveInt = (value) => {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : 0
}

const fetchIdByIdentifierApi = async (url, identifier) => {
    const target = String(identifier || '').trim()
    if (!target) {
        return 0
    }
    const response = await api.get(url, { params: { identifier: target } })
    const item = response || {}
    return toPositiveInt(item.id)
}

const openPatientDetail = async (record) => {
    try {
        showPatientInfo.value = true
        patientInfoId.value = 0

        const rawId = String(record?.patientId || '').trim()
        const payload = {
            _connector: 'AND',
            _negated: false,
            args: [],
            kwargs: {
                id: rawId
            }
        }
        const response = await api.post('/model_query/patient', payload, {
            params: {
                page: 1,
                size: 1
            }
        })
        const rows = toResultList(response)
        const id = toPositiveInt(rows?.[0]?.id)
        if (!id) {
            showPatientInfo.value = false
            infoMessage(t('NotFound'))
            return
        }
        patientInfoId.value = id
    } catch (error) {
        showPatientInfo.value = false
        infoMessage(t('Failed'))
    }
}

const openSampleDetail = async (record) => {
    try {
        showSampleInfo.value = true
        sampleInfoId.value = 0

        const id = await fetchIdByIdentifierApi('/sample/sampledatas/id_by_identifier', record?.sampleIdentifier)
        if (!id) {
            showSampleInfo.value = false
            infoMessage(t('NotFound'))
            return
        }
        sampleInfoId.value = id
    } catch (error) {
        showSampleInfo.value = false
        infoMessage(t('Failed'))
    }
}

const openDataDetail = async (record) => {
    try {
        showDataInfo.value = true
        dataInfoId.value = 0

        const id = await fetchIdByIdentifierApi('/sample/samples/id_by_identifier', record?.dataIdentifier)
        if (!id) {
            showDataInfo.value = false
            infoMessage(t('NotFound'))
            return
        }
        dataInfoId.value = id
    } catch (error) {
        showDataInfo.value = false
        infoMessage(t('Failed'))
    }
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

.list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
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
    align-items: center;
}

.operation-link {
    color: #1976d2;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
}

.operation-link:hover {
    text-decoration: underline;
}

.report-dropdown {
    margin-left: 2px;
}

.report-dropdown :deep(.q-btn__content) {
    min-width: 0;
    white-space: nowrap;
}

.patient-info-cell {
    line-height: 1.5;
}

.sample-data-cell {
    line-height: 1.45;
}

.identifier-link {
    color: #1976d2;
    text-decoration: none;
    cursor: pointer;
}

.identifier-link:hover {
    text-decoration: underline;
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

.sample-list :deep(.rp2-grid-table .ant-table),
.sample-list :deep(.rp2-grid-table .ant-table-container) {
    border: 1px solid #6f8098 !important;
}

.sample-list :deep(.rp2-grid-table .ant-table-container) {
    border-color: #6f8098 !important;
}

.sample-list :deep(.rp2-grid-table .ant-table-thead > tr > th) {
    border-bottom: 1px solid #c7cfdb !important;
    border-right: 1px solid #cfd7e3 !important;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    line-height: 1.2 !important;
}

.sample-list :deep(.rp2-grid-table .ant-table-tbody > tr > td) {
    border-bottom: 1px solid #d4dbe6 !important;
    border-right: 1px solid #d9e0ea !important;
}

.sample-list :deep(.rp2-grid-table .ant-table-thead > tr > th:first-child),
.sample-list :deep(.rp2-grid-table .ant-table-tbody > tr > td:first-child) {
    border-left: 1px solid #d9e0ea !important;
}

.sample-list :deep(.rp2-grid-table .ant-table-thead > tr > th:last-child),
.sample-list :deep(.rp2-grid-table .ant-table-tbody > tr > td:last-child) {
    border-right: 0 !important;
}

.rp2-patient-dialog-wrap {
    width: 1180px;
    max-width: 94vw;
}

.rp2-patient-dialog-wrap :deep(.q-card) {
    width: 100%;
}
</style>

<template>
    <div ref="containerRef" :class="['pathogen-table-container', { 'selectable-mode': selectable }]">
        <div v-if="errorText" ref="bannerRef">
            <q-banner dense class="bg-orange-1 text-orange-9 q-mb-sm">
                {{ errorText }}
            </q-banner>
        </div>
        <div class="table-region">
            <AppDataTable
                :class="['rp2-grid-table', { 'rp2-grid-table-selectable': selectable }]"
                :columns="columns"
                :data-source="rows"
                :loading="loading"
                :pagination="pagination"
                :row-selection="rowSelection"
                :scroll="tableScroll"
                :row-class-name="rowClassName"
                @change="handleTableChange"
                row-key="__rowKey"
                bordered
                size="middle"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === '__verification'">
                        <div class="verification-actions">
                            <a
                                v-if="record.__readPath"
                                class="verify-link"
                                :href="toIgvPath(record.__readPath)"
                                :download="getFileName(record.__readPath)"
                                target="_blank"
                            >
                                read
                            </a>
                            <span v-else class="verify-link disabled">read</span>
                            <span class="verify-separator">|</span>
                            <a
                                class="verify-link"
                                href="https://blast.ncbi.nlm.nih.gov/Blast.cgi"
                                target="_blank"
                            >
                                Blast
                            </a>
                            <span class="verify-separator">|</span>
                            <a class="verify-link" @click.prevent="showCompareDialog(record)">
                                Compare({{ record.__compareCount || 0 }})
                            </a>
                        </div>
                    </template>
                </template>
            </AppDataTable>
        </div>

        <q-dialog v-model="compareDialogVisible">
            <q-card style="width: 75%; max-width: 980px">
                <q-bar class="bg-primary text-white">{{ compareDialogTitle }}</q-bar>
                <q-card-section>
                    <AppDataTable
                        class="rp2-grid-table"
                        row-key="sample"
                        :columns="compareColumns"
                        :data-source="compareRows"
                        :row-class-name="compareRowClassName"
                        :pagination="comparePagination"
                        @change="handleCompareTableChange"
                        bordered
                        size="small"
                    />
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn color="primary" :label="t('Close')" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { readTaskFile } from 'src/api/task'
import { getRp2LangSuffix, parseTabText } from './rp2File'

const props = defineProps({
    taskId: {
        type: [String, Number],
        required: true
    },
    sampleName: {
        type: String,
        required: true
    },
    sampleIdentifier: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true
    },
    selectable: {
        type: Boolean,
        default: false
    },
    showVerification: {
        type: Boolean,
        default: true
    },
    showReadPath: {
        type: Boolean,
        default: false
    }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const rows = ref([])
const columns = ref([])
const loading = ref(false)
const errorText = ref('')
const selectedRowKeys = ref([])
const compareDialogVisible = ref(false)
const compareDialogTitle = ref('')
const compareRows = ref([])
const containerRef = ref(null)
const bannerRef = ref(null)
const tableScrollY = ref(420)
const paginationState = ref({
    current: 1,
    pageSize: 10
})
const comparePaginationState = ref({
    current: 1,
    pageSize: 10
})
let resizeObserver = null

const categoryDirMap = {
    bacteria: 'Bacteria',
    fungus: 'Fungus',
    virus: 'Virus'
}

const pagination = computed(() => {
    if (props.selectable) {
        return false
    }
    return {
        current: paginationState.value.current,
        pageSize: paginationState.value.pageSize,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
        onChange: handlePageChange,
        onShowSizeChange: handlePageSizeChange,
        showTotal: (total) => t('PaginationTotal', { total })
    }
})

const comparePagination = computed(() => ({
    current: comparePaginationState.value.current,
    pageSize: comparePaginationState.value.pageSize,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
    onChange: handleComparePageChange,
    onShowSizeChange: handleComparePageSizeChange,
    showTotal: (total) => t('PaginationTotal', { total })
}))

const rowSelection = computed(() => {
    if (!props.selectable) {
        return null
    }
    return {
        selectedRowKeys: selectedRowKeys.value,
        onChange: (keys) => {
            selectedRowKeys.value = keys
            emitSelectionChange()
        },
        columnWidth: 32
    }
})

const tableScroll = computed(() => {
    if (!props.selectable) {
        return null
    }
    return null
})

const buildFilePath = (sampleName) => {
    const suffix = getRp2LangSuffix(langCode.value)
    const dir = categoryDirMap[props.category]
    if (props.category === 'virus') {
        return `${sampleName}/final_result/${dir}/${dir}_${suffix}_report.RPM.txt`
    }
    return `${sampleName}/final_result/${dir}/${dir}_${suffix}_pintai.RPM.txt`
}

const filePath = computed(() => buildFilePath(props.sampleName))

const getMergedResultFilePath = () => `menu/merged_results.${getRp2LangSuffix(langCode.value)}.add.txt`

const compareColumns = computed(() => [
    { title: t('Sample'), dataIndex: 'sample', key: 'sample', width: 180 },
    { title: props.category === 'virus' ? t('Virus') : t('Zhong'), dataIndex: 'speciesName', key: 'speciesName' },
    { title: 'RPM', dataIndex: 'rpm', key: 'rpm', width: 120 },
    { title: t('ReadsCount'), dataIndex: 'readsCount', key: 'readsCount', width: 120 }
])

const shouldRemoveColumn = (header) => {
    if (!header) {
        return false
    }

    const normalized = header.toLowerCase()
    const normalizedHeader = normalizeHeader(header)
    return (
        header.includes('去重后序列数') ||
        normalized.includes('uniq') ||
        ['是否报出', '检测结果', 'isreported', 'reported', 'report', 'detectionresult'].includes(normalizedHeader) ||
        (!props.showReadPath && ['read路径', 'readpath', 'read path', 'file', 'readsfile'].includes(normalizedHeader))
    )
}

const findReportedHeader = (headers) => {
    const aliases = ['是否报出', '检测结果', 'isreported', 'reported', 'report', 'detectionresult']
    for (const header of headers) {
        const normalized = normalizeHeader(header)
        if (aliases.some((alias) => normalized === normalizeHeader(alias))) {
            return header
        }
    }
    return ''
}

const findHeaderByAliasList = (headers, aliases) => {
    for (const header of headers) {
        const normalized = normalizeHeader(header)
        for (const alias of aliases) {
            if (normalized === normalizeHeader(alias)) {
                return header
            }
        }
    }
    return ''
}

const getPathogenKeyword = (row) => {
    const speciesKey = findHeaderByAliasList(Object.keys(row || {}), ['中文种名', '种名', 'speciesname', 'species'])
    const genusKey = findHeaderByAliasList(Object.keys(row || {}), ['中文属名', '中文病毒名', '属名', 'genusname', 'virusname'])
    return String((speciesKey && row?.[speciesKey]) || (genusKey && row?.[genusKey]) || '').trim()
}

const getCompareSpeciesName = (row) => {
    const speciesKey = findHeaderByAliasList(Object.keys(row || {}), [
        '中文种名',
        '种名',
        'speciesname',
        'species',
        'virusspeciesname',
        'virusname'
    ])
    return String((speciesKey && row?.[speciesKey]) || '').trim()
}

const normalizeSpeciesName = (value) =>
    String(value || '')
        .trim()
        .replace(/\s+/g, '')
        .toLowerCase()

const updatePagination = (current, pageSize) => {
    paginationState.value = {
        current: Number(current) > 0 ? Number(current) : paginationState.value.current,
        pageSize: Number(pageSize) > 0 ? Number(pageSize) : paginationState.value.pageSize
    }
}

const handlePageChange = (current, pageSize) => {
    updatePagination(current, pageSize)
}

const handlePageSizeChange = (current, pageSize) => {
    updatePagination(current, pageSize)
}

const handleTableChange = (paginationConfig) => {
    if (paginationConfig) {
        updatePagination(paginationConfig.current, paginationConfig.pageSize)
    }
}

const updateComparePagination = (current, pageSize) => {
    comparePaginationState.value = {
        current: Number(current) > 0 ? Number(current) : comparePaginationState.value.current,
        pageSize: Number(pageSize) > 0 ? Number(pageSize) : comparePaginationState.value.pageSize
    }
}

const handleComparePageChange = (current, pageSize) => {
    updateComparePagination(current, pageSize)
}

const handleComparePageSizeChange = (current, pageSize) => {
    updateComparePagination(current, pageSize)
}

const handleCompareTableChange = (paginationConfig) => {
    if (paginationConfig) {
        updateComparePagination(paginationConfig.current, paginationConfig.pageSize)
    }
}

const toIgvPath = (rawPath) => {
    const path = String(rawPath || '').trim()
    if (!path) {
        return '#'
    }
    return path.startsWith('/igv') ? path : `/igv${path}`
}

const getFileName = (rawPath) => {
    const path = String(rawPath || '').trim()
    if (!path) {
        return ''
    }
    const normalized = path.replace(/\\/g, '/')
    return normalized.substring(normalized.lastIndexOf('/') + 1)
}

const extractCompareMatchFromFile = (headers, row, sampleLabel, reported = '') => {
    const speciesKey = findHeaderByAliasList(headers, ['中文种名', '种名', 'speciesname', 'species', 'virusspeciesname', 'virusname'])
    const rpmKey = findHeaderByAliasList(headers, ['rpm'])
    const readsCountKey = findHeaderByAliasList(headers, [
        '种count',
        '种_count',
        '序列数',
        'speciescount',
        'readscount',
        'count'
    ])

    return {
        sample: sampleLabel || '-',
        speciesName: speciesKey ? row?.[speciesKey] || '-' : '-',
        reported: reported || '-',
        rpm: rpmKey ? row?.[rpmKey] || '-' : '-',
        readsCount: readsCountKey ? row?.[readsCountKey] || '-' : '-',
        __reported: String(reported || '')
            .trim()
            .toUpperCase() === 'Y'
    }
}

const loadCurrentTaskOtherSampleNames = async () => {
    const response = await readTaskFile(props.taskId, getMergedResultFilePath(), true, true)
    const text = typeof response === 'string' ? response : ''
    if (!text) {
        return []
    }

    const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: true })
    if (!headers.length || !parsedRows.length) {
        return []
    }

    const sampleHeader =
        findHeaderByAliasList(headers, ['数据识别号', 'dataidentifier', 'dataid', 'sample', '样本']) || headers[0] || ''
    if (!sampleHeader) {
        return []
    }

    const currentSampleName = String(props.sampleName || '').trim()
    const sampleNames = parsedRows
        .map((row) => String(row?.[sampleHeader] || '').trim())
        .filter((sampleName) => sampleName && sampleName !== currentSampleName)

    return Array.from(new Set(sampleNames))
}

const buildCompareResultFromCurrentTask = async () => {
    rows.value.forEach((row) => {
        row.__compareResult = []
        row.__compareCount = 0
    })

    const targetSpeciesMap = new Map()
    rows.value.forEach((row) => {
        const speciesName = getCompareSpeciesName(row)
        if (speciesName) {
            targetSpeciesMap.set(row.__rowKey, speciesName)
        }
    })

    if (!targetSpeciesMap.size) {
        return
    }

    const otherSampleNames = await loadCurrentTaskOtherSampleNames()
    if (!otherSampleNames.length) {
        return
    }

    await Promise.all(
        otherSampleNames.map(async (sampleLabel) => {
            try {
                const response = await readTaskFile(props.taskId, buildFilePath(sampleLabel), true, true)
                const text = typeof response === 'string' ? response : ''
                if (!text) {
                    return
                }

                const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: true })
                if (!headers.length || !parsedRows.length) {
                    return
                }

                const speciesKey = findHeaderByAliasList(headers, [
                    '中文种名',
                    '种名',
                    'speciesname',
                    'species',
                    'virusspeciesname',
                    'virusname'
                ])
                const reportedHeader = findReportedHeader(headers)
                if (!speciesKey) {
                    return
                }

                rows.value.forEach((row) => {
                    const targetSpecies = targetSpeciesMap.get(row.__rowKey)
                    if (!targetSpecies) {
                        return
                    }
                    const match = parsedRows.find(
                        (item) => String(item?.[speciesKey] || '').trim() === targetSpecies
                    )
                    if (!match) {
                        return
                    }
                    const reportedValue = reportedHeader ? String(match?.[reportedHeader] ?? '').trim() : ''
                    row.__compareResult.push(
                        extractCompareMatchFromFile(
                            headers,
                            match,
                            sampleLabel,
                            reportedValue
                        )
                    )
                    row.__compareCount = row.__compareResult.length
                })
            } catch (error) {
                // ignore single related task failures
            }
        })
    )
}

const compareRowClassName = (record) => (record?.__reported ? 'rp2-reported-row' : '')

const displayHeader = (header) => {
    const normalized = normalizeHeader(header)
    const map = {
        '中文属名': '属名',
        '中文病毒名': '属名',
        '占比': '相对丰度',
        'abundance(%)': 'Abundance',
        '属count': '序列数',
        'count': '序列数',
        '中文种名': '种名',
        '属中占比': '占比',
        '种count': '序列数'
    }

    for (const [from, to] of Object.entries(map)) {
        if (normalized === normalizeHeader(from)) {
            return to
        }
    }

    return header
}

const normalizeHeader = (header) => String(header || '').replace(/\s+/g, '').toLowerCase()

const isSequenceHeader = (header) => {
    const normalized = normalizeHeader(header)
    return ['序列数', '属count', '属_count', '种count', '种_count', 'count', 'genuscount', 'speciescount', 'readscount'].includes(
        normalized
    )
}

const isProportionHeader = (header) => {
    const normalized = normalizeHeader(header)
    return ['占比', '属中占比', '相对丰度', 'proportion', 'relativeabundance', 'speciesproportion', 'proportioningenus'].includes(
        normalized
    )
}

const isRelativeAbundanceHeader = (header) => {
    const normalized = normalizeHeader(header)
    return ['相对丰度', 'relativeabundance'].includes(normalized)
}

const isPathogenicityHeader = (header) => {
    const normalized = normalizeHeader(header)
    return ['致病等级', 'pathogeniclevel', 'pathogenicity'].includes(normalized)
}

const getColumnWidth = (header) => {
    if (isRelativeAbundanceHeader(header)) {
        return 50
    }
    if (isPathogenicityHeader(header)) {
        return 90
    }
    if (isSequenceHeader(header)) {
        return 90
    }
    if (isProportionHeader(header)) {
        return 100
    }
    return undefined
}

const findHeaderByAliases = (headers, aliases, used) => {
    for (const header of headers) {
        if (used.has(header)) {
            continue
        }
        const normalized = normalizeHeader(header)
        for (const alias of aliases) {
            if (normalized === normalizeHeader(alias)) {
                used.add(header)
                return header
            }
        }
    }
    return ''
}

const getGroupedHeaders = (headers) => {
    const used = new Set()

    const genusHeaders = [
        findHeaderByAliases(headers, ['中文属名', '中文病毒名', '属名', 'genusname', 'virusname', 'genus'], used),
        findHeaderByAliases(headers, ['占比', '相对丰度', 'proportion', 'relativeabundance'], used),
        findHeaderByAliases(headers, ['属count', '属_count', 'genuscount', 'count', 'readscount'], used)
    ].filter(Boolean)

    const speciesHeaders = [
        findHeaderByAliases(headers, ['中文种名', '种名', 'speciesname', 'species', 'virusspeciesname'], used),
        findHeaderByAliases(headers, ['属中占比', 'speciesproportion', 'proportioningenus'], used),
        findHeaderByAliases(headers, ['种count', '种_count', 'speciescount', 'count', 'readscount'], used),
        findHeaderByAliases(headers, ['rpm'], used),
        findHeaderByAliases(headers, ['致病等级', 'pathogeniclevel', 'pathogenicity'], used)
    ].filter(Boolean)

    const fallbackLength = props.category === 'virus' ? 6 : 8
    if ((genusHeaders.length < 3 || speciesHeaders.length < 3) && headers.length >= fallbackLength) {
        return {
            genusHeaders: headers.slice(0, 3),
            speciesHeaders: props.category === 'virus' ? headers.slice(3, 6) : headers.slice(3, 8)
        }
    }

    return {
        genusHeaders,
        speciesHeaders
    }
}

const buildColumns = (headers) => {
    const leafColumns = headers.map((header, index) => {
        const column = {
            title: displayHeader(header),
            dataIndex: header,
            key: `${header}-${index}`,
            ellipsis: true
        }
        const width = getColumnWidth(header)
        if (width) {
            column.width = width
        }
        return column
    })

    if (!['bacteria', 'fungus', 'virus'].includes(props.category)) {
        if (props.showVerification) {
            leafColumns.push({
                title: t('Verification'),
                dataIndex: '__verification',
                key: '__verification',
                align: 'center',
                width: 180
            })
        }
        return leafColumns
    }

    const { genusHeaders, speciesHeaders } = getGroupedHeaders(headers)
    const leafMap = new Map(leafColumns.map((column) => [column.dataIndex, column]))
    const groupedColumns = []
    const groupedSet = new Set()

    const genusChildren = genusHeaders.map((header) => leafMap.get(header)).filter(Boolean)
    if (genusChildren.length > 0) {
        genusChildren.forEach((column) => groupedSet.add(column.dataIndex))
        groupedColumns.push({
            title: t('Rp2GenusGroupTitle'),
            key: 'rp2-genus-group',
            children: genusChildren
        })
    }

    const speciesChildren = speciesHeaders.map((header) => leafMap.get(header)).filter(Boolean)
    if (speciesChildren.length > 0) {
        speciesChildren.forEach((column) => groupedSet.add(column.dataIndex))
        groupedColumns.push({
            title: t('Rp2SpeciesGroupTitle'),
            key: 'rp2-species-group',
            children: speciesChildren
        })
    }

    const hasGroupedHeader = genusChildren.length > 0 || speciesChildren.length > 0

    headers.forEach((header) => {
        if (!groupedSet.has(header)) {
            const leaf = leafMap.get(header)
            if (leaf) {
                const leafColumn = { ...leaf }
                if (hasGroupedHeader) {
                    leafColumn.onHeaderCell = () => ({
                        rowSpan: 2,
                        style: {
                            borderLeft: '1px solid #cfd7e3'
                        }
                    })
                }
                groupedColumns.push(leafColumn)
            }
        }
    })

    if (props.showVerification) {
        const verificationColumn = {
            title: t('Verification'),
            dataIndex: '__verification',
            key: '__verification',
            align: 'center',
            width: 180
        }
        if (hasGroupedHeader) {
            verificationColumn.onHeaderCell = () => ({
                rowSpan: 2,
                style: {
                    borderLeft: '1px solid #cfd7e3'
                }
            })
        }
        groupedColumns.push(verificationColumn)
    }

    return groupedColumns
}

const updateTableScrollHeight = () => {
    if (!props.selectable || !containerRef.value) {
        return
    }
    const containerHeight = containerRef.value.clientHeight || 0
    const bannerHeight = bannerRef.value?.offsetHeight || 0
    const reserved = bannerHeight + 16
    tableScrollY.value = Math.max(220, containerHeight - reserved)
}

const emit = defineEmits(['selection-change'])

const emitSelectionChange = () => {
    emit('selection-change', {
        category: props.category,
        selectedCount: selectedRowKeys.value.length
    })
}

const loadData = async () => {
    loading.value = true
    errorText.value = ''

    try {
        const response = await readTaskFile(props.taskId, filePath.value, true, true)
        const text = typeof response === 'string' ? response : ''

        if (!text) {
            rows.value = []
            columns.value = []
            selectedRowKeys.value = []
            emitSelectionChange()
            errorText.value = `${t('Rp2DataFileMissing')}: ${filePath.value}`
            return
        }

        const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: true })
        const reportedHeader = findReportedHeader(headers)
        const readPathHeader = findHeaderByAliasList(headers, [
            'read路径',
            'read path',
            'readpath',
            'file',
            'readsfile'
        ])
        const keptHeaders = headers.filter((header) => !shouldRemoveColumn(header))

        rows.value = parsedRows.map((row) => {
            const mapped = {
                __rowKey: row.__rowKey,
                __reported: reportedHeader
                    ? String(row[reportedHeader] ?? '')
                          .trim()
                          .toUpperCase() === 'Y'
                    : false,
                __readPath: readPathHeader ? String(row[readPathHeader] || '').trim() : '',
                __compareResult: [],
                __compareCount: 0
            }

            keptHeaders.forEach((header) => {
                mapped[header] = row[header] ?? ''
            })

            return mapped
        })

        if (reportedHeader) {
            selectedRowKeys.value = rows.value
                .filter((row) => row.__reported)
                .map((row) => row.__rowKey)
        } else {
            selectedRowKeys.value = []
        }
        emitSelectionChange()

        columns.value = buildColumns(keptHeaders)

        if (props.showVerification) {
            await buildCompareResultFromCurrentTask()
        }
    } catch (error) {
        rows.value = []
        columns.value = []
        errorText.value = `${t('Rp2FailedToReadFile')}: ${filePath.value}`
    } finally {
        loading.value = false
        await nextTick()
        updateTableScrollHeight()
    }
}

const showCompareDialog = (record) => {
    const compareResult = Array.isArray(record?.__compareResult) ? record.__compareResult : []
    compareRows.value = compareResult
    comparePaginationState.value.current = 1
    compareDialogTitle.value = `${t('Verification')} - ${getPathogenKeyword(record) || '-'}`
    compareDialogVisible.value = true
}

const rowClassName = (record) => (record?.__reported ? 'rp2-reported-row' : '')

const getSelectionPayload = () => ({
    category: props.category,
    file_path: filePath.value,
    row_numbers: selectedRowKeys.value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0),
})

defineExpose({
    getSelectionPayload
})

onMounted(async () => {
    await nextTick()
    updateTableScrollHeight()
    if (containerRef.value) {
        resizeObserver = new ResizeObserver(() => {
            updateTableScrollHeight()
        })
        resizeObserver.observe(containerRef.value)
    }
})

onBeforeUnmount(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
})

watch(
    () => [props.taskId, props.sampleName, props.category, langCode.value],
    loadData,
    { immediate: true }
)

watch(
    () => [props.selectable, errorText.value],
    async () => {
        await nextTick()
        updateTableScrollHeight()
    }
)
</script>

<style scoped>
.pathogen-table-container {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.table-region {
    flex: 1;
    min-height: 0;
}

.selectable-mode .table-region {
    overflow: auto;
}

.table-region :deep(.ant-spin-nested-loading),
.table-region :deep(.ant-spin-container) {
    height: 100%;
}

.selectable-mode .table-region :deep(.ant-table),
.selectable-mode .table-region :deep(.ant-table-container),
.selectable-mode .table-region :deep(.ant-table-content) {
    overflow: visible !important;
}

:deep(.rp2-reported-row > td) {
    background-color: #fff7e6;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-container) {
    border: 1px solid #6f8098 !important;
    border-color: #6f8098 !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table) {
    border: 1px solid #6f8098 !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr > th) {
    border-bottom: 1px solid #c7cfdb !important;
    border-right: 1px solid #cfd7e3 !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    height: 36px !important;
    min-height: 36px !important;
    line-height: 1.2 !important;
    vertical-align: middle !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr > th .ant-table-column-sorters) {
    align-items: center !important;
    min-height: 22px !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr > th .ant-table-column-title) {
    line-height: 1.2 !important;
}

.pathogen-table-container :deep(.rp2-grid-table-selectable .ant-table-thead > tr) {
    height: 36px !important;
}

.selectable-mode :deep(.rp2-grid-table .ant-table-thead > tr:nth-child(1) > th) {
    position: sticky;
    top: 0;
    z-index: 6;
    background: #fff !important;
}

.selectable-mode :deep(.rp2-grid-table .ant-table-thead > tr:nth-child(2) > th) {
    position: sticky;
    top: 36px;
    z-index: 6;
    background: #fff !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-tbody > tr > td) {
    border-bottom: 1px solid #d4dbe6 !important;
    border-right: 1px solid #d9e0ea !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    line-height: 1.25 !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr > th:first-child),
.pathogen-table-container :deep(.rp2-grid-table .ant-table-tbody > tr > td:first-child) {
    border-left: 1px solid #d9e0ea !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-tbody > tr > td:last-child) {
    border-right: 0 !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-measure-row),
.pathogen-table-container :deep(.rp2-grid-table .ant-table-measure-row > td),
.pathogen-table-container :deep(.rp2-grid-table .ant-table-measure-row > th),
.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr.ant-table-measure-row),
.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr.ant-table-measure-row > th),
.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr.ant-table-measure-row > td) {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    line-height: 0 !important;
    font-size: 0 !important;
    background: transparent !important;
}

.verification-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}

.verify-link {
    color: #1976d2;
    cursor: pointer;
    text-decoration: none;
    font-size: 13px;
}

.verify-link.disabled {
    color: #9e9e9e;
    cursor: not-allowed;
    pointer-events: none;
}

.verify-separator {
    color: #7d7d7d;
    font-size: 13px;
}
</style>

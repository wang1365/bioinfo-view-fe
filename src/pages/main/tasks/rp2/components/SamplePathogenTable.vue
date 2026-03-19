<template>
    <div ref="containerRef" class="pathogen-table-container">
        <div v-if="errorText" ref="bannerRef">
            <q-banner dense class="bg-orange-1 text-orange-9 q-mb-sm">
                {{ errorText }}
            </q-banner>
        </div>
        <div class="table-region">
            <a-table
                class="rp2-grid-table"
                :columns="columns"
                :data-source="rows"
                :loading="loading"
                :pagination="pagination"
                :row-selection="rowSelection"
                :scroll="tableScroll"
                :row-class-name="rowClassName"
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
            </a-table>
        </div>

        <q-dialog v-model="compareDialogVisible">
            <q-card style="width: 75%; max-width: 980px">
                <q-bar class="bg-primary text-white">{{ compareDialogTitle }}</q-bar>
                <q-card-section>
                    <a-table
                        class="rp2-grid-table"
                        row-key="sample"
                        :columns="compareColumns"
                        :data-source="compareRows"
                        :pagination="{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => t('PaginationTotal', { total })
                        }"
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
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
        showTotal: (total) => t('PaginationTotal', { total })
    }
})

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
    return {
        y: tableScrollY.value
    }
})

const filePath = computed(() => {
    const suffix = getRp2LangSuffix(langCode.value)
    const dir = categoryDirMap[props.category]
    if (props.category === 'virus') {
        return `${props.sampleName}/final_result/${dir}/${dir}_${suffix}_report.RPM.txt`
    }
    return `${props.sampleName}/final_result/${dir}/${dir}_${suffix}_pintai.RPM.txt`
})

const compareColumns = computed(() => [
    { title: t('Sample'), dataIndex: 'sample', key: 'sample', width: 180 },
    { title: t('Detail'), dataIndex: 'pathogen', key: 'pathogen' }
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
        ['是否报出', 'isreported', 'reported', 'report'].includes(normalizedHeader) ||
        (!props.showReadPath && ['read路径', 'readpath', 'read path', 'file', 'readsfile'].includes(normalizedHeader))
    )
}

const findReportedHeader = (headers) => {
    const aliases = ['是否报出', 'isreported', 'reported', 'report']
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

const buildCompareResultFromSummary = (summaryRows, summaryHeaders) => {
    const sampleKey =
        findHeaderByAliasList(summaryHeaders, ['数据识别号', 'Data Identifier', 'Data ID']) ||
        findHeaderByAliasList(summaryHeaders, ['样本', 'Sample']) ||
        summaryHeaders[0]
    const targetColumnMap = {
        bacteria: findHeaderByAliasList(summaryHeaders, ['细菌', 'Bacteria']),
        fungus: findHeaderByAliasList(summaryHeaders, ['真菌', 'Fungus']),
        virus: findHeaderByAliasList(summaryHeaders, ['病毒', 'Virus'])
    }
    const targetColumn = targetColumnMap[props.category]
    if (!targetColumn) {
        rows.value.forEach((row) => {
            row.__compareResult = []
            row.__compareCount = 0
        })
        return
    }

    rows.value.forEach((row) => {
        const keyword = getPathogenKeyword(row)
        if (!keyword) {
            row.__compareResult = []
            row.__compareCount = 0
            return
        }

        const keywordLower = keyword.toLowerCase()
        const matches = summaryRows
            .filter((item) => String(item?.[targetColumn] || '').toLowerCase().includes(keywordLower))
            .map((item) => ({
                sample: item?.[sampleKey] || '-',
                pathogen: item?.[targetColumn] || '-'
            }))

        row.__compareResult = matches
        row.__compareCount = matches.length
    })
}

const displayHeader = (header) => {
    const normalized = normalizeHeader(header)
    const map = {
        '中文属名': '属名',
        '中文病毒名': '属名',
        '占比': '相对丰度',
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

    headers.forEach((header) => {
        if (!groupedSet.has(header)) {
            const leaf = leafMap.get(header)
            if (leaf) {
                groupedColumns.push(leaf)
            }
        }
    })

    if (props.showVerification) {
        groupedColumns.push({
            title: t('Verification'),
            dataIndex: '__verification',
            key: '__verification',
            align: 'center',
            width: 180
        })
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
            const suffix = getRp2LangSuffix(langCode.value)
            const summaryPath = `menu/merged_results.${suffix}.add.txt`
            const summaryText = await readTaskFile(props.taskId, summaryPath, true, true)
            const parsedSummary = parseTabText(typeof summaryText === 'string' ? summaryText : '', { hasHeader: true })
            buildCompareResultFromSummary(parsedSummary.rows || [], parsedSummary.headers || [])
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

.table-region :deep(.ant-spin-nested-loading),
.table-region :deep(.ant-spin-container),
.table-region :deep(.ant-table) {
    height: 100%;
}

.pathogen-table-container :deep(.rp2-reported-row > td) {
    background-color: #fff7e6;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-container) {
    border-color: #c7cfdb !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr > th) {
    border-bottom: 1px solid #c7cfdb !important;
    border-right: 1px solid #cfd7e3 !important;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    line-height: 1.2 !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-tbody > tr > td) {
    border-bottom: 1px solid #d4dbe6 !important;
    border-right: 1px solid #d9e0ea !important;
}

.pathogen-table-container :deep(.rp2-grid-table .ant-table-thead > tr > th:last-child),
.pathogen-table-container :deep(.rp2-grid-table .ant-table-tbody > tr > td:last-child) {
    border-right: 0 !important;
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

<template>
    <div ref="tableWrapRef" @mouseleave="clearMatrixHover">
        <div v-if="showToolbar" class="row items-center justify-between q-col-gutter-sm q-mb-sm">
            <div v-if="title" class="col text-subtitle1 text-weight-medium">{{ title }}</div>
            <q-space v-else />
            <div class="col-auto">
                <div class="rp2-table-toolbar">
                    <slot name="actions" />
                    <q-btn
                        v-if="downloadUrl"
                        flat
                        dense
                        no-caps
                        icon="download"
                        class="rp2-table-toolbar-btn"
                        :label="t('Download')"
                        @click="downloadSourceFile"
                    />
                </div>
            </div>
        </div>

        <q-banner v-if="errorText" dense class="bg-orange-1 text-orange-9 q-mb-sm">
            {{ errorText }}
        </q-banner>

        <AppDataTable
            :class="['rp2-grid-table', { 'rp2-matrix-table': matrixHoverEnabled }]"
            :columns="columns"
            :data-source="rows"
            :loading="loading"
            :pagination="pagination"
            :scroll="tableScroll"
            @change="handleTableChange"
            :show-sorter-tooltip="false"
            :table-layout="compactFirstTwoColumns || hasColumnWidths || fixedLeftColumnCount > 0 ? 'fixed' : undefined"
            :row-class-name="rowClassName"
            :data-hover-row="hoveredRowKey || ''"
            :data-hover-col="hoveredColumnKey || ''"
            row-key="__rowKey"
            bordered
            size="middle"
        />
    </div>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { computed, ref, useSlots, watch } from 'vue'
import { readTaskFile } from 'src/api/task'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { getRp2LangSuffix, parseTabText } from './rp2File'
import { errorMessage } from 'src/utils/notify'
const {
    buildIgvTaskFileUrl,
    getTaskFileDownloadName,
    shouldShowTableToolbar
} = require('./textFileTableToolbar')

const props = defineProps({
    taskId: {
        type: [String, Number],
        required: true
    },
    cnFile: {
        type: String,
        required: true
    },
    enFile: {
        type: String,
        required: true
    },
    taskRootDir: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    hasHeader: {
        type: Boolean,
        default: true
    },
    compactFirstTwoColumns: {
        type: Boolean,
        default: false
    },
    columnWidths: {
        type: Array,
        default: () => []
    },
    columnWidthAliases: {
        type: Array,
        default: () => []
    },
    hiddenHeaderAliases: {
        type: Array,
        default: () => []
    },
    matrixHoverEnabled: {
        type: Boolean,
        default: false
    },
    matrixStartAfterAliases: {
        type: Array,
        default: () => []
    },
    matrixRowIdentifierAliases: {
        type: Array,
        default: () => []
    },
    fixedLeftColumnCount: {
        type: Number,
        default: 0
    },
    defaultColumnWidth: {
        type: Number,
        default: 120
    },
    fixedColumnWidths: {
        type: Array,
        default: () => []
    },
    sortable: {
        type: Boolean,
        default: true
    }
})

const slots = useSlots()
const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const loading = ref(false)
const rows = ref([])
const baseHeaders = ref([])
const errorText = ref('')
const tableWrapRef = ref(null)
const hoveredRowKey = ref('')
const hoveredColumnKey = ref('')
const paginationState = ref({
    current: 1,
    pageSize: 10
})
const hasColumnWidths = computed(() => Array.isArray(props.columnWidths) && props.columnWidths.length > 0)
const hasFixedColumns = computed(() => Number(props.fixedLeftColumnCount || 0) > 0)
const hiddenHeaderSet = computed(() => new Set((props.hiddenHeaderAliases || []).map((item) => String(item || '').trim().toLowerCase())))
const normalizedColumnWidthAliases = computed(() =>
    (props.columnWidthAliases || []).map((item) => ({
        width: Number(item?.width),
        aliases: Array.isArray(item?.aliases)
            ? item.aliases.map((alias) => String(alias || '').trim().toLowerCase()).filter(Boolean)
            : []
    }))
)

const normalizeSortValue = (value) => {
    const text = String(value ?? '').trim()
    if (!text) {
        return { type: 'empty', value: '' }
    }

    const numericText = text.replace(/,/g, '')
    if (/^-?\d+(\.\d+)?$/.test(numericText)) {
        return { type: 'number', value: Number(numericText) }
    }

    return { type: 'string', value: text.toLowerCase() }
}

const compareCellValue = (left, right) => {
    const a = normalizeSortValue(left)
    const b = normalizeSortValue(right)

    if (a.type === 'empty' && b.type === 'empty') {
        return 0
    }
    if (a.type === 'empty') {
        return -1
    }
    if (b.type === 'empty') {
        return 1
    }
    if (a.type === 'number' && b.type === 'number') {
        return a.value - b.value
    }
    return String(a.value).localeCompare(String(b.value), undefined, { numeric: true })
}

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

const handleTableChange = (pagination) => {
    if (pagination) {
        updatePagination(pagination.current, pagination.pageSize)
    }
}

const pagination = computed(() => ({
    current: paginationState.value.current,
    pageSize: paginationState.value.pageSize,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
    onChange: handlePageChange,
    onShowSizeChange: handlePageSizeChange,
    showTotal: (total) => t('PaginationTotal', { total })
}))

const filePath = computed(() => {
    const suffix = getRp2LangSuffix(langCode.value)
    return suffix === 'EN' ? props.enFile : props.cnFile
})
const downloadUrl = computed(() => buildIgvTaskFileUrl(props.taskRootDir, filePath.value))
const downloadFileName = computed(() => getTaskFileDownloadName(filePath.value))
const hasActionsSlot = computed(() => Boolean(slots.actions))
const showToolbar = computed(() =>
    shouldShowTableToolbar({
        title: props.title,
        showDownload: Boolean(downloadUrl.value),
        hasActionsSlot: hasActionsSlot.value
    })
)

const matrixStartHeader = computed(
    () => findHeaderByAliases(baseHeaders.value, props.matrixStartAfterAliases || []) || ''
)

const matrixRowIdentifierHeader = computed(
    () => findHeaderByAliases(baseHeaders.value, props.matrixRowIdentifierAliases || []) || baseHeaders.value[0] || ''
)

const matrixStartIndex = computed(() => {
    const header = matrixStartHeader.value
    const index = baseHeaders.value.indexOf(header)
    return index
})

const findHeaderByAliases = (headers, aliases) => {
    const aliasSet = new Set((aliases || []).map((item) => String(item || '').trim().toLowerCase()))
    return headers.find((header) => aliasSet.has(String(header || '').trim().toLowerCase())) || ''
}

const isMatrixColumn = (header, index) => {
    if (!props.matrixHoverEnabled) {
        return false
    }
    const startIndex = matrixStartIndex.value
    if (startIndex < 0) {
        return false
    }
    return index > startIndex && !!header
}

const matrixCellTitle = (record, header) => {
    const rowHeader = matrixRowIdentifierHeader.value
    const rowIdentifier = String(record?.[rowHeader] ?? '').trim()
    const columnName = String(header ?? '').trim()
    if (!rowIdentifier && !columnName) {
        return ''
    }
    return `${rowIdentifier} / ${columnName}`
}

const clearMatrixHover = () => {
    hoveredRowKey.value = ''
    hoveredColumnKey.value = ''
}

const rowClassName = (record) => {
    if (props.matrixHoverEnabled && record?.__rowKey === hoveredRowKey.value) {
        return 'rp2-matrix-hover-row'
    }
    return ''
}

const getFixedColumnWidth = (index) => {
    const configuredWidth = Number(props.fixedColumnWidths?.[index])
    if (configuredWidth > 0) {
        return configuredWidth
    }
    return props.defaultColumnWidth
}

const getColumnWidth = (index) => {
    const header = String(baseHeaders.value[index] || '').trim().toLowerCase()
    const matchedWidthRule = normalizedColumnWidthAliases.value.find(
        (item) => Number.isFinite(item.width) && item.width > 0 && item.aliases.includes(header)
    )
    if (matchedWidthRule) {
        return matchedWidthRule.width
    }
    if (hasColumnWidths.value && props.columnWidths[index]) {
        return props.columnWidths[index]
    }
    if (props.compactFirstTwoColumns) {
        if (index === 0) {
            return 120
        }
        if (index === 1) {
            return 90
        }
    }
    if (hasFixedColumns.value) {
        if (index < props.fixedLeftColumnCount) {
            return getFixedColumnWidth(index)
        }
        return props.defaultColumnWidth
    }
    return undefined
}

const getStickyLeft = (index) => {
    if (!hasFixedColumns.value || index <= 0) {
        return 0
    }
    return Array.from({ length: index }).reduce((sum, _item, currentIndex) => {
        const width = Number(getColumnWidth(currentIndex))
        return sum + (Number.isFinite(width) && width > 0 ? width : props.defaultColumnWidth)
    }, 0)
}

const tableScroll = computed(() => {
    if (!hasFixedColumns.value) {
        return undefined
    }
    const totalWidth = baseHeaders.value.reduce((sum, _header, index) => {
        const width = Number(getColumnWidth(index))
        return sum + (Number.isFinite(width) && width > 0 ? width : props.defaultColumnWidth)
    }, 0)

    return {
        x: totalWidth,
        y: undefined
    }
})

const columns = computed(() =>
    baseHeaders.value.map((header, index) => {
        const matrixColumn = isMatrixColumn(header, index)
        const isFixedColumn = hasFixedColumns.value && index < props.fixedLeftColumnCount
        const stickyLeft = getStickyLeft(index)
        const column = {
            title: header,
            dataIndex: header,
            key: `${header}-${index}`,
            ellipsis: true,
            customHeaderCell: () => {
                const classNames = []
                if (matrixColumn && hoveredColumnKey.value === header) {
                    classNames.push('rp2-matrix-hover-header')
                }
                if (isFixedColumn) {
                    classNames.push('rp2-fixed-left-header')
                    if (index === props.fixedLeftColumnCount - 1) {
                        classNames.push('rp2-fixed-left-boundary')
                    }
                }
                return {
                    title: header,
                    class: classNames.join(' '),
                    style: isFixedColumn
                        ? {
                              position: 'sticky',
                              left: `${stickyLeft}px`,
                              zIndex: 3,
                              background: '#fff'
                          }
                        : undefined
                }
            },
            customCell: (record) => {
                const classNames = []
                const cell = {}

                if (matrixColumn) {
                    const isHoveredRow = record?.__rowKey === hoveredRowKey.value
                    const isHoveredColumn = header === hoveredColumnKey.value
                    cell.title = matrixCellTitle(record, header)
                    classNames.push(
                        ...[
                            isHoveredColumn ? 'rp2-matrix-hover-col' : '',
                            isHoveredRow ? 'rp2-matrix-hover-row-cell' : '',
                            isHoveredRow && isHoveredColumn ? 'rp2-matrix-hover-cell' : ''
                        ].filter(Boolean)
                    )
                    cell.onMouseenter = () => {
                        hoveredRowKey.value = record?.__rowKey || ''
                        hoveredColumnKey.value = header
                    }
                }

                if (isFixedColumn) {
                    classNames.push('rp2-fixed-left-cell')
                    if (index === props.fixedLeftColumnCount - 1) {
                        classNames.push('rp2-fixed-left-boundary')
                    }
                    cell.style = {
                        position: 'sticky',
                        left: `${stickyLeft}px`,
                        zIndex: matrixColumn ? 2 : 1,
                        background: '#fff'
                    }
                }

                if (classNames.length) {
                    cell.class = classNames.join(' ')
                }

                return cell
            }
        }

        const width = getColumnWidth(index)
        if (width) {
            column.width = width
        }

        if (props.sortable) {
            column.sorter = (a, b) => compareCellValue(a?.[header], b?.[header])
        }

        return column
    })
)

const loadTable = async () => {
    loading.value = true
    errorText.value = ''
    rows.value = []
    baseHeaders.value = []
    clearMatrixHover()

    try {
        const response = await readTaskFile(props.taskId, filePath.value, true, true)
        const text = typeof response === 'string' ? response : ''

        if (!text) {
            errorText.value = `${t('Rp2DataFileMissing')}: ${filePath.value}`
            return
        }

        const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: props.hasHeader })
        const visibleHeaders = headers.filter((header) => !hiddenHeaderSet.value.has(String(header || '').trim().toLowerCase()))
        baseHeaders.value = visibleHeaders

        rows.value = parsedRows.map((row) => {
            const next = { __rowKey: row.__rowKey }
            visibleHeaders.forEach((header) => {
                next[header] = row[header]
            })
            return next
        })
    } catch (error) {
        errorText.value = `${t('Rp2FailedToReadFile')}: ${filePath.value}`
    } finally {
        loading.value = false
    }
}

const downloadSourceFile = () => {
    if (!downloadUrl.value) {
        errorMessage(t('DownloadFailed'))
        return
    }

    const link = document.createElement('a')
    link.href = downloadUrl.value
    link.download = downloadFileName.value
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

watch(
    () => [props.taskId, props.cnFile, props.enFile, props.hasHeader, langCode.value],
    () => {
        paginationState.value.current = 1
        loadTable()
    },
    { immediate: true }
)
</script>

<style scoped>
div :deep(.rp2-grid-table .ant-table),
div :deep(.rp2-grid-table .ant-table-container) {
    border: 1px solid #6f8098 !important;
}

.table-region :deep(.rp2-grid-table .ant-table-container),
div :deep(.rp2-grid-table .ant-table-container) {
    border-color: #6f8098 !important;
}

div :deep(.rp2-grid-table .ant-table-thead > tr > th) {
    border-bottom: 1px solid #c7cfdb !important;
    border-right: 1px solid #cfd7e3 !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    line-height: 1.2 !important;
    height: 36px !important;
    min-height: 36px !important;
    vertical-align: middle !important;
}

div :deep(.rp2-grid-table .ant-table-thead > tr > th .ant-table-column-sorters) {
    align-items: center !important;
    min-height: 22px !important;
}

div :deep(.rp2-grid-table .ant-table-thead > tr > th .ant-table-column-title) {
    line-height: 1.2 !important;
}

div :deep(.rp2-grid-table .ant-table-tbody > tr > td) {
    border-bottom: 1px solid #d4dbe6 !important;
    border-right: 1px solid #d9e0ea !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    line-height: 1.25 !important;
}

div :deep(.rp2-grid-table .ant-table-measure-row),
div :deep(.rp2-grid-table .ant-table-measure-row > td),
div :deep(.rp2-grid-table .ant-table-measure-row > th),
div :deep(.rp2-grid-table .ant-table-thead > tr.ant-table-measure-row),
div :deep(.rp2-grid-table .ant-table-thead > tr.ant-table-measure-row > th),
div :deep(.rp2-grid-table .ant-table-thead > tr.ant-table-measure-row > td) {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    line-height: 0 !important;
    font-size: 0 !important;
    background: transparent !important;
}

div :deep(.rp2-grid-table .ant-table-thead > tr > th:first-child),
div :deep(.rp2-grid-table .ant-table-tbody > tr > td:first-child) {
    border-left: 1px solid #d9e0ea !important;
}

div :deep(.rp2-grid-table .ant-table-thead > tr > th:last-child),
div :deep(.rp2-grid-table .ant-table-tbody > tr > td:last-child) {
    border-right: 0 !important;
}

div :deep(.rp2-grid-table .rp2-fixed-left-header),
div :deep(.rp2-grid-table .rp2-fixed-left-cell) {
    background: #fff !important;
}

div :deep(.rp2-grid-table .rp2-fixed-left-boundary) {
    box-shadow: 2px 0 6px rgba(15, 23, 42, 0.08) !important;
}

div :deep(.rp2-matrix-table .ant-table-thead > tr > th.rp2-matrix-hover-header) {
    background: #e8f1ff !important;
    color: #0f172a !important;
    font-weight: 700 !important;
}

div :deep(.rp2-matrix-table .ant-table-tbody > tr.rp2-matrix-hover-row > td),
div :deep(.rp2-matrix-table .ant-table-tbody > tr > td.rp2-matrix-hover-row-cell) {
    background: #fff7db !important;
}

div :deep(.rp2-matrix-table .ant-table-tbody > tr > td.rp2-matrix-hover-col) {
    background: #edf4ff !important;
}

div :deep(.rp2-matrix-table .ant-table-tbody > tr > td.rp2-matrix-hover-cell) {
    background: #dbeafe !important;
    font-weight: 700 !important;
}

.rp2-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
}

.rp2-table-toolbar-btn {
    border: 1px solid #b8c7dc;
    border-radius: 2px;
    color: #245ea8;
    background: #f7fbff;
    font-size: 12px;
    height: 28px;
    padding: 0 6px;
}

.rp2-table-toolbar-btn:hover {
    border-color: #8fb0d9;
    background: #eef6ff;
}
</style>

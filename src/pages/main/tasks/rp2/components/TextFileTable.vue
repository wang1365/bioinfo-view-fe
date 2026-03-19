<template>
    <div>
        <div class="row items-center q-mb-sm" v-if="title">
            <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
        </div>

        <q-banner v-if="errorText" dense class="bg-orange-1 text-orange-9 q-mb-sm">
            {{ errorText }}
        </q-banner>

        <a-table
            class="rp2-grid-table"
            :columns="columns"
            :data-source="rows"
            :loading="loading"
            :pagination="pagination"
            :table-layout="compactFirstTwoColumns || hasColumnWidths ? 'fixed' : undefined"
            row-key="__rowKey"
            bordered
            size="middle"
        />
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { readTaskFile } from 'src/api/task'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { getRp2LangSuffix, parseTabText } from './rp2File'

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
    hiddenHeaderAliases: {
        type: Array,
        default: () => []
    }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const loading = ref(false)
const rows = ref([])
const columns = ref([])
const errorText = ref('')
const hasColumnWidths = computed(() => Array.isArray(props.columnWidths) && props.columnWidths.length > 0)
const hiddenHeaderSet = computed(() => new Set((props.hiddenHeaderAliases || []).map((item) => String(item || '').trim().toLowerCase())))

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

const pagination = computed(() => ({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
    showTotal: (total) => t('PaginationTotal', { total })
}))

const filePath = computed(() => {
    const suffix = getRp2LangSuffix(langCode.value)
    return suffix === 'EN' ? props.enFile : props.cnFile
})

const loadTable = async () => {
    loading.value = true
    errorText.value = ''
    rows.value = []
    columns.value = []

    try {
        const response = await readTaskFile(props.taskId, filePath.value, true, true)
        const text = typeof response === 'string' ? response : ''

        if (!text) {
            errorText.value = `${t('Rp2DataFileMissing')}: ${filePath.value}`
            return
        }

        const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: props.hasHeader })
        const visibleHeaders = headers.filter((header) => !hiddenHeaderSet.value.has(String(header || '').trim().toLowerCase()))

        rows.value = parsedRows.map((row) => {
            const next = { __rowKey: row.__rowKey }
            visibleHeaders.forEach((header) => {
                next[header] = row[header]
            })
            return next
        })
        columns.value = visibleHeaders.map((header, index) => {
            const column = {
                title: header,
                dataIndex: header,
                key: `${header}-${index}`,
                ellipsis: true,
                sorter: (a, b) => compareCellValue(a?.[header], b?.[header])
            }

            if (props.compactFirstTwoColumns) {
                if (index === 0) {
                    column.width = 120
                }
                if (index === 1) {
                    column.width = 90
                }
            }

            if (hasColumnWidths.value && props.columnWidths[index]) {
                column.width = props.columnWidths[index]
            }

            return column
        })
    } catch (error) {
        errorText.value = `${t('Rp2FailedToReadFile')}: ${filePath.value}`
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.taskId, props.cnFile, props.enFile, props.hasHeader, langCode.value],
    loadTable,
    { immediate: true }
)
</script>

<style scoped>
.table-region :deep(.rp2-grid-table .ant-table-container),
div :deep(.rp2-grid-table .ant-table-container) {
    border-color: #c7cfdb !important;
}

div :deep(.rp2-grid-table .ant-table-thead > tr > th) {
    border-bottom: 1px solid #c7cfdb !important;
    border-right: 1px solid #cfd7e3 !important;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    line-height: 1.2 !important;
}

div :deep(.rp2-grid-table .ant-table-tbody > tr > td) {
    border-bottom: 1px solid #d4dbe6 !important;
    border-right: 1px solid #d9e0ea !important;
}

div :deep(.rp2-grid-table .ant-table-thead > tr > th:last-child),
div :deep(.rp2-grid-table .ant-table-tbody > tr > td:last-child) {
    border-right: 0 !important;
}
</style>

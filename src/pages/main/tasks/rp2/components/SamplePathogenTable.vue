<template>
    <div>
        <q-banner v-if="errorText" dense class="bg-orange-1 text-orange-9 q-mb-sm">
            {{ errorText }}
        </q-banner>
        <a-table
            :columns="columns"
            :data-source="rows"
            :loading="loading"
            :pagination="pagination"
            row-key="__rowKey"
            bordered
            size="middle"
        />
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
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
    }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const rows = ref([])
const columns = ref([])
const loading = ref(false)
const errorText = ref('')

const categoryDirMap = {
    bacteria: 'Bacteria',
    fungus: 'Fungus',
    virus: 'Virus'
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
    const dir = categoryDirMap[props.category]
    return `${props.sampleName}/final_result/${dir}/${dir}_${suffix}_pintai.RPM.txt`
})

const shouldRemoveColumn = (header) => {
    if (!header) {
        return false
    }

    const normalized = header.toLowerCase()
    return header.includes('去重后序列数') || normalized.includes('uniq')
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
            errorText.value = `${t('Rp2DataFileMissing')}: ${filePath.value}`
            return
        }

        const { headers, rows: parsedRows } = parseTabText(text, { hasHeader: true })
        const keptHeaders = headers.filter((header) => !shouldRemoveColumn(header))

        rows.value = parsedRows.map((row) => {
            const mapped = {
                __rowKey: row.__rowKey
            }

            keptHeaders.forEach((header) => {
                mapped[header] = row[header] ?? ''
            })

            return mapped
        })

        columns.value = keptHeaders.map((header, index) => ({
            title: header,
            dataIndex: header,
            key: `${header}-${index}`,
            ellipsis: true
        }))
    } catch (error) {
        rows.value = []
        columns.value = []
        errorText.value = `${t('Rp2FailedToReadFile')}: ${filePath.value}`
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.taskId, props.sampleName, props.category, langCode.value],
    loadData,
    { immediate: true }
)
</script>

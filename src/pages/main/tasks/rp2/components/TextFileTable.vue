<template>
    <div>
        <div class="row items-center q-mb-sm" v-if="title">
            <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
        </div>

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
    }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const loading = ref(false)
const rows = ref([])
const columns = ref([])
const errorText = ref('')

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

        rows.value = parsedRows
        columns.value = headers.map((header, index) => ({
            title: header,
            dataIndex: header,
            key: `${header}-${index}`,
            ellipsis: true
        }))
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

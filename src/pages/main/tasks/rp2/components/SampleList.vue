<template>
    <div class="sample-list">
        <!-- Search Bar -->
        <div class="search-bar q-mb-md">
            <a-input-search
                v-model:value="searchKeyword"
                :placeholder="$t('Search')"
                allow-clear
                @search="handleSearch"
                @change="handleSearchChange"
                style="width: 300px"
            />
        </div>

        <!-- Data Table -->
        <a-table
            :data-source="filteredRows"
            :columns="columns"
            :pagination="paginationConfig"
            :loading="loading"
            row-key="sample_id"
            bordered
            size="middle"
        >
            <template #bodyCell="{ record, column }">
                <template v-if="column.dataIndex === 'operation'">
                    <div class="operation-buttons">
                        <q-btn
                            flat
                            size="sm"
                            color="primary"
                            :label="$t('Rp2ViewResult')"
                            @click="viewResult(record)"
                        />
                        <q-btn
                            flat
                            size="sm"
                            color="secondary"
                            :label="$t('Rp2ConfigReport')"
                            @click="configReport(record)"
                        />
                        <q-btn
                            flat
                            size="sm"
                            color="positive"
                            :label="$t('Rp2DownloadReport')"
                            @click="downloadReport(record)"
                        />
                    </div>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { readTaskFile } from 'src/api/task'
import { errorMessage, successMessage } from 'src/utils/notify'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'

const props = defineProps({
    taskId: {
        type: [String, Number],
        required: true
    }
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()
const store = globalStore()
const { langCode } = storeToRefs(store)

// Data states
const rows = ref([])
const loading = ref(false)
const searchKeyword = ref('')

// Pagination config
const paginationConfig = computed(() => ({
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => t('PaginationTotal', { total }),
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true
}))

// Table columns definition
const columns = computed(() => [
    {
        title: t('Rp2SampleName'),
        dataIndex: 'sample_name',
        key: 'sample_name',
        width: 200,
        sorter: (a, b) => a.sample_name.localeCompare(b.sample_name)
    },
    {
        title: t('Rp2Xijun'),
        dataIndex: 'xijun',
        key: 'xijun',
        width: 150,
        sorter: (a, b) => (a.xijun || '').localeCompare(b.xijun || '')
    },
    {
        title: t('Rp2Zhenjun'),
        dataIndex: 'zhenjun',
        key: 'zhenjun',
        width: 150,
        sorter: (a, b) => (a.zhenjun || '').localeCompare(b.zhenjun || '')
    },
    {
        title: t('Rp2Bingdu'),
        dataIndex: 'bingdu',
        key: 'bingdu',
        width: 150,
        sorter: (a, b) => (a.bingdu || '').localeCompare(b.bingdu || '')
    },
    {
        title: t('Rp2Operation'),
        dataIndex: 'operation',
        key: 'operation',
        width: 280,
        align: 'center',
        fixed: 'right'
    }
])

// Filtered rows based on search keyword
const filteredRows = computed(() => {
    if (!searchKeyword.value) {
        return rows.value
    }
    const keyword = searchKeyword.value.toLowerCase()
    return rows.value.filter(row => {
        return (
            (row.sample_name && row.sample_name.toLowerCase().includes(keyword)) ||
            (row.xijun && row.xijun.toLowerCase().includes(keyword)) ||
            (row.zhenjun && row.zhenjun.toLowerCase().includes(keyword)) ||
            (row.bingdu && row.bingdu.toLowerCase().includes(keyword))
        )
    })
})

// Load data from API
const loadData = async () => {
    loading.value = true
    try {
        const suffix = langCode.value === 'cn' ? 'CN' : 'EN'
        const fileName = `rp2_sample_list_${suffix}.json`
        const res = await readTaskFile(props.taskId, fileName, true)

        // Parse JSON data
        if (typeof res === 'string') {
            rows.value = JSON.parse(res)
        } else {
            rows.value = res || []
        }
    } catch (err) {
        console.error('Failed to load sample list:', err)
        errorMessage(t('FailedToLoadData'))
        rows.value = []
    } finally {
        loading.value = false
    }
}

// Search handlers
const handleSearch = () => {
    // Search is handled reactively by filteredRows computed property
}

const handleSearchChange = () => {
    // Search is handled reactively by filteredRows computed property
}

// Action handlers
const viewResult = (record) => {
    router.push(`/main/tasks/${props.taskId}/sample/${record.sample_id}/report`)
}

const configReport = (record) => {
    router.push(`/main/tasks/${props.taskId}/sample/${record.sample_id}/define-report`)
}

const downloadReport = async (record) => {
    try {
        $q.loading.show({ message: t('Downloading') })

        // Get report path from API
        const { getReportBySample } = await import('src/api/report')
        const res = await getReportBySample({
            task_id: props.taskId,
            sample_id: record.sample_id
        })

        if (res && res.report_path) {
            // Trigger file download
            const link = document.createElement('a')
            link.href = res.report_path
            link.download = res.report_name || `${record.sample_name}_report.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            successMessage(t('DownloadSuccess'))
        } else {
            errorMessage(t('ReportNotFound'))
        }
    } catch (err) {
        console.error('Failed to download report:', err)
        errorMessage(t('DownloadFailed'))
    } finally {
        $q.loading.hide()
    }
}

// Watch for language changes
watch(langCode, () => {
    loadData()
})

// Load data on mount
onMounted(() => {
    loadData()
})
</script>

<style lang="scss" scoped>
.sample-list {
    padding: 16px;
}

.search-bar {
    display: flex;
    justify-content: flex-start;
}

.operation-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
}
</style>

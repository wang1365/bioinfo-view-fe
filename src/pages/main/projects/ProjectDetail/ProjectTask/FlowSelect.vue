<template>
    <q-card class="flow-select-dialog">
        <q-card-section class="flow-select-dialog__header">
            <div class="flow-select-dialog__title-row">
                <div class="flow-select-dialog__title">
                    <q-icon name="schema" color="primary" size="20px" class="q-mr-sm" />
                    {{ $t('ProjectSelectFlowTitle') }}
                </div>
                <div class="flow-select-dialog__meta">
                    {{ $t('PaginationTotal', { total }) }}
                </div>
            </div>
            <div class="flow-select-dialog__toolbar">
                <q-input
                    v-model="keyword"
                    dense
                    outlined
                    clearable
                    class="flow-select-dialog__search"
                    :placeholder="$t('Search')"
                    @keyup.enter="onSearch"
                    @clear="onSearch"
                >
                    <template #append>
                        <q-icon name="search" class="cursor-pointer" @click="onSearch" />
                    </template>
                </q-input>
                <AppActionButton
                    variant="primary"
                    :label="$t('Search')"
                    icon="search"
                    @click="onSearch"
                />
                <AppActionButton
                    :label="$t('Reset')"
                    icon="restart_alt"
                    @click="resetSearch"
                />
            </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="flow-select-dialog__table-wrap">
            <AppDataTable
                class="page-grid-table"
                :data-source="dataItems"
                :columns="columns"
                :scroll="{ y: tableScrollHeight }"
                :loading="loading"
                row-key="id"
                :pagination="{
                    total,
                    current,
                    pageSize,
                    showTotal: (total) => t('PaginationTotal', { total }),
                    showQuickJumper: true,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '15', '30', '50', '100'],
                    onChange: pageChange,
                }"
                :row-selection="{
                    type: 'radio',
                    columnWidth: 30,
                    selectedRowKeys: selectedRowKeys,
                    onChange: onSelectChange,
                    getCheckboxProps: record => ({
                        disabled: record.task_count >= record.config.taskLimit,
                    }),
                }"
                :custom-row="customRow"
                size="small"
                bordered
            />
        </q-card-section>

        <q-separator />

        <q-card-actions align="center" class="flow-select-dialog__actions">
            <AppActionButton
                :label="$t('Confirm')"
                variant="primary"
                :disable="selectedRowKeys.length === 0"
                @click="ensureSelect()"
            />
            <AppActionButton :label="$t('Cancel')" v-close-popup />
        </q-card-actions>
    </q-card>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { ref, onMounted, computed } from 'vue'
import { useApi } from 'src/api/apiBase.js'
import { errorMessage } from 'src/utils/notify.js'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['flowSelected'])
const { apiGet } = useApi()

const columns = computed(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: t('FlowName'), dataIndex: 'name', width: 220 },
    { title: t('Category'), dataIndex: 'flow_category', width: 110 },
    { title: t('FlowDetail'), dataIndex: 'desp', width: 320, ellipsis: true },
    { title: t('SampleType'), dataIndex: 'sample_type', width: 140 },
    { title: t('TaskCount'), dataIndex: 'task_count', width: 110 },
])

const tableScrollHeight = computed(() => 'calc(80vh - 250px)')

const current = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dataItems = ref([])
const selectedRowKeys = ref([])
const selectedRows = ref([])
const keyword = ref('')
const loading = ref(false)

onMounted(() => {
    loadPage()
})

const loadPage = () => {
    loading.value = true
    dataItems.value = []

    let params = `page=${current.value}&size=${pageSize.value}`
    if (keyword.value) {
        params += `&keyword=${encodeURIComponent(keyword.value)}`
    }

    apiGet(
        `/flow/flows/?${params}`,
        (res) => {
            total.value = res.data.count
            for (const item of res.data.results) {
                item.checked = false
                dataItems.value.push(item)
            }
        },
        {},
        null,
        null,
        () => {
            loading.value = false
        }
    )
}

const onSearch = () => {
    current.value = 1
    loadPage()
}

const resetSearch = () => {
    keyword.value = ''
    onSearch()
}

const pageChange = (page, size) => {
    current.value = page
    pageSize.value = size
    loadPage()
}

const ensureSelect = () => {
    if (selectedRows.value.length === 0) {
        errorMessage(t('PleaseSelectItem') || 'Please select a flow')
        return
    }
    emit('flowSelected', selectedRows.value[0])
}

const onSelectChange = (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
}

const customRow = (record) => {
    const isDisabled = record.task_count >= record.config.taskLimit
    return {
        class: isDisabled ? 'flow-select-dialog__row--disabled' : '',
        style: {
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            color: isDisabled ? '#999999' : 'inherit',
        },
        title: isDisabled ? (t('TaskCreateFailedForTaskLimitError') || 'Task limit reached') : '',
        onClick: () => {
            if (!isDisabled) {
                selectedRowKeys.value = [record.id]
                selectedRows.value = [record]
            }
        },
    }
}
</script>

<style scoped lang="scss">
.flow-select-dialog {
    width: min(1240px, 92vw);
    max-width: 92vw;
    height: 80vh;
    display: flex;
    flex-direction: column;
    border-radius: 14px;
}

.flow-select-dialog__header {
    padding: 14px 16px 10px;
}

.flow-select-dialog__title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
}

.flow-select-dialog__title {
    font-size: 18px;
    font-weight: 700;
    color: #1f3f68;
    display: inline-flex;
    align-items: center;
}

.flow-select-dialog__meta {
    font-size: 12px;
    color: #6b7f96;
}

.flow-select-dialog__toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
}

.flow-select-dialog__search {
    width: min(420px, 100%);
}

.flow-select-dialog__table-wrap {
    flex: 1 1 auto;
    min-height: 0;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
}

.flow-select-dialog__actions {
    padding: 12px 16px;
    gap: 10px;
}

:deep(.flow-select-dialog__row--disabled td) {
    background: #f5f7fa !important;
    color: #95a3b8 !important;
}

:deep(.flow-select-dialog__row--disabled:hover td) {
    background: #f1f4f8 !important;
}
</style>

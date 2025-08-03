<template>
    <q-card style="width: 1200px; max-width:90vw; height: 70vh; display: flex; flex-direction: column;" class="q-px-sm">
        <q-card-section class="q-pb-none">
            <div class="text-h6">{{$t('ProjectSelectFlowTitle')}}</div>
        </q-card-section>
        <q-card-section class="flex-1 q-pt-sm" style="overflow: hidden;">
            <a-table
                :data-source="dataItems"
                :columns="columns"
                :scroll="{ y: 'calc(70vh - 160px)' }"
                row-key="id"
                :pagination="{
                total,
                current,
                pageSize,
                showTotal: total => `${t('TotalCount')}: ${total}`,
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
            />
        </q-card-section>
        <q-card-actions align="center" class="q-mt-auto">
            <q-btn
                :label="$t('Confirm')"
                color="primary"
                outline
                @click="ensureSelect()"
                :disable="selectedRowKeys.length === 0"
            />
            <q-btn :label="$t('Cancel')" outline v-close-popup />
        </q-card-actions>
    </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from 'src/api/apiBase.js'
import { errorMessage } from 'src/utils/notify.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['flowSelected'])
const { apiGet } = useApi()

const columns = computed(() => [
    { title: 'ID', dataIndex: 'id',  width: 20, },
    { title: t('FlowName'), dataIndex: 'name',  width: 120, },
    { title: t('Category'), dataIndex: 'flow_category', width: 40, },
    { title: t('FlowDetail'), dataIndex: 'desp', width: 120, ellipsis: true },
    { title: t('SampleType'), dataIndex: 'sample_type',  width: 50, },
    { title: t('TaskCount'), dataIndex: 'task_count',  width: 50, },
])

const current = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dataItems = ref([])
const selectedRowKeys = ref([])
const selectedRows = ref([])


onMounted(() => {
    loadPage()
})

const loadPage = () => {
    dataItems.value = []
    let params = `page=${current.value}&size=${pageSize.value}`
    apiGet(`/flow/flows/?${params}`, (res) => {
        total.value = res.data.count
        for (const item of res.data.results) {
            item.checked = false
            dataItems.value.push(item)
        }
        console.log(total.value)
    })
}

const pageChange = (page, size) => {
    console.log(page, size)
    current.value = page
    pageSize.value = size
    loadPage()
}

const ensureSelect = () => {
    emit('flowSelected', selectedRows.value[0])
}

const onSelectChange = (keys, rows) => {
    console.log('selectedRowKeys changed: ', rows)
    selectedRowKeys.value = keys
    selectedRows.value = rows
}

const customRow = (record) => {
    const isDisabled = record.task_count >= record.config.taskLimit
    return {
        style: {
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            color: isDisabled ? '#999999' : 'inherit'
        },
        onClick: () => {
            if (!isDisabled) {
                selectedRowKeys.value = [record.id]
                selectedRows.value = [record]
            }
        }
    }
}
</script>

<style scoped>
:deep(.ant-table-tbody > tr:hover > td) {
    background-color: #f5f5f5 !important;
}

:deep(.ant-table-tbody > tr) {
    transition: background-color 0.2s ease;
}
</style>

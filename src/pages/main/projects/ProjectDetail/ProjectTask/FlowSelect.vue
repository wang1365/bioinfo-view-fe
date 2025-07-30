<template>
    <q-card style="width: 1200px; max-width:90vw; height: 70vh;" class="q-px-sm">
        <q-card-section>
            <div class="text-h6">{{$t('ProjectSelectFlowTitle')}}</div>
        </q-card-section>
        <q-card-section>
            <a-table
                :data-source="dataItems"
                :columns="columns"
                :scroll="{ y: 500 }"
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
                size="small"
            />
        </q-card-section>
        <q-card-actions align="center">
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
</script>

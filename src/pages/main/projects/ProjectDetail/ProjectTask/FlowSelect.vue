<template>
    <q-card style="width: 1200px; max-width:90vw; height: 80vh; display: flex; flex-direction: column;" class="q-px-sm">
        <q-card-section class="q-pb-none row items-center justify-between">
            <div class="text-h6">{{$t('ProjectSelectFlowTitle')}}</div>
            <q-input
                dense
                outlined
                v-model="keyword"
                :placeholder="$t('Search')"
                @keyup.enter="onSearch"
                class="q-ml-md"
                style="width: 300px"
                clearable
                @clear="onSearch"
            >
                <template v-slot:append>
                    <q-icon name="search" class="cursor-pointer" @click="onSearch" />
                </template>
            </q-input>
        </q-card-section>
        <q-card-section class="flex-1 q-pt-sm" style="overflow: hidden; display: flex; flex-direction: column;">
            <a-table
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
            />
        </q-card-section>
        <q-card-actions align="center" class="q-mt-auto q-py-md">
            <AppActionButton
                :label="$t('Confirm')"
                variant="primary"
                @click="ensureSelect()"
                :disable="selectedRowKeys.length === 0"
            />
            <AppActionButton :label="$t('Cancel')" v-close-popup />
        </q-card-actions>
    </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from 'src/api/apiBase.js'
import { errorMessage } from 'src/utils/notify.js'
import AppActionButton from 'src/components/button/AppActionButton.vue'
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

// 动态计算表格滚动高度，确保分页组件能够显示
const tableScrollHeight = computed(() => {
    // 基础高度：70vh
    // 减去标题区域：约60px
    // 减去按钮区域：约80px
    // 减去表格头部：约40px
    // 减去分页区域：约60px
    // 减去内边距和边距：约20px
    return 'calc(65vh)'
})

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
    apiGet(`/flow/flows/?${params}`, (res) => {
        total.value = res.data.count
        for (const item of res.data.results) {
            item.checked = false
            dataItems.value.push(item)
        }
        console.log(total.value)
    }, {}, null, null, () => {
        loading.value = false
    })
}

const onSearch = () => {
    current.value = 1
    loadPage()
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

<style scoped></style>

<template>
    <div class="dashboard-user-table">
        <div class="dashboard-user-table__header">{{ $t('DashboardUsers') }}</div>
        <AppDataTable
            class="dashboard-user-table__inner"
            :columns="columns"
            :data-source="rows"
            :pagination="false"
            :loading="loading"
            row-key="id"
            size="small"
            :scroll="{ y: 252 }"
        />
        <div class="dashboard-user-table__footer">
            <a-pagination
                size="small"
                :current="pagination.page"
                :page-size="pagination.rowsPerPage"
                :total="pagination.rowsNumber"
                :show-size-changer="false"
                @change="onPageChange"
            />
        </div>
    </div>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useApi } from 'src/api/apiBase'

const { t } = useI18n()
const { apiGet } = useApi()

const loading = ref(false)
const pagination = ref({
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
})
const rows = ref([])

const columns = computed(() => [
    {
        title: t('User'),
        dataIndex: 'nickname',
        key: 'nickname',
        width: '34%',
        ellipsis: true,
    },
    {
        title: t('DiskUsage'),
        dataIndex: 'used_disk',
        key: 'used_disk',
        width: '33%',
        customRender: ({ text }) => `${((text || 0) / 1024).toFixed(2)}`,
    },
    {
        title: t('DashboardUsersColumnTask'),
        dataIndex: 'running_task',
        key: 'running_task',
        width: '33%',
    },
])

const fetchRows = (page = pagination.value.page) => {
    loading.value = true
    apiGet(`/account/?page=${page}&size=${pagination.value.rowsPerPage}`, (res) => {
        pagination.value.rowsNumber = res.data.total_count
        pagination.value.page = page
        rows.value = res.data.item_list
        loading.value = false
    })
}

const onPageChange = (page) => {
    fetchRows(page)
}

onMounted(() => {
    fetchRows(1)
})
</script>

<style lang="scss" scoped>
.dashboard-user-table {
    display: flex;
    flex-direction: column;
    height: 340px;
    border-radius: 24px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(210, 219, 233, 0.7);
    box-shadow: 0 14px 40px rgba(17, 38, 68, 0.08);
}

.dashboard-user-table__header {
    padding: 16px 18px 10px;
    font-size: 1.2rem;
    font-weight: 700;
    color: #172033;
}

.dashboard-user-table__inner {
    flex: 1 1 auto;
    padding: 0 12px;
}

.dashboard-user-table__footer {
    display: flex;
    justify-content: flex-end;
    padding: 8px 14px 12px;
    border-top: 1px solid #edf2f7;
    background: rgba(250, 252, 255, 0.92);
}

.dashboard-user-table__inner :deep(.ant-table) {
    font-size: 12px;
}

.dashboard-user-table__inner :deep(.ant-table-container) {
    border-inline-start: none !important;
}

.dashboard-user-table__inner :deep(.ant-table-thead > tr > th) {
    padding: 10px 12px;
    background: #f7f9fd;
    color: #5f6e86;
    font-weight: 700;
    border-bottom: 1px solid #e8eef6;
}

.dashboard-user-table__inner :deep(.ant-table-tbody > tr > td) {
    padding: 9px 12px;
    color: #243247;
    border-bottom: 1px solid #eef2f7;
}

.dashboard-user-table__inner :deep(.ant-table-tbody > tr > td:first-child) {
    font-weight: 600;
    background: #f8fbff;
}

.dashboard-user-table__inner :deep(.ant-table-tbody > tr:hover > td) {
    background: #eef4ff !important;
}

.dashboard-user-table__inner :deep(.ant-table-header) {
    border-radius: 14px 14px 0 0;
}
</style>

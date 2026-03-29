<template>
    <q-page padding style="overflow-x: hidden; display: flex; flex-direction: column">
        <PageTitle :title="$t('ReportPageTitle')" />
        <q-card class="reports-card page-list-card q-mt-xs" flat>
            <div>
                <div class="page-list-filter row q-px-md bio-data-table">
                    <q-input
                        class="page-list-filter__field page-list-filter__field--keyword"
                        style="width: 350px"
                        v-model="searchParams.search"
                        filled
                        dense
                        :label="$t('Task') + ' ' + $t('Name')"
                        clearable
                    />
                    <q-input
                        v-model="searchParams.patient_identifier"
                        class="page-list-filter__field"
                        filled
                        dense
                        :label="$t('PatientNewFormPatientIdentificationNumber')"
                        clearable
                    />
                    <q-input
                        v-model="searchParams.sample_meta_identifier"
                        class="page-list-filter__field"
                        filled
                        dense
                        :label="$t('SampleListTableColumnSampleIdentificationNumber')"
                        clearable
                    />
                    <q-input
                        v-model="searchParams.sample_identifier"
                        class="page-list-filter__field"
                        filled
                        dense
                        :label="$t('DataNewFormDataIdentificationNumber')"
                        clearable
                    />
                    <AppActionButton variant="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                    <AppActionButton :label="$t('Reset')" icon="clear" @click="reset()" />
                </div>
            </div>
            <div class="q-pt-sm q-px-md q-pb-md bio-data-table">
                <AppDataTable
                    class="page-grid-table"
                    :data-source="rows"
                    :columns="columns"
                    :loading="loading"
                    :pagination="pagination"
                    :scroll="tableScroll"
                    row-key="id"
                    size="small"
                    :locale="tableLocale"
                    bordered
                    @change="handleTableChange"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'task_id'">
                            {{ record.task?.name || '-' }}
                        </template>
                        <template v-else-if="column.key === 'patient_id'">
                            {{ getPatientIdentifiers(record) }}
                        </template>
                        <template v-else-if="column.key === 'data_id'">
                            {{ getDataIdentifiers(record) }}
                        </template>
                        <template v-else-if="column.key === 'sample_id'">
                            {{ getSampleIdentifiers(record) }}
                        </template>
                        <template v-else-if="column.key === 'create_time'">
                            {{ format(record.create_time) }}
                        </template>
                        <template v-else-if="column.key === 'status'">
                            <span v-if="record.status === '鍒涘缓鎴愬姛'">{{ $t('Success') }}</span>
                            <span v-else-if="record.status === '鍒涘缓澶辫触'">{{ $t('Failed') }}</span>
                            <span v-else>{{ record.status || '-' }}</span>
                        </template>
                        <template v-else-if="column.key === 'actions'">
                            <div class="table-operation-buttons">
                                <a :href="getreportPath(record)" download v-if="record.status === '鍒涘缓鎴愬姛'">
                                    <TableActionButton
                                        variant="primary"
                                        :label="$t('Download')"
                                    />
                                </a>
                                <TableActionButton
                                    v-permission="'deleteReport'"
                                    variant="danger"
                                    @click="onDelete(record)"
                                    :label="$t('Delete')"
                                />
                            </div>
                        </template>
                    </template>
                </AppDataTable>
            </div>
        </q-card>
    </q-page>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PageTitle from 'components/page-title/PageTitle.vue'
import { useApi } from 'src/api/apiBase'
import { useQuasar } from 'quasar'
import { infoMessage } from 'src/utils/notify'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { globalStore } from 'src/stores/global'
import { format } from 'src/utils/time'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'

const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n()
const { apiGet, apiDelete } = useApi()
const $q = useQuasar()

const searchParams = ref({
    search: '',
    patient_identifier: '',
    sample_meta_identifier: '',
    sample_identifier: '',
})

const rows = ref([])
const loading = ref(false)
const intId = ref('')

const pagination = ref({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => t('PaginationTotal', { total }),
    pageSizeOptions: ['5', '15', '35', '50'],
})

const tableLocale = computed(() => ({
    emptyText: t('NoData'),
}))

const tableScroll = computed(() => ({
    x: 1400,
    y: 'calc(100vh - 360px)',
}))

const getreportPath = (row) => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    if (row.report_path) {
        return '/igv' + row.report_path
    }
    if (suffix === 'EN' && row.report_path_en) {
        return '/igv' + row.report_path_en
    }
    if (suffix === 'CN' && row.report_path_cn) {
        return '/igv' + row.report_path_cn
    }
    return '#'
}

const joinSampleValues = (row, getter) => {
    if (!row.task || !row.task.samples) return '-'
    const values = row.task.samples.map((item) => getter(item)).filter(Boolean)
    return values.length ? values.join(' ') : '-'
}

const getPatientIdentifiers = (row) => joinSampleValues(row, (item) => item.sample_meta?.patient?.identifier)
const getDataIdentifiers = (row) => joinSampleValues(row, (item) => item.identifier)
const getSampleIdentifiers = (row) => joinSampleValues(row, (item) => item.sample_meta?.identifier)

const columns = computed(() => [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        align: 'left',
        width: 80,
    },
    {
        title: t('Task'),
        dataIndex: 'task_id',
        key: 'task_id',
        align: 'left',
    },
    {
        title: t('SampleListTableColumnPatientIdentificationNumber'),
        dataIndex: 'patient_id',
        key: 'patient_id',
        align: 'left',
    },
    {
        title: t('DataNewFormDataIdentificationNumber'),
        dataIndex: 'data_id',
        key: 'data_id',
        align: 'left',
    },
    {
        title: t('SampleListTableColumnSampleIdentificationNumber'),
        dataIndex: 'sample_id',
        key: 'sample_id',
        align: 'left',
    },
    {
        title: t('Comment'),
        dataIndex: 'comment',
        key: 'comment',
        align: 'left',
    },
    {
        title: t('CreateTime'),
        dataIndex: 'create_time',
        key: 'create_time',
        align: 'left',
    },
    {
        title: t('Status'),
        dataIndex: 'status',
        key: 'status',
        align: 'left',
        width: 100,
    },
    {
        title: t('Operate'),
        dataIndex: 'actions',
        key: 'actions',
        align: 'center',
        width: 180,
    },
])

onMounted(() => {
    loadPage()
    intId.value = setInterval(() => loadPage(false), 5000)
})

onUnmounted(() => {
    clearInterval(intId.value)
})

const refreshPage = () => {
    pagination.value.current = 1
    loadPage()
}

const reset = () => {
    searchParams.value = {
        search: '',
        patient_identifier: '',
        sample_meta_identifier: '',
        sample_identifier: '',
    }
    refreshPage()
}

const handleTableChange = (pg) => {
    pagination.value.current = pg.current
    pagination.value.pageSize = pg.pageSize
    loadPage()
}

const loadPage = (showLoading = true) => {
    const page = pagination.value.current
    const pageSize = pagination.value.pageSize
    let params = `?page=${page}&size=${pageSize}`
    if (searchParams.value.search) {
        params = `${params}&search=${searchParams.value.search}`
    }
    if (searchParams.value.patient_identifier) {
        params = `${params}&patient_identifier=${searchParams.value.patient_identifier}`
    }
    if (searchParams.value.sample_meta_identifier) {
        params = `${params}&sample_meta_identifier=${searchParams.value.sample_meta_identifier}`
    }
    if (searchParams.value.sample_identifier) {
        params = `${params}&sample_identifier=${searchParams.value.sample_identifier}`
    }
    if (showLoading) {
        loading.value = true
    }
    apiGet(
        `/report/report/${params}`,
        (res) => {
            pagination.value.total = res.data.count
            rows.value = res.data.results || []
        },
        {},
        null,
        null,
        () => {
            loading.value = false
        }
    )
}

const onDelete = (item) => {
    $q.dialog({
        title: t('Confirm'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/report/report/${item.id}/`, (_) => {
            infoMessage(t('Success'))
            if (rows.value.length > 1) {
                const index = rows.value.findIndex((row) => row.id === item.id)
                if (index !== -1) {
                    pagination.value.total -= 1
                    rows.value.splice(index, 1)
                }
            } else {
                if (pagination.value.current > 1) {
                    pagination.value.current -= 1
                } else {
                    pagination.value.current = 1
                }
                loadPage()
            }
        })
    })
}
</script>

<style lang="scss">
.reports-card {
    min-height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
}

.reports-card .bio-data-table {
    flex: 1;
    display: flex;
}

.reports-card .bio-data-table .ant-table-wrapper {
    flex: 1;
}
</style>

<template>
    <q-card class="q-mt-sm samples-card page-list-card" flat>
        <div>
            <div class="page-list-filter row q-px-md bio-data-table">
                <q-input
                    class="page-list-filter__field page-list-filter__field--keyword"
                    style="width: 280px"
                    v-model="searchParams.search"
                    filled
                    dense
                    :label="$t('SampleListPageSearchInput')"
                    clearable
                />

                <q-input
                    class="page-list-filter__field"
                    style="width: 140px"
                    clearable
                    filled
                    dense
                    :label="$t('SampleListPageSearchStartTestDate')"
                    v-model="searchParams.test_date_start"
                >
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.test_date_start" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input
                    class="page-list-filter__field"
                    style="width: 140px"
                    clearable
                    filled
                    dense
                    :label="$t('SampleListPageSearchEndTestDate')"
                    v-model="searchParams.test_date_end"
                >
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.test_date_end" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input
                    class="page-list-filter__field"
                    style="width: 140px"
                    clearable
                    filled
                    dense
                    :label="$t('SampleListPageSearchStartTestDate')"
                    v-model="searchParams.sample_date_start"
                >
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.sample_date_start" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input
                    class="page-list-filter__field"
                    style="width: 140px"
                    clearable
                    filled
                    dense
                    :label="$t('SampleListPageSearchEndTestDate')"
                    v-model="searchParams.sample_date_end"
                >
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.sample_date_end" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-select
                    class="page-list-filter__field"
                    style="width: 120px"
                    clearable
                    filled
                    dense
                    v-model="searchParams.is_panel"
                    :options="panelOptions"
                    emit-value
                    map-options
                    :label="$t('SampleListPageSearchIsPanel')"
                />
                <q-btn color="primary" unelevated :label="$t('Search')" icon="search" @click="refreshPage()" />
                <q-btn color="grey-7" outline :label="$t('Reset')" icon="clear" @click="reset()" />
            </div>
        </div>
        <div>
            <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
                <q-btn
                    v-permission="'createSample'"
                    color="primary"
                    unelevated
                    :label="$t('SampleListTableBtnNew')"
                    icon="description"
                    @click="showSampleNew = true"
                />
                <q-btn color="info" unelevated :label="$t('PageListTableExport')" icon="file_download" @click="exportData()" />
                <q-btn color="positive" unelevated v-permission="'createSample'">
                    <label for="file">
                        <q-icon name="file_upload"></q-icon>
                        {{ $t('PageListTableUpload') }}
                        <span style="width: 0; height: 0; overflow: hidden; display: inline-block">
                            <input id="file" type="file" style="rgba(0,0,0,0)" @change="fileSelected($event)" />
                        </span>
                    </label>
                </q-btn>
                <q-btn
                    color="positive"
                    unelevated
                    :label="$t('PageListTableTemplate')"
                    icon="file_download"
                    @click="downloadTemplate()"
                />
            </q-toolbar>
        </div>
        <div>
            <div class="q-pt-sm q-px-md q-pb-md bio-data-table">
                <a-table
                    class="page-grid-table"
                    :data-source="dataItems"
                    :columns="columns"
                    :loading="loading"
                    :pagination="pagination"
                    :scroll="tableScrollY"
                    table-layout="fixed"
                    row-key="id"
                    @change="handleTableChange"
                    :locale="tableLocale"
                    size="small"
                    bordered
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'is_panel'">
                            {{ displayBoolean(record.is_panel) }}
                        </template>
                        <template v-else-if="column.key === 'patient_identifier'">
                            {{ record.patient?.identifier || '-' }}
                        </template>
                        <template v-else-if="column.key === 'identifier'">
                            <span :class="{ 'text-primary': record.is_nc_sample === true }">
                                {{ formatSampleIdentifier(record) }}
                            </span>
                        </template>
                        <template v-else-if="column.key === 'operation'">
                            <div class="table-operation-buttons">
                                <q-btn
                                    class="table-operation-btn table-operation-btn--primary"
                                    :label="$t('SampleListTableColumnBtnDetail')"
                                    @click="info(record)"
                                    flat
                                    dense
                                    no-caps
                                />
                                <q-btn
                                    class="table-operation-btn table-operation-btn--primary"
                                    :label="$t('SampleListTableColumnBtnEdit')"
                                    @click="edit(record)"
                                    flat
                                    dense
                                    no-caps
                                />
                                <q-btn
                                    class="table-operation-btn table-operation-btn--secondary"
                                    :label="$t('SampleListTableColumnBtnAssociatewithPatient')"
                                    @click="link(record)"
                                    flat
                                    dense
                                    no-caps
                                />
                                <q-btn
                                    v-permission="'deleteSample'"
                                    class="table-operation-btn table-operation-btn--danger"
                                    :label="$t('SampleListTableColumnBtnDelete')"
                                    @click="confirm(record)"
                                    flat
                                    dense
                                    no-caps
                                />
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </div>
    </q-card>
    <q-dialog persistent v-model="showSampleNew">
        <SampleNew
            @refresh="refreshPage(); showSampleNew = false"
        />
    </q-dialog>
    <q-dialog v-model="showSampleInfo">
        <SampleInfo :id="infoId" />
    </q-dialog>
    <q-dialog persistent v-model="showSampleEdit">
        <SampleEdit
            :id="editId"
            @refresh="refreshPage(); showSampleEdit = false"
        />
    </q-dialog>
    <q-dialog persistent v-model="showLinkPatient">
        <PatientList
            :linkId="linkId"
            @refresh="
                linkPatient($event)
            "
        />
    </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SampleInfo from './SampleInfo.vue'
import SampleEdit from './SampleEdit.vue'
import SampleNew from './SampleNew.vue'
import PatientList from './PatientList.vue'
import { useApi } from 'src/api/apiBase'
import { infoMessage } from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { buildModelQuery } from 'src/api/modelQueryBuilder'

const { t } = useI18n()
const { apiDelete, downloadData, apiPatch, apiPost } = useApi()

const showSampleEdit = ref(false)
const showSampleInfo = ref(false)
const showSampleNew = ref(false)
const showLinkPatient = ref(false)
const infoId = ref(0)
const editId = ref(0)
const linkId = ref(0)

const dataItems = ref([])
const loading = ref(false)

const searchParams = ref({
    search: '',
    is_panel: undefined,
    sample_date_start: '',
    sample_date_end: '',
    test_date_start: '',
    test_date_end: '',
})

const $q = useQuasar()

const panelOptions = computed(() => [
    { label: t('Yes'), value: true },
    { label: t('No'), value: false },
])

const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => t('PaginationTotal', { total }),
    pageSizeOptions: ['10', '20', '50', '100'],
})

const columns = computed(() => [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        width: 80,
    },
    {
        title: t('SampleListTableColumnSamplingDate'),
        dataIndex: 'sample_date',
        key: 'sample_date',
        align: 'center',
        width: 120,
    },
    {
        title: t('SampleListTableColumnSubmissionDate'),
        dataIndex: 'test_date',
        key: 'test_date',
        align: 'center',
        width: 120,
    },
    {
        title: t('SampleListTableColumnSamplingSite'),
        dataIndex: 'sample_componet',
        key: 'sample_componet',
        align: 'center',
        width: 130,
    },
    {
        title: t('SampleListTableColumnSampleType'),
        dataIndex: 'sample_type',
        key: 'sample_type',
        align: 'center',
        width: 130,
    },
    {
        title: t('SampleListTableColumnTumorContent'),
        dataIndex: 'panel_proportion',
        key: 'panel_proportion',
        align: 'center',
        width: 110,
    },
    {
        title: t('SampleListTableColumnTumorSample'),
        dataIndex: 'is_panel',
        key: 'is_panel',
        align: 'center',
        width: 100,
    },
    {
        title: t('SampleListTableColumnPatientIdentificationNumber'),
        dataIndex: 'patient_identifier',
        key: 'patient_identifier',
        align: 'center',
        width: 140,
    },
    {
        title: t('SampleListTableColumnSampleIdentificationNumber'),
        dataIndex: 'identifier',
        key: 'identifier',
        align: 'center',
        width: 140,
    },
    {
        title: t('SampleListTableColumnOperations'),
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        width: 240,
    },
])

const tableLocale = computed(() => ({
    emptyText: t('NoData'),
}))

const tableScrollY = computed(() => ({
    y: 'calc(100vh - 420px)',
    x: 1410,
}))

const displayBoolean = (value) => {
    if (value === true) return t('Yes')
    if (value === false) return t('No')
    return '-'
}

const formatSampleIdentifier = (item) => {
    const identifier = item?.identifier ?? '-'
    if (item?.is_nc_sample === true && identifier !== '-') {
        return `${identifier} (NC)`
    }
    return identifier
}

const edit = async (item) => {
    editId.value = item.id
    showSampleEdit.value = true
}

const info = async (item) => {
    infoId.value = item.id
    showSampleInfo.value = true
}

const link = async (item) => {
    linkId.value = item.id
    showLinkPatient.value = true
}

onMounted(() => {
    loadPage()
})

const handleTableChange = (pg) => {
    pagination.value.current = pg.current
    pagination.value.pageSize = pg.pageSize
    loadPage()
}

const linkPatient = (event) => {
    apiPatch(
        `/sample/sampledatas/${linkId.value}/`,
        () => {
            showLinkPatient.value = false
            refreshPage()
        },
        { patient_id: event.id, patient_identifier: event.identifier }
    )
}

const reset = () => {
    searchParams.value = {
        search: '',
        is_panel: undefined,
        sample_date_start: '',
        sample_date_end: '',
        test_date_start: '',
        test_date_end: '',
    }
    refreshPage()
}

const refreshPage = async () => {
    pagination.value.current = 1
    loadPage()
}

const loadPage = async () => {
    const andFields = {}
    let searchFields = buildModelQuery()

    if (searchParams.value.search) {
        searchFields = buildModelQuery(
            [],
            {
                patient_identifier__icontains: searchParams.value.search,
                identifier__icontains: searchParams.value.search,
                sample_componet__icontains: searchParams.value.search,
                sample_type__icontains: searchParams.value.search,
            },
            'OR'
        )
    }
    if (searchParams.value.sample_date_start) {
        andFields.sample_date__gte = searchParams.value.sample_date_start
    }
    if (searchParams.value.sample_date_end) {
        andFields.sample_date__lte = searchParams.value.sample_date_end
    }
    if (searchParams.value.test_date_start) {
        andFields.test_date__gte = searchParams.value.test_date_start
    }
    if (searchParams.value.test_date_end) {
        andFields.test_date__lte = searchParams.value.test_date_end
    }
    if (searchParams.value.is_panel === true) {
        andFields.is_panel = true
    }
    if (searchParams.value.is_panel === false) {
        andFields.is_panel = false
    }

    const query = buildModelQuery([searchFields], andFields)
    const params = `?page=${pagination.value.current}&size=${pagination.value.pageSize}`

    loading.value = true
    apiPost(
        `/model_query/sample_meta${params}`,
        (res) => {
            pagination.value.total = res.data.count
            dataItems.value = res.data.results || []
        },
        query,
        {},
        null,
        null,
        () => {
            loading.value = false
        }
    )
}

const confirm = (item) => {
    $q.dialog({
        title: t('Confirm'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/sample/sampledatas/${item.id}/`, () => {
            infoMessage(t('Success'))
            if (dataItems.value.length > 1) {
                const index = dataItems.value.findIndex((sample) => sample.id === item.id)
                if (index !== -1) {
                    pagination.value.total -= 1
                    dataItems.value.splice(index, 1)
                }
            } else {
                if (pagination.value.current > 1) {
                    pagination.value.current -= 1
                } else {
                    pagination.value.current = 1
                }
                refreshPage()
            }
        })
    })
}

const exportData = () => {
    downloadData('/sample/samplemeta/export', null)
}

const downloadTemplate = () => {
    downloadData('/sample/samplemeta/template/download', null)
}

const fileSelected = (event) => {
    const data = new FormData()
    data.append('file', event.target.files[0])
    api.post('/sample/samplemeta/upload', data)
        .then(() => {
            $q.notify({
                message: t('Success'),
                timeout: 300,
                position: 'center',
            })
            refreshPage()
        })
        .catch((e) => {
            console.log(e.response.data)
        })
}
</script>

<style lang="scss">
.samples-card {
    min-height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
}

.samples-card .bio-data-table {
    flex: 1;
    display: flex;
}

.samples-card .bio-data-table .ant-table-wrapper {
    flex: 1;
}
</style>

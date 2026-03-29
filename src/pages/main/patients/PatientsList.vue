<template>
    <q-card class="q-mt-xs patient-card page-list-card" flat>
        <div>
            <div class="page-list-filter row q-px-md bio-data-table">
                <q-input
                    class="page-list-filter__field page-list-filter__field--keyword"
                    style="width: 250px"
                    v-model="searchParams.search"
                    filled
                    dense
                    :label="$t('PatientPageListSearchKeyWord')"
                    clearable
                />
                <q-input
                    class="page-list-filter__field"
                    type="number"
                    style="width: 110px"
                    v-model="searchParams.age_start"
                    filled
                    dense
                    :label="$t('PatientPageListSearchAgeStart')"
                    clearable
                />
                <q-input
                    class="page-list-filter__field"
                    type="number"
                    style="width: 110px"
                    v-model="searchParams.age_end"
                    filled
                    dense
                    :label="$t('PatientPageListSearchAgeEnd')"
                    clearable
                />
                <q-input
                    class="page-list-filter__field"
                    style="width: 170px"
                    clearable
                    filled
                    dense
                    :label="$t('PatientPageListSearchEntryStart')"
                    v-model="searchParams.ctime_start"
                >
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.ctime_start" mask="YYYY-MM-DD">
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
                    style="width: 170px"
                    clearable
                    filled
                    dense
                    :label="$t('PatientPageListSearchEntryEnd')"
                    v-model="searchParams.ctime_end"
                >
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.ctime_end" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <AppActionButton
                    variant="primary"
                    :label="$t('PatientPageListSearchEnsure')"
                    icon="search"
                    @click="refreshPage()"
                />
                <AppActionButton
                    :label="$t('PatientPageListSearchReset')"
                    icon="clear"
                    @click="reset()"
                />
            </div>
        </div>
        <div>
            <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
                <AppActionButton
                    v-permission="'createPatient'"
                    variant="primary"
                    :label="$t('PatientPageListTableCreate')"
                    icon="description"
                    @click="showPatientNew = true"
                />
                <AppActionButton variant="primary" :label="$t('PageListTableExport')" icon="file_download" @click="exportData()" />
                <AppActionButton variant="success" v-permission="'createPatient'">
                    <label for="file">
                        <q-icon name="file_upload"></q-icon>
                        {{ $t('PageListTableUpload') }}
                        <span style="width: 0; height: 0; overflow: hidden; display: inline-block">
                            <input id="file" type="file" style="rgba(0,0,0,0)" @change="fileSelected($event)" />
                        </span>
                    </label>
                </AppActionButton>
                <AppActionButton
                    variant="success"
                    :label="$t('PageListTableTemplate')"
                    icon="file_download"
                    @click="downlaodTemplate()"
                />
            </q-toolbar>
        </div>
        <div class="q-pt-sm q-px-md q-pb-md bio-data-table">
            <AppDataTable
                class="page-grid-table"
                :data-source="dataItems"
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
                    <template v-if="column.key === 'gender'">
                        {{ formatGender(record.gender) }}
                    </template>
                    <template v-else-if="column.key === 'sample_count'">
                        {{ (record.samplemeta_set || []).length }}
                    </template>
                    <template v-else-if="column.key === 'operation'">
                        <div class="table-operation-buttons">
                            <TableActionButton
                                variant="primary"
                                :label="$t('PatientPageListTableRowBtnEdit')"
                                @click="edit(record)"
                            />
                            <TableActionButton
                                variant="primary"
                                :label="$t('PatientPageListTableRowBtnPatientInformation')"
                                @click="info(record)"
                            />
                            <TableActionButton
                                variant="secondary"
                                :label="$t('PatientPageListTableRowBtnAssociateWithSamples')"
                                @click="link(record)"
                            />
                            <TableActionButton
                                v-permission="'deletePatient'"
                                variant="danger"
                                :label="$t('PatientPageListTableRowBtnDelete')"
                                @click="confirm(record)"
                            />
                        </div>
                    </template>
                </template>
            </AppDataTable>
        </div>
    </q-card>
    <q-dialog v-model="showPatientNew" persistent>
        <PatientNew
            @refresh="refreshPage(); showPatientNew = false"
        />
    </q-dialog>
    <q-dialog v-model="showPatientInfo">
        <PatientInfo
            :id="infoId"
            @refresh="refreshPage(); showPatientInfo = false"
        />
    </q-dialog>
    <q-dialog v-model="showPatientEdit" persistent>
        <PatientEdit
            :id="editId"
            @refresh="refreshPage(); showPatientEdit = false"
        />
    </q-dialog>
    <q-dialog persistent v-model="showLinkSample">
        <SampleList
            :linkId="linkId"
            :patient="linkSamplePatient"
            @refresh="linkSample($event)"
        />
    </q-dialog>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import { useApi } from 'src/api/apiBase'
import SampleList from './SampleList.vue'
import { useRouter } from 'vue-router'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import { infoMessage, warnMessage } from 'src/utils/notify'
import { useI18n } from 'vue-i18n'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'
import PatientInfo from './PatientInfo.vue'
import PatientEdit from './PatientEdit.vue'
import PatientNew from './PatientNew.vue'

const { t } = useI18n()
const router = useRouter()
const { downloadData, apiDelete, apiPatch, apiPost } = useApi()
const $q = useQuasar()

const searchParams = ref({
    search: '',
    name: '',
    identifier: '',
    diagnosis: '',
    medical_doctor: '',
    gender: '',
    age_start: '',
    age_end: '',
    ctime_start: '',
    ctime_end: '',
})

const showPatientInfo = ref(false)
const showPatientEdit = ref(false)
const showPatientNew = ref(false)
const infoId = ref(0)
const editId = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dataItems = ref([])
const loading = ref(false)

const linkId = ref(0)
const showLinkSample = ref(false)
const linkSamplePatient = ref({})

const columns = computed(() => [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center', width: 80 },
    { title: t('PatientPageListTableColumnName'), dataIndex: 'name', key: 'name', align: 'center' },
    { title: t('PatientPageListTableColumnSubmissionUnit'), dataIndex: 'inspection_agency', key: 'inspection_agency', align: 'center' },
    { title: t('PatientPageListTableColumnTreatingPhysician'), dataIndex: 'medical_doctor', key: 'medical_doctor', align: 'center' },
    { title: t('PatientPageListTableColumnGender'), dataIndex: 'gender', key: 'gender', align: 'center', width: 80 },
    { title: t('PatientPageListTableColumnAge'), dataIndex: 'age', key: 'age', align: 'center', width: 80 },
    { title: t('PatientPageListTableColumnClinicalDiagnosis'), dataIndex: 'diagnosis', key: 'diagnosis', align: 'center' },
    { title: t('PatientPageListTableColumnTumorStaging'), dataIndex: 'tumor_stage', key: 'tumor_stage', align: 'center' },
    { title: t('PatientPageListTableColumnGeneticDisease'), dataIndex: 'disease', key: 'disease', align: 'center' },
    { title: t('PatientPageListTableColumnFamilyHistory'), dataIndex: 'family_history', key: 'family_history', align: 'center' },
    { title: t('PatientPageListTableColumnSampleSize'), dataIndex: 'sample_count', key: 'sample_count', align: 'center', width: 100 },
    { title: t('PatientPageListTableColumnOperations'), dataIndex: 'operation', key: 'operation', align: 'center', width: 260, fixed: 'right' },
])

const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (ttl) => t('PaginationTotal', { total: ttl }),
    pageSizeOptions: ['10', '20', '50', '100'],
})

const tableLocale = computed(() => ({
    emptyText: t('NoData'),
}))

const tableScroll = computed(() => ({
    y: 'calc(100vh - 400px)',
    x: 1900,
}))

const formatGender = (gender) => {
    const val = String(gender || '').trim().toLowerCase()
    if (val === 'male' || val === 'm' || val === '男') return t('Male')
    if (val === 'female' || val === 'f' || val === '女') return t('Female')
    return gender || '-'
}

const link = (item) => {
    linkId.value = item.id
    showLinkSample.value = true
    linkSamplePatient.value = item
}

const linkSample = (event) => {
    showLinkSample.value = false
    const samples = []
    for (const item of event) {
        samples.push(item.id)
    }
    if (samples.length > 0) {
        for (const sampleid of samples) {
            apiPatch(`/sample/sampledatas/${sampleid}/`, () => {}, {
                patient_id: linkSamplePatient.value.id,
                patient_identifier: linkSamplePatient.value.identifier,
            })
        }
        for (const iterator of linkSamplePatient.value.samplemeta_set || []) {
            if (samples.indexOf(iterator.id) < 0) {
                apiPatch(`/sample/sampledatas/${iterator.id}/`, () => {}, { patient_id: null, patient_identifier: null })
            }
        }
        refreshPage()
    }
}

onMounted(() => {
    loadBackup()
    loadPage()
})

const handleTableChange = (pg) => {
    pagination.value.current = pg.current
    pagination.value.pageSize = pg.pageSize
    currentPage.value = pg.current
    pageSize.value = pg.pageSize
    loadPage()
}

const confirm = (item) => {
    $q.dialog({
        title: t('PatientPageListTableRowBtnDeleteTitle', { count: item.samplemeta_set.length }),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/patient/patients/${item.id}`, () => {
            infoMessage(t('Success'))
            if (dataItems.value.length > 1) {
                const index = dataItems.value.findIndex((patient) => patient.id === item.id)
                if (index !== -1) {
                    total.value -= 1
                    pagination.value.total = total.value
                    dataItems.value.splice(index, 1)
                }
            } else {
                if (currentPage.value > 1) {
                    currentPage.value -= 1
                } else {
                    currentPage.value = 1
                }
                pagination.value.current = currentPage.value
                refreshPage()
            }
        })
    })
}

const edit = (patient) => {
    editId.value = patient.id
    showPatientEdit.value = true
}

const info = (patient) => {
    router.push(`/main/patients/${patient.id}`)
}

const reset = () => {
    searchParams.value = {
        search: '',
        name: '',
        identifier: '',
        diagnosis: '',
        medical_doctor: '',
        gender: '',
        age_start: '',
        age_end: '',
        ctime_start: '',
        ctime_end: '',
    }
    refreshPage()
}

const refreshPage = () => {
    currentPage.value = 1
    pagination.value.current = 1
    loadPage()
}

const backupSearch = () => {
    const data = {
        page: currentPage.value,
        size: pageSize.value,
        searchParams: searchParams.value,
    }
    sessionStorage.setItem('patient-search', JSON.stringify(data))
}

const loadBackup = () => {
    const dataStr = sessionStorage.getItem('patient-search')
    if (dataStr) {
        const data = JSON.parse(dataStr)
        currentPage.value = data.page || 1
        pageSize.value = data.size || 10
        pagination.value.current = currentPage.value
        pagination.value.pageSize = pageSize.value
        searchParams.value = data.searchParams || searchParams.value
    }
}

const loadPage = () => {
    const andFields = {}
    let searchFields = buildModelQuery()
    if (searchParams.value.search) {
        searchFields = buildModelQuery(
            [],
            {
                name__icontains: searchParams.value.search,
                identifier__icontains: searchParams.value.search,
                diagnosis__icontains: searchParams.value.search,
                medical_doctor__icontains: searchParams.value.search,
                gender__icontains: searchParams.value.search,
            },
            'OR'
        )
    }
    if (searchParams.value.age_start) {
        andFields.age__gte = searchParams.value.age_start
    }
    if (searchParams.value.age_end) {
        andFields.age__lte = searchParams.value.age_end
    }
    if (searchParams.value.ctime_start) {
        andFields.create_time__gte = searchParams.value.ctime_start
    }
    if (searchParams.value.ctime_end) {
        andFields.create_time__lte = searchParams.value.ctime_end
    }

    const query = buildModelQuery([searchFields], andFields)
    const params = `?page=${currentPage.value}&size=${pageSize.value}`
    backupSearch()
    loading.value = true
    apiPost(
        `/model_query/patient${params}`,
        (res) => {
            total.value = res.data.count || 0
            pagination.value.total = total.value
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

const downlaodTemplate = () => {
    downloadData('/patient/patients/template', null)
}

const fileSelected = (event) => {
    const data = new FormData()
    data.append('file', event.target.files[0])
    api.post('/patient/patients/upload', data)
        .then((resp) => {
            $q.notify({
                message: t('Success'),
                timeout: 300,
                position: 'center',
            })
            if (resp.length > 0) {
                for (const item of resp) {
                    warnMessage(`"${item.name}" ${t('PatientPageListTableImportDup')}`)
                }
            }
            refreshPage()
        })
        .catch((e) => {
            console.log(e.response.data)
        })
}

const exportData = () => {
    downloadData('/patient/patients/export', null)
}
</script>

<style lang="scss">
.patient-card {
    min-height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
}

.patient-card .bio-data-table {
    flex: 1;
    display: flex;
}

.patient-card .bio-data-table .ant-table-wrapper {
    flex: 1;
}
</style>

<template>
    <q-card class="q-mt-md data-card page-list-card" flat>
        <div>
            <div class="page-list-filter row q-pa-md bio-data-table">
                <q-input
                    class="page-list-filter__field page-list-filter__field--keyword"
                    style="width: 360px"
                    v-model="searchParams.search"
                    filled
                    dense
                    :label="$t('DataListPageSearchInput')"
                    clearable
                />
                <q-select
                    class="page-list-filter__field"
                    style="width: 120px"
                    clearable
                    filled
                    dense
                    v-model="searchParams.nucleic_type"
                    :options="['gDNA', 'cfDNA', 'RNA']"
                    :label="$t('DataListPageSearchTypeOfNucleicAcids')"
                />
                <q-select
                    class="page-list-filter__field"
                    style="width: 120px"
                    clearable
                    filled
                    dense
                    v-model="searchParams.nucleic_level"
                    :options="['A', 'B', 'C', 'D']"
                    :label="$t('DataListPageSearchDegradationGradeOfNucleicAcids')"
                />
                <q-select
                    class="page-list-filter__field"
                    style="width: 120px"
                    clearable
                    filled
                    dense
                    v-model="searchParams.risk"
                    :options="booleanOptions"
                    emit-value
                    map-options
                    :label="$t('DataListPageSearchRiskSequencing')"
                />
                <q-btn
                    color="primary"
                    unelevated
                    :label="$t('DataListPageListSearchEnsure')"
                    icon="search"
                    @click="refreshPage()"
                />
                <q-btn color="grey-7" outline :label="$t('DataListPageListSearchReset')" icon="clear" @click="reset()" />
            </div>
        </div>
        <div>
            <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
                <q-btn
                    v-permission="'createData'"
                    color="primary"
                    unelevated
                    :label="$t('DataListTableBtnNew')"
                    icon="description"
                    @click="showDataNew = true"
                />
                <q-btn color="info" unelevated :label="$t('PageListTableExport')" icon="file_download" @click="exportData()" />
                <q-btn color="positive" unelevated v-permission="'createData'">
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
        <q-card-section>
            <div class="q-pt-sm q-px-md q-pb-md bio-data-table">
                <a-table
                    class="page-grid-table"
                    :data-source="dataItems"
                    :columns="columns"
                    :loading="loading"
                    :pagination="pagination"
                    :scroll="tableScrollY"
                    row-key="id"
                    @change="handleTableChange"
                    :locale="tableLocale"
                    size="small"
                    bordered
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'msre'">
                            {{ record.msre ? $t('Yes') : $t('No') }}
                        </template>
                        <template v-else-if="column.key === 'operation'">
                            <div class="table-operation-buttons">
                                <q-btn
                                    class="table-operation-btn table-operation-btn--primary"
                                    :label="$t('DataListTableColumnBtnDetail')"
                                    @click="info(record)"
                                    flat
                                    dense
                                    no-caps
                                />
                                <q-btn
                                    class="table-operation-btn table-operation-btn--primary"
                                    :label="$t('DataListTableColumnBtnEdit')"
                                    @click="edit(record)"
                                    flat
                                    dense
                                    no-caps
                                />
                                <q-btn
                                    class="table-operation-btn table-operation-btn--secondary"
                                    :label="$t('DataListTableColumnBtnAssociatewithSample')"
                                    @click="link(record)"
                                    flat
                                    dense
                                    no-caps
                                />
                                <q-btn
                                    v-permission="'deleteData'"
                                    class="table-operation-btn table-operation-btn--danger"
                                    :label="$t('DataListTableColumnBtnDelete')"
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
        </q-card-section>
    </q-card>
    <q-dialog persistent v-model="showDataNew">
        <DataNew
            @refresh="refreshPage(); showDataNew = false"
        />
    </q-dialog>
    <q-dialog v-model="showDataInfo">
        <DataInfo :id="infoId" />
    </q-dialog>
    <q-dialog persistent v-model="showDataEdit">
        <DataEdit
            :id="editId"
            @refresh="refreshPage(); showDataEdit = false"
        />
    </q-dialog>
    <q-dialog persistent v-model="showLinkSample">
        <SampleList
            :linkId="linkId"
            @itemSelected="
                linkSample($event)
            "
        />
    </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DataInfo from './DataInfo.vue'
import DataEdit from './DataEdit.vue'
import DataNew from './DataNew.vue'
import SampleList from './SampleList.vue'
import { useApi } from 'src/api/apiBase'
import { infoMessage } from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { buildModelQuery } from 'src/api/modelQueryBuilder'

const { t } = useI18n()
const { downloadData, apiDelete, apiPatch, apiPost } = useApi()

const showDataEdit = ref(false)
const showDataInfo = ref(false)
const showDataNew = ref(false)
const showLinkSample = ref(false)
const infoId = ref(0)
const editId = ref(0)
const linkId = ref(0)

const dataItems = ref([])
const loading = ref(false)

const searchParams = ref({
    search: '',
    risk: undefined,
    nucleic_type: '',
    nucleic_level: '',
})

const $q = useQuasar()

const booleanOptions = computed(() => [
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
        title: t('DataListTableColumnDataDetails'),
        dataIndex: 'project_index',
        key: 'project_index',
        align: 'center',
    },
    {
        title: t('DataListTableColumnLibraryNumber'),
        dataIndex: 'library_number',
        key: 'library_number',
        align: 'center',
    },
    {
        title: t('DataListTableColumnSampleIdentificationNumber'),
        dataIndex: 'sample_identifier',
        key: 'sample_identifier',
        align: 'center',
    },
    {
        title: t('DataListTableColumnDataIdentificationNumber'),
        dataIndex: 'identifier',
        key: 'identifier',
        align: 'center',
    },
    {
        title: t('DataListTableColumnDataNameOfR1'),
        dataIndex: 'fastq1_path',
        key: 'fastq1_path',
        align: 'center',
    },
    {
        title: t('DataListTableColumnDataNameOfR2'),
        dataIndex: 'fastq2_path',
        key: 'fastq2_path',
        align: 'center',
    },
    {
        title: 'MSRE',
        dataIndex: 'msre',
        key: 'msre',
        align: 'center',
        width: 100,
    },
    {
        title: t('DataListTableColumnOperations'),
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
    y: 'calc(100vh - 400px)',
    x: 1320,
}))

const link = async (item) => {
    linkId.value = item.id
    showLinkSample.value = true
}

const linkSample = (event) => {
    apiPatch(
        `/sample/samples/${linkId.value}/`,
        () => {
            showLinkSample.value = false
            refreshPage()
        },
        { sample_meta_id: event.id, sample_identifier: event.identifier }
    )
}

const edit = async (item) => {
    editId.value = item.id
    showDataEdit.value = true
}

const info = async (item) => {
    infoId.value = item.id
    showDataInfo.value = true
}

onMounted(() => {
    loadPage()
})

const handleTableChange = (pg) => {
    pagination.value.current = pg.current
    pagination.value.pageSize = pg.pageSize
    loadPage()
}

const reset = () => {
    searchParams.value = {
        search: '',
        risk: undefined,
        nucleic_type: '',
        nucleic_level: '',
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
                library_input__icontains: searchParams.value.search,
                nucleic_break_type__icontains: searchParams.value.search,
                reagent_box__icontains: searchParams.value.search,
                identifier__icontains: searchParams.value.search,
                sample_identifier__icontains: searchParams.value.search,
                company__icontains: searchParams.value.search,
            },
            'OR'
        )
    }
    if (searchParams.value.nucleic_level) {
        andFields.nucleic_level = searchParams.value.nucleic_level
    }
    if (searchParams.value.nucleic_type) {
        andFields.nucleic_type = searchParams.value.nucleic_type
    }
    if (searchParams.value.risk === true) {
        andFields.risk = true
    }
    if (searchParams.value.risk === false) {
        andFields.risk = false
    }

    const query = buildModelQuery([searchFields], andFields)
    const params = `?page=${pagination.value.current}&size=${pagination.value.pageSize}`

    loading.value = true
    apiPost(
        `/model_query/sample${params}`,
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
        apiDelete(`/sample/samples/${item.id}/`, () => {
            infoMessage(t('Success'))
            if (dataItems.value.length > 1) {
                const index = dataItems.value.findIndex((data) => data.id === item.id)
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
    downloadData('/sample/samples/export', null)
}

const downloadTemplate = () => {
    downloadData('/sample/samples/template/download', null)
}

const fileSelected = (event) => {
    const data = new FormData()
    data.append('file', event.target.files[0])
    api.post('/sample/samples/upload', data)
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
.data-card {
    min-height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
}

.data-card .bio-data-table {
    flex: 1;
    display: flex;
}

.data-card .bio-data-table .ant-table-wrapper {
    flex: 1;
}
</style>

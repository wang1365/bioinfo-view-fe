<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('ReportPageTitle')" />
        <q-separator />
        <q-card class="q-mt-md">
            <q-section>
                <div class="q-gutter-md row items-start q-pa-md">
                    <q-input
                        style="width:350px"
                        v-model="searchParams.search"
                        dense
                        :label="$t('Task')+' ' +$t('Name')"
                        clearable
                    ></q-input>
                    <q-input
                        v-model="searchParams.patient_identifier"
                        dense
                        :label="$t('PatientNewFormPatientIdentificationNumber')"
                        clearable
                    ></q-input>
                    <q-input
                        v-model="searchParams.sample_meta_identifier"
                        dense
                        :label="$t('SampleListTableColumnSampleIdentificationNumber')"
                        clearable
                    ></q-input>
                    <q-input
                        v-model="searchParams.sample_identifier"
                        dense
                        :label="$t('DataNewFormDataIdentificationNumber')"
                        clearable
                    ></q-input>
                    <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                    <q-btn color="primary" :label="$t('Reset')" icon="close" @click="reset()" />
                </div>

                <q-table
                    :rows="rows"
                    :columns="columns"
                    row-key="id"
                    ref="tableRef"
                    v-model:pagination="pagination"
                    @request="onRequest"
                    :rows-per-page-options="[5,15,35,50]"
                >
                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props" class="q-gutter-xs">
                            <a :href="'/igv'+props.row.report_path" download v-if="props.row.status==t('Success')">
                                <q-btn color="primary" :label="$t('Download')" size="sm" />
                            </a>
                            <a>
                                <q-btn @click="onDelete(props.row)" color="red" :label="$t('Delete')" size="sm" />
                            </a>
                        </q-td>
                    </template>
                </q-table>
            </q-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageTitle from 'components/page-title/PageTitle.vue'
import { useApi } from 'src/api/apiBase'
import { useQTable } from 'src/utils/q-table'
import { useQuasar } from 'quasar'
import { infoMessage } from 'src/utils/notify'
import { useI18n } from "vue-i18n";
import { computed } from 'vue'
const { t } = useI18n();

const { tableRef, pagination, rows, refreshPage, loadDataOnMount } = useQTable()
const { apiGet, apiDelete, apiPost } = useApi()
const $q = useQuasar()
const reportUrl = '/reports'
const searchParams = ref({
    search: '',
    patient_identifier: '',
    sample_meta_identifier: '',
    sample_identifier: '',
})

const columns = computed(()=>[
    {
        name: 'id',
        required: false,
        label: 'ID',
        align: 'left',
        field: (row) => row.id,
        format: (val) => `${val}`,
    },
    {
        name: 'task_id',
        label: t('Task'),
        align: 'left',
        field: (row) => row.task?.name,
        format: (val) => `${val}`,
    },
    {
        name: 'patient_id',
        required: true,
        label:t('SampleListTableColumnPatientIdentificationNumber') ,
        align: 'left',
        field: (row) => {
            let result = ''
            if (!row.task || !row.task.samples) return result
            for (let item of row.task?.samples) {
                if (item.sample_meta && item.sample_meta.patient) result += item.sample_meta.patient.identifier + ' '
            }
            return result
        },
        format: (val) => `${val}`,
    },
    {
        name: 'data_id',
        required: true,
        label: t('DataNewFormDataIdentificationNumber'),
        align: 'left',
        field: (row) => {
            let result = ''
            if (!row.task || !row.task.samples) return result
            for (let item of row.task?.samples) {
                result += item.identifier + ' '
            }
            return result
        },
        format: (val) => `${val}`,
    },
    {
        name: 'data_id',
        required: true,
        label: t('SampleListTableColumnSampleIdentificationNumber'),
        align: 'left',
        field: (row) => {
            let result = ''
            if (!row.task || !row.task.samples) return result
            for (let item of row.task?.samples) {
                if (item.sample_meta) result += item.sample_meta.identifier + ' '
            }
            return result
        },
        format: (val) => `${val}`,
    },
    {
        name: 'comment',
        required: true,
        label: t('Comment'),
        align: 'left',
        field: (row) => row.comment,
        format: (val) => `${val}`,
    },
    {
        name: 'comment',
        required: true,
        label: t('Status'),
        align: 'left',
        field: (row) => row.status,
        format: (val) => `${val}`,
    },
    {
        name: 'actions',
        label: t('Actions'),
        required: false,
    },
])

onMounted(() => {
    loadDataOnMount()
    // setInterval(() => refreshPage(), 5000)
})
const reset = ()=>{
    searchParams.value = {
    search: '',
    patient_identifier: '',
    sample_meta_identifier: '',
    sample_identifier: '',
}
refreshPage()
}
const onRequest = (props) => {
    const { page, rowsPerPage } = props.pagination
    let params = `?page=${page}&size=${rowsPerPage}`
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
    apiGet(`/report/report/${params}`, (res) => {
        pagination.value.rowsNumber = res.data.count
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        rows.value = res.data.results
        for (let item of rows.value) {
            item.actions = true
        }
    })
}
const onDownload = (report) => {}
const onDelete = (item) => {
    $q.dialog({
        title: t('Confirm'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/report/report/${item.id}/`, (_) => {
            infoMessage(t('Success'))
            if (rows.value.length > 1) {
                let index = 0
                for (let i = 0; i < rows.value.length; i++) {
                    if (rows.value[i].id === item.id) {
                        index = i
                    }
                }
                pagination.value.rowsNumber-=1
                rows.value.splice(index, 1)
            } else {
                if (pagination.value.page > 1) {
                    pagination.value.page = pagination.value.page - 1
                }else{
                    pagination.value.page = 1
                }
                refreshPage()
            }
        })
    })
}
</script>

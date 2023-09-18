<template>
    <q-page class="q-px-sm q-pt-sm" style="overflow-x: hidden">
        <PageTitle :title="$t('TaskPageListTitle')" />
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div
                style="height: 80px;display: flex; padding-bottom: 5px; padding-top: 5px;justify-content: space-around;justify-items: center;align-items: center; ">
                <q-btn color="white" @click="clickCard(options[0].value)">
                    <div class="text-black" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ total_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusAll') }}</div>
                    </div>
                </q-btn>

                <q-btn color="primary" @click="clickCard(options[1].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-white text-h6 text-center text-bold">{{ taskSummary.running_task_count }}</div>
                        <div class="text-white text-h6 text-center text-bold">{{ $t('TaskPageListStatusRun') }}</div>
                    </div>
                </q-btn>
                <q-btn color="negative" @click="clickCard(options[3].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ taskSummary.failured_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusFail') }}</div>
                    </div>
                </q-btn>
                <q-btn color="secondary" @click="clickCard(options[2].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ taskSummary.pending_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusQueue') }}</div>
                    </div>
                </q-btn>
                <q-btn color="positive" @click="clickCard(options[4].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ taskSummary.finished_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusFinish') }}</div>
                    </div>
                </q-btn>
            </div>
        </div>
        <div class="row q-gutter-sm q-py-xs">
            <q-select style="width:200px" v-model="status" :options="options" stack-label emit-value map-options
                clearable filled @clear="clearSelect()" dense @update:model-value="refreshPage()" />

            <q-input style="width:150px" filled dense clearable v-model="patient"
                :label="`${$t('Patient')} ${$t('Name')}`" />
            <q-input style="width:150px" filled dense clearable v-model="libraryNumber"
                :label="$t('DataListTableColumnLibraryNumber')" />
            <q-input style="width:300px" readonly filled dense @click="showProjectSelect = true"
                :model-value="$t('Project') + ': ' + projectName">
                <template v-slot:prepend>
                    <q-icon class="cursor-pointer" name="search" @click="showProjectSelect = true" />
                </template>
            </q-input>
            <q-btn color="primary" size="sm" :label="$t('Search')" icon="search" @click="refreshPage()" />
            <q-btn color="primary" size="sm" :label="$t('Reset')" icon="clear" @click="reset()" />
        </div>
        <div>
            <q-table :rows="rows" :columns="columns" row-key="id" ref="tableRef" v-model:pagination="pagination"
                     style="max-height: 600px"
                @request="onRequest" :rows-per-page-options="[5, 15, 35, 50]" class="my-sticky-column-table">
                <template v-slot:body-cell-project="props">
                    <q-td :props="props" class="q-gutter-xs">
                        <span v-if="props.row?.project.parent" class="text-bold text-primary q-mr-xs">{{
                            props.row.project.parent.name }}/</span>
                        <span class="text-secondary"> {{ props.row.project.name }} </span>
                    </q-td>
                </template>
                <template v-slot:body-cell-progress="props">
                    <q-td :props="props" class="q-gutter-xs">
                        <q-linear-progress v-if="props.row.status === 'CANCELED'" color="warning" rounded size="10px"
                            :value="props.row.progress / 100" />
                        <q-linear-progress v-if="props.row.status === 'RUNNING'" color="primary" rounded size="10px"
                            :value="props.row.progress / 100" />
                        <q-linear-progress v-if="props.row.status === 'FAILURED'" color="negative" rounded size="10px"
                            :value="props.row.progress / 100" />
                        <q-linear-progress v-if="props.row.status === 'PENDING'" color="secondary" rounded size="10px"
                            :value="props.row.progress / 100" />
                        <q-linear-progress v-if="props.row.status === 'FINISHED'" color="positive" rounded size="10px"
                            :value="props.row.progress / 100" />
                    </q-td>
                </template>
                <template v-slot:body-cell-task_priority="props">
                    <q-td :props="props" class="q-gutter-xs">
                        <template v-if="props.row.priority === 2">
                            <span class="text-red">{{ $t('High') }}</span>
                            <q-btn size="xs" flat icon="south" padding="xs" @click="raisePriority(props.row, 1)" />
                        </template>
                        <template v-else>
                            <span class="text-primary">{{ $t('Normal') }}</span>
                            <q-btn size="xs" flat icon="north" padding="xs" @click="raisePriority(props.row, 2)" />
                        </template>
                    </q-td>
                </template>
                <template v-slot:body-cell-status="props">
                    <q-td :props="props" class="q-gutter-xs">
                        <q-btn v-if="props.row.status === 'FAILURED'" color="red" :label="$t('Failed')" flat padding="xs"
                            icon-right="help" @click="showTaskError(props.row)" size="sm" />
                        <span v-else>{{ $t(statusKey[props.row.status]) }}</span>
                    </q-td>
                </template>
                <template v-slot:body-cell-operate="props">
                    <q-td :props="props" class="q-gutter-xs">
                        <span class="row q-gutter-xs" style="width: 700px;">


                            <q-btn color="secondary" :label="$t('Detail')" icon="visibility" @click="gotoDetail(props.row)"
                                size="sm" padding="xs sm" />
                            <q-btn :disable="props.row.status !== 'FINISHED'" color="info" :label="$t('Result')"
                                icon="query_stats" @click="gotoReport(props.row)" size="sm" padding="xs sm" />
                            <q-btn :disable="props.row.status !== 'FINISHED'" color="positive"
                                :label="$t('TaskPageBtnCustomReport')" icon="query_stats"
                                @click="gotoDefineReport(props.row)" size="sm" padding="xs sm" />
                            <q-btn v-if="props.row.status === 'FINISHED'" color="primary" @click="downlaod(props.row)"
                                size="sm" padding="xs sm">
                                <a style="color:white" :href="downlaod(props.row)" download>
                                    <q-icon name="download" />
                                    {{ $t('Download') }}
                                </a>
                            </q-btn>
                            <q-btn v-if="props.row.status !== 'FINISHED'" :disable="true" color="primary" size="sm"
                                padding="xs sm">
                                <a style="color:white" href="#" download>
                                    <q-icon name="download" />
                                    {{ $t('Download') }}
                                </a>
                            </q-btn>
                            <q-btn :disable="props.row.status !== 'FINISHED' || props.row.deleted_tempdir" color="red"
                                :label="$t('TaskPageBtnDeleteTmpFile')" icon="delete" @click="deleteMiddleFiles(props.row)"
                                size="sm" padding="xs sm"><q-tooltip>{{ $t('TaskPageListTableRowBtnDeleteTmpTip')
                                }}</q-tooltip></q-btn>
                            <q-btn color="red" :label="$t('Delete')" icon="delete" size="sm" @click="confirm(props.row)" />
                        </span>
                    </q-td>
                </template>
            </q-table>
        </div>
        <q-dialog v-model="showProjectSelect">
            <ProjectListVue @itemSelected="projectSelected($event)" />
        </q-dialog>
        <q-dialog v-model="showError">
            <q-card class="q-mt-md popup-selector">
                <div class="popup-content">
                    <div class="popup-content-header">
                        <q-toolbar>
                            <q-toolbar-title>{{ $t('Error') }}</q-toolbar-title>
                            <q-btn flat round dense icon="close" v-close-popup />
                        </q-toolbar>
                    </div>
                </div>
                <p class="q-pa-sm">{{ currentTaskError || "None" }}</p>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useApi } from 'src/api/apiBase'
import PageTitle from 'components/page-title/PageTitle.vue'
import ProjectListVue from './components/ProjectList.vue'
import { useRouter } from 'vue-router'
import { format } from 'src/utils/time'
import { updateTask } from 'src/api/task'
import { infoMessage } from 'src/utils/notify'
import { useQuasar } from 'quasar'
import { useI18n } from "vue-i18n";
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { useQTable } from 'src/utils/q-table'


const { tableRef, pagination, rows, refreshPage, loadDataOnMount } = useQTable()
const onRequest = (props) => {
    const { page, rowsPerPage } = props.pagination
    let params = `?page=${page}&size=${rowsPerPage}`

    if (status.value !== 'ALL') params += `&status=${status.value}`
    if (projectId.value) params += `&project_id=${projectId.value}`
    if (patient.value) params += `&patient=${patient.value}`
    if (libraryNumber.value) params += `&libraryNumber=${libraryNumber.value}`
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    backupSearch()
    apiGet(`/task${params}`, (res) => {
        pagination.value.rowsNumber = res.data.total_count
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        rows.value = res.data.item_list
        for (let item of rows.value) {
            item.actions = true
        }
    })
}

const columns = computed(() => [
    {
        name: 'id',
        required: false,
        label: 'ID',
        align: 'left',
        field: (row) => row.id,
        format: (val) => `${val}`,
        fixed: 'left',
    },
    {
        name: 'name',
        label: t('Name'),
        align: 'left',
        field: (row) => row.name,
        format: (val) => `${val}`,
    },
    {
        name: 'project',
        required: true,
        label: t('Project') + t('TaskPageProjectParent') + '/' + t('TaskPageProjectSelf'),
        align: 'left',
        field: (row) => { row },
        format: (val) => `${val}`,
    },
    {
        name: 'patient',
        required: true,
        label: t('Patient') + t('Name'),
        align: 'left',
        field: (item) => {
            let data = new Set()
            for (const sample of item.sample_data) {
                data.add(sample.patient_name)
            }
            let result = ''
            for (const sample of data) {
                result += `${sample} , `
            }
            return result.replace(/, $/, '')
        },
        format: (val) => `${val}`,
    },
    {
        name: 'sample',
        required: true,
        label: t('Sample'),
        align: 'left',
        field: (item) => {
            let data = new Set()
            for (const sample of item.sample_data) {
                data.add(sample.sample_data_id)
            }
            let result = ''
            for (const sample of data) {
                result += `${sample} , `
            }
            return result.replace(/, $/, '')
        },
        format: (val) => `${val}`,
    },
    {
        name: 'data',
        required: true,
        label: t('Data'),
        align: 'left',
        field: (item) => {
            let data = new Set()
            for (const sample of item.sample_data) {
                data.add(sample.sample_id)
            }
            let result = ''
            for (const sample of data) {
                result += `${sample} , `
            }
            return result.replace(/, $/, '')
        },
        format: (val) => `${val}`,
    },
    {
        name: 'library_number',
        required: true,
        label: t('DataListTableColumnLibraryNumber'),
        align: 'left',
        field: (item) => {
            let data = new Set()
            for (const sample of item.sample_data) {
                data.add(sample.library_number)
            }
            let result = ''
            for (const sample of data) {
                result += `${sample} , `
            }
            return result.replace(/, $/, '')
        },
        format: (val) => `${val}`,
    },
    {
        name: 'flow',
        required: true,
        label: t('Flow'),
        align: 'left',
        field: (row) => row.flow.name,
        format: (val) => `${val}`,
    },
    {
        name: 'progress',
        required: true,
        label: t('Progress'),
        align: 'left',
        field: (row) => row.status,
        format: (val) => `${val}`,
    },
    {
        name: 'status',
        required: true,
        label: t('Status'),
        align: 'center',
        field: (item) => {
            switch (item.status) {
                case 'PENDING':
                    return t('TaskPageListStatusQueue')
                case 'RUNNING':
                    return t('TaskPageListStatusRun')
                case 'FINISHED':
                    return t('TaskPageListStatusFinish')
                case 'FAILURED':
                    return t('TaskPageListStatusFail')
                case 'CANCELED':
                    return t('TaskPageListStatusCancel')
                default:
                    return item.status
            }
        },
        format: (val) => `${val}`,
    },
    {
        name: 'task_priority',
        required: true,
        label: t('TaskPriority'),
        align: 'left',
        field: (row) => row,
        format: (val) => `${val}`,
    },
    // {
    //     name: 'error',
    //     required: true,
    //     label: t('Error'),
    //     align: 'left',
    //     field: (row) => row,
    //     format: (val) => `${val}`,
    // },
    {
        name: 'create_by',
        required: true,
        label: t('CreatedBy'),
        align: 'left',
        field: (item) => item.creator.username,
        format: (val) => `${val}`,
    },
    {
        name: 'create_at',
        required: true,
        label: t('CreatedAt'),
        align: 'left',
        field: (row) => {
            return format(row.create_time)
        },
        format: (val) => `${val}`,
    },
    {
        name: 'operate',
        required: true,
        label: t('TaskPageListTableColumnOperate'),
        align: 'left',
        field: (row) => row.status,
        format: (val) => `${val}`,
    },

])


const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n();

const intId = ref(null)
const $q = useQuasar()
const options = computed(() => [
    { label: t('TaskPageListStatusAll'), value: 'ALL' },
    { label: t('TaskPageListStatusRun'), value: 'RUNNING' },
    { label: t('TaskPageListStatusQueue'), value: 'PENDING' },
    { label: t('TaskPageListStatusFail'), value: 'FAILURED' },
    { label: t('TaskPageListStatusFinish'), value: 'FINISHED' },
    { label: t('TaskPageListStatusCancel'), value: 'CANCELED' },
])

const statusKey = {
    'PENDING': 'TaskPageListStatusQueue',
    'RUNNING': 'TaskPageListStatusRun',
    'FINISHED': 'TaskPageListStatusFinish',
    'FAILURED': 'TaskPageListStatusFail',
    'CANCELED': 'TaskPageListStatusCancel'
}

const status = ref('ALL')
const showProjectSelect = ref(false)
const showError = ref(false)
const currentTaskError = ref('')
const projectId = ref(0)
const projectName = ref('')
const patient = ref('')
const libraryNumber = ref('')
const { apiGet, downloadData, apiDelete } = useApi()
const router = useRouter()
const taskSummary = ref({
    canceled_task_count: 0,
    failured_task_count: 0,
    finished_task_count: 0,
    pending_task_count: 0,
    running_task_count: 0,
})

const total_task_count = computed(() => {
    const ts = taskSummary.value
    return (
        ts.canceled_task_count +
        ts.failured_task_count +
        ts.finished_task_count +
        ts.pending_task_count +
        ts.running_task_count
    )
})
const showTaskError = (item) => {
    showError.value = true
    currentTaskError.value = langCode.value === 'en' ? item.error_message_EN : item.error_message_CN
}

const clickCard = (v) => {
    status.value = v
    refreshPage()
}

const raisePriority = (row, priority) => {
    updateTask(row.id, { priority }).then((res) => {
        const msg = priority === 1 ? '降低' : '提升'
        $q.notify({
            type: "positive",
            message: `${msg} ${t('Success')}`,
        })
        refreshPage()
    })
}

const clearSelect = () => {
    status.value = 'ALL'
    refreshPage()
}
const projectSelected = (event) => {
    console.log(event)
    projectName.value = event.name
    projectId.value = event.id
    showProjectSelect.value = false
    console.log(projectId.value)
    refreshPage()
}
const gotoDetail = (item) => {
    router.push(`/main/tasks/${item.id}`)
}
const gotoReport = (item) => {
    router.push(`/main/tasks/${item.id}/report`)
}
const gotoDefineReport = (item) => {
    router.push(`/main/tasks/${item.id}/define-report`)
}
onMounted(() => {
    loadBackup()
    loadDataOnMount()
    intId.value = setInterval(() => refreshPage(), 60000)
    summary()
})
onUnmounted(() => {
    if (intId.value) {
        clearInterval(intId.value)
    }
})

const reset = () => {
    projectName.value = ''
    projectId.value = ''
    patient.value = ''
    libraryNumber.value = ''
    status.value = 'ALL'
    refreshPage()
}

const backupSearch = () => {
    // const { page, rowsPerPage } = props.pagination
    let data = {
        page: pagination.value.page,
        size: pagination.value.rowsPerPage,
        status: status.value,
        projectId: projectId.value,
        projectName: projectName.value,
        patient: patient.value,
        libraryNumber: libraryNumber.value
    }
    sessionStorage.setItem('task-search', JSON.stringify(data))
    console.log("backup", data)
}
const loadBackup = () => {
    let dataStr = sessionStorage.getItem('task-search')
    if (dataStr) {
        let data = JSON.parse(dataStr)
        pagination.value.rowsPerPage = data.size
        status.value = data.status
        projectId.value = data.projectId
        projectName.value = data.projectName
        patient.value = data.patient
        libraryNumber.value = data.libraryNumber
        console.log("load", data)

    }
}

const confirm = async (item) => {
    $q.dialog({
        title: t('ConfirmToDelete'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/task/${item.id}`, (_) => {
            infoMessage(t('DeleteSuccess'))
            if (rows.value.length > 1) {
                let index = 0
                for (let i = 0; i < rows.value.length; i++) {
                    if (rows.value[i].id === item.id) {
                        index = i
                    }
                }
                rows.value.splice(index, 1)
            } else {
                if (pagination.value.page > 1) {
                    pagination.value.page = pagination.value.page - 1
                } else {
                    pagination.value.page = 1
                }
                refreshPage()
            }
        })
    })
}

const deleteMiddleFiles = async (task) => {
    $q.dialog({
        title: t('TaskPageListTableRowBtnDeleteTmpTitle'),
        message: t('TaskPageListTableRowBtnDeleteTmpComment'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/task/${task.id}/remove_temp/`, (res) => {
            console.log(res)
            infoMessage(t('DeleteSuccess'))
        })
    })
}

const downlaod = (item) => {
    let lang = langCode.value === 'en' ? 'EN' : 'CN'
    let path = '/igv' + item.result_path
    if (lang === 'EN') {
        if (item.result_path_EN) {
            path = '/igv' + item.result_path_EN
        }
    } if (lang === 'CN') {
        if (item.result_path_CN) {
            path = '/igv' + item.result_path_CN
        }
    }
    return path
}
const summary = async () => {
    apiGet(`/task/summary`, (res) => {
        taskSummary.value = res.data
    })
}
</script>
<style lang="sass">
.my-sticky-column-table
  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 100%

  thead tr:first-child th:first-child
    /* bg color is important for th; just specify one */
    background-color: white

  thead tr:nth-child(2),thead th:nth-child(2)
    /* bg color is important for th; just specify one */
    background-color: white


  td:first-child,td:nth-child(2)
    background-color: white

  th:first-child,
  td:first-child
    position: sticky
    left: 0px
    z-index: 2

  th:nth-child(2),
  td:nth-child(2)
    position: sticky
    left: 56px
    z-index: 1
    border-right: 1px solid silver
</style>

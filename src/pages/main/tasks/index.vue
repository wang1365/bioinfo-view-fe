<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('TaskPageListTitle')" />
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div
                style="height: 110px;display: flex; padding-bottom: 15px; padding-top: 15px;justify-content: space-around;justify-items: center;align-items: center; "
            >
                <q-btn color="white" @click="clickCard(options[0])">
                    <div class="text-black" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ total_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{$t('TaskPageListStatusAll')}}</div>
                    </div>
                </q-btn>

                <q-btn color="primary" @click="clickCard(options[1])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-white text-h5 text-center text-bold">{{ taskSummary.running_task_count }}</div>
                        <div class="text-white text-h6 text-center text-bold">{{$t('TaskPageListStatusRun')}}</div>
                    </div>
                </q-btn>
                <q-btn color="negative" @click="clickCard(options[3])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.failured_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{$t('TaskPageListStatusFail')}}</div>
                    </div>
                </q-btn>
                <q-btn color="secondary" @click="clickCard(options[2])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.pending_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{$t('TaskPageListStatusQueue')}}</div>
                    </div>
                </q-btn>
                <q-btn color="positive" @click="clickCard(options[4])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.finished_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{$t('TaskPageListStatusFinish')}}</div>
                    </div>
                </q-btn>
            </div>
        </div>
        <div class="row">
            <div class="row q-gutter-sm">
                <q-select
                    style="width:200px"
                    v-model="status"
                    :options="options"
                    stack-label
                    emit-value
                    map-options
                    clearable
                    filled
                    @clear="clearSelect()"
                    dense
                    @update:model-value="refreshPage()"
                ></q-select>

                <q-input
                    style="width:150px"
                    filled
                    dense
                    clearable
                    v-model="patient"
                    :label="`${$t('Patient')} ${$t('Name')}`"
                />
                <q-input
                    style="width:150px"
                    filled
                    dense
                    clearable
                    v-model="libraryNumber"
                    :label="$t('DataListTableColumnLibraryNumber')"
                />
                <q-input
                    style="width:300px"
                    readonly
                    filled
                    dense
                    @click="showProjectSelect = true"
                    :model-value="$t('Project') +': ' + projectName"
                >
                    <template v-slot:prepend>
                        <q-icon class="cursor-pointer" name="search" @click="showProjectSelect = true" />
                    </template>
                </q-input>
                <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                <q-btn color="primary" :label="$t('Reset')" icon="clear" @click="reset()" />
            </div>
        </div>
        <div class="bio-data-table">
            <table>
                <thead>
                    <tr>
                        <td>ID</td>
                        <td>{{ $t('Name') }}</td>
                        <td>{{$t('Project')}}({{$t('TaskPageProjectParent')}}/{{ $t('TaskPageProjectSelf') }})</td>
                        <td>{{`${$t('Patient')} ${$t('Name')}`}}</td>
                        <td>{{$t('Sample')}} ID</td>
                        <td>{{$t('Data')}} ID</td>
                        <td>{{$t('DataListTableColumnLibraryNumber')}}</td>
                        <td>{{ $t('Flow') }}</td>
                        <td>{{ $t('Progress') }}</td>
                        <td>{{ $t('Status') }}</td>
                        <td>{{$t('TaskPriority')}}</td>
                        <td>{{ $t('Error') }}</td>
                        <td>{{ $t('CreatedBy') }}</td>
                        <td>{{ $t('CreatedAt') }}</td>
                        <td>{{$t('TaskPageListTableColumnOperate')}}</td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="hover" v-for="item in dataItems" v-bind:key="item.id">
                        <td>{{ item.id }}</td>
                        <td>{{ item.name }}</td>
                        <td>
                            <span v-if="item.project.parent" class="text-bold text-primary q-mr-xs"
                                >{{item.project.parent.name}}/</span
                            >
                            <span class="text-secondary"> {{ item.project.name }} </span>
                        </td>
                        <td>{{ readPatient(item) }}</td>
                        <td>{{ readSampleId(item) }}</td>
                        <td>{{ readDataId(item) }}</td>
                        <td>{{ readLibraryNumber(item) }}</td>
                        <td>{{ item.flow.name }}</td>

                        <td>
                            <q-linear-progress
                                v-if="item.status === 'CANCELED'"
                                color="warning"
                                rounded
                                size="10px"
                                :value="item.progress / 100"
                            />
                            <q-linear-progress
                                v-if="item.status === 'RUNNING'"
                                color="primary"
                                rounded
                                size="10px"
                                :value="item.progress / 100"
                            />
                            <q-linear-progress
                                v-if="item.status === 'FAILURED'"
                                color="negative"
                                rounded
                                size="10px"
                                :value="item.progress / 100"
                            />
                            <q-linear-progress
                                v-if="item.status === 'PENDING'"
                                color="secondary"
                                rounded
                                size="10px"
                                :value="item.progress / 100"
                            />
                            <q-linear-progress
                                v-if="item.status === 'FINISHED'"
                                color="positive"
                                rounded
                                size="10px"
                                :value="item.progress / 100"
                            />
                        </td>
                        <td>{{ getItemStatus(item) }}</td>
                        <td>
                            <template v-if="item.priority === 2">
                                <span class="text-red">{{ $t('High') }}</span>
                                <q-btn size="xs" flat icon="south" plain @click="raisePriority(item, 1)" />
                            </template>
                            <template v-else>
                                <span class="text-primary">{{ $t('Normal') }}</span>
                                <q-btn size="xs" flat icon="north" @click="raisePriority(item, 2)" />
                            </template>
                        </td>
                        <td>
                            <q-icon
                                v-if="item.status === 'FAILURED'"
                                class="cursor-pointer"
                                color="red"
                                name="find_in_page"
                                @click="showTaskError(item)"
                                size="sm"
                            />
                        </td>
                        <td>{{ item.creator.username }}</td>
                        <td>{{ format(item.create_time) }}</td>
                        <td class="q-gutter-sm">
                            <q-btn
                                color="secondary"
                                :label="$t('Detail')"
                                icon="visibility"
                                @click="gotoDetail(item)"
                                size="sm"
                            />
                            <q-btn
                                :disable="item.status !== 'FINISHED'"
                                color="info"
                                :label="$t('Result')"
                                icon="query_stats"
                                @click="gotoReport(item)"
                                size="sm"
                            />
                            <q-btn
                                :disable="item.status !== 'FINISHED'"
                                color="positive"
                                :label="$t('TaskPageBtnCustomReport')"
                                icon="query_stats"
                                @click="gotoDefineReport(item)"
                                size="sm"
                            />
                            <a :href="downlaod(item)" download v-if="item.status == 'FINISHED'">
                                <q-btn
                                    :disable="item.status !== 'FINISHED'"
                                    color="primary"
                                    :label="$t('Download')"
                                    icon="download"
                                    @click="downlaod(item)"
                                    size="sm"
                                />
                            </a>
                            <!-- <q-btn
                                :disable="item.status !== 'FINISHED'"
                                color="primary"
                                :label="$t('Download')"
                                icon="download"
                                @click="downlaod(item)"
                                size="sm"
                            /> -->
                            <q-btn
                                :disable="item.status !== 'FINISHED' || item.deleted_tempdir"
                                color="red"
                                :label="$t('TaskPageBtnDeleteTmpFile')"
                                icon="delete"
                                @click="deleteMiddleFiles(item)"
                                size="sm"
                                ><q-tooltip>{{ $t('TaskPageListTableRowBtnDeleteTmpTip') }}</q-tooltip></q-btn
                            >
                            <q-btn color="red" :label="$t('Delete')" icon="delete" size="sm" @click="confirm(item)" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="row q-mt-md">
                <q-space></q-space>
                <PaginatorVue :total="total" :currentPage="currentPage" @pageChange="pageChange($event)" />
            </div>
        </div>
        <q-dialog v-model="showProjectSelect">
            <ProjectListVue @itemSelected="projectSelected($event)" />
        </q-dialog>
        <q-dialog v-model="showError">
            <q-card class="q-mt-md popup-selector">
                <div class="popup-content">
                    <div class="popup-content-header">
                        <q-toolbar>
                            <q-toolbar-title>{{$t('Error')}}</q-toolbar-title>
                            <q-btn flat round dense icon="close" v-close-popup />
                        </q-toolbar>
                    </div>
                </div>
                <p class="q-pa-sm">{{ currentTaskError || "None"}}</p>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useApi } from 'src/api/apiBase'
import PageTitle from 'components/page-title/PageTitle.vue'
import ProjectListVue from './components/ProjectList.vue'
import PaginatorVue from 'src/components/paginator/Paginator.vue'
import { useRouter } from 'vue-router'
import { format } from 'src/utils/time'
import { updateTask } from 'src/api/task'
import { infoMessage } from 'src/utils/notify'
import { useQuasar } from 'quasar'
import { useI18n } from "vue-i18n";
import { globalStore }from 'src/stores/global'
import { storeToRefs } from 'pinia'

const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n();

const autoLoad = ref(false)
const intId = ref(null)
const $q = useQuasar()
const options = computed(()=>[
    { label: t('TaskPageListStatusAll'), value: 'ALL' },
    { label: t('TaskPageListStatusRun'), value: 'RUNNING' },
    { label:t('TaskPageListStatusQueue') , value: 'PENDING' },
    { label:t('TaskPageListStatusFail'), value: 'FAILURED' },
    { label:t('TaskPageListStatusFinish'), value: 'FINISHED' },
    { label: t('TaskPageListStatusCancel'), value: 'CANCELED' },
])
const startTime = ref('')
const endTime = ref('')
const status = ref({ label: t('TaskPageListStatusAll'), value: 'ALL' })
const showProjectSelect = ref(false)
const showError = ref(false)
const currentTaskError=ref('')
const projectId = ref(0)
const projectName = ref('')
const patient = ref('')
const libraryNumber = ref('')
const currentPage = ref(1)
const pageSize = ref(30)
const total = ref(0)
const dataItems = ref([])
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
const showTaskError =(item)=>{
    showError.value=true
    currentTaskError.value= langCode.value === 'en' ? item.error_message_EN : item.error_message_CN
}
const getItemStatus = (item) => {
    switch (item.status) {
        case 'PENDING':
            return  t('TaskPageListStatusQueue')
        case 'RUNNING':
            return t('TaskPageListStatusRun')
        case 'FINISHED':
            return t('TaskPageListStatusFinish')
        case 'FAILURED':
            return t('TaskPageListStatusFail')
        case 'CANCELED':
            return  t('TaskPageListStatusCancel')
        default:
            return item.status
    }
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
        loadPage()
    })
}

const clearSelect = () => {
    status.value = { label: t('TaskPageListStatusAll'), value: 'ALL' }
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
    loadPage()
    summary()
    autoLoadPage()
})
onUnmounted(() => {
    if (intId.value) {
        clearInterval(intId.value)
    }
})

const readPatient = (item) => {
    let data = new Set()
    for (const sample of item.sample_data) {
        data.add(sample.patient_name)
    }
    let result = ''
    for (const sample of data) {
        result += `${sample} , `
    }
    return result.replace(/, $/, '')
}
const readSampleId = (item) => {
    let data = new Set()
    for (const sample of item.sample_data) {
        data.add(sample.sample_id)
    }
    let result = ''
    for (const sample of data) {
        result += `${sample} , `
    }
    return result.replace(/, $/, '')

}
const readDataId = (item) => {
    let data = new Set()
    for (const sample of item.sample_data) {
        data.add(sample.sample_data_id)
    }
    let result = ''
    for (const sample of data) {
        result += `${sample} , `
    }
    return result.replace(/, $/, '')
}
const readLibraryNumber = (item) => {
    let data = new Set()
    for (const sample of item.sample_data) {
        data.add(sample.library_number)
    }
    let result = ''
    for (const sample of data) {
        result += `${sample} , `
    }
    return result.replace(/, $/, '')
}
const reset = () => {
    projectName.value = ''
    projectId.value = ''
    patient.value = ''
    libraryNumber.value = ''
    status.value = { label: t('TaskPageListStatusAll'), value: 'ALL' }
    refreshPage()
}
const autoLoadPage = () => {
    if (intId.value) {
        clearInterval(intId.value)
    }
    intId.value = setInterval(() => {
        loadPage()
    }, 60000);
    autoLoad.value = true
}
const closeAutoLoadPage = () => {
    if (intId.value) {
        clearInterval(intId.value)
    }
    autoLoad.value = false
}


const pageChange = async (event) => {
    currentPage.value = event.currentPage
    pageSize.value = event.pageSize
    loadPage()
}
const refreshPage = async () => {
    currentPage.value = 1
    loadPage()
}
const backupSearch = () => {
    let data = {
        page: currentPage.value,
        size: pageSize.value,
        status: status.value,
        projectId: projectId.value,
        projectName: projectName.value,
        patient: patient.value,
        libraryNumber: libraryNumber.value
    }
    sessionStorage.setItem('task-search', JSON.stringify(data))
}
const loadBackup = () => {
    let dataStr = sessionStorage.getItem('task-search')
    if (dataStr) {
        let data = JSON.parse(dataStr)
        // currentPage.value=data.page
        pageSize.value = data.size
        status.value = data.status
        projectId.value = data.projectId
        projectName.value = data.projectName
        patient.value = data.patient
        libraryNumber.value = data.libraryNumber
    }
}
const loadPage = async () => {
    let params = `?page=${currentPage.value}&size=${pageSize.value}`
    if (status.value.value !== 'ALL') params += `&status=${status.value.value}`
    if (projectId.value) params += `&project_id=${projectId.value}`
    if (patient.value) params += `&patient=${patient.value}`
    if (libraryNumber.value) params += `&libraryNumber=${libraryNumber.value}`
    backupSearch()
    apiGet(`/task${params}`, (res) => {
        total.value = res.data.total_count
        dataItems.value = res.data.item_list
    })
}
const confirm = async (item) => {
    $q.dialog({
        title: t('ConfirmToDelete'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/task/${item.id}`, (_) => {
            infoMessage(t('DeleteSuccess'))
            if (dataItems.value.length > 1) {
                let index = 0
                for (let i = 0; i < dataItems.value.length; i++) {
                    if (dataItems.value[i].id === item.id) {
                        index = i
                    }
                }
                total.value -= 1
                dataItems.value.splice(index, 1)
            } else {
                if (currentPage.value > 1) {
                    currentPage.value = currentPage.value - 1
                } else {
                    currentPage.value = 1
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
            refreshPage()
        })
    })
}

const downlaod = (item) => {
    let lang = langCode.value === 'en' ? 'EN' : 'CN'
    let path = '/igv'+item.result_path
    if(lang==='EN'){
        if(item.result_path_EN){
            path= '/igv'+item.result_path_EN
        }
    }if(lang==='CN'){
        if(item.result_path_CN){
            path= '/igv'+item.result_path_CN
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

<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="任务管理" />
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div
                style="height: 110px;display: flex; padding-bottom: 15px; padding-top: 15px;
                                                                                                               justify-content: space-around;
                                                                                                               justify-items: center;
                                                                                                               align-items: center; ">
                <q-btn color="white" @click="clickCard(options[0])">
                    <div class="text-black" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ total_task_count }}</div>
                        <div class="text-h6 text-center text-bold">全部</div>
                    </div>
                </q-btn>

                <q-btn color="primary" @click="clickCard(options[1])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-white text-h5 text-center text-bold">{{ taskSummary.running_task_count }}</div>
                        <div class="text-white text-h6 text-center text-bold">运行</div>
                    </div>
                </q-btn>
                <q-btn color="negative" @click="clickCard(options[3])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.failured_task_count }}</div>
                        <div class="text-h6 text-center text-bold">失败</div>
                    </div>
                </q-btn>
                <q-btn color="secondary" @click="clickCard(options[2])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.pending_task_count }}</div>
                        <div class="text-h6 text-center text-bold">排队</div>
                    </div>
                </q-btn>
                <!-- <q-btn color="warning" @click="clickCard(options[5])">
                    <div class="text-white" style="width: 7vw">
                        <div
                            class="text-h5 text-center text-bold"
                        >{{ taskSummary.canceled_task_count }}</div>
                        <div class="text-h6 text-center text-bold">取消</div>
                    </div>
                </q-btn> -->
                <q-btn color="positive" @click="clickCard(options[4])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.finished_task_count }}</div>
                        <div class="text-h6 text-center text-bold">完成</div>
                    </div>
                </q-btn>
            </div>
        </div>
        <div class="row">
            <div class="row q-gutter-sm">
                <q-select style="width:200px" v-model="status" :options="options" stack-label clearable filled
                    @clear="clearSelect()" :display-value="`状态: ${status.label}`" dense
                    @update:model-value="refreshPage()"></q-select>

                <q-input style="width:150px" filled dense clearable v-model="patient" label="患者姓名" />
                <q-input style="width:150px" filled dense clearable v-model="libraryNumber" label="文库编号" />
                <q-input style="width:300px" readonly filled dense @click="showProjectSelect = true"
                    :model-value="'所属项目: ' + projectName">
                    <template v-slot:prepend>
                        <q-icon class="cursor-pointer" name="search" @click="showProjectSelect = true" />
                    </template>
                </q-input>
                <q-btn color="primary" label="搜索" icon="search" @click="refreshPage()" />
                <q-btn color="primary" label="重置" icon="clear" @click="reset()" />
                <!-- <q-btn color="primary" v-if="!autoLoad" @click="autoLoadPage()">自动刷新</q-btn> -->
                <!-- <q-btn color="red" v-if="autoLoad" @click="closeAutoLoadPage">停止自动刷新</q-btn> -->
            </div>
        </div>
        <div class="bio-data-table">
            <table>
                <thead>
                    <tr>
                        <!-- <td>
                            <q-checkbox v-model="selected" color="negative" />
                        </td>-->
                        <td>ID</td>
                        <td>名称</td>
                        <td>项目(上级/当前)</td>
                        <td>患者姓名</td>
                        <td>样本ID</td>
                        <td>数据ID</td>
                        <td>文库编号</td>
                        <td>分析流程</td>
                        <td>进度</td>
                        <td>状态</td>
                        <td>优先级</td>
                        <td>错误信息</td>
                        <td>创建者</td>
                        <td>创建时间</td>
                        <td>操作</td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="hover" v-for="item in dataItems" v-bind:key="item.id">
                        <!-- <td class="q-pa-md text-center">
                            <q-checkbox
                                v-model="item.selected"
                                color="negative"
                            />
                        </td>-->

                        <td>{{ item.id }}</td>
                        <td>{{ item.name }}</td>
                        <td>
                            <span v-if="item.project.parent" class="text-bold text-primary q-mr-xs">{{
                                item.project.parent.name

                            }}/</span>
                            <span class="text-secondary"> {{ item.project.name }} </span>
                        </td>
                        <td>...</td>
                        <td>...</td>
                        <td>...</td>
                        <td>...</td>
                        <td>{{ item.flow.name }}</td>

                        <td>
                            <q-linear-progress v-if="item.status === 'CANCELED'" color="warning" rounded size="10px"
                                :value="item.progress / 100" />
                            <q-linear-progress v-if="item.status === 'RUNNING'" color="primary" rounded size="10px"
                                :value="item.progress / 100" />
                            <q-linear-progress v-if="item.status === 'FAILURED'" color="negative" rounded size="10px"
                                :value="item.progress / 100" />
                            <q-linear-progress v-if="item.status === 'PENDING'" color="secondary" rounded size="10px"
                                :value="item.progress / 100" />
                            <q-linear-progress v-if="item.status === 'FINISHED'" color="positive" rounded size="10px"
                                :value="item.progress / 100" />
                        </td>
                        <td>{{ getItemStatus(item) }}</td>
                        <td>
                            <template v-if="item.priority === 2">
                                <span class="text-red">优先</span>
                                <q-btn size="xs" flat icon="south" plain @click="raisePriority(item, 1)" />
                            </template>
                            <template v-else>
                                <span class="text-primary">普通</span>
                                <q-btn size="xs" flat icon="north" @click="raisePriority(item, 2)" />
                            </template>
                        </td>
                        <td>
                            <q-icon v-if="item.status === 'FAILURED'" class="cursor-pointer" color="red" name="find_in_page"
                                @click="showError = true; currentTaskError = item.error_message" size="sm" />
                        </td>
                        <td>{{ item.creator.username }}</td>
                        <td>{{ format(item.create_time) }}</td>
                        <td class="q-gutter-sm">
                            <q-btn color="secondary" label="详情" icon="visibility" @click="gotoDetail(item)" size="sm" />
                            <q-btn :disable="item.status !== 'FINISHED'" color="info" label="结果" icon="query_stats"
                                @click="gotoReport(item)" size="sm" />
                            <q-btn :disable="item.status !== 'FINISHED'" color="positive" label="定制报告" icon="query_stats"
                                @click="gotoDefineReport(item)" size="sm" />
                            <q-btn :disable="item.status !== 'FINISHED'" color="primary" label="下载" icon="download"
                                @click="downlaod(item)" size="sm" />
                            <q-btn :disable="item.status !== 'FINISHED' || item.deleted_tempdir" color="red" label="删除中间文件"
                                icon="delete" @click="deleteMiddleFiles(item)"
                                size="sm"><q-tooltip>仅会删除任务产生的中间文件,释放空间,不会影响任务结果展示.</q-tooltip></q-btn>
                            <q-btn color="red" label="删除" icon="delete" size="sm" @click="confirm(item)" />
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
                            <q-toolbar-title>错误信息</q-toolbar-title>
                            <q-btn flat round dense icon="close" v-close-popup />
                        </q-toolbar>
                    </div>
                </div>
                <pre>
                                                                                                                                                                                                {{ currentTaskError || "无"
                                                                                                                                                                                                }}
                                                                                                                                                                                            </pre>
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

const autoLoad = ref(false)
const intId = ref(null)
const $q = useQuasar()
const options = ref([
    { label: '全部', value: 'ALL' },
    { label: '运行中', value: 'RUNNING' },
    { label: '排队', value: 'PENDING' },
    { label: '失败', value: 'FAILURED' },
    { label: '完成', value: 'FINISHED' },
    { label: '取消', value: 'CANCELED' },
])
const startTime = ref('')
const endTime = ref('')
const status = ref({ label: '全部', value: 'ALL' })
const showProjectSelect = ref(false)
const showError = ref(false)
const projectId = ref(0)
const projectName = ref('')
const patient = ref('')
const libraryNumber = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
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

const getItemStatus = (item) => {
    switch (item.status) {
        case 'PENDING':
            return '排队中'
        case 'RUNNING':
            return '运行中'
        case 'FINISHED':
            return '完成'
        case 'FAILURED':
            return '失败'
        case 'CANCELED':
            return '取消'
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
            message: `任务优先级已${msg}`,
        })
        loadPage()
    })
}

const clearSelect = () => {
    status.value = { label: '全部', value: 'ALL' }
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

const reset = () => {
    projectName.value = ''
    projectId.value = ''
    patient.value = ''
    libraryNumber.value = ''
    status.value = { label: '全部', value: 'ALL' }
    refreshPage()
}
const autoLoadPage = () => {
    if (intId.value) {
        clearInterval(intId.value)
    }
    intId.value = setInterval(() => {
        loadPage()
    }, 5000);
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
    if (status.value.label !== '全部') params += `&status=${status.value.value}`
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
        title: '确认删除任务吗?',
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/task/${item.id}`, (_) => {
            infoMessage("删除成功")
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
        title: '确认删除任务的中间文件吗?',
        message: '仅会删除任务产生的中间文件,释放空间,不会影响任务结果展示.',
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/task/${task.id}/remove_temp/`, (res) => {
            console.log(res)
            infoMessage('删除成功')
            refreshPage()
        })
    })
}

const downlaod = (item) => {
    downloadData(`/task/download/${item.id}`, null)
}
const summary = async () => {
    apiGet(`/task/summary`, (res) => {
        taskSummary.value = res.data
    })
}
</script>

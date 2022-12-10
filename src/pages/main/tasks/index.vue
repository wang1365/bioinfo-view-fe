<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="任务管理" />
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div style="
                        height: 110px;
                        display: flex; padding-bottom: 15px; padding-top: 15px;
                        justify-content: space-around;
                        justify-items: center;
                        align-items: center;
                                    ">
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
                <q-btn color="warning" @click="clickCard(options[5])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.canceled_task_count }}</div>
                        <div class="text-h6 text-center text-bold">取消</div>
                    </div>
                </q-btn>
                <q-btn color="positive" @click="clickCard(options[4])">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h5 text-center text-bold">{{ taskSummary.finished_task_count }}</div>
                        <div class="text-h6 text-center text-bold">完成</div>
                    </div>
                </q-btn>
            </div>
        </div>
        <div class="row">
            <div class="col-2"></div>
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div class="row q-gutter-sm">
                    <div class="col-2">
                        <q-select v-model="status" :options="options" stack-label clearable filled
                            @clear="clearSelect()" :display-value="`状态: ${status.label}`" dense
                            @update:model-value="refreshPage()"></q-select>
                    </div>
                    <div class="col-4 q-pl-sm">
                        <q-input readonly filled dense @click="showProjectSelect = true"
                            :model-value="'所属项目: ' + projectName">
                            <template v-slot:prepend>
                                <q-icon class="cursor-pointer" name="search" @click="showProjectSelect = true" />
                            </template>
                            <template v-slot:append>
                                <q-icon class="cursor-pointer" name="backspace" @click="
    projectName = '';
projectId = '';
refreshPage();
                                " />
                            </template>
                        </q-input>
                    </div>
                </div>
            </div>
            <div class="col-2"></div>
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
                        <td>项目</td>
                        <td>分析流程</td>
                        <td>进度</td>
                        <td>状态</td>
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
                        <td>{{ item.project.name }}</td>
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
                            <q-icon v-if="item.status === 'FAILURED'" class="cursor-pointer" color="red"
                                name="find_in_page" @click="showError = true; currentTaskError = item.error_message"
                                size="sm" />
                        </td>
                        <td>{{ item.creator.username }}</td>
                        <td>{{ format(item.create_time) }}</td>
                        <td class="q-gutter-sm">
                            <q-btn color="secondary" label="详情" icon="visibility" @click="gotoDetail(item)" size="sm" />
                            <q-btn :disable="item.status !== 'FINISHED'" color="info" label="结果" icon="query_stats"
                                                                         @click="gotoReport(item)" size="sm" />
                             <q-btn :disable="item.status !== 'FINISHED'" color="info" label="定制报告" icon="query_stats"
                                @click="gotoDefineReport(item)" size="sm" />
                            <q-btn :disable="item.status !== 'FINISHED'" color="primary" label="下载" icon="download"
                                @click="downlaod(item)" size="sm" />
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
                {{ currentTaskError || "无" }}
            </pre>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from 'src/api/apiBase'
import PageTitle from 'components/page-title/PageTitle.vue'
import ProjectListVue from './components/ProjectList.vue'
import PaginatorVue from 'src/components/paginator/Paginator.vue'
import { useRouter } from 'vue-router'
import { format } from 'src/utils/time'

import { useQuasar } from 'quasar'
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
    loadPage()
    summary()
})

const pageChange = async (event) => {
    currentPage.value = event.currentPage
    pageSize.value = event.pageSize
    loadPage()
}
const refreshPage = async () => {
    currentPage.value = 1
    loadPage()
}
const loadPage = async () => {
    let params = `?page=${currentPage.value}&size=${pageSize.value}`
    if (status.value.label !== '全部') params += `&status=${status.value.value}`
    if (projectId.value) params += `&project_id=${projectId.value}`

    apiGet(`/task${params}`, (res) => {
        total.value = res.data.total_count
        dataItems.value = res.data.item_list
    })
}
const confirm = async (task) => {
    $q.dialog({
        title: '确认删除吗?',
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/task/${task.id}`, (_) => {
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

<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('DashboardTitle')" />

        <div class="q-pa-md row items-start q-gutter-md" style="justify-content: space-around">
            <q-card class="my-card">
                <q-card-section class="text-primary text-h5 text-bold">{{weeklyDiskUsage}}</q-card-section>

                <q-card-section class="desc">{{$t('DashboardDiskUseWeek')}}</q-card-section>
            </q-card>
            <q-card class="my-card">
                <q-card-section class="text-secondary text-h5 text-bold">
                    <span class="text-primary">{{ weeklyTaskStats.success }}</span>
                    {{ ` / ${weeklyTaskStats.total}` }}
                </q-card-section>
                <q-card-section class="desc">{{$t('DashboardTaskWeek')}}</q-card-section>
            </q-card>
            <q-card class="my-card">
                <q-card-section class="text-primary text-h5 text-bold">
                    <span>{{samples.thisWeek}}</span>
                    /
                    <span>{{samples.total}}</span>
                </q-card-section>
                <q-card-section class="desc">{{$t('DashboardNewTask')}}</q-card-section>
            </q-card>
            <q-card class="my-card">
                <q-card-section class="text-secondary text-h5 text-bold">
                    {{reports.thisWeek}}
                    /
                    <span>{{reports.total}}</span>
                </q-card-section>
                <q-card-section class="desc">{{$t('DashboardReportWeek')}}</q-card-section>
            </q-card>
        </div>
        <q-separator />
        <q-card class="my-card" flat bordered>
            <q-card-section style="padding: 0">
                <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
                    <div class="col-lg-4 col-md-12 col-sm-12 col-xs-12">
                        <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
                            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <LineChart2 />
                            </div>
                            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <UserTable />
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-8 col-md-12 col-sm-12 col-xs-12">
                        <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
                            <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                <PieChart :used="resource.mem_used" :total="resource.mem_total" />
                            </div>
                            <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                <PieChart2 :used="resource.disk_used" :total="resource.disk_total" />
                            </div>
                            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <PageTitle :title="$t('Task')" />
                                <div
                                    style="
                                        height: 300px;
                                        display: flex;
                                        justify-content: space-around;
                                        justify-items: center;
                                        align-items: center;
                                    "
                                >
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-primary text-h5 text-bold"
                                            >{{ taskStats.running_task_count }}</q-card-section
                                        >
                                        <q-card-section class="desc">{{ $t('TaskPageListStatusRun') }}</q-card-section>
                                    </q-card>
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-negative text-h5 text-bold"
                                            >{{ taskStats.failured_task_count }}</q-card-section
                                        >
                                        <q-card-section class="desc">{{ $t('TaskPageListStatusFail') }}</q-card-section>
                                    </q-card>
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-secondary text-h5 text-bold"
                                            >{{ taskStats.pending_task_count }}</q-card-section
                                        >
                                        <q-card-section
                                            class="desc"
                                            >{{ $t('TaskPageListStatusQueue') }}</q-card-section
                                        >
                                    </q-card>
                                    <q-card class="my-card">
                                        <q-card-section
                                            class="text-warning text-h5 text-bold"
                                            >{{ taskStats.max_task }}</q-card-section
                                        >
                                        <q-card-section class="desc">
                                            {{ $t('LimitTo') }}
                                        </q-card-section>
                                    </q-card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>
        <q-separator />
        <q-card class="my-card" flat>
            <q-card-section style="padding: 0"></q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PieChart from './charts/PieChart.vue'
import PieChart2 from './charts/PieChart2.vue'
import LineChart2 from './charts/LineChart2.vue'
import LineChart from './charts/LineChart.vue'
import PageTitle from 'src/components/page-title/PageTitle.vue'
import UserTable from './UserTable.vue'
import { getWeeklySummary, getSummary } from 'src/api/task'
import { listConfig } from 'src/api/config'
import { getWeeklyDiskUsage } from 'src/api/resource'
import { useApi } from 'src/api/apiBase'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import { globalStore } from 'src/stores/global'
import { useRouter }from 'vue-router'

const store = globalStore()
const router = useRouter()

const { apiGet, apiPost } = useApi()
const weeklyDiskUsage = ref('0 T')
const weeklyTaskStats = ref({
    success: 0,
    total: 0,
})

const resource = ref({
    disk_total: 0,
    disk_used: 0,
    mem_total: 0,
    mem_used: 0,
})
const taskStats = ref({
    canceled_task_count: 0,
    failured_task_count: 0,
    finished_task_count: 0,
    pending_task_count: 0,
    running_task_count: 0,
    max_task: null,
})

const samples = ref({
    thisWeek: 0,
    total: 0,
})
const reports = ref({
    thisWeek: 0,
    total: 0,
})

const week = () => {
    let now = new Date()
    let date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let startDate = new Date(date.getTime() - 3600 * 24 * 1000 * (now.getDay()-1))
    let endDate = new Date(now.getTime()+3600*24*1000)
    return {
        start: `${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()} 00:00:00`,
        end: `${endDate.getFullYear()}-${endDate.getMonth()+1}-${endDate.getDate()} 00:00:00`,
    }
}
onMounted(() => {
    // 普通用户，重定向到项目页面
    if (store.currentUser.role_list.includes('normal')) {
        router.push('/main/projects')
        return
    }

    init()
})

const init = () => {
    // 周任务统计
    getWeeklySummary().then((res) => {
        weeklyTaskStats.value = {
            success: res.finished_task_count,
            total:
                res.canceled_task_count +
                res.failured_task_count +
                res.finished_task_count +
                res.pending_task_count +
                res.running_task_count,
        }
    })

    // 所有任务统计
    getSummary().then((res) => {
        taskStats.value = {
            canceled_task_count: res.canceled_task_count,
            failured_task_count: res.failured_task_count,
            finished_task_count: res.finished_task_count,
            pending_task_count: res.pending_task_count,
            running_task_count: res.running_task_count,
        }

        // 系统配置
        listConfig().then((res) => {
            for (let config of res.results) {
                if (config.name === 'max_task') {
                    taskStats.value.max_task = config.value
                }
            }
        })
    })

    // 每周磁盘使用统计
    getWeeklyDiskUsage().then((res) => {
        let v = res
        let unit = 'M'
        // T
        if (v > 1024 * 1024) {
            v = (v / 1024 / 1024).toFixed(2)
            unit = 'T'
        } else if (v > 1024) {
            v = (v / 1024).toFixed(2)
            unit = 'G'
        } else {
            v = v.toFixed(0)
        }

        weeklyDiskUsage.value = v + ' ' + unit
    })
    // 获取磁盘和内存使用情况
    apiGet('/resource_limit/resource_limits/resource', (res) => {
        resource.value.disk_total = (res.data.disk.all / 1024 / 1024).toFixed(3)
        resource.value.disk_used = (res.data.disk.used / 1024 / 1024).toFixed(3)
        resource.value.mem_total = (res.data.memory.all / 1024).toFixed(0)
        resource.value.mem_used = (res.data.memory.used / 1024).toFixed(0)
    })
    // 获取本周样本数
    let { start, end } = week()
    let query = buildModelQuery([], { create_time__gte: start })

    // 获取本周报告数

    apiPost(
        '/model_query/sample_meta?size=1',
        (res) => {
            samples.value.thisWeek = res.data.count
        },
        query
    )
    query = buildModelQuery([], { create_time__lte: end })
    apiPost(
        '/model_query/sample_meta?size=1',
        (res) => {
            samples.value.total = res.data.count
        },
        query
    )
    query = buildModelQuery([], { create_time__gte: start, status: 3 })
    apiPost(
        '/model_query/task?page_size=1',
        (res) => {
            reports.value.thisWeek = res.data.count
        },
        query
    )
    query = buildModelQuery([], { create_time__lte: end, status: 3 })
    apiPost(
        '/model_query/task?page_size=1',
        (res) => {
            reports.value.total = res.data.count
        },
        query
    )
}
</script>

<style lang="scss">
.title {
    position: sticky;
    top: -80;
    left: 0;
    font-size: 1.5em;
}

.my-card {
    text-align: center;

    .title {
        font-size: 1.5em;
        font-weight: bold;
    }

    .desc {
        color: gray;
    }
}

.counter {
    display: flex;
}
</style>

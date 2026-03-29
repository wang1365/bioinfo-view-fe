<template>
    <q-page class="dashboard-page">
        <section class="dashboard-hero">
            <div class="dashboard-hero__title">{{ $t('DashboardOverviewTitle') }}</div>
        </section>

        <section class="stats-grid">
            <q-card class="summary-card summary-card--primary" flat>
                <q-card-section class="summary-card__section">
                    <div class="summary-card__icon"><q-icon name="storage" /></div>
                    <div class="summary-card__content">
                        <div class="summary-card__label">{{ $t('DashboardDiskUseWeek') }}</div>
                        <div class="summary-card__value">{{ weeklyDiskUsage }}</div>
                    </div>
                </q-card-section>
            </q-card>
            <q-card class="summary-card summary-card--blue" flat>
                <q-card-section class="summary-card__section">
                    <div class="summary-card__icon"><q-icon name="checklist" /></div>
                    <div class="summary-card__content">
                        <div class="summary-card__label">{{ $t('DashboardTaskWeek') }}</div>
                        <div class="summary-card__value">
                            <span>{{ weeklyTaskStats.success }}</span>
                            <span class="summary-card__divider">/</span>
                            <span>{{ weeklyTaskStats.total }}</span>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
            <q-card class="summary-card summary-card--teal" flat>
                <q-card-section class="summary-card__section">
                    <div class="summary-card__icon"><q-icon name="biotech" /></div>
                    <div class="summary-card__content">
                        <div class="summary-card__label">{{ $t('DashboardNewTask') }}</div>
                        <div class="summary-card__value">
                            <span>{{ samples.thisWeek }}</span>
                            <span class="summary-card__divider">/</span>
                            <span>{{ samples.total }}</span>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
            <q-card class="summary-card summary-card--amber" flat>
                <q-card-section class="summary-card__section">
                    <div class="summary-card__icon"><q-icon name="description" /></div>
                    <div class="summary-card__content">
                        <div class="summary-card__label">{{ $t('DashboardReportWeek') }}</div>
                        <div class="summary-card__value">
                            <span>{{ reports.thisWeek }}</span>
                            <span class="summary-card__divider">/</span>
                            <span>{{ reports.total }}</span>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </section>

        <section class="dashboard-grid">
            <div class="dashboard-grid__left">
                <LineChart2 />
                <UserTable />
            </div>

            <div class="dashboard-grid__right">
                <div class="dashboard-grid__charts">
                    <PieChart :used="resource.mem_used" :total="resource.mem_total" />
                    <PieChart2 :used="resource.disk_used" :total="resource.disk_total" />
                </div>

                <q-card class="task-panel" flat>
                    <q-card-section class="task-panel__header">
                        <div>
                            <div class="panel-title">{{ $t('Task') }}</div>
                            <div class="panel-subtitle">{{ $t('DashboardTaskPanelSubtitle') }}</div>
                        </div>
                    </q-card-section>
                    <q-card-section class="task-grid">
                        <q-card class="task-stat-card task-stat-card--run" flat>
                            <q-card-section>
                                <div class="task-stat-card__top">
                                    <div class="task-stat-card__icon"><q-icon name="play_arrow" /></div>
                                    <div class="task-stat-card__label">{{ $t('TaskPageListStatusRun') }}</div>
                                </div>
                                <div class="task-stat-card__value">{{ taskStats.running_task_count }}</div>
                            </q-card-section>
                        </q-card>
                        <q-card class="task-stat-card task-stat-card--fail" flat>
                            <q-card-section>
                                <div class="task-stat-card__top">
                                    <div class="task-stat-card__icon"><q-icon name="close" /></div>
                                    <div class="task-stat-card__label">{{ $t('TaskPageListStatusFail') }}</div>
                                </div>
                                <div class="task-stat-card__value">{{ taskStats.failured_task_count }}</div>
                            </q-card-section>
                        </q-card>
                        <q-card class="task-stat-card task-stat-card--queue" flat>
                            <q-card-section>
                                <div class="task-stat-card__top">
                                    <div class="task-stat-card__icon"><q-icon name="schedule" /></div>
                                    <div class="task-stat-card__label">{{ $t('TaskPageListStatusQueue') }}</div>
                                </div>
                                <div class="task-stat-card__value">{{ taskStats.pending_task_count }}</div>
                            </q-card-section>
                        </q-card>
                        <q-card class="task-stat-card task-stat-card--limit" flat>
                            <q-card-section>
                                <div class="task-stat-card__top">
                                    <div class="task-stat-card__icon"><q-icon name="tune" /></div>
                                    <div class="task-stat-card__label">{{ $t('LimitTo') }}</div>
                                </div>
                                <div class="task-stat-card__value">{{ taskStats.max_task }}</div>
                            </q-card-section>
                        </q-card>
                    </q-card-section>
                </q-card>
            </div>
        </section>
    </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { globalStore } from 'src/stores/global'
import { useApi } from 'src/api/apiBase'
import { listConfig } from 'src/api/config'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import { getWeeklyDiskUsage } from 'src/api/resource'
import { getSummary, getWeeklySummary } from 'src/api/task'
import PieChart from './charts/PieChart.vue'
import PieChart2 from './charts/PieChart2.vue'
import LineChart2 from './charts/LineChart2.vue'
import UserTable from './UserTable.vue'

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
    let startDate = new Date(date.getTime() - 3600 * 24 * 1000 * (now.getDay() - 1))
    let endDate = new Date(now.getTime() + 3600 * 24 * 1000)
    return {
        start: `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()} 00:00:00`,
        end: `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()} 00:00:00`,
    }
}

onMounted(() => {
    if (store.currentUser.role_list.includes('normal')) {
        router.push('/main/projects')
        return
    }

    init()
})

const init = () => {
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

    getSummary().then((res) => {
        taskStats.value = {
            canceled_task_count: res.canceled_task_count,
            failured_task_count: res.failured_task_count,
            finished_task_count: res.finished_task_count,
            pending_task_count: res.pending_task_count,
            running_task_count: res.running_task_count,
        }

        listConfig().then((configRes) => {
            for (const config of configRes.results) {
                if (config.name === 'max_task') {
                    taskStats.value.max_task = config.value
                }
            }
        })
    })

    getWeeklyDiskUsage().then((res) => {
        let value = res
        let unit = 'M'

        if (value > 1024 * 1024) {
            value = (value / 1024 / 1024).toFixed(2)
            unit = 'T'
        } else if (value > 1024) {
            value = (value / 1024).toFixed(2)
            unit = 'G'
        } else {
            value = value.toFixed(0)
        }

        weeklyDiskUsage.value = `${value} ${unit}`
    })

    apiGet('/resource_limit/resource_limits/resource', (res) => {
        resource.value.disk_total = (res.data.disk.all / 1024 / 1024).toFixed(3)
        resource.value.disk_used = (res.data.disk.used / 1024 / 1024).toFixed(3)
        resource.value.mem_total = (res.data.memory.all / 1024).toFixed(0)
        resource.value.mem_used = (res.data.memory.used / 1024).toFixed(0)
    })

    let { start, end } = week()
    let query = buildModelQuery([], { create_time__gte: start })

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

<style lang="scss" scoped>
.dashboard-page {
    position: relative;
    isolation: isolate;
    min-height: 100%;
    padding: 18px 18px 14px;
    background:
        radial-gradient(circle at 10% 0%, rgba(54, 209, 196, 0.25), transparent 38%),
        radial-gradient(circle at 92% 12%, rgba(82, 138, 255, 0.28), transparent 40%),
        radial-gradient(circle at 58% 100%, rgba(71, 166, 255, 0.16), transparent 42%),
        linear-gradient(145deg, #f3f9ff 0%, #eaf4ff 42%, #e8f3ff 100%);
    overflow: hidden;
}

.dashboard-page::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
        radial-gradient(circle at 16% 24%, rgba(69, 134, 243, 0.22) 0 2px, transparent 3px),
        radial-gradient(circle at 22% 32%, rgba(57, 210, 188, 0.2) 0 2px, transparent 3px),
        radial-gradient(circle at 28% 41%, rgba(69, 134, 243, 0.2) 0 2px, transparent 3px),
        radial-gradient(circle at 72% 26%, rgba(69, 134, 243, 0.22) 0 2px, transparent 3px),
        radial-gradient(circle at 78% 34%, rgba(57, 210, 188, 0.2) 0 2px, transparent 3px),
        radial-gradient(circle at 84% 42%, rgba(69, 134, 243, 0.2) 0 2px, transparent 3px),
        linear-gradient(120deg, rgba(78, 142, 245, 0.14) 0 1px, transparent 1px) 0 0 / 280px 220px,
        linear-gradient(120deg, rgba(78, 142, 245, 0.14) 0 1px, transparent 1px) 8px 32px / 280px 220px;
    opacity: 0.58;
}

.dashboard-page::after {
    content: '';
    position: absolute;
    inset: -180px -180px -120px;
    pointer-events: none;
    z-index: 0;
    background:
        radial-gradient(circle at 14% 10%, rgba(95, 152, 255, 0.2), transparent 36%),
        radial-gradient(circle at 84% 18%, rgba(73, 207, 191, 0.18), transparent 33%),
        radial-gradient(circle at 52% 70%, rgba(95, 152, 255, 0.12), transparent 40%);
    filter: blur(2px) saturate(112%);
    animation: dashboard-bio-drift 12s ease-in-out infinite alternate;
}

.dashboard-page > * {
    position: relative;
    z-index: 1;
}

@keyframes dashboard-bio-drift {
    0% {
        transform: translate3d(0, 0, 0) scale(1.01);
    }
    100% {
        transform: translate3d(-12px, -8px, 0) scale(1.04);
    }
}

.dashboard-hero {
    display: flex;
    justify-content: center;
    margin-bottom: 18px;
}

.dashboard-hero__title {
    position: relative;
    min-width: 420px;
    padding: 12px 44px;
    border-radius: 14px;
    border: 1px solid rgba(90, 142, 234, 0.34);
    background: linear-gradient(92deg, rgba(239, 247, 255, 0.92) 0%, rgba(252, 254, 255, 0.98) 48%, rgba(236, 246, 255, 0.92) 100%);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.92),
        0 10px 30px rgba(31, 82, 170, 0.14),
        0 0 0 1px rgba(122, 166, 240, 0.18);
    color: #0f3f86;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.32em;
    text-align: center;
    text-shadow: 0 0 16px rgba(66, 133, 244, 0.2);
    user-select: none;
    -webkit-user-select: none;
}

.dashboard-hero__title::before,
.dashboard-hero__title::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 64px;
    height: 2px;
    background: linear-gradient(90deg, rgba(66, 133, 244, 0), rgba(66, 133, 244, 0.9));
}

.dashboard-hero__title::before {
    left: -40px;
    transform: translateY(-50%);
}

.dashboard-hero__title::after {
    right: -40px;
    transform: translateY(-50%) scaleX(-1);
}

.dashboard-hero__title::selection {
    background: transparent;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 6px;
    margin-bottom: 24px;
}

.summary-card {
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(245, 250, 255, 0.86) 100%);
    border: 1px solid rgba(176, 201, 235, 0.58);
    backdrop-filter: blur(10px);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        0 12px 28px rgba(21, 64, 136, 0.12);
}

.summary-card__section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
}

.summary-card__icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    background: rgba(47, 111, 237, 0.1);
    color: #2f6fed;
}

.summary-card__content {
    min-width: 0;
}

.summary-card__label {
    color: #73829b;
    font-size: 0.78rem;
    line-height: 1.35;
}

.summary-card__value {
    margin-top: 4px;
    font-size: 1.15rem;
    line-height: 1.1;
    font-weight: 700;
    color: #172033;
}

.summary-card__divider {
    margin: 0 4px;
    color: #a0acc0;
}

.summary-card--primary .summary-card__icon {
    color: #1d4ed8;
    background: rgba(29, 78, 216, 0.12);
}

.summary-card--blue .summary-card__icon {
    color: #2563eb;
    background: rgba(37, 99, 235, 0.12);
}

.summary-card--teal .summary-card__icon {
    color: #0f9b8e;
    background: rgba(15, 155, 142, 0.12);
}

.summary-card--amber .summary-card__icon {
    color: #d97706;
    background: rgba(217, 119, 6, 0.12);
}

.dashboard-grid {
    display: grid;
    grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.35fr);
    gap: 12px;
}

.dashboard-grid__left,
.dashboard-grid__right {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.dashboard-grid__charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.task-panel {
    height: 340px;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.93) 0%, rgba(246, 251, 255, 0.88) 100%);
    border: 1px solid rgba(176, 201, 235, 0.58);
    backdrop-filter: blur(10px);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        0 12px 28px rgba(21, 64, 136, 0.12);
}

.task-panel__header {
    padding: 14px 16px 4px;
}

.panel-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #172033;
}

.panel-subtitle {
    margin-top: 4px;
    color: #7b879b;
    font-size: 0.8rem;
}

.task-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    flex: 1 1 auto;
    align-content: stretch;
    gap: 10px;
    padding: 6px 16px 16px;
}

.task-stat-card {
    border-radius: 14px;
    background: linear-gradient(180deg, #fbfdff 0%, #f3f7fc 100%);
    border: 1px solid rgba(210, 219, 233, 0.82);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.task-stat-card .q-card__section {
    padding: 14px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.task-stat-card__top {
    display: flex;
    align-items: center;
    gap: 10px;
}

.task-stat-card__icon {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.task-stat-card__label {
    color: #718198;
    font-size: 0.8rem;
    font-weight: 600;
}

.task-stat-card__value {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    font-size: 2.45rem;
    font-weight: 700;
    line-height: 1;
    color: #1f2f46;
}

.task-stat-card--run .task-stat-card__icon {
    color: #2563eb;
    background: rgba(37, 99, 235, 0.12);
}

.task-stat-card--run .task-stat-card__value {
    color: #2563eb;
}

.task-stat-card--fail .task-stat-card__icon {
    color: #c97f7f;
    background: rgba(201, 127, 127, 0.14);
}

.task-stat-card--fail .task-stat-card__value {
    color: #c97f7f;
}

.task-stat-card--queue .task-stat-card__icon {
    color: #0f9b8e;
    background: rgba(15, 155, 142, 0.12);
}

.task-stat-card--queue .task-stat-card__value {
    color: #0f9b8e;
}

.task-stat-card--limit .task-stat-card__icon {
    color: #d39a42;
    background: rgba(211, 154, 66, 0.14);
}

.task-stat-card--limit .task-stat-card__value {
    color: #d39a42;
}

@media (max-width: 1439px) {
    .stats-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 1023px) {
    .dashboard-page {
        padding: 10px 12px 14px;
    }

    .dashboard-hero {
        margin-bottom: 18px;
    }

    .dashboard-hero__title {
        min-width: 0;
        width: 100%;
        max-width: 520px;
        padding: 12px 24px;
        font-size: 1.1rem;
        letter-spacing: 0.18em;
    }

    .dashboard-grid__charts,
    .task-grid {
        grid-template-columns: 1fr;
    }

    .task-panel {
        height: auto;
    }
}

@media (max-width: 767px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>

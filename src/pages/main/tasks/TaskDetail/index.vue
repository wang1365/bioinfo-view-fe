<template>
    <q-page class="task-detail-page q-pa-md">
        <div class="row items-center q-pb-sm">
            <h6 class="q-ma-none">{{ `${$t('Task')}${$t('Info')}` }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" color="primary" flat @click="router.back()" />
        </div>

        <q-card class="task-detail-card">
            <q-card-section class="task-detail-card__summary">
                <div class="row q-col-gutter-md">
                    <q-input
                        :model-value="taskDetail.name"
                        :label="`${$t('Task')}${$t('Name')}`"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-12 col-md-4 col-lg-2"
                    />
                    <q-input
                        :model-value="taskDetail.project?.name"
                        :label="$t('Project')"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-12 col-md-4 col-lg-2"
                    />
                    <q-input
                        :model-value="taskDetail.flow?.name"
                        :label="`${$t('Flow')}${$t('Name')}`"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-12 col-md-4 col-lg-2"
                    />
                    <q-input
                        :model-value="format(taskDetail.create_time)"
                        :label="$t('CreateTime')"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-12 col-md-4 col-lg-2"
                    />
                    <q-input
                        :model-value="getItemStatus(taskDetail)"
                        :label="`${$t('Task')}${$t('Status')}`"
                        stack-label
                        label-color="white"
                        readonly
                        filled
                        class="col-12 col-md-4 col-lg-2"
                        :bg-color="getItemStatusColor(taskDetail)"
                    />
                </div>
            </q-card-section>

            <q-separator />

            <q-tabs
                v-model="activeTab"
                dense
                align="left"
                indicator-color="primary"
                active-color="primary"
                class="task-detail-card__tabs"
            >
                <q-tab name="taskInfo" :label="$t('Task') + $t('Info')" />
                <q-tab name="taskEnv" :label="$t('ShellEnvs')" />
                <q-tab name="taskLog" :label="$t('Log')" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="activeTab" animated class="task-detail-card__panels">
                <q-tab-panel name="taskInfo">
                    <div class="text-h6 q-pb-sm">
                        <span class="text-primary text-weight-bolder">{{ $t('Progress') + ': ' }}</span>
                    </div>
                    <div id="task-step" class="q-px-sm q-pb-md">
                        <q-stepper v-model="lastStageIndex" color="primary">
                            <q-step
                                v-for="(item, index) in stages"
                                :key="index"
                                :title="item"
                                :name="index"
                                active-icon="play_circle"
                                icon="fast_forward"
                                :done="index < lastStageIndex"
                            >
                                <template #default></template>
                            </q-step>
                        </q-stepper>
                    </div>

                    <div class="text-h6 q-pb-sm">
                        <span class="text-primary text-weight-bolder">{{ $t('Sample') + ': ' }}</span>
                    </div>
                    <AppDataTable
                        class="page-grid-table"
                        :columns="sampleColumns"
                        :data-source="taskSamples"
                        :pagination="false"
                        :locale="tableLocale"
                        size="small"
                        bordered
                        :scroll="{ x: 1600 }"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'fastq1_path'">
                                <span
                                    :class="[
                                        'fastq-text',
                                        record.fastq1_warn ? 'text-orange' : (record.fastq1_ok ? 'text-black' : 'text-grey-7'),
                                    ]"
                                >
                                    {{ record.fastq1_path || '' }}
                                    <q-icon
                                        v-if="record.fastq1_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mx-xs"
                                    />
                                    <q-icon
                                        v-else-if="record.fastq1_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mx-xs"
                                    />
                                    <FastqTooltip :info="record.fastq1_info" :warn="record.fastq1_warn" />
                                </span>
                            </template>
                            <template v-else-if="column.key === 'fastq2_path'">
                                <span
                                    :class="[
                                        'fastq-text',
                                        record.fastq2_warn ? 'text-orange' : (record.fastq2_ok ? 'text-black' : 'text-grey-7'),
                                    ]"
                                >
                                    {{ record.fastq2_path || '' }}
                                    <q-icon
                                        v-if="record.fastq2_warn"
                                        name="warning"
                                        color="orange"
                                        size="14px"
                                        class="q-mx-xs"
                                    />
                                    <q-icon
                                        v-else-if="record.fastq2_ok"
                                        name="check_circle"
                                        color="green-8"
                                        size="14px"
                                        class="q-mx-xs"
                                    />
                                    <FastqTooltip :info="record.fastq2_info" :warn="record.fastq2_warn" />
                                </span>
                            </template>
                        </template>
                    </AppDataTable>
                </q-tab-panel>

                <q-tab-panel name="taskEnv">
                    <AppDataTable
                        class="page-grid-table"
                        :columns="envColumns"
                        :data-source="taskEnvs"
                        :pagination="false"
                        :locale="tableLocale"
                        row-key="key"
                        size="small"
                        bordered
                        :scroll="{ x: 1000 }"
                    />
                </q-tab-panel>

                <q-tab-panel name="taskLog">
                    <AppDataTable
                        class="page-grid-table"
                        :columns="logColumns"
                        :data-source="logs"
                        :pagination="false"
                        :locale="tableLocale"
                        row-key="time"
                        size="small"
                        bordered
                        :scroll="{ x: 1200 }"
                    />
                </q-tab-panel>
            </q-tab-panels>
        </q-card>
    </q-page>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { useApi } from 'src/api/apiBase'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { globalStore } from 'src/stores/global'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { format, toLocalString } from 'src/utils/time'
import FastqTooltip from '../../projects/ProjectDetail/ProjectTask/FastqTooltip.vue'

const store = globalStore()
const { langCode } = storeToRefs(store)

const { t } = useI18n()
const router = useRouter()
const { apiGet, apiGetByIds, apiPost } = useApi()
const route = useRoute()

const activeTab = ref('taskInfo')
const taskDetail = ref({})
const taskSamples = ref([])
const stages = ref([])
const logs = ref([])
const lastStage = ref('')
const lastStageIndex = ref(0)
const taskEnvs = ref([])

const i18nLabel = (key, zh, en) => {
    const translated = t(key)
    if (translated && translated !== key) {
        return translated
    }
    return langCode.value === 'en' ? en : zh
}

const sampleColumns = computed(() => {
    const base = [
        { title: 'No.', dataIndex: 'index', align: 'center', customRender: ({ index }) => index + 1 },
        {
            title: `${t('Patient')}${t('Name')}`,
            dataIndex: ['sample_meta', 'patient', 'name'],
            align: 'center',
            sorter: (a, b) => (a?.sample_meta?.patient?.name || '').localeCompare(b?.sample_meta?.patient?.name || ''),
        },
        {
            title: `${t('Patient')}${t('Gender')}`,
            dataIndex: 'k1',
            align: 'center',
            customRender: ({ record }) => {
                const val = String(record?.sample_meta?.patient?.gender || '').trim().toLowerCase()
                if (val === 'male' || val === 'm' || val === '男') return t('Male')
                if (val === 'female' || val === 'f' || val === '女') return t('Female')
                return record?.sample_meta?.patient?.gender || '-'
            },
        },
        {
            title: t('PatientNewFormPatientIdentificationNumber'),
            dataIndex: ['sample_meta', 'patient', 'identifier'],
            align: 'center',
            sorter: (a, b) =>
                (a?.sample_meta?.patient?.identifier || '').localeCompare(b?.sample_meta?.patient?.identifier || ''),
        },
        {
            title: t('SampleListTableColumnSampleIdentificationNumber'),
            dataIndex: ['sample_meta', 'identifier'],
            align: 'center',
            sorter: (a, b) => (a?.sample_meta?.identifier || '').localeCompare(b?.sample_meta?.identifier || ''),
        },
        { title: t('SampleListTableColumnSamplingSite'), dataIndex: ['sample_meta', 'sample_componet'], align: 'center' },
        {
            title: t('SampleListTableColumnTumorSample'),
            dataIndex: ['sample_meta', 'is_panel'],
            align: 'center',
            customRender: ({ record }) => (record?.sample_meta?.is_panel ? 'true' : 'false'),
        },
        {
            title: t('DataListTableColumnDataIdentificationNumber'),
            dataIndex: 'identifier',
            align: 'center',
            sorter: (a, b) => (a?.identifier || '').localeCompare(b?.identifier || ''),
        },
        { title: t('DataListTableColumnDataNameOfR1'), key: 'fastq1_path', dataIndex: 'fastq1_path', align: 'left' },
        { title: t('DataListTableColumnDataNameOfR2'), key: 'fastq2_path', dataIndex: 'fastq2_path', align: 'left' },
    ]

    if (taskDetail.value.flow?.support_custom_sample_name) {
        base.push({
            title: `${t('Sample')}${t('Name')}`,
            dataIndex: 'custom_name',
            align: 'left',
        })
    }

    if (taskDetail.value.flow?.support_sample_ratio) {
        base.push({
            title: t('SampleRatio'),
            dataIndex: 'sample_ratio',
            align: 'center',
        })
    }

    return base
})

const envColumns = computed(() => [
    {
        title: t('Name'),
        dataIndex: 'key',
        key: 'key',
        width: 260,
    },
    {
        title: t('Detail'),
        dataIndex: 'value',
        key: 'value',
        ellipsis: true,
    },
])

const logColumns = computed(() => [
    {
        title: 'No.',
        dataIndex: 'index',
        key: 'index',
        width: 70,
        align: 'center',
        customRender: ({ index }) => index + 1,
    },
    {
        title: i18nLabel('Time', '时间', 'Time'),
        dataIndex: 'time',
        key: 'time',
        width: 220,
        align: 'center',
        customRender: ({ text }) => toLocalString(text),
    },
    {
        title: i18nLabel('Stage', '阶段', 'Stage'),
        dataIndex: 'stage',
        key: 'stage',
        width: 180,
        align: 'left',
    },
    {
        title: t('Title'),
        dataIndex: 'title',
        key: 'title',
        width: 240,
        align: 'left',
    },
    {
        title: t('Status'),
        dataIndex: 'status',
        key: 'status',
        width: 140,
        align: 'center',
    },
    {
        title: t('Detail'),
        dataIndex: 'detail',
        key: 'detail',
        align: 'left',
        ellipsis: true,
    },
])

const tableLocale = computed(() => ({
    emptyText: t('NoData'),
}))

const getItemStatus = (item) => {
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
}

const getItemStatusColor = (item) => {
    switch (item.status) {
        case 'PENDING':
            return 'secondary'
        case 'RUNNING':
            return 'primary'
        case 'FINISHED':
            return 'positive'
        case 'FAILURED':
            return 'red'
        case 'CANCELED':
            return 'warning'
        default:
            return item.status
    }
}

const buildTaskStageAndLog = (task) => {
    stages.value = []
    logs.value = []
    lastStage.value = ''
    lastStageIndex.value = 0

    const log = langCode.value === 'en' ? task.log_EN : task.log_CN
    if (!Array.isArray(log) || log.length === 0) {
        return
    }

    stages.value = log[0].stages || []
    if (log.length > 1) {
        logs.value = log.slice(1)
        lastStage.value = logs.value[logs.value.length - 1]?.stage || ''
    }
    lastStageIndex.value = Math.max(0, stages.value.indexOf(lastStage.value))
}

watch(
    () => route.params.id,
    () => {
        if (route.params.id) getTaskDetail()
    }
)

watch(langCode, () => {
    buildTaskStageAndLog(taskDetail.value || {})
})

onMounted(() => {
    getTaskDetail()
})

const getTaskDetail = () => {
    apiGet(`/task/${route.params.id}`, (res) => {
        taskDetail.value = res.data || {}
        buildTaskStageAndLog(taskDetail.value)
        getTaskSamples(taskDetail.value.samples || [])
        buildTaskEnvs(taskDetail.value)
    })
}

const getTaskSamples = (sampleIds) => {
    apiGetByIds('sample', sampleIds, (res) => {
        taskSamples.value = []
        const sampleDetails = taskDetail.value.sample_details || []
        for (const item of res.data.results || []) {
            const sampleDetail = sampleDetails.find((detail) => detail.sample === item.id) || {}
            item.custom_name = sampleDetail.custom_name
            item.sample_ratio = sampleDetail.sample_ratio
            taskSamples.value.push(item)
        }
        checkTaskFastqFiles()
    })
}

const collectTaskDataIds = () => {
    const ids = []
    for (const sample of taskSamples.value || []) {
        if (sample?.identifier || sample?.sample_identifier) {
            ids.push(sample.identifier || sample.sample_identifier)
        }
    }
    return Array.from(new Set(ids))
}

const checkTaskFastqFiles = () => {
    const ids = collectTaskDataIds()
    if (ids.length === 0) return

    apiPost('/sample/samples/check_fastq', (res) => {
        const results = res.data || res
        const badPaths = new Map()
        const infoByKey = new Map()

        const processInfo = (key, info) => {
            if (!info) return
            const exists = info.exists === true
            const ready = info.ready !== false
            if (info.path) infoByKey.set(info.path, info)
            if (key && typeof key === 'string') infoByKey.set(key, info)

            let errorMsg = ''
            if (!exists) {
                errorMsg = t('FileNotExist')
            } else if (!ready) {
                errorMsg = t('FileNotReady')
            }

            if (errorMsg) {
                if (info.path) badPaths.set(info.path, errorMsg)
                if (key && typeof key === 'string') badPaths.set(key, errorMsg)
            }
        }

        if (Array.isArray(results)) {
            results.forEach((info) => processInfo(null, info))
        } else {
            Object.entries(results || {}).forEach(([key, info]) => processInfo(key, info))
        }

        const checkPath = (p) => {
            if (!p) return ''
            if (badPaths.has(p)) return badPaths.get(p)
            const filename = p.split(/[/\\]/).pop()
            if (badPaths.has(filename)) return badPaths.get(filename)
            return ''
        }

        const findInfo = (p) => {
            if (!p) return null
            if (infoByKey.has(p)) return infoByKey.get(p)
            const filename = p.split(/[/\\]/).pop()
            if (infoByKey.has(filename)) return infoByKey.get(filename)
            return null
        }

        for (const sample of taskSamples.value || []) {
            const warn1 = checkPath(sample.fastq1_path)
            sample.fastq1_warn = warn1
            sample.fastq1_ok = !!sample.fastq1_path && !warn1
            sample.fastq1_info = findInfo(sample.fastq1_path)

            const warn2 = checkPath(sample.fastq2_path)
            sample.fastq2_warn = warn2
            sample.fastq2_ok = !!sample.fastq2_path && !warn2
            sample.fastq2_info = findInfo(sample.fastq2_path)
        }
    }, ids)
}

const buildTaskEnvs = (detail) => {
    const exclude = [
        'OUT_DIR',
        'BIO_ROOT',
        'DATA_DIR',
        'IS_MERGE',
        'TASK_URL',
        'SAMPLE_INFO',
        'DATABASE_DIR',
        'TASK_RESULT_DIR',
    ]

    taskEnvs.value = []
    const env = detail?.env || {}
    const isSuper = store.currentUser?.role_list?.includes('super')

    for (const key in env) {
        if (isSuper || !exclude.includes(key)) {
            taskEnvs.value.push({ key, value: env[key] })
        }
    }
}
</script>

<style scoped lang="scss">
.task-detail-page {
    background: linear-gradient(180deg, #f5f8ff 0%, #eef3ff 50%, #f9fbff 100%);
}

.task-detail-card {
    border-radius: 14px;
    overflow: hidden;
}

.task-detail-card__summary {
    background: #f7fbff;
}

.task-detail-card__tabs {
    background: #fff;
}

.task-detail-card__panels {
    background: #fff;
}

.fastq-text {
    font-size: 12px;
}
</style>

<style>
#task-step .q-stepper__step-inner {
    display: none;
}
</style>

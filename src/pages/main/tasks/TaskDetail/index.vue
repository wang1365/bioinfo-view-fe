<template>
    <q-page padding>
        <div class="row items-center q-py-sm">
            <h6>{{ `${$t('Task')}${$t('Info')}` }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" color="primary" flat @click="router.back()" />
        </div>
        <q-card>
            <q-card-section>
                <div class="row q-gutter-md">
                    <q-input
                        :model-value="taskDetail.name"
                        :label="`${$t('Task')}${$t('Name')}`"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-2"
                    />
                    <q-input
                        :model-value="taskDetail.project?.name"
                        :label="$t('Project')"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-2"
                    />
                    <q-input
                        :model-value="taskDetail.flow?.name"
                        :label="`${$t('Flow')}${$t('Name')}`"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-2"
                    />
                    <q-input
                        :model-value="format(taskDetail.create_time)"
                        :label="`${$t('CreateTime')}`"
                        stack-label
                        label-color="primary"
                        readonly
                        filled
                        class="col-2"
                    />
                    <q-input
                        :model-value="getItemStatus(taskDetail)"
                        :label="`${$t('Task')}${$t('Status')}`"
                        stack-label
                        label-color="white"
                        readonly
                        filled
                        class="col-2"
                        :bg-color="getItemStatusColor(taskDetail)"
                    />
                </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
                <div class="text-h6 q-pa-xs">
                    <span class="text-primary text-weight-bolder">{{ $t('Sample') + ": " }}</span>
                </div>
                <a-table :columns="columns" :data-source="taskSamples" size="small" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'fastq1_path'">
                            <span
                                :class="['fastq-text', record.fastq1_warn ? 'text-orange' : (record.fastq1_ok ? 'text-black' : 'text-grey-7')]"
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
                                :class="['fastq-text', record.fastq2_warn ? 'text-orange' : (record.fastq2_ok ? 'text-black' : 'text-grey-7')]"
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
                </a-table>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section>
                <div class="text-h6 q-pa-xs">
                    <span class="text-primary text-weight-bolder">{{ $t('ShellEnvs') + ": " }}</span>
                </div>
                <div class="row q-gutter-sm">
                    <q-input
                        v-for="item of taskEnvs"
                        :key="item.key"
                        :model-value="item.value"
                        :label="item.key"
                        label-color="primary"
                        outlined
                        filled
                        stack-label
                        readonly
                        class="col-2"
                    />
                </div>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section>
                <div class="text-h6 q-pa-xs">
                    <span class="text-primary text-weight-bolder">{{ $t('Progress') + ": " }}</span>
                </div>
                <div id="task-step" class="text-body q-px-md q-py-md">
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
                            <template v-slot:default></template>
                        </q-step>
                    </q-stepper>
                </div>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section>
                <div class="text-h6 q-pa-xs">
                    <span class="text-primary text-weight-bolder">{{ $t('Log') + ": " }}</span>
                </div>
                <div class="text-body q-px-md q-py-xs">
                    <q-timeline color="primary">
                        <q-timeline-entry
                            v-for="(item, i) of logs"
                            :key="i"
                            :title="item.stage + ': ' + item.title"
                            :subtitle="item.status + ': ' + toLocalString(item.time)"
                            :body="item.detail"
                            :icon="i === 0 ? '' : 'arrow_downward'"
                            style="color: #0569c9"
                        />
                    </q-timeline>
                </div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import {useApi} from "src/api/apiBase";
import {computed, onMounted, ref, watch, h} from "vue";
import {useRoute, useRouter} from "vue-router";
import {globalStore} from 'src/stores/global'
import {useI18n} from "vue-i18n";
import {storeToRefs} from 'pinia'
import { format, toLocalString} from "src/utils/time"
import FastqTooltip from "../../projects/ProjectDetail/ProjectTask/FastqTooltip.vue"

const store = globalStore()
const {langCode} = storeToRefs(store)

const {t} = useI18n();
const router = useRouter()
const {apiGet, apiGetByIds, apiPost} = useApi();
const route = useRoute();
const taskDetail = ref({});
const taskSamples = ref([])
const stages = ref([])
const logs = ref([])
const lastStage = ref("")
const lastStageIndex = ref(0)
const taskEnvs = ref([])

const columns = computed(() => {
    const base = [
        {title: `No.`, dataIndex: 'index', align: 'center', customRender: ({index}) => index + 1}, //item.sample_meta?.patient?.name
        {
            title: `${t('Patient')}${t('Name')}`, dataIndex: ['sample_meta', 'patient', 'name'], align: 'center',
            sorter: (a, b) => a.sample_meta.patient.name.localeCompare(b.sample_meta.patient.name),
        },
        {
            title: `${t('Patient')}${t('Gender')}`,
            dataIndex: 'k1',
            align: 'center',
            customRender: ({text, record, index, column}) => {
                return record.sample_meta?.patient?.gender === '男' ? t('Male') : t('Female')
            }
        },
        {
            title: t('PatientNewFormPatientIdentificationNumber'),
            dataIndex: ['sample_meta', 'patient', 'identifier'],
            align: 'center',
            sorter: (a, b) => a.sample_meta.patient.identifier.localeCompare(b.sample_meta.patient.identifier),
        },
        {
            title: t('SampleListTableColumnSampleIdentificationNumber'),
            dataIndex: ['sample_meta', 'identifier'],
            align: 'center',
            sorter: (a, b) => a.sample_meta.identifier.localeCompare(b.sample_meta.identifier),
        },
        {title: t('SampleListTableColumnSamplingSite'), dataIndex: ['sample_meta', 'sample_componet'], align: 'center'},
        {
            title: t('SampleListTableColumnTumorSample'), dataIndex: ['sample_meta', 'is_panel'], align: 'center',
            customRender: ({text, record, index, column}) => {
                return record.sample_meta?.is_panel ? 'true' : 'false'
            }
        },
        {
            title: t('DataListTableColumnDataIdentificationNumber'), dataIndex: 'identifier', align: 'center',
            sorter: (a, b) => a.identifier.localeCompare(b.identifier),
        },
        { title: t('DataListTableColumnDataNameOfR1'), key: 'fastq1_path', dataIndex: 'fastq1_path', align: 'left' },
        { title: t('DataListTableColumnDataNameOfR2'), key: 'fastq2_path', dataIndex: 'fastq2_path', align: 'left' },
    ]

    if (taskDetail.value.flow?.support_custom_sample_name) {
        base.push({
            title: t('Sample') + t('Name'),
            dataIndex: 'custom_name',
            align: 'left'
        })
    }

    if (taskDetail.value.flow?.support_sample_ratio) {
        base.push({
            title: t('SampleRatio'),
            dataIndex: 'sample_ratio',
            align: 'center'
        })
    }
    return base
})


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
};
const getItemStatusColor = (item) => {
    switch (item.status) {
        case "PENDING":
            return "secondary";
        case "RUNNING":
            return "primary";
        case "FINISHED":
            return "positive";
        case "FAILURED":
            return "red";
        case "CANCELED":
            return "warning";
        default:
            return item.status;
    }
};

const buildTaskStageAndLog = (task) => {
    let log = langCode.value === 'en' ? task.log_EN : task.log_CN
    if (log.length > 0) {
        stages.value = log[0].stages

        if (log.length > 1) {
            for (let i = 1; i < log.length; i++) {
                logs.value.push(log[i])
            }
            lastStage.value = log[log.length - 1].stage
        }
        lastStageIndex.value = stages.value.indexOf(lastStage.value)

    }
}
watch(
    () => route.params.id,
    () => {
        if (route.params.id) getTaskDetail();
    }
);
watch(langCode, lc => {
    logs.value = []
    buildTaskStageAndLog(taskDetail.value)
})
onMounted(() => {
    getTaskDetail();
});
const getTaskDetail = () => {
    apiGet(`/task/${route.params.id}`, (res) => {
        taskDetail.value = res.data;
        let logAttr = langCode.value === 'en' ? 'log_EN' : 'log_CN'
        if (res.data[logAttr]) {
            if (taskDetail.value[logAttr].length === 0) {
                taskDetail.value.log = [
                    // {'stages':['test-检查','test-运行中','test-完成']},
                    // {time:"YYYY-MM-DD HH:MM:SS",stage:"test-运行中",title:"test-测试",detail:"test-测试数据",status:"test-运行中"},
                    // {time:"YYYY-MM-DD HH:MM:SS",stage:"test-运行中",title:"test-测试",detail:"test-测试数据",status:"test-运行中"},
                    // {time:"YYYY-MM-DD HH:MM:SS",stage:"test-运行中",title:"test-测试",detail:"test-测试数据",status:"test-运行中"},
                    // {time:"YYYY-MM-DD HH:MM:SS",stage:"test-运行中",title:"test-测试",detail:"test-测试数据",status:"test-运行中"},
                    // {time:"YYYY-MM-DD HH:MM:SS",stage:"test-运行中",title:"test-测试",detail:"test-测试数据",status:"test-运行中"}
                ]
            }
            buildTaskStageAndLog(taskDetail.value)
        }
        getTaskSamples(taskDetail.value.samples)
        buildTaskEnvs(taskDetail.value)
    });
};
const getTaskSamples = (sampleIds) => {
    apiGetByIds('sample', sampleIds, (res) => {
        taskSamples.value = []
        const sampleDetails = taskDetail.value.sample_details || []
        for (const iterator of res.data.results) {
            // 从sample_details找到sample_id相同的sample
            const sampleDetail = sampleDetails.find(item => item.sample === iterator.id) || {}
            iterator.custom_name = sampleDetail.custom_name
            iterator.sample_ratio = sampleDetail.sample_ratio
            taskSamples.value.push(iterator)
        }
        checkTaskFastqFiles()
    });
};
const collectTaskDataIds = () => {
    const ids = []
    for (const s of taskSamples.value || []) {
        if (s?.identifier || s?.sample_identifier) ids.push(s.identifier || s.sample_identifier)
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

        for (const s of taskSamples.value || []) {
            const warn1 = checkPath(s.fastq1_path)
            s.fastq1_warn = warn1
            s.fastq1_ok = !!s.fastq1_path && !warn1
            s.fastq1_info = findInfo(s.fastq1_path)

            const warn2 = checkPath(s.fastq2_path)
            s.fastq2_warn = warn2
            s.fastq2_ok = !!s.fastq2_path && !warn2
            s.fastq2_info = findInfo(s.fastq2_path)
        }
    }, ids)
}
const buildTaskEnvs = (taskDetail) => {
    console.log(store.currentUser)
    let exclude = [
        'OUT_DIR',
        'BIO_ROOT',
        'DATA_DIR',
        'IS_MERGE',
        'TASK_URL',
        'SAMPLE_INFO',
        'DATABASE_DIR',
        'TASK_RESULT_DIR'
    ]
    taskEnvs.value = []
    if (store.currentUser.role_list.indexOf('super') < 0) {
        for (const key in taskDetail.env) {
            if (exclude.indexOf(key) < 0) {
                taskEnvs.value.push({"key": key, "value": taskDetail.env[key]})
            }
        }
    } else {
        for (const key in taskDetail.env) {
            taskEnvs.value.push({"key": key, "value": taskDetail.env[key]})
        }
    }
    console.log(taskEnvs.value)
}
</script>

<style scoped>
.fastq-text {
  font-size: 12px;
}
</style>

<style>
#task-step .q-stepper__step-inner {
    display: none;
}
</style>

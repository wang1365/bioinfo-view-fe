<template>
    <q-page padding>
        <div class="row items-center q-py-sm">
            <h6>{{ `${$t('Task')} ${$t('Info')}` }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" color="primary" @click="router.back()" />
        </div>
        <q-card>
            <q-section>
                <div class="text-h6  q-px-md q-py-sm ">{{ $t('Project') }}: {{ taskDetail.project?.name }}</div>
                <div class="text-h6  q-px-md q-py-sm">{{ `${$t('Task')}${$t('Name')}` }}: {{ taskDetail.name }}</div>
                <div class="text-h6 q-px-md q-py-sm">
                    {{ `${$t('Task')}${$t('Status')}` }}:
                    <span
                        class="q-px-md brand-color text-center row inline flex-center text-white rounded-borders"
                        :class="getItemStatusColor(taskDetail)"
                        >{{ getItemStatus(taskDetail) }}</span
                    >
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-px-md q-py-sm">{{ $t('Sample') }}:</div>
                <div class="text-body q-px-md q-py-sm">
                    <div v-for="item of taskSamples" :key="item.id">
                        <div class="row bg-grey-3 q-px-sm">
                            <div class="col-4">
                                <div class="q-py-sm">
                                    {{ `${$t('Patient')}${$t('Name')}` }}: {{ item.sample_meta?.patient?.name }}
                                </div>
                                <div class="q-py-sm">
                                    {{ `${$t('Patient')}${$t('Gender')}` }}: {{ item.sample_meta?.patient?.gender }}
                                </div>
                                <div class="q-py-sm">
                                    {{ $t('PatientNewFormPatientIdentificationNumber') }}:
                                    {{ item.sample_meta?.patient?.identifier }}
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="q-py-sm">
                                    {{ $t('SampleListTableColumnSampleIdentificationNumber') }}:
                                    {{ item.sample_meta?.identifier }}
                                </div>
                                <div class="q-py-sm">
                                    {{ $t('SampleListTableColumnSamplingSite') }}:
                                    {{ item.sample_meta?.sample_componet }}
                                </div>
                                <div class="q-py-sm">
                                    {{ $t('SampleListTableColumnTumorSample') }}: {{ item.sample_meta?.is_panel }}
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="q-py-sm">
                                    {{ $t('DataListTableColumnDataIdentificationNumber') }}: {{ item.identifier }}
                                </div>
                                <div class="q-py-sm">
                                    {{ $t('DataListTableColumnDataNameOfR1') }}: {{ item.fastq1_path }}
                                </div>
                                <div class="q-py-sm">
                                    {{ $t('DataListTableColumnDataNameOfR2') }}: {{ item.fastq2_path }}
                                </div>
                            </div>
                        </div>
                        <q-separator color="primary"></q-separator>
                    </div>
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">{{ $t('ShellEnvs') }}:</div>
                <div class="text-body q-px-md q-py-xs" v-for="item of taskEnvs" :key="item.key">
                    <span class="text-bold">{{ item.key }} : </span> {{ item.value }}
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">{{ $t('Progress') }}:</div>
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
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">{{ $t('Log') }}:</div>
                <div class="text-body q-px-md q-py-xs">
                    <q-timeline color="secondary">
                        <q-timeline-entry
                            v-for="(item, key) of logs"
                            :key="key"
                            :title="item.stage + ':' + item.title"
                            :subtitle="item.status + ':' + item.time"
                            :body="item.detail"
                        />
                    </q-timeline>
                </div>
            </q-section>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { useApi } from "src/api/apiBase";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { globalStore } from 'src/stores/global'
import { useI18n } from "vue-i18n";
import { storeToRefs } from 'pinia'

const store = globalStore()
const { langCode } = storeToRefs(store)

const { t } = useI18n();
const router = useRouter()
const { apiGet, apiGetByIds } = useApi();
const route = useRoute();
const taskDetail = ref({});
const taskSamples = ref([])
const stages = ref([])
const logs = ref([])
const lastStage = ref("")
const lastStageIndex = ref(0)
const taskEnvs = ref([])
const getItemStatus = (item) => {
    switch (item.status) {
        case 'PENDING':
            return t('TaskPageListStatusRun')
        case 'RUNNING':
            return t('TaskPageListStatusQueue')
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
            return "bg-secondary";
        case "RUNNING":
            return "bg-primary";
        case "FINISHED":
            return "bg-positive";
        case "FAILURED":
            return "bg-red";
        case "CANCELED":
            return "bg-warning";
        default:
            return item.status;
    }
};

const buildTaskStageAndLog = (task) => {
    let log = langCode.value === 'en' ? task.log_EN : task.log_CN
    if (log.length >= 0) {
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
    logs.value=[]
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
        for (const iterator of res.data.results) {
            taskSamples.value.push(iterator)
        }
    });
};
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
                taskEnvs.value.push({ "key": key, "value": taskDetail.env[key] })
            }
        }
    } else {
        for (const key in taskDetail.env) {
            taskEnvs.value.push({ "key": key, "value": taskDetail.env[key] })
        }
    }
    console.log(taskEnvs.value)
}
</script>

<style>
#task-step .q-stepper__step-inner {
    display: none;
}
</style>

<template>
    <q-page padding>
        <div class="row items-center q-py-sm">
            <h6>任务详情</h6>
            <q-space />
            <q-btn label="返回" icon="arrow_back" color="primary" @click="router.back()" />
        </div>
        <q-card>
            <q-section>
                <div class="text-h6  q-px-md q-py-sm ">项目: {{ taskDetail.project?.name }}</div>
                <div class="text-h6  q-px-md q-py-sm">任务名称: {{ taskDetail.name }}</div>
                <div class="text-h6 q-px-md q-py-sm">
                    任务状态:
                    <span
                        class="q-px-md brand-color text-center row inline flex-center text-white rounded-borders"
                        :class="getItemStatusColor(taskDetail)"
                        >{{ getItemStatus(taskDetail) }}</span
                    >
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-px-md q-py-sm">样本:</div>
                <div class="text-body q-px-md q-py-sm">
                    <div v-for="item of taskSamples" :key="item.id">
                        <div class="row bg-grey-3 q-px-sm">
                            <div class="col-4">
                                <div class="q-py-sm">患者姓名: {{ item.sample_meta?.patient?.name }}</div>
                                <div class="q-py-sm">患者性别: {{ item.sample_meta?.patient?.gender }}</div>
                                <div class="q-py-sm">患者识别号: {{ item.sample_meta?.patient?.identifier }}</div>
                            </div>
                            <div class="col-4">
                                <div class="q-py-sm">样本识别号: {{ item.sample_meta?.identifier }}</div>
                                <div class="q-py-sm">采样部位: {{ item.sample_meta?.sample_componet }}</div>
                                <div class="q-py-sm">肿瘤样本: {{ item.sample_meta?.is_panel }}</div>
                            </div>
                            <div class="col-4">
                                <div class="q-py-sm">数据识别号: {{ item.identifier }}</div>
                                <div class="q-py-sm">R1 文件: {{ item.fastq1_path }}</div>
                                <div class="q-py-sm">R2 文件: {{ item.fastq2_path }}</div>
                            </div>
                        </div>
                        <q-separator color="primary"></q-separator>
                    </div>
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">环境变量:</div>
                <div class="text-body q-px-md q-py-xs" v-for="item of taskEnvs" :key="item.key">
                    <span class="text-bold">{{ item.key }} : </span> {{ item.value }}
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">任务进度:</div>
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
                <!-- <div>
                    {{lastStageIndex}}
                </div>
                <div class="text-body q-pa-md" v-for="(item,key) of stages" :key="item">
                    <span class="text-bold">{{key}} : </span> {{item}}
                </div> -->
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">任务日志:</div>
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
                <!-- <div class="text-body q-px-md q-py-xs" v-for="(item,key) of logs" :key="key">
                    <span class="text-primary text-bold text-subtitle1"> {{item.stage}}</span
                    >:<span class="text-primary text-bold text-subtitle1"> {{item.status}}</span>
                    <div>
                        <span class="text-bold">{{item.time}} {{item.title}}: </span>
                        <span class="q-ml-sm"> {{item.detail}} </span>
                    </div>
                </div> -->
            </q-section>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { useApi } from "src/api/apiBase";
import { onMounted, ref, watch } from "vue";
import { useRoute,useRouter } from "vue-router";
import { globalStore } from 'src/stores/global'
const store = globalStore()
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
        case "PENDING":
            return "排队中";
        case "RUNNING":
            return "运行中";
        case "FINISHED":
            return "完成";
        case "FAILURED":
            return "失败";
        case "CANCELED":
            return "取消";
        default:
            return item.status;
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
    let log = task.log
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
onMounted(() => {
    getTaskDetail();
});
const getTaskDetail = () => {
    apiGet(`/task/${route.params.id}`, (res) => {
        taskDetail.value = res.data;
        if (taskDetail.value.log.length === 0) {
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

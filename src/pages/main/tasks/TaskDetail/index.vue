<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="任务详情" />
        <q-card>
            <q-section>
                <div class="text-h6  q-px-md q-py-sm ">项目: {{taskDetail.project?.name}}</div>
                <div class="text-h6  q-px-md q-py-sm">任务名称: {{taskDetail.name}}</div>
                <div class="text-h6 q-px-md q-py-sm">
                    任务状态:
                    <span
                        class="q-px-md brand-color text-center row inline flex-center text-white rounded-borders"
                        :class="getItemStatusColor(taskDetail)"
                        >{{getItemStatus(taskDetail)}}</span
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
                                <div class="q-py-sm">患者姓名: {{item.sample_meta?.patient?.name}}</div>
                                <div class="q-py-sm">患者性别: {{item.sample_meta?.patient?.gender}}</div>
                                <div class="q-py-sm">患者识别号: {{item.sample_meta?.patient?.identifier}}</div>
                            </div>
                            <div class="col-4">
                                <div class="q-py-sm">样本识别号: {{item.sample_meta?.identifier}}</div>
                                <div class="q-py-sm">采样部位: {{item.sample_meta?.sample_componet}}</div>
                                <div class="q-py-sm">肿瘤样本: {{item.sample_meta?.is_panel}}</div>
                            </div>
                            <div class="col-4">
                                <div class="q-py-sm">数据识别号: {{item.identifier}}</div>
                                <div class="q-py-sm">R1 文件: {{item.fastq1_path}}</div>
                                <div class="q-py-sm">R2 文件: {{item.fastq2_path}}</div>
                            </div>
                        </div>
                        <q-separator color="primary"></q-separator>
                    </div>
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">环境变量:</div>
                <div class="text-body q-px-md q-py-xs" v-for="(item,key) of taskDetail.env" :key="item">
                    <span class="text-bold">{{key}} : </span> {{item}}
                </div>
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">任务进度:</div>
                <!-- <div class="text-body q-px-md" v-for="(item,key) of taskDetail.env" :key="item">
                    <span class="text-bold">{{key}} : </span> {{item}}
                </div> -->
            </q-section>
            <q-separator></q-separator>
            <q-section>
                <div class="text-h6 q-pa-md">任务日志:</div>
                <!-- <div class="text-body q-px-md" v-for="(item,key) of taskDetail.env" :key="item">
                    <span class="text-bold">{{key}} : </span> {{item}}
                </div> -->
            </q-section>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { useApi } from "src/api/apiBase";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const { apiGet,apiGetByIds } = useApi();
const route = useRoute();
const taskDetail = ref({});
const taskSamples=ref([])
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
        getTaskSamples(taskDetail.value.samples)
    });
};
const getTaskSamples = (sampleIds) => {
    apiGetByIds('sample',sampleIds, (res) => {
        taskSamples.value=[]
        for (const iterator of res.data.results) {
            taskSamples.value.push(iterator)
        }
    });
};
</script>

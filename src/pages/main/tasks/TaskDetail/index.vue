<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="任务详情" />
        <div>
            <div class="text-h5">
                {{ taskDetail.name
                }}
                : [{{getItemStatus(taskDetail)}}]
            </div>
            <div class="row text-h6 q-mt-md">
                <div class="col-6"><span class="text-bold">项目:</span> {{ taskDetail.project?.name }}</div>
                <div class="col-6"><span class="text-bold">流程:</span> {{ taskDetail.flow?.name }}</div>
            </div>
            <!-- <div class="text-h6 q-mt-md">参数:</div>

            <div v-for="item of taskDetail.parameter" :key="item"><span class="text-bold">{{item.key}} : </span> {{item.value}}</div> -->
            <div class="text-h6 q-mt-sm">环境变量:</div>
            <div v-for="(item,key) of taskDetail.env" :key="item">
                <span class="text-bold">{{key}} : </span> {{item}}
            </div>
            <div v-if="taskDetail.status==='FAILURED'">
                <div class="text-h6 q-my-sm text-red">错误信息:</div>
                <div class="text-subtitle1 text-red">
                    {{taskDetail.error_message}}
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { useApi } from "src/api/apiBase";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const { apiGet } = useApi();
const route = useRoute();
const taskDetail = ref({});
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
    });
};
</script>

<template>
    <q-page padding style="overflow-x: hidden">
        <p class="text-h5">
            项目详情 <q-btn color="primary" @click="back()" v-if="projectDetail.parent" size="sm">返回上级</q-btn>
        </p>

        <q-separator />
        <ProjectDetail :projectDetail="projectDetail" @reloadProject="getProjectDetail()" />
        <ProjectDetailDataList v-if="projectDetail.id" :projectDetail="projectDetail" :projectId="projectDetail.id"
            @refresh="getProjectDetail()" />
        <ChildProjectList :projectDetail="projectDetail" v-if="!projectDetail.parent" />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ProjectDetail from "./ProjectDetail.vue";
import ChildProjectList from "./ChildProjectList.vue";
import ProjectDetailDataList from "./ProjectDetailData/ProjectDetailDataList.vue";
import { useApi } from "src/api/apiBase";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const { apiGet } = useApi();
const route = useRoute();
const projectDetail = ref({});

watch(
    () => route.params.id,
    () => {
        if (route.params.id) getProjectDetail();
    }
);
onMounted(() => {
    getProjectDetail();
});
const back = () => {
    window.history.back()
}
const getProjectDetail = () => {
    apiGet(`/project/${route.params.id}`, (res) => {
        projectDetail.value = res.data;
    });
};
</script>

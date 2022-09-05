<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="项目详情" />
        <ProjectDetail :projectDetail="projectDetail" />
        <ProjectDetailSampleList :projectDetail="projectDetail" />
        <ChildProjectList
            :projectDetail="projectDetail"
            v-if="!projectDetail.parent"
        />
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ProjectDetail from "./ProjectDetail.vue";
import ChildProjectList from "./ChildProjectList.vue";
import ProjectDetailSampleList from "./ProjectDetailSamples/ProjectDetailSampleList.vue";
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
const getProjectDetail = () => {
    apiGet(`/project/${route.params.id}`, (res) => {
        projectDetail.value = res.data;
    });
};
</script>

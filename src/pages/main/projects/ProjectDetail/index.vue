<template>
    <q-page padding>
        <div class="row items-center q-py-sm">
            <h6>项目详情</h6>
            <q-space />
            <q-btn label="返回" icon="arrow_back" color="primary" @click="router.back()" />
        </div>
        <q-separator />
        <ProjectDetail :projectDetail="projectDetail" @reloadProject="getProjectDetail()" />
        <ProjectDetailDataList
            v-if="projectDetail.id"
            :projectDetail="projectDetail"
            :projectId="projectDetail.id"
            @refresh="getProjectDetail()"
        />
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
import { useRoute,useRouter } from "vue-router";

const router=useRouter()
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

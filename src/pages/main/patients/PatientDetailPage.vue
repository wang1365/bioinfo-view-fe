<template>
    <q-page padding>
        <div class="row items-center q-py-sm">
            <h6>患者详情</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" color="primary" @click="router.back()" />
        </div>
        <PatientInfo :id="infoId" v-if="infoId" />
    </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import PageTitle from "components/page-title/PageTitle.vue";
import PatientInfo from "./PatientInfo.vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import { useRoute,useRouter } from 'vue-router';
const { apiGet, apiDelete, downloadData, apiPatch } = useApi();

const router = useRouter()
const infoId = ref("")
const route = useRoute()
watch(
    () => route.params.id,
    () => {
        console.log(route.params.id)
        if (route.params.id) infoId.value = route.params.id;
    }
);
onMounted(() => {
    infoId.value = route.params.id
    // getProjectDetail();
});
const getProjectDetail = () => {
    // apiGet(`/project/${route.params.id}`, (res) => {
    //     projectDetail.value = res.data;
    // });
};
</script>

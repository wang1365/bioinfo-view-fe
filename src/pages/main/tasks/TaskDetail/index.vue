<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="任务详情" />
        <div>
            {{ taskDetail }}
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

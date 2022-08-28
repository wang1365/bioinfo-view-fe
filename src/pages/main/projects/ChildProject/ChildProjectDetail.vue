<template>
    <q-card>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="auto_mode" />
                <q-toolbar-title class="text-h6">
                    {{ projectDetail.name }}-
                    <span class="text-subtitle1">{{
                        projectDetail.create_time
                    }}</span>
                </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="创建任务"
                    icon="auto_mode"
                    @click="openNewProject = true"
                />
            </q-toolbar>
        </q-section>

        <q-section>
            <div
                class="q-pa-md row items-start q-gutter-md"
                style="justify-content: space-around"
            >
                <q-card class="my-card">
                    <q-card-section
                        class="text-primary text-center text-h5 text-bold"
                    >
                        {{ projectDetail.running_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 正在运行 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-secondary text-center text-h5 text-bold"
                    >
                        {{ projectDetail.pending_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 等待中 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-negative text-center text-h5 text-bold"
                    >
                        {{ projectDetail.failured_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 运行失败 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-grey text-center text-h5 text-bold"
                    >
                        {{ projectDetail.canceled_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 已取消 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-info text-center text-h5 text-bold"
                    >
                        {{ projectDetail.finished_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 已完成 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-positive text-center text-h5 text-bold"
                    >
                        {{ projectDetail.total_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 总数 </q-card-section>
                </q-card>
            </div>
        </q-section>
    </q-card>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import { useRoute } from "vue-router";

const route = useRoute();

const projectDetail = ref({});
onMounted(() => {
    getProjectDetail();
});
const getProjectDetail = async () => {
    console.log(route.params);
    api.get(`/project/${route.params.id}`).then((resp) => {
        projectDetail.value = resp.data.data;
    });
};
</script>

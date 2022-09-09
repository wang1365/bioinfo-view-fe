<template>
    <q-card>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="auto_mode" />
                <q-toolbar-title class="text-h6">
                    {{ props.projectDetail.name }}-
                    <span class="text-subtitle1">{{
                        props.projectDetail.create_time
                    }}</span>
                </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="创建任务"
                    icon="auto_mode"
                    @click="openFlowSelector = true"
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
                        {{ props.projectDetail.running_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 正在运行 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-secondary text-center text-h5 text-bold"
                    >
                        {{ props.projectDetail.pending_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 等待中 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-negative text-center text-h5 text-bold"
                    >
                        {{ props.projectDetail.failured_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 运行失败 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-grey text-center text-h5 text-bold"
                    >
                        {{ props.projectDetail.canceled_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 已取消 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-info text-center text-h5 text-bold"
                    >
                        {{ props.projectDetail.finished_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 已完成 </q-card-section>
                </q-card>
                <q-card class="my-card">
                    <q-card-section
                        class="text-positive text-center text-h5 text-bold"
                    >
                        {{ props.projectDetail.total_task_count }}
                    </q-card-section>

                    <q-card-section class="desc"> 总数 </q-card-section>
                </q-card>
            </div>
        </q-section>
    </q-card>
    <q-dialog persistent v-model="openFlowSelector">
        <FlowSelect @flowSelected="flowSelected($event)" />
    </q-dialog>
    <q-dialog persistent v-model="openCreateTask">
        <CreateTask
            :flowDetail="flowDetail"
            :projectId="projectDetail.id"
            @taskCreated="taskCreated($event)"
        />
    </q-dialog>
</template>
<script setup>
import { ref, defineProps } from "vue";
import { useApi } from "src/api/apiBase";
import FlowSelect from "./ProjectTask/FlowSelect.vue";
import CreateTask from "./ProjectTask/CreateTask.vue";
const { apiGet } = useApi();
const props = defineProps({ projectDetail: Object });

const openFlowSelector = ref(false);
const openCreateTask = ref(false);
const selectedFlowId = ref(0);
const flowDetail = ref({});

const flowSelected = (event) => {
    openFlowSelector.value = false;
    selectedFlowId.value = event.id;
    getFlowDetail(event.id);
};
const taskCreated = (event) => {
    openCreateTask.value = false;
};

const getFlowDetail = (flowId) => {
    apiGet(`/flow/flows/${flowId}/`, (res) => {
        flowDetail.value = res.data;
    });
};
</script>

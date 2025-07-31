<template>
    <q-card class="compact-card">
        <q-card-section class="compact-header">
            <q-toolbar class="q-gutter-x-sm q-py-xs">
                <q-icon size="md" color="primary" name="auto_mode"/>
                <q-toolbar-title class="text-h6">
                    {{ props.projectDetail.name }}-
                    <span class="text-subtitle1">{{
                            toLocalString(props.projectDetail.create_time)
                    }}</span>
                </q-toolbar-title>
                <q-btn
                    v-permission="'createTask'"
                    color="primary"
                    :label="$t('ProjectDetailPageCreateTask')"
                    icon="auto_mode"
                    @click="clickCreateTask"
                />
            </q-toolbar>
        </q-card-section>

        <q-card-section class="compact-stats">
            <div class="row items-start q-gutter-sm justify-around">
                <q-card class="my-card compact">
                    <q-card-section class="text-primary text-center text-h6 text-bold compact-section">
                        <div class="count">{{ props.projectDetail.running_task_count }}</div>
                        <div class="desc">{{ $t('TaskPageListStatusRun') }}</div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-secondary text-center text-h6 text-bold compact-section">
                        <div class="count">{{ props.projectDetail.pending_task_count }}</div>
                        <div class="desc">{{ $t('TaskPageListStatusQueue') }}</div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-negative text-center text-h6 text-bold compact-section">
                        <div class="count">{{ props.projectDetail.failured_task_count }}</div>
                        <div class="desc">{{ $t('TaskPageListStatusFail') }}</div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-grey text-center text-h6 text-bold compact-section">
                        <div class="count">{{ props.projectDetail.canceled_task_count }}</div>
                        <div class="desc">{{ $t('TaskPageListStatusCancel') }}</div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-info text-center text-h6 text-bold compact-section">
                        <div class="count">{{ props.projectDetail.finished_task_count }}</div>
                        <div class="desc">{{ $t('TaskPageListStatusFinish') }}</div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-positive text-center text-h6 text-bold compact-section">
                        <div class="count">{{ props.projectDetail.total_task_count }}</div>
                        <div class="desc">{{ $t('TaskPageListStatusAll') }}</div>
                    </q-card-section>
                </q-card>
            </div>
        </q-card-section>
    </q-card>
    <q-dialog v-model="openFlowSelector">
        <FlowSelect @flowSelected="flowSelected" />
    </q-dialog>
    <q-dialog persistent v-model="openCreateTask">
        <CreateTask v-if="flowDetail.flow_category !== 'CDC'" :flowDetail="flowDetail" :projectDetail="props.projectDetail" @taskCreated="taskCreated($event)" />
        <CreateCdcTask v-if="flowDetail.code === '自建参考基因组'" :flowDetail="flowDetail" :projectDetail="props.projectDetail" @taskCreated="taskCreated($event)" />
    </q-dialog>
</template>
<script setup>
import {ref, computed} from "vue"
import {useApi} from "src/api/apiBase"
import FlowSelect from "./ProjectTask/FlowSelect.vue"
import CreateTask from "./ProjectTask/CreateTask.vue"
import {globalStore} from 'src/stores/global'
import {errorMessage} from 'src/utils/notify'
import {useI18n} from 'vue-i18n'
import {toLocalString} from "src/utils/time"
import CreateCdcTask from "pages/main/projects/ProjectDetail/ProjectTask/CreateCdcTask.vue";

const {t} = useI18n()
const store = globalStore()
const {apiGet} = useApi()
const props = defineProps({projectDetail: Object})
const emit = defineEmits(['reloadProject'])

const openFlowSelector = ref(false)
const openCreateTask = ref(false)
const selectedFlowId = ref(0)
const flowDetail = ref({})

const allowCreateTask = computed(() => {
    const user = store.currentUser
    return user.task_limit === null || user.task_limit > user.task_count
})

const flowSelected = (flow) => {
    openFlowSelector.value = false;
    selectedFlowId.value = flow.id;
    getFlowDetail(flow.id);
}

const taskCreated = (event) => {
    openCreateTask.value = false;
    emit('reloadProject')
}

const clickCreateTask = () => {
    if (!allowCreateTask.value) {
        errorMessage(t('TaskCreateFailedForTaskLimitError'))
    } else {
        openFlowSelector.value = true
    }
}

const getFlowDetail = (flowId) => {
    apiGet(`/flow/flows/${flowId}/`, (res) => {
        flowDetail.value = res.data;
        openCreateTask.value = true;
    });
};
</script>

<style lang="scss" scoped>
.compact-card {
    margin-bottom: 8px;
}

.compact-header {
    padding: 8px 16px;
}

.compact-stats {
    padding: 8px 16px 16px 16px;
}

.my-card {
    text-align: center;
    min-width: 80px;

    &.compact {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .compact-section {
        padding: 8px 12px;
    }

    .count {
        font-size: 1.8em;
        font-weight: bold;
        line-height: 1.2;
        margin-bottom: 2px;
    }

    .title {
        font-size: 1.5em;
        font-weight: bold;
    }

    .desc {
        color: gray;
        font-size: 0.75em;
        line-height: 1.1;
    }
}
</style>

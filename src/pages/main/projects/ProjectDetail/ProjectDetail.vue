<template>
    <q-card class="compact-card">
        <q-card-section class="compact-header">
            <q-toolbar class="q-gutter-x-sm q-py-xs">
                <q-icon size="md" color="primary" name="auto_mode" />
                <q-toolbar-title class="text-h6">
                    {{ props.projectDetail.name }}-
                    <span class="text-subtitle1">{{
                            toLocalString(props.projectDetail.create_time)
                    }}</span>
                </q-toolbar-title>
                <AppActionButton
                    v-permission="'createTask'"
                    variant="primary"
                    :label="$t('ProjectDetailPageCreateTask')"
                    icon="auto_mode"
                    @click="clickCreateTask"
                />
            </q-toolbar>
        </q-card-section>

        <q-card-section class="compact-stats">
            <div class="row items-start q-gutter-sm justify-around">
                <q-card class="my-card compact">
                    <q-card-section class="text-primary compact-section">
                        <div class="row items-center justify-center q-gutter-x-md">
                            <div class="desc">{{ $t('TaskPageListStatusRun') }}</div>
                            <div class="count">{{ props.projectDetail.running_task_count }}</div>
                        </div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-secondary compact-section">
                        <div class="row items-center justify-center q-gutter-x-md">
                            <div class="desc">{{ $t('TaskPageListStatusQueue') }}</div>
                            <div class="count">{{ props.projectDetail.pending_task_count }}</div>
                        </div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-negative compact-section">
                        <div class="row items-center justify-center q-gutter-x-md">
                            <div class="desc">{{ $t('TaskPageListStatusFail') }}</div>
                            <div class="count">{{ props.projectDetail.failured_task_count }}</div>
                        </div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-grey compact-section">
                        <div class="row items-center justify-center q-gutter-x-md">
                            <div class="desc">{{ $t('TaskPageListStatusCancel') }}</div>
                            <div class="count">{{ props.projectDetail.canceled_task_count }}</div>
                        </div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-info compact-section">
                        <div class="row items-center justify-center q-gutter-x-md">
                            <div class="desc">{{ $t('TaskPageListStatusFinish') }}</div>
                            <div class="count">{{ props.projectDetail.finished_task_count }}</div>
                        </div>
                    </q-card-section>
                </q-card>
                <q-card class="my-card compact">
                    <q-card-section class="text-positive compact-section">
                        <div class="row items-center justify-center q-gutter-x-md">
                            <div class="desc">{{ $t('TaskPageListStatusAll') }}</div>
                            <div class="count">{{ props.projectDetail.total_task_count }}</div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </q-card-section>
    </q-card>
    <q-dialog v-model="openFlowSelector">
        <FlowSelect @flowSelected="flowSelected" />
    </q-dialog>
    <q-dialog persistent maximized v-model="openCreateTask">
        <CreateTask :flowDetail="flowDetail" :projectDetail="props.projectDetail" @taskCreated="taskCreated($event)" />
    </q-dialog>
</template>
<script setup>
import {ref, computed} from "vue"
import {useApi} from "src/api/apiBase"
import FlowSelect from "./ProjectTask/FlowSelect.vue"
import CreateTask from "./ProjectTask/CreateTask.vue"
import AppActionButton from 'src/components/button/AppActionButton.vue'
import {globalStore} from 'src/stores/global'
import {errorMessage} from 'src/utils/notify'
import {useI18n} from 'vue-i18n'
import {toLocalString} from "src/utils/time"

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
    padding: 8px 16px 8px 16px;
}

.my-card {
    text-align: center;
    min-width: 80px;

    &.compact {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .compact-section {
        padding: 4px 12px;
    }

    .count {
        font-size: 1.4em;
        font-weight: bold;
        line-height: 1.2;
    }

    .title {
        font-size: 1.5em;
        font-weight: bold;
    }

    .desc {
        color: gray;
        font-size: 0.9em;
        line-height: 1.1;
        font-weight: bold;
    }
}
</style>

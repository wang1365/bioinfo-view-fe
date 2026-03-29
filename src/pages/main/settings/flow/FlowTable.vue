<template>
    <div class="flow-table-page">
        <div class="page-list-filter row q-px-md bio-data-table">
            <q-input
                v-model="keyword"
                :placeholder="$t('ModuleName')"
                clearable
                dense
                filled
                @clear="refreshFlows"
                @keypress.enter="refreshFlows"
                class="page-list-filter__field page-list-filter__field--keyword"
            />
            <q-btn color="primary" icon="search" :label="$t('Search')" @click="refreshFlows" />
            <q-btn color="grey-7" outline icon="close" :label="$t('Reset')" @click="keyword = ''; refreshFlows()" />
        </div>

        <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
            <q-btn color="primary" icon="add" :label="$t('Add')" @click="addFlow" />
        </q-toolbar>

        <a-table
            :columns="columns"
            :data-source="flows"
            size="small"
            bordered
            class="page-grid-table"
            sticky
            row-key="id"
            :scroll="{ x: 1900, y: 560 }"
            :loading="loading"
        >
            <template #bodyCell="{column, record}">
                <template v-if="column.key === 'task_count'">
                    <span v-if="record.task_count >= record?.config?.taskLimit" class="text-red text-weight-bolder">{{ record?.task_count }}</span>
                    <span v-else>{{ record?.task_count }}</span>
                </template>
                <template v-if="column.key === 'config'">
                    <span class="q-mr-xs">{{ record?.config?.taskLimit }}</span>
                    <q-icon
                        :label="$t('Setting')"
                        color="primary"
                        class="cursor-pointer"
                        name="edit"
                        @click="showTaskLimitDlg(record)"
                    ></q-icon>
                </template>
                <template v-if="column.key === 'operation'">
                    <div class="table-operation-buttons">
                        <q-btn
                            :label="$t('Detail')"
                            dense
                            flat
                            no-caps
                            class="table-operation-btn table-operation-btn--primary"
                            @click="showInfoDlg(record)"
                        />
                        <q-btn
                            :label="$t('Edit')"
                            dense
                            flat
                            no-caps
                            class="table-operation-btn table-operation-btn--primary"
                            @click="showEditDlg(record)"
                        />
                        <q-btn
                            :label="$t('Delete')"
                            dense
                            flat
                            no-caps
                            class="table-operation-btn table-operation-btn--danger"
                            @click="showDeleteDlg(record)"
                        />
                    </div>
                </template>
            </template>
        </a-table>
        <flow-dialog ref="dlgFlow" :action="action" :id="currentFlow?.id" @success="refreshFlows" />
        <q-dialog v-model="taskLimitDlgVisible">
            <q-card>
                <q-card-section>
                    <div class="text-h6">{{t('TaskLimit')}}</div>
                </q-card-section>
                <q-form @submit="onUpdateTaskLimit">
                    <q-item>
                        <q-input v-model.number="currentFlow.config.taskLimit" />
                    </q-item>

                    <q-card-actions align="right">
                        <q-btn flat :label="t('Cancel')" color="primary" v-close-popup />
                        <q-btn flat :label="t('Confirm')" color="primary" type="submit" v-close-popup />
                    </q-card-actions>
                </q-form>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { getFlows, deleteFlow, updateFlowTaskConfig } from 'src/api/flow';
import { ref, onMounted, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { format } from 'src/utils/time'
import { useI18n } from 'vue-i18n'
import FlowDialog from './FlowDialog'


const { t } = useI18n()
const loading = ref(false)
const dlgFlow = ref(null)
const taskLimitDlgVisible = ref(false)
const currentFlow = ref({ config: { taskLimit: 0 }})
const keyword = ref('')
const action = ref('info')
const $q = useQuasar()

const columns = computed(() => [
    {key: 'id', title: 'ID', dataIndex: 'id', align: 'center', width: 50, fixed: 'left' },
    {key: 'name', title: t('Name'), dataIndex: 'name', sortable: true, align: 'left', width: 250, fixed: 'left' },
    {key: 'code', title: t('Type'), dataIndex: 'code', align: 'left', sortable: true, width: 250 },
    {key: 'panel_name', title: 'Panel', dataIndex: 'panel_name', align: 'left', sortable: true, width: 200 },
    {key: 'flow_category', title: t('Category'), dataIndex: 'flow_category', align: 'left', width: 70 },
    {key: 'memory', title: t('Memory') + '(m)', align: 'center', dataIndex: 'memory', width: 85,},
    {
        key: 'task_count',
        title: t('TaskCount'),
        dataIndex: 'task_count',
        align: 'center',
        width: 80
    },
    {
        key: 'config',
        title: t('TaskLimit'),
        dataIndex: 'config',
        align: 'center',
        width: 100,
        customRender: ({ text }) => text?.taskLimit
    },
    {key: 'tar_path', title: t('DockerArchive'), dataIndex: 'tar_path', align: 'left', width: 200, ellipsis: true},
    {
        key: 'image_name',
        title: t('DockerImageName'),
        dataIndex: 'image_name',
        align: 'left',
        width: 300,
        ellipsis: true
    },
    {
        key: 'create_time',
        title: t('CreateTime'),
        dataIndex: 'create_time',
        align: 'center',
        width: 200,
        customRender: ({ text }) => format(text)
    },

    { key: 'operation', title: t('Operate'), align: 'center', width: 180, fixed: 'right' },
])

const flows = ref([])

onMounted(() => {
    refreshFlows()
})

const refreshFlows = () => {
    startLoading()
    getFlows(keyword.value, 1, 100)
        .then((data) => {
            flows.value = data.results
        })
        .finally(stopLoading)
}

const startLoading = () => {
    loading.value = true
}

const stopLoading = () => {
    loading.value = false
}

const showTaskLimitDlg = (row) => {
    currentFlow.value = row
    taskLimitDlgVisible.value = true
}

const onUpdateTaskLimit = () => {
    startLoading()
    updateFlowTaskConfig(currentFlow.value.id, currentFlow.value.config)
        .then(() => {
            $q.notify({type: 'positive', message: t('UpdateSuccess')})
            refreshFlows()
        })
        .finally(stopLoading)
}

const showInfoDlg = (row) => {
    currentFlow.value = row
    action.value = 'info'
    dlgFlow.value.show()
    dlgFlow.value.setData(row)
}

const showEditDlg = (row) => {
    currentFlow.value = row
    action.value = 'edit'
    dlgFlow.value.setData(row)
    nextTick(() => {
        dlgFlow.value.show()
    })
}

const showDeleteDlg = (row) => {
    $q.dialog({
        title: t('ConfirmToDelete'),
        ok: t('Confirm'),
        cancel: t('Cancel'),
    }).onOk(() => {
        startLoading()
        deleteFlow(row.id)
            .then(() => {
                $q.notify({type: 'positive', message: t('DeleteSuccess')})
                refreshFlows()
            })
            .finally(stopLoading)
    })
}

const addFlow = () => {
    action.value = 'create'
    currentFlow.value = null
    dlgFlow.value.reset()
    dlgFlow.value.setData({
        name: '',
        location: '',
        alignment_tool: '',
        desp: '',
        flow_category: '',
        details: '',
        parameters: [],
        builtin_parameters: [],
        sample_type: 'multiple',
        allow_nonstandard_samples: true,
        allow_define_report:true,
        support_custom_sample_name: false,
        support_sample_ratio: false,
    })
    dlgFlow.value.show()
}
</script>

<style lang="scss" scoped>
.flow-table-page {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
</style>

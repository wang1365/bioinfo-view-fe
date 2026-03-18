<template>
    <q-page>
        <div class="row q-mb-xs">
            <q-input
                :label="$t('ModuleName')"
                v-model="keyword"
                clearable
                dense
                stack-label
                label-color="primary"
                @clear="refreshFlows"
                @keypress.enter="refreshFlows"
                class="col-2 q-pb-sm"
            />
            <div class="col">
                <q-btn
                    color="primary"
                    icon="search"
                    size="small"
                    class="q-mx-sm"
                    :label="$t('Search')"
                    @click="refreshFlows"
                />
                <q-btn color="primary" icon="add" size="md" :label="$t('Add')" @click="addFlow" />
            </div>
        </div>
        <a-table :columns="columns" :data-source="flows" size="middle" sticky :scroll="{ x:500, y: 450 }" :loading="loading">
            <template v-slot:bodyCell="{column, record}">
                <template v-if="column.key === 'task_count'">
                    <span v-if="record.task_count >= record?.config?.taskLimit" class="text-red text-weight-bolder">
                        {{ record?.task_count }}</span
                    >
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
                    <q-btn :label="$t('Detail')" color="primary" size="md" flat dense @click="showInfoDlg(record)" />
                    <q-btn
                        :label="$t('Edit')"
                        color="orange"
                        size="md"
                        class="q-mx-xs"
                        flat
                        dense
                        @click="showEditDlg(record)"
                    />
                    <q-btn :label="$t('Delete')" color="red" size="md" flat dense @click="showDeleteDlg(record)" />
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
    </q-page>
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
const dlgTaskLimit = ref(null)
const taskLimitDlgVisible = ref(false)
const dlgCreateTask = ref(null)
const currentFlow = ref({ config: { taskLimit: 0 }})
const keyword = ref('')
const action = ref('info')
const selected = ref([])
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

    { key: 'operation', title: t('Operate'), align: 'center', width: 200, fixed: 'right' },
])

const visibleColumns = computed(() => {
    return props.columns || columns.value.map(t => t.name)
})

const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    // rowsNumber: xx if getting data from a server
})

const props = defineProps({
    selection: {
        required: false,
        type: String,
        default: 'none',
    },
    columns: {
        required: false,
        type: Array,
        default: null
    }
})

const flows = ref([])
const selectedFlow = ref({})
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)

onMounted(() => {
    refreshFlows()
})

const refreshFlows = () => {
    startLoading()
    getFlows(keyword.value, 1, 100)
        .then((data) => {
            flows.value = data.results
            total.value = data.count
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
        console.log('nextTick => show edit dlg', row.id)
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

const showCreateTaskDlg = (row) => {
    dlgCreateTask.value.show()
    dlgCreateTask.value.setData(row)
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
    // isCreateDlgShow.value = true
}

const handleSizeChange = (size) => {
    pageSize.value = size
    refreshFlows()
}

const handleCurrentChange = (page) => {
    page.value = page
    refreshFlows()
}
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}
</style>

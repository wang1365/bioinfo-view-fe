<template>
    <q-page>
        <div class="row q-mb-xs">
            <q-input
                :label="$t('ModuleName')"
                v-model="keyword"
                clearable dense stack-label
                label-color="primary"
                @clear="refreshFlows"
                @keypress.enter="refreshFlows"
                class="col-2 q-pb-sm"
            >
            </q-input>
            <div class="col">
                <q-btn color="primary" icon="search" size="small" class="q-mx-sm" :label="$t('Search')"
                       @click="refreshFlows"/>
                <q-btn color="primary" icon="add" size="small" :label="$t('Add')" @click="addFlow"/>
            </div>
        </div>
        <a-table
            :columns="columns"
            :data-source="flows"
            size="middle"
            sticky
            :scroll="{ x:500 }"
        >
            <template v-slot:bodyCell="{column, record}">
                <template v-if="column.key === 'operation'">
                    <q-btn :label="$t('Detail')" color="primary" size="xs" outline @click="showInfoDlg(record)"></q-btn>
                    <q-btn :label="$t('Edit')" color="orange" size="xs" class="q-mx-xs" outline
                           @click="showEditDlg(record)"></q-btn>
                    <q-btn :label="$t('Delete')" color="red" size="xs" outline @click="showDeleteDlg(record)"></q-btn>
                </template>
            </template>
        </a-table>
        <flow-dialog ref="dlgFlow" :action="action" :id="currentFlowId" @success="refreshFlows"/>
        <flow-dialog ref="dlgFlowCreate" action="create" @success="refreshFlows"/>
    </q-page>
</template>

<script setup>
import { getFlows, deleteFlow } from 'src/api/flow'
import { ref, onMounted, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { format } from 'src/utils/time'
import { useI18n } from 'vue-i18n'
import FlowDialog from './FlowDialog'


const { t } = useI18n()
const loading = ref(false)
const dlgFlow = ref(null)
const dlgFlowCreate = ref(null)
const dlgCreateTask = ref(null)
const currentFlowId = ref(null)
const keyword = ref('')
const action = ref('info')
const selected = ref([])
const $q = useQuasar()

const columns = computed(() => [
    {key: 'id', title: 'ID', dataIndex: 'id', align: 'center', width: 50, fixed: 'left' },
    {key: 'name', title: t('Name'), dataIndex: 'name', sortable: true, align: 'left', width: 250, fixed: 'left' },
    {key: 'code', title: t('Type'), dataIndex: 'code', align: 'left', sortable: true, width: 250 },
    {key: 'panel_name', title: 'Panel', dataIndex: 'panel_name', align: 'left', sortable: true, width: 250 },
    {key: 'flow_category', title: t('Category'), dataIndex: 'flow_category', align: 'left', width: 85 },
    {key: 'memory', title: t('Memory') + '(m)', align: 'center', dataIndex: 'memory', width: 85,},
    {key: 'tar_path', title: t('DockerArchive'), dataIndex: 'tar_path', align: 'left', width: 300, ellipsis: true },
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

const flows = ref([
    {
        name: 'WGS',
        location: 'first.sh',
        alignment_tool: 'bioinfo',
        parameters: [
            {key: 'INPUT_DIR', type: 'array', required: true, blank: false},
            {key: 'REPORT_OUTPUT_DIR', type: 'array', required: true, blank: false},
        ],
        desp: 'xxx',
    },
])
const selectedFlow = ref({})
const mode = ref('info')
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

const getTagType = (row) => {
    const cat = row.flow_category
    const data = {
        DNA: 'success',
        RNA: 'primary',
        AMP: 'info',
    }

    return data[cat] || 'info'
}


const startLoading = () => {
    loading.value = true
}

const stopLoading = () => {
    loading.value = false
}


const showInfoDlg = (row) => {
    currentFlowId.value = row.id
    action.value = 'info'
    dlgFlow.value.show()
    dlgFlow.value.setData(row)
}

const showEditDlg = (row) => {
    currentFlowId.value = row.id
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
    console.log('showCreateTaskDlg', row.id)
    dlgCreateTask.value.show()
    dlgCreateTask.value.setData(row)
}

const addFlow = () => {
    dlgFlowCreate.value.setData({
        name: '',
        location: '',
        alignment_tool: '',
        desp: '',
        flow_category: '',
        details: '',
        parameters: [],
        builtin_parameters: [],
        sample_type: 'multiple',
    })
    dlgFlowCreate.value.reset()
    dlgFlowCreate.value.show()
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

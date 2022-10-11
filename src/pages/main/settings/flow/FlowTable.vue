<template>
    <q-page padding>
        <q-table
            :rows="flows"
            :columns="columns"
            :visible-columns="visibleColumns"
            :loading="loading"
            row-key="name"
            hide-no-data
            wrap-cells
            v-model:pagination="pagination"
            :selection="props.selection"
            v-model:selected="selected"
            rows-per-page-label="每页条数"
            :rows-per-page-options="[10, 20, 50, 100]"
        >
            <template v-slot:top>
                <q-input
                    label="模块名称"
                    v-model="keyword"
                    clearable
                    @clear="refreshFlows"
                    @keypress.enter="refreshFlows"
                >
                </q-input>
                <q-btn color="primary" icon="search" class="q-mx-sm" label="查询" @click="refreshFlows" />
                <q-btn color="primary" label="新建分析模块" @click="addFlow" />
            </template>
            <!--            <template v-slot:header="props">-->
            <!--                <q-tr :props="props">-->
            <!--                    <q-th v-for="col in columns" :key="col.name" :props="props" class="text-weight-bolder text-h6">-->
            <!--                        {{ col.label }}-->
            <!--                    </q-th>-->
            <!--                </q-tr>-->
            <!--            </template>-->
            <template v-slot:body-cell-operation="props">
                <q-td :props="props" align="center" class="q-gutter-xs">
                    <q-btn label="查看" color="primary" outline size="sm" @click="showInfoDlg(props.row)"></q-btn>
                    <q-btn label="编辑" color="orange" outline size="sm" @click="showEditDlg(props.row)"></q-btn>
                    <q-btn label="删除" color="red" outline size="sm" @click="showDeleteDlg(props.row)"></q-btn>
                    <!--                    <q-btn label="+" color="red-10" flat size="xs" @click="showCreateTaskDlg(props.row)"></q-btn>-->
                </q-td>
            </template>
        </q-table>

        <flow-dialog ref="dlgFlow" :action="action" :id="currentFlowId" @success="refreshFlows" />
        <flow-dialog ref="dlgFlowCreate" action="create" @success="refreshFlows" />
    </q-page>
</template>

<script setup>
import {getFlows, deleteFlow} from 'src/api/flow'
import {ref, onMounted, computed } from 'vue'
import {useQuasar} from 'quasar'
import PageTitle from 'components/page-title/PageTitle'
import FlowDialog from './FlowDialog'
import TaskParamTable from './components/TaskParamTable'
import { format } from 'src/utils/time'

const loading = ref(false)
const dlgFlow = ref(null)
const dlgFlowCreate = ref(null)
const dlgCreateTask = ref(null)
const currentFlowId = ref(null)
const keyword = ref('')
const action = ref('info')
const selected = ref([])
const $q = useQuasar()
const columns = [
    {name: 'id', label: 'ID', align: 'center', style: 'width:80px', required: true, field: (row) => row.id},
    {name: 'name', label: '名 称', field: 'name', sortable: true, align: 'center'},
    {name: 'code', label: '类型', field: 'code', align: 'center', sortable: true, },
    {name: 'panel_name', label: 'Panel', field: 'panel_name', align: 'center', sortable: true},
    {name: 'flow_category', label: '分 类', field: 'flow_category', align: 'center', },
    {name: 'memory', label: '内存(m)', align: 'center', field: 'memory', style: 'width:85px',},
    {name: 'tar_path', label: 'Docker存档', field: 'tar_path', align: 'center' },
    {name: 'image_name', label: 'Docker镜像名称', field: 'image_name', align: 'center'},
    // {name: 'desp', label: '描述', field: 'desp', align: 'center', style: 'width:220px'},
    {name: 'create_time', label: '创建时间', field: 'create_time', align: 'center', format: v => format(v)},
    {name: 'operation', label: '操 作', align: 'center'},
]

const visibleColumns = computed(() => {
    console.log('visibleColumns', props.columns)
    return props.columns || columns.map(t => t.name)
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
        default: 'multiple',
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
    getFlows(keyword.value,1, 100)
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

const showEditDlg = (row) => {
    console.log('show edit dlg', row.id)
    currentFlowId.value = row.id
    action.value = 'edit'
    dlgFlow.value.show()
    dlgFlow.value.setData(row)
}

const startLoading = () => {
    loading.value = true
}

const stopLoading = () => {
    loading.value = false
}

const showDeleteDlg = (row) => {
    $q.dialog({
        title: `是否要删除流程“${row.name}”?`,
        ok: '确认',
        cancel: '取消',
    }).onOk(() => {
        startLoading()
        deleteFlow(row.id)
            .then(() => {
                $q.notify({type: 'positive', message: '删除成功'})
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

const showInfoDlg = (row) => {
    console.log('showInfoDlg', row.id)
    currentFlowId.value = row.id
    action.value = 'info'
    dlgFlow.value.show()
    dlgFlow.value.setData(row)
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

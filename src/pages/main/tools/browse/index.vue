<template>
    <q-page padding>
        <PageTitle title="样本数据检索" />
        <q-table
            :rows="rows"
            :columns="columns"
            :loading="loading"
            row-key="name"
            hide-no-data
            wrap-cells
            v-model:pagination="pagination"
            rows-per-page-label="每页条数"
            :rows-per-page-options="[10, 20, 50, 100]"
            class="bio-data-table"
        >
            <template v-slot:top>
                <q-btn color="primary" label="新建流程" @click="addFlow" />
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
                    <q-btn label="+" color="red-10" flat size="xs" @click="showCreateTaskDlg(props.row)"></q-btn>
                </q-td>
            </template>
        </q-table>

    </q-page>
</template>

<script setup>
import {getFlows, deleteFlow} from 'src/api/flow'
import {ref, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import PageTitle from 'components/page-title/PageTitle'

const loading = ref(false)
const currentFlowId = ref(null)

const $q = useQuasar()
const columns = [
    {name: 'id', label: 'ID', align: 'center', style: 'width:80px', required: true, field: (row) => row.id},
    {name: 'name', label: '名 称', field: 'name', sortable: true, align: 'center', required: true},
    {name: 'code', label: '类型', field: 'code', align: 'center', sortable: true, required: true},
    {name: 'flow_category', label: '分 类', field: 'flow_category', align: 'center', required: true},
    {name: 'memory', label: '内存(m)', align: 'center', field: 'memory', required: true},
    {name: 'tar_path', label: 'Docker存档', field: 'tar_path', align: 'center', required: true},
    {name: 'image_name', label: 'Docker镜像名称', field: 'image_name', align: 'center', required: true},
    {name: 'desp', label: '描述', field: 'desp', align: 'center', style: 'width:220px', required: true},
    {name: 'create_time', label: '创建时间', field: 'create_time', align: 'center', style: 'width:220px', required: true,},
    {name: 'operation', label: '操 作', align: 'center', style: 'width:250px', required: true},
]

const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    // rowsNumber: xx if getting data from a server
})

const rows = ref([
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
    getFlows(1, 100)
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
    dlgEdit.value.show()
    dlgEdit.value.setData(row)
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
    currentFlowId.value = row.id
    dlgCreateTask.value.show()
    dlgCreateTask.value.setData(row)
}

const showInfoDlg = (row) => {
    dlgInfo.value.show()
    dlgInfo.value.setData(row)
}

const addFlow = () => {
    dlgCreate.value.setData({
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
    dlgCreate.value.reset()
    dlgCreate.value.show()
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

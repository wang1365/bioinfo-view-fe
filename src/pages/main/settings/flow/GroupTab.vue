<template>
    <q-page padding>
        <q-table
            :rows="rows"
            :columns="columns"
            :loading="loading"
            row-key="name"
            hide-no-data
            wrap-cells
            rows-per-page-label="每页条数"
            class="bio-data-table"
            rows-per-page-options="0"
        >
            <template v-slot:top>
                <q-btn color="primary" label="新建分组" @click="addRow" />
                <q-toggle
                    v-model="config.value"
                    :true-value="1"
                    :false-value="0"
                    color="green"
                    checked-icon="check"
                    unchecked-icon="clear"
                    label="是否展示分组"
                    @update:model-value="clickEnabled()"
                />
            </template>
            <template v-slot:body-cell-panels="props">
                <q-td :props="props" align="center">
                    <q-div v-for="item in props.row.panels" :key="item.id">
                        <q-chip :label="item.name" color="primary" outline size="sm" />
                    </q-div>

                    <!--                    <div v-for="item in props.row.panels" :key="item.id">{{item.name}}</div>-->
                </q-td>
            </template>
            <template v-slot:body-cell-operation="props">
                <q-td :props="props" align="center" class="q-gutter-xs">
                    <!--                    <q-btn label="查看" color="primary" outline size="sm" @click="showInfoDlg(props.row)"></q-btn>-->
                    <q-btn label="编辑" color="orange" outline size="sm" @click="showEditDlg(props.row)"></q-btn>
                    <q-btn label="删除" color="red" outline size="sm" @click="showDeleteDlg(props.row)"></q-btn>
                </q-td>
            </template>
        </q-table>

        <group-dialog ref="dlgCreate" mode="create" @success="refreshRows" />
        <group-dialog ref="dlgEdit" mode="edit" @success="refreshRows" />
        <group-dialog ref="dlgInfo" mode="info" />
    </q-page>
</template>

<script setup>
import {getPanelGroups, deletePanelGroup} from 'src/api/panelGroup'
import { createConfig, listConfig, updateConfig } from "src/api/config"
import {ref, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import PageTitle from 'components/page-title/PageTitle'
import GroupDialog from "pages/main/settings/flow/GroupDialog";
import { format } from 'src/utils/time'

const loading = ref(false)
const dlgCreate = ref(null)
const dlgEdit = ref(null)
const dlgInfo = ref(null)
const currentFlowId = ref(null)
const config = ref({value: 0})

const $q = useQuasar()
const columns = [
    {name: 'id', label: 'ID', align: 'center', style: 'width:80px', required: true, field: (row) => row.id},
    {name: 'name', label: '名 称', field: 'name', sortable: true, align: 'center', required: true},
    {name: 'panels', label: 'Panel列表', field: 'panels', sortable: true, align: 'center', required: true},
    {name: 'create_time', label: '创建时间', field: 'create_time', align: 'center', style: 'width:220px', format: v => format(v)},
    {name: 'operation', label: '操 作', align: 'center', style: 'width:250px'},
]


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
const selectedRow = ref({})
const mode = ref('info')
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)

onMounted(() => {
    refreshRows()

    const name = 'panel_group_enabled'
    listConfig({ name }).then(res => {
        if (res.results.length > 0) {
            config.value = res.results[0]
        } else {
            createConfig({
                name,
                value: 0
            }).then(res => {
                config.value = res
            })
        }
    })
})

const refreshRows = () => {
    startLoading()
    getPanelGroups()
        .then((data) => {
            rows.value = data
        })
        .finally(stopLoading)
}

const clickEnabled = () => {
    console.log(111)
    updateConfig(config.value)
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
        title: `是否要删除“${row.name}”?`,
        ok: '确认',
        cancel: '取消',
    }).onOk(() => {
        startLoading()
        deletePanelGroup(row.id)
            .then(() => {
                $q.notify({type: 'positive', message: '删除成功'})
                refreshRows()
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

const addRow = () => {
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
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}
</style>

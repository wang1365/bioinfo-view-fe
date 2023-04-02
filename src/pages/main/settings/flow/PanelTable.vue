<template>
    <q-page padding>
        <q-table
            :rows="rows"
            :columns="columns"
            :loading="loading"
            :visible-columns="visibleColumns"
            row-key="name"
            hide-no-data
            wrap-cells
            rows-per-page-label="每页条数"
            rows-per-page-options="0"
            class="bio-data-table"
        >
            <template v-slot:top>
                <q-input
                    label="流程名称"
                    v-model="keyword"
                    clearable
                    @clear="refreshRows"
                    @keypress.enter="refreshRows"
                >
                </q-input>
                <q-btn color="primary" icon="search" class="q-mx-sm" label="查询" @click="refreshRows" />
                <q-btn v-if="!props.readonly" color="primary" label="新建Panel流程" @click="addRow" />
            </template>
            <template v-slot:body-cell-flows="props">
                <q-td :props="props" align="center" class="q-gutter-xs">
                    <div v-for="item in props.row.flows" :key="item.id">
                        <q-chip outline color="primary" size="sm" :label="item.name" />
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-operation="props">
                <q-td :props="props" align="center" class="q-gutter-xs">
                    <q-btn :label="$t('Edit')" color="orange" size="sm" @click="showEditDlg(props.row)"></q-btn>
                    <q-btn :label="$t('Delete')" color="red" size="sm" @click="showDeleteDlg(props.row)"></q-btn>
                </q-td>
            </template>
        </q-table>

        <panel-dialog ref="dlgCreate" mode="create" @success="refreshRows" />
        <panel-dialog ref="dlgEdit" mode="edit" @success="refreshRows" />
        <panel-dialog ref="dlgInfo" mode="info" />
    </q-page>
</template>

<script setup>
import {getPanels, deletePanel} from 'src/api/panel'
import {ref, onMounted, computed} from 'vue'
import {useQuasar} from 'quasar'
import { format } from 'src/utils/time'
import PanelDialog from "pages/main/settings/flow/PanelDialog"

const loading = ref(false)
const dlgCreate = ref(null)
const dlgEdit = ref(null)
const dlgInfo = ref(null)
const currentFlowId = ref(null)
const keyword = ref('')

const $q = useQuasar()
const columns = [
    {name: 'id', label: 'ID', align: 'center', style: 'width:80px', required: true, field: (row) => row.id},
    {name: 'name', label: '名 称', field: 'name', sortable: true, align: 'center'},
    {name: 'panel_group_name', label: 'Panel分组', field: row => row.panel_group_name, sortable: true, align: 'center'},
    {name: 'flows', label: '分析模块', field: 'flows', align: 'center', style: 'width:220px'},
    {name: 'create_time', label: '创建时间', field: 'create_time', align: 'center', style: 'width:220px', 'format': v => format(v)},
    {name: 'operation', label: '操 作', align: 'center', style: 'width:250px'},
]


const rows = ref([])
const selectedRow = ref({})
const mode = ref('info')
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)

const props = defineProps({
    selection: {
      required: false,
      type: String,
      default: 'single'
    },
    readonly: {
        required: false,
        type: Boolean,
        default: false
    },
    columns: {
        required: false,
        type: Array,
        default: null
    }
})

const visibleColumns = computed(() => {
    const vcs = props.columns || columns.map(t => t.name)
    if (props.readonly) {
        return vcs.filter( t => t.name !== 'operation')
    } else {
        return vcs
    }
})

onMounted(() => {
    refreshRows()
})

const refreshRows = () => {
    startLoading()

    const params = {}
    if (keyword.value && keyword.value !== '') {
        params.keyword = keyword.value
    }
    getPanels(params)
        .then((data) => {
            rows.value = data
        })
        .finally(stopLoading)
}


const showEditDlg = (row) => {
    dlgEdit.value.show()
    // const data = { ...row, panel_group_id: row.panel_group.id}
    // const data = { id: row.id, name: row.name, panel_group_id: row.panel_group.id }
    // Reflect.deleteProperty(data, 'panel_group')
    // delete data.panel_group
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
        deletePanel(row.id)
            .then(() => {
                $q.notify({type: 'positive', message: '删除成功'})
                refreshRows()
            })
            .finally(stopLoading)
    })
}


const showInfoDlg = (row) => {
    dlgInfo.value.show()
    dlgInfo.value.setData(row)
}

const addRow = () => {
    dlgCreate.value.setData({
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

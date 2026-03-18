<template>
    <q-page>
        <q-table
            :rows="rows"
            :columns="columns"
            :loading="loading"
            :visible-columns="visibleColumns"
            :table-style="{ height: '600px' }"
            row-key="name"
            hide-no-data
            wrap-cells
            dense
            rows-per-page-label="每页条数"
            rows-per-page-options="0"
            class="bio-data-table"
        >
            <template v-slot:top>
                <q-input
                    :label="$t('FlowName')"
                    v-model="keyword"
                    clearable
                    @clear="refreshRows"
                    @keypress.enter="refreshRows"
                >
                </q-input>
                <q-btn color="primary" icon="search" class="q-mx-sm" :label="$t('Search')" @click="refreshRows" />
                <q-btn v-if="!props.readonly" color="primary" :label="$t('Add')" @click="addRow" />
            </template>
            <template v-slot:body-cell-flows="props">
                <q-td :props="props" class="q-gutter-xs">
                    <template v-for="item in props.row.flows" :key="item.id">
                        <q-chip outline color="primary" size="md" :label="item.name" />
                    </template>
                </q-td>
            </template>
            <template v-slot:body-cell-operation="props">
                <q-td :props="props" align="center" class="q-gutter-xs">
                    <q-btn
                        :label="$t('Edit')"
                        color="orange"
                        size="md"
                        flat
                        dense
                        @click="showEditDlg(props.row)"
                    ></q-btn>
                    <q-btn
                        :label="$t('Delete')"
                        color="red"
                        size="md"
                        flat
                        dense
                        @click="showDeleteDlg(props.row)"
                    ></q-btn>
                </q-td>
            </template>
        </q-table>

        <panel-dialog ref="dlgPanel" :mode="dialogMode" @success="refreshRows" />
    </q-page>
</template>

<script setup>
import {getPanels, deletePanel} from 'src/api/panel'
import {ref, onMounted, computed} from 'vue'
import {useQuasar} from 'quasar'
import { format } from 'src/utils/time'
import PanelDialog from "pages/main/settings/flow/PanelDialog"
import { useI18n }from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const dlgPanel = ref(null)
const dialogMode = ref('info')
const currentFlowId = ref(null)
const keyword = ref('')

const $q = useQuasar()
const columns = computed(() => [
    {name: 'id', label: 'ID', align: 'center', style: 'width:80px', required: true, field: (row) => row.id},
    {name: 'name', label: t('Name'), field: 'name', style: 'width:120px', sortable: true, align: 'left'},
    {name: 'panel_group_name', label: t('PanelGroup'), style: 'width:120px', field: row => row.panel_group_name, sortable: true, align: 'left'},
    {name: 'flows', label: t('AnalysisModule'), field: 'flows', align: 'left', style: 'width:320px'},
    {name: 'create_time', label: t('CreateTime'), field: 'create_time', align: 'center', style: 'width:120px', 'format': v => format(v)},
    {name: 'operation', label: t('Operate'), align: 'center', style: 'width:120px'},
])


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
    const vcs = props.columns || columns.value.map(t => t.name)
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
    params.flow_brief = 1
    getPanels(params)
        .then((data) => {
            rows.value = data
        })
        .finally(stopLoading)
}


const showEditDlg = (row) => {
    dialogMode.value = 'edit'
    dlgPanel.value.show()
    // const data = { ...row, panel_group_id: row.panel_group.id}
    // const data = { id: row.id, name: row.name, panel_group_id: row.panel_group.id }
    // Reflect.deleteProperty(data, 'panel_group')
    // delete data.panel_group
    dlgPanel.value.setData(row)
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
    dialogMode.value = 'info'
    dlgPanel.value.show()
    dlgPanel.value.setData(row)
}

const addRow = () => {
    dialogMode.value = 'create'
    dlgPanel.value.setData({
    })
    dlgPanel.value.reset()
    dlgPanel.value.show()
    // isCreateDlgShow.value = true
}
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}
</style>

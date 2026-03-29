<template>
    <div class="panel-table-page">
        <div class="page-list-filter row q-px-md bio-data-table">
            <q-input
                v-model="keyword"
                :placeholder="$t('FlowName')"
                clearable
                dense
                filled
                class="page-list-filter__field page-list-filter__field--keyword"
                @keypress.enter="refreshRows"
                @clear="refreshRows"
            />
            <q-btn color="primary" icon="search" :label="$t('Search')" @click="refreshRows" />
            <q-btn color="grey-7" outline icon="close" :label="$t('Reset')" @click="keyword = ''; refreshRows()" />
        </div>

        <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
            <q-btn v-if="!props.readonly" color="primary" icon="add" :label="$t('Add')" @click="addRow" />
        </q-toolbar>

        <a-table
            :columns="tableColumns"
            :data-source="rows"
            :loading="loading"
            :pagination="pagination"
            :scroll="{ x: 1200, y: 600 }"
            row-key="id"
            class="page-grid-table"
            size="small"
            bordered
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'flows'">
                    <div class="flow-cell">
                        <a-tag v-for="item in record.flows.slice(0, 2)" :key="item.id" color="blue">
                            {{ item.name }}
                        </a-tag>
                        <q-btn
                            v-if="record.flows.length > 2"
                            dense
                            flat
                            no-caps
                            class="table-operation-btn table-operation-btn--primary"
                            @click="showFlowModal(record)"
                        >
                            {{ $t('More') }}({{ record.flows.length }})
                        </q-btn>
                    </div>
                </template>

                <template v-else-if="column.key === 'create_time'">
                    {{ format(record.create_time) }}
                </template>

                <template v-else-if="column.key === 'operation'">
                    <div class="table-operation-buttons">
                        <q-btn
                            dense
                            flat
                            no-caps
                            :label="$t('Edit')"
                            class="table-operation-btn table-operation-btn--primary"
                            @click="showEditDlg(record)"
                        />
                        <q-btn
                            dense
                            flat
                            no-caps
                            :label="$t('Delete')"
                            class="table-operation-btn table-operation-btn--danger"
                            @click="showDeleteDlg(record)"
                        />
                    </div>
                </template>
            </template>
        </a-table>
    </div>

    <a-modal
        v-model:visible="flowModalVisible"
        :title="flowModalTitle"
        :footer="null"
        width="640px"
    >
        <a-table
            :columns="flowModalColumns"
            :data-source="flowModalRows"
            :pagination="false"
            row-key="key"
            size="small"
        />
    </a-modal>

    <panel-dialog ref="dlgPanel" :mode="dialogMode" @success="refreshRows" />
</template>

<script setup>
import { Modal } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { deletePanel, getPanels } from 'src/api/panel'
import PanelDialog from 'pages/main/settings/flow/PanelDialog'
import { format } from 'src/utils/time'

const props = defineProps({
    selection: {
        required: false,
        type: String,
        default: 'single',
    },
    readonly: {
        required: false,
        type: Boolean,
        default: false,
    },
    columns: {
        required: false,
        type: Array,
        default: null,
    },
})

const { t } = useI18n()
const $q = useQuasar()

const loading = ref(false)
const rows = ref([])
const dlgPanel = ref(null)
const dialogMode = ref('info')
const keyword = ref('')
const flowModalVisible = ref(false)
const currentFlowModules = ref([])
const currentPanelName = ref('')

const defaultColumns = computed(() => [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        align: 'center',
    },
    {
        title: t('Name'),
        dataIndex: 'name',
        key: 'name',
        width: 160,
    },
    {
        title: t('PanelGroup'),
        dataIndex: 'panel_group_name',
        key: 'panel_group_name',
        width: 160,
    },
    {
        title: t('AnalysisModule'),
        dataIndex: 'flows',
        key: 'flows',
        width: 360,
    },
    {
        title: t('CreateTime'),
        dataIndex: 'create_time',
        key: 'create_time',
        width: 180,
        align: 'center',
    },
    {
        title: t('Operate'),
        key: 'operation',
        width: 140,
        align: 'center',
    },
])

const tableColumns = computed(() => {
    const columns = props.columns || defaultColumns.value
    if (props.readonly) {
        return columns.filter(column => column.key !== 'operation')
    }
    return columns
})

const pagination = computed(() => ({
    pageSize: 10,
    showSizeChanger: false,
}))

const flowModalTitle = computed(() => `${currentPanelName.value || ''} ${t('AnalysisModule')}`)
const flowModalColumns = computed(() => [
    {
        title: 'No.',
        dataIndex: 'index',
        key: 'index',
        width: 80,
        align: 'center',
    },
    {
        title: 'Module ID',
        dataIndex: 'id',
        key: 'id',
        width: 120,
        align: 'center',
    },
    {
        title: t('Name'),
        dataIndex: 'name',
        key: 'name',
    },
])

const flowModalRows = computed(() =>
    currentFlowModules.value.map((item, index) => ({
        key: `${item.id}-${index}`,
        index: index + 1,
        id: item.id,
        name: item.name,
    }))
)

onMounted(() => {
    refreshRows()
})

const startLoading = () => {
    loading.value = true
}

const stopLoading = () => {
    loading.value = false
}

const normalizeRows = data =>
    (data || []).map(item => ({
        ...item,
        flows: Array.isArray(item.flows) ? item.flows : [],
    }))

const refreshRows = () => {
    startLoading()

    const params = {
        flow_brief: 1,
    }

    if (keyword.value) {
        params.keyword = keyword.value
    }

    getPanels(params)
        .then(data => {
            rows.value = normalizeRows(data)
        })
        .finally(stopLoading)
}

const showFlowModal = row => {
    currentPanelName.value = row.name
    currentFlowModules.value = row.flows || []
    flowModalVisible.value = true
}

const showEditDlg = row => {
    dialogMode.value = 'edit'
    dlgPanel.value.show()
    dlgPanel.value.setData(row)
}

const showDeleteDlg = row => {
    Modal.confirm({
        title: `${t('ConfirmToDelete')} ${row.name}?`,
        okText: t('Confirm'),
        cancelText: t('Cancel'),
        onOk: () => {
            startLoading()
            return deletePanel(row.id)
                .then(() => {
                    $q.notify({ type: 'positive', message: t('DeleteSuccess') })
                    refreshRows()
                })
                .finally(stopLoading)
        },
    })
}

const addRow = () => {
    dialogMode.value = 'create'
    dlgPanel.value.setData({})
    dlgPanel.value.reset()
    dlgPanel.value.show()
}
</script>

<style lang="scss" scoped>
.panel-table-page {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.flow-cell {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    line-height: 1.2;
}
</style>

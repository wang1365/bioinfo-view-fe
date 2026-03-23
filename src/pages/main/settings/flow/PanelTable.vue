<template>
    <q-page>
        <div class="panel-table-page">
            <div class="table-toolbar">
                <a-input
                    v-model:value="keyword"
                    :placeholder="$t('FlowName')"
                    allow-clear
                    class="toolbar-search"
                    @pressEnter="refreshRows"
                    @change="handleKeywordChange"
                />
                <a-button type="primary" @click="refreshRows">
                    {{ $t('Search') }}
                </a-button>
                <a-button v-if="!props.readonly" type="primary" @click="addRow">
                    {{ $t('Add') }}
                </a-button>
            </div>

            <a-table
                :columns="tableColumns"
                :data-source="rows"
                :loading="loading"
                :pagination="pagination"
                :scroll="{ y: 600 }"
                row-key="id"
                class="bio-ant-table"
                size="small"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'flows'">
                        <div class="flow-cell">
                            <a-tag v-for="item in record.flows.slice(0, 2)" :key="item.id" color="blue">
                                {{ item.name }}
                            </a-tag>
                            <a-button
                                v-if="record.flows.length > 2"
                                type="link"
                                size="small"
                                class="more-btn"
                                @click="showFlowModal(record)"
                            >
                                更多({{ record.flows.length }})
                            </a-button>
                        </div>
                    </template>

                    <template v-else-if="column.key === 'create_time'">
                        {{ format(record.create_time) }}
                    </template>

                    <template v-else-if="column.key === 'operation'">
                        <div class="operation-cell">
                            <a-button type="link" @click="showEditDlg(record)">
                                {{ $t('Edit') }}
                            </a-button>
                            <a-button danger type="link" @click="showDeleteDlg(record)">
                                {{ $t('Delete') }}
                            </a-button>
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
    </q-page>
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
    showTotal: total => `共 ${total} 条`,
}))

const flowModalTitle = computed(() => `${currentPanelName.value || ''} 关联分析模块`)
const flowModalColumns = computed(() => [
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 80,
        align: 'center',
    },
    {
        title: '模块 ID',
        dataIndex: 'id',
        key: 'id',
        width: 120,
        align: 'center',
    },
    {
        title: '模块名称',
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

const handleKeywordChange = event => {
    if (!event.target.value) {
        refreshRows()
    }
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
        title: `是否要删除“${row.name}”？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
            startLoading()
            return deletePanel(row.id)
                .then(() => {
                    $q.notify({ type: 'positive', message: '删除成功' })
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
    gap: 12px;
}

.table-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toolbar-search {
    width: 280px;
}

.bio-ant-table :deep(.ant-table-cell) {
    vertical-align: top;
    padding: 8px 10px;
}

.bio-ant-table :deep(.ant-table-thead > tr > th) {
    padding: 10px;
}

.bio-ant-table :deep(.ant-pagination) {
    margin-top: 16px;
}

.bio-ant-table :deep(.ant-pagination-item),
.bio-ant-table :deep(.ant-pagination-prev),
.bio-ant-table :deep(.ant-pagination-next),
.bio-ant-table :deep(.ant-pagination-jump-prev),
.bio-ant-table :deep(.ant-pagination-jump-next) {
    margin-inline-end: 10px;
}

.flow-cell {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    line-height: 1.2;
}

.more-btn {
    padding-inline: 0;
    height: auto;
}

.operation-cell {
    display: flex;
    justify-content: center;
    gap: 4px;
}

</style>

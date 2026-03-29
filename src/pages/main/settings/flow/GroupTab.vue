<template>
    <div class="group-table-page">
        <div class="page-list-filter row q-px-md bio-data-table">
            <q-toggle
                v-model="config.value"
                :true-value="1"
                :false-value="0"
                color="green"
                checked-icon="check"
                unchecked-icon="clear"
                :label="$t('ShowGroup')"
                @update:model-value="clickEnabled"
            />
        </div>

        <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
            <AppActionButton variant="primary" icon="add" :label="$t('Add')" @click="addRow" />
        </q-toolbar>

        <AppDataTable
            :columns="columns"
            :data-source="rows"
            :loading="loading"
            row-key="id"
            size="small"
            bordered
            class="page-grid-table"
            :scroll="{ x: 980, y: 600 }"
            :pagination="false"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'panels'">
                    <div class="group-panels-cell">
                        <a-tag v-for="item in record.panels" :key="item.id" color="blue">
                            {{ item.name }}
                        </a-tag>
                    </div>
                </template>
                <template v-else-if="column.key === 'create_time'">
                    {{ format(record.create_time) }}
                </template>
                <template v-else-if="column.key === 'operation'">
                    <div class="table-operation-buttons">
                        <TableActionButton
                            :label="$t('Edit')"
                            variant="primary"
                            @click="showEditDlg(record)"
                        />
                        <TableActionButton
                            :label="$t('Delete')"
                            variant="danger"
                            @click="showDeleteDlg(record)"
                        />
                    </div>
                </template>
            </template>
        </AppDataTable>

        <group-dialog ref="dlgCreate" mode="create" @success="refreshRows" />
        <group-dialog ref="dlgEdit" mode="edit" @success="refreshRows" />
    </div>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { getPanelGroups, deletePanelGroup } from 'src/api/panelGroup'
import { createConfig, listConfig, updateConfig } from 'src/api/config'
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import GroupDialog from 'pages/main/settings/flow/GroupDialog'
import { format } from 'src/utils/time'
import { useI18n } from 'vue-i18n'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'

const { t } = useI18n()
const loading = ref(false)
const dlgCreate = ref(null)
const dlgEdit = ref(null)
const config = ref({ value: 0 })

const $q = useQuasar()
const columns = computed(() => [
    { key: 'id', title: 'ID', dataIndex: 'id', align: 'center', width: 80, fixed: 'left' },
    { key: 'name', title: t('Name'), dataIndex: 'name', align: 'left', width: 180 },
    { key: 'panels', title: 'Panel', dataIndex: 'panels', align: 'left', width: 480 },
    { key: 'create_time', title: t('CreateTime'), dataIndex: 'create_time', align: 'center', width: 180 },
    { key: 'operation', title: t('Operate'), align: 'center', width: 130, fixed: 'right' },
])

const rows = ref([])

onMounted(() => {
    refreshRows()

    const name = 'panel_group_enabled'
    listConfig({ name }).then(res => {
        if (res.results.length > 0) {
            config.value = res.results[0]
        } else {
            createConfig({
                name,
                value: 0,
            }).then(createRes => {
                config.value = createRes
            })
        }
    })
})

const refreshRows = () => {
    startLoading()
    getPanelGroups({ panel_brief: 1 })
        .then(data => {
            rows.value = data
        })
        .finally(stopLoading)
}

const clickEnabled = () => {
    updateConfig(config.value)
}

const showEditDlg = row => {
    dlgEdit.value.show()
    dlgEdit.value.setData(row)
}

const startLoading = () => {
    loading.value = true
}

const stopLoading = () => {
    loading.value = false
}

const showDeleteDlg = row => {
    $q.dialog({
        title: `${t('ConfirmToDelete')} ${row.name}?`,
        ok: t('Confirm'),
        cancel: t('Cancel'),
    }).onOk(() => {
        startLoading()
        deletePanelGroup(row.id)
            .then(() => {
                $q.notify({ type: 'positive', message: t('DeleteSuccess') })
                refreshRows()
            })
            .finally(stopLoading)
    })
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
}
</script>

<style lang="scss" scoped>
.group-table-page {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.group-panels-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
</style>

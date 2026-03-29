<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('CustomReferenceGenome')" />
        <q-card class="q-mt-xs ref-genome-card page-list-card" flat>
            <div>
                <div class="page-list-filter row q-px-md bio-data-table">
                    <q-input
                        class="page-list-filter__field page-list-filter__field--keyword"
                        style="width: 320px"
                        filled
                        dense
                        v-model="search"
                        :label="$t('SearchCustomDatabase')"
                        clearable
                        @clear="refreshPage()"
                    />
                    <AppActionButton variant="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                    <AppActionButton :label="$t('Reset')" icon="clear" @click="resetSearch()" />
                </div>
            </div>
            <div>
                <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
                    <AppActionButton
                        v-if="canCreate"
                        variant="primary"
                        :label="$t('Add')"
                        icon="description"
                        @click="openNewDialog = true"
                    />
                </q-toolbar>
            </div>
            <div class="q-pt-sm q-px-md q-pb-md bio-data-table">
                <a-table
                    class="page-grid-table"
                    :columns="columns"
                    :data-source="dataItems"
                    :pagination="paginationConfig"
                    :loading="loading"
                    :scroll="tableScroll"
                    :locale="tableLocale"
                    row-key="id"
                    size="small"
                    bordered
                    @change="handleTableChange"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'virus_name'">
                            {{ formatJsonField(record.virus_name) }}
                        </template>
                        <template v-else-if="column.key === 'virus_type'">
                            {{ formatJsonField(record.virus_type) }}
                        </template>
                        <template v-else-if="column.key === 'status'">
                            {{ formatStatus(record.status) }}
                        </template>
                        <template v-else-if="column.key === 'create_time'">
                            {{ toLocalString(record.create_time) }}
                        </template>
                        <template v-else-if="column.key === 'actions'">
                            <div class="table-operation-buttons">
                                <TableActionButton
                                    variant="primary"
                                    :label="$t('Detail')"
                                    @click="gotoDetail(record)"
                                />
                                <TableActionButton
                                    v-if="canDelete"
                                    variant="danger"
                                    :label="$t('Delete')"
                                    @click="confirmDelete(record)"
                                />
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </q-card>
        <CreateCustomReferenceGenomeDialog v-model:visible="openNewDialog" @save="handleDialogSave" />
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getCustomReferenceGenomeList, deleteCustomReferenceGenome } from 'src/api/customReferenceGenome'
import { infoMessage, errorMessage } from 'src/utils/notify'
import { toLocalString } from 'src/utils/time'
import { getCurrentUser } from 'src/utils/user'
import PageTitle from 'components/page-title/PageTitle.vue'
import CreateCustomReferenceGenomeDialog from './CreateCustomReferenceGenomeDialog.vue'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

const currentUser = getCurrentUser()
const userPermissions = computed(() => currentUser?.permissions || {})
const isSuper = computed(() => currentUser?.role_list?.includes('super') || false)
const canCreate = computed(() => isSuper.value || userPermissions.value.createReferenceGenome)
const canDelete = computed(() => isSuper.value || userPermissions.value.deleteReferenceGenome)

const search = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dataItems = ref([])
const loading = ref(false)
const openNewDialog = ref(false)

const columns = computed(() => [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
    { title: t('CustomDatabase'), dataIndex: 'custom_database', key: 'custom_database', width: 220, ellipsis: true, align: 'center' },
    { title: t('SpeciesName2'), dataIndex: 'virus_name', key: 'virus_name', width: 220, ellipsis: true, align: 'center' },
    { title: t('SubTypes'), dataIndex: 'virus_type', key: 'virus_type', width: 220, ellipsis: true, align: 'center' },
    { title: t('Host'), dataIndex: 'host', key: 'host', width: 160, align: 'center' },
    { title: t('HostGenomeVersion'), dataIndex: 'host_genome_version', key: 'host_genome_version', width: 200, align: 'center' },
    { title: t('Status'), dataIndex: 'status', key: 'status', width: 100, align: 'center' },
    { title: t('CreatedAt'), dataIndex: 'create_time', key: 'create_time', width: 180, align: 'center' },
    { title: t('Operation'), key: 'actions', width: 180, fixed: 'right', align: 'center' },
])

const paginationConfig = computed(() => ({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    showSizeChanger: true,
    showTotal: (ttl) => t('PaginationTotal', { total: ttl }),
    pageSizeOptions: ['10', '20', '50', '100'],
}))

const tableLocale = computed(() => ({
    emptyText: t('NoData'),
}))

const tableScroll = computed(() => ({
    x: 1400,
    y: 'calc(100vh - 370px)',
}))

onMounted(() => {
    loadPage()
})

const formatJsonField = (jsonData) => {
    if (!jsonData) return ''
    try {
        if (typeof jsonData === 'string') {
            const parsed = JSON.parse(jsonData)
            return Object.values(parsed).join(', ')
        }
        if (typeof jsonData === 'object') {
            return Object.values(jsonData).join(', ')
        }
        return String(jsonData)
    } catch (e) {
        return String(jsonData)
    }
}

const formatStatus = (status) => {
    if (!status) return ''
    switch (status.toUpperCase()) {
        case 'RUNNING':
            return t('Running')
        case 'DONE':
            return t('Done')
        default:
            return status
    }
}

const loadPage = async () => {
    try {
        loading.value = true
        const params = {
            page: currentPage.value,
            page_size: pageSize.value,
        }
        if (search.value) {
            params.custom_database = search.value
        }
        const data = await getCustomReferenceGenomeList(params)
        dataItems.value = data.results || []
        total.value = data.count || 0
    } catch (error) {
        errorMessage(t('LoadDataFailed') || 'Load data failed')
        console.error('Load data failed:', error)
    } finally {
        loading.value = false
    }
}

const refreshPage = () => {
    currentPage.value = 1
    loadPage()
}

const resetSearch = () => {
    search.value = ''
    refreshPage()
}

const handleTableChange = (pagination) => {
    currentPage.value = pagination.current
    pageSize.value = pagination.pageSize
    loadPage()
}

const gotoDetail = (item) => {
    router.push(`/main/settings/customReferenceGenome/${item.id}`)
}

const handleDialogSave = async () => {
    loadPage()
}

const confirmDelete = (item) => {
    $q.dialog({
        title: t('ConfirmToDelete'),
        message: `${t('ConfirmDeleteReferenceGenome')} "${item.custom_database}"`,
        cancel: true,
        persistent: true,
    }).onOk(async () => {
        try {
            await deleteCustomReferenceGenome(item.id)
            infoMessage(t('ReferenceGenomeDeleteSuccess'))
            loadPage()
        } catch (error) {
            errorMessage(t('Failed'))
            console.error('Delete failed:', error)
        }
    })
}
</script>

<style lang="scss">
.ref-genome-card {
    min-height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
}

.ref-genome-card .bio-data-table {
    flex: 1;
    display: flex;
}

.ref-genome-card .bio-data-table .ant-table-wrapper {
    flex: 1;
}
</style>

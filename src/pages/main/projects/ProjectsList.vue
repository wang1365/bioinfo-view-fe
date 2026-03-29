<template>
    <q-card class="projects-card page-list-card" flat>
        <div>
            <div class="page-list-filter row q-px-md bio-data-table">
                <q-input
                    class="page-list-filter__field page-list-filter__field--keyword"
                    style="width: 250px"
                    filled
                    dense
                    v-model="search"
                    :label="$t('ProjectPageListSearchInput')"
                    clearable
                    @clear="refreshPage()"
                />
                <AppActionButton variant="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                <AppActionButton :label="$t('Reset')" icon="clear" @click="reset()" />
            </div>
        </div>
        <div>
            <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
                <AppActionButton
                    v-permission="'createProject'"
                    variant="primary"
                    :label="$t('ProjectPageListSearchNewBtn')"
                    icon="description"
                    @click="openNewProject = true"
                />
            </q-toolbar>
        </div>
        <div>
            <div class="q-pt-sm q-px-md q-pb-md bio-data-table">
                <AppDataTable
                    class="page-grid-table"
                    :data-source="dataItems"
                    :columns="columns"
                    :loading="loading"
                    :pagination="pagination"
                    :scroll="tableScrollY"
                    row-key="id"
                    @change="handleTableChange"
                    :locale="tableLocale"
                    size="small"
                    bordered
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'create_time'">
                            {{ toLocalString(record.create_time) }}
                        </template>
                        <template v-else-if="column.key === 'samples'">
                            {{ (record.samples || []).length }}
                        </template>
                        <template v-else-if="column.key === 'operation'">
                            <div class="table-operation-buttons">
                                <TableActionButton
                                    variant="primary"
                                    :label="$t('Detail')"
                                    @click="gotoChild(record)"
                                />
                                <TableActionButton
                                    variant="primary"
                                    :label="$t('Edit')"
                                    @click="updateProjectName = record.name; currentProject = record; openEditProject = true"
                                />
                                <TableActionButton
                                    v-permission="'deleteProject'"
                                    variant="danger"
                                    :label="$t('Delete')"
                                    @click="confirm(record)"
                                />
                            </div>
                        </template>
                    </template>
                </AppDataTable>
            </div>
        </div>
    </q-card>
    <q-dialog v-model="openNewProject" persistent>
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>{{ $t('ProjectPageListSearchNewBtn') }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-separator></q-separator>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input v-model="newProjectName" :label="$t('ProjectPageListSearchInput')" />
                        </q-section>
                    </q-item>
                    <q-item>
                        <q-section v-if="newProjectNameError" class="full-width text-red">
                            {{ newProjectNameError }}
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-section>
            <q-card-actions align="right" class="bg-white text-teal">
                <q-list>
                    <q-item>
                        <q-section class="q-gutter-x-sm">
                            <AppActionButton :label="$t('Cancel')" v-close-popup />
                            <AppActionButton variant="primary" :label="$t('Confirm')" @click="createProject()" />
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="openEditProject" persistent>
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>{{ $t('ProjectPageListEditProject') }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input v-model="updateProjectName" :label="$t('ProjectPageListSearchInput')" />
                        </q-section>
                    </q-item>
                    <q-item>
                        <q-section v-if="updateProjectNameError" class="full-width text-red">
                            {{ updateProjectNameError }}
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-section>
            <q-card-actions align="right" class="bg-white text-teal">
                <q-list>
                    <q-item>
                        <q-section class="q-gutter-x-sm">
                            <AppActionButton :label="$t('Cancel')" v-close-popup />
                            <AppActionButton variant="primary" :label="$t('Confirm')" @click="updateProject()" />
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from 'src/api/apiBase'
import { infoMessage } from 'src/utils/notify'
import { useI18n } from 'vue-i18n'
import { toLocalString } from 'src/utils/time'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'

const { t } = useI18n()
const { apiGet, apiPut, apiPost, apiDelete } = useApi()

const search = ref('')
const openNewProject = ref(false)

const openEditProject = ref(false)
const newProjectName = ref('')
const currentProject = ref({})
const newProjectNameError = ref('')
const updateProjectName = ref('')
const updateProjectNameError = ref('')

const router = useRouter()
const $q = useQuasar()
const dataItems = ref([])
const loading = ref(false)

const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => t('PaginationTotal', { total }),
    pageSizeOptions: ['10', '20', '50', '100'],
})

const columns = computed(() => [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        width: 80,
    },
    {
        title: t('ProjectPageListTableName'),
        dataIndex: 'name',
        key: 'name',
        align: 'center',
    },
    {
        title: t('ProjectPageListTableCreater'),
        dataIndex: 'owner',
        key: 'owner',
        align: 'center',
    },
    {
        title: t('ProjectPageListTableCreateTime'),
        dataIndex: 'create_time',
        key: 'create_time',
        align: 'center',
    },
    {
        title: t('ProjectPageListTableSampleCount'),
        dataIndex: 'samples',
        key: 'samples',
        align: 'center',
    },
    {
        title: t('ProjectPageListTableTaskCount'),
        dataIndex: 'task_count',
        key: 'task_count',
        align: 'center',
    },
    {
        title: t('ProjectPageListTableOperate'),
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        width: 220,
    },
])

const tableLocale = computed(() => ({
    emptyText: t('NoData'),
}))

const tableScrollY = computed(() => ({
    y: `calc(100vh - 360px)`,
    x: 1100,
}))

onMounted(() => {
    loadBackup()
    loadPage()
})

const gotoChild = (item) => {
    router.push(`/main/projects/${item.id}`)
}

const createProject = () => {
    newProjectName.value = newProjectName.value.trim()
    if (!newProjectName.value) {
        newProjectNameError.value = t('ProjectPageListEditProjectNameRequired')
        return
    }
    apiPost(
        '/project',
        () => {
            newProjectNameError.value = ''
            newProjectName.value = ''
            openNewProject.value = false
            infoMessage(t('Success'))
            refreshPage()
        },
        { name: newProjectName.value }
    )
}

const updateProject = () => {
    updateProjectName.value = updateProjectName.value.trim()
    if (!updateProjectName.value) {
        updateProjectNameError.value = t('ProjectPageListEditProjectNameRequired')
        return
    }
    apiPut(
        `/project/${currentProject.value.id}`,
        () => {
            openEditProject.value = false
            updateProjectNameError.value = ''
            infoMessage(t('Success'))
            refreshPage()
        },
        {
            name: updateProjectName.value,
        }
    )
}

const refreshPage = async () => {
    pagination.value.current = 1
    loadPage()
}

const reset = () => {
    search.value = ''
    refreshPage()
}

const handleTableChange = (pg) => {
    pagination.value.current = pg.current
    pagination.value.pageSize = pg.pageSize
    loadPage()
}

const loadPage = async () => {
    const params = new URLSearchParams({
        page: pagination.value.current,
        size: pagination.value.pageSize,
    })
    if (search.value) {
        params.append('name', search.value)
    }
    backupSearch()
    loading.value = true
    apiGet(
        `/project?${params.toString()}`,
        (res) => {
            pagination.value.total = res.data.count
            dataItems.value = res.data.results || []
        },
        {},
        null,
        null,
        () => {
            loading.value = false
        }
    )
}

const backupSearch = () => {
    const data = {
        page: pagination.value.current,
        size: pagination.value.pageSize,
        name: search.value,
    }
    sessionStorage.setItem('project-search', JSON.stringify(data))
}

const loadBackup = () => {
    const dataStr = sessionStorage.getItem('project-search')
    if (dataStr) {
        const data = JSON.parse(dataStr)
        pagination.value.current = data.page || 1
        pagination.value.pageSize = data.size || 10
        search.value = data.name || ''
    }
}

const confirm = (item) => {
    $q.dialog({
        title: t('ProjectPageListEditProjectDeleteTitle'),
        message: t('ProjectPageListEditProjectDeleteDesc'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/project/${item.id}`, () => {
            infoMessage(t('Success'))
            if (dataItems.value.length > 1) {
                const index = dataItems.value.findIndex((project) => project.id === item.id)
                if (index !== -1) {
                    dataItems.value.splice(index, 1)
                    pagination.value.total -= 1
                }
            } else {
                if (pagination.value.current > 1) {
                    pagination.value.current -= 1
                } else {
                    pagination.value.current = 1
                }
                loadPage()
            }
        })
    })
}
</script>

<style lang="scss">
.projects-card {
    min-height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
}

.projects-card .bio-data-table {
    flex: 1;
    display: flex;
}

.projects-card .bio-data-table .ant-table-wrapper {
    flex: 1;
}
</style>

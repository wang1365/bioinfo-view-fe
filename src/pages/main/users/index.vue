<template>
    <q-page padding class="users-page column no-wrap">
        <PageTitle :title="$t('UserManage')" />
        <q-card class="users-card page-list-card" flat>
            <div>
                <div class="page-list-filter row q-px-md bio-data-table">
                    <q-input
                        class="page-list-filter__field page-list-filter__field--keyword"
                        style="width: 320px"
                        :label="$t('UserAndNameAndEmailSearch')"
                        clearable
                        filled
                        dense
                        @clear="refreshUsers"
                        @keypress.enter="refreshUsers"
                        v-model="searchKeyword"
                    />
                    <AppActionButton variant="primary" :label="$t('Search')" icon="search" @click="refreshUsers" />
                    <AppActionButton :label="$t('Reset')" icon="clear" @click="resetSearch" />
                </div>
            </div>
            <div>
                <q-toolbar class="page-list-toolbar page-list-toolbar--actions">
                    <AppActionButton
                        v-permission="'createUser'"
                        variant="primary"
                        icon="description"
                        :label="$t('Add')"
                        @click="clickCreate"
                    />
                </q-toolbar>
            </div>
            <div ref="tableAreaRef" class="col users-table-area q-pt-sm q-px-md q-pb-md bio-data-table">
                <a-table
                    class="page-grid-table"
                    :data-source="rows"
                    :columns="columns"
                    :loading="loading"
                    :pagination="pagination"
                    :scroll="{ x: 1200, y: tableScrollY }"
                    row-key="id"
                    size="small"
                    :locale="tableLocale"
                    bordered
                    @change="handleTableChange"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'disk'">
                            {{ (record.used_disk || 0) + '/' + (record.disk_limit || $t('Unlimited')) }}
                        </template>
                        <template v-else-if="column.key === 'task'">
                            {{ (record.task_count || 0) + '/' + (record.task_limit === null ? $t('Unlimited') : record.task_limit) }}
                        </template>
                        <template v-else-if="column.key === 'role'">
                            <q-chip
                                v-if="_.get(record, 'role[0]') === 'super'"
                                color="primary"
                                text-color="white"
                                size="sm"
                            >
                                <q-avatar icon="bookmark" color="red" text-color="white" />
                                {{ $t('SuperAdmin') }}
                            </q-chip>
                            <span v-else-if="_.get(record, 'role[0]') === 'admin'">{{ $t('Admin') }}</span>
                            <span v-else>{{ $t('NormalUser') }}</span>
                        </template>
                        <template v-else-if="column.key === 'is_active'">
                            <q-chip
                                v-if="record.is_active"
                                class="users-status-chip"
                                :label="$t('Enabled')"
                                color="green"
                                size="sm"
                            />
                            <q-chip v-else class="users-status-chip" :label="$t('Disable')" color="orange" size="sm" />
                        </template>
                        <template v-else-if="column.key === 'operation'">
                            <div class="table-operation-buttons users-op">
                                <TableActionButton
                                    v-if="allowReset(record)"
                                    variant="primary"
                                    :label="$t('Setting')"
                                    @click="clickEdit(record)"
                                />
                                <TableActionButton
                                    v-permission="'resetPassword'"
                                    v-if="allowReset(record)"
                                    variant="secondary"
                                    :label="$t('ResetPassword')"
                                    @click="clickReset(record)"
                                />
                                <TableActionButton
                                    v-permission="'deleteUser'"
                                    v-if="allowDelete(record)"
                                    variant="danger"
                                    :label="$t('Delete')"
                                    @click="clickDelete(record)"
                                />
                                <TableActionButton
                                    v-if="amISuper() && !isSuper(record)"
                                    variant="primary"
                                    :label="$t('Permission')"
                                    @click="clickSetPermission(record)"
                                />
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </q-card>
        <CreateUser ref="createUserDlg" @success="refreshUsers"></CreateUser>
        <EditUser ref="editUserDlg" :user="user" @success="refreshUsers"></EditUser>
        <ResetPassword ref="resetPasswordDlg" :user="user"></ResetPassword>
        <set-permissions-dialog v-model="isPermissionDlgVisible" :user="user" />
    </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import _ from 'lodash'
import { listUser, batchDeleteUser } from 'src/api/user'
import { isSuper, isAdmin, amISuper } from 'src/utils/user'
import PageTitle from 'components/page-title/PageTitle.vue'
import CreateUser from './CreateUser'
import EditUser from 'pages/main/users/EditUser'
import { useI18n } from 'vue-i18n'
import ResetPassword from 'pages/main/users/ResetPassword'
import { globalStore } from 'src/stores/global'
import SetPermissionsDialog from 'pages/main/users/SetPermissionsDialog.vue'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'

const { t } = useI18n()
const createUserDlg = ref(null)
const editUserDlg = ref(null)
const resetPasswordDlg = ref(null)
const user = ref(null)
const $q = useQuasar()
const store = globalStore()
const tableAreaRef = ref(null)
const tableScrollY = ref(400)
let resizeObserver = null

const columns = computed(() => [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        width: 80,
    },
    {
        title: t('Username'),
        dataIndex: 'username',
        key: 'username',
        align: 'center',
        ellipsis: true,
    },
    {
        title: t('Nickname'),
        dataIndex: 'nickname',
        key: 'nickname',
        align: 'center',
        ellipsis: true,
    },
    {
        title: t('DiskUsage') + '(MB)',
        dataIndex: 'disk',
        key: 'disk',
        align: 'center',
    },
    {
        title: t('TaskLimit'),
        dataIndex: 'task',
        key: 'task',
        align: 'center',
    },
    {
        title: t('Role'),
        dataIndex: 'role',
        key: 'role',
        align: 'center',
    },
    {
        title: t('Status'),
        dataIndex: 'is_active',
        key: 'is_active',
        align: 'center',
    },
    {
        title: t('Operate'),
        key: 'operation',
        dataIndex: 'operation',
        align: 'center',
        width: 300,
    },
])

const loading = ref(false)
const rows = ref([])
const tableLocale = computed(() => ({
    emptyText: t('NoData'),
}))

onMounted(() => {
    nextTick(() => {
        recomputeTableScrollY()
        resizeObserver = new ResizeObserver(() => {
            recomputeTableScrollY()
        })
        if (tableAreaRef.value) {
            resizeObserver.observe(tableAreaRef.value)
        }
    })
    refreshUsers()
})

onUnmounted(() => {
    resizeObserver?.disconnect?.()
    resizeObserver = null
})

const searchKeyword = ref('')
const isPermissionDlgVisible = ref(false)

const allowReset = (row) => {
    return row.id !== _.get(store, 'currentUser.id')
}

const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => t('PaginationTotal', { total }),
    pageSizeOptions: ['10', '20', '50', '100'],
})

const clickCreate = () => {
    createUserDlg.value.show()
}

const clickEdit = (row) => {
    user.value = row
    editUserDlg.value.show()
}

const clickSetPermission = (row) => {
    isPermissionDlgVisible.value = true
    user.value = row
}

const clickReset = (row) => {
    user.value = row
    resetPasswordDlg.value.show()
}

const clickDelete = (row) => {
    $q.dialog({
        title: '纭鍒犻櫎',
        message: t('ConfirmToDeleteUser') + `${row.username}?`,
        cancel: t('Cancel'),
        ok: t('Confirm'),
    })
        .onOk(() => {
            batchDeleteUser({ ids: [row.id] }).then(() => {
                $q.notify(t('DeleteSuccess'))
                refreshUsers()
            })
        })
        .onCancel(() => {})
}

const handleTableChange = (pg) => {
    pagination.value.current = pg.current
    pagination.value.pageSize = pg.pageSize
    refreshUsers()
}

function recomputeTableScrollY() {
    const el = tableAreaRef.value
    if (!el) {
        return
    }

    const containerHeight = Math.floor(el.getBoundingClientRect().height || 0)
    const reservedHeight = 120
    const nextHeight = containerHeight - reservedHeight
    tableScrollY.value = Math.max(nextHeight, 200)
}

function refreshUsers() {
    loading.value = true
    listUser(searchKeyword.value, pagination.value.current, pagination.value.pageSize)
        .then((data) => {
            rows.value = data.item_list
            pagination.value.total = data.total_count
        })
        .finally(() => {
            loading.value = false
        })
}

const resetSearch = () => {
    searchKeyword.value = ''
    pagination.value.current = 1
    refreshUsers()
}

const allowDelete = (row) => {
    if (isSuper(row)) {
        return false
    }

    if (isAdmin(row)) {
        return isSuper(store.currentUser)
    }

    return true
}
</script>

<style lang="sass">
.users-page
    overflow: hidden

    .users-card
        flex: 1 1 auto
        min-height: 0
        display: flex
        flex-direction: column

    .users-table-area
        flex: 1 1 auto
        min-height: 0
        overflow: hidden
        display: flex
        flex-direction: column

    .ant-table-wrapper
        flex: 1

    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td
        padding: 6px 8px

    .ant-table-pagination.ant-pagination
        margin: 8px 0 !important

    .users-op
        justify-content: center

    .users-status-chip
        font-size: 13px
</style>

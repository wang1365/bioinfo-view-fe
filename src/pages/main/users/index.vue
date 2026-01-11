<template>
    <q-page padding class="users-page column no-wrap">
        <PageTitle :title="$t('UserManage')" />
        <div class="row justify-end q-gutter-md items-center q-py-xs">
            <div class="col-4">
                <q-input
                    :label="$t('UserAndNameAndEmailSearch')"
                    clearable
                    dense
                    @clear="refreshUsers"
                    @keypress.enter="refreshUsers"
                    v-model="searchKeyword"
                >
                    <template v-slot:prepend>
                        <q-icon name="face"></q-icon>
                    </template>
                </q-input>
            </div>
            <div class="col-1">
                <q-btn
                    class="on-right users-toolbar-btn"
                    size="sm"
                    color="primary"
                    icon="search"
                    :label="$t('Search')"
                    @click="refreshUsers"
                ></q-btn>
            </div>
            <div class="col-1">
                <q-btn
                    v-permission="'createUser'"
                    class="on-plus users-toolbar-btn"
                    size="sm"
                    color="primary"
                    icon="add"
                    :label="$t('Add')"
                    @click="clickCreate"
                />
            </div>
        </div>
        <q-separator />
        <div ref="tableAreaRef" class="col users-table-area">
            <a-table
                :data-source="rows"
                :columns="columns"
                :loading="loading"
                :pagination="pagination"
                :scroll="{ x: 'max-content', y: tableScrollY }"
                row-key="id"
                size="small"
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
                        <div class="users-op q-pa-xs q-gutter-xs no-wrap">
                            <q-btn
                                v-if="allowReset(record)"
                                flat
                                dense
                                icon="settings"
                                color="primary"
                                size="sm"
                                class="no-wrap"
                                :label="$t('Setting')"
                                @click="clickEdit(record)"
                            ></q-btn>
                            <q-btn
                                v-permission="'resetPassword'"
                                v-if="allowReset(record)"
                                dense
                                flat
                                icon="refresh"
                                color="red"
                                size="sm"
                                class="no-wrap"
                                :label="$t('ResetPassword')"
                                @click="clickReset(record)"
                            ></q-btn>
                            <q-btn
                                v-permission="'deleteUser'"
                                v-if="allowDelete(record)"
                                dense
                                flat
                                icon="delete"
                                color="red"
                                size="sm"
                                class="no-wrap"
                                :label="$t('Delete')"
                                @click="clickDelete(record)"
                            ></q-btn>
                            <q-btn
                                v-if="amISuper() && !isSuper(record)"
                                dense
                                flat
                                icon="grading"
                                color="primary"
                                size="sm"
                                class="no-wrap"
                                :label="$t('Permission')"
                                @click="clickSetPermission(record)"
                            />
                        </div>
                    </template>
                </template>
            </a-table>
        </div>
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
        width: 420,
    },
])

const loading = ref(false)
const rows = ref([])

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

const roleMap = {
    super: computed(() => t('SuperAdmin')),
    admin: computed(() => t('Admin')),
    normal: computed(() => t('NormalUser')),
}

const getRoleName = (roles) => {
    if (!_.isArray(roles)) {
        return ''
    }
    if (roles.length === 0) {
        return ''
    }

    return roleMap[roles[0]] || ''
}

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

const clickFlowAuth = (row) => {
}

const clickSetResourceLimit = (row) => {
}

const clickDelete = (row) => {
    $q.dialog({
        title: '确认删除',
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

const clickPermission = (row) => {
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

    .users-table-area
        min-height: 0
        overflow: hidden
        display: flex
        flex-direction: column

    .ant-table
        flex: 1

    .ant-table-cell
        white-space: nowrap

    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td
        padding: 6px 8px

    .ant-table-pagination.ant-pagination
        margin: 8px 0 !important

    .users-op
        .q-btn__content
            font-size: 13px

    .users-toolbar-btn
        .q-btn__content
            font-size: 14px

    .users-status-chip
        font-size: 13px
</style>

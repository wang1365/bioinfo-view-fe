<template>
    <q-page padding class="">
        <PageTitle :title="$t('UserManage')" />
        <div class="row justify-end q-gutter-md items-center q-py-xs">
            <div class="col-4">
                <q-input
                    :label="$t('UserAndNameAndEmailSearch')"
                    clearable
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
                    class="on-right"
                    size="md"
                    color="primary"
                    icon="search"
                    :label="$t('Search')"
                    @click="refreshUsers"
                ></q-btn>
            </div>
            <div class="col-1">
                <q-btn
                    v-if="amISuper()"
                    class="on-plus"
                    size="md"
                    color="primary"
                    icon="add"
                    :label="$t('Add')"
                    @click="clickCreate"
                />
            </div>
        </div>
        <q-separator />
        <q-table
            :rows="rows"
            :columns="columns"
            :loading="loading"
            loading-label="正在查询数据..."
            no-data-label="暂无数据"
            row-key="name"
            color="primary"
            dense
            wrap-cells
            v-model:pagination="pagination"
            :rows-per-page-label="$t('-')"
            :rows-per-page-options="[10, 20, 50, 100]"
            @request="refreshUsersForEvent"
        >
            <template v-slot:body-cell-disk="props">
                <q-td align="center">
                    {{
                        (props.row.used_disk || 0) +
                        "/" +
                        (props.row.disk_limit || $t('Unlimited'))
                    }}
                </q-td>
            </template>
            <template v-slot:body-cell-role="props">
                <q-td align="center">
                    <q-chip v-if="_.get(props.row, 'role[0]') === 'super'" color="primary" text-color="white">
                        <q-avatar icon="bookmark" color="red" text-color="white" />
                        {{ $t('SuperAdmin') }}
                    </q-chip>
                    <span v-else>{{ getRoleName(props.row.role) }}</span>
                </q-td>
            </template>
            <template v-slot:body-cell-is_active="props">
                <q-td align="center">
                    <q-chip v-if="props.row.is_active" :label="$t('Enabled')" color="green" size="sm" />
                    <q-chip v-else :label="$t('Disable')" color="orange" size="sm" />
                </q-td>
            </template>
            <template v-slot:body-cell-operation="props">
                <q-td :props="props">
                    <div class="q-pa-md q-gutter-sm">
                        <q-btn
                            v-if="allowReset(props.row)"
                            size="xs"
                            color="primary"
                            :label="$t('Setting')"
                            @click="clickEdit(props.row)"
                        ></q-btn>
                        <!--                        <q-btn-->
                        <!--                            v-if="isNormal(props.row)"-->
                        <!--                            size="xs"-->
                        <!--                            outline-->
                        <!--                            color="primary"-->
                        <!--                            label="流程授权"-->
                        <!--                            @click="clickFlowAuth(props.row)"-->
                        <!--                        ></q-btn>-->
                        <q-btn
                            v-if="allowReset(props.row)"
                            size="xs"
                            color="orange"
                            :label="$t('ResetPassword')"
                            @click="clickReset(props.row)"
                        ></q-btn>

                        <q-btn
                            v-if="allowDelete(props.row)"
                            size="xs"
                            color="red"
                            :label="$t('Delete')"
                            @click="clickDelete(props.row)"
                        ></q-btn>
                    </div>
                </q-td>
            </template>
            <!--            <template v-slot:pagination="scope">-->
            <!--                <q-btn-->
            <!--                    v-if="scope.pagesNumber > 2"-->
            <!--                    icon="first_page"-->
            <!--                    color="grey-8"-->
            <!--                    round-->
            <!--                    flat-->
            <!--                    :disable="scope.isFirstPage"-->
            <!--                    @click="scope.firstPage"-->
            <!--                />-->
            <!--                <q-btn-->
            <!--                    icon="chevron_left"-->
            <!--                    color="grey-8"-->
            <!--                    round-->
            <!--                    flat-->
            <!--                    :disable="scope.isFirstPage"-->
            <!--                    @click="scope.prevPage"-->
            <!--                />-->
            <!--                <q-btn-->
            <!--                    icon="chevron_right"-->
            <!--                    color="grey-8"-->
            <!--                    round-->
            <!--                    dense-->
            <!--                    flat-->
            <!--                    :disable="scope.isLastPage"-->
            <!--                    @click="scope.nextPage"-->
            <!--                />-->
            <!--                <q-btn-->
            <!--                    v-if="scope.pagesNumber > 2"-->
            <!--                    icon="last_page"-->
            <!--                    color="grey-8"-->
            <!--                    round-->
            <!--                    dense-->
            <!--                    flat-->
            <!--                    :disable="scope.isLastPage"-->
            <!--                    @click="scope.lastPage"-->
            <!--                />-->
            <!--            </template>-->
        </q-table>
        <CreateUser ref="createUserDlg" @success="refreshUsers"></CreateUser>
        <EditUser ref="editUserDlg" :user="user" @success="refreshUsers"></EditUser>
        <ResetPassword ref="resetPasswordDlg" :user="user"></ResetPassword>
    </q-page>
</template>

<script setup>
import { useQuasar } from "quasar"
import {computed, nextTick, onMounted, ref} from "vue"
import _ from "lodash";
import { listUser, batchDeleteUser } from "src/api/user"
import { isSuper, isAdmin, isNormal, amISuper } from "src/utils/user"
import PageTitle from "components/page-title/PageTitle.vue"
import CreateUser from "./CreateUser"
import EditUser from "pages/main/users/EditUser"
import { deleteFlow } from "src/api/flow"
import { useI18n } from 'vue-i18n'
import ResetPassword from "pages/main/users/ResetPassword"
import { storeToRefs } from "pinia"
import { globalStore } from "src/stores/global"

const { t } = useI18n()
const createUserDlg = ref(null)
const editUserDlg = ref(null)
const resetPasswordDlg = ref(null)
const resetResourceLimitDlg = ref(false)
const user = ref(null);
const $q = useQuasar();
const store = globalStore();
const columns = computed(() => [
    {
        name: "id",
        label: "ID",
        align: "center",
        style: "width:80px",
        field: (row) => row.id,
        format: (val) => `${val}`,
    },
    {
        name: "username",
        label: t("Username"),
        field: "username",
        sortable: false,
        align: "center",
    },
    {
        name: "nickname",
        label: t("Nickname"),
        field: "nickname",
        sortable: false,
        align: "center",
    },
    {
        name: "disk",
        label: t("DiskUsage") + "(MB)",
        field: "disk",
        sortable: false,
        align: "center",
    },
    // {name: "department",align: "center",label: "部门",field: "calories",sortable: true, },
    // {name: "email", label: "邮箱", field: "email", align: "center"},
    {
        name: "role",
        label: t("Role"),
        align: "center",
        field: "role",
        format: (v) => getRoleName(v),
    },
    {
        name: "is_active",
        label: t("Status"),
        field: "is_active",
        align: "center",
        format: (v) => `${v ? t('Enabled') : t('Disable')}`,
    },
    { name: "operation", label: t('Actions'), align: "center", style: "width:350px" },
]);

const loading = ref(false);
let rows = ref([]);
onMounted(() => {
    console.log('quasar===', this, $q)
    refreshUsers();
});
const searchKeyword = ref("");

const getRoleName = (roles) => {
    if (!_.isArray(roles)) {
        return "";
    }
    return roles
        .map(function (role) {
            return (
                {
                    super: t('SuperAdmin'),
                    admin: t('Admin'),
                }[role] || t('NormalUser')
            );
        })
        .join(",");
};

const allowReset = (row) => {
    return row.id !== _.get(store, "currentUser.id");
};

const getStatus = (isActive) => {
    return isActive ? "√" : "x";
};

const pagination = ref({
    sortBy: "id",
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
});

const clickCreate = () => {
    createUserDlg.value.show();
};

const clickEdit = (row) => {
    console.log("click edit", row);
    user.value = row;

    editUserDlg.value.show();
};

const clickReset = (row) => {
    // $q.dialog({
    //     title: `是否重置用户${row.username}的密码”?`,
    // }).onOk(() => {
    //     resetPassword(row.id).then(() => {
    //         $q.notify.create({ type: "positive", message: "删除成功" });
    //         refreshFlows();
    //     });
    // });

    user.value = row;
    resetPasswordDlg.value.show();
};

const clickFlowAuth = (row) => {

}

const clickSetResourceLimit = (row) => {};

const clickDelete = (row) => {
    $q.dialog({
        title: "确认删除",
        message: `是否要删除用户"${row.username}"?`,
        cancel: "取消",
        ok: "确定",
    })
        .onOk(() => {
            batchDeleteUser({ ids: [row.id] }).then(() => {
                $q.notify("删除成功");
            });
        })
        .onCancel(() => {
            // console.log('>>>> Cancel')
        });
};

function refreshUsersForEvent(props) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;
    pagination.value = props.pagination;
    refreshUsers();
}

function refreshUsers() {
    loading.value = true;
    listUser(
        searchKeyword.value,
        pagination.value.page,
        pagination.value.rowsPerPage
    )
        .then((data) => {
            console.log("====>查询用户成功", data);
            rows.value = data.item_list;

            pagination.value.rowsNumber = data.total_count;
        })
        .finally(() => {
            loading.value = false;
        });
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
.my-sticky-header-column-table
    /* height or max-height is important */
    //height: 310px
    //height: 800px
    //padding: 20px

    /* specifying max-width so the example can
      highlight the sticky column on any browser window */
    //max-width: 600px

    td:first-child
        /* bg color is important for td; just specify one */
        background-color: #c1f4cd !important

    tr th
        position: sticky
        /* higher than z-index for td below */
        z-index: 2
        /* bg color is important; just specify one */
        background: #fff

    /* this will be the loading indicator */





    thead tr:last-child th
        /* height of all previous header rows */
        top: 48px
        /* highest z-index */
        z-index: 3

    thead tr:first-child th
        top: 0
        z-index: 1

    tr:first-child th:first-child
        /* highest z-index */
        z-index: 3

    td:first-child
        z-index: 1

    td:first-child, th:first-child
        position: sticky
        left: 0
</style>

<template>
    <q-page padding class="full-height overflow-hidden">
        <PageTitle title="用户管理"/>
        <div class="row justify-end q-gutter-md items-center q-py-xs">
            <div class="col-4">
                <q-input
                    label="用户账号、姓名、邮箱搜索"
                    clearable
                    @clear="refreshUsers"
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
                    label="搜索"
                    @click="refreshUsers"
                ></q-btn>
            </div>
            <div class="col-1">
                <q-btn
                    class="on-plus"
                    size="md"
                    color="primary"
                    icon="search"
                    label="新建"
                    @click="clickCreate"
                ></q-btn>
            </div>
        </div>
        <q-separator/>
        <q-table
            :rows="rows"
            :columns="columns"
            row-key="name"
            color="primary"
            dense
            wrap-cells
            v-model:pagination="pagination"
            rows-per-page-label="每页条数"
            :rows-per-page-options="[10, 20, 50, 100]"
        >
            <template v-slot:body-cell-operation="props">
                <q-td :props="props">
                    <div class="q-pa-md q-gutter-sm">
                        <q-btn
                            size="xs"
                            color="primary"
                            label="编辑"
                            @click="clickEdit(props.row)"
                        ></q-btn>
                        <q-btn
                            v-if="allowReset(props.row)"
                            size="xs"
                            color="red"
                            text-color="white"
                            label="重置密码"
                            @click="clickReset(props.row)"
                        ></q-btn>
<!--                        <q-btn-->
<!--                            v-if="allowReset(props)"-->
<!--                            size="xs"-->
<!--                            color="red"-->
<!--                            text-color="white"-->
<!--                            label="删除"-->
<!--                            @click="clickDelete(props.row)"-->
<!--                        ></q-btn>-->
                    </div>
                </q-td>
            </template>
            <template v-slot:pagination="scope">
                <q-btn
                    v-if="scope.pagesNumber > 2"
                    icon="first_page"
                    color="grey-8"
                    round
                    flat
                    :disable="scope.isFirstPage"
                    @click="scope.firstPage"
                />
                <q-btn
                    icon="chevron_left"
                    color="grey-8"
                    round
                    flat
                    :disable="scope.isFirstPage"
                    @click="scope.prevPage"
                />
                <q-btn
                    icon="chevron_right"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isLastPage"
                    @click="scope.nextPage"
                />
                <q-btn
                    v-if="scope.pagesNumber > 2"
                    icon="last_page"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isLastPage"
                    @click="scope.lastPage"
                />
            </template>
        </q-table>
        <CreateUser ref="createUserDlg" @success="refreshUsers"></CreateUser>
        <EditUser ref="editUserDlg" :user="currentUser" @success="refreshUsers"></EditUser>
        <ResetPassword ref="resetPasswordDlg" :user="currentUser"></ResetPassword>
    </q-page>
</template>

<script setup>
import {useQuasar} from "quasar"
import {nextTick, onMounted, ref} from "vue"
import _ from "lodash"
import {listUser, batchDeleteUser} from "src/api/user"
import PageTitle from "components/page-title/PageTitle.vue"
import CreateUser from "./CreateUser"
import EditUser from "pages/main/users/EditUser"
import {deleteFlow} from "src/api/flow"
import ResetPassword from "pages/main/users/ResetPassword"
import {storeToRefs} from 'pinia'
import {globalStore} from "src/stores/global";

const createUserDlg = ref(null)
const editUserDlg = ref(null)
const resetPasswordDlg = ref(null)
const user = ref({})
const $q = useQuasar();
const store = globalStore()
const columns = [
    {name: "id", label: "ID", align: "center", style: "width:80px", field: (row) => row.id, format: (val) => `${val}`,},
    {name: "username", label: "账号", field: "username", sortable: true, align: "center",},
    {name: "nickname", label: "姓名", field: "nickname", sortable: true, align: "center",},
    // {name: "department",align: "center",label: "部门",field: "calories",sortable: true, },
    // {name: "email", label: "邮箱", field: "email", align: "center"},
    {name: "role", label: "角色", align: "center", field: "role", format: (v) => getRoleName(v),},
    {name: "is_active", label: "状态", field: "is_active", align: "center", format: (v) => `${v ? "启用" : "禁用"}`,},
    {name: "operation", label: "操作", align: "center", style: "width:220px"},
]

let rows = ref([]);
onMounted(() => {
    refreshUsers();
})

const searchKeyword = ref("")

const getRoleName = (roles) => {
    if (!_.isArray(roles)) {
        return "";
    }
    return roles
        .map(function (t) {
            return (
                {
                    super: "系统管理员",
                    admin: "管理员",
                }[t] || "普通用户"
            );
        })
        .join(",");
}

const allowReset = (row) => {
    return row.id !== _.get(store, 'currentUser.id')
}

const getStatus = (isActive) => {
    return isActive ? "√" : "x"
}

const pagination = {
    sortBy: "desc",
    descending: false,
    page: 1,
    rowsPerPage: 10,
    // rowsNumber: xx if getting data from a server
}

const clickCreate = () => {
    createUserDlg.value.show()
}

const clickEdit = (row) => {
    console.log('click edit', row)
    user.value = row
    editUserDlg.value.show()
}

const clickReset = (row) => {
    // $q.dialog({
    //     title: `是否重置用户${row.username}的密码”?`,
    // }).onOk(() => {
    //     resetPassword(row.id).then(() => {
    //         $q.notify.create({ type: "positive", message: "删除成功" });
    //         refreshFlows();
    //     });
    // });

    user.value = row
    resetPasswordDlg.value.show()
}

const clickDelete = (row) => {
    $q.dialog({
        title: "确认删除",
        message: `是否要删除用户"${row.username}"?`,
        cancel: true,
        persistent: true,
    })
        .onOk(() => {
            batchDeleteUser({ids: [row.id]}).then(() => {
                $q.notify("删除成功")
            });
        })
        .onOk(() => {
            // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
            // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
            // console.log('I am triggered on both OK and Cancel')
        })
    $q.notify("暂不支持用户删除")
}

function refreshUsers() {
    listUser(searchKeyword.value).then((data) => {
        console.log("====>查询用户成功", data)
        rows.value = data.item_list
    })
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

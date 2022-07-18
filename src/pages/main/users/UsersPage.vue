<template>
    <q-page padding class="full-height overflow-hidden">
        <PageTitle title="用户管理"/>
        <div class="row justify-end q-gutter-md items-center q-py-xs">
            <div class="col-4" ><q-input label="用户账号、姓名、邮箱搜索" clearable v-model="searchKeyword">
                <template v-slot:prepend><q-icon name="face"></q-icon></template>
            </q-input></div>
            <div class="col-1"><q-btn class="on-right" size="md" color="primary" icon="search" label="搜索"></q-btn></div>
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
            :rows-per-page-options="[10,20,50,100]"
        >
            <template v-slot:body-cell-operation="props">
                <q-td key="operation" :props="props">
                    <div class="q-pa-md q-gutter-sm">
                        <q-btn size="xs" color="primary" label="编辑" @click="clickEdit"></q-btn>
                        <q-btn size="xs" color="red" text-color="white" label="删除" @click="clickDelete"></q-btn>
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
    </q-page>
</template>

<script setup>
import {useQuasar} from 'quasar'
import {ref} from 'vue'
import _ from 'lodash'

const columns = [
    {
        name: 'id',
        label: 'ID',
        align: 'center',
        style: 'width:80px',
        field: row => row.id,
        format: val => `${val}`
    },
    {name: '账号', align: 'center', label: '账号', field: 'calories', sortable: true},
    {name: '姓名', label: '姓名', field: 'name', sortable: true, align: 'center'},
    {name: '邮箱', label: '邮箱', field: 'email', align: 'center'},
    {name: 'role', label: '角色', field: 'roles', align: 'center', format: (roles) => getRoleName(roles)},
    {name: 'operation', label: '操作', align: 'center', style: 'width:220px'}
]

const searchKeyword = ref('')

const getRoleName = (roles) => {
    if (!_.isArray(roles)) {
        return ''
    }
    return roles.map(function (t) {
            return {
                'system-admin': '系统管理员',
                'admin': '管理员',
            }[t] || ''
        }
    ).join(',')
}

const rows = [
    {
        id: 1,
        name: '用户1',
        roles: ['system-admin'],
        calories: 159,
        email: '14@bioinfo.com',
        iron: '1@bioinfo.com'
    },
    {
        id: 2,
        name: '用户2',
        roles: ['admin'],
        calories: 237,
        email: '8@bioinfo.com',
        iron: '1@bioinfo.com'
    },
    {
        id: 3,
        name: '用户3',
        calories: 238,
        email: '6@bioinfo.com',
        iron: '7@bioinfo.com'
    },
    {
        id: 4,
        name: 'Cupcake',
        calories: 305,
        email: '3@bioinfo.com',
        iron: '8@bioinfo.com'
    },
    {
        id: 5,
        name: 'Gingerbread',
        calories: 356,
        email: '7@bioinfo.com',
        iron: '16@bioinfo.com'
    },
    {
        id: 6,
        name: 'Jelly bean',
        calories: 375,
        email: '0@bioinfo.com',
        iron: '0@bioinfo.com'
    },
    {
        id: 7,
        name: 'Lollipop',
        calories: 392,
        email: '0@bioinfo.com',
        iron: '2@bioinfo.com'
    },
    {
        id: 8,
        name: 'Honeycomb',
        calories: 408,
        email: '0@bioinfo.com',
        iron: '45@bioinfo.com'
    },
    {
        id: 9,
        name: 'Donut',
        calories: 452,
        email: '2@bioinfo.com',
        iron: '22@bioinfo.com'
    },
    {
        id: 10,
        name: 'KitKat',
        calories: 518,
        email: '12@bioinfo.com',
        iron: '6@bioinfo.com'
    }
]

const pagination = {
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10
    // rowsNumber: xx if getting data from a server
}
import PageTitle from "components/page-title/PageTitle.vue";

const $q = useQuasar()
const clickEdit = () => {
    $q.notify('暂不支持用户编辑')
}
const clickDelete = () => {
    $q.notify('暂不支持用户删除')
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

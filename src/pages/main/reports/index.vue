<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="自定义报告" />
        <q-separator />
        <q-card class="q-mt-md">
            <q-section>
                <div class="q-gutter-md row items-start q-pa-md">
                    <q-input style="width:350px" v-model="searchParams.search" dense label="关键词: 任务名称" clearable>
                    </q-input>
                    <q-input type="number" v-model="searchParams.age_start" dense label="患者识别号" clearable> </q-input>
                    <q-input type="number" v-model="searchParams.age_end" dense label="样本识别号" clearable> </q-input>
                    <q-input type="number" v-model="searchParams.age_start" dense label="数据识别号" clearable> </q-input>
                    <q-btn color="primary" label="搜索" icon="search" @click="refreshPage()" />
                </div>

                <q-table :rows="rows" :columns="columns" row-key="id" ref="tableRef" v-model:pagination="pagination"
                    @request="onRequest" rows-per-page-label="每页数量">
                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props" class="q-gutter-sm">
                            <q-btn icon="download" @click="onEdit(props.row)" color="primary" label="下载报告" />
                        </q-td>
                    </template>
                </q-table>
            </q-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageTitle from 'components/page-title/PageTitle.vue'
import { useApi } from 'src/api/apiBase'
import { useQTable } from "src/utils/q-table"

const { tableRef, pagination, rows, refreshPage, loadDataOnMount } = useQTable()
const { apiGet } = useApi();
const searchParams = ref({})
const columns = ref([
    {
        name: 'id',
        required: false,
        label: '报告 ID',
        align: 'left',
        field: (row) => row.id,
        format: (val) => `${val}`,
    }, {
        name: 'task_id',

        label: '任务 ID',
        align: 'left',
        field: (row) => row.task_id,
        format: (val) => `${val}`,
    },
    {
        name: 'patient_id',
        required: true,
        label: '患者识别号',
        align: 'left',
        field: (row) => row.patient_id,
        format: (val) => `${val}`,
    },
    {
        name: 'data_id',
        required: true,
        label: '数据识别号',
        align: 'left',
        field: (row) => row.data_id,
        format: (val) => `${val}`,
    },
    {
        name: 'comment',
        required: true,
        label: '备注',
        align: 'left',
        field: (row) => row.comment,
        format: (val) => `${val}`,
    },
    {
        name: 'create_time',
        required: true,
        label: '创建时间',
        align: 'left',
        field: (row) => row.create_time,
        format: (val) => `${val}`,
    },
    {
        name: 'actions',
        label: 'Actions',
        required: false,
    },

])


onMounted(() => {
    loadDataOnMount()
})

const onRequest = (props) => {
    const { page, rowsPerPage } = props.pagination
    console.log(page, rowsPerPage)
    let params = `?page=${page}&size=${rowsPerPage}`
    apiGet(`/account/${params}`, (res) => {
        pagination.value.rowsNumber = res.data.total_count
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        rows.value = res.data.item_list
        for (let item of rows.value) {
            item.actions = true
        }
    })
}
</script>

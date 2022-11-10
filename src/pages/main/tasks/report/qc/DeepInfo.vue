<template>
    <div>
        <div class="row">
            <div class="col-2">
                <q-input v-model="text" label="输入基因进行搜索:" clearable dense>
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <q-btn class="q-ml-sm" color="primary" label="基因搜索" size="sm"></q-btn>
        </div>
    </div>
    <div class="q-py-md">
        <div class="row q-col-gutter-lg-md justify-around">
            <div class="col q-mr-md">
                <div class="text-center text-bold text-primary text-h6" style="position:relative">
                    对照样本
                    <q-icon name="download" style="position:absolute;right:10px;bottom: 5px;cursor:pointer"></q-icon>
                </div>
                <q-separator></q-separator>
                <a-table
                    class="col-5"
                    size="small"
                    bordered
                    :data-source="rows1"
                    :columns="columns"
                    :sticky="true"
                    :pagination="pagination"
                    @change="tableChange"
                >
                </a-table>
            </div>
            <div class="col q-ml-md">
                <div class="text-center text-bold text-purple text-h6" style="position:relative">
                    肿瘤样本
                    <q-icon name="download" style="position:absolute;right:10px;bottom: 5px;cursor:pointer"></q-icon>
                </div>
                <q-separator></q-separator>
                <a-table
                    size="small"
                    bordered
                    :data-source="rows2"
                    :columns="columns"
                    :sticky="true"
                    :pagination="pagination"
                    @change="tableChange"
                >
                </a-table>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { getReportTable } from 'src/api/report'
import { useRoute } from 'vue-router'

const route = useRoute()

const columns = [
    // 患者
    {key: 'gene', title: '基因', dataIndex: 'k1',  align: 'center', width: 120},
    {key: 'avg', title: '深度平均值', dataIndex: 'k2', align: 'center', width: 120},
    {key: 'mid', title: '深度中位值', dataIndex: 'k3', align: 'center', width: 120},
    {key: 'ratio', title: '基因覆盖度', dataIndex: 'k4', align: 'center', width: 120},
]

const pagination = ref({
    position: ['bottomRight'],
    current: 1,
    total: 0,
    pageSize: 10,
    showSizeChanger: true,
    // rowsNumber: xx if getting data from a server
})

const rows1 = ref([])
const rows2 = ref([])

const report = {

}

onMounted(() => {
    console.log('sfsdfsdfdddddd', route)
    const fields = ['k1', 'k2', 'k3', 'k4']
    getReportTable(route.params.id, 'QN11', {}, fields).then(res => {
        console.log('=========>', res)
        rows1.value = res
    })

    getReportTable(route.params.id, 'QT11', {}, fields).then(res => {
        console.log('=========>', res)
        rows2.value = res
    })
})
</script>

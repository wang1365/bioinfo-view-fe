<template>
    <div class="row q-gutter-sm justify-between">
        <div class="row col-4">
            <q-input
                v-model="keyword"
                class="col p-mr-sm q-gutter-xs"
                dense
                label="搜索:"
                clearable
                @clear="clearKeyword"
            />
            <q-btn class="col-2 p-pa-xs" size="small" color="primary" label="搜索" @click="searchKeyword"></q-btn>
        </div>
    </div>
    <div class="bio-data-table q-py-sm">
        <a-table size="small" bordered :loading="loading" :data-source="filteredRows" :columns="columns" :sticky="true">
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.key === 'k8'"
                    label="查看"
                    color="primary"
                    outline
                    size="xs"
                    @click="clickView(record)"
                >
                </q-btn>
            </template>
        </a-table>
        <q-dialog v-model="igvVisible">
            <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
                <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import {ref, onMounted} from "vue";
import {getReportTable} from 'src/api/report'
import {useRoute} from 'vue-router'

const route = useRoute()

const columns = ref([
    // {key: 'gene', title: '基因', dataIndex: 'k1', align: 'center', width: 120},
    // {key: 'avg', title: '深度平均值', dataIndex: 'k2', align: 'center', width: 120, sorter: (row1, row2) => row1.k2 - row2.k2},
    // {key: 'mid', title: '深度中位值', dataIndex: 'k3', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k3},
    // {key: 'ratio', title: '基因覆盖度', dataIndex: 'k4', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k4},
])

const keyword = ref('')
const rows = ref([])
const filteredRows = ref([])
const loading = ref(false)
const igvVisible = ref(false)
const selectedFile = ref('')

const searchKeyword = () => {
    filteredRows.value = rows.value.filter(t => t.k1.includes(keyword.value))
}

const clearKeyword = () => {
    filteredRows.value = rows.value
}

const clickView = (record) => {
    selectedFile.value = record.k8
    igvVisible.value = true
}
onMounted(() => {
    loading.value = true

    const fields = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8']
    const width = [30, 30, 60, 60, 60, 60, 200, 50]
    getReportTable(route.params.id, 'FUSION_QN11_SOMATIC', {}, fields).then(res => {
        const head = res[0]
        columns.value = Object.keys(head).map(k => {
            return {title: head[k], key: k, dataIndex: k, align: 'center'}
        })
        columns.value.forEach((col, i) => {
            col.width = width[i]
            if (col.key === 'k7') {
                col.align = 'left'
            }
        })

        rows.value = res.slice(1)
        filteredRows.value = rows.value
    }).finally(() => {
        loading.value = false
    })
})
</script>

<template>
    <div class="row q-gutter-sm justify-between">
        <div class="text-h6 text-purple">肿瘤单样品融合</div>
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
        <a-table
            size="small"
            bordered
            :loading="loading1"
            :data-source="filteredRows1"
            :columns="columns1"
            :sticky="true"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.key === 'k9'"
                    label="查看"
                    color="primary"
                    outline
                    size="xs"
                    @click="clickView(record)"
                >
                </q-btn>
            </template>
        </a-table>
    </div>

    <div class="row q-gutter-sm justify-between">
        <div class="text-h6 text-primary">对照单样品融合</div>
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
        <a-table
            size="small"
            bordered
            :loading="loading2"
            :data-source="filteredRows2"
            :columns="columns2"
            :sticky="true"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.key === 'k9'"
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
import {exportFile} from 'quasar'
import IGV from './Igv.vue'


const route = useRoute()
const keyword = ref('')

const columns1 = ref([])
const columns2 = ref([])

const loading1 = ref(false)
const loading2 = ref(false)

const rows1 = ref([])
const rows2 = ref([])

const filteredRows1 = ref([])
const filteredRows2 = ref([])

const igvVisible = ref(false)
const selectedFile = ref('')

const searchKeyword = () => {
    filteredRows1.value = rows1.value.filter(t => t.k1.includes(keyword.value))
    filteredRows2.value = rows2.value.filter(t => t.k1.includes(keyword.value))
}

const clearKeyword = () => {
    filteredRows1.value = rows1.value
    filteredRows2.value = rows2.value
}

const clickView = (record) => {
    console.log(record)
    selectedFile.value = record.k9
    igvVisible.value = true
}
onMounted(() => {
    loading1.value = true
    loading2.value = true

    const fields = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9']
    const width = [30, 30, 60, 60, 60, 60, 60, 200, 50]
    getReportTable(route.params.id, 'FUSION_QT11', {}, fields).then(res => {
        const head = res[0]
        columns1.value = Object.keys(head).map(k => {
            return {title: head[k], key: k, dataIndex: k, align: 'center'}
        })
        columns1.value.forEach((col, i) => {
            col.width = width[i]
            if (col.key === 'k8') {
                col.align = 'left'
            }
        })
        rows1.value = res.slice(1)
        filteredRows1.value = rows1.value
    }).finally(() => {
        loading1.value = false
    })

    getReportTable(route.params.id, 'FUSION_QN11', {}, fields).then(res => {
        const head = res[0]
        columns2.value = Object.keys(head).map(k => {
            return {title: head[k], key: k, dataIndex: k, align: 'center'}
        })
        rows2.value = res.slice(1)
        filteredRows2.value = rows2.value
    }).finally(() => {
        loading2.value = false
    })
})
</script>

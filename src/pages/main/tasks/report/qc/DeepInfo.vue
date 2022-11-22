<template>
    <div>
        <div class="row">
            <div class="col-2">
                <q-input v-model="keyword" label="输入基因进行搜索:" clearable dense @clear="clearKeyword">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <q-btn class="q-ml-sm" color="primary" label="基因搜索" size="sm" @click="searchKeyword"></q-btn>
        </div>
    </div>
    <div class="q-py-md">
        <div class="row q-col-gutter-lg-md justify-around">
            <div class="col q-mr-md" v-if="props.samples.length > 1">
                <div class="text-center text-bold text-primary text-h6" style="position:relative">
                    对照样本
                    <q-icon
                        name="download"
                        style="position:absolute;right:10px;bottom: 5px;cursor:pointer"
                        @click="download(0)"
                    ></q-icon>
                </div>
                <q-separator></q-separator>
                <a-table
                    class="col-5"
                    size="small"
                    bordered
                    :loading="loading1"
                    :data-source="filteredRows1"
                    :columns="columns"
                    :sticky="true"
                >
                </a-table>
            </div>
            <div class="col q-ml-md">
                <div
                    class="text-center text-bold text-purple text-h6"
                    style="position:relative"
                    v-if="props.samples.length > 1"
                >
                    肿瘤样本
                    <q-icon
                        name="download"
                        style="position:absolute;right:10px;bottom: 5px;cursor:pointer"
                        @click="download(1)"
                    ></q-icon>
                </div>
                <q-separator></q-separator>
                <a-table
                    size="small"
                    bordered
                    :loading="loading2"
                    :data-source="filteredRows2"
                    :columns="columns"
                    :sticky="true"
                >
                </a-table>
            </div>
        </div>
    </div>
</template>
<script setup>
import {ref, onMounted} from "vue";
import {readTaskFile} from "src/api/task"
import {getCsvData} from "src/utils/csv"
import {useRoute} from 'vue-router'
import {exportFile} from 'quasar'

const route = useRoute()
const props = defineProps({
    intro: {
        type: String,
        required: false
    },
    samples: {
        type: Array,
        required: false,
        default: () => []
    }
})

const columns = [
    {key: 'gene', title: '基因', dataIndex: 'k1', align: 'center', width: 120},
    {key: 'avg', title: '深度平均值', dataIndex: 'k2', align: 'center', width: 120, sorter: (row1, row2) => row1.k2 - row2.k2},
    {key: 'mid', title: '深度中位值', dataIndex: 'k3', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k3},
    {key: 'ratio', title: '基因覆盖度', dataIndex: 'k4', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k4},
]

const keyword = ref('')
const rows1 = ref([])
const filteredRows1 = ref([])
const rows2 = ref([])
const filteredRows2 = ref([])
const loading1 = ref(false)
const loading2 = ref(false)


const searchKeyword = () => {
    filteredRows1.value = rows1.value.filter(t => t.k1.includes(keyword.value))
    filteredRows2.value = rows2.value.filter(t => t.k1.includes(keyword.value))
}

const clearKeyword = () => {
    filteredRows1.value = rows1.value
    filteredRows2.value = rows2.value
}

const download = (idx) => {
    const name = idx === 0 ? 'normal.txt' : ' tumor.txt'
    let data =  '基因\t深度平均值\t深度中位值\t基因覆盖度\n'
    let objects = idx === 0 ? filteredRows1.value : filteredRows2.value
    objects.forEach(row => {
        data += `${row.k1}\t${row.k2}\t${row.k3}\n`
    })

    // let data = [['基因', '深度平均值', '深度中位值', '基因覆盖度']]
    // let objects = idx === 0 ? filteredRows1.value : filteredRows2.value
    // objects.forEach(row => {
    //     data.push([row.k1, row.k1, row.k1])
    // })
    const status = exportFile(name, data,
    //     {
    //     // encoding: 'windows-1252',
    //     // mimeType: 'text/csv;charset=windows-1252;'
    //     mimeType: 'text/csv'
    // }
    )

    if (status === true) {
        // 浏览器允许
    } else {
        // 浏览器拒绝
        console.error('Error: ' + status)
    }
}

onMounted(() => {
    const fields = ['k1', 'k2', 'k3', 'k4']

    loading2.value = true
    readTaskFile(route.params.id, 'QC/QT11.depth', {}, fields).then(res => {
        rows2.value  = getCsvData(res, {fields: fields, hasHeaderLine: false} )
        filteredRows2.value = rows2.value
    }).finally(() => {
        loading2.value = false
    })

    if (props.samples.length > 1) {
        loading1.value = true
        readTaskFile(route.params.id, 'QC/QN11.depth', ).then(res => {
            rows1.value  = getCsvData(res, {fields: fields, hasHeaderLine: false} )
            filteredRows1.value = rows1.value
        }).finally(() => {
            loading1.value = false
        })
    }
})
</script>

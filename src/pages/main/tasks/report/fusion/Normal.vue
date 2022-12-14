<template>

    <q-toolbar class="text-primary">
            <q-input
                v-model="keyword"
                class="q-mr-sm"
                dense
                label="搜索:"
                clearable
                @clear="clearKeyword"
                style="width:300px"
            />
            <q-btn size="small" color="primary" label="搜索" @click="searchKeyword"></q-btn>
    </q-toolbar>
    <div class="bio-data-table q-py-sm">
        <a-table
            size="small"
            bordered
            :loading="loading"
            :data-source="filteredRows"
            :columns="columns"
            :sticky="true"
            rowKey="lineNumber"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.key === 'k8'"
                    label="查看"
                    color="primary"
                    outline
                    size="sm"
                    @click="clickView(record)"
                ></q-btn>
            </template>
        </a-table>
        <q-dialog v-model="igvVisible">
            <q-card
                class="full-width"
                style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh"
            >
                <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, toRef, watch } from 'vue'
import { readTaskFile } from 'src/api/task'
import { getCsvData } from 'src/utils/csv'
import { useRoute } from 'vue-router'
import IGV from './Igv.vue'
import { getDualIdentifiers } from 'src/utils/samples'

const route = useRoute()

const columns = ref([
    // {key: 'gene', title: '基因', dataIndex: 'k1', align: 'center', width: 120},
    // {key: 'avg', title: '深度平均值', dataIndex: 'k2', align: 'center', width: 120, sorter: (row1, row2) => row1.k2 - row2.k2},
    // {key: 'mid', title: '深度中位值', dataIndex: 'k3', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k3},
    // {key: 'ratio', title: '基因覆盖度', dataIndex: 'k4', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k4},
])

const keyword = ref('')
const filteredRows = ref([])

const igvVisible = ref(false)
const selectedFile = ref('')

const props = defineProps({
    samples: {
        type: Array,
        require: true,
        default() {
            return []
        },
    },
    rows: {
        type: Array,
        require: false,
        default() {
            return []
        },
    },
    header: {
        type: Array,
        require: false,
        default() {
            return []
        },
    },
    searchParam: {
        type: String,
        require: false,
        default() {
            return ''
        },
    },
})
const searchKeyword = () => {
    if (keyword.value) {
        filteredRows.value = rows.value.filter((t) => t.k1.includes(keyword.value))
    } else {
        filteredRows.value = rows.value
    }
}

const clearKeyword = () => {
    filteredRows.value = rows.value
}

const clickView = (record) => {
    console.log('clickView', record)
    selectedFile.value = record.k8
    igvVisible.value = true
}
const rows = toRef(props, 'rows')
const header = toRef(props, 'header')
const propSearchParam = toRef(props, 'searchParam')
watch(props, () => {
    loadData()
})
onMounted(() => {
    loadData()
})

const loadData = () => {
    const width = [30, 30, 60, 60, 60, 60, 200, 50]
    columns.value = Object.keys(header.value).map((k) => {
        return { title: header.value[k], key: k, dataIndex: k, align: 'center' }
    })
    columns.value.forEach((col, i) => {
        col.width = width[i]
        if (col.key === 'k7') {
            col.align = 'left'
        }
    })
    keyword.value = propSearchParam.value
    searchKeyword()
}
</script>

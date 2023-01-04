<template>
    <q-toolbar class="text-primary">
        <q-toolbar-title v-if="!isSingle">肿瘤单样品融合</q-toolbar-title>

        <q-input
            v-model="keyword1"
            class="q-mr-sm"
            dense
            label="搜索:"
            clearable
            @clear="clearKeyword1"
            style="width:300px"
        />
        <q-btn size="small" color="primary" label="搜索" @click="searchKeyword1"></q-btn>
    </q-toolbar>
    <div class="bio-data-table q-py-sm">
        <a-table
            size="small"
            bordered
            rowKey="lineNumber"
            :loading="loading1"
            :data-source="filteredRows1"
            :columns="columns1"
            :sticky="true"
            :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange }"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.title === 'Igv'"
                    label="查看"
                    color="primary"
                    size="sm"
                    @click="clickView(record)"
                ></q-btn>
            </template>
        </a-table>
    </div>

    <div v-if="!isSingle">
        <q-toolbar class="text-primary">
            <q-toolbar-title v-if="!isSingle">对照单样品融合</q-toolbar-title>

            <q-input
                v-model="keyword2"
                class="q-mr-sm"
                dense
                label="搜索:"
                clearable
                @clear="clearKeyword2"
                style="width:300px"
            />
            <q-btn size="small" color="primary" label="搜索" @click="searchKeyword2"></q-btn>
        </q-toolbar>
        <a-table
            size="small"
            bordered
            :data-source="filteredRows2"
            :columns="columns2"
            :sticky="true"
            rowKey="lineNumber"
            :row-selection="{ selectedRowKeys: selectedRows2, onChange: onSelectChange2 }"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.title === 'Igv'"
                    label="查看"
                    color="primary"
                    size="sm"
                    @click="clickView(record)"
                ></q-btn>
            </template>
        </a-table>
    </div>

    <q-dialog v-model="igvVisible">
        <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
            <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed, toRefs, watch, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { exportFile } from 'quasar'
import IGV from './Igv.vue'
import { readTaskFile } from 'src/api/task'
import { getCsvData } from 'src/utils/csv'
import { getDualIdentifiers } from 'src/utils/samples'

const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    qtRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    qtHeader: {
        type: Array,
        required: false,
        default: () => [],
    },
    qtSearchParam: {
        type: String,
        required: false,
        default: () => '',
    },
    qtSelectedRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    qnRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    qnHeader: {
        type: Array,
        required: false,
        default: () => [],
    },
    qnSearchParam: {
        type: String,
        required: false,
        default: () => '',
    },
    qnSelectedRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    qt: {
        type: Object,
        required: false,
        default() {
            return {
                rows: [],
                header: {},
                searchParam: '',
            }
        },
    },
    qn: {
        type: Object,
        required: false,
        default() {
            return {
                rows: [],
                header: {},
                searchParam: '',
            }
        },
    },
})
const route = useRoute()
const isSingle = computed(() => props.samples.length === 1)

const keyword1 = ref('')
const keyword2 = ref('')

const columns1 = ref([])
const columns2 = ref([])

const filteredRows1 = ref([])
const filteredRows2 = ref([])

const igvVisible = ref(false)
const selectedFile = ref('')

const searchKeyword1 = () => {
    if (keyword1.value) {
        filteredRows1.value = qtRows.value.filter((t) => t[0].includes(keyword1.value))
    } else {
        filteredRows1.value = qtRows.value
    }
    filterChange()
}

const searchKeyword2 = () => {
    if (keyword2.value) {
        filteredRows2.value = qnRows.value.filter((t) => t[0].includes(keyword2.value))
    } else {
        filteredRows2.value = qnRows.value
    }
    filterChange()
}

const clearKeyword1 = () => {
    filteredRows1.value = qtRows.value
    keyword1.value = ''
    filterChange()
}

const clearKeyword2 = () => {
    filteredRows2.value = qnRows.value
    keyword2.value = ''
    filterChange()
}

const clickView = (record) => {
     console.log(record)
    selectedFile.value = record[8]
    igvVisible.value = true
}

const { qtRows, qtHeader, qtSearchParam, qtSelectedRows, qnRows, qnHeader, qnSelectedRows, qnSearchParam } =
    toRefs(props)

const emit = defineEmits('filterChange')
const filterChange = () => {
    emit('filterChange', {
        qt: {
            searchParam: keyword1.value,
            selectedRows: selectedRows.value,
        },
        qn: {
            searchParam: keyword2.value,
            selectedRows: selectedRows2.value,
        },
    })
}
watch(qtSearchParam, () => {
    loadData()
})
watch(qnSearchParam, () => {
    loadData()
})
watch(qtRows, () => {
    loadData()
})
watch(qnRows, () => {
    loadData()
})
onMounted(() => {
    loadData()
})
const samples = toRef(props, 'samples')
const loadData = () => {
    let width = [30, 30, 60, 60, 60, 60, 60, 200, 60, 50]
    columns1.value = []
    qtHeader.value.forEach((item, index) => {
        if (item == 'Igv') {
            columns1.value.push({
                title: item,
                dataIndex: index,
                align: 'center',
                width: width[index],
            })
        } else
            columns1.value.push({
                title: item,
                dataIndex: index,
                align: 'center',
                width: width[index],
            })
    })
    keyword1.value = qtSearchParam.value
    searchKeyword1()
    selectedRows.value = []
    for (let item of filteredRows1.value) {
        let finded = false
        for (let lineNumber of qtSelectedRows.value) {
            if (lineNumber == item.lineNumber) {
                finded = true
                break
            }
        }
        if (finded) {
            selectedRows.value.push(item.lineNumber)
        }
    }

    if (samples.value.length > 1) {
        columns2.value = []
        width = [30, 30, 60, 60, 60, 60, 60, 60, 120, 50]
        qnHeader.value.forEach((item, index) => {
            if (item == 'Igv') {
                columns2.value.push({
                    title: item,
                    dataIndex: index,
                    align: 'center',
                    width: width[index],
                })
            } else
                columns2.value.push({
                    title: item,
                    dataIndex: index,
                    align: 'center',
                    width: width[index],
                })
        })
        keyword2.value = qnSearchParam.value
        searchKeyword2()
        selectedRows2.value = []
        for (let item of filteredRows2.value) {
            let finded = false
            for (let lineNumber of qnSelectedRows.value) {
                if (lineNumber == item.lineNumber) {
                    finded = true
                    break
                }
            }
            if (finded) {
                selectedRows2.value.push(item.lineNumber)
            }
        }
    }
     filterChange()
 }

 const selectedRows = ref([])

const onSelectChange = (selectedRowKeys) => {
    selectedRows.value = selectedRowKeys
    filterChange()
}
const selectedRows2 = ref([])

const onSelectChange2 = (selectedRowKeys) => {
    selectedRows2.value = selectedRowKeys
    filterChange()
}
</script>

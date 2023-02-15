<template>
    <q-toolbar class="text-primary">
        <q-toolbar-title v-if="!isSingle">肿瘤单样品融合</q-toolbar-title>

        <q-input v-model="keyword1" class="q-mr-sm" dense label="搜索:" clearable @clear="clearKeyword1"
            style="width:300px" :disable="showSticky && stickDone" />
        <q-btn size="small" color="primary" label="搜索" @click="searchKeyword1"
            :disable="showSticky && stickDone"></q-btn>
    </q-toolbar>
    <div class="bio-data-table q-py-sm">
        <div style="position:relative">
            <q-icon color="accent" name="question_mark" size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px">
                <q-tooltip>仅全选本页筛选结果</q-tooltip>
            </q-icon>
            <a-table style="z-index:1" size="middle" bordered rowKey="lineNumber" :loading="loading1"
                :data-source="filteredRows1" :columns="columns1" :sticky="true"
                :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange, columnWidth: 20, getCheckboxProps: getCheckboxProps }">
                <template #bodyCell="{ column, record }">
                    <q-btn v-if="column.title === 'Igv'" label="查看" color="primary" size="sm"
                        @click="clickView(record)"></q-btn>
                </template>
            </a-table>
        </div>
    </div>

    <div v-if="!isSingle">
        <q-toolbar class="text-primary">
            <q-toolbar-title v-if="!isSingle">对照单样品融合</q-toolbar-title>

            <q-input v-model="keyword2" class="q-mr-sm" dense label="搜索:" clearable @clear="clearKeyword2"
                style="width:300px" :disable="showSticky && stickDone" />
            <q-btn size="small" color="primary" label="搜索" @click="searchKeyword2"
                :disable="showSticky && stickDone"></q-btn>
        </q-toolbar>
        <div style="position:relative">
            <q-icon color="accent" name="question_mark" size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px">
                <q-tooltip>仅全选本页筛选结果</q-tooltip>
            </q-icon>
            <a-table style="z-index:1" size="middle" bordered :data-source="filteredRows2" :columns="columns2"
                :sticky="true" rowKey="lineNumber"
                :row-selection="{ selectedRowKeys: selectedRows2, onChange: onSelectChange2, columnWidth: 20, getCheckboxProps: getCheckboxProps }">
                <template #bodyCell="{ column, record }">
                    <q-btn v-if="column.title === 'Igv'" label="查看" color="primary" size="sm"
                        @click="clickView(record)"></q-btn>
                </template>
            </a-table>
        </div>
    </div>

    <q-dialog v-model="igvVisible">
        <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
            <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed, toRefs, watch, toRef, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { exportFile } from 'quasar'
import IGV from './Igv.vue'
import { readTaskFile } from 'src/api/task'
import { getCsvData } from 'src/utils/csv'
import { getDualIdentifiers } from 'src/utils/samples'
import { errorMessage } from 'src/utils/notify'
const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    showSticky: {
        type: Boolean,
        required: false,
        default: () => false,
    },

    stickDone: {
        type: Boolean,
        required: false,
        default: () => false,
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

const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')

const searchFilterRows1 = (keyword) => {
    if (keyword) {
        filteredRows1.value = qtRows.value.filter((t) => {
            for (let i = 0; i < 7; i++) {
                if (t[i].includes(keyword)) {
                    return true
                }
            }
            return false
        })
    } else {
        filteredRows1.value = qtRows.value
    }
}

const searchKeyword1 = () => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    searchFilterRows1(keyword1.value)
}

const searchFilterRows2 = (keyword) => {
    if (keyword) {
        filteredRows2.value = qnRows.value.filter((t) => {
            for (let i = 0; i < 7; i++) {
                if (t[i].includes(keyword)) {
                    return true
                }
            }
            return false
        })
    } else {
        filteredRows2.value = qnRows.value
    }
}
const searchKeyword2 = () => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    searchFilterRows2(keyword2)
}

const clearKeyword1 = () => {
    filteredRows1.value = qtRows.value
    keyword1.value = ''
    searchKeyword1()
}

const clearKeyword2 = () => {
    filteredRows2.value = qnRows.value
    keyword2.value = ''
    searchFilterRows2()
}

const clickView = (record) => {
    selectedFile.value = record[8]
    igvVisible.value = true
}

const { qtRows, qtHeader, qtSearchParam, qtSelectedRows, qnRows, qnHeader, qnSelectedRows, qnSearchParam } =
    toRefs(props)

const emit = defineEmits('filterChange')
const getChangedData = () => {
    return {
        qt: {
            searchParam: keyword1.value,
            selectedRows: selectedRows.value,
            filtered: qtRows.value.length != filteredRows1.value.length,
            selected: selectedRows.value.length > 0,
        },
        qn: {
            searchParam: keyword2.value,
            selectedRows: selectedRows2.value,
            filtered: qnRows.value.length != filteredRows2.value.length,
            selected: selectedRows2.value.length > 0,
        },
    }
}
const filterChange = () => {
    emit('filterChange', getChangedData())
}
onUnmounted(() => {
    filterChange()
})
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
watch(qtSelectedRows, () => {
    loadData()
})
watch(qnSelectedRows, () => {
    loadData()
})
onMounted(() => {
    loadData()
})
const samples = toRef(props, 'samples')
const loadData = () => {
    let width = [32, 32, 60, 60, 60, 60, 60, 200, 60, 50]
    columns1.value = []
    qtHeader.value.forEach((item, index) => {
        if (item === 'Igv') {
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
    searchFilterRows1(qtSearchParam.value)
    selectedRows.value = []
    for (let item of filteredRows1.value) {
        let finded = false
        for (let lineNumber of qtSelectedRows.value) {
            if (lineNumber === item.lineNumber) {
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
            if (item === 'Igv') {
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
        searchFilterRows2(qnSearchParam.value)
        selectedRows2.value = []
        for (let item of filteredRows2.value) {
            let finded = false
            for (let lineNumber of qnSelectedRows.value) {
                if (lineNumber === item.lineNumber) {
                    finded = true
                    break
                }
            }
            if (finded) {
                selectedRows2.value.push(item.lineNumber)
            }
        }
    }
}

const selectedRows = ref([])
const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: record.lineNumber,
    }
}
const onSelectChange = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    selectedRows.value = selectedRowKeys
}
const selectedRows2 = ref([])

const onSelectChange2 = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    selectedRows2.value = selectedRowKeys
}

const reset = () => {
    keyword1.value = ''
    keyword2.value = ''
    searchFilterRows1(keyword1.value)
    searchFilterRows2(keyword2.value)
    selectedRows.value = []
    selectedRows2.value = []
}
defineExpose({ getChangedData, reset })
</script>

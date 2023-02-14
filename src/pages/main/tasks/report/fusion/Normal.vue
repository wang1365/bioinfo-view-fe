<template>
    <q-toolbar class="text-primary">
        <q-input v-model="keyword" class="q-mr-sm" dense label="搜索:" clearable @clear="clearKeyword" style="width:300px"
            :disable="showSticky && stickDone" />
        <q-btn size="small" color="primary" label="搜索" @click="searchKeyword"
            :disable="showSticky && stickDone"></q-btn>
    </q-toolbar>
    <div class="bio-data-table q-py-sm">
        <div style="position:relative">
            <q-icon color="accent" name="question_mark" size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px">
                <q-tooltip>仅全选本页筛选结果</q-tooltip>
            </q-icon>
            <a-table style="z-index:1" size="middle" bordered :loading="loading" :data-source="filteredRows"
                :columns="columns" :sticky="true" rowKey="lineNumber"
                :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange, columnWidth: 25 }">
                <template #bodyCell="{ column, record }">
                    <q-btn v-if="column.title === 'Igv'" label="查看" color="primary" size="sm"
                        @click="clickView(record)"></q-btn>
                </template>
            </a-table>
        </div>
        <q-dialog v-model="igvVisible">
            <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
                <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { errorMessage, infoMessage } from 'src/utils/notify';
import { ref, onMounted, toRef, watch, onUnmounted, defineExpose } from 'vue'
import { useRoute } from 'vue-router'
import IGV from './Igv.vue'

const route = useRoute()
const columns = ref([])

const keyword = ref('')
const filteredRows = ref([])

const igvVisible = ref(false)
const selectedFile = ref('')
const emit = defineEmits('filterChange')

const props = defineProps({
    samples: {
        type: Array,
        require: true,
        default() {
            return []
        },
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
    selectedRows: {
        type: Array,
        require: false,
        default() {
            return []
        },
    },
})
const searchFilterRows = (keyword) => {
    if (keyword) {
        filteredRows.value = rows.value.filter((t) => {
            for (let i = 0; i < 7; i++) {
                if (t[i].includes(keyword)) {
                    return true
                }
            }
            return false
        })
    } else {
        filteredRows.value = rows.value
    }
}
const searchKeyword = () => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    searchFilterRows(keyword.value)
}

const clearKeyword = () => {
    keyword.value = ''
    filteredRows.value = rows.value
}

const clickView = (record) => {
    selectedFile.value = record[7]
    igvVisible.value = true
}
const rows = toRef(props, 'rows')
const header = toRef(props, 'header')
const propSearchParam = toRef(props, 'searchParam')
const propSelectedRows = toRef(props, 'selectedRows')

const selectedRows = ref([])

const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')

const onSelectChange = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    selectedRows.value = selectedRowKeys
}

const getChangedData = () => {
    return {
        searchParam: keyword.value,
        selectedRows: selectedRows.value,
        filtered: rows.value.length != filteredRows.value.length,
        selected: selectedRows.value.length > 0,
    }
}
const filterChange = () => {
    emit('filterChange', getChangedData())
}

onMounted(() => {
    loadData()
})
onUnmounted(() => {
    filterChange()
})

const loadData = () => {
    const width = [30, 30, 60, 60, 60, 60, 200, 50, 50]
    columns.value = []
    header.value.forEach((item, index) => {
        if (item == 'Igv') {
            columns.value.push({
                title: item,
                dataIndex: index,
                align: 'center',
                width: width[index],
            })
        } else
            columns.value.push({
                title: item,
                dataIndex: index,
                align: 'center',
                width: width[index],
            })
    })
    keyword.value = propSearchParam.value
    searchFilterRows(propSearchParam.value)
    selectedRows.value = []
    for (let item of filteredRows.value) {
        let finded = false
        for (let lineNumber of propSelectedRows.value) {
            if (lineNumber == item.lineNumber) {
                finded = true
                break
            }
        }
        if (finded) {
            selectedRows.value.push(item.lineNumber)
        }
    }
}
const reset = () => {
    keyword.value = ''
    searchFilterRows(keyword.value)
    selectedRows.value = []
}
defineExpose({ getChangedData, reset })
</script>

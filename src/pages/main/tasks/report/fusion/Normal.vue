<template>
    <div>
        <q-toolbar class="text-primary">
            <q-input v-model="keyword" class="q-mr-sm" dense :label="$t('Search') + ':'" clearable @clear="clearKeyword"
                style="width:300px" :disable="showSticky && stickDone" />
            <AppActionButton variant="primary" :label="$t('Search')" @click="searchKeyword"
                :disable="showSticky && stickDone" />
            <AppActionButton variant="primary" :href="props.url" :label="$t('Download')" icon="download" target="_blank"
                class="q-ml-sm" />
            <q-space />
            <q-icon v-if="isDefineReport" color="accent" name="question_mark" size="xs" class="q-mr-sm">
                <q-tooltip>{{ $t('OnlySelectAllThisPageFilterResult') }}</q-tooltip>
            </q-icon>
            <BatchAIAnalysisButton :count="selectedRows.length" @click="clickBatchAIAnalysis" />
        </q-toolbar>
        <div class="bio-data-table q-py-sm">
            <div style="position:relative">
                <AppDataTable style="z-index:1" size="middle" bordered :data-source="filteredRows" :columns="columns" :sticky="true"
                    rowKey="0" :row-selection="rowSelection">
                    <template #bodyCell="{ column, record }">
                    <template v-if="column.title === 'IGV'">
                        <div class="row q-gutter-xs items-center justify-center">
                            <TableActionButton variant="primary" label="IGV"
                                @click="clickView(record)" />
                            <q-btn
                                icon="auto_awesome"
                                color="primary"
                                size="sm"
                                flat
                                round
                                dense
                                @click="clickAIAnalysis(record)"
                            >
                                <q-tooltip>AI 解读</q-tooltip>
                            </q-btn>
                        </div>
                    </template>
                </template>
                </AppDataTable>
            </div>
            <q-dialog v-model="igvVisible">
                <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
                    <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
                </q-card>
            </q-dialog>
        </div>
    </div>
    <MutationAIAnalysisDialog
        v-model="aiDialogVisible"
        :record="aiCurrentRow"
        :records="aiRecords"
        type="fusion-somatic"
        :header="header"
    />
</template>
<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { errorMessage, infoMessage } from 'src/utils/notify';
import { ref, onMounted, toRef, watch, onUnmounted, defineExpose, computed, onDeactivated } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from "vue-i18n"
import { useQuasar } from 'quasar'
import IGV from './Igv.vue'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import BatchAIAnalysisButton from 'src/components/button/BatchAIAnalysisButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'
import MutationAIAnalysisDialog from 'src/components/MutationAIAnalysisDialog.vue'


const { t } = useI18n()
const $q = useQuasar()
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
    url: {
        type: String,
        require: false,
        default: () => ''
    },
    selectedDefaultRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    defaultReportRows: {
        type: Array,
        required: false,
        default: () => [],
    },
})
const selectedDefaultRows = ref([])
const propSelectedDefaultRows = toRef(props, 'selectedDefaultRows')
const propDefaultReportRows = toRef(props, 'defaultReportRows')
const searchFilterRows = (keyword) => {
    if (keyword) {
        filteredRows.value = rows.value.filter((t) => {
            if (isDefineReport.value && t[9] === 'Y') {
                // 自定义报告模式下，始终显示报告行
                return true
            }
            for (let i = 0; i < 7; i++) {
                if (String(t[i]).includes(keyword)) {
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
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    searchFilterRows(keyword.value)
    selectedRows.value = selectedDefaultRows.value
}

const clearKeyword = () => {
    keyword.value = ''
    filteredRows.value = rows.value
    selectedRows.value = selectedDefaultRows.value
}

const clickView = (record) => {
    selectedFile.value = record[8]
    igvVisible.value = true
}

// AI 分析
const aiDialogVisible = ref(false)
const aiCurrentRow = ref(null)
const aiRecords = ref(null)

function clickAIAnalysis(record) {
    aiCurrentRow.value = record
    aiRecords.value = null
    aiDialogVisible.value = true
}

function clickBatchAIAnalysis() {
    const selected = filteredRows.value.filter(r => selectedRows.value.includes(r[0]))
    if (selected.length < 1) {
        $q.notify({ message: '请至少选择 1 条记录进行解读', type: 'warning' })
        return
    }
    aiCurrentRow.value = null
    aiRecords.value = selected
    aiDialogVisible.value = true
}
const rows = toRef(props, 'rows')
const header = toRef(props, 'header')
const propSearchParam = toRef(props, 'searchParam')
const propSelectedRows = toRef(props, 'selectedRows')

const selectedRows = ref([])

const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')
const isDefineReport = computed(() => route.name === 'defineReport')
const rowSelection = computed(() => {
    return {
        selectedRowKeys: selectedRows,
        onChange: onSelectChange,
        columnWidth: 35,
        getCheckboxProps: getCheckboxProps
    }
}
)

const onSelectChange = (selectedRowKeys) => {
    console.log(selectedRowKeys)
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    selectedRows.value = selectedRowKeys
    console.log(selectedRows.value)
    selectedDefaultRows.value = []
    for (const item of selectedRows.value) {
        let find = false
        for (const iterator of propDefaultReportRows.value) {
            if (item === iterator) {
                find = true
                break
            }
        }
        if (find) {
            selectedDefaultRows.value.push(item)
        }
    }
    filterChange()
}
const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}

const getChangedData = () => {
    console.log(selectedRows.value)
    return {
        searchParam: keyword.value,
        selectedRows: selectedRows.value,
        filtered: rows.value.length !== filteredRows.value.length,
        selected: selectedRows.value.length > 0,
        selectedDefaultRows: selectedDefaultRows.value,
    }
}
const filterChange = () => {
    emit('filterChange', getChangedData())
}

onMounted(() => {
    console.log('normal onMounted')
    loadData()

})

watch([rows], () => {
    loadData()
})

onUnmounted(() => {
    filterChange()
})

const loadData = () => {
    const width = [30, 30, 60, 60, 60, 60, 200, 50, 30]
    columns.value = []
    header.value.filter(t => t !== 'Report')
        .forEach((item, index) => {
            if (item === 'IGV') {
                columns.value.push({
                    title: item,
                    dataIndex: index + 1,  // 解析的时候额外增加了lineNumber，所以此处索引需要+1
                    align: 'center',
                    width: width[index],
                })
            } else
                columns.value.push({
                    title: item,
                    dataIndex: index + 1,  // 解析的时候额外增加了lineNumber，所以此处索引需要+1
                    align: 'center',
                    width: width[index],
                    customCell: customCell
                })
        })
    keyword.value = propSearchParam.value
    searchFilterRows(propSearchParam.value)
    selectedRows.value = propSelectedRows.value
    // for (let item of filteredRows.value) {
    //     let found = false
    //     for (let lineNumber of propSelectedRows.value) {
    //         if (lineNumber === item[0]) {
    //             found = true
    //             break
    //         }
    //     }
    //     if (found) {
    //         selectedRows.value.push(item[0])
    //     }
    // }
}
const reset = () => {
    keyword.value = ''
    searchFilterRows(keyword.value)
    selectedRows.value = propDefaultReportRows.value
}

const customCell = (record, rowIndex, column) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            'background-color': record[9] === 'Y' ? '#fff5ee' : '',
        },
        // 鼠标单击行
        onClick: (event) => {
        },
    }
}

defineExpose({ getChangedData, reset })
</script>

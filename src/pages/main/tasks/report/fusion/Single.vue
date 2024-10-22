<template>
    <q-toolbar class="text-primary">
        <q-toolbar-title v-if="!isSingle">{{ $t('TumorSingleSampleFusion') }}</q-toolbar-title>
        <q-input v-model="keyword1" class="q-mr-sm" dense :label="$t('Search') + ':'" clearable @clear="clearKeyword1"
            style="width:300px" :disable="showSticky && stickDone" />
        <q-btn size="small" color="primary" :label="$t('Search')" @click="searchKeyword1"
            :disable="showSticky && stickDone"></q-btn>
        <q-btn :href="props.qt.url" :label="$t('Download')" size="small" icon="south" color="primary" target="_blank"
            class="q-ml-sm" />
    </q-toolbar>
    <div class="bio-data-table q-py-sm">
        <div style="position:relative">
            <q-icon v-if="isDefineReport" color="accent" name="question_mark" size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px">
                <q-tooltip>{{ $t('OnlySelectAllThisPageFilterResult') }}</q-tooltip>
            </q-icon>
            <a-table style="z-index:1" size="middle" bordered rowKey="0" :data-source="filteredRows1" :columns="columns1"
                :sticky="true" :row-selection="rowSelection1">
                <template #bodyCell="{ column, record }">
                    <q-btn v-if="column.title === 'IGV'" label="IGV" color="primary" size="xs" outline
                        @click="clickView(record)"></q-btn>
                    <template v-else>
                        <a-tooltip v-if="column.ellipsis" color="#3b4146" :title="record[column.dataIndex]"
                            :overlay-style="{ maxWidth: '1200px' }">
                            <div>{{ record[column.dataIndex] }}</div>
                        </a-tooltip>
                        <span v-else>{{ record[column.dataIndex] }}</span>
                    </template>
                </template>
            </a-table>
        </div>
    </div>

    <div v-if="!isSingle">
        <q-toolbar class="text-primary">
            <q-toolbar-title v-if="!isSingle">{{ $t('ControlSingleSampleFusion') }}</q-toolbar-title>

            <q-input v-model="keyword2" class="q-mr-sm" dense :label="$t('Search') + ':'" clearable @clear="clearKeyword2"
                style="width:300px" :disable="showSticky && stickDone" />
            <q-btn size="small" color="primary" :label="$t('Search')" @click="searchKeyword2"
                :disable="showSticky && stickDone" />
            <q-btn :href="props.qn.url" :label="$t('Download')" size="small" icon="south" color="primary" target="_blank"
                class="q-ml-sm" />
        </q-toolbar>
        <div style="position:relative">
            <q-icon v-if="isDefineReport" color="accent" name="question_mark" size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px">
                <q-tooltip>{{ $t('OnlySelectAllThisPageFilterResult') }}</q-tooltip>
            </q-icon>
            <a-table style="z-index:1" size="middle" bordered :data-source="filteredRows2" :columns="columns2"
                :sticky="true" rowKey="0" :row-selection="rowSelection2">
                <template #bodyCell="{ column, record }">
                    <q-btn v-if="column.title === 'IGV'" label="IGV" color="primary" size="xs" outline
                        @click="clickView(record)"></q-btn>
                    <template v-else>
                        <a-tooltip v-if="column.ellipsis" color="#3b4146" :title="record[column.dataIndex]"
                            :overlay-style="{ maxWidth: '1200px' }">
                            <div>{{ record[column.dataIndex] }}</div>
                        </a-tooltip>
                        <span v-else>{{ record[column.dataIndex] }}</span>
                    </template>
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
import { useI18n } from "vue-i18n"

const { t } = useI18n();
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
                url: '',
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
                url: '',
            }
        },
    },
    qtSelectedDefaultRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    qtDefaultReportRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    qnSelectedDefaultRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    qnDefaultReportRows: {
        type: Array,
        required: false,
        default: () => [],
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

const selectedRows = ref([])
const selectedRows2 = ref([])



const igvVisible = ref(false)
const selectedFile = ref('')

const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')

const isDefineReport = computed(() => route.name === 'defineReport')

const qtSelectedDefaultRows = ref([])
const qnSelectedDefaultRows = ref([])
const propQtSelectedDefaultRows = toRef(props, 'qtSelectedDefaultRows')
const propQnSelectedDefaultRows = toRef(props, 'qnSelectedDefaultRows')
const propQtDefaultReportRows = toRef(props, 'qtDefaultReportRows')
const propQnDefaultReportRows = toRef(props, 'qnDefaultReportRows')


const searchFilterRows1 = (keyword) => {
    if (keyword) {
        filteredRows1.value = qtRows.value.filter((t) => {
            if (showSticky.value && t[t.length - 1] === 'Y') return true
            for (let i = 0; i < t.length; i++) {
                if (t[i].toString().includes(keyword)) {
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
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    searchFilterRows1(keyword1.value)
    selectedRows.value = qtSelectedDefaultRows.value
}

const searchFilterRows2 = (keyword) => {
    if (keyword) {
        filteredRows2.value = qnRows.value.filter((t) => {
            if (showSticky.value && t[t.length - 1] === 'Y') return true
            for (let i = 0; i < t.length; i++) {
                if (t[i].toString().includes(keyword)) {
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
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    searchFilterRows2(keyword2.value)
    selectedRows.value = qnSelectedDefaultRows.value
}

const clearKeyword1 = () => {
    filteredRows1.value = qtRows.value
    keyword1.value = ''
    selectedRows.value = qtSelectedDefaultRows.value
}

const clearKeyword2 = () => {
    filteredRows2.value = qnRows.value
    keyword2.value = ''
    selectedRows.value = qnSelectedDefaultRows.value
}

const clickView = (record) => {
    selectedFile.value = record[9]
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
            filtered: qtRows.value.length !== filteredRows1.value.length,
            selected: selectedRows.value.length > 0,
            selectedDefaultRows: qtSelectedDefaultRows.value,
        },
        qn: {
            searchParam: keyword2.value,
            selectedRows: selectedRows2.value,
            filtered: qnRows.value.length !== filteredRows2.value.length,
            selected: selectedRows2.value.length > 0,
            selectedDefaultRows: qnSelectedDefaultRows.value,
        },
    }
}
const filterChange = () => {
    emit('filterChange', getChangedData())
}
onUnmounted(() => {
    console.log('signal onUnmounted')
    filterChange()
})
watch([qtSearchParam, qnSearchParam, qtRows, qnRows, qtSelectedRows, qnSelectedRows], () => {
    loadData()
})

onMounted(() => {
    console.log('signal onMounted')
    loadData()
})

const samples = toRef(props, 'samples')
const loadData = () => {
    let width = [30, 30, 75, 75, 30, 60, 60, 120, 30]
    columns1.value = []
    qtHeader.value.filter(t => t !== 'Report')
        .forEach((item, index) => {
            if (item === 'IGV') {
                columns1.value.push({
                    title: item,
                    dataIndex: index + 1, // 解析的时候额外增加了lineNumber，所以此处索引需要+1
                    align: 'center',
                    width: width[index],
                })
            } else
                columns1.value.push({
                    title: item,
                    dataIndex: index + 1, // 解析的时候额外增加了lineNumber，所以此处索引需要+1
                    align: 'center',
                    width: width[index],
                    ellipsis: true,
                    customCell: customCell
                })
        })

    keyword1.value = qtSearchParam.value
    searchFilterRows1(qtSearchParam.value)

    selectedRows.value = qtSelectedRows.value
    qtSelectedDefaultRows.value = propQtSelectedDefaultRows.value
    // selectedRows.value = propQtSelectedDefaultRows.value

    // for (let item of filteredRows1.value) {
    //     console.log(item)
    //     let found = false
    //     for (let lineNumber of qtSelectedRows.value) {
    //         console.log(lineNumber)
    //         if (lineNumber === item[0]) {
    //             found = true
    //             break
    //         }
    //     }
    //     if (found) {
    //         selectedRows.value.push(item.lineNumber)
    //     }
    // }
    // qnSelectedDefaultRows.value = propQtSelectedDefaultRows.value


    if (samples.value.length > 1) {
        columns2.value = []
        width = [30, 30, 75, 75, 30, 60, 60, 120, 30]
        qnHeader.value.filter(t => t !== 'Report')
            .forEach((item, index) => {
                if (item === 'IGV') {
                    columns2.value.push({
                        title: item,
                        dataIndex: index + 1, // 解析的时候额外增加了lineNumber，所以此处索引需要+1
                        align: 'center',
                        width: width[index]
                    })
                } else
                    columns2.value.push({
                        title: item,
                        dataIndex: index + 1, // 解析的时候额外增加了lineNumber，所以此处索引需要+1
                        align: 'center',
                        width: width[index],
                        ellipsis: true,
                        customCell: customCell
                    })
            })
        keyword2.value = qnSearchParam.value
        searchFilterRows2(qnSearchParam.value)

        selectedRows2.value = qnSelectedRows.value
        qnSelectedDefaultRows.value = propQnSelectedDefaultRows.value
        // for (let item of filteredRows2.value) {
        //     console.log(item)
        //     let found = false
        //     for (let lineNumber of qnSelectedRows.value) {
        //         if (lineNumber === item[0]) {
        //             found = true
        //             break
        //         }
        //     }
        //     if (found) {
        //         selectedRows2.value.push(item.lineNumber)
        //     }
        // }
        // selectedRows2.value = propQnSelectedDefaultRows.value
        // qnSelectedDefaultRows.value = propQnSelectedDefaultRows.value
    }
}



const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}
const onSelectChange = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    selectedRows.value = selectedRowKeys
    console.log(selectedRowKeys)
    qtSelectedDefaultRows.value = []
    for (const item of selectedRows.value) {
        let find = false
        for (const iterator of propQtSelectedDefaultRows.value) {
            if (item === iterator) {
                find = true
                break
            }
        }
        if (find) {
            qtSelectedDefaultRows.value.push(item)
        }
    }
}

const onSelectChange2 = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    selectedRows2.value = selectedRowKeys
    console.log(selectedRowKeys)
    qnSelectedDefaultRows.value = []
    for (const item of selectedRows.value) {
        let find = false
        for (const iterator of propQnSelectedDefaultRows.value) {
            if (item === iterator) {
                find = true
                break
            }
        }
        if (find) {
            qnSelectedDefaultRows.value.push(item)
        }
    }
}

const reset = () => {
    keyword1.value = ''
    keyword2.value = ''
    searchFilterRows1(keyword1.value)
    searchFilterRows2(keyword2.value)
    selectedRows.value = propQtDefaultReportRows.value
    selectedRows2.value = propQnDefaultReportRows.value
}

defineExpose({ getChangedData, reset })

// 表格1的勾选列配置
const rowSelection1 = computed(() => {
    if (!isDefineReport.value) {
        return null
    }
    return {
        selectedRowKeys: selectedRows,
        onChange: onSelectChange,
        columnWidth: 20,
        getCheckboxProps: getCheckboxProps
    }
}
)

// 表格2的勾选列配置
const rowSelection2 = computed(() => {
    if (!isDefineReport.value) {
        return null
    }
    return {
        selectedRowKeys: selectedRows2,
        onChange: onSelectChange2,
        columnWidth: 35,
        getCheckboxProps: getCheckboxProps
    }
}
)

// 用于Report = Y的列背景着色
const customCell = (record, rowIndex, column) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            'background-color': record[10] === 'Y' ? '#fff5ee' : '',
        },
        // 鼠标单击行
        onClick: (event) => {
        },
    }
}
</script>

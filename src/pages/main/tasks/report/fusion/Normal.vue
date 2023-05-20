<template>
    <q-toolbar class="text-primary">
        <q-input
            v-model="keyword"
            class="q-mr-sm"
            dense
            :label="$t('Search') + ':'"
            clearable
            @clear="clearKeyword"
            style="width:300px"
            :disable="showSticky && stickDone"
        />
        <q-btn
            size="small"
            color="primary"
            :label="$t('Search')"
            @click="searchKeyword"
            :disable="showSticky && stickDone"
        />
        <q-btn
            :href="props.url"
            :label="$t('Download')"
            size="small"
            icon="south"
            color="primary"
            target="_blank"
            class="q-ml-sm"
        />
    </q-toolbar>
    <div class="bio-data-table q-py-sm">
        <div style="position:relative">
            <q-icon
                color="accent"
                name="question_mark"
                size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px"
            >
                <q-tooltip>{{$t('OnlySelectAllThisPageFilterResult')}}</q-tooltip>
            </q-icon>
            <a-table
                style="z-index:1"
                size="middle"
                bordered
                :loading="loading"
                :data-source="filteredRows"
                :columns="columns"
                :sticky="true"
                rowKey="lineNumber"
                :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange, columnWidth: 25, getCheckboxProps: getCheckboxProps }"
            >
                <template #bodyCell="{ column, record }">
                    <q-btn
                        v-if="column.title === 'IGV'"
                        label="IGV"
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
    </div>
</template>
<script setup>
import { errorMessage, infoMessage } from 'src/utils/notify';
import { ref, onMounted, toRef, watch, onUnmounted, defineExpose } from 'vue'
import { useRoute } from 'vue-router'
import IGV from './Igv.vue'
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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
    }
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
        errorMessage(t('DefineReportUnlockReuired'))
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
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    selectedRows.value = selectedRowKeys
}
const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}

const getChangedData = () => {
    return {
        searchParam: keyword.value,
        selectedRows: selectedRows.value,
        filtered: rows.value.length !== filteredRows.value.length,
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
    const width = [30, 30, 60, 60, 60, 60, 200, 50, 30]
    columns.value = []
    console.log('>>>>>>>>>>>>>>>>>>>', header.value)
    header.value.filter(t => t !== 'Report')
        .forEach((item, index) => {
        if (item === 'IGV') {
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
                customCell: customCell
            })
    })
    keyword.value = propSearchParam.value
    searchFilterRows(propSearchParam.value)
    selectedRows.value = []
    for (let item of filteredRows.value) {
        let finded = false
        for (let lineNumber of propSelectedRows.value) {
            if (lineNumber === item.lineNumber) {
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

const customCell = (record, rowIndex, column) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            // 'font-weight': record.id === currentRow.value.id ? 'bolder' : 'normal',
            // 'background-color': record[columnName] === 'Y' ? '#1976d2' : '',
            'background-color': (record.Report === 'Y' && column.key !== 'Operation') ? '#fff5ee' : '',
            // cursor: 'pointer',
        },
        // 鼠标单击行
        onClick: (event) => {
        },
    }
}

defineExpose({ getChangedData, reset })
</script>

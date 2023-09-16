<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md"
        @click="dlgVisible = !dlgVisible"
        :label="$t('Intro')"
    />
    <div class="q-py-md">
        <q-btn v-if="props.viewConfig.showStick && props.viewConfig.stickDone" icon="bookmarks" size="small" color="primary"
            class="relative-position float-right q-mr-md" :label="$t('ReportStickDone')" @click="reset()" />
        <q-btn v-if="props.viewConfig.showStick && !props.viewConfig.stickDone" icon="bookmarks" size="small" outline
            color="primary" class="relative-position float-right q-mr-md" @click="stickFilter()"
            :label="$t('ReportStickData')" />
    </div>
    <div class="q-pt-sm">
        <a-table rowKey="lineNumber" :data-source="rows" :columns="columns" :row-selection="rowSelection" bordered
            size="middle">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'report'">
                    <q-btn flat size="sm" color="primary" label="reads" target="_blank" :href="record.file"
                        :download="record.fileName" />
                    <span>|</span>
                    <q-btn flat size="sm" color="primary" label="Blast" />
                </template>
            </template>
            <template
                #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
            >
                <div style="padding: 8px">
                    <a-input
                        ref="searchInput"
                        :value="selectedKeys[0]"
                        style="width: 250px; margin-bottom: 8px; display: block"
                        @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                        @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
                    />
                    <div class="row justify-around">
                        <a-button
                            type="primary"
                            size="small"
                            style="width: 70px; margin-right: 28px"
                            @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
                        >
                            <template #icon><SearchOutlined /></template>
                            {{$t('Search')}}
                        </a-button>
                        <a-button size="small" style="width: 70px" @click="handleReset(clearFilters)">
                            {{$t('Reset')}}
                        </a-button>
                    </div>
                </div>
            </template>
            <template #customFilterIcon="{ filtered }">
                <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
            </template>
        </a-table>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ $t('MutationAnalysis') }}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{ props.intro }}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">{{ $t('Close') }}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { errorMessage, infoMessage } from 'src/utils/notify'
import {ref, onMounted, computed, toRef, watch, reactive} from 'vue'
import { useRoute } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import { useCustomCell } from 'src/utils/customCell'
import { useQuasar } from 'quasar'
import { useI18n } from "vue-i18n"
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'


const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const dlgVisible = ref(false)
const emit = defineEmits(['stickDone', 'reset'])
const viewConfig = toRef(props, 'viewConfig')
const rows = ref([])
const isDefineReport = computed(() => useRoute().name === 'defineReport')
let selectedDefaultRows = ref([])
let defaultRows = ref([])

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
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {}
        },
    },
    task: {
        type: Object,
        required: false,
    },
    stepData: {
        type: Object,
        default: () => {
        }
    },
})
const stepData = toRef(props, 'stepData')

const customCell = useCustomCell('report')

const getSpan = (index, record) => {
    // 行单元格合并存在很多问题，尤其是在排序和默认高亮方面，所以暂不合并
    const dataIndex = 'categoryName'
    const cellValue = rows.value[index][dataIndex]

    if (index > 0 && rows.value[index - 1][dataIndex] === cellValue) {
        return 0
    }

    return rows.value.filter(row => row[dataIndex] === cellValue).length
}
// 表头定义
const columns = computed(() => [
    {
        name: 'virusName',
        title: t('VirusName'),
        dataIndex: 'virusName',
        align: 'center',
        // sorter: true,
        customFilterDropdown: true,
        onFilter: (value, record) => record.virusName.includes(value),
        // onFilter: (value, record) => value.includes(record.virusName),
        customCell
    },
    {
        name: 'readsCount',
        title: t('ReadsCount'),
        dataIndex: 'readsCount',
        align: 'center',
        sorter: (a, b) => Number(a.readsCount) < Number(b.readsCount) ? -1 : 1,
        customCell
    },
    {
        name: 'totalProportion',
        title: t('TotalProportion'),
        dataIndex: 'totalProportion',
        align: 'center',
        sorter: (a, b) => Number(a.totalProportion.replace(/%/, '')) < Number(b.totalProportion.replace(/%/, '')) ? -1 : 1,
        customCell
    },
    { name: 'report', title: t('Report'), dataIndex: 'report', align: 'center', required: true },
])

onMounted(() => loadData())

// 国际化切换重新加载数据
watch(langCode, () => loadData())

// 不同病原体的数据文件配置
const dataFile = computed(() => {
    const suffix = langCode.value === 'cn' ? 'CN' : 'EN'
    return `Virus/Virus_${suffix}.txt`
})

const loadData = () => {
    $q.loading.show({ delay: 100 })
    console.log("stepData", stepData.value)
    readTaskFile(route.params.id, dataFile.value).then((res) => {
        // 数据key（基于表头的dataIndex，额外增加行的数据文件列file）
        const fields = ['virusName', 'readsCount', 'totalProportion', 'file', 'report']
        // 解析数据（开始2行为表头，需要排除）
        rows.value = getCsvDataAndSetLineNumber(res, { fields })
        // 文件下载路径
        rows.value.forEach(r => r.file = `igv${r.file}`)
        // 下载的文件名
        rows.value.forEach(r => r.fileName = r.file.substring(r.file.lastIndexOf('/') + 1))

        const virusCol = columns.value[columns.value.findIndex(c => c.dataIndex === 'virusName')]
        // 种名增加筛选功能
        let options = [...new Set(rows.value.map(r => r['virusName']))]
        virusCol.filters = options.map(opt => {
            return { text: opt, value: opt }
        })
        console.log(rows)
        if (stepData.value) {


            for (const row of rows.value) {
                for (const item of stepData.value.tables) {
                    if (item === row.lineNumber) {
                        selectedRows.value.push(item)
                        break
                    }
                }
            }
        }
    }).finally(() => {
        $q.loading.hide()
    })
}

const getCheckboxProps = (record) => {
    return {
        disabled: viewConfig.value.showStick && viewConfig.value.stickDone, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}
const rowSelection = computed(() => {
    if (!isDefineReport.value) {
        return null
    }
    return {
        selectedRowKeys: selectedRows,
        onChange: onSelectChange,
        columnWidth: 25,
        getCheckboxProps: getCheckboxProps
    }
}
)

const selectedRows = ref([])

const onSelectChange = (selectedRowKeys) => {
    // if (viewConfig.value.showStick && viewConfig.value.stickDone) {
    //     errorMessage('请先取消过滤')
    //     return false
    // }
    console.log(selectedRowKeys)
    selectedRows.value = selectedRowKeys
    selectedDefaultRows.value = []
    for (let key of selectedRowKeys) {
        if (defaultRows.value.some(lineNumber => lineNumber === key)) {
            selectedDefaultRows.value.push(key)
        }
    }
}

const stickFilter = () => {
    var results = []
    emit('stickDone', { tables: selectedRows.value })
}
const reset = () => {
    emit('reset', null)
    selectedRows.value = []
}

const state = reactive({
    searchText: '',
    searchedColumn: '',
});

const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    state.searchText = selectedKeys[0]
    state.searchedColumn = dataIndex
};
const handleReset = (clearFilters) => {
    clearFilters({
        confirm: true,
    });
    state.searchText = ''
};
</script>

<style lang="scss" scoped></style>

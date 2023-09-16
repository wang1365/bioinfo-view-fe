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
        <q-btn v-if="props.viewConfig.showStick && props.viewConfig.stickDone" icon="bookmarks" size="small"
               color="primary"
               class="relative-position float-right q-mr-md" :label="$t('ReportStickDone')" @click="reset()"/>
        <q-btn v-if="props.viewConfig.showStick && !props.viewConfig.stickDone" icon="bookmarks" size="small" outline
               color="primary" class="relative-position float-right q-mr-md" @click="stickFilter()"
               :label="$t('ReportStickData')"/>
    </div>
    <div class="q-pt-sm">
        <a-table rowKey="lineNumber" :data-source="rows" :columns="columns" :row-selection="rowSelection" bordered
                 size="middle">
            <template #bodyCell="{ record, column, }">
                <template v-if="column.dataIndex === 'report'">
                    <q-btn flat size="sm" color="primary" label="reads" target="_blank" :href="record.file"
                           :download="record.fileName"/>
                    <span>|</span>
                    <q-btn flat size="sm" color="primary" label="Blast"/>
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
                        <a-button size="small" style="width: 70px" @click="handleReset(clearFilters, column.dataIndex)">
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
                <q-bar class="bg-primary text-white">{{ introTitle }}</q-bar>
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
import {errorMessage, infoMessage} from 'src/utils/notify'
import {ref, onMounted, computed, toRef, watch, reactive} from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import {useRoute} from 'vue-router'
import {readTaskFile, readTaskMuFile} from 'src/api/task'
import {getCsvHeader, getCsvData, getCsvDataAndSetLineNumber} from 'src/utils/csv'
import {useCustomCell} from 'src/utils/customCell'
import {useQuasar} from 'quasar'
import {useI18n} from "vue-i18n"
import {globalStore} from 'src/stores/global'
import {storeToRefs} from 'pinia'


const store = globalStore()
const {langCode} = storeToRefs(store)
const {t} = useI18n()
const $q = useQuasar()
const route = useRoute()
const dlgVisible = ref(false)
const emit = defineEmits(['stickDone', 'reset'])
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
    category: {
        type: String,
        default: 'bacteria'
    }
})
const viewConfig = toRef(props, 'viewConfig')
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
        title: t('Shu'),
        children: [
            {
                name: 'categoryName',
                title: t('ShuMing'),
                dataIndex: 'categoryName',
                customFilterDropdown: true,
                width: 100,
                // align: 'center',
                // sorter: true,
                // onFilter: (value, record) => value.includes(record.categoryName),
                onFilter: (value, record) => record.categoryName.includes(value),
                customCell,
                // customCell: (_, index, record) => {
                //     return {
                //         rowSpan: getSpan(index, record)
                //     }
                // }
            },
            {
                name: 'relativeAbundance',
                title: t('RelativeAbundance'),
                dataIndex: 'relativeAbundance',
                align: 'center',
                width: 50,
                sorter: (a, b) => Number(a.relativeAbundance.replace(/%/, '')) < Number(b.relativeAbundance.replace(/%/, '')) ? -1 : 1,
                customCell,
                // customCell: (_, index, record) => {
                //     return {
                //         rowSpan: getSpan(index, record)
                //     }
                // }
            },
            {
                name: 'readsCount1',
                title: t('ReadsCount'),
                dataIndex: 'readsCount1',
                align: 'center',
                width: 50,
                sorter: (a, b) => Number(a.readsCount1) < Number(b.readsCount1) ? -1 : 1,
                customCell,
                // customCell: (_, index, record) => {
                //     return {
                //         rowSpan: getSpan(index, record)
                //     }
                // }
            }
        ]
    },
    {
        title: t('Zhong'),
        children: [
            {
                name: 'speciesName',
                title: t('SpeciesName'),
                dataIndex: 'speciesName',
                width: 150,
                // align: 'center',
                // sorter: true,
                customFilterDropdown: true,
                // onFilter: (value, record) => value.includes(record.speciesName),
                onFilter: (value, record) => record.speciesName.includes(value),
                customCell
            },
            {
                name: 'proportion',
                title: t('Proportion'),
                dataIndex: 'proportion',
                align: 'center',
                width: 50,
                sorter: (a, b) => Number(a.proportion.replace(/%/, '')) < Number(b.proportion.replace(/%/, '')) ? -1 : 1,
                customCell
            },
            {
                name: 'readsCount2',
                title: t('ReadsCount'),
                dataIndex: 'readsCount2',
                align: 'center',
                width: 50,
                sorter: (a, b) => Number(a.readsCount2) < Number(b.readsCount2) ? -1 : 1,
                customCell
            },
            {
                name: 'totalProportion',
                title: t('TotalProportion'),
                dataIndex: 'totalProportion',
                align: 'center',
                width: 50,
                sorter: (a, b) => Number(a.totalProportion.replace(/%/, '')) < Number(b.totalProportion.replace(/%/, '')) ? -1 : 1,
                customCell
            },
        ]
    },
    {name: 'report', width: 100, title: t('Report'), dataIndex: 'report', align: 'center', required: true},
])

onMounted(() => loadData())

// 国际化切换重新加载数据
watch(langCode, () => loadData())

const introTitle = computed(() => {
    const i18nKey = {
        bacteria: 'Bacterial',
        fungus: 'Fungal',
        virus: `Virus`,
        parasite: `Parasite`,
        specificPathogen: `SpecificPathogen`,
    }[props.category]
    return t(i18nKey)
})

// 不同病原体的数据文件配置
const dataFile = computed(() => {
    const suffix = langCode.value === 'cn' ? 'CN' : 'EN'
    return {
        bacteria: `Bacteria/Bacteria_${suffix}.txt`,
        fungus: `Fungus/Fungus_${suffix}.txt`,
        virus: `Virus/Virus_${suffix}.txt`,
        parasite: `Parasite/Parasite_${suffix}.txt`,
        specificPathogen: `SpecificPathogen/SpecificPathogen_${suffix}.txt`,
    }[props.category]
})

const loadData = () => {
    $q.loading.show({delay: 100})
    console.log("stepData", stepData.value)
    readTaskFile(route.params.id, dataFile.value).then((res) => {
        // 数据key（基于表头的dataIndex，额外增加行的数据文件列file）
        const fields = ['categoryName', 'relativeAbundance', 'readsCount1',
            'speciesName', 'proportion', 'readsCount2', 'totalProportion', 'file', 'report']
        // 解析数据（开始2行为表头，需要排除）
        rows.value = getCsvDataAndSetLineNumber(res, {start: 2, fields})
        // 文件下载路径
        rows.value.forEach(r => r.file = `igv${r.file}`)
        // 下载的文件名
        rows.value.forEach(r => r.fileName = r.file.substring(r.file.lastIndexOf('/') + 1))

        columns.value.forEach(column => {
            if (column.children) {
                // 属名和种名增加筛选功能
                column.children.forEach(c => {
                    if (['categoryName', 'speciesName'].includes(c.dataIndex)) {
                        let options = [...new Set(rows.value.map(r => r[c.dataIndex]))]
                        options = options.map(opt => {
                            return {text: opt, value: opt}
                        })
                        c.filters = options
                    }
                })
            }
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
    emit('stickDone', {tables: selectedRows.value})
}
const reset = () => {
    emit('reset', null)
    selectedRows.value = []
}

// 自定义列检索-属
const state1 = reactive({
    searchText: '',
    searchedColumn: '',
});
// 自定义列检索-种
const state2 = reactive({
    searchText: '',
    searchedColumn: '',
});
// 自定义列检索-检索执行
const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    const state = dataIndex === 'categoryName' ? state1 : state2
    state.searchText = selectedKeys[0]
    state.searchedColumn = dataIndex
};
// 自定义列检索-重置
const handleReset = (clearFilters, dataIndex) => {
    clearFilters({
        confirm: true,
    });
    const state = dataIndex === 'categoryName' ? state1 : state2
    state.searchText = ''
};
</script>

<style lang="scss" scoped></style>

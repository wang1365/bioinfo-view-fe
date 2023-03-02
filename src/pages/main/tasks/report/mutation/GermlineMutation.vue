<template>
    <div>
        <q-splitter v-model="splitterModel" unit="px" style="height: 780px">
            <template v-slot:before>
                <div class="column" style="width:90%">
                    <q-input v-model="searchParams.gene" label="基因" clearable stack-label label-color="primary"
                        class="full-width" :disable="showSticky && stickDone" />

                    <q-input v-model="searchParams.depth" label="深度 >" clearable type="number" stack-label
                        label-color="primary" class="full-width" :disable="showSticky && stickDone" />

                    <q-input v-model="searchParams.ratio" label="肿瘤频率 >" clearable type="number" stack-label
                        label-color="primary" class="full-width" :disable="showSticky && stickDone" />
                    <q-select v-model="searchParams.mutationType" clearable multiple hide-dropdown-icon
                        :options="props.options.mutationType" label="突变类型" stack-label label-color="primary"
                        class="full-width" :disable="showSticky && stickDone" />

                    <q-select v-model="searchParams.mutationPosition" clearable multiple
                        :options="props.options.mutationPosition" label="突变位置" stack-label label-color="primary"
                        class="full-width" :disable="showSticky && stickDone" />

                    <q-select clearable hide-dropdown-icon v-model="searchParams.mutationMeaning" stack-label multiple
                        label-color="primary" :options="props.options.mutationMeaning" label="突变意义" class="full-width"
                        :disable="showSticky && stickDone" />
                    <q-select clearable hide-dropdown-icon v-model="searchParams.mutationRisk" stack-label multiple
                        label-color="primary" :options="props.options.mutationRisk" label="突变危险" class="full-width"
                        :disable="showSticky && stickDone" />
                    <q-input v-model="searchParams.humanRatio" label="人群频率 <" clearable hide-dropdown-icon type="number"
                        stack-label label-color="primary" class="full-width" :disable="showSticky && stickDone" />

                    <q-select clearable hide-dropdown-icon v-model="searchParams.sift" stack-label multiple
                        label-color="primary" :options="['T', 'D', '.']" label="SIFT_pred" class="full-width"
                        :disable="showSticky && stickDone" />

                    <div class="row items-center">
                        <q-checkbox left-label v-model="searchParams.drug" label="是否关联药物" color="primary"
                            :disable="showSticky && stickDone" />
                        <div class="text-primary text-bold">{{ `结果： ${filteredRows.length}条` }}</div>
                    </div>

                    <div class="q-gutter-xs text-center q-py-sm">
                        <q-btn color="primary" label="确定" size="md" icon="search" @click="search"
                            :disable="showSticky && stickDone" />
                        <q-btn color="primary" label="重置" size="md" icon="settings_backup_restore" @click="reset"
                            :disable="showSticky && stickDone" />
                        <q-btn color="primary" label="扩展列" size="md" icon="last_page" @click="showDrawer = !showDrawer"
                            :disable="showSticky && stickDone" />
                    </div>
                </div>
            </template>

            <template v-slot:after>
                <div style="position:relative">
                    <q-icon color="accent" name="question_mark" size="xs"
                        style="position:absolute;z-index:100;left:0px;top:0px">
                        <q-tooltip>仅全选本页筛选结果</q-tooltip>
                    </q-icon>
                    <a-table style="z-index:1" bordered :loading="loading" :data-source="filteredRows"
                        :columns="columns" :scroll="{ x: scrollX, y: 610 }" :custom-row="customRow" :sticky="true"
                        rowKey="lineNumber"
                        :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange, getCheckboxProps: getCheckboxProps }">
                        <template #bodyCell="{ column, record }">
                            <a-tooltip v-if="column.ellipsis" color="#3b4146" :title="record[column.dataIndex]">
                                <div>{{ record[column.dataIndex] }}</div>
                            </a-tooltip>
                            <span v-else>{{ record[column.dataIndex] }}</span>
                        </template>
                    </a-table>
                </div>
            </template>
        </q-splitter>
        <q-dialog v-model="showDrawer" class="fit">
            <q-card style="width: 50%">
                <q-card-section>
                    <div class="q-col">
                        <div class="text-h6 q-mb-sm">选择扩展列</div>
                        <div class="q-row-2">
                            <q-separator />
                            <q-scroll-area style="height: 500px">
                                <q-option-group :options="expandedColumns" type="checkbox"
                                    v-model="selectedExpandColIdx" @change="atOptionGroupChange"
                                    @update:model-value="atOptionGroupChange" />
                            </q-scroll-area>
                            <q-separator />
                        </div>
                    </div>
                </q-card-section>

                <q-card-actions align="center">
                    <q-btn color="primary" @click="clickSelectAll">全选</q-btn>
                    <q-btn color="primary" @click="clickSelectNone">清除</q-btn>
                    <q-btn color="primary" v-close-popup>确定</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-separator class="q-my-lg" size="2px" color="primary" />
    </div>

    <div class="q-my-sm" v-if="!showColumn">
        <div class="row q-mb-sm">
            <div class="col q-px-xs">
                <PieChartVue :data="filteredRows" />
            </div>
            <div class="col q-px-xs">
                <RoseChartVue :data="filteredRows" col-key="col13" title="突变意义统计" />
            </div>
            <div class="col q-px-xs">
                <RoseChartVue :data="filteredRows" col-key="col21" title="突变危险统计" />
            </div>
        </div>
        <div class="row">
            <div class="col-4 q-px-xs">
                <BarChartVue :data="filteredRows" />
            </div>

            <div class="col-8 q-px-xs">
                <BubbleChartVue :data="filteredRows" :colKeys="['col26', 'col31', 'col39']" />
            </div>
        </div>
    </div>
    <q-dialog class="q-py-sm" v-model="dialogVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <MutationInfo :row="currentRow" :task="props.task" :samples="props.samples"></MutationInfo>
            </q-card-section>
            <q-card-actions align="center" vertical>
                <q-btn label="关 闭" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted, toRef, toRefs, watch, computed, onUnmounted } from 'vue'
import BarChartVue from './SomaticInfoCharts/BarChart.vue'
import PieChartVue from './SomaticInfoCharts/PieChart.vue'
import RoseChartVue from './SomaticInfoCharts/RoseChart.vue'
import BubbleChartVue from './SomaticInfoCharts/BubbleChart.vue'
import RadarChartVue from './SomaticColumnCharts/RadarChart.vue'
import MutationInfo from './MutationInfo'

import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData } from 'src/utils/csv'
import { useRoute } from 'vue-router'
import { errorMessage, infoMessage } from 'src/utils/notify'
const splitterModel = ref(250)
const emit = defineEmits(['filterChange'])
const props = defineProps({
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    task: {
        type: Object,
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
    rows: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    header: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    options: {
        type: Object,
        required: false,
        default() {
            return {
                mutationPosition: [],
                mutationMeaning: [],
                mutationRisk: [],
            }
        },
    },
    searchParams: {
        type: Object,
        required: false,
        default() {
            return {
                gene: null,
                depth: null,
                ratio: null,
                mutationType: null,
                mutationPosition: [],
                mutationMeaning: null,
                mutationRisk: null,
                humanRatio: null,
                sift: null,
                drug: false,
            }
        },
    },
    drugRows: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    selectedRows: {
        type: Array,
        required: false,
        default: () => [],
    },
})
const route = useRoute()
const dialogVisible = ref(false)
const searchParams = ref({
    gene: null,
    depth: null,
    ratio: null,
    mutationType: [],
    mutationPosition: [],
    mutationMeaning: [],
    mutationRisk: [],
    humanRatio: null,
    sift: [],
    drug: false,
})

const showDrawer = ref(false)

const loading = ref(false)
const { rows, drugRows, header } = toRefs(props)
const propSelectedRows = toRef(props, 'selectedRows')
const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')
const filteredRows = ref([])

const currentRow = ref({})


const fixedColumns = [
    { i: 1, title: '', dataIndex: 'col1', align: 'center', width: 60, fixed: 'left' }, // Chr
    { i: 2, title: '', dataIndex: 'col2', align: 'center', width: 100, fixed: 'left' }, // Start
    { i: 3, title: '', dataIndex: 'col3', align: 'center', width: 100 }, // End
    { i: 4, title: '', dataIndex: 'col4', align: 'center', width: 70 }, // Ref
    { i: 5, title: '', dataIndex: 'col5', align: 'center', width: 70 }, // Alt
    { i: 6, title: '', dataIndex: 'col6', align: 'center', width: 120 }, // Geno_Type
    { i: 7, title: '', dataIndex: 'col7', align: 'center', width: 125 }, // Allelic_depths
    { i: 8, title: '', dataIndex: 'col8', align: 'center', width: 120 }, // Seq_depths
    { i: 9, title: '', dataIndex: 'col9', align: 'center', width: 130 }, // Mutation_Rate
    { i: 10, title: '', dataIndex: 'col10', align: 'center', width: 105 }, // Func.refGene
    { i: 11, title: '', dataIndex: 'col11', align: 'center', width: 110 }, // Gene.refGene

    { i: 13, title: '', dataIndex: 'col13', align: 'center', width: 160 }, // ExoniFunc.refGene
    { i: 14, title: '', dataIndex: 'col14', align: 'center', width: 80 }, // exon
    { i: 15, title: '', dataIndex: 'col15', align: 'center', width: 100 }, // NUChange
    { i: 16, title: '', dataIndex: 'col16', align: 'center', width: 100 }, // AAChange

    { i: 18, title: '', dataIndex: 'col18', align: 'left', width: 200, ellipsis: true }, // CLNDN
    { i: 19, title: '', dataIndex: 'col19', align: 'left', width: 200, ellipsis: true }, // CLNDISDB
    { i: 20, title: '', dataIndex: 'col20', align: 'left', width: 280, ellipsis: true }, // CLNREVSTAT
    { i: 21, title: '', dataIndex: 'col21', align: 'center', width: 120, ellipsis: true }, //CLNSIG
    { i: 22, title: '', dataIndex: 'col22', align: 'center', width: 200, ellipsis: true }, // cosmic70
    { i: 23, title: '', dataIndex: 'col23', align: 'center', width: 100 }, // ExAC_ALL
    { i: 24, title: '', dataIndex: 'col24', align: 'center', width: 100 }, // ExAC_AFR
    { i: 25, title: '', dataIndex: 'col25', align: 'center', width: 105 }, // ExAC_AMR
    { i: 26, title: '', dataIndex: 'col26', align: 'center', width: 100 }, // ExAC_EAS

    { i: 31, title: '', dataIndex: 'col31', align: 'center', width: 100 },
    { i: 32, title: '', dataIndex: 'col32', align: 'center', width: 100 },

    { i: 34, title: '', dataIndex: 'col34', align: 'center', width: 100 }, // avsnp150
    { i: 35, title: '', dataIndex: 'col35', align: 'center', width: 120 },

    { i: 39, title: '', dataIndex: 'col39', align: 'center', width: 120 },

    { i: 56, title: '', dataIndex: 'col56', align: 'center', width: 100 },

    { i: 144, title: '', dataIndex: 'col144', align: 'center', width: 100 },

    // {i: 0, key: 'operation', title: '操作', dataIndex: 'operation', align: 'center', fixed: 'right', width: 75},
]

const scrollX = computed(() => {
    return 2000 + (fixedColumns.length - 33) * 100
})

const selectedExpandColIdx = ref([])


// 固定显示列的列号
const fixedIdx = fixedColumns.map(t => t.i)
// 扩展列的列号（所有列 排除固定列）
const expandedColumns = computed(() => {
    const expandedIdx = new Array(props.header.length).fill(0).map((t, i) => i + 1).filter(t => !fixedIdx.includes(t))
    return expandedIdx.map(idx => {
        return {
            i: idx, title: header.value[idx - 1], dataIndex: `col${idx}`, width: 100, ellipsis: true,
            label: header.value[idx - 1], value: idx
        }
    })
})

const clickSelectAll = () => {
    selectedExpandColIdx.value = [...expandedColumns.value.map(t => t.i)]
}

const clickSelectNone = () => {
    selectedExpandColIdx.value = []
}

const atOptionGroupChange = () => {
    console.log('atOptionGroupChange', selectedExpandColIdx)
}

const columns = computed(() => {
    const result = [...fixedColumns]
    selectedExpandColIdx.value.forEach(idx => {
        result.push({
            i: idx, title: header.value[idx - 1], dataIndex: `col${idx}`, width: 100, ellipsis: true
        })
    })

    // 如果有扩展列要展示，需要重置列宽
    // if (fixedColumns.length > 0) {
    //     result.forEach(t => t.width = 0)
    // }

    result.forEach((c) => (c.customCell = customCell))
    return result
})

const customCell = (record, rowIndex, column) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            'font-weight': record.id === currentRow.value.id ? 'bolder' : 'normal',
            cursor: 'pointer',
        },
        // 鼠标单击行
        onClick: (event) => {
            // 记录当前点击的行标识
            currentRow.value = record
            clickRow(record)
        },
    }
}

const customRow = (record, index) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            // 字体颜色
            // 'color': record.id === physicalSurveyCurrRowId.value ? 'orange' : 'rgba(0, 0, 0, 0.65)',
            // 行背景色
            // 'background-color': record.id === currentRow.value.id  ? '#FFFF99' : 'white',
            // 'border-color': 'red',
            // 'border-style': 'solid',
            // 'border-width': '5px',
            // // 字体类型
            // 'font-family': 'Microsoft YaHei',
            // // 下划线
            // 'text-decoration': 'underline',
            // // 字体样式-斜体
            // 'font-style': 'italic',
            // // 字体样式-斜体
            // 'font-weight': record.id === clickedRow.value  ? 'bolder' : 'none'
        },
        // 鼠标单击行
        // onClick: event => {
        //     // 记录当前点击的行标识
        //     if (currentRow.value.id === record.id) {
        //         currentRow.value = {}
        //     } else {
        //         currentRow.value = record
        //     }
        // }
    }
}

const reset = () => {
    searchParams.value = {
        gene: null,
        depth: null,
        ratio: null,
        mutationType: null,
        mutationPosition: [],
        mutationMeaning: null,
        mutationRisk: null,
        humanRatio: null,
        sift: null,
        drug: false,
    }
    search()
}

const clickRow = (row) => {
    dialogVisible.value = true
}

// 根据过滤条件筛选数据
const searchFilterRows = (searchParams) => {
    filteredRows.value = rows.value.filter((line, i) => {
        // 搜索基因
        // 原始表格11列，支持模糊搜索
        let param = searchParams.gene
        if (param && param.length > 0) {
            if (!line.col11.includes(param)) {
                return false
            }
        }

        // 深度
        // 原始表格8列，大于0的正整数，
        param = searchParams.depth
        if (param && !(Number(line.col8) > param)) {
            return false
        }

        // 频率
        // 原始表格，大于0的小数
        param = searchParams.ratio
        if (param && !(Number(line.col9) > param)) {
            return false
        }

        // 突变类型 All/SNP/INDEL
        /*
            根据原始表格4、5列判断，SNP是第4列只能为A/T/C/G单碱基且第5列也只能为A/T/C/G单碱基（中划线-算INDEL），其他情况为INDEL
            SNP是第4只能是A/T/C/G，第5列也是只能为A/T/C/G，
            例如第4列是A，第5列是T，
            其他情况都是INDEL，如第4列为A，第5列为-；第4列为A，第5列为AGC，第四列为AT，第5列为T
          */
        param = searchParams.mutationType
        if (param && param.length === 1) {
            const Snp = ['A', 'T', 'C', 'G']
            let isSnp = Snp.includes(line.col4) && Snp.includes(line.col5)
            if (param[0] === 'SNP' && !isSnp) {
                return false
            }
            if (param[0] === 'INDEL' && isSnp) {
                return false
            }
        }

        // 突变位置 All/Exonic / Intronic/ Intergenic /还有没列举完
        /*
            原始表格第14列，把这列信息提取排序去重后，再加上一个【exonic,splicing】选项，做成下拉菜单选择
            （如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）
          */
        param = searchParams.mutationPosition
        if (param && param.length > 0) {
            const positions = line.col10.split(';')
            if (!positions.some((position) => param.includes(position))) {
                return false
            }
        }

        // 突变意义 All/No synonymous SNV/还有没列举完
        /*
            原始表格第17列，把这列信息提取排序去重后，做成下拉菜单选择（如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）支持模糊搜索
          */
        param = searchParams.mutationMeaning
        if (param && param.length > 0) {
            const realParam = param.map((t) => (t === '●' ? '.' : t))
            if (!realParam.includes(line.col13)) {
                return false
            }
        }

        // 突变危险 All/No synonymous SNV/还有没列举完
        /*
            原始表格第21列，把这列信息提取排序去重后，做成下拉菜单选择（如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）支持模糊搜索
          */
        param = searchParams.mutationRisk
        if (param && param.length > 0) {
            const realParam = param.map((t) => (t === '●' ? '.' : t))
            if (!realParam.includes(line.col21)) {
                return false
            }
        }

        // 人群频率
        /*
            原始表格第26、31、39列，大于0的小数， 26、31、39列如果有两列满足筛选要求，即可展示，注意，这三列中如果有点的，则该列满足条件（即可认为其等于0）
            2023.03.20说明：
              一共是三个数据库，看每一个突变位点这三个数据库的人群频率，就是如果是点的话，认为这个突变位点的这个数据库满足过滤条件
              （点是因为这个突变位点在这个数据库里没有记录，所以是未知的，默认是满足筛选条件的）
              就是如果ABC三个数据库都没有点的情况下，按照筛选数值筛选来
              如果A数据库里面有点，BC不是点，那A直接默认小于筛选值，BC按照与筛选值比较，可以认为 这三个数据库里的点=0
          */
        param = searchParams.humanRatio
        if (param) {
            const ltRatio = (colVal) => colVal === '.' || Number(colVal) < param
            const ltCount = [line.col26, line.col31, line.col39].map(v => ltRatio(v)).filter(v => v).length
            if (ltCount < 2) {
                return false
            }
        }

        // SIFT_pred
        /*
            原始表格第56列，这列只包含3个选项：T、D、点
          */
        param = searchParams.sift
        if (param && param.length > 0) {
            if (!param.includes(line.col56)) {
                return false
            }
        }

        // 要去关联匹配, germline 和 somatic 的 match 使用的列不一样
        // 读取
        param = searchParams.drug
        if (param) {
            let relDrug = false
            let match = `${line.col1}:${line.col2}-${line.col3}_${line.col4}>${line.col5}_${line.col11}`
            for (const iterator of drugRows.value) {
                if (iterator[0] === match) {
                    relDrug = true
                    break
                }
            }
            if (!relDrug) {
                return false
            }
        }

        return true
    })
}
const search = () => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    searchFilterRows(searchParams.value)
    selectedRows.value = []
    // filterChange()
    if (showSticky.value && filteredRows.value.length > 0 && filteredRows.value.length != rows.value.length) {
        infoMessage(`${filteredRows.value.length} 条筛选结果将提交定制报告, 或自定义选择筛选结果`)
    }
}

watch(rows, (rows) => {
    loadTable()
})

onMounted(() => {
    loadTable()
})

const propSearchParams = toRef(props, 'searchParams')

// 加载表格数据
const loadTable = () => {
    columns.value.forEach((col) => (col.title = header.value[col.i - 1]))

    const visibleColIdx = columns.value.map((t) => t.i)

    searchParams.value = propSearchParams.value
    searchFilterRows(propSearchParams.value)
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

    // filterChange()
}
const selectedRows = ref([])

const onSelectChange = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage('请先取消过滤')
        return false
    }
    selectedRows.value = selectedRowKeys
    // filterChange()
}
const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: record.lineNumber,
    }
}

onUnmounted(() => {
    filterChange()
})
const getChangedData = () => {
    let filtered = true
    if (filteredRows.value.length === rows.value.length) {
        filtered = false
    }
    let selected = true
    if (selectedRows.value.length === 0) {
        selected = false
    }
    return {
        searchParams: searchParams.value,
        selectedRows: selectedRows.value,
        filtered: filtered,
        selected: selected,
    }
}
const filterChange = () => {
    emit('filterChange', getChangedData())
}
defineExpose({ getChangedData, })
</script>

<style lang="scss" scoped>
/*//点击行的样式*/
.clickRowStyl {
    background-color: #bbbbff !important;
    font-size: 20px;
}

/*//偶数行的样式*/
.evenRowStyl {
    background-color: #aad4fd46 !important;
}

.ant-table-tbody>tr:hover:not(.ant-table-expanded-row)>td {
    background: #bbbbff;
}

/*//鼠标移入样式*/
.ant-table-tbody>tr:hover>td {
    background: #bbbbff !important;
}

.ant-table-selection-column #select-info {
    position: absolute;
    top: 5px;
    right: -55px;
    width: 150px;
    display: none;
    z-index: 99999;
}

.ant-table-selection-column:hover #select-info {
    display: block;
}
</style>

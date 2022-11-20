<template>
    <div>
        <div class="row justify-between">
            <div class="col-2 column q-pr-sm">
                <div class="col">
                    <q-input
                        v-model="searchParams.gene"
                        label="基因"
                        clearable
                        dense
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.depth"
                        label="深度 >"
                        clearable
                        dense
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.ratio"
                        label="肿瘤频率 >"
                        clearable
                        dense
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>

                <div class="col">
                    <q-select
                        v-model="searchParams.mutationType"
                        clearable
                        dense
                        hide-dropdown-icon
                        :options="options.mutationType"
                        label="突变类型"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-select
                        v-model="searchParams.mutationPosition"
                        clearable
                        multiple
                        dense
                        hide-dropdown-icon
                        :options="options.mutationPosition"
                        label="突变位置"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-select
                        clearable
                        dense
                        hide-dropdown-icon
                        v-model="searchParams.mutationMeaning"
                        stack-label
                        label-color="primary"
                        :options="options.mutationMeaning"
                        label="突变意义"
                    />
                </div>
                <div class="col">
                    <q-select
                        clearable
                        dense
                        hide-dropdown-icon
                        v-model="searchParams.mutationRisk"
                        stack-label
                        label-color="primary"
                        :options="options.mutationRisk"
                        label="突变危险"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.humanRatio"
                        label="人群频率 <"
                        clearable
                        dense
                        hide-dropdown-icon
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-select
                        clearable
                        dense
                        hide-dropdown-icon
                        v-model="searchParams.sift"
                        stack-label
                        label-color="primary"
                        :options="['T', 'D', '.']"
                        label="SIFT_pred"
                    />
                </div>
                <div class="col text-primary text-bold">
                    {{`结果： ${filteredRows.length}条`}}
                </div>
                <div class="q-gutter-md text-center q-py-sm">
                    <q-btn color="primary" label="确定" icon="search" @click="search" />
                    <q-btn color="primary" label="重置" icon="settings_backup_restore" @click="reset" />
                </div>
            </div>

            <div class="col-10">
                <a-table
                    size="small"
                    bordered
                    :loading="loading"
                    :data-source="filteredRows"
                    :columns="columns"
                    :scroll="{ x: 2000, y: 600 }"
                    :custom-row="customRow"
                    :sticky="true"
                >
<!--                    <template #bodyCell="{ column, record }">-->
<!--                        <q-btn-->
<!--                            v-if="column.key === 'operation'"-->
<!--                            label="查看"-->
<!--                            color="primary"-->
<!--                            outline flat-->
<!--                            size="xs"-->
<!--                            @click="clickView(record)"-->
<!--                        >-->
<!--                        </q-btn>-->
<!--                    </template>-->
                </a-table>
            </div>
        </div>
    </div>

    <div class="q-my-xs" v-if="!showColumn">
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
                <MutationInfo :row="currentRow"></MutationInfo>
            </q-card-section>
            <q-card-actions align="center" vertical>
                <q-btn label="关 闭" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import {ref, onMounted} from "vue";
import BarChartVue from "./SomaticInfoCharts/BarChart.vue"
import PieChartVue from "./SomaticInfoCharts/PieChart.vue"
import RoseChartVue from "./SomaticInfoCharts/RoseChart.vue"
import BubbleChartVue from "./SomaticInfoCharts/BubbleChart.vue"
import RadarChartVue from "./SomaticColumnCharts/RadarChart.vue"
import MutationInfo from './MutationInfo'
import {readTaskFile} from "src/api/task";
import {getCsvHeader, getCsvData} from "src/utils/csv";
import {useRoute} from 'vue-router'

const route = useRoute()

const dialogVisible = ref(false)
const searchParams = ref({
    gene: null,
    depth: null,
    ratio: null,
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    mutationRisk: null,
    humanRatio: null,
    sift: null
})

const options = ref({
    mutationType: ["All", "SNP", "INDEL"],
    mutationPosition: [],
    mutationMeaning: [],
    mutationRisk: [],

})

const loading = ref(false)
const rows = ref([])
const filteredRows = ref([])

const customCell = (record, rowIndex, column) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            // 字体颜色
            // 'color': record.id === physicalSurveyCurrRowId.value ? 'orange' : 'rgba(0, 0, 0, 0.65)',
            // 行背景色
            'background-color': record.id === currentRow.value.id  ? '#64b5f6' : 'white',
            // 'color': record.id === currentRow.value.id  ? 'white' : 'black',
            // 'border-color': record.id === currentRow.value.id ? 'red' : 'grey',
            // 'border-style': 'solid',
            // // 下划线
            // 'text-decoration': 'underline',
            // // 字体样式-斜体
            // 'font-style': 'italic',
            // // 字体样式-斜体
            'font-weight': record.id === currentRow.value.id  ? 'bolder' : 'normal',
            'cursor':'pointer'
        },
        // 鼠标单击行
        onClick: event => {
            // 记录当前点击的行标识
            currentRow.value = record
            clickRow(record)
            // if (currentRow.value.id === record.id) {
            //     currentRow.value = {}
            // } else {
            //     currentRow.value = record
            // }
        }
    }
}
const currentRow = ref({})
const columns = ref([
    {i: 1, title: '', dataIndex: 'col1', align: 'center', width: 60, fixed: 'left'},   // Chr
    {i: 2, title: '', dataIndex: 'col2', align: 'center', width: 85, fixed: 'left'},    // Start
    {i: 3, title: '', dataIndex: 'col3', align: 'center', width: 85},                   // End
    {i: 4, title: '', dataIndex: 'col4', align: 'center', width: 70},   // Ref
    {i: 5, title: '', dataIndex: 'col5', align: 'center', width: 70},   // Alt
    {i: 6, title: '', dataIndex: 'col6', align: 'center', width: 90},   // Geno_Type
    {i: 7, title: '', dataIndex: 'col7', align: 'center', width: 105},  // Allelic_depths
    {i: 8, title: '', dataIndex: 'col8', align: 'center', width: 90},   // Seq_depths
    {i: 9, title: '', dataIndex: 'col9', align: 'center', width: 110},  // Mutation_Rate
    {i: 10, title: '', dataIndex: 'col10', align: 'center', width: 105},// Func.refGene
    {i: 11, title: '', dataIndex: 'col11', align: 'center', width: 105},// Gene.refGene

    {i: 13, title: '', dataIndex: 'col13', align: 'center', width: 160},                // ExoniFunc.refGene
    {i: 14, title: '', dataIndex: 'col14', align: 'left', width: 140},                  // exon
    {i: 15, title: '', dataIndex: 'col15', align: 'left', width: 160, ellipsis: true},  // NUChange
    {i: 16, title: '', dataIndex: 'col16', align: 'left', width: 160, ellipsis: true},  // AAChange

    {i: 18, title: '', dataIndex: 'col18', align: 'left', width: 200, ellipsis: true},  // CLNDN
    {i: 19, title: '', dataIndex: 'col19', align: 'left', width: 400, ellipsis: true},  // CLNDISDB
    {i: 20, title: '', dataIndex: 'col20', align: 'left', width: 280},                  // CLNREVSTAT
    {i: 21, title: '', dataIndex: 'col21', align: 'left', width: 280},
    {i: 22, title: '', dataIndex: 'col22', align: 'center', width: 100},    // cosmic70
    {i: 23, title: '', dataIndex: 'col23', align: 'center', width: 95},     // ExAC_ALL
    {i: 24, title: '', dataIndex: 'col24', align: 'center', width: 100},    // ExAC_AFR
    {i: 25, title: '', dataIndex: 'col25', align: 'center', width: 100},    // ExAC_AMR
    {i: 26, title: '', dataIndex: 'col26', align: 'center', width: 100},    // ExAC_EAS

    {i: 31, title: '', dataIndex: 'col31', align: 'center', width: 100},
    {i: 32, title: '', dataIndex: 'col32', align: 'center', width: 100},

    {i: 34, title: '', dataIndex: 'col34', align: 'center', width: 100},// avsnp150
    {i: 35, title: '', dataIndex: 'col35', align: 'center', width: 100},

    {i: 39, title: '', dataIndex: 'col39', align: 'center', width: 100},

    {i: 56, title: '', dataIndex: 'col56', align: 'center', width: 100},

    {i: 144, title: '', dataIndex: 'col144', align: 'center', width: 100},

    // {i: 0, key: 'operation', title: '操作', dataIndex: 'operation', align: 'center', fixed: 'right', width: 75},
])

columns.value.forEach(c => c.customCell = customCell)

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
        sift: null
    }
    search()
}

const clickRow = (row) => {
    dialogVisible.value = true
}

const search = () => {
    filteredRows.value = rows.value.filter((line, i) => {
        // 搜索基因
        // 原始表格11列，支持模糊搜索
        let param = searchParams.value.gene
        if (param && param.length > 0) {
            return line.col11.includes(param)
        }

        // 深度
        // 原始表格8列，大于0的正整数，
        param = searchParams.value.depth
        if (param && !(Number(line.col8) > param)) {
            return false
        }

        // 频率
        // 原始表格，大于0的小数
        param = searchParams.value.ratio
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
        param = searchParams.value.mutationType
        if (param && param.length > 0 && param !== 'All') {
            const Snp = ['A', 'T', 'C', 'G']
            let isSnp = Snp.includes(line.col4) && Snp.includes(line.col5)
            if (!(param === 'SNP' ? isSnp : !isSnp)) {
                return false
            }
        }

        // 突变位置 All/Exonic / Intronic/ Intergenic /还有没列举完
        /*
        原始表格第14列，把这列信息提取排序去重后，再加上一个【exonic,splicing】选项，做成下拉菜单选择
        （如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）
         */
        param = searchParams.value.mutationPosition
        if (param && param.length > 0) {
            const positions = line.col10.split(';')
            if (!(positions.some(position => param.includes(position)))) {
                return false
            }
        }

        // 突变意义 All/No synonymous SNV/还有没列举完
        /*
        原始表格第17列，把这列信息提取排序去重后，做成下拉菜单选择（如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）支持模糊搜索
         */
        param = searchParams.value.mutationMeaning
        if (param && param.length > 0 && param !== 'All') {
            if (line.col13 === 'synonymous SNV') {
                return false
            }
        }

        // 突变危险 All/No synonymous SNV/还有没列举完
        /*
        原始表格第21列，把这列信息提取排序去重后，做成下拉菜单选择（如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）支持模糊搜索
         */
        param = searchParams.value.mutationRisk
        if (param && param.length > 0 && param !== 'All') {
            if (!param.includes(line.col21)) {
                return false
            }
        }

        // 人群频率
        /*
        原始表格第26、31、39列，大于0的小数， 26、31、39列如果有两列满足筛选要求，即可展示，注意，这三列中如果有点的，不管什么筛选，都展示
         */
        param = searchParams.value.humanRatio
        if (param) {
            if (line.col26 !== '.' && line.col31 !== '.'  || line.col39 !== '.' ) {
                let count = Number(line.col26) < param ? 1 : 0
                count += (Number(line.col31) < param ? 1 : 0)
                count += (Number(line.col39) < param ? 1 : 0)
                if (count < 2) {
                    return false
                }
            }
        }

        // SIFT_pred
        /*
        原始表格第56列，这列只包含3个选项：T、D、点
         */
        param = searchParams.value.sift
        if (param && param.length > 0) {
            if (param !== line.col56) {
                return false
            }
        }

        return true
    })


    console.log('========= search result', filteredRows.value.length, filteredRows.value)
}
const refreshPage = () => {
    dialogVisible.value = false
}

onMounted(() => {
    loading.value = true
    readTaskFile(route.params.id, 'Mut_germline/QT11.combined.standard-new.csv').then(res => {
        const headNames = getCsvHeader(res, ',')
        columns.value.forEach(col => col.title = headNames[col.i-1])

        const visibleColIdx = columns.value.map(t => t.i)
        const colKeys = _.range(1, 150, 1).map(i => 'col' + i)
        const csvRows = getCsvData(res, {splitter: ',', hasHeaderLine: true, fields: colKeys})
        csvRows.forEach((row, i) => row.id = i)
        rows.value = csvRows
        filteredRows.value = csvRows


        // 提取options
        let positions = new Set()
        let meanings = new Set()
        let risks = new Set()
        for (let columns of csvRows) {
            const items = columns.col10.split(';')
            items.forEach(item => positions.add(item))

            if (columns.col13 !== '.') {
                meanings.add(columns.col13)
            }

            risks.add(columns.col21)
        }
        options.value.mutationPosition = Array.from(positions)
        options.value.mutationMeaning = Array.from(meanings)
        options.value.mutationRisk = Array.from(risks)
    }).finally(() => loading.value = false)
})
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
    background: #bbbbff !important
}
</style>

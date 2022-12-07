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
                        v-model="searchParams.tumorDepth"
                        label="肿瘤深度 >"
                        clearable
                        dense
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.compareDepth"
                        label="对照深度 >"
                        clearable
                        dense
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.tumorRatio"
                        label="肿瘤频率 >"
                        clearable
                        dense
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.compareRatio"
                        label="对照频率 >"
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
                        multiple
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
                        multiple
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
                <div class="col text-primary text-bold">{{`结果： ${filteredRows.length}条`}}</div>
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
                <RoseChartVue :data="filteredRows" col-key="col17" title="突变意义统计" />
            </div>
            <div class="col q-px-xs">
                <RoseChartVue :data="filteredRows" col-key="col25" title="突变危险统计" />
            </div>
        </div>
        <div class="row">
            <div class="col-4 q-px-xs">
                <BarChartVue :data="filteredRows" />
            </div>

            <div class="col-8 q-px-xs">
                <BubbleChartVue :data="filteredRows" :colKeys="['col30', 'col35', 'col43']" />
            </div>
        </div>
    </div>
    <q-dialog v-model="dialogVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <MutationInfo
                    :row="currentRow"
                    :isGermline="false"
                    :task="props.task"
                    :samples="props.samples"
                ></MutationInfo>
            </q-card-section>
            <q-space></q-space>
            <q-card-actions align="center" vertical>
                <q-btn label="关 闭" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BarChartVue from './SomaticInfoCharts/BarChart.vue'
import PieChartVue from './SomaticInfoCharts/PieChart.vue'
import RoseChartVue from './SomaticInfoCharts/RoseChart.vue'
import BubbleChartVue from './SomaticInfoCharts/BubbleChart.vue'
import RadarChartVue from './SomaticColumnCharts/RadarChart.vue'
import MutationInfo from './MutationInfo'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData } from 'src/utils/csv'
import { useRoute } from 'vue-router'

const route = useRoute()

const dialogVisible = ref(false)
const searchParams = ref({
    gene: null,
    tumorDepth: null,
    compareDepth: null,
    tumorRatio: null,
    compareRatio: null,
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    mutationRisk: null,
    humanRatio: null,
    sift: null,
})

const options = ref({
    mutationType: ['All', 'SNP', 'INDEL'],
    mutationPosition: [],
    mutationMeaning: [],
    mutationRisk: [],
})

const loading = ref(false)
const rows = ref([])
const filteredRows = ref([])

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
    task: {
        type: Object,
        required: false,
    },
})

const headers = ref([])

const tumorColumnIdx = computed(() => {
    // 根据列表头名称，例如Geno_Type(QN11), 检查该列是对比样本列表还是肿瘤样本列
    const tumorIdx = []
    headers.value.forEach((header, i) => {
        for (let k in props.samples.value) {
            if (header.includes(`(${k})`) && samples.value[k]) {
                tumorIdx.push(i)
                break
            }
        }
    })
    return tumorIdx
})

const customCell = (record, rowIndex, column) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            // 字体颜色
            // 'color': record.id === physicalSurveyCurrRowId.value ? 'orange' : 'rgba(0, 0, 0, 0.65)',
            // 行背景色
            'background-color': record.id === currentRow.value.id ? '#64b5f6' : 'white',
            // 'border-color': record.id === currentRow.value.id ? 'red' : 'grey',
            // 'border-style': 'solid',
            // // 下划线
            // 'text-decoration': 'underline',
            // // 字体样式-斜体
            // 'font-style': 'italic',
            // // 字体样式-斜体
            'font-weight': record.id === currentRow.value.id ? 'bolder' : 'normal',
            cursor: 'pointer',
        },
        // 鼠标单击行
        onClick: (event) => {
            // 记录当前点击的行标识
            currentRow.value = record
            clickRow(record)
            // if (currentRow.value.id === record.id) {
            //     currentRow.value = {}
            // } else {
            //     currentRow.value = record
            // }
        },
    }
}
const currentRow = ref({})
const columns = ref([
    { i: 1, title: '', dataIndex: 'col1', align: 'center', width: 60, fixed: 'left' }, // Chr
    { i: 2, title: '', dataIndex: 'col2', align: 'center', width: 85, fixed: 'left' }, // Start
    { i: 3, title: '', dataIndex: 'col3', align: 'center', width: 85 }, // End
    { i: 4, title: '', dataIndex: 'col4', align: 'center', width: 70 }, // Ref
    { i: 5, title: '', dataIndex: 'col5', align: 'center', width: 70 }, // Alt
    { i: 6, title: '', dataIndex: 'col6', align: 'center', width: 90 }, // Geno_Type
    { i: 7, title: '', dataIndex: 'col7', align: 'center', width: 110 }, // Allelic_depths
    { i: 8, title: '', dataIndex: 'col8', align: 'center', width: 95 }, // Seq_depths
    { i: 9, title: '', dataIndex: 'col9', align: 'center', width: 115 }, // Mutation_Rate
    { i: 10, title: '', dataIndex: 'col10', align: 'center', width: 90 }, // Geno_Type
    { i: 11, title: '', dataIndex: 'col11', align: 'center', width: 110 }, // Allelic_Depths
    { i: 12, title: '', dataIndex: 'col12', align: 'center', width: 95 }, // Seq_Depths
    { i: 13, title: '', dataIndex: 'col13', align: 'center', width: 160 }, // Mutation_Rate
    { i: 14, title: '', dataIndex: 'col14', align: 'center', width: 110 }, // Func.refGene
    { i: 15, title: '', dataIndex: 'col15', align: 'center', width: 110 }, // Gene.refGene

    { i: 17, title: '', dataIndex: 'col17', align: 'center', width: 160 }, // ExonicFunc.refGene
    { i: 18, title: '', dataIndex: 'col18', align: 'center', width: 90 }, // exon
    { i: 19, title: '', dataIndex: 'col19', align: 'center', width: 100 }, // NUChange
    { i: 20, title: '', dataIndex: 'col20', align: 'center', width: 100 }, // AAChange

    { i: 22, title: '', dataIndex: 'col22', align: 'left', width: 200 , ellipsis: true}, // CLNDN
    { i: 23, title: '', dataIndex: 'col23', align: 'left', width: 200, ellipsis: true }, // CLNDISDB
    { i: 24, title: '', dataIndex: 'col24', align: 'left', width: 160 }, // CLNREVSTAT
    { i: 25, title: '', dataIndex: 'col25', align: 'center', width: 120 }, // CLNSIG
    { i: 26, title: '', dataIndex: 'col26', align: 'center', width: 200, ellipsis: true}, // cosmic70
    { i: 27, title: '', dataIndex: 'col27', align: 'center', width: 100 }, // ExAC_ALL

    { i: 30, title: '', dataIndex: 'col30', align: 'center', width: 100 },

    { i: 35, title: '', dataIndex: 'col35', align: 'center', width: 100 },
    { i: 36, title: '', dataIndex: 'col36', align: 'center', width: 100 },

    { i: 38, title: '', dataIndex: 'col38', align: 'center', width: 100 },
    { i: 39, title: '', dataIndex: 'col39', align: 'center', width: 100 },

    { i: 43, title: '', dataIndex: 'col43', align: 'center', width: 100 },

    { i: 60, title: '', dataIndex: 'col60', align: 'center', width: 100 },

    { i: 148, title: '', dataIndex: 'col148', align: 'center', width: 100 },
])

columns.value.forEach((c) => (c.customCell = customCell))

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
    }
    search()
}

const clickRow = (row) => {
    dialogVisible.value = true
}

const search = () => {
    filteredRows.value = rows.value.filter((line, i) => {
        // 搜索基因
        // 原始表格15列，支持模糊搜索
        let param = searchParams.value.gene
        if (param && param.length > 0) {
            if (!line.col15.includes(param)) {
                return false
            }
        }

        // 肿瘤深度
        // 原始表格8、12列，大于0的正整数，
        param = searchParams.value.tumorDepth
        if (param) {
            const v = tumorColumnIdx.value.includes(i) ? line.col8 : line.col12
            if (!(Number(v) > param)) {
                return false
            }
        }

        // 对比深度
        // 原始表格8、12列，大于0的正整数，
        param = searchParams.value.compareDepth
        if (param) {
            const v = tumorColumnIdx.value.includes(i) ? line.col12 : line.col8
            if (!(Number(v) > param)) {
                return false
            }
        }

        // 肿瘤频率
        // 原始表格9、13列，大于0的小数
        param = searchParams.value.ratio
        if (param) {
            const v = tumorColumnIdx.value.includes(i) ? line.col9 : line.col13
            if (!(Number(v) > param)) {
                return false
            }
        }

        // 对比频率
        // 原始表格9、13列，大于0的小数
        param = searchParams.value.ratio
        if (param) {
            const v = tumorColumnIdx.value.includes(i) ? line.col13 : line.col9
            if (!(Number(v) > param)) {
                return false
            }
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
            const positions = line.col14.split(';')
            if (!positions.some((position) => param.includes(position))) {
                return false
            }
        }

        // 突变意义 All/No synonymous SNV/还有没列举完
        /*
        原始表格第17列，把这列信息提取排序去重后，做成下拉菜单选择（如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）支持模糊搜索
        下拉选择：All/Missense/Frameshift/Stopgain/Stoploss/还有没列举完
         */
        param = searchParams.value.mutationMeaning
        if (param && param.length > 0 && param !== 'All') {
            if (!param.includes(line)) {
                return false
            }
        }

        // 突变危险
        /*
        下拉选择：All/ Benign/ not_provided/还有没列举完
        原始表格第25列，把这列信息提取排序去重后，做成下拉菜单选择（如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）支持模糊搜索
         */
        param = searchParams.value.mutationRisk
        if (param && param.length > 0 && param !== 'All') {
            if (!param.includes(line.col25)) {
                return false
            }
        }

        // 人群频率
        /*
        原始表格第30、35、43列，大于0的小数， 30、35、43列如果有两列满足筛选要求，即可展示，注意，这三列中如果有点的，不管什么筛选，都展示
         */
        param = searchParams.value.humanRatio
        if (param) {
            if ((line.col30 !== '.' && line.col35 !== '.') || line.col43 !== '.') {
                let count = Number(line.col30) < param ? 1 : 0
                count += Number(line.col35) < param ? 1 : 0
                count += Number(line.col43) < param ? 1 : 0
                if (count < 2) {
                    return false
                }
            }
        }

        // SIFT_pred
        /*
        原始表格第60列，这列只包含3个选项：T、D、点
         */
        param = searchParams.value.sift
        if (param && param.length > 0) {
            if (param !== line.col60) {
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
    init()
})

const init = () => {
    loading.value = true
    readTaskMuFile(route.params.id, 'Mut_somatic')
        .then((res) => {
            const headNames = getCsvHeader(res, ',')
            headers.value = headNames
            console.log('headers',headers.value)
            columns.value.forEach((col) => (col.title = headNames[col.i - 1]))

            const visibleColIdx = columns.value.map((t) => t.i)
            const colKeys = _.range(1, 155, 1).map((i) => 'col' + i)
            const csvRows = getCsvData(res, { splitter: ',', hasHeaderLine: true, fields: colKeys })
            csvRows.forEach((row, i) => (row.id = i))
            rows.value = csvRows
            filteredRows.value = csvRows

            // 提取options
            let positions = new Set()
            let meanings = new Set()
            let risks = new Set()
            for (let columns of csvRows) {
                const items = columns.col14.split(';')
                items.forEach((item) => positions.add(item))

                if (columns.col13 !== '.') {
                    meanings.add(columns.col17)
                }

                risks.add(columns.col25)
            }
            options.value.mutationPosition = Array.from(positions)
            options.value.mutationMeaning = Array.from(meanings)
            options.value.mutationRisk = Array.from(risks)
        })
        .finally(() => (loading.value = false))
}
</script>

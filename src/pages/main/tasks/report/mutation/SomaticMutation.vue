<template>
    <div>
        <q-splitter v-model="splitterModel" unit="px" style="height: 780px">
            <template v-slot:before>
                <div class="column" style="width:90%">
                    <q-input
                        v-model="innerSearchParams.gene"
                        :label="$t('Gene')"
                        clearable
                        stack-label
                        label-color="primary"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    />
                    <q-input
                        v-model="innerSearchParams.tumorDepth"
                        :label="$t('TumorDepth') + ' ' + innerSearchParams.tumorDepthCmp"
                        clearable
                        type="number"
                        stack-label
                        label-color="primary"
                        class="col-6"
                        :disable="showSticky && stickDone"
                    >
                        <template v-slot:after>
                            <Cmp v-model="innerSearchParams.tumorDepthCmp" />
                        </template>
                    </q-input>
                    <q-input
                        v-model="innerSearchParams.compareDepth"
                        :label="$t('ControlDepth') + innerSearchParams.compareDepthCmp"
                        clearable
                        type="number"
                        stack-label
                        label-color="black"
                        class="col-6"
                        :disable="showSticky && stickDone"
                    >
                        <template v-slot:after>
                            <Cmp v-model="innerSearchParams.compareDepthCmp" />
                        </template>
                    </q-input>
                    <q-input
                        v-model="innerSearchParams.tumorRatio"
                        :label="$t('TumorFrequency') + ' ' + innerSearchParams.tumorRatioCmp"
                        clearable
                        type="number"
                        stack-label
                        label-color="primary"
                        class="col-6"
                        :disable="showSticky && stickDone"
                    >
                        <template v-slot:after>
                            <Cmp v-model="innerSearchParams.tumorRatioCmp" />
                        </template>
                    </q-input>
                    <q-input
                        v-model="innerSearchParams.compareRatio"
                        :label="$t('ControlFrequency') + ' ' + innerSearchParams.compareRatioCmp"
                        clearable
                        type="number"
                        stack-label
                        label-color="black"
                        class="col-6"
                        :disable="showSticky && stickDone"
                    >
                        <template v-slot:after>
                            <Cmp v-model="innerSearchParams.compareRatioCmp" />
                        </template>
                    </q-input>

                    <q-select
                        v-model="innerSearchParams.mutationType"
                        clearable
                        multiple
                        hide-dropdown-icon
                        :options="props.options.mutationType"
                        :label="$t('MutationType')"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    />

                    <q-select
                        v-model="innerSearchParams.mutationPosition"
                        clearable
                        multiple
                        hide-dropdown-icon
                        :options="props.options.mutationPosition"
                        :label="$t('MutationPosition')"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    />
                    <q-select
                        clearable
                        hide-dropdown-icon
                        v-model="innerSearchParams.mutationMeaning"
                        stack-label
                        multiple
                        label-color="primary"
                        :options="props.options.mutationMeaning"
                        :label="$t('MutationMeaning')"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    />
                    <q-select
                        clearable
                        hide-dropdown-icon
                        v-model="innerSearchParams.mutationRisk"
                        stack-label
                        multiple
                        label-color="primary"
                        :options="props.options.mutationRisk"
                        :label="$t('MutationRisk')"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    />
                    <q-select
                        hide-dropdown-icon
                        v-model="innerSearchParams.human"
                        stack-label
                        label-color="primary"
                        :options="['ALL', 'African', 'American', 'East Asian', 'European', 'South Asian']"
                        :label="$t('Population')"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    />
                    <q-input
                        v-model="innerSearchParams.humanRatio"
                        :label="$t('CrowdFrequency') + ' ' + innerSearchParams.humanRatioCmp"
                        clearable
                        hide-dropdown-icon
                        type="number"
                        stack-label
                        label-color="primary"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    >
                        <template v-slot:after>
                            <Cmp v-model="innerSearchParams.humanRatioCmp" />
                        </template>
                    </q-input>
                    <q-select
                        clearable
                        multiple
                        hide-dropdown-icon
                        v-model="innerSearchParams.sift"
                        stack-label
                        label-color="primary"
                        :options="['T', 'D', '.']"
                        label="SIFT_pred"
                        class="full-width"
                        :disable="showSticky && stickDone"
                    />
                    <div class="row items-center">
                        <q-checkbox
                            left-label
                            v-model="innerSearchParams.drug"
                            :label="$t('RelatedToDrugs')"
                            color="primary"
                            :disable="showSticky && stickDone"
                        />
                        <div class="text-primary text-bold">{{ $t('Result') + `： ${filteredRows.length}` }}</div>
                    </div>

                    <div class="q-gutter-xs text-center justify-between">
                        <q-btn
                            color="primary"
                            :label="$t('Confirm')"
                            icon="search"
                            padding="sm"
                            @click="search"
                            :disable="showSticky && stickDone"
                        />
                        <q-btn
                            color="primary"
                            :label="$t('Reset')"
                            icon="settings_backup_restore"
                            @click="reset"
                            padding="sm"
                            :disable="showSticky && stickDone"
                        />
                        <q-btn
                            color="primary"
                            :label="$t('MoreColumns')"
                            size="md"
                            padding="sm"
                            icon="last_page"
                            @click="showDrawer = !showDrawer"
                            :disable="showSticky && stickDone"
                        />
                        <q-btn
                            :href="tableFile"
                            :download="tableFileName"
                            padding="sm"
                            :label="$t('Download')"
                            icon="south"
                            color="primary"
                            target="_blank"
                            size="md"
                        />
                    </div>
                </div>
            </template>
            <template v-slot:after>
                <!-- <a-table
                     size="small"
                     bordered
                     :loading="loading"
                     :data-source="filteredRows"
                     :columns="columns"
                     :scroll="{ x: 2000, y: 600 }"
                     :custom-row="customRow"
                     :sticky="true"
                     rowKey="lineNumber"
                     :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange }"
                     >
                     <template #bodyCell="{ column, record }">
                     <a-tooltip
                     v-if="column.ellipsis"
                     color="#3b4146"
                     :title="record[column.dataIndex]"
                     >
                     <div>{{record[column.dataIndex]}}</div>
                     </a-tooltip>
                     <span v-else>{{record[column.dataIndex]}}</span>
                     </template>
                     </a-table> -->
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
                        size="small"
                        bordered
                        :loading="loading"
                        :data-source="filteredRows"
                        :columns="columns"
                        :scroll="{ x: 2000, y: 600 }"
                        :custom-row="customRow"
                        :sticky="true"
                        rowKey="lineNumber"
                        :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange, getCheckboxProps: getCheckboxProps }"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'operation'">
                                <q-btn
                                    :label="$t('Detail')"
                                    color="primary"
                                    size="xs"
                                    padding="xs"
                                    class="q-mr-xs"
                                    @click="clickDetail(record)"
                                />
                                <q-btn label="IGV" color="primary" size="xs" padding="xs" @click="clickIgv(record)" />
                            </template>
                            <template v-else>
                                <a-tooltip v-if="column.ellipsis" color="#3b4146" :title="record[column.dataIndex]">
                                    <div>{{ record[column.dataIndex] }}</div>
                                </a-tooltip>
                                <span v-else>{{ record[column.dataIndex] }}</span>
                            </template>
                        </template>
                    </a-table>
                </div>
            </template>
        </q-splitter>
        <q-dialog v-model="showDrawer" class="fit">
            <q-card style="width: 50%">
                <q-card-section>
                    <div class="q-col">
                        <div class="text-h6 q-mb-sm">{{$t('MoreColumns')}}</div>
                        <div class="q-row-2">
                            <q-separator />
                            <q-scroll-area style="height: 500px">
                                <q-option-group
                                    :options="expandedColumns"
                                    type="checkbox"
                                    v-model="selectedExpandColIdx"
                                    @change="atOptionGroupChange"
                                    @update:model-value="atOptionGroupChange"
                                />
                            </q-scroll-area>
                            <q-separator />
                        </div>
                    </div>
                </q-card-section>

                <q-card-actions align="center">
                    <q-btn color="primary" @click="clickSelectAll">{{$t('SelectAll')}}</q-btn>
                    <q-btn color="primary" @click="clickSelectNone">{{$t('Clear')}}</q-btn>
                    <q-btn color="primary" v-close-popup>{{$t('Confirm')}}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-separator class="q-my-lg" size="2px" color="primary" />
    </div>

    <div class="q-my-sm" v-if="!showColumn">
        <div class="row q-mb-sm">
            <div class="col q-px-xs">
                <PieChartVue :data="filteredRows" :titleKey="chartTitles.type" />
            </div>
            <div class="col q-px-xs">
                <RoseChartVue :data="filteredRows" col-key="col17" :titleKey="chartTitles.meaning" />
            </div>
            <div class="col q-px-xs">
                <RoseChartVue :data="filteredRows" col-key="col25" :titleKey="chartTitles.risk" />
            </div>
        </div>
        <div class="row">
            <div class="col-4 q-px-xs">
                <BarChartVue :data="filteredRows" :titleKey="chartTitles.snp" />
            </div>

            <div class="col-8 q-px-xs">
                <BubbleChartVue
                    :data="filteredRows"
                    :titleKey="chartTitles.crowd"
                    :colKeys="bubbleColKeys"
                    :serialTitles="serialTitles"
                />
            </div>
        </div>
    </div>
    <q-dialog v-model="dialogVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <MutationInfo :row="currentRow" :isGermline="false" :task="props.task" :samples="props.samples" :headers="props.header">
                </MutationInfo>
            </q-card-section>
            <q-space></q-space>
            <q-card-actions align="center" vertical>
                <q-btn :label="$t('Close')" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="igvVisible">
        <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
            <Igv :taskId="props.task.id" :file="igvFile" />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { errorMessage, infoMessage } from 'src/utils/notify'
import { ref, onMounted, computed, toRef, toRefs, watch, onUnmounted, defineExpose } from 'vue'
import BarChartVue from './SomaticInfoCharts/BarChart.vue'
import PieChartVue from './SomaticInfoCharts/PieChart.vue'
import RoseChartVue from './SomaticInfoCharts/RoseChart.vue'
import BubbleChartVue from './SomaticInfoCharts/BubbleChart.vue'
import RadarChartVue from './SomaticColumnCharts/RadarChart.vue'
import MutationInfo from './MutationInfo'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData } from 'src/utils/csv'
import { useRoute } from 'vue-router'
import { filterOption } from 'ant-design-vue/lib/vc-mentions/src/util'
import Igv from './Igv'
import Cmp from './Comparator'
import { getDualIdentifiers } from "src/utils/samples"
import { useComparator } from 'src/utils/comparator'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const splitterModel = ref(250)
const emit = defineEmits(['stickDone', 'searchParamsChange', 'rowsLoaded'])
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
                tumorDepth: null,
                compareDepth: null,
                tumorRatio: null,
                compareRatio: null,
                mutationType: null,
                mutationPosition: [],
                mutationMeaning: null,
                mutationRisk: null,
                human: 'ALL',
                humanRatio: null,
                sift: null,
                drug: true,
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

const dialogVisible = ref(false)
const innerSearchParamsInit = {
    gene: null,
    tumorDepth: null,
    tumorDepthCmp: '>',
    compareDepth: null,
    compareDepthCmp: '>',
    tumorRatio: null,
    tumorRatioCmp: '>',
    compareRatio: null,
    compareRatioCmp: '>',
    mutationType: [],
    mutationPosition: [],
    mutationMeaning: [],
    mutationRisk: [],
    human: 'ALL',
    humanRatio: null,
    humanRatioCmp: '<',
    sift: [],
    drug: false,
}
const innerSearchParams = ref({
    gene: null,
    tumorDepth: null,
    tumorDepthCmp: '>',
    compareDepth: null,
    compareDepthCmp: '>',
    tumorRatio: null,
    tumorRatioCmp: '>',
    compareRatio: null,
    compareRatioCmp: '>',
    mutationType: [],
    mutationPosition: [],
    mutationMeaning: [],
    mutationRisk: [],
    human: 'ALL',
    humanRatio: null,
    humanRatioCmp: '<',
    sift: [],
    drug: false,
})

const igvVisible = ref(false)
const igvFile = ref(null)
const loading = ref(false)
const filteredRows = ref([])
const { rows, drugRows, header } = toRefs(props)
const propSelectedRows = toRef(props, 'selectedRows')
const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')
const tumorColumnIdx = computed(() => {
    // 根据列表头名称，例如Geno_Type(QN11), 检查该列是对比样本列表还是肿瘤样本列
    const tumorIdx = []
    header.value.forEach((head, i) => {
        props.samples.forEach((sample, _) => {
            if (head.includes(`(${sample.identifier})`) && sample.sample_meta.is_panel) {
                tumorIdx.push(i)
            }
        })
    })
    return tumorIdx
})

const showDrawer = ref(false)

const chartTitles = {
    type: 'MutationTypeStatistics',
    meaning: 'MutationMeaningStatistics',
    risk: 'MutationRiskStatistics',
    crowd: 'CrowdFrequencyStatistics',
    snp: 'SnpStatistics',
}
const crowdCols = {
    // ['col26', 'col31', 'col39']
    'ALL': [27, 35, 43],
    'African': [28, 36, 44],
    'American': [29, 37, 45],
    'East Asian': [30, 38, 47],
    'European': [31, 39, 48],
    'South Asian': [34, 40]
}
const bubbleColKeys = computed(() => {
    return crowdCols[innerSearchParams.value.human].map(idx => `col${idx}`)
})

const serialTitles = computed(() => {
    return crowdCols[innerSearchParams.value.human].map(idx => props.header[idx-1])
})

const customCell = (record, rowIndex, column) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        // style: {
        //     // 字体颜色
        //     // 'color': record.id === physicalSurveyCurrRowId.value ? 'orange' : 'rgba(0, 0, 0, 0.65)',
        //     // 行背景色
        //     'background-color': record.id === currentRow.value.id ? '#64b5f6' : 'white',
        //     // 'border-color': record.id === currentRow.value.id ? 'red' : 'grey',
        //     // 'border-style': 'solid',
        //     // // 下划线
        //     // 'text-decoration': 'underline',
        //     // // 字体样式-斜体
        //     // 'font-style': 'italic',
        //     // // 字体样式-斜体
        //     'font-weight': record.id === currentRow.value.id ? 'bolder' : 'normal',
        //     cursor: 'pointer',
        // },
        // 鼠标单击行
        onClick: (event) => {
            // 记录当前点击的行标识
            currentRow.value = record
            // clickRow(record)
            // if (currentRow.value.id === record.id) {
            //     currentRow.value = {}
            // } else {
            //     currentRow.value = record
            // }
        },
    }
}
const currentRow = ref({})
const fixedColumns = [
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

    { i: 22, title: '', dataIndex: 'col22', align: 'left', width: 200, ellipsis: true }, // CLNDN
    { i: 23, title: '', dataIndex: 'col23', align: 'left', width: 200, ellipsis: true }, // CLNDISDB
    { i: 24, title: '', dataIndex: 'col24', align: 'left', width: 160, ellipsis: true }, // CLNREVSTAT
    { i: 25, title: '', dataIndex: 'col25', align: 'center', width: 120 }, // CLNSIG
    { i: 26, title: '', dataIndex: 'col26', align: 'center', width: 200, ellipsis: true }, // cosmic70
    { i: 27, title: '', dataIndex: 'col27', align: 'center', width: 100 }, // ExAC_ALL

    // { i: 30, title: '', dataIndex: 'col30', align: 'center', width: 100 },

    { i: 35, title: '', dataIndex: 'col35', align: 'center', width: 100 },
    // { i: 36, title: '', dataIndex: 'col36', align: 'center', width: 100 },

    // { i: 38, title: '', dataIndex: 'col38', align: 'center', width: 100 },
    // { i: 39, title: '', dataIndex: 'col39', align: 'center', width: 100 },

    { i: 42, title: '', dataIndex: 'col42', align: 'center', width: 100 },
    { i: 43, title: '', dataIndex: 'col43', align: 'center', width: 100 },

    // { i: 60, title: '', dataIndex: 'col60', align: 'center', width: 100 },
    { i: 64, title: '', dataIndex: 'col64', align: 'center', width: 100 },

    // { i: 148, title: '', dataIndex: 'col148', align: 'center', width: 100 },

    { title: '操作列', key: 'operation', align: 'center', fixed: 'right', width: 100 }
]


const selectedExpandColIdx = ref([])

const tableFile = computed(() => {
    const ret = getDualIdentifiers(props.samples)
    return `igv${props.task.result_dir}/Mut_somatic/${ret.qn}_${ret.qt}.combined.standard-new.csv`
})

const tableFileName = computed(() => {
    const ret = getDualIdentifiers(props.samples)
    return `${ret.qn}_${ret.qt}.combined.standard-new.txt`
})

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
    let result = [...fixedColumns]
    result = result.splice(0, result.length - 2)
    selectedExpandColIdx.value.forEach(idx => {
        result.push({
            i: idx, title: header.value[idx - 1], dataIndex: `col${idx}`, width: 100, ellipsis: true
        })
    })
    result.push(fixedColumns[fixedColumns.length - 1])

    // 如果有扩展列要展示，需要重置列宽
    // if (fixedColumns.length > 0) {
    //     result.forEach(t => t.width = 0)
    // }

    result.forEach((c) => (c.customCell = customCell))
    return result
})


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
    innerSearchParams.value = Object.assign({}, innerSearchParamsInit)
    innerSearchParams.value.humanRatioCmp = '<'
    search()
}

function clickDetail(record) {
    currentRow.value = record
    dialogVisible.value = true
}

function clickIgv(record) {
    currentRow.value = record
    igvFile.value = `Mut_somatic/${record.col1}-${record.col2}.igv`
    igvVisible.value = true
}

const clickRow = (row) => {
    dialogVisible.value = true
}

const searchFilterRows = (searchParams) => {

    filteredRows.value = rows.value.filter((line, i) => {
        // 搜索基因
        // 原始表格15列，支持模糊搜索
        let param = searchParams.gene
        if (param && param.length > 0) {
            if (!line.col15.includes(param)) {
                return false
            }
        }

        // 肿瘤深度
        // 原始表格8、12列，大于0的正整数，
        param = searchParams.tumorDepth
        if (param) {
            const v = tumorColumnIdx.value.includes(8) ? line.col8 : line.col12
            if (!(useComparator(searchParams.tumorDepthCmp).compare(Number(v), param))) {
                return false
            }
        }

        // 对比深度
        // 原始表格8、12列，大于0的正整数，
        param = searchParams.compareDepth
        if (param) {
            const v = tumorColumnIdx.value.includes(8) ? line.col12 : line.col8
            if (!(useComparator(searchParams.compareDepthCmp).compare(Number(v), param))) {
                return false
            }
        }

        // 肿瘤频率
        // 原始表格9、13列，大于0的小数
        param = searchParams.tumorRatio
        if (param) {
            const v = tumorColumnIdx.value.includes(9) ? line.col13 : line.col9
            if (!(useComparator(searchParams.tumorRatioCmp).compare(Number(v), param))) {
                return false
            }
        }

        // 对比频率
        // 原始表格9、13列，大于0的小数
        param = searchParams.compareRatio
        if (param) {
            const v = tumorColumnIdx.value.includes(9) ? line.col9 : line.col13
            if (!(useComparator(searchParams.compareRatioCmp).compare(Number(v), param))) {
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
        param = searchParams.mutationType
        if (param && param.length > 0) {
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
        param = searchParams.mutationMeaning
        if (param && param.length > 0) {
            const realParam = param.map((t) => (t === '●' ? '.' : t))
            if (!realParam.includes(line.col17)) {
                return false
            }
        }

        // 突变危险
        /*
            下拉选择：All/ Benign/ not_provided/还有没列举完
            原始表格第25列，把这列信息提取排序去重后，做成下拉菜单选择（如果没法做到这样，可以和我们说，然后我们去查看资料，将下拉项固定几项）支持模糊搜索
          */
        param = searchParams.mutationRisk
        if (param && param.length > 0) {
            const realParam = param.map((t) => (t === '●' ? '.' : t))
            if (!realParam.includes(line.col25)) {
                return false
            }
        }

        // 人群频率
        /*
            原始表格第30、35、43列，大于0的小数， 30、35、43列如果有两列满足筛选要求，即可展示，注意，这三列中如果有点的，不管什么筛选，都展示
          */
        param = searchParams.humanRatio
        if (param) {
            // 不同地区人群使用的数据列
            let hrColumns = {
                'ALL': [27, 35, 43],
                'African': [28, 36, 44],
                'American': [29, 37, 45],
                'East Asian': [30, 38, 47],
                'European': [31, 39, 48],
                'South Asian': [34, 40]
            }[searchParams.human]
            hrColumns = hrColumns.map(h => line[`col${h}`])
            if (hrColumns.length === 2) {
                // 如果没有第三列，认为第三列数据为.
                hrColumns.push('.')
            }
            const cmp = useComparator(searchParams.humanRatioCmp)
            const ltRatio = (colVal) => colVal === '.' || cmp.compare(Number(colVal), param)
            const ltCount = hrColumns.map(v => ltRatio(v)).filter(v => v).length
            if (ltCount < 2) {
                return false
            }
        }

        // SIFT_pred
        /*
            原始表格第60列，这列只包含3个选项：T、D、点
          */
        param = searchParams.sift
        if (param && param.length > 0) {
            if (!param.includes(line.col64)) {
                return false
            }
        }

        // 要去关联匹配, germline 和 somatic 的 match 使用的列不一样
        // 读取
        param = searchParams.drug
        if (param) {
            let relDrug = false
            let match = `${line.col1}:${line.col2}-${line.col3}_${line.col4}>${line.col5}_${line.col15}`
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
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    searchFilterRows(innerSearchParams.value)
    selectedRows.value = []
    if (showSticky.value && filteredRows.value.length > 0 && filteredRows.value.length !== rows.value.length) {
        infoMessage(`${filteredRows.value.length} ${t('DefineReportSelectAlertMessage')}`)
    }
}
watch(rows, (rows) => {
    loadTable()
})
onMounted(() => {
    loadTable()
})

const propSearchParams = toRef(props, 'searchParams')
const loadTable = () => {
    columns.value.forEach((col) => (col.title = header.value[col.i - 1]))
    columns.value[columns.value.length - 1].title = computed(() => t('Operate'))

    innerSearchParams.value = Object.assign(innerSearchParams.value, propSearchParams.value)
    searchFilterRows(propSearchParams.value)
    selectedRows.value = []
    for (let item of filteredRows.value) {
        let found = false
        for (let lineNumber of propSelectedRows.value) {
            if (lineNumber === item.lineNumber) {
                found = true
                break
            }
        }
        if (found) {
            selectedRows.value.push(item.lineNumber)
        }
    }
}
const selectedRows = ref([])

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
        searchParams: innerSearchParams.value,
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

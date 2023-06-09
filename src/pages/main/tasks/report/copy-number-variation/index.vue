<template>
    <q-btn
        v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
        icon="bookmarks"
        size="small"
        color="primary"
        class="relative-position float-right q-mr-md"
        :label="$t('ReportStickDone')"
        @click="reset()"
    />
    <q-btn
        v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
        icon="bookmarks"
        size="small"
        outline
        color="primary"
        class="relative-position float-right q-mr-md"
        @click="stickFilter()"
        :label="$t('ReportStickData')"
    />

    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >{{$t('Intro')}}</q-btn
    >
    <div>
        <div v-if="props.viewConfig.showCNVcircos">
            <div class="row">
                <div
                    :id="pieDivId"
                    class="col-lg-10 col-md-10 col-sm-12 col-xs-12"
                    style="min-width: 600px;max-width:1000px; height: 600px"
                ></div>
                <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12 column justify-center">
                    <div class="q-gutter-sm q-pb-sm">
                        <div>
                            <q-input
                                v-model="pieParams.extra"
                                class="col-1"
                                :label="$t('CopyNumberAmplificationThreshold')"
                                label-color="primary"
                                stack-label
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                        </div>

                        <div>
                            <q-input
                                v-model="pieParams.missing"
                                class="col-1"
                                :label="$t('CopyNumberDeletionThreshold')"
                                label-color="primary"
                                stack-label
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                        </div>
                        <div class="q-gutter-xs">
                            <q-btn
                                class="col"
                                color="primary"
                                size="small"
                                :label="$t('Confirm')"
                                @click="refreshPie"
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                            <q-btn
                                class="col"
                                color="primary"
                                size="small"
                                :label="$t('FuWei')"
                                @click="resetPie"
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                            <q-btn
                                v-if="amISuper()"
                                class="col"
                                color="primary"
                                size="small"
                                :label="showPieTable ? $t('HideDetail') : $t('ShowDetail')"
                                @click="showPieTable = !showPieTable"
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showPieTable">
            <a-table
                class="col-5"
                size="middle"
                rowKey="lineNumber"
                bordered
                :data-source="variantRows"
                :columns="variantColumns"
                @change="handleChange"
                :sticky="true"
            ></a-table>
        </div>

        <div v-if="props.viewConfig.showCNVtable">
            <q-separator class="q-my-lg" size="2px" color="primary" />
            <div class="row q-gutter-sm items-start q-py-md">
                <q-input
                    v-model="searchParams.gene"
                    stack-label
                    label-color="primary"
                    :label="$t('GeneSearch') + ':'"
                    clearable
                    dense
                    style="width:150px"
                    :disable="viewConfig.showStick && viewConfig.stickDone"
                />
                <q-select
                    v-model="searchParams.type"
                    clearable
                    stack-label
                    label-color="primary"
                    :options="['DUP', 'DEL']"
                    :label="$t('CopyNumberVariationClassification')"
                    style="width:150px"
                    dense
                    :disable="viewConfig.showStick && viewConfig.stickDone"
                />
                <q-select
                    v-model="searchParams.drug"
                    clearable
                    stack-label
                    label-color="primary"
                    :options="['All', 'Yes', 'No',]"
                    :label="$t('DrugTarget')"
                    style="width:150px"
                    dense
                    :disable="viewConfig.showStick && viewConfig.stickDone"
                />
                <q-select
                    v-model="searchParams.drugLevel"
                    :disable="searchParams.drug !== 'Yes' && viewConfig.showStick && viewConfig.stickDone"
                    stack-label
                    label-color="primary"
                    clearable
                    :label="$t('MedicationLevel')"
                    multiple
                    :options="['1', '2', '3', '4', 'R1', 'R2', 'Dx1', 'Dx2', 'Dx3', 'Px1', 'Px2', 'Px3']"
                    style="width:150px"
                    dense
                />
                <q-btn
                    color="primary"
                    :label="$t('Confirm')"
                    icon="search"
                    @click="clickSearch()"
                    :disable="viewConfig.showStick && viewConfig.stickDone"
                />
                <q-btn
                    color="primary"
                    :label="$t('Clear')"
                    icon="delete"
                    @click="clickClear()"
                    :disable="viewConfig.showStick && viewConfig.stickDone"
                />
                <q-btn
                    :href="tableFileUrl"
                    :label="$t('Download')"
                    icon="south"
                    color="primary"
                    target="_blank"
                    class="q-ml-sm"
                    :download="tableFileName"
                />
            </div>
        </div>

        <div style="position:relative">
            <q-icon
                v-if="isDefineReport"
                color="accent"
                name="question_mark"
                size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px"
            >
                <q-tooltip>{{$t('OnlySelectAllThisPageFilterResult')}}</q-tooltip>
            </q-icon>
            <a-table
                style="z-index:1"
                class="col-5"
                size="middle"
                rowKey="lineNumber"
                bordered
                :loading="loading"
                :data-source="filteredRows"
                :columns="columns"
                :sticky="true"
                :row-selection="rowSelection"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key !=='Operation'">
                        <template v-if="column.key==='Drugs' && record[column.dataIndex].length > 0">
                            <a-tooltip
                                color="#3b4146"
                                :title="record[column.dataIndex]"
                                :overlay-style="{ maxWidth: '1200px' }"
                            >
                                <div>{{ record[column.dataIndex].substring(0, 20)+'...'}}</div>
                            </a-tooltip>
                        </template>
                        <span v-else>{{ record[column.dataIndex] }}</span>
                    </template>
                    <template v-else>
                        <q-btn size="xs" outline color="primary" :label="$t('View')" @click="clickView(record)" />
                    </template>
                </template>
            </a-table>
        </div>
    </div>

    <q-dialog v-model="showImage">
        <q-card style="width:700px;max-width:1000px;height:550px;align-items: center">
            <q-card-section>
                <img :src="imageUrl" alt="" style="width:600px;height:500px;background-color:white" />
            </q-card-section>
        </q-card>
    </q-dialog>

    <q-dialog v-model="dlgVisible">
        <q-card style="width: 75%; max-width: 2000px">
            <q-bar class="bg-primary text-white">{{$t('CopyNumberVariationAnalysis')}}</q-bar>
            <q-card-section>
                <div style="white-space:pre-wrap; line-height: 35px">{{props.intro}}</div>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">{{$t('Close')}}</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed, watch, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskFile } from 'src/api/task'
import { getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import { readSystemFile } from 'src/api/report'
import { toMap, partition } from 'src/utils/collection'
import { uid } from 'quasar'
import { amISuper } from 'src/utils/user'
import * as echarts from 'echarts'
import { pieOption } from './index'
import { errorMessage } from 'src/utils/notify'
import { useI18n } from "vue-i18n"
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'

const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n()
const getCheckboxProps = (record) => {
    return {
        disabled: viewConfig.value.showStick && viewConfig.value.stickDone, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}
// hg19基因组数据，/data/bioinfo/database_dir/hg19/hg19_genome/hg19.length
// hg38基因组数据，/data/bioinfo/database_dir/hg38/hg38_genome/hg38.length
const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    task: {
        type: Object,
        required: true,
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
            return {
                showCNVcircos: true,
                showCNVtable: true,
                showSticky: false,
            }
        },
    },
    stepData: {
        type: Object,
        default: () => { }
    }
})

const showImage = ref(false)
const imageUrl = ref('')
const viewConfig = toRef(props, 'viewConfig')
const stepData = toRef(props, 'stepData')
const filteredInfo = ref()
const variantColumns = computed(() => {
    const filtered = filteredInfo.value || {}
    const chrs = Array(22)
        .fill(0)
        .map((_, i) => i + 1)
        .concat(['X', 'Y'])
    return [
        {
            key: 'name',
            title: 'name',
            dataIndex: 'name',
            align: 'center',
            width: 50,
            filters: chrs.map((ch) => {
                return {
                    text: 'chr' + ch,
                    value: 'chr' + ch,
                }
            }),
            filteredValue: filtered.name || null,
            onFilter: (value, record) => record.name === value,
        },
        { key: 'start', title: 'start', dataIndex: 'start', align: 'center', width: 80 },
        { key: 'end', title: 'end', dataIndex: 'end', align: 'center', width: 80 },
        { key: 'ratio', title: 'ratio', dataIndex: 'ratio', align: 'center', width: 50 },
    ]
})

const columns = computed(()=> [
    { key: 'Chr', title: 'Chr', dataIndex: 'Chr', align: 'center', width: 50 },
    { key: 'Start', title: 'Start', dataIndex: 'Start', align: 'center', width: 80 },
    { key: 'End', title: 'End', dataIndex: 'End', align: 'center', width: 80 },
    { key: 'Type', title: 'Type', dataIndex: 'Type', align: 'center', width: 50 },
    { key: 'Gene', title: 'Gene', dataIndex: 'Gene', align: 'center', width: 50 },
    {
        key: 'Copys',
        title: 'Copys',
        dataIndex: 'Copys',
        align: 'center',
        width: 50,
        sorter: (r1, r2) => r1.Copys - r2.Copys,
    },
    { key: 'Rank', title: 'Rank', dataIndex: 'Rank', align: 'center', width: 50 },
    { key: 'Phenotypes', title: 'Phenotypes', dataIndex: 'Phenotypes', align: 'left', width: 200 },
    { key: 'Drugs', title: 'Drugs', dataIndex: 'Drugs', align: 'center', width: 80 },
    { key: 'Operation', title: 'Plot', dataIndex: 'Operation', align: 'center', width: 50 },
].map(t => {
    t.customCell = customCell
    return t
})
)

// 所有的列名集合
const headers = computed(() => {
    // 需要排除操作列
    return [...columns.value.slice(0, columns.value.length - 1).map(t => t.key), 'Plot', 'Report']
})


const handleChange = (pagination, filters) => {
    filteredInfo.value = filters
}

const clickView = (record) => {
    showImage.value = true
    imageUrl.value = `/igv${record.Plot}`
}

watch(langCode, v => loadData())

const route = useRoute()
const dlgVisible = ref(false)
const pie = ref(null)
const pieDivId = ref(uid())
const pieParams = ref({
    extra: 3.6,
    missing: 1.2,
})

const rows = ref([])
const filteredRows = ref([])
const loading = ref(false)
const variantRows = ref([])
const isDefineReport = computed(() => useRoute().name === 'defineReport')
const searchParams = ref({
    gene: '',
    type: '', // DUP/DEL
    drug: '', // YES/NO
    drugLevel: [], // 1、2、3、4、R1、R2、Dx1、Dx2、Dx3、Px1、Px2、Px3
    includeDefaultReport: isDefineReport.value // 是否包含默认报告数据
})

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

const variants = ref([])
const chrs = ref([])
const showPieTable = ref(false)
const tableFileUrl = ref('')
const tableFileName = ref('')

const resetPie = () => {
    pieParams.value = {
        extra: 3.6,
        missing: 1.2,
    }
    refreshPie()
}

const refreshPie = () => {
    const result1 = []
    if (pieParams.value.extra < 2 || !pieParams.value.extra) {
        const msg = langCode.value === 'en' ? 'Copy number amplification threshold should be greater than 2' : '拷贝数扩增阈值 必须大于 2'
        errorMessage(msg)
        return
    }
    if (pieParams.value.missing > 2 || pieParams.value.missing < 0 || !pieParams.value.extra) {
        const msg = langCode.value === 'en' ? 'Copy number amplification threshold should be 0~2' : '拷贝数缺失阈值范围是 0~2'
        errorMessage(msg)
        return
    }
    // 扩增
    const extra_variant = toMap(
        variants.value.filter((t) => t.ratio > pieParams.value.extra),
        (t) => t.name
    )
    chrs.value.forEach((t, idx) => {
        const variant = extra_variant[t.name]
        const p = partition(t, variant)
        result1.push(...p)
        // if (variant && variant.length > 0) {
        //     variant.forEach( (vi, i) => {
        //         if (i === 0) {
        //             result1.push({ name: `${t.name}`, value: vi.start })
        //         }
        //         result1.push({
        //             name: `${t.name}`,
        //             value: vi.end - vi.start,
        //             start: vi.start,
        //             end: vi.end,
        //             ratio: vi.ratio,
        //         })
        //
        //         result1.push({ name: `${t.name}`, value: t.value - vi.end })
        //     })
        // } else {
        //     result1.push(t)
        // }
    })

    pieOption.series[1].data = result1

    const result2 = []
    // 缺失
    const missing_variant = toMap(
        variants.value.filter((t) => t.ratio < pieParams.value.missing),
        (t) => t.name
    )
    chrs.value.forEach((t, idx) => {
        const variant = missing_variant[t.name]
        const p = partition(t, variant)
        result2.push(...p)
        // if (variant) {
        //     result2.push({ name: `${t.name}`, value: variant.start })
        //     result2.push({
        //         name: `${t.name}`,
        //         value: variant.end - variant.start,
        //         start: variant.start,
        //         end: variant.end,
        //         ratio: variant.ratio,
        //     })
        //     result2.push({ name: `${t.name}`, value: t.value - variant.end })
        // } else {
        //     result2.push(t)
        // }
    })
    pieOption.series[2].data = result2

    pie.value.setOption(pieOption)
}

watch(rows, v => {
    // selectedRows.value = rows.value.filter(t => t.Report === 'Y').map(t => t.lineNumber)
})
onMounted(() => {
    loadData()
})

const loadData = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    tableFileUrl.value = `igv${props.task.result_dir}/CNV/AnnotSV.tsv.filter_${suffix}.txt`
    tableFileName.value = `AnnotSV.tsv.filter_${suffix}.txt`
    readTaskFile(route.params.id, `CNV/AnnotSV.tsv.filter_${suffix}.txt`).then((res) => {
        const results = getCsvDataAndSetLineNumber(res, { fields: headers.value })
        rows.value = results
        filteredRows.value = results
        if (stepData.value && stepData.value.pie && stepData.value.pie.searchParams) {
            pieParams.value.extra = stepData.value.pie.searchParams.extra
            pieParams.value.missing = stepData.value.pie.searchParams.missing
        }

        searchFilterRows(searchParams.value)

        if (stepData.value && stepData.value.table) {
            searchParams.value = stepData.value.table.searchParams
            searchFilterRows(stepData.value.table.searchParams)
            selectedRows.value = stepData.value.table.selectedRows
        }
        console.log(selectedRows.value)
    })

    const genome = props.task.env.GENOME
    const genomeFile =
        genome === 'hg38' ? 'database_dir/hg38/hg38_genome/hg38.length' : 'database_dir/hg19/hg19_genome/hg19.length'
    readSystemFile(genomeFile).then((res) => {
        const data = getCsvData(res, { fields: ['name', 'value'], hasHeaderLine: false })
        data.forEach((t) => (t.value = Number(t.value)))
        chrs.value = data
        pieOption.series[0].data = data

        readTaskFile(route.params.id, 'CNV/cnvkit_result').then((res) => {
            // 变异数据
            const fields = variantColumns.value.map((t) => t.title)
            variants.value = getCsvData(res, { fields, hasHeaderLine: false })
            variantRows.value = variants.value
            variants.value.forEach((t) => {
                t.start = Number(t.start)
                t.end = Number(t.end)
                t.ratio = Number(t.ratio)
            })
            console.log(stepData.value)
            if (stepData.value && stepData.value.pie && stepData.value.pie.searchParams) {
                pieParams.value.extra = stepData.value.pie.searchParams.extra
                pieParams.value.missing = stepData.value.pie.searchParams.missing
            }
            initPie()
        })
    })
}

const searchFilterRows = (searchParams) => {
    filteredRows.value = rows.value.filter((t) => {
        if (searchParams.includeDefaultReport && t.Report === 'Y') {
            return true
        }

        let result = true
        let param = searchParams.gene
        if (param.length > 0) {
            result &= t.Gene.includes(param)
        }

        param = searchParams.type
        if (param === 'DUP' || param === 'DEL') {
            result &= t.Type === param
        }

        param = searchParams.drug
        if (param === 'Yes' || param === 'No') {
            result &= param === 'Yes' ? t.Drugs.length > 0 : t.Drugs.length === 0
        }

        param = searchParams.drugLevel
        // if (searchParams.drug === 'Yes' && param.length > 0) {
        if (param && param.length > 0) {
            const word = langCode.value === 'cn' ? '用药证据等级：' : 'Drug Evidence Level:'
            result &= param.some(level => t.Drugs.indexOf(`${word}${level}`) >= 0)
        }
        return result
    })
}
const clickSearch = () => {
    if (viewConfig.value.showStick && viewConfig.value.stickDone) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    searchFilterRows(searchParams.value)
}

const clickClear = () => {
    searchParams.value = {
        gene: '',
        type: '', // DUP/DEL
        drug: '', // YES/NO
        drugLevel: [], // A/B/C/D/E
        includeDefaultReport:isDefineReport.value
    }
    clickSearch()
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

const initPie = () => {
    const div = document.getElementById(pieDivId.value)
    pie.value = echarts.init(div)
    refreshPie()
}
const selectedRows = ref([])

const onSelectChange = (selectedRowKeys) => {
    // if (viewConfig.value.showStick && viewConfig.value.stickDone) {
    //     errorMessage('请先取消过滤')
    //     return false
    // }
    console.log(selectedRowKeys)
    selectedRows.value = selectedRowKeys
}
const emit = defineEmits(['stickDone', 'reset'])
const stickFilter = () => {
    let data = {
        pie: {
            searchParams: pieParams.value,
        },
        table: {
            searchParams: searchParams.value,
            selectedRows: selectedRows.value,
            filtered: true,
            // filtered: rows.value.length != filteredRows.value.length,
            selected: selectedRows.value.length > 0,
        },
    }
    emit('stickDone', data)
}
const reset = () => {
    emit('reset', null)
    selectedRows.value = []
    searchParams.value = {
        gene: '',
        type: '', // DUP/DEL
        drug: '', // YES/NO
        drugLevel: '', // A/B/C/D/E
        includeDefaultReport: isDefineReport.value
    }
    clickSearch()
    pieParams.value = {
        extra: 2.25,
        missing: 1.75,
    }
    refreshPie()
}
</script>

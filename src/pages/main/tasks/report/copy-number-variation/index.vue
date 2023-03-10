<template>
    <q-btn
        v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
        icon="bookmarks"
        size="small"
        color="primary"
        class="relative-position float-right q-mr-md"
        label="已固定过滤"
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
        >固定过滤</q-btn
    >

    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明</q-btn
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
                                label="拷贝数扩增阈值"
                                label-color="primary"
                                stack-label
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                        </div>

                        <div>
                            <q-input
                                v-model="pieParams.missing"
                                class="col-1"
                                label="拷贝数缺失阈值"
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
                                label="确定"
                                @click="refreshPie"
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                            <q-btn
                                class="col"
                                color="primary"
                                size="small"
                                label="复位"
                                @click="resetPie"
                                :disable="viewConfig.showStick && viewConfig.stickDone"
                            />
                            <q-btn
                                v-if="amISuper()"
                                class="col"
                                color="primary"
                                size="small"
                                :label="showPieTable ? '隐藏详情' : '显示详情'"
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
                    label="搜索基因:"
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
                    label="拷贝数变异分类"
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
                    label="药物靶点"
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
                    label="用药等级"
                    multiple
                    :options="['1', '2', '3', '4', 'R1', 'R2', 'Dx1', 'Dx2', 'Dx3', 'Px1', 'Px2', 'Px3']"
                    style="width:150px"
                    dense
                />
                <q-btn
                    color="primary"
                    label="确定"
                    icon="search"
                    @click="clickSearch()"
                    :disable="viewConfig.showStick && viewConfig.stickDone"
                />
                <q-btn
                    color="grey"
                    label="清除"
                    icon="delete"
                    @click="clickClear()"
                    :disable="viewConfig.showStick && viewConfig.stickDone"
                />
                <q-btn
                    :href="tableFileUrl"
                    label="下载"
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
                color="accent"
                name="question_mark"
                size="xs"
                style="position:absolute;z-index:100;left:0px;top:0px"
            >
                <q-tooltip>仅全选本页筛选结果</q-tooltip>
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
                :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange, columnWidth: 25, getCheckboxProps: getCheckboxProps }"
            ></a-table>
        </div>
    </div>

    <q-dialog v-model="dlgVisible">
        <q-card style="width: 75%; max-width: 2000px">
            <q-bar class="bg-primary text-white">拷贝数变异分析</q-bar>
            <q-card-section>
                <div style="white-space:pre-wrap; line-height: 35px">{{props.intro}}</div>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">关闭</q-btn>
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

import { pieOption, columns } from './index'
import { errorMessage } from 'src/utils/notify'
const getCheckboxProps = (record) => {
    return {
        disabled: viewConfig.value.showStick && viewConfig.value.stickDone, // Column configuration not to be checked
        name: record.lineNumber,
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

const handleChange = (pagination, filters) => {
    filteredInfo.value = filters
}



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
const searchParams = ref({
    gene: '',
    type: '', // DUP/DEL
    drug: '', // YES/NO
    drugLevel: [], // 1、2、3、4、R1、R2、Dx1、Dx2、Dx3、Px1、Px2、Px3
})

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
        errorMessage('拷贝数扩增阈值 必须大于 2')
        return
    }
    if (pieParams.value.missing > 2 || pieParams.value.missing < 0 || !pieParams.value.extra) {
        errorMessage('拷贝数缺失阈值范围是 0~2')
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

onMounted(() => {
    tableFileUrl.value = `igv${props.task.result_dir}/CNV/AnnotSV.tsv.filter.txt`
    tableFileName.value = `AnnotSV.tsv.filter.txt`
    readTaskFile(route.params.id, 'CNV/AnnotSV.tsv.filter.txt').then((res) => {
        const columnFields = columns.map((t) => t.dataIndex)
        const results = getCsvDataAndSetLineNumber(res, { fields: columnFields })
        rows.value = results
        filteredRows.value = results
        if (stepData.value && stepData.value.pie && stepData.value.pie.searchParams) {
            pieParams.value.extra = stepData.value.pie.searchParams.extra
            pieParams.value.missing = stepData.value.pie.searchParams.missing
        }


        if (stepData.value && stepData.value.table) {
            searchParams.value = stepData.value.table.searchParams
            searchFilterRows(stepData.value.table.searchParams)
            selectedRows.value = stepData.value.table.selectedRows
        }
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
})

const searchFilterRows = (searchParams) => {
    filteredRows.value = rows.value.filter((t) => {
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
            result &= param.some(level => t.Drugs.indexOf(`用药证据等级：${level}`) >= 0)
        }
        return result
    })
}
const clickSearch = () => {
    if (viewConfig.value.showStick && viewConfig.value.stickDone) {
        errorMessage('请先取消过滤')
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
    }
    clickSearch()
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
    }
    clickSearch()
    pieParams.value = {
        extra: 2.25,
        missing: 1.75,
    }
    refreshPie()
}
</script>

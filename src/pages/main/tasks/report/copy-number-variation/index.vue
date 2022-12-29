<template>
    <q-btn
        v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
        icon="bookmarks"
        size="small"
        color="primary"
        class="relative-position float-right q-mr-md"
        label="已固定过滤"
    />
    <q-btn
        v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
        icon="bookmarks"
        size="small"
        outline
        color="primary"
        class="relative-position float-right q-mr-md"
        @click="stickFilter()"
    >固定过滤</q-btn>

    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md"
        @click="dlgVisible = !dlgVisible"
    >说明</q-btn>
    <div>
        <div v-if="props.viewConfig.showCNVcircos">
            <div class="row">
                <div
                    :id="pieDivId"
                    class="col-lg-10 col-md-10 col-sm-12 col-xs-12"
                    style="min-width: 600px;max-width:1000px; height: 600px"
                ></div>
                <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12 column justify-center">
                    <div class="q-gutter-sm q-pb-md full-width">
                        <div>
                            <q-input
                                v-model="pieParams.extra"
                                class="col-1"
                                label="拷贝数扩增阈值"
                                label-color="primary"
                                stack-label
                            />
                        </div>

                        <div>
                            <q-input
                                v-model="pieParams.missing"
                                class="col-1"
                                label="拷贝数缺失阈值"
                                label-color="primary"
                                stack-label
                            />
                        </div>
                        <div class="row q-gutter-xs">
                            <q-btn
                                class="col"
                                color="primary"
                                size="small"
                                label="确定"
                                @click="refreshPie"
                            />
                            <q-btn
                                class="col"
                                color="primary"
                                size="small"
                                label="复位"
                                @click="resetPie"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="props.viewConfig.showCNVtable">
            <q-separator />
            <div class="row q-gutter-sm items-start q-py-md">
                <q-input
                    v-model="searchParams.gene"
                    stack-label
                    label-color="primary"
                    label="搜索基因:"
                    clearable
                    dense
                    style="width:150px"
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
                />
                <q-select
                    v-model="searchParams.drugLevel"
                    :disable="searchParams.drug !== 'Yes'"
                    clearable
                    stack-label
                    label-color="primary"
                    :options="['A', 'B', 'C', 'D', 'E']"
                    label="用药等级"
                    style="width:150px"
                    dense
                />
                <q-btn color="primary" label="确定" icon="search" @click="clickSearch()" />
                <q-btn color="grey" label="清除" icon="delete" @click="clickClear()" />
            </div>
        </div>

        <a-table
            class="col-5"
            size="small"
            rowKey="lineNumber"
            bordered
            :loading="loading"
            :data-source="filteredRows"
            :columns="columns"
            :sticky="true"
            :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange }"
        ></a-table>
    </div>

    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">拷贝数变异分析</q-bar>
            <q-card-section>
                <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">关闭</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskFile } from 'src/api/task'
import { getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import { readSystemFile } from 'src/api/report'
import { toMap } from 'src/utils/collection'
import { uid } from 'quasar'
import * as echarts from 'echarts'

import { pieOption, columns } from './index'
import { errorMessage } from 'src/utils/notify'

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
})
const emit = defineEmits(['stickDone'])
const stickFilter = () => {
    let data = {
        pie: {
            searchParams: pieParams.value,
        },
        table: {
            searchParams: searchParams.value,
            selectedRows: selectedRows.value,
        },
    }
    emit('stickDone', data)
}

const route = useRoute()
const dlgVisible = ref(false)
const pie = ref(null)
const pieDivId = ref(uid())
const pieParams = ref({
    extra: 2.25,
    missing: 1.75,
})

const rows = ref([])
const filteredRows = ref([])
const loading = ref(false)
const searchParams = ref({
    gene: '',
    type: '', // DUP/DEL
    drug: '', // YES/NO
    drugLevel: '', // A/B/C/D/E
})

const variants = ref([])
const chrs = ref([])

const resetPie = () => {
    pieParams.value = {
        extra: 2.25,
        missing: 1.75,
    }
    refreshPie()
}

const refreshPie = () => {
    const result1 = []
    if(pieParams.value.extra<2 || !pieParams.value.extra){
        errorMessage('拷贝数扩增阈值 必须大于 2')
        return
    }
     if(pieParams.value.missing>2 ||pieParams.value.missing<0  || !pieParams.value.extra){
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
        if (variant) {
            result1.push({ name: `${t.name}`, value: variant.start })
            result1.push({
                name: `${t.name}`,
                value: variant.end - variant.start,
                start: variant.start,
                end: variant.end,
                ratio: variant.ratio,
            })
            result1.push({ name: `${t.name}`, value: t.value - variant.end })
        } else {
            result1.push(t)
        }
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
        if (variant) {
            result2.push({ name: `${t.name}`, value: variant.start })
            result2.push({
                name: `${t.name}`,
                value: variant.end - variant.start,
                start: variant.start,
                end: variant.end,
                ratio: variant.ratio,
            })
            result2.push({ name: `${t.name}`, value: t.value - variant.end })
        } else {
            result2.push(t)
        }
    })
    pieOption.series[2].data = result2

    pie.value.setOption(pieOption)
}

onMounted(() => {
    readTaskFile(route.params.id, 'CNV/AnnotSV.tsv.filter.txt').then((res) => {
        const columnFields = columns.map((t) => t.dataIndex)
        const results = getCsvDataAndSetLineNumber(res, { fields: columnFields })
        rows.value = results
        filteredRows.value = results
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
            variants.value = getCsvData(res, { fields: ['name', 'start', 'end', 'ratio'], hasHeaderLine: false })
            variants.value.forEach((t) => {
                t.start = Number(t.start)
                t.end = Number(t.end)
                t.ratio = Number(t.ratio)
            })

            initPie()
        })
    })
})

const clickSearch = () => {
    filteredRows.value = rows.value.filter((t) => {
        let result = true
        let param = searchParams.value.gene
        if (param.length > 0) {
            result &= t.Gene.includes(param)
        }

        param = searchParams.value.type
        if (param === 'DUP' || param === 'DEL') {
            result &= t.Type === param
        }

        param = searchParams.value.drug
        if (param === 'Yes' || param === 'No') {
            result &= param === 'Yes' ? t.Drugs.length > 0 : t.Drugs.length === 0
        }

        param = searchParams.value.drugLevel
        if (searchParams.value.drug === 'Yes' && param.length > 0) {
            result &= t.Drugs.indexOf(`药物等级:${param}`) >= 0 ? true : false
        }
        return result
    })
    selectedRows.value = []
}

const clickClear = () => {
    searchParams.value = {
        gene: '',
        type: '', // DUP/DEL
        drug: '', // YES/NO
        drugLevel: '', // A/B/C/D/E
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
    selectedRows.value = selectedRowKeys
}
</script>

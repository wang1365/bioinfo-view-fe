<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明
    </q-btn>
    <div>
        <div id="pie" style="width: 1000px; height: 600px"></div>
        <q-separator/>
        <div class="row q-gutter-sm q-my-sm">
            <div class="col">
                <q-input v-model="searchParams.gene" dense  stack-label label-color="primary"
                         label="搜索基因:" clearable />
            </div>
            <div class="col">
                <q-select
                    v-model="searchParams.type"
                    clearable
                    dense stack-label label-color="primary"
                    :options='["DUP", "DEL"]'
                    label="拷贝数变异分类"
                />
            </div>
            <div class="col">
                <q-select
                    v-model="searchParams.drug"
                    clearable
                    dense stack-label label-color="primary"
                    :options='["All", "Yes", "No",]'
                    label="药物靶点"
                />
            </div>
            <div class="col">
                <q-select
                    v-model="searchParams.drugLevel"
                    :disable="searchParams.drug !== 'Yes'"
                    clearable
                    dense stack-label label-color="primary"
                    :options='["A", "B", "C", "D", "E"]'
                    label="用药等级"
                />
            </div>
            <q-btn color="primary" label="确定" icon="search" @click="clickSearch()" />
            <q-btn color="grey" label="清除" icon="delete" @click="clickClear()" />
        </div>
    </div>

    <a-table
        class="col-5"
        size="small"
        bordered
        :loading="loading"
        :data-source="filteredRows"
        :columns="columns"
        :sticky="true"
    >
    </a-table>

    <div class="q-py-sm">过滤结果的图表数据</div>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">质控解读</q-bar>
            <q-card-section>
                <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">关闭</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <!-- <div class="q-py-md">
        <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
            :breakpoint="0">
            <q-tab name="胚系突变分析" label="胚系突变分析" />
            <q-tab name="体细胞突变分析" label="体细胞突变分析" />

        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="胚系突变分析">
                <GermlineMutationVue />
            </q-tab-panel>
            <q-tab-panel name="体细胞突变分析">
                <SomaticMutationVue />
            </q-tab-panel>
        </q-tab-panels>
    </div> -->
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router'
import { readTaskFile } from "src/api/task"
import { getCsvData } from 'src/utils/csv'
import { readSystemFile } from "src/api/report"
import { toMap } from 'src/utils/collection'
import GermlineMutationVue from "./GermlineMutation.vue"
import SomaticMutationVue from "./SomaticMutation.vue"
import * as echarts from 'echarts'




// hg19基因组数据，/data/bioinfo/database_dir/hg19/hg19_genome/hg19.length
// hg38基因组数据，/data/bioinfo/database_dir/hg38/hg38_genome/hg38.length

const route = useRoute()
const tab = ref("胚系突变分析")
const dlgVisible = ref(false)
const props = defineProps({
    intro: {
        type: String,
        required: false
    },
    task: {
        type: Object,
        required: true
    }
})

const rows = ref([])
const filteredRows = ref([])
const loading = ref(false)
const searchParams = ref({
    gene: '',
    type: '',  // DUP/DEL
    drug: '', // YES/NO
    drugLevel: '', // A/B/C/D/E
})
const columns = [
    {key: 'Chr', title: 'Chr', dataIndex: 'Chr', align: 'center', width: 50},
    {key: 'Start', title: 'Start', dataIndex: 'Start', align: 'center', width: 80},
    {key: 'End', title: 'End', dataIndex: 'End', align: 'center', width: 80},
    {key: 'Type', title: 'Type', dataIndex: 'Type', align: 'center', width: 50},
    {key: 'Gene', title: 'Gene', dataIndex: 'Gene', align: 'center', width: 50},
    {
        key: 'Copys',
        title: 'Copys',
        dataIndex: 'Copys',
        align: 'center',
        width: 50,
        sorter: (r1, r2) => r1.Copys - r2.Copys
    },
    {key: 'Rank', title: 'Rank', dataIndex: 'Rank', align: 'center', width: 50},
    {key: 'Phenotypes', title: 'Phenotypes', dataIndex: 'Phenotypes', align: 'left', width: 200},
    {key: 'Drugs', title: 'Drugs', dataIndex: 'Drugs', align: 'center', width: 80}
]

const chrList = ref([])

const pieOption = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        show: false,
        top: '5%',
        left: 'center'
    },
    series: [
        {
            type: 'pie',
            radius: ['70%', '78%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 5,
                borderColor: '#fff',
                borderWidth: 1
            },
            label: {
                show: true,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '40',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: true
            },
            data: []
        },
        {
            type: 'pie',
            radius: ['55%', '60%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 3,
                borderColor: '#fff',
                borderWidth: 1,
                color: (object) => {
                    return object.data.error ? 'red': '#f0f0f5'
                }
            },
            label: {
                show: false,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            tooltip: {
              formatter: param => {
                  return `${param.data.name}: [${param.data.value}]`
              }
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '40',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: []
        },
        {
            type: 'pie',
            radius: ['47%', '52%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 2,
                borderColor: '#fff',
                borderWidth: 1,
                color: (object) => {
                    return object.data.ratio ? 'green': '#f0f0f5'
                }
            },
            label: {
                show: false,
                position: 'outside',
                padding: 0,
                lineHeight: 2
            },
            tooltip: {
                formatter: param => {
                    const ratio = param.data.ratio || ''
                    return `${param.data.name}: ${ratio} [${param.data.value}]`
                }
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '40',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: []
        }
    ]
}


onMounted(() => {
    readTaskFile(route.params.id, 'CNV/AnnotSV.tsv.filter.txt').then(res => {
        const columnFields = columns.map(t => t.dataIndex)
        const result = getCsvData(res, {fields: columnFields})
        rows.value = result
        filteredRows.value = result
    })

    console.log('===========> task', props.task)
    const genome = props.task.env.GENOME
    const genomeFile = genome === 'hg38' ? 'database_dir/hg38/hg38_genome/hg38.length' : 'database_dir/hg19/hg19_genome/hg19.length'
    readSystemFile(genomeFile).then(res => {
        const data = getCsvData(res, { fields: ['name', 'value'], hasHeaderLine: false })
        data.forEach(t => t.value = Number(t.value))
        data.forEach((t, idx) => {
            t.start = idx === data.length - 1 ? 0 : data[idx+1].value
            t.end = t.value
        })
        pieOption.series[0].data = data

        console.log('=========pieOption.value', pieOption.series[0].data, pieOption.series[1].data, pieOption.series[2].data)

        readTaskFile(route.params.id, 'CNV/cnvkit_result').then(res => {
            // 变异数据
            const variants = getCsvData(res, { fields: ['name', 'start', 'end', 'ratio'], hasHeaderLine: false})
            console.log('******************getCsvData', variants)
            variants.forEach(t => {
                t.start = Number(t.start)
                t.end = Number(t.end)
                t.ratio = Number(t.ratio)
            })
            console.log('******************variants', variants)

            // 扩增
            const extra_variant = toMap(variants.filter(t => t.ratio > 0.17), t => t.name)
            // 缺失
            const missing_variant = toMap(variants.filter(t => t.ratio < -0.19), t => t.name)
            console.log('******************extra_variant', extra_variant)
            console.log('******************missing_variant', missing_variant)

            const data1 = []
            // data.forEach((t, idx) => {
            //     const extra = extra_variant[t.name]
            //     if (extra) {
            //         data1.push({ name: `${t.name}-1`, start: t.end, end: extra.end, value: t.end})
            //         data1.push({ name: `${t.name}-2`, start: extra.end, end: extra.start, value: extra.end, ratio: extra.ratio })
            //         data1.push({ name: `${t.name}-3`, start: extra.start, end: t.start, value: t.start })
            //     } else {
            //         data1.push(t)
            //     }
            // })
            data.forEach((t, idx) => {
                const extra = extra_variant[t.name]
                if (extra) {
                    data1.push({ name: `${t.name}-1`, value: t.end})
                    data1.push({ name: `${t.name}-2`,  value: t.end - extra.end, ratio: extra.ratio })
                    data1.push({ name: `${t.name}-3`,  value: t.start })
                } else {
                    data1.push(t)
                }
            })
            pieOption.series[1].data = data1

            const data2 = []
            // data.forEach((t, idx) => {
            //     const missing = missing_variant[t.name]
            //     if (missing) {
            //         data2.push({ name: `${t.name}-1`, start: t.end, end: missing.end, value: t.end })
            //         data2.push({ name: `${t.name}-2`, start: missing.end, end: missing.start, value: missing.end, ratio: missing.ratio })
            //         data2.push({ name: `${t.name}-3`, start: missing.start, end: t.start, value: t.start })
            //     } else {
            //         data2.push(t)
            //     }
            // })

            data.forEach((t, idx) => {
                const missing = missing_variant[t.name]
                if (missing) {
                    const dt1 = missing.end - missing.start
                    data2.push({ name: `${t.name}-1`, value: t.end })
                    data2.push({ name: `${t.name}-2`, value: t.end - missing.end, ratio: missing.ratio })
                    data2.push({ name: `${t.name}-3`, value: t.start })
                } else {
                    data2.push(t)
                }
            })
            pieOption.series[2].data = data2

            console.log('******************data1', data1)
            console.log('******************data2', data2)
            initPie()

        })
    })
})

const clickSearch = () => {
    filteredRows.value = rows.value.filter( t => {
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
            result &= (param === 'Yes' ? t.Drugs.length > 0 : t.Drugs.length === 0)
        }

        param = searchParams.value.drugLevel
        if (searchParams.value.drug === 'Yes' && param.length > 0) {
            // TODO
        }
        return result
    })
}

const clickClear = () => {
    searchParams.value = {
        gene: '',
        type: '',  // DUP/DEL
        drug: '', // YES/NO
        drugLevel: '', // A/B/C/D/E
    }
    clickSearch()
}

const initPie = () => {
    const div = document.getElementById('pie')
    const pie = echarts.init(div)

    pie.setOption(pieOption)
}
</script>

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
                <div :id="pieDivId" class="col-10" style="width: 1000px; height: 600px"></div>
                <div class="col-2 column justify-center q-gutter-sm">
                    <q-input
                        v-model="pieParams.extra"
                        class="col-1"
                        label="拷贝数扩增阈值"
                        label-color="primary"
                        stack-label
                    />
                    <q-input
                        v-model="pieParams.missing"
                        class="col-1"
                        label="拷贝数缺失阈值"
                        label-color="primary"
                        stack-label
                    />
                    <div class="row q-gutter-xs">
                        <q-btn class="col" color="primary" size="small" label="确定" @click="refreshPie" />
                        <q-btn class="col" color="primary" size="small" label="复位" @click="resetPie" />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="props.viewConfig.showCNVtable">
            <q-separator />
            <div class="row q-gutter-sm q-my-sm">
                <div class="col">
                    <q-input
                        v-model="searchParams.gene"
                        dense
                        stack-label
                        label-color="primary"
                        label="搜索基因:"
                        clearable
                    />
                </div>
                <div class="col">
                    <q-select
                        v-model="searchParams.type"
                        clearable
                        dense
                        stack-label
                        label-color="primary"
                        :options="['DUP', 'DEL']"
                        label="拷贝数变异分类"
                    />
                </div>
                <div class="col">
                    <q-select
                        v-model="searchParams.drug"
                        clearable
                        dense
                        stack-label
                        label-color="primary"
                        :options="['All', 'Yes', 'No',]"
                        label="药物靶点"
                    />
                </div>
                <div class="col">
                    <q-select
                        v-model="searchParams.drugLevel"
                        :disable="searchParams.drug !== 'Yes'"
                        clearable
                        dense
                        stack-label
                        label-color="primary"
                        :options="['A', 'B', 'C', 'D', 'E']"
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
import { getCsvData } from 'src/utils/csv'
import { readSystemFile } from 'src/api/report'
import { toMap } from 'src/utils/collection'
import { uid } from 'quasar'
import * as echarts from 'echarts'

// hg19基因组数据，/data/bioinfo/database_dir/hg19/hg19_genome/hg19.length
// hg38基因组数据，/data/bioinfo/database_dir/hg38/hg38_genome/hg38.length
const emit = defineEmits(['stickDone'])
const stickFilter = () => {
    let data = {
        error: false,
        data: {
            filter: pieParams.value,
        },
    }
    emit('stickDone', data)
}

const route = useRoute()
const tab = ref('胚系突变分析')
const dlgVisible = ref(false)
const pie = ref(null)
const pieDivId = ref(uid())
const pieParams = ref({
    extra: 2.25,
    missing: 1.75,
})

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

const rows = ref([])
const filteredRows = ref([])
const loading = ref(false)
const searchParams = ref({
    gene: '',
    type: '', // DUP/DEL
    drug: '', // YES/NO
    drugLevel: '', // A/B/C/D/E
})
const columns = [
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
]

const variants = ref([])
const chrs = ref([])

const pieOption = {
    tooltip: {
        trigger: 'item',
    },
    legend: {
        show: false,
        top: '5%',
        left: 'center',
    },
    series: [
        {
            type: 'pie',
            radius: ['70%', '78%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 5,
                borderColor: '#fff',
                borderWidth: 1,
            },
            label: {
                show: true,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            tooltip: {
                position: 'top',
                textStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                },
                formatter: (param) => {
                    return `${param.data.name}: ${param.data.value}bp`
                },
            },
            emphasis: {
                label: {
                    show: false,
                    fontSize: '40',
                    fontWeight: 'bold',
                },
            },
            labelLine: {
                show: true,
            },
            data: [],
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
                    return object.data.ratio ? 'red' : '#f0f0f5'
                },
            },
            label: {
                show: false,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            tooltip: {
                position: 'top',
                textStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                },
                formatter: (param) => {
                    return param.data.ratio
                        ? `${param.data.name}: ${param.data.start}-${param.data.end} ${param.data.ratio}拷贝`
                        : null
                },
            },
            emphasis: {
                label: {
                    show: false,
                    position: 'center',
                    fontSize: '28',
                    fontWeight: 'bold',
                    formatter: (param) => {
                        const ratio = param.data.ratio || ''
                        return param.data.ratio ? `${param.data.name}: ${ratio}` : null
                    },
                },
            },
            labelLine: {
                show: false,
            },
            data: [],
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
                    return object.data.ratio ? 'green' : '#f0f0f5'
                },
            },
            label: {
                show: false,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            tooltip: {
                position: 'top',
                textStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                },
                formatter: (param) => {
                    return param.data.ratio
                        ? `${param.data.name}: ${param.data.start}-${param.data.end} ${param.data.ratio}拷贝`
                        : null
                },
            },
            emphasis: {
                label: {
                    show: false,
                    position: 'center',
                    fontSize: '28',
                    fontWeight: 'bold',
                    formatter: (param) => {
                        const ratio = param.data.ratio || ''
                        return param.data.ratio ? `${param.data.name}: ${ratio}` : ''
                    },
                },
            },
            labelLine: {
                show: false,
            },
            data: [],
        },
    ],
}

const resetPie = () => {
    pieParams.value = {
        extra: 2.25,
        missing: 1.75,
    }
    refreshPie()
}

const refreshPie = () => {
    console.log('===========re calculate pie params')
    const result1 = []
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
    console.log('========== result1', result1)
    console.log('========== result2', result2)
    console.log('========== pieOption', pieOption)

    pie.value.setOption(pieOption)
}

onMounted(() => {
    readTaskFile(route.params.id, 'CNV/AnnotSV.tsv.filter.txt').then((res) => {
        // res =
        //     "Chr\tStart\tEnd\tType\tGene\tCopys\tRank\tPhenotypes\tDrugs\nchr1\t142535935\t249240121\tDEL\tCDC73\t1.72\t5\tParathyroid adenoma with cystic changes, 145001 (3)/ Hyperparathyroidism-jaw tumor syndrome, 145001 (3)/ Parathyroid carcinoma, 608266 (3)/ Hyperparathyroidism, familial primary, 145000 (3)\t\nchr1\t142535935\t249240121\tDEL\tFASLG\t1.72\t5\tAutoimmune lymphoproliferative syndrome, type IB, 601859 (3)/ (Lung cancer, susceptibility to), 211980 (3)\t\nchr1\t142535935\t249240121\tDEL\tFH\t1.72\t5\tFumarase deficiency, 606812 (3)/ Leiomyomatosis and renal cell cancer, 150800 (3);Hypercholesterolemia, familial, 1, 143890 (3)/ LDL cholesterol level QTL2, 143890 (3)\t\nchr1\t142535935\t249240121\tDEL\tNTRK1\t1.72\t5\tInsensitivity to pain, congenital, with anhidrosis, 256800 (3)/ Medullary thyroid carcinoma, familial, 155240 (3)\t\nchr1\t142535935\t249240121\tDEL\tSDHC\t1.72\t5\tParagangliomas 3, 605373 (3)/ Paraganglioma and gastric stromal sarcoma, 606864 (3)/ Gastrointestinal stromal tumor, 606764 (3)\t\nchr10\t42922186\t135524247\tDEL\tASCC1\t1.67\t4\t?Spinal muscular atrophy with congenital bone fractures 2, 616867 (3)/ Barrett esophagus/esophageal adenocarcinoma, 614266 (3)\t\nchr10\t42922186\t135524247\tDEL\tERCC6\t1.67\t5\t(Macular degeneration, age-related, susceptibility to, 5), 613761 (3)/ (Lung cancer, susceptibility to), 211980 (3)/ Cerebrooculofacioskeletal syndrome 1, 214150 (3)/ Cockayne syndrome, type B, 133540 (3)/ Premature ovarian failure 11, 616946 (3)/ UV-sensitive syndrome 1, 600630 (3)/ De Sanctis-Cacchione syndrome, 278800 (3)\t\nchr10\t42922186\t135524247\tDEL\tFAS\t1.67\t5\tAutoimmune lymphoproliferative syndrome, type IA, 601859 (3)/ Squamous cell carcinoma, burn scar-related, somatic (3)/ (Autoimmune lymphoproliferative syndrome), 601859 (3)\t\nchr10\t42922186\t135524247\tDEL\tFGFR2\t1.67\t4\tApert syndrome, 101200 (3)/ Craniosynostosis, nonspecific (3)/ Jackson-Weiss syndrome, 123150 (3)/ Scaphocephaly and Axenfeld-Rieger anomaly (3)/ Saethre-Chotzen syndrome, 101400 (3)/ Gastric cancer, somatic, 613659 (3)/ Scaphocephaly, maxillary retrusion, and mental retardation, 609579 (3)/ Bent bone dysplasia syndrome, 614592 (3)/ LADD syndrome, 149730 (3)/ Craniofacial-skeletal-dermatologic dysplasia, 101600 (3)/ Pfeiffer syndrome, 101600 (3)/ Crouzon syndrome, 123500 (3)/ Beare-Stevenson cutis gyrata syndrome, 123790 (3)/ Antley-Bixler syndrome without genital anomalies or disordered steroidogenesis, 207410 (3)\t\nchr10\t42922186\t135524247\tDEL\tHABP2\t1.67\t4\t(?Thyroid cancer, nonmedullary, 5), 616535 (3)/ (Venous thromboembolism, susceptibility to), 188050 (3)\t\nchr10\t42922186\t135524247\tDEL\tMINPP1\t1.67\t4\t(Thyroid carcinoma, follicular), 188470 (3)\t\nchr10\t42922186\t135524247\tDEL\tMSMB\t1.67\t4\t(Prostate cancer, hereditary, 13), 611928 (3)\t\nchr10\t42922186\t135524247\tDEL\tPTEN\t1.67\t5\tProstate cancer, somatic, 176807 (3)/ (Glioma susceptibility 2), 613028 (3)/ Cowden syndrome 1, 158350 (3)/ Lhermitte-Duclos syndrome, 158350 (3)/ Macrocephaly/autism syndrome, 605309 (3)/ (Meningioma), 607174 (3)\t\nchr10\t42922186\t135524247\tDEL\tRET\t1.67\t5\tMultiple endocrine neoplasia IIB, 162300 (3)/ Pheochromocytoma, 171300 (3)/ Multiple endocrine neoplasia IIA, 171400 (3)/ Medullary thyroid carcinoma, 155240 (3)/ (Hirschsprung disease, protection against), 142623 (3)/ Central hypoventilation syndrome, congenital, 209880 (3)/ (Hirschsprung disease, susceptibility to, 1), 142623 (3)\t\nchr11\t208837\t50631814\tDEL\tWT1\t1.73\t5\tMesothelioma, somatic, 156240 (3)/ Wilms tumor, type 1, 194070 (3)/ Frasier syndrome, 136680 (3)/ Denys-Drash syndrome, 194080 (3)/ Meacham syndrome, 608978 (3)/ Nephrotic syndrome, type 4, 256370 (3)\t\nchr16\t60501\t35285301\tDUP\tAXIN1\t2.26\t4\tHepatocellular carcinoma, somatic, 114550 (3)/ ?Caudal duplication anomaly, 607864 (3)\t\nchr16\t60501\t35285301\tDUP\tPALB2\t2.26\t5\t(Pancreatic cancer, susceptibility to, 3), 613348 (3)/ Fanconi anemia, complementation group N, 610832 (3)/ (Breast cancer, susceptibility to), 114480 (3)\t\nchr17\t25412017\t81051193\tDUP\tAXIN2\t2.39\t5\tColorectal cancer, somatic, 114500 (3)/ Oligodontia-colorectal cancer syndrome, 608615 (3)\t\nchr17\t25412017\t81051193\tDUP\tBRCA1\t2.39\t5\tFanconi anemia, complementation group S, 617883 (3)/ (Pancreatic cancer, susceptibility to, 4), 614320 (3)/ (Breast-ovarian cancer, familial, 1), 604370 (3)\t\nchr17\t25412017\t81051193\tDUP\tBRIP1\t2.39\t5\tFanconi anemia, complementation group J, 609054 (3)/ (Breast cancer, early-onset, susceptibility to), 114480 (3)\t\nchr17\t25412017\t81051193\tDUP\tHNF1B\t2.39\t5\tDiabetes mellitus, noninsulin-dependent, 125853 (3)/ Renal cysts and diabetes syndrome, 137920 (3)/ (Renal cell carcinoma), 144700 (3)\t\nchr17\t25412017\t81051193\tDUP\tHOXB13\t2.39\t4\t(Prostate cancer, hereditary, 9), 610997 (3)\t\nchr17\t25412017\t81051193\tDUP\tMPO\t2.39\t4\t(Lung cancer, protection against, in smokers) (3)/ Myeloperoxidase deficiency, 254600 (3)/ (Alzheimer disease, susceptibility to), 104300 (3)\t\nchr17\t25412017\t81051193\tDUP\tPHB\t2.39\t4\t(Breast cancer, susceptibility to), 114480 (3)\t\nchr17\t25412017\t81051193\tDUP\tPPM1D\t2.39\t5\tBreast cancer, somatic, 114480 (3)/ Jansen de Vries syndrome, 617450 (3)\t\nchr17\t25412017\t81051193\tDUP\tRAD51C\t2.39\t5\t(Breast-ovarian cancer, familial, susceptibility to, 3), 613399 (3)/ Fanconi anemia, complementation group O, 613390 (3)\t\nchr17\t25412017\t81051193\tDUP\tRAD51D\t2.39\t4\t(Breast-ovarian cancer, familial, susceptibility to, 4), 614291 (3)\t\nchr19\t203737\t24631282\tDUP\tNDUFA13\t2.26\t4\t?Mitochondrial complex I deficiency, nuclear type 28, 618249 (3)/ (Thyroid carcinoma, Hurthle cell), 607464 (3)\t\nchr19\t203737\t24631282\tDUP\tSMARCA4\t2.26\t4\t(Rhabdoid tumor predisposition syndrome 2), 613325 (3)/ Coffin-Siris syndrome 4, 614609 (3)\t\nchr19\t203737\t24631282\tDUP\tSTK11\t2.26\t5\tTesticular tumor, somatic, 273300 (3)/ Peutz-Jeghers syndrome, 175200 (3)/ Melanoma, malignant, somatic (3)/ Pancreatic cancer, somatic, 260350 (3)\t\nchr19\t49087466\t59118483\tDEL\tPOLD1\t1.69\t4\tMandibular hypoplasia, deafness, progeroid features, and lipodystrophy syndrome, 615381 (3)/ (Colorectal cancer, susceptibility to, 10), 612591 (3)\t\nchr2\t95326672\t243188873\tDEL\tBARD1\t1.68\t5\t(Breast cancer, susceptibility to), 114480 (3)\t\nchr2\t95326672\t243188873\tDEL\tCASP8\t1.68\t4\t(Lung cancer, protection against), 211980 (3)/ ?Autoimmune lymphoproliferative syndrome, type IIB, 607271 (3)/ Hepatocellular carcinoma, somatic, 114550 (3)/ (Breast cancer, protection against), 114480 (3)\t\nchr2\t95326672\t243188873\tDEL\tIL1B\t1.68\t4\t(Gastric cancer risk after H. pylori infection), 137215 (3)\t\nchr2\t95326672\t243188873\tDEL\tIL1RN\t1.68\t4\t(Gastric cancer risk after H. pylori infection), 137215 (3)/ (Microvascular complications of diabetes 4), 612628 (3)/ Interleukin 1 receptor antagonist deficiency, 612852 (3)\t\nchr20\t60501\t25717498\tDEL\tNAPB\t1.49\t4\tLeukemia, acute myeloid, therapy-related (1)/ Ovarian carcinoma (1)/ Amyotrophy, hereditary neuralgic, 162100 (3)\t\nchr21\t9411694\t39437423\tDEL\tBACH1\t1.66\t4\tFanconi anemia, complementation group J, 609054 (3)/ (Breast cancer, early-onset, susceptibility to), 114480 (3)\t\nchr9\t10501\t47317179\tDEL\tCDKN2A\t1.59\t5\t(Melanoma and neural system tumor syndrome), 155755 (3)/ (Melanoma, cutaneous malignant, 2), 155601 (3)/ (Melanoma-pancreatic cancer syndrome), 606719 (3)\t\n"
        const columnFields = columns.map((t) => t.dataIndex)
        const result = getCsvData(res, { fields: columnFields })
        rows.value = result
        filteredRows.value = result
    })

    console.log('===========> task', props.task)
    const genome = props.task.env.GENOME
    const genomeFile =
        genome === 'hg38' ? 'database_dir/hg38/hg38_genome/hg38.length' : 'database_dir/hg19/hg19_genome/hg19.length'
    readSystemFile(genomeFile).then((res) => {
        const data = getCsvData(res, { fields: ['name', 'value'], hasHeaderLine: false })
        data.forEach((t) => (t.value = Number(t.value)))
        chrs.value = data
        pieOption.series[0].data = data

        readTaskFile(route.params.id, 'CNV/cnvkit_result').then((res) => {
            // res =
            //     "chr1\t142535935\t249240121\t-0.219927\nchr2\t10501\t91741616\t-0.183334\nchr2\t95326672\t243188873\t-0.247272\nchr3\t209893\t90504354\t-0.110411\nchr3\t93655008\t197811384\t-0.0253599\nchr4\t10501\t49659617\t-0.0850496\nchr4\t52660618\t191043776\t-0.0859972\nchr5\t10501\t45939946\t-0.268931\nchr5\t49406142\t180904760\t-0.157413\nchr6\t226571\t58619289\t-0.20085\nchr6\t61880667\t171054567\t-0.110197\nchr7\t430916\t58053831\t-0.160338\nchr7\t61054832\t159128163\t-0.020188\nchr8\t309046\t43838387\t-0.0830619\nchr8\t46839388\t146303522\t-0.0134671\nchr9\t10501\t47317179\t-0.326718\nchr9\t65468180\t141152931\t-0.0186083\nchr10\t60501\t38519152\t-0.017626\nchr10\t42922186\t135524247\t-0.264409\nchr11\t208837\t50631814\t-0.210653\nchr11\t55148359\t134946016\t-0.13006\nchr12\t60501\t34243441\t-0.115191\nchr12\t37857195\t133841395\t-0.0852832\nchr13\t19169207\t69425133\t-0.125631\nchr13\t70026406\t115109378\t-0.043421\nchr14\t19000501\t72316755\t0.129684\nchr14\t72919904\t106999108\t-0.0446968\nchr15\t20000501\t84833699\t-0.0405048\nchr15\t85329293\t102520892\t-0.118179\nchr16\t60501\t35285301\t0.17616\nchr16\t46535746\t90140688\t0.0114606\nchr17\t501\t21964807\t0.0953093\nchr17\t25412017\t81051193\t0.258595\nchr18\t10501\t15410398\t0.345438\nchr18\t18821195\t78016748\t-0.00360856\nchr19\t203737\t24631282\t0.174567\nchr19\t28185923\t32884807\t-0.353412\nchr19\t32884808\t49087465\t0.0373639\nchr19\t49087466\t59118483\t-0.246282\nchr20\t60501\t25717498\t-0.424786\nchr20\t29536739\t62808504\t-0.117067\nchr21\t9411694\t39437423\t-0.27193\nchr21\t39739494\t48119395\t-0.180292\nchr22\t16050501\t23634743\t-0.0552004\nchr22\t23799777\t51244066\t0.0104669\nchrX\t145322\t58137601\t-0.444851\nchrX\t61826406\t155260060\t-0.551168\nchrY\t95322\t5789236\t-2.59446\nchrY\t5789237\t59363066\t-10.6868\n"
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
</script>

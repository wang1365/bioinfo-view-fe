<template>
    <q-btn v-if="props.viewConfig.showStick" icon="bookmarks" size="small" outline color="primary" class="relative-position float-right q-mr-md"
            @click="stickFilter()">固定过滤</q-btn>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明
    </q-btn>

    <div class="row justify-between">
        <div class="col-3 column q-gutter-xs">
            <div class="col">
                <q-input model-value="PASS" label="VCF Filter" clearable readonly stack-label label-color="primary" />
            </div>
            <div class="col">
                <q-input
                    v-model="searchParams.tumorDepth"
                    label="肿瘤深度 >="
                    clearable
                    type="number"
                    stack-label
                    label-color="primary"
                />
            </div>
            <div class="col">
                <q-input
                    v-model="searchParams.compareDepth"
                    label="对照深度 >="
                    clearable
                    type="number"
                    stack-label
                    label-color="primary"
                />
            </div>
            <div class="col">
                <q-input
                    v-model="searchParams.tumorRatio"
                    label="肿瘤频率 >="
                    clearable
                    type="number"
                    stack-label
                    label-color="primary"
                />
            </div>
            <div class="col">
                <q-input
                    v-model="searchParams.compareRatio"
                    label="对照频率 >="
                    clearable
                    type="number"
                    stack-label
                    label-color="primary"
                />
            </div>
            <div class="col">
                <q-input
                    v-model="searchParams.mutationRatio"
                    label="肿瘤突变频率 >="
                    clearable
                    type="number"
                    stack-label
                    label-color="primary"
                />
            </div>
            <div class="col">
                <q-input
                    v-model="searchParams.humanRatio"
                    label="人群频率 <="
                    clearable
                    type="number"
                    stack-label
                    label-color="primary"
                />
            </div>
            <div class="col">
                <q-select
                    v-model="searchParams.mutationType"
                    clearable
                    hide-dropdown-icon
                    :options='["All", "SNP", "INDEL"]'
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
                    hide-dropdown-icon
                    :options="mutationPositionOptions"
                    label="突变位置"
                    stack-label
                    label-color="primary"
                />
            </div>
            <div class="col">
                <q-select
                    clearable
                    v-model="searchParams.mutationMeaning"
                    dense
                    hide-dropdown-icon
                    stack-label
                    label-color="primary"
                    :options="['All', 'No synonymous SNV']"
                    label="突变意义"
                />
            </div>
            <div class="q-gutter-md text-center q-py-sm">
                <q-btn color="primary" label="确定" icon="search" @click="search()" />
                <q-btn color="primary" label="复位" icon="settings_backup_restore" @click="clickReset" />
            </div>
        </div>

        <div class="col-8">
            <div class="q-py-md text-primary text-bold text-h6">肿瘤突变负荷</div>
            <GuageChartVue :loading="loading" :tmb="tmb" />
            <div class="q-pl-sm q-mt-sm">
                <div class="text-weight-bold text-primary">仅限研究使用，不用于临床诊断</div>
                <div class="text-weight-bold text-red">警示：随意过滤造成结果不准确</div>
                <div class="text-weight-bold text-primary q-mt-sm" style="white-space: pre">{{ guageTip }}</div>
            </div>
        </div>
    </div>
    <!--    <a-table size="small" bordered :loading="loading" :data-source="filteredRows" :columns="columns" :sticky="true">-->
    <!--        <template #bodyCell="{ column, record }">-->
    <!--            <q-btn v-if="column.key === 'k8'" label="查看" color="primary" outline size="xs" @click="clickView(record)">-->
    <!--            </q-btn>-->
    <!--        </template>-->
    <!--    </a-table>-->
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">肿瘤突变符合分析</q-bar>
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
import {ref, onMounted} from "vue";
import {readTaskFile} from "src/api/task";
import {useRoute} from 'vue-router'
import {getCsvData, getCsvHeader} from "src/utils/csv";
import GuageChartVue from "./GuageChart.vue";
import {buildModelQuery} from "src/api/modelQueryBuilder"
import {useApi} from "src/api/apiBase"
import {getDualIdentifiers} from "src/utils/samples"

const {apiPost} = useApi()
const route = useRoute()
const dlgVisible = ref(false)
const guageTip = ref('')
const totalLines = ref([])
const filteredLines = ref([])
const tmb = ref(0)
const bedRegionValue = ref(1)

let initialParams = {}
const searchParams = ref({
    tumorDepth: null,
    compareDepth: null,
    tumorRatio: null,
    compareRatio: null,
    mutationRatio: null,
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    humanRatio: null
})

const table = ref({
    columns: [],
    rows: [],
    filteredRows: []
})

const props = defineProps({
    intro: {
        type: String,
        required: false
    },
    task: {
        type: Object,
        required: true
    },
    samples: {
        type: Array,
        required: false,
        default: () => []
    },
    viewConfig: {
        type: Object,
        required: false,
        default(){return {
            "showTMB":true,
        }}
    }
})

// 任务样本数据列表信息（用于查询样本数据识别号是否是肿瘤）
const samples = ref({})
// 保存是肿瘤数据的列的索引
const tumorColumns = ref([])

const mutationPositionOptions = ref([])
const mutationMeaningOptions = ref([])
const loading = ref(false)

onMounted(() => {
    loading.value = true
    // 从filter.txt获取默认参数值
    readTaskFile(route.params.id, 'TMB/filter.txt').then(res => {
        // "肿瘤深度        20" +
        // "对照深度        20" +
        // "肿瘤频率        0.05" +
        // "对照频率        0" +
        // "肿瘤突变频数    5" +
        // "突变类型        All" +
        // "突变位置        exonic,splicing" +
        // "突变意义        No synonymous SNV" +
        // "人群频率        0.01" +
        // "bed区域 2.33386";

        const lines = getCsvData(res, {hasHeaderLine: false})

        bedRegionValue.value = Number(lines[9][1])

        initialParams = {
            tumorDepth: Number(lines[0][1]),
            compareDepth: Number(lines[1][1]),
            tumorRatio: Number(lines[2][1]),
            compareRatio: Number(lines[3][1]),
            mutationRatio: Number(lines[4][1]),
            mutationType: lines[5][1],
            mutationPosition: lines[6][1].split(','),
            mutationMeaning: lines[7][1],
            humanRatio: Number(lines[8][1])
        }

        searchParams.value = Object.assign({}, initialParams)

        // 查询任务样本，用于获取样本（样本识别号）是肿瘤样本还是对照样本
        const query = buildModelQuery([], {id__in: props.task.samples})
        apiPost(`/model_query/sample`, (res) => {
            console.log('====> samples', res.data.results)
            const result = {}
            res.data.results.forEach(sample => {
                // is_panel: 是否肿瘤
                result[sample.identifier] = sample.sample_meta.is_panel
            })
            samples.value = result

            const {qt, qn} = getDualIdentifiers(props.samples)
            // 查询具体结果数据
            readTaskFile(route.params.id, `TMB/${qn}_${qt}.PASS.standard-new.csv`).then(res => {
                // csv数据解析
                const csv = getCsvData(res, {splitter: ','})
                totalLines.value = csv

                // 提取csv表头
                const headers = getCsvHeader(res, ',')

                // 根据列表头名称，例如Geno_Type(QN11), 检查该列是对比样本列表还是肿瘤样本列
                const tumorIdx = []
                headers.forEach((header, i) => {
                    for (let k in samples.value) {
                        if (header.includes(`(${k})`) && samples.value[k]) {
                            tumorIdx.push(i)
                            break
                        }
                    }
                })
                tumorColumns.value = tumorIdx

                // 提取mutationTypeOptions
                let positions = new Set()
                let meanings = new Set()
                for (let columns of totalLines.value) {
                    const items = columns[13].split(';')
                    items.forEach(item => positions.add(item))

                    if (columns[16] !== '.') {
                        meanings.add(columns[16])
                    }
                }
                mutationPositionOptions.value = Array.from(positions)
                mutationMeaningOptions.value = Array.from(meanings)
                console.log('==========> 突变位置列表', mutationPositionOptions.value)
                console.log('==========> 突变意义列表', mutationMeaningOptions.value)


                search()
                // csv内容样例，共150列
                // Chr,Start,End,Ref,Alt,Geno_Type(QN11),Allelic_Depths(QN11),Seq_Depths(QN11),Mutation_Rate(QN11),Geno_Type(QT11),Allelic_Depths(QT11),Seq_Depths(QT11),Mutation_Rate(QT11),Func.refGene,Gene.refGene,GeneDetail.refGene,ExonicFunc.refGene,exon,NUChange,AAChange,CLNALLELEID,CLNDN,CLNDISDB,CLNREVSTAT,CLNSIG,cosmic70,ExAC_ALL,ExAC_AFR,ExAC_AMR,ExAC_EAS,ExAC_FIN,ExAC_NFE,ExAC_OTH,ExAC_SAS,1000g2015aug_eas,1000g2015aug_all,esp6500siv2_all,avsnp150,gnomAD_genome_ALL,gnomAD_genome_AFR,gnomAD_genome_AMR,gnomAD_genome_ASJ,gnomAD_genome_EAS,gnomAD_genome_FIN,gnomAD_genome_NFE,gnomAD_genome_OTH,gnomAD_exome_ALL,gnomAD_exome_AFR,gnomAD_exome_AMR,gnomAD_exome_ASJ,gnomAD_exome_EAS,gnomAD_exome_FIN,gnomAD_exome_NFE,gnomAD_exome_OTH,gnomAD_exome_SAS,MCAP13,REVEL,SIFT_score,SIFT_converted_rankscore,SIFT_pred,SIFT4G_score,SIFT4G_converted_rankscore,SIFT4G_pred,LRT_score,LRT_converted_rankscore,LRT_pred,MutationTaster_score,MutationTaster_converted_rankscore,MutationTaster_pred,MutationAssessor_score,MutationAssessor_rankscore,MutationAssessor_pred,FATHMM_score,FATHMM_converted_rankscore,FATHMM_pred,PROVEAN_score,PROVEAN_converted_rankscore,PROVEAN_pred,MetaSVM_score,MetaSVM_rankscore,MetaSVM_pred,MetaLR_score,MetaLR_rankscore,MetaLR_pred,MetaRNN_score,MetaRNN_rankscore,MetaRNN_pred,M-CAP_score,M-CAP_rankscore,M-CAP_pred,MutPred_score,MutPred_rankscore,MVP_score,MVP_rankscore,MPC_score,MPC_rankscore,PrimateAI_score,PrimateAI_rankscore,PrimateAI_pred,DEOGEN2_score,DEOGEN2_rankscore,DEOGEN2_pred,BayesDel_addAF_score,BayesDel_addAF_rankscore,BayesDel_addAF_pred,BayesDel_noAF_score,BayesDel_noAF_rankscore,BayesDel_noAF_pred,ClinPred_score,ClinPred_rankscore,ClinPred_pred,LIST-S2_score,LIST-S2_rankscore,LIST-S2_pred,Aloft_pred,Aloft_Confidence,DANN_score,DANN_rankscore,fathmm-MKL_coding_score,fathmm-MKL_coding_rankscore,fathmm-MKL_coding_pred,fathmm-XF_coding_score,fathmm-XF_coding_rankscore,fathmm-XF_coding_pred,Eigen-raw_coding,Eigen-raw_coding_rankscore,Eigen-PC-raw_coding,Eigen-PC-raw_coding_rankscore,integrated_fitCons_score,integrated_fitCons_rankscore,integrated_confidence_value,GERP++_NR,GERP++_RS,GERP++_RS_rankscore,phyloP100way_vertebrate,phyloP100way_vertebrate_rankscore,phyloP30way_mammalian,phyloP30way_mammalian_rankscore,phastCons100way_vertebrate,phastCons100way_vertebrate_rankscore,phastCons30way_mammalian,phastCons30way_mammalian_rankscore,SiPhy_29way_logOdds,SiPhy_29way_logOdds_rankscore,Interpro_domain,GTEx_V8_gene,GTEx_V8_tissue,OmimID,HgmdID,AAChange.refGene
                // chr1,2130277,2130277,G,A,0/0,120;0,120,0,0/1,179;8,187,0.0427807486631016,intergenic,FAAP20;SKI,dist=4066;dist=29481,.,.,.,.,.,.,.,.,.,.,0.0002,0.0053,0,0,0,0,0,0,.,0.000798722,.,rs563740274,0.0013,0.0039,0,0,0,0.0003,0.0004,0,0.0003,0.0032,0.0004,0,0,0,7.951e-05,0,0,0.000412,0.010,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.
                // chr1,2491306,2491306,G,A,0/0,298;0,298,0,0/1,349;18,367,0.0490463215258856,exonic,TNFRSF14,.,nonsynonymous SNV,exon4,c.G349A,A117T,139092,not_specified,MedGen:CN169374,no_assertion_provided,not_provided,.,0.0159,0.0475,0.0052,0.0511,0.0030,0.0078,0.0114,0.0177,0.0337,0.0211661,0.0157,rs2234163,0.0152,0.0334,0.0084,0.0033,0.0525,0.0031,0.0046,0.0051,0.0106,0.0379,0.0036,0.0018,0.0379,0.0022,0.0063,0.0083,0.0140,.,0.204,1.0,0.010,T,1.0,0.012,T,.,.,.,1,0.090,N,-2.005,0.002,N,-1.74,0.834,D,3.45,0.001,N,-0.892,0.487,T,0.036,0.156,T,0.002,0.000,T,.,.,.,.,.,.,.,0.150,0.170,0.285,0.083,T,0.174,0.626,T,-0.484,0.007,T,-0.430,0.300,T,0.009,0.001,T,.,.,.,.;.;.;.;.;.;,.;.;.;.;.;.;,0.679,0.085,0.003,0.015,N,0.035,0.043,N,-1.382,0.028,-1.419,0.031,0.707,0.731,0,3.04,0.448,0.158,-1.249,0.030,0.172,0.211,0.000,0.064,0.001,0.051,4.699,0.122,TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|Tumor necrosis factor receptor 14/UL144\x2c N-terminal;TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|Tumor necrosis factor receptor 14/UL144\x2c N-terminal;TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|Tumor necrosis factor receptor 14/UL144\x2c N-terminal;TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|Tumor necrosis factor receptor 14/UL144\x2c N-terminal;TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|Tumor necrosis factor receptor 14/UL144\x2c N-terminal;TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|TNFR/NGFR cysteine-rich region|Tumor necrosis factor receptor 14/UL144\x2c N-terminal,.,.,602746,.,TNFRSF14:NM_001297605:exon4:c.G349A:p.A117T
            })
        }, query)
    }).finally(() => loading.value = false)

    // 从TMB_drug.txt获取用药说明
    readTaskFile(route.params.id, 'TMB/TMB_drug.txt').then(res => {
        guageTip.value = res
    })
})


const clickReset = () => {
    searchParams.value = Object.assign({}, initialParams)
    search()
}

const search = () => {
    filteredLines.value = totalLines.value.filter(line => {
        let result = true

        // 肿瘤深度
        // 原始表格8列或者是12列（因为表头是按照样品的名字哪个靠前哪个就在前面，所以需要同样品名check一下），大于0的正整数，
        let param = searchParams.value.tumorDepth
        const tumorDepth = Number(tumorColumns.value.includes(7) ? line[7] : line[11])
        if (param && !(tumorDepth >= param)) {
            return false
        }

        // 对照深度
        // 原始表格8列或者是12列（因为表头是按照样品的名字哪个靠前哪个就在前面，所以需要同样品名check一下），大于0的正整数，
        param = searchParams.value.compareDepth
        if (param) {
            const columnValue = tumorColumns.value.includes(7) ? line[11] : line[7]
            if (!(Number(columnValue) >= param)) {
                return false
            }
        }

        // 肿瘤频率
        // 原始表格9列或者是13列（因为表头是按照样品的名字哪个靠前哪个就在前面，所以需要同样品名check一下），大于0的小数
        param = searchParams.value.tumorRatio
        const tumorRatio = Number(tumorColumns.value.includes(8) ? line[8] : line[12])
        if (param && !(tumorRatio >= param)) {
            return false
        }

        // 对照频率
        // 原始表格9列或者是13列（因为表头是按照样品的名字哪个靠前哪个就在前面，所以需要同样品名check一下），大于0的小数
        param = searchParams.value.compareRatio
        if (param) {
            const columnValue = tumorColumns.value.includes(8) ? line[12] : line[8]
            if (!(Number(columnValue) >= param)) {
                return false
            }
        }

        // 肿瘤突变频数 (= 肿瘤深度 x 肿瘤频率乘积)
        param = searchParams.value.mutationRatio
        if (param) {
            if (!(tumorDepth * tumorRatio >= param)) {
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
            let isSnp = Snp.includes(line[3]) && Snp.includes(line[4])
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
            const positions = line[13].split(';')
            // console.log('==========>', positions, line[13])
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
            if (line[16] === 'synonymous SNV') {
                return false
            }
        }

        // 人群频率
        /*
        原始表格第30、35、43列，大于0的小数， 30、35、43都满足筛选要求
         */
        param = searchParams.value.humanRatio
        if (param) {
            if (!((line[29] === '.' || Number(line[29]) <= param)
                && (line[34] === '.' || Number(line[34]) <= param)
                && (line[42] === '.' || Number(line[42]) <= param)
            )) {
                return false
            }
        }

        return result
    })

    tmb.value = (filteredLines.value.length / bedRegionValue.value).toFixed(2)
    // tmb.value = Math.round(filteredLines.value.length / bedRegionValue.value)
    console.log('========= search result', filteredLines.value.length, tmb.value, filteredLines.value)
}
</script>

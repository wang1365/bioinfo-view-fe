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
        v-if="props.viewConfig.showStick&& !props.viewConfig.stickDone"
        icon="bookmarks"
        size="small"
        outline
        color="primary"
        class="relative-position float-right q-mr-md"
        @click="stickFilter()"
        label="固定过滤"
    />

    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md"
        @click="dlgVisible = !dlgVisible"
    >说明</q-btn>

    <div class="row justify-between">
        <div class="col-3 column q-gutter-xs">
            <div class="col">
                <q-input
                    model-value="PASS"
                    label="VCF Filter"
                    clearable
                    readonly
                    stack-label
                    label-color="primary"
                />
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
                    label="肿瘤突变频数 >="
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
                    :options="[`All`, `SNP`, `INDEL`]"
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
                    :options="[`All`, `No synonymous SNV`]"
                    label="突变意义"
                />
            </div>
            <div class="q-gutter-md text-center q-py-sm">
                <q-btn color="primary" label="确定" icon="search" @click="search()" />
                <q-btn
                    color="primary"
                    label="复位"
                    icon="settings_backup_restore"
                    @click="clickReset"
                />
            </div>
        </div>

        <div class="col-8">
            <div class="q-py-md text-primary text-bold text-h6">肿瘤突变负荷</div>
            <GuageChartVue :loading="loading" :tmb="tmb" />
            <div class="q-pl-sm q-mt-sm">
                <div class="text-weight-bold text-primary">仅限研究使用，不用于临床诊断</div>
                <div class="text-weight-bold text-red">警示：随意过滤造成结果不准确</div>
                <div
                    class="text-weight-bold text-primary q-mt-sm"
                    style="white-space: pre"
                >{{ guageTip }}</div>
            </div>
        </div>
    </div>

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
import { ref, onMounted } from 'vue'
import { readTaskFile } from 'src/api/task'
import { useRoute } from 'vue-router'
import { getCsvData, getCsvHeader } from 'src/utils/csv'
import GuageChartVue from './GuageChart.vue'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import { useApi } from 'src/api/apiBase'
import { getDualIdentifiers } from 'src/utils/samples'

const { apiPost } = useApi()
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
    humanRatio: null,
})

const table = ref({
    columns: [],
    rows: [],
    filteredRows: [],
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
                showTMB: true,
                showSticky: false,
            }
        },
    },
})

// 任务样本数据列表信息（用于查询样本数据识别号是否是肿瘤）
const samples = ref({})
// 保存是肿瘤数据的列的索引
const tumorColumns = ref([])

const mutationPositionOptions = ref([])
const mutationMeaningOptions = ref([])
const loading = ref(false)
const emit = defineEmits(['stickDone'])
const stickFilter = () => {
    let data = {
        tmb: tmb.value,
        searchParams: searchParams.value,
    }
    emit('stickDone', data)
}
onMounted(() => {
    loading.value = true
    // 从filter.txt获取默认参数值
    readTaskFile(route.params.id, 'TMB/filter.txt')
        .then((res) => {
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

            const lines = getCsvData(res, { hasHeaderLine: false })

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
                humanRatio: Number(lines[8][1]),
            }

            searchParams.value = Object.assign({}, initialParams)

            // 查询任务样本，用于获取样本（样本识别号）是肿瘤样本还是对照样本
            const query = buildModelQuery([], { id__in: props.task.samples })
            apiPost(
                `/model_query/sample`,
                (res) => {
                    const result = {}
                    res.data.results.forEach((sample) => {
                        // is_panel: 是否肿瘤
                        result[sample.identifier] = sample.sample_meta.is_panel
                    })
                    samples.value = result

                    const { qt, qn } = getDualIdentifiers(props.samples)
                    // 查询具体结果数据
                    readTaskFile(route.params.id, `TMB/${qn}_${qt}.PASS.standard-new.csv`).then((res) => {
                        // csv数据解析
                        const csv = getCsvData(res, { splitter: ',' })
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
                            items.forEach((item) => positions.add(item))

                            if (columns[16] !== '.') {
                                meanings.add(columns[16])
                            }
                        }
                        mutationPositionOptions.value = Array.from(positions)
                        mutationMeaningOptions.value = Array.from(meanings)

                        search()
                    })
                },
                query
            )
        })
        .finally(() => (loading.value = false))

    // 从TMB_drug.txt获取用药说明
    readTaskFile(route.params.id, 'TMB/TMB_drug.txt').then((res) => {
        guageTip.value = res
    })
})

const clickReset = () => {
    searchParams.value = Object.assign({}, initialParams)
    search()
}

const search = () => {
    filteredLines.value = totalLines.value.filter((line) => {
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
            if (!positions.some((position) => param.includes(position))) {
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
            if (
                !(
                    (line[29] === '.' || Number(line[29]) <= param) &&
                    (line[34] === '.' || Number(line[34]) <= param) &&
                    (line[42] === '.' || Number(line[42]) <= param)
                )
            ) {
                return false
            }
        }

        return result
    })

    tmb.value = (filteredLines.value.length / bedRegionValue.value).toFixed(2)
    // tmb.value = Math.round(filteredLines.value.length / bedRegionValue.value)
}
</script>

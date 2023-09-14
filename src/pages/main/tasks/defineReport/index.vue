<template>
    <q-page padding style="overflow-x: hidden; padding-top: 10px">
        <div class="row items-center q-py-sm">
            <h6>{{ $t('ReportPageTitle') }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" color="primary" @click="router.back()" />
        </div>
        <q-stepper v-if="viewConfigLoaded" v-model="step" ref="stepper" header-nav color="primary" animated>
            <q-step
                v-if="tabValid('mutation')"
                :done="isStepDone('mutation')"
                name="mutation"
                :title="$t('MutationAnalysis')"
                icon="candlestick_chart"
            >
                <MutaionVue
                    :viewConfig="viewConfig.mutation"
                    :intro="intros['mutation']"
                    :samples="samples"
                    :task="taskDetail"
                    :stepData="stepData.mutation"
                    @stickDone="stickDone('mutation', $event, 'fusion')"
                    @reset="stickDone('mutation', null, 'create')"
                />
            </q-step>

            <q-step
                v-if="tabValid('fusion')"
                :done="isStepDone('fusion')"
                name="fusion"
                :title="$t('FusionAnalysis')"
                icon="format_strikethrough"
            >
                <FusionVue
                    :viewConfig="viewConfig.fusion"
                    :intro="intros['fusion']"
                    :samples="samples"
                    :stepData="stepData.fusion"
                    :task="taskDetail"
                    @stickDone="stickDone('fusion', $event, 'copy_number_variation')"
                    @reset="stickDone('fusion', null, 'create')"
                />
            </q-step>

            <q-step
                v-if="tabValid('copy_number_variation')"
                :done="isStepDone('copy_number_variation')"
                name="copy_number_variation"
                :title="$t('CopyNumberVariationAnalysis')"
                icon="polyline"
            >
                <CopyNumberVariationVue
                    :viewConfig="viewConfig.copy_number_variation"
                    :intro="intros['copy_number_variation']"
                    :task="taskDetail"
                    :samples="samples"
                    :stepData="stepData.copy_number_variation"
                    @stickDone="stickDone('copy_number_variation', $event, 'tumor_mutation_load')"
                    @reset="stickDone('copy_number_variation', null, 'create')"
                />
            </q-step>

            <q-step
                v-if="tabValid('tumor_mutation_load')"
                :done="isStepDone('tumor_mutation_load')"
                name="tumor_mutation_load"
                :title="$t('TumorMutationLoadAnalysis')"
                icon="bubble_chart"
            >
                <TumorMutationLoadVue
                    :viewConfig="viewConfig.tumor_mutation_load"
                    :intro="intros['tumor_mutation_load']"
                    :task="taskDetail"
                    :samples="samples"
                    :stepData="stepData.tumor_mutation_load"
                    @stickDone="stickDone('tumor_mutation_load', $event, 'create')"
                    @reset="stickDone('tumor_mutation_load', null, 'create')"
                />
            </q-step>
            <q-step
                v-if="tabValid('bacteria')"
                :done="isStepDone('bacteria')"
                name="bacteria"
                :title="$t('Bacterial')"
                icon="bubble_chart"
            >
                <Pathogen
                    :viewConfig="viewConfig.bacteria"
                    :intro="intros['bacteria']"
                    :task="taskDetail"
                    :samples="samples"
                    :stepData="stepData.bacteria"
                    category="bacteria"
                    @stickDone="stickDone('bacteria', $event, 'create')"
                    @reset="stickDone('bacteria', null, 'create')"
                />
            </q-step>
            <q-step
                v-if="tabValid('fungus')"
                :done="isStepDone('fungus')"
                name="fungus"
                :title="$t('Fungal')"
                icon="bubble_chart"
            >
                <Pathogen
                    :viewConfig="viewConfig.fungus"
                    :intro="intros['fungus']"
                    :task="taskDetail"
                    :samples="samples"
                    :stepData="stepData.fungus"
                    category="fungus"
                    @stickDone="stickDone('fungus', $event, 'create')"
                    @reset="stickDone('fungus', null, 'create')"
                />
            </q-step>
            <q-step
                v-if="tabValid('virus')"
                :done="isStepDone('virus')"
                name="virus"
                :title="$t('Virus')"
                icon="bubble_chart"
            >
                <PathogenVirus
                    :viewConfig="viewConfig.virus"
                    :intro="intros['virus']"
                    :task="taskDetail"
                    :samples="samples"
                    :stepData="stepData.virus"
                    @stickDone="stickDone('virus', $event, 'create')"
                    @reset="stickDone('virus', null, 'create')"
                />
            </q-step>
            <q-step
                v-if="tabValid('parasite')"
                :done="isStepDone('parasite')"
                name="parasite"
                :title="$t('Parasite')"
                icon="bubble_chart"
            >
                <Pathogen
                    :viewConfig="viewConfig.parasite"
                    :intro="intros['parasite']"
                    :task="taskDetail"
                    :samples="samples"
                    :stepData="stepData.parasite"
                    category="parasite"
                    @stickDone="stickDone('parasite', $event, 'create')"
                    @reset="stickDone('parasite', null, 'create')"
                />
            </q-step>
            <q-step
                v-if="tabValid('specificPathogen')"
                :done="isStepDone('specificPathogen')"
                name="specificPathogen"
                :title="$t('SpecificPathogen')"
                icon="bubble_chart"
            >
                <Pathogen
                    :viewConfig="viewConfig.specificPathogen"
                    :intro="intros['specificPathogen']"
                    :task="taskDetail"
                    :samples="samples"
                    :stepData="stepData.specificPathogen"
                    category="specificPathogen"
                    @stickDone="stickDone('specificPathogen', $event, 'create')"
                    @reset="stickDone('specificPathogen', null, 'create')"
                />
            </q-step>
            <q-step
                v-for="commonTab in commonTabs"
                :key="commonTab.title"
                :title="commonTab.title"
                :name="commonTab.title"
                :done="isStepDone(commonTab.title)"
            >
                <CommonModuleVue
                    v-if="commonTab.title"
                    :viewConfig="getCommonConfig(commonTab.title)"
                    :task="taskDetail"
                    :stepData="getCommonStepData(commonTab.title)"
                    @stickDone="stickDone(commonTab.title, $event, 'create')"
                    @reset="stickDone(commonTab.title, null, 'create')"
                />
            </q-step>

            <q-step name="create" :title="$t('ReportDefineEnsureTab')" icon="receipt_long">
                <div>
                    <span class="text-bold text-h6 text-primary">{{ $t('ReportDefineResultTitle') }}:</span>
                    <div v-if="isStepDone('mutation')">
                        <div>
                            <span class="text-bold">{{ $t('MutationAnalysis') }}</span>
                            <q-chip color="primary" text-color="white" v-if="viewConfig.mutation.showMutGermline">
                                {{ $t('GermlineMutationAnalysis') }}:
                                <span
                                    v-if="stepData.mutation?.germline.selected"
                                    >{{ $t('ReportDefineSelected') }}</span
                                >
                                <span
                                    v-if="!stepData.mutation?.germline.selected && stepData.mutation?.germline.filtered"
                                    >{{ $t('ReportDefineSearched') }}</span
                                >
                                <span
                                    v-if="!stepData.mutation?.germline.selected && !stepData.mutation?.germline.filtered"
                                    >{{ $t('ReportDefineNoData') }}</span
                                >
                            </q-chip>
                            <q-chip color="primary" text-color="white" v-if="viewConfig.mutation.showMutSomatic">
                                {{ $t('SomaticMutationAnalysis') }}:
                                <span v-if="stepData.mutation?.somatic.selected">{{ $t('ReportDefineSelected') }}</span>
                                <span
                                    v-if="!stepData.mutation?.somatic.selected && stepData.mutation?.somatic.filtered"
                                    >{{ $t('ReportDefineSearched') }}</span
                                >
                                <span
                                    v-if="!stepData.mutation?.somatic.selected && !stepData.mutation?.somatic.filtered"
                                    >{{ $t('ReportDefineNoData') }}</span
                                >
                            </q-chip>
                        </div>
                    </div>
                    <div v-if="isStepDone('fusion')">
                        <div>
                            <span class="text-bold">{{ $t('FusionAnalysis') }}</span>
                            <q-chip
                                color="primary"
                                text-color="white"
                                v-if="viewConfig.fusion.showFusionGermline && samples.length <= 1"
                            >
                                {{ $t('SingleSampleFusionAnalysis') }}:
                                <span v-if="stepData.fusion?.single.qt.selected">{{ $t('ReportDefineSelected') }}</span>
                                <span
                                    v-if="!stepData.fusion?.single.qt.selected && stepData.fusion?.single.qt.filtered"
                                    >{{ $t('ReportDefineSearched') }}</span
                                >
                                <span
                                    v-if="!stepData.fusion?.single.qt.selected && !stepData.fusion?.single.qt.filtered"
                                    >{{ $t('ReportDefineNoData') }}</span
                                >
                            </q-chip>
                            <q-chip
                                color="primary"
                                text-color="white"
                                v-if="viewConfig.fusion.showFusionGermline && samples.length > 1"
                            >
                                {{ $t('TumorSingleSampleFusion') }}:
                                <span v-if="stepData.fusion?.single.qt.selected">{{ $t('ReportDefineSelected') }}</span>
                                <span
                                    v-if="!stepData.fusion?.single.qt.selected && stepData.fusion?.single.qt.filtered"
                                    >{{ $t('ReportDefineSearched') }}</span
                                >
                                <span
                                    v-if="!stepData.fusion?.single.qt.selected && !stepData.fusion?.single.qt.filtered"
                                    >{{ $t('ReportDefineNoData') }}</span
                                >
                            </q-chip>
                            <q-chip
                                color="primary"
                                text-color="white"
                                v-if="viewConfig.fusion.showFusionGermline && samples.length > 1"
                            >
                                {{ $t('ControlSingleSampleFusion') }}:
                                <span v-if="stepData.fusion?.single.qn.selected">{{ $t('ReportDefineSelected') }}</span>
                                <span
                                    v-if="!stepData.fusion?.single.qn.selected && stepData.fusion?.single.qn.filtered"
                                    >{{ $t('ReportDefineSearched') }}</span
                                >
                                <span
                                    v-if="!stepData.fusion?.single.qn.selected && !stepData.fusion?.single.qn.filtered"
                                    >{{ $t('ReportDefineNoData') }}</span
                                >
                            </q-chip>
                            <q-chip color="primary" text-color="white" v-if="viewConfig.fusion.showFusionSomatic">
                                {{ $t('SomaticCellFusionAnalysis') }}:
                                <span v-if="stepData.fusion?.normal?.selected">{{ $t('ReportDefineSelected') }}</span>
                                <span
                                    v-if="!stepData.fusion?.normal?.selected && stepData.fusion?.normal?.filtered"
                                    >{{ $t('ReportDefineSearched') }}</span
                                >
                                <span
                                    v-if="!stepData.fusion?.normal?.selected && !stepData.fusion?.normal?.filtered"
                                    >{{ $t('ReportDefineNoData') }}</span
                                >
                            </q-chip>
                        </div>
                    </div>
                    <div v-if="isStepDone('copy_number_variation')">
                        <span class="text-bold">{{ $t('CopyNumberVariationAnalysis') }}</span>
                        <q-chip color="primary" text-color="white">
                            <span
                                v-if="stepData.copy_number_variation?.table.selected"
                                >{{ $t('ReportDefineSelected') }}</span
                            >
                            <span
                                v-if="!stepData.copy_number_variation?.table.selected && stepData.copy_number_variation?.table.filtered"
                                >{{ $t('ReportDefineSearched') }}</span
                            >
                            <span
                                v-if="!stepData.copy_number_variation?.table.selected && !stepData.copy_number_variation?.table.filtered"
                                >{{ $t('ReportDefineNoData') }}</span
                            >
                        </q-chip>
                    </div>
                    <div v-if="isStepDone('bacteria')">
                        <span class="text-bold">{{ $t('Bacterial') }}</span>
                        <q-chip color="primary" text-color="white">
                            <span>{{ $t('ReportDefineSelected') }}</span>
                        </q-chip>
                    </div>
                    <div v-if="isStepDone('fungus')">
                        <span class="text-bold">{{ $t('Fungal') }}</span>
                        <q-chip color="primary" text-color="white">
                            <span>{{ $t('ReportDefineSelected') }}</span>
                        </q-chip>
                    </div>
                    <div v-if="isStepDone('virus')">
                        <span class="text-bold">{{ $t('Virus') }}</span>
                        <q-chip color="primary" text-color="white">
                            <span>{{ $t('ReportDefineSelected') }}</span>
                        </q-chip>
                    </div>
                    <div v-if="isStepDone('parasite')">
                        <span class="text-bold">{{ $t('Parasite') }}</span>
                        <q-chip color="primary" text-color="white">
                            <span>{{ $t('ReportDefineSelected') }}</span>
                        </q-chip>
                    </div>
                    <div v-if="isStepDone('specificPathogen')">
                        <span class="text-bold">{{ $t('SpecificPathogen') }}</span>
                        <q-chip color="primary" text-color="white">
                            <span>{{ $t('ReportDefineSelected') }}</span>
                        </q-chip>
                    </div>


                    <div v-for="commonTab in commonTabs" :key="commonTab.title">
                        <div v-if="isStepDone(commonTab.title)">
                            <span class="text-bold">{{ commonTab.title }}</span
                            >:&nbsp;&nbsp;
                            <span v-for="table in getCommonStepData(commonTab.title).tables" :key="table.name">
                                {{ table.name }}
                                <q-chip color="primary" text-color="white">
                                    <span v-if="table.selected">{{ $t('ReportDefineSelected') }}</span>
                                    <span
                                        v-if="!table.selected && table.filtered"
                                        >{{ $t('ReportDefineSearched') }}</span
                                    >
                                    <span
                                        v-if="!table.selected && !table.filtered"
                                        >{{ $t('ReportDefineNoData') }}</span
                                    >
                                </q-chip>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="q-py-md text-h6">{{ $t('ReportDefineInputInfoTitle') }}</div>
                <q-input v-model="reportComment" :label="$t('Comment')" />
                <div class="text-center q-pa-md q-gutter-sm">
                    <q-btn :loading="creating" :label="$t('Confirm')" color="primary" @click="createReport()"> </q-btn>
                    <q-btn :label="$t('ReportDefineClearData')" color="red" @click="reset()" />

                    <q-btn :label="$t('ReportDefineGoToReport')" color="info" @click="gotoReports()" />
                </div>
            </q-step>
        </q-stepper>
    </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from 'src/api/apiBase'
import { getTask } from 'src/api/task'
import { useRoute, useRouter } from 'vue-router'
import { readTaskFile } from 'src/api/task'
import { errorMessage, infoMessage } from 'src/utils/notify'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import CommonModuleVue from 'src/pages/main/tasks/report/common-module/index.vue'
import QcVue from '../report/qc/index.vue'
import MutaionVue from '../report/mutation/index.vue'
import FusionVue from '../report/fusion/index.vue'
import CopyNumberVariationVue from '../report/copy-number-variation/index.vue'
import MicrosatelliteInstabilityVue from '../report/microsatellite-instability/index.vue'
import TumorMutationLoadVue from '../report/tumor-mutation-load/index.vue'
import HomologousRecombinationDefectVue from '../report/homologous-recombination-defect/index.vue'
import { api } from 'src/boot/axios'
import { mutationLoadGermlineData } from './loadDatas'
import { useI18n } from "vue-i18n";
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { globalStore } from 'src/stores/global'
import Pathogen from '../report/pathogen/index'
import PathogenVirus from '../report/pathogen-virus/index'
const { t } = useI18n();
const store = globalStore()
const { langCode } = storeToRefs(store)

const { apiPost } = useApi()
const viewConfigLoaded = ref(false)
const creating = ref(false)
const reportComment = ref('')
const step = ref('mutation')
const stepData = ref({})
const route = useRoute()
const router = useRouter()
const intros = ref({})
const taskDetail = ref({})
const samples = ref([])
const viewConfig = ref({
    homologous_recombination_defect: { showHRDtable: true, showHRDpicture: true, showStick: true, stickDone: false },
    microsatellite_instability: { showMSI: true, showMSIsite: true, showStick: true, stickDone: false },
    copy_number_variation: { showCNVcircos: true, showCNVtable: true, showStick: true, stickDone: false },
    mutation: { showMutGermline: true, showMutSomatic: true, showStick: true, stickDone: false },
    tumor_mutation_load: { showTMB: true, showStick: true, stickDone: false },
    fusion: { showFusionGermline: true, showFusionSomatic: true, showStick: true, stickDone: false },
    qc: { showQCsummary: true, showQCdepth: true, showStick: true, stickDone: false },
    bacteria: {  showStick: true, stickDone: false },
    fungus: {  showStick: true, stickDone: false },
    virus: { showStick: true, stickDone: false },
    parasite: {  showStick: true, stickDone: false },
    specificPathogen: {  showStick: true, stickDone: false },
})
const commonTabs = ref([])

onMounted(() => {
    loadTaskSamples()
    loadIntros()
    loadViewConfig()
})

// 接收组件传递的过滤数据
const stickDone = (name, data, nextstep) => {
    stepData.value[name] = data
    viewConfig.value[name].stickDone = true
    /*     step.value = nextstep */
    console.log(stepData.value)
    console.log(name)
    if (!data) {
        viewConfig.value[name].stickDone = false
    }
    return true
}
const tabValid = (name) => {
    return intros.value[name]
}
const isStepDone = (name) => {
    return Boolean(stepData.value[name])
}
const tabMap = {
    mutation: '突变分析',
    fusion: '融合分析',
    copy_number_variation: '拷贝数变异分析',
    tumor_mutation_load: '肿瘤突变负荷分析',
    bacteria:"细菌",
    fungus:"真菌",
    virus:"病毒",
    parasite:"寄生虫",
    specificPathogen:"特殊病原体",
}
const createReport = () => {
    console.log(stepData.value)
    const dict = {
        突变分析: 'MutationAnalysis',
        融合分析: 'FusionAnalysis',
        拷贝数变异分析: 'CopyNumberVariationAnalysis',
        肿瘤突变负荷分析: 'TumorMutationLoadAnalysis',
        细菌:"Bacterial",
        真菌:"Fungal",
        病毒:"Virus",
        寄生虫:"Parasite",
        特殊病原体:"SpecificPathogen",
    }

    for (let key in tabMap) {
        if (tabValid(key) && !stepData.value[key]) {
            const enKey = dict[tabMap[key]]
            let tabName = tabMap[key]
            console.log(enKey)
            if (enKey) {
                tabName = t(enKey)
            }
            errorMessage(tabName + ': ' + t('DefineReportUnlockMessage'))
            return
        }
        console.log(key, tabValid(key), Boolean(stepData.value[key]))
    }
    if (!reportComment.value) {
        errorMessage(t('DefineReportCommentReuiredMessage'))
        return
    }
    let postData = {
        comment: reportComment.value,
        query: JSON.stringify(stepData.value),
        task_id: route.params.id,
    }
    console.log(JSON.stringify(postData))
    postData.query = postData.query.replaceAll('●', '.')
    creating.value = true
    apiPost(
        '/report/report/',
        (res) => {
            if (res.msg != 'success') {
                errorMessage(res.msg)
            } else {
                infoMessage(t('Success'))
                router.push(`/main/reports`)
            }
            console.log(res)
            creating.value = false
        },
        postData
    )
}
const gotoReports = () => {
    router.push(`/main/reports`)
}
const reset = () => {
    stepData.value = {}
    for (const key in viewConfig.value) {
        viewConfig.value[key].stickDone = false
    }
    /*     step.value = 'mutation' */
}
const loadTaskSamples = () => {
    // 查询任务
    getTask(route.params.id).then((res) => {
        taskDetail.value = res
        // 查询任务样本，用于获取样本（样本识别号）是肿瘤样本还是对照样本
        const query = buildModelQuery([], { id__in: res.samples })
        apiPost(
            `/model_query/sample`,
            (res) => {
                samples.value = res.data.results
            },
            query
        )
    })
}

// 读取任务的 result.json 结果文件, 他是一个 json 文件, key:value
// key 是 页面上的 tab 名称, value 是每个 tab 的说明信息
// 如果没有 key 那么对应的 tab 也就不显示
// 这里将 每个 tab 的说明信息放入 intros 中传递到 tab 中
const loadIntros = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    const dict = {
        质控: 'qc',
        突变分析: 'mutation',
        融合分析: 'fusion',
        拷贝数变异分析: 'copy_number_variation',
        微卫星不稳定分析: 'microsatellite_instability',
        肿瘤突变负荷分析: 'tumor_mutation_load',
        同源重组缺陷分析: 'homologous_recombination_defect',
        细菌: 'bacteria',
        真菌: 'fungus',
        病毒: 'virus',
        寄生虫: 'parasite',
        特殊病原体: 'specificPathogen',
    }

    readTaskFile(route.params.id, `result_${suffix}.json`).then((res) => {
        const raw = JSON.parse(res)
        const result = {}
        let steps=[]
        for (let k in raw) {
            result[dict[k]] = raw[k]
            stepData[dict[k]] = ''
            steps.push(dict[k])
        }
        intros.value = result
        console.log("intros",intros.value)
        step.value=steps[0]
    })
}
watch(langCode, lc => {
    loadViewConfig()
    loadIntros()
})
const loadViewConfig = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    // module.json
    // 这个文件中配置每个 tab 下展示的内容
    readTaskFile(route.params.id, `module_${suffix}.json`).then((res) => {
        let data = null
        const dict = {
            质控: 'qc',
            突变分析: 'mutation',
            融合分析: 'fusion',
            拷贝数变异分析: 'copy_number_variation',
            微卫星不稳定分析: 'microsatellite_instability',
            肿瘤突变负荷分析: 'tumor_mutation_load',
            同源重组缺陷分析: 'homologous_recombination_defect',
            commonModules: 'commonModules', // 自定义通用模块
            细菌: 'bacteria',
            真菌: 'fungus',
            病毒: 'virus',
            寄生虫: 'parasite',
            特殊病原体: 'specificPathogen',
        }
        try {
            data = JSON.parse(res)

        } catch (error) {
            // 尝试修复 json 的额外 ","
            try {
                data = JSON.parse(res.replace(/,[ \t\r\n]+}/g, '}').replace(/,[ \t\r\n]+\]/g, ']'))
            } catch (error) {
                errorMessage(t('DefineReportModuleNotJsonErrorMessage'))
            }
        }
        if (data) {
            let config = {}
            for (let k in data) {
                config[dict[k]] = data[k]
                config[dict[k]].showStick = true
                config[dict[k]].stickDone = false
            }
            if (data.commonModules) {
                console.log(data.commonModules)
                for (let common of data.commonModules) {
                    config[common.title] = common
                    config[common.title].showStick = true
                    config[common.title].stickDone = false
                }
                commonTabs.value = data.commonModules
            }
            viewConfig.value = config
            viewConfigLoaded.value = true
        }
        console.log('viewConfig',viewConfig.value)
    })
}
const getCommonConfig = (title) => {
    return viewConfig.value[title]
}
const getCommonStepData = (title) => {
    return stepData.value[title]
}
const commonTabSelected = (commonTab) => {
    console.log(commonTab.title)
    if (stepData.value[commonTab.title])
        return stepData.value[commonTab.title].selected
}
const commonTabFiltered = (commonTab) => {
    if (stepData.value[commonTab.title])
        return stepData.value[commonTab.title].filtered
}
</script>

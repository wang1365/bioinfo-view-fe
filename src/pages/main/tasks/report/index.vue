<template>
    <q-page padding style="overflow-x: hidden; padding-top: 10px">
        <div class="row items-center">
            <h6>{{ $t('TaskResult') }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" color="primary" @click="router.back()" />
        </div>
        <div class="q-pt-xs">
            <q-tabs
                v-model="tab"
                active-color="primary"
                active-bg-color="grey-5"
                align="justify"
                class="bg-grey-2 shadow-2"
                indicator-color="primary"
                inline-label
                :breakpoint="0"
                dense
            >
                <q-tab name="qc" :label="$t('QC')" icon="border_left" v-if="tabValid('qc')" />
                <q-tab
                    name="mutation"
                    :label="$t('MutationAnalysis')"
                    icon="candlestick_chart"
                    v-if="tabValid('mutation')"
                />
                <q-tab
                    name="fusion"
                    :label="$t('FusionAnalysis')"
                    icon="format_strikethrough"
                    v-if="tabValid('fusion')"
                />
                <q-tab
                    name="copy-number-variation"
                    :label="$t('CopyNumberVariationAnalysis')"
                    icon="polyline"
                    v-if="tabValid('copy-number-variation')"
                />
                <q-tab
                    name="copy-number-variation-gene"
                    :label="$t('CopyNumberVariationGeneAnalysis')"
                    icon="polyline"
                    v-if="tabValid('copy-number-variation-gene')"
                />
                <q-tab
                    name="microsatellite-instability"
                    :label="$t('MicroSatelliteInstability')"
                    icon="shape_line"
                    v-if="tabValid('microsatellite-instability')"
                />
                <q-tab
                    name="tumor-mutation-load"
                    :label="$t('TumorMutationLoadAnalysis')"
                    icon="bubble_chart"
                    v-if="tabValid('tumor-mutation-load')"
                />
                <q-tab
                    name="homologous-recombination-defect"
                    :label="$t('HomologousRecombinationDefectAnalysis')"
                    icon="line_axis"
                    v-if="tabValid('homologous-recombination-defect')"
                />
                <q-tab v-for="tab in tabs" :key="tab.key" :name="tab.key" :label="tab.title" :icon="tab.icon" />
            </q-tabs>
            <q-tab-panels v-model="tab" animated v-if="samples.length > 0">
                <q-tab-panel name="qc" v-if="tabValid('qc')">
                    <QcVue :viewConfig="module.qc" :intro="intros['qc']" :samples="samples" :task="taskDetail" />
                </q-tab-panel>
                <q-tab-panel name="mutation" v-if="tabValid('mutation')">
                    <MutaionVue
                        :viewConfig="module.mutation"
                        :intro="intros['mutation']"
                        :samples="samples"
                        :task="taskDetail"
                    />
                </q-tab-panel>
                <q-tab-panel name="fusion" v-if="tabValid('fusion')">
                    <FusionVue
                        :viewConfig="module.fusion"
                        :intro="intros['fusion']"
                        :samples="samples"
                        :task="taskDetail"
                    />
                </q-tab-panel>
                <q-tab-panel name="copy-number-variation" v-if="tabValid('copy-number-variation')">
                    <CopyNumberVariationVue
                        :viewConfig="module.copy_number_variation"
                        :intro="intros['copy-number-variation']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="copy-number-variation-gene" v-if="tabValid('copy-number-variation-gene')">
                    <CopyNumberVariationGeneVue
                        :viewConfig="module.copy_number_variation_gene"
                        :intro="intros['copy-number-variation-gene']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="microsatellite-instability" v-if="tabValid('microsatellite-instability')">
                    <MicrosatelliteInstabilityVue
                        :viewConfig="module.microsatellite_instability"
                        :intro="intros['microsatellite-instability']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="tumor-mutation-load" v-if="tabValid('tumor-mutation-load')">
                    <TumorMutationLoadVue
                        :viewConfig="module.tumor_mutation_load"
                        :intro="intros['tumor-mutation-load']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="homologous-recombination-defect" v-if="tabValid('homologous-recombination-defect')">
                    <HomologousRecombinationDefectVue
                        :viewConfig="module.homologous_recombination_defect"
                        :intro="intros['homologous-recombination-defect']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel
                    v-for="(commonTab, i) in commonTabs"
                    :key="`commonTab${i}`"
                    :name="`commonTab${i}`"
                    :viewConfig="commonTab"
                >
                    <CommonModuleVue :viewConfig="commonTab" :task="taskDetail" />
                </q-tab-panel>
                <q-tab-panel name="bacteria" v-if="tabValid('bacteria')">
                    <Pathogen
                        category="bacteria"
                        :viewConfig="module.bacteria"
                        :intro="intros['bacteria']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="fungus" v-if="tabValid('fungus')">
                    <Pathogen
                        category="fungus"
                        :viewConfig="module.fungus"
                        :intro="intros['fungus']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="virus" v-if="tabValid('virus')">
                    <PathogenVirus
                        :viewConfig="module.virus"
                        :intro="intros['virus']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="parasite" v-if="tabValid('parasite')">
                    <Pathogen
                        category="parasite"
                        :viewConfig="module.parasite"
                        :intro="intros['parasite']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="specificPathogen" v-if="tabValid('specificPathogen')">
                    <SpecificPathogen
                        category="specificPathogen"
                        :viewConfig="module.specificPathogen"
                        :intro="intros['specificPathogen']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed, provide, nextTick } from 'vue'
import { useApi } from 'src/api/apiBase'
import { getTask } from 'src/api/task'
import QcVue from './qc/index.vue'
import MutaionVue from './mutation/index.vue'
import FusionVue from './fusion/index.vue'
import CopyNumberVariationVue from './copy-number-variation/index.vue'
import CopyNumberVariationGeneVue from './copy-number-variation-gene/index.vue'
import MicrosatelliteInstabilityVue from './microsatellite-instability/index.vue'
import TumorMutationLoadVue from './tumor-mutation-load/index.vue'
import HomologousRecombinationDefectVue from './homologous-recombination-defect/index.vue'
import CommonModuleVue from './common-module/index.vue'
import Pathogen from './pathogen/index'
import SpecificPathogen from './pathogen/SpecificPathogen.vue'
import PathogenVirus from './pathogen-virus/index'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useRoute, useRouter } from 'vue-router'
import { readTaskFile } from 'src/api/task'
import { errorMessage } from 'src/utils/notify'

import { buildModelQuery } from 'src/api/modelQueryBuilder'

const store = globalStore()
const route = useRoute()
const router = useRouter()
const { apiPost } = useApi()
const { t } = useI18n()
const intros = ref({})

const { langCode } = storeToRefs(store)
const tab = ref('qc')
const tabs = ref([])
const taskDetail = ref({})
const samples = ref([])
const commonTabs = ref([])
const module = ref({
    homologous_recombination_defect: { showHRDtable: true, showHRDpicture: true },
    microsatellite_instability: { showMSI: true, showMSIsite: true },
    copy_number_variation: { showCNVcircos: true, showCNVtable: true },
    copy_number_variation_gene: { },
    mutation: { showMutGermline: true, showMutSomatic: true },
    tumor_mutation_load: { showTMB: true },
    fusion: { showFusionGermline: true, showFusionSomatic: true },
    qc: { showQCsummary: true, showQCdepth: true },
})

// 解析任务中的样本信息，提取是否是单样本、肿瘤样本识别号、对比样本识别号
const sampleInfo = computed(() => {
    const result = {
        isSingle: true, // 是否单样本（单样本时只有肿瘤样本）
        controlSampleId: null,  // 对照样本识别号
        tumorSampleId: null   // 肿瘤样本识别号
    }
    if (samples.value) {
        if (samples.value.length === 1) {
            result.tumorSampleId = samples.value[0].identifier
        } else {
            result.isSingle = false
            const [s0, s1] = samples.value
            if (s0?.sample_meta?.is_panel) {
                result.tumorSampleId = s0.identifier
                result.controlSampleId = s1.identifier
            } else {
                result.tumorSampleId = s1.identifier
                result.controlSampleId = s0.identifier
            }
        }
    }
    return result
})

// 将样本解析信息注入，以便于子孙组件查询样本信息
provide('sampleInfo', sampleInfo)

onMounted(() => {
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

    readResultAndModuleJson()
})

watch(langCode, lc => {
    nextTick(() => readResultAndModuleJson())
})

const readResultAndModuleJson = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    const dict = {
        '质控': 'qc',
        '突变分析': 'mutation',
        '融合分析': 'fusion',
        '拷贝数变异分析': 'copy-number-variation',
        '拷贝数变异基因分析': 'copy-number-variation-gene',
        '微卫星不稳定分析': 'microsatellite-instability',
        '肿瘤突变负荷分析': 'tumor-mutation-load',
        '同源重组缺陷分析': 'homologous-recombination-defect',
        'commonModules': 'commonModules', // 自定义通用模块
        '细菌': 'bacteria',
        '真菌': 'fungus',
        '病毒': 'virus',
        '寄生虫': 'parasite',
        '特殊病原体': 'specificPathogen',
    }
    // 读取任务的 result.json 结果文件, 他是一个 json 文件, key:value
    // key 是 页面上的 tab 名称, value 是每个 tab 的说明信息
    // 如果没有 key 那么对应的 tab 也就不显示
    // 这里将 每个 tab 的说明信息放入 intros 中传递到 tab 中
    readTaskFile(route.params.id, `result_${suffix}.json`).then((res) => {
        const raw = JSON.parse(res)

        // raw['拷贝数变异结果分析'] = {} // For test, need remove if test done

        const result = {}
        for (let k in raw) {
            result[dict[k]] = raw[k]
        }
        intros.value = result

        console.log('>>>>>>>>>>>>>>>>>>> tab', intros.value)

    })

    // module.json
    // 这个文件中配置每个 tab 下展示的内容
    /* if(samples.value.length==1){

        } */
    readTaskFile(route.params.id, `module_${suffix}.json`).then((res) => {
        let data = null
        const dict = {
            '质控': { key: 'qc', i18nKey: '' },
            '突变分析': { key: 'mutation', i18nKey: '' },
            '融合分析': { key: 'fusion', i18nKey: '' },
            '拷贝数变异分析': { key: 'copy_number_variation', i18nKey: '' },
            '拷贝数变异基因分析': { key: 'copy_number_variation_gene', i18nKey: '' },
            '微卫星不稳定分析': { key: 'microsatellite_instability', i18nKey: '' },
            '肿瘤突变负荷分析': { key: 'tumor_mutation_load', i18nKey: '' },
            '同源重组缺陷分析': { key: 'homologous_recombination_defect', i18nKey: '' },
            'commonModules': { key: 'commonModules', i18nKey: '', icon:'web_stories' }, // 自定义通用模块
            '细菌': { key: 'bacteria', i18nKey: 'BacteriaDescription', icon:'line_axis' },
            '真菌': { key: 'fungus', i18nKey: 'FungusDescription', icon:'line_axis' },
            '病毒': { key: 'virus', i18nKey: 'VirusDescription', icon:'line_axis' },
            '寄生虫': { key: 'parasite', i18nKey: 'ParasiteDescription', icon:'line_axis' },
            '特殊病原体': { key: 'specificPathogen', i18nKey: 'SpecificPathogenDescription', icon:'line_axis' },
        }
        const pathogenKeys = ['commonModules', 'bacteria', 'fungus', 'virus', 'parasite', 'specificPathogen']
        try {
            data = JSON.parse(res)
        } catch (error) {
            // 尝试修复 json 的额外 ","
            try {
                data = JSON.parse(res.replace(/,[ \t\r\n]+}/g, '}').replace(/,[ \t\r\n]+\]/g, ']'))
            } catch (error) {
                errorMessage(`module.json 文件内容非正确 json 格式`)
            }
        }
        if (!data) {
            return
        }
        tabs.value = []
        let viewConfig = {}
        for (let k in data) {
            const { key, i18nKey, icon } = dict[k]
            viewConfig[key] = data[k]
            if (pathogenKeys.includes(key)) {
                if (key !== 'commonModules') {
                    tabs.value.push({ key, title: t(i18nKey), icon })
                } else {
                    data[k].forEach((item, i) => tabs.value.push({ key: `commonTab${i}`, title: item['title'], icon }))
                }
            }
        }
        module.value = viewConfig
        commonTabs.value = viewConfig.commonModules
        // 设置初始的Active Tab（从module_XX.json中解析配置的第一个key并转为标准key值）
        tab.value = dict[Object.keys(data)[0]].key
    })
}

const tabValid = (name) => {
    return intros.value[name]
}
</script>

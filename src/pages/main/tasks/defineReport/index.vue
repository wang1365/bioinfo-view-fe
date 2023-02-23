<template>
    <q-page padding style="overflow-x: hidden; padding-top: 10px">
        <h6>定制报告</h6>
        <q-stepper v-if="viewConfigLoaded" v-model="step" ref="stepper" header-nav color="primary" animated>
            <q-step
                v-if="tabValid('mutation')"
                :done="isStepDone('mutation')"
                name="mutation"
                title="突变分析"
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
                title="融合分析"
                icon="format_strikethrough"
            >
                <FusionVue
                    :viewConfig="viewConfig.fusion"
                    :intro="intros['fusion']"
                    :samples="samples"
                    :stepData="stepData.fusion"
                    @stickDone="stickDone('fusion', $event, 'copy_number_variation')"
                    @reset="stickDone('fusion', null, 'create')"
                />
            </q-step>

            <q-step
                v-if="tabValid('copy_number_variation')"
                :done="isStepDone('copy_number_variation')"
                name="copy_number_variation"
                title="拷贝数变异分析"
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
                title="肿瘤突变负荷分析"
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
            <!-- <q-step v-if="tabValid('qc')" name="qc" title="质控" icon="border_left" color="secondary">
                <QcVue :viewConfig="viewConfig.qc" :intro="intros['qc']" :samples="samples" />
            </q-step>
            <q-step v-if="tabValid('microsatellite_instability')" name="microsatellite_instability" title="微卫星不稳定"
                icon="shape_line" color="secondary">
                <MicrosatelliteInstabilityVue :viewConfig="viewConfig.microsatellite_instability"
                    :intro="intros['microsatellite_instability']" :task="taskDetail" :samples="samples" />
            </q-step>
            <q-step v-if="tabValid('homologous_recombination_defect')" name="homologous_recombination_defect" title="同源重组缺陷分析"
                icon="line_axis" color="secondary">
                <HomologousRecombinationDefectVue :viewConfig="viewConfig.homologous_recombination_defect"
                    :intro="intros['homologous_recombination-defect']" :task="taskDetail" :samples="samples" />
            </q-step>-->
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

            <q-step name="create" title="报告确认" icon="receipt_long">
                <div>
                    <span class="text-bold text-h6 text-primary">已固定的数据是:</span>
                    <div v-if="isStepDone('mutation')">
                        <div>
                            <span class="text-bold">突变分析</span>
                            <q-chip color="primary" text-color="white" v-if="viewConfig.mutation.showMutGermline">
                                胚系突变分析:
                                <span v-if="stepData.mutation?.germline.selected">勾选</span>
                                <span
                                    v-if="!stepData.mutation?.germline.selected && stepData.mutation?.germline.filtered"
                                    >已搜索</span
                                >
                                <span
                                    v-if="!stepData.mutation?.germline.selected && !stepData.mutation?.germline.filtered"
                                    >无数据</span
                                >
                            </q-chip>
                            <q-chip color="primary" text-color="white" v-if="viewConfig.mutation.showMutSomatic">
                                体细胞突变分析:
                                <span v-if="stepData.mutation?.somatic.selected">勾选</span>
                                <span v-if="!stepData.mutation?.somatic.selected && stepData.mutation?.somatic.filtered"
                                    >已搜索</span
                                >
                                <span
                                    v-if="!stepData.mutation?.somatic.selected && !stepData.mutation?.somatic.filtered"
                                    >无数据</span
                                >
                            </q-chip>
                        </div>
                    </div>
                    <div v-if="isStepDone('fusion')">
                        <div>
                            <span class="text-bold">融合分析</span>
                            <q-chip
                                color="primary"
                                text-color="white"
                                v-if="viewConfig.fusion.showFusionGermline && samples.length <= 1"
                            >
                                单样品融合分析:
                                <span v-if="stepData.fusion?.single.qt.selected">勾选</span>
                                <span v-if="!stepData.fusion?.single.qt.selected && stepData.fusion?.single.qt.filtered"
                                    >已搜索</span
                                >
                                <span
                                    v-if="!stepData.fusion?.single.qt.selected && !stepData.fusion?.single.qt.filtered"
                                    >无数据</span
                                >
                            </q-chip>
                            <q-chip
                                color="primary"
                                text-color="white"
                                v-if="viewConfig.fusion.showFusionGermline && samples.length > 1"
                            >
                                肿瘤单样品融合:
                                <span v-if="stepData.fusion?.single.qt.selected">勾选</span>
                                <span v-if="!stepData.fusion?.single.qt.selected && stepData.fusion?.single.qt.filtered"
                                    >已搜索</span
                                >
                                <span
                                    v-if="!stepData.fusion?.single.qt.selected && !stepData.fusion?.single.qt.filtered"
                                    >无数据</span
                                >
                            </q-chip>
                            <q-chip
                                color="primary"
                                text-color="white"
                                v-if="viewConfig.fusion.showFusionGermline && samples.length > 1"
                            >
                                对照单样品融合:
                                <span v-if="stepData.fusion?.single.qn.selected">勾选</span>
                                <span v-if="!stepData.fusion?.single.qn.selected && stepData.fusion?.single.qn.filtered"
                                    >已搜索</span
                                >
                                <span
                                    v-if="!stepData.fusion?.single.qn.selected && !stepData.fusion?.single.qn.filtered"
                                    >无数据</span
                                >
                            </q-chip>
                            <q-chip color="primary" text-color="white" v-if="viewConfig.fusion.showFusionSomatic">
                                体细胞融合分析:
                                <span v-if="stepData.fusion?.normal?.selected">勾选</span>
                                <span v-if="!stepData.fusion?.normal?.selected && stepData.fusion?.normal?.filtered"
                                    >已搜索</span
                                >
                                <span v-if="!stepData.fusion?.normal?.selected && !stepData.fusion?.normal?.filtered"
                                    >无数据</span
                                >
                            </q-chip>
                        </div>
                    </div>
                    <div v-if="isStepDone('copy_number_variation')">
                        <span class="text-bold">拷贝数变异分析</span>
                        <q-chip color="primary" text-color="white">
                            <span v-if="stepData.copy_number_variation?.table.selected">勾选</span>
                            <span
                                v-if="!stepData.copy_number_variation?.table.selected && stepData.copy_number_variation?.table.filtered"
                                >已搜索</span
                            >
                            <span
                                v-if="!stepData.copy_number_variation?.table.selected && !stepData.copy_number_variation?.table.filtered"
                                >无数据</span
                            >
                        </q-chip>
                    </div>
                    <div v-if="isStepDone('tumor_mutation_load')">
                        <span class="text-bold">肿瘤突变负荷分析</span>
                        <q-chip color="primary" text-color="white">
                            <span>已搜索</span>
                        </q-chip>
                    </div>
                    <div v-for="commonTab in commonTabs" :key="commonTab.title">
                        <div v-if="isStepDone(commonTab.title)">
                            <span class="text-bold">{{ commonTab.title }}</span
                            >:&nbsp;&nbsp;
                            <span v-for="table in getCommonStepData(commonTab.title).tables" :key="table.name">
                                {{ table.name }}
                                <q-chip color="primary" text-color="white">
                                    <span v-if="table.selected">勾选</span>
                                    <span v-if="!table.selected && table.filtered">已搜索</span>
                                    <span v-if="!table.selected && !table.filtered">无数据</span>
                                </q-chip>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="q-py-md text-h6">填写信息</div>
                <q-input v-model="reportComment" label="报告备注" />
                <div class="text-center q-pa-md q-gutter-sm">
                    <q-btn :loading="creating" label="确认" color="primary" @click="createReport()">
                        <!-- <template v-slot:loading>
                             报告创建中...
                        </template>-->
                    </q-btn>
                    <q-btn label="清除数据" color="red" @click="reset()" />

                    <q-btn label="去查看报告" color="info" @click="gotoReports()" />
                </div>
            </q-step>
            <!--
                 <template v-slot:navigation>
                 <q-stepper-navigation>
                 <q-btn @click="$refs.stepper.next()" color="primary" :label="step === 4 ? 'Finish' : 'Continue'" />
                 <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back"
                 class="q-ml-sm" />
                 </q-stepper-navigation>
            </template>-->
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
    /*     qc: '质控', */
    mutation: '突变分析',
    fusion: '融合分析',
    copy_number_variation: '拷贝数变异分析',
    /*     microsatellite_instability: '微卫星不稳定分析', */
    tumor_mutation_load: '肿瘤突变负荷分析',
    /*     homologous_recombination_defect: '同源重组缺陷分析', */
}
const createReport = () => {
    console.log(stepData.value)
    for (let key in tabMap) {
        if (tabValid(key) && !stepData.value[key]) {
            errorMessage(tabMap[key] + '未固定过滤')
            return
        }
        console.log(key, tabValid(key), Boolean(stepData.value[key]))
    }
    if (!reportComment.value) {
        errorMessage('请填写备注')
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
                infoMessage('任务提交成功')
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
    const dict = {
        质控: 'qc',
        突变分析: 'mutation',
        融合分析: 'fusion',
        拷贝数变异分析: 'copy_number_variation',
        微卫星不稳定分析: 'microsatellite_instability',
        肿瘤突变负荷分析: 'tumor_mutation_load',
        同源重组缺陷分析: 'homologous_recombination_defect',
    }

    readTaskFile(route.params.id, 'result.json').then((res) => {
        const raw = JSON.parse(res)
        const result = {}
        for (let k in raw) {
            result[dict[k]] = raw[k]
            stepData[dict[k]] = ''
        }
        intros.value = result
    })
}
const loadViewConfig = () => {
    // module.json
    // 这个文件中配置每个 tab 下展示的内容
    readTaskFile(route.params.id, 'module.json').then((res) => {
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
        }
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

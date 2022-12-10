<template>
    <q-page padding style="overflow-x: hidden; padding-top: 10px">
        <h6>定制报告</h6>
        <q-stepper v-model="step" ref="stepper" color="primary" header-nav animated>

            <q-step v-if="tabValid('mutation')" :done="isStepDone('mutation')" name="mutation" title="突变分析"
                icon="candlestick_chart">
                <MutaionVue :viewConfig="viewConfig.mutation" :intro="intros['mutation']" :samples="samples"
                    :task="taskDetail" @stickDone="stickDone('mutation')" />
            </q-step>

            <q-step v-if="tabValid('fusion')" :done="isStepDone('mutation')" name="fusion" title="融合分析"
                icon="format_strikethrough">
                <FusionVue :viewConfig="viewConfig.fusion" :intro="intros['fusion']" :samples="samples"
                    @stickDone="stickDone('fusion')" />
            </q-step>

            <q-step v-if="tabValid('copy-number-variation')" :done="isStepDone('copy-number-variation')"
                name="copy-number-variation" title="拷贝数变异分析" icon="polyline">
                <CopyNumberVariationVue :viewConfig="viewConfig.copy_number_variation"
                    :intro="intros['copy-number-variation']" :task="taskDetail" :samples="samples"
                    @stickDone="stickDone('copy-number-variation')" />
            </q-step>

            <q-step v-if="tabValid('tumor-mutation-load')" :done="isStepDone('tumor_mutation_load')"
                name="tumor-mutation-load" title="肿瘤突变负荷分析" icon="bubble_chart">
                <TumorMutationLoadVue :viewConfig="viewConfig.tumor_mutation_load"
                    :intro="intros['tumor-mutation-load']" :task="taskDetail" :samples="samples"
                    @stickDone="stickDone('ctumor_mutation_load')" />
            </q-step>
            <!-- <q-step v-if="tabValid('qc')" name="qc" title="质控" icon="border_left" color="secondary">
                <QcVue :viewConfig="viewConfig.qc" :intro="intros['qc']" :samples="samples" />
            </q-step>
            <q-step v-if="tabValid('microsatellite-instability')" name="microsatellite-instability" title="微卫星不稳定"
                icon="shape_line" color="secondary">
                <MicrosatelliteInstabilityVue :viewConfig="viewConfig.microsatellite_instability"
                    :intro="intros['microsatellite-instability']" :task="taskDetail" :samples="samples" />
            </q-step>
            <q-step v-if="tabValid('homologous-recombination-defect')" name="homologous-recombination-defect" title="同源重组缺陷分析"
                icon="line_axis" color="secondary">
                <HomologousRecombinationDefectVue :viewConfig="viewConfig.homologous_recombination_defect"
                    :intro="intros['homologous-recombination-defect']" :task="taskDetail" :samples="samples" />
            </q-step> -->
            <q-step name="create" title="报告确认" icon="receipt_long">
                <div>
                    <span class="text-bold text-h6 text-primary">已固定的数据是: </span>
                    <q-chip v-if="isStepDone('mutation')" color="primary" text-color="white" icon="candlestick_chart">
                        突变分析
                    </q-chip>
                    <q-chip v-if="isStepDone('fusion')" color="primary" text-color="white" icon="format_strikethrough">
                        融合分析
                    </q-chip>
                    <q-chip v-if="isStepDone('tumor_mutation_load')" color="primary" text-color="white" icon="polyline">
                        拷贝数变异分析
                    </q-chip>
                    <q-chip v-if="isStepDone('tumor_mutation_load')" color="primary" text-color="white"
                        icon="bubble_chart">
                        肿瘤突变负荷分析
                    </q-chip>

                </div>
                <div class="q-py-md text-h6">填写信息</div>
                <q-input v-model="text" label="报告备注" />
                <div class="text-center q-pa-md q-gutter-sm">
                    <q-btn label="确认" color="primary" @click="createReport()" />
                    <q-btn label="返回修改" color="secondary" @click="step = 'mutation'" />

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
            </template> -->
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

import QcVue from '../report/qc/index.vue'
import MutaionVue from '../report/mutation/index.vue'
import FusionVue from '../report/fusion/index.vue'
import CopyNumberVariationVue from '../report/copy-number-variation/index.vue'
import MicrosatelliteInstabilityVue from '../report/microsatellite-instability/index.vue'
import TumorMutationLoadVue from '../report/tumor-mutation-load/index.vue'
import HomologousRecombinationDefectVue from '../report/homologous-recombination-defect/index.vue'

const { apiPost } = useApi()

const step = ref('mutation')
const stepData = ref({})
const route = useRoute()
 const router = useRouter()
const intros = ref({})
const taskDetail = ref({})
const samples = ref([])
const viewConfig = ref({
    homologous_recombination_defect: { showHRDtable: true, showHRDpicture: true, showStick: true },
    microsatellite_instability: { showMSI: true, showMSIsite: true, showStick: true },
    copy_number_variation: { showCNVcircos: true, showCNVtable: true, showStick: true },
    mutation: { showMutGermline: true, showMutSomatic: true, showStick: true },
    tumor_mutation_load: { showTMB: true, showStick: true },
    fusion: { showFusionGermline: true, showFusionSomatic: true, showStick: true },
    qc: { showQCsummary: true, showQCdepth: true, showStick: true },
})

onMounted(() => {
    loadTaskSamples()
    loadIntros()
    loadViewConfig()
})

const stickDone = (name) => {
    return true
}
const tabValid = (name) => {
    return intros.value[name]
}
const isStepDone = (name) => {
    return true
    return stepData.value[name]
}

const createReport = () => {
    infoMessage("报告创建完成.")
}
const gotoReports = () => {
    router.push(`/main/reports`)
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
        拷贝数变异分析: 'copy-number-variation',
        微卫星不稳定分析: 'microsatellite-instability',
        肿瘤突变负荷分析: 'tumor-mutation-load',
        同源重组缺陷分析: 'homologous-recombination-defect',
    }

    readTaskFile(route.params.id, 'result.json').then((res) => {
        const raw = JSON.parse(res)
        const result = {}
        for (let k in raw) {
            result[dict[k]] = raw[k]
            stepData[dict[k]] = ""
        }
        intros.value = result
        console.log('intro============', intros.value)
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
            }
            console.log('module', data)
            viewConfig.value = config
        }
    })
}
</script>

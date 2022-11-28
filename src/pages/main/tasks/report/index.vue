<template>
    <q-page padding style="overflow-x: hidden; padding-top: 10px">
        <h6>任务结果</h6>
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
                <q-tab name="qc" label="质控" icon="border_left" v-if="tabValid('qc')" />
                <q-tab name="mutation" label="突变分析" icon="candlestick_chart" v-if="tabValid('mutation')" />
                <q-tab name="fusion" label="融合分析" icon="format_strikethrough" v-if="tabValid('fusion')" />
                <q-tab
                    name="copy-number-variation"
                    label="拷贝数变异分析"
                    icon="polyline"
                    v-if="tabValid('copy-number-variation')"
                />
                <q-tab
                    name="microsatellite-instability"
                    label="微卫星不稳定"
                    icon="shape_line"
                    v-if="tabValid('microsatellite-instability')"
                />
                <q-tab
                    name="tumor-mutation-load"
                    label="肿瘤突变负荷分析"
                    icon="bubble_chart"
                    v-if="tabValid('tumor-mutation-load')"
                />
                <q-tab
                    name="homologous-recombination-defect"
                    label="同源重组缺陷分析"
                    icon="line_axis"
                    v-if="tabValid('homologous-recombination-defect')"
                />
            </q-tabs>
            <q-tab-panels v-model="tab" animated v-if="samples.length > 0">
                <q-tab-panel name="qc" v-if="tabValid('qc')">
                    <QcVue :module="module" :intro="intros['qc']" :samples="samples" />
                </q-tab-panel>
                <q-tab-panel name="mutation" v-if="tabValid('mutation')">
                    <MutaionVue :module="module" :intro="intros['mutation']" :samples="samples" :task="taskDetail" />
                </q-tab-panel>
                <q-tab-panel name="fusion" v-if="tabValid('fusion')">
                    <FusionVue :module="module" :intro="intros['fusion']" :samples="samples" />
                </q-tab-panel>
                <q-tab-panel name="copy-number-variation" v-if="tabValid('copy-number-variation')">
                    <CopyNumberVariationVue
                        :module="module"
                        :intro="intros['copy-number-variation']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="microsatellite-instability" v-if="tabValid('microsatellite-instability')">
                    <MicrosatelliteInstabilityVue
                        :module="module"
                        :intro="intros['microsatellite-instability']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="tumor-mutation-load" v-if="tabValid('tumor-mutation-load')">
                    <TumorMutationLoadVue
                        :module="module"
                        :intro="intros['tumor-mutation-load']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
                <q-tab-panel name="homologous-recombination-defect" v-if="tabValid('homologous-recombination-defect')">
                    <HomologousRecombinationDefectVue
                        :module="module"
                        :intro="intros['homologous-recombination-defect']"
                        :task="taskDetail"
                        :samples="samples"
                    />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </q-page>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "src/api/apiBase";
import { getTask } from "src/api/task"
import QcVue from "./qc/index.vue"
import MutaionVue from "./mutation/index.vue"
import FusionVue from "./fusion/index.vue"
import CopyNumberVariationVue from "./copy-number-variation/index.vue"
import MicrosatelliteInstabilityVue from "./microsatellite-instability/index.vue"
import TumorMutationLoadVue from "./tumor-mutation-load/index.vue"
import HomologousRecombinationDefectVue from "./homologous-recombination-defect/index.vue"

import { useRoute } from "vue-router";
import { readTaskFile } from "src/api/task"
import { errorMessage } from "src/utils/notify";


import { buildModelQuery } from "src/api/modelQueryBuilder";

const route = useRoute()
const { apiPost } = useApi()
const intros = ref({})


const tab = ref("qc")
const taskDetail = ref({})
const samples = ref([])
const module = ref({})

onMounted(() => {
    // 查询任务
    getTask(route.params.id).then(res => {
        taskDetail.value = res

        // 查询任务样本，用于获取样本（样本识别号）是肿瘤样本还是对照样本
        const query = buildModelQuery([], { id__in: res.samples })
        apiPost(`/model_query/sample`, (res) => {
            samples.value = res.data.results
            console.log(res.data.results)
        }, query)
    })



    const dict = {
        '质控': 'qc',
        '突变分析': 'mutation',
        '融合分析': 'fusion',
        '拷贝数变异分析': 'copy-number-variation',
        '微卫星不稳定分析': 'microsatellite-instability',
        '肿瘤突变负荷分析': 'tumor-mutation-load',
        '同源重组缺陷分析': 'homologous-recombination-defect',
    }
    // 读取任务的 result.json 结果文件, 他是一个 json 文件, key:value
    // key 是 页面上的 tab 名称, value 是每个 tab 的说明信息
    // 如果没有 key 那么对应的 tab 也就不显示
    // 这里将 每个 tab 的说明信息放入 intros 中传递到 tab 中
    readTaskFile(route.params.id, 'result.json').then((res => {
        const raw = JSON.parse(res)
        const result = {}
        for (let k in raw) {
            result[dict[k]] = raw[k]
        }
        intros.value = result
    }))

    // module.json
    // 这个文件中配置每个 tab 下展示的内容
    readTaskFile(route.params.id, 'module.json').then(res => {
        try {
            module.value = JSON.parse(res)
        } catch (error) {
            // 尝试修复 json 的额外 ","
            try {
                module.value = JSON.parse(res.replace(/,[ \t\r\n]+}/g, '}').replace(/,[ \t\r\n]+\]/g, ']'))
            } catch (error) {
                errorMessage(`module.json 文件内容非正确 json 格式`)
                console.info(res)
            }

        }

    })
})

const tabValid = (name) => {
    return intros.value[name]
}
</script>

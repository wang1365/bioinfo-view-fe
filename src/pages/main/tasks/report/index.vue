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
                    <QcVue :intro="options['qc']" :samples="samples" :module="module[options['qc']]"/>
                </q-tab-panel>
                <q-tab-panel name="mutation" v-if="tabValid('mutation')">
                    <MutaionVue :intro="options['mutation']" :samples="samples" />
                </q-tab-panel>
                <q-tab-panel name="fusion" v-if="tabValid('fusion')">
                    <FusionVue :intro="options['fusion']" :samples="samples"/>
                </q-tab-panel>
                <q-tab-panel name="copy-number-variation" v-if="tabValid('copy-number-variation')">
                    <CopyNumberVariationVue :intro="options['copy-number-variation']" :task="taskDetail" :samples="samples"/>
                </q-tab-panel>
                <q-tab-panel name="microsatellite-instability" v-if="tabValid('microsatellite-instability')">
                    <MicrosatelliteInstabilityVue :intro="options['microsatellite-instability']" :task="taskDetail" :samples="samples" />
                </q-tab-panel>
                <q-tab-panel name="tumor-mutation-load" v-if="tabValid('tumor-mutation-load')">
                    <TumorMutationLoadVue :intro="options['tumor-mutation-load']" :task="taskDetail"  :samples="samples"/>
                </q-tab-panel>
                <q-tab-panel name="homologous-recombination-defect" v-if="tabValid('homologous-recombination-defect')">
                    <HomologousRecombinationDefectVue
                        :intro="options['homologous-recombination-defect']"
                        :task="taskDetail" :samples="samples"
                    />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </q-page>
</template>
<script setup>
import {ref, onMounted} from "vue";
import {useApi} from "src/api/apiBase";
import PageTitle from "components/page-title/PageTitle.vue";
import {getTask} from "src/api/task"
import QcVue from "./qc/index.vue"
import MutaionVue from "./mutation/index.vue"
import FusionVue from "./fusion/index.vue"
import CopyNumberVariationVue from "./copy-number-variation/index.vue"
import MicrosatelliteInstabilityVue from "./microsatellite-instability/index.vue"
import TumorMutationLoadVue from "./tumor-mutation-load/index.vue"
import HomologousRecombinationDefectVue from "./homologous-recombination-defect/index.vue"

import PaginatorVue from "src/components/paginator/Paginator.vue";
import {useRouter, useRoute} from "vue-router";
import {readTaskFile} from "src/api/task"

import {useQuasar} from "quasar";
import {buildModelQuery} from "src/api/modelQueryBuilder";

const route = useRoute()
const {apiPost} = useApi()
const options = ref({})

const tab = ref("qc")
const taskDetail = ref({})
const samples = ref([])
const module = ref({})

onMounted(() => {
    // 查询任务
    getTask(route.params.id).then(res => {
        taskDetail.value = res

        // 查询任务样本，用于获取样本（样本识别号）是肿瘤样本还是对照样本
        const query = buildModelQuery([], {id__in: res.samples})
        apiPost(`/model_query/sample`, (res) => {
            samples.value = res.data.results
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
    readTaskFile(route.params.id, 'result.json').then((res => {
        const raw = JSON.parse(res)
        const result = {}
        for (let k in raw) {
            result[dict[k]] = raw[k]
        }
        options.value = result
    }))

    readTaskFile(route.params.id, 'module.json').then(res => {
        module.value = JSON.parse(res)
    })
})

const tabValid = (name) => {
    return options.value[name]
}
</script>

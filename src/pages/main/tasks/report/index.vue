<template>
    <q-page padding style="overflow-x: hidden; padding-top: 10px">
        <h6>任务结果</h6>
        <div class="q-pt-xs">
            <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
                :breakpoint="0" dense>
                <q-tab name="qc" label="质控" />
                <q-tab name="mutation" label="突变分析结果" />
                <q-tab name="fusion" label="融合分析结果" />
                <q-tab name="copy-number-variation" label="拷贝数变异分析结果" />
                <q-tab name="microsatellite-instability" label="微卫星不稳定结果" />
                <q-tab name="tumor-mutation-load" label="肿瘤突变负荷分析结果" />
                <q-tab name="homologous-recombination-defect" label="同源重组缺陷分析结果" />
            </q-tabs>
            <q-tab-panels v-model="tab" animated>
                <q-tab-panel name="qc">
                    <QcVue />
                </q-tab-panel>
                <q-tab-panel name="mutation">
                    <MutaionVue />
                </q-tab-panel>
                <q-tab-panel name="fusion">
                    <FusionVue />
                </q-tab-panel>
                <q-tab-panel name="copy-number-variation">
                    <CopyNumberVariationVue />
                </q-tab-panel>
                <q-tab-panel name="microsatellite-instability">
                    <MicrosatelliteInstabilityVue />
                </q-tab-panel>
                <q-tab-panel name="tumor-mutation-load">
                    <TumorMutationLoadVue />
                </q-tab-panel>
                <q-tab-panel name="homologous-recombination-defect">
                    <HomologousRecombinationDefectVue />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </q-page>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "src/api/apiBase";
import PageTitle from "components/page-title/PageTitle.vue";
import QcVue from "./qc/index.vue"
import MutaionVue from "./mutation/index.vue"
import FusionVue from "./fusion/index.vue"
import CopyNumberVariationVue from "./copy-number-variation/index.vue"
import MicrosatelliteInstabilityVue from "./microsatellite-instability/index.vue"
import TumorMutationLoadVue from "./tumor-mutation-load/index.vue"
import HomologousRecombinationDefectVue from "./homologous-recombination-defect/index.vue"

import PaginatorVue from "src/components/paginator/Paginator.vue";
import { useRouter } from "vue-router";

import { useQuasar } from "quasar";

const tab = ref("qc")
</script>

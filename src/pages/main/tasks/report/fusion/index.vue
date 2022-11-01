<template>
    <div class="q-py-md">
        融合分析介绍:融合分析介绍:融合分析介绍:融合分析介绍:融合分析介绍:融合分析介绍:融合分析介绍:融合分析介绍:
    </div>
    <div class="q-py-md">
        <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
            :breakpoint="0">
            <q-tab name="单样品融合分析" label="单样品融合分析" />
            <q-tab name="体细胞融合分析" label="体细胞融合分析" />

        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="单样品融合分析">
                <TumorVue />
            </q-tab-panel>
            <q-tab-panel name="体细胞融合分析">
                <NormalVue />
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import NormalVue from "./Normal.vue";
import TumorVue from "./Tumor.vue";
const tab = ref("单样品融合分析")
</script>
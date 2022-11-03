<template>
    <div class="q-py-md">
        拷贝数变异分析介绍:拷贝数变异分析介绍:拷贝数变异分析介绍:拷贝数变异分析介绍:拷贝数变异分析介绍:拷贝数变异分析介绍:拷贝数变异分析介绍:拷贝数变异分析介绍:
    </div>
    <div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-input dense label="搜索基因:" clearable />
            </div>
            <div class="col">
                <q-select clearable dense :options='["DUP", "DEL"]' label="拷贝数变异分类" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["无", "正", "反",]' label="CN 排序" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["All", "Yes", "No",]' label="药物靶点" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["A", "B", "C", "D", "E"]' label="突变位置" />
            </div>
        </div>
        <div class="q-gutter-md text-center q-py-sm">
            <q-btn color="primary" label="确定" icon="search" @click="refreshPage()" />
            <q-btn color="grey" label="清除" icon="delete" @click="refreshPage()" />
        </div>
    </div>

    <div class="q-py-sm">
        过滤结果的图表数据
    </div>
    <!-- <div class="q-py-md">
        <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
            :breakpoint="0">
            <q-tab name="胚系突变分析" label="胚系突变分析" />
            <q-tab name="体细胞突变分析" label="体细胞突变分析" />

        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="胚系突变分析">
                <GermlineMutationVue />
            </q-tab-panel>
            <q-tab-panel name="体细胞突变分析">
                <SomaticMutationVue />
            </q-tab-panel>
        </q-tab-panels>
    </div> -->

</template>
<script setup>
import { ref, onMounted } from "vue";
import GermlineMutationVue from "./GermlineMutation.vue"
import SomaticMutationVue from "./SomaticMutation.vue"
const tab = ref("胚系突变分析")
</script>
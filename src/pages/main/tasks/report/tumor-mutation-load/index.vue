<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
    >说明
    </q-btn
    >

    <div class="row justify-between">
        <div class="col-3 column q-gutter-xs">
            <div class="col">
                <q-input v-model="searchParams.tumorDepth" label="肿瘤深度 >" clearable type="number" stack-label
                         label-color="primary"/>
            </div>
            <div class="col">
                <q-input v-model="searchParams.compareDepth" label="对照深度 >" clearable type="number" stack-label
                         label-color="primary"/>
            </div>
            <div class="col">
                <q-input v-model="searchParams.tumorRatio" label="肿瘤频率 >" clearable type="number" stack-label
                         label-color="primary"/>
            </div>
            <div class="col">
                <q-input v-model="searchParams.compareRatio" label="对照频率 >" clearable type="number" stack-label
                         label-color="primary"/>
            </div>
            <div class="col">
                <q-input v-model="searchParams.humanRatio" label="人群频率 <" clearable type="number" stack-label
                         label-color="primary"/>
            </div>
            <div class="col">
                <q-select v-model="searchParams.mutationType" clearable :options='["All", "SNP", "INDEL"]'
                          label="突变类型" stack-label label-color="primary"/>
            </div>
            <div class="col">
                <q-select v-model="searchParams.mutationPosition" clearable multiple
                          :options='["exonic", "intronic", "intergenic"]' label="突变位置" stack-label
                          label-color="primary"/>
            </div>
            <div class="col">
                <q-select
                    clearable
                    v-model="searchParams.mutationMeaning"
                    dense stack-label label-color="primary"
                    :options='["All", "No synonymous SNV"]'
                    label="突变意义"
                />
            </div>
            <div class="q-gutter-md text-center q-py-sm">
                <q-btn color="primary" label="确定" icon="search" @click="refreshPage()"/>
                <q-btn color="grey" label="清除" icon="delete" @click="refreshPage()"/>
            </div>
        </div>

        <div class="col-8">
            <div class="q-py-md text-primary text-bold text-h6">肿瘤突变负荷</div>
            <GuageChartVue/>
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
import {ref, onMounted} from "vue";
import {readTaskFile} from "src/api/task";
import {useRoute} from 'vue-router'
import {getCsvData} from "src/utils/csv";
import GuageChartVue from "./GuageChart.vue";

const route = useRoute()
const dlgVisible = ref(false)
const searchParams = ref({
    tumorDepth: null,
    compareDepth: null,
    tumorRatio: null,
    compareRatio: null,
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    humanRatio: null
})

const props = defineProps({
    intro: {
        type: String,
        required: false
    }
})

onMounted(() => {
    readTaskFile(route.params.id, 'TMB/filter.txt').then(res => {
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

        const lines = getCsvData(res, {hasHeaderLine: false})

        searchParams.value = {
            tumorDepth: Number(lines[0][1]),
            compareDepth: Number(lines[1][1]),
            tumorRatio: Number(lines[2][1]),
            compareRatio: Number(lines[3][1]),
            mutationType: lines[5][1],
            mutationPosition: lines[6][1].split(','),
            mutationMeaning: lines[7][1],
            humanRatio: lines[8][1]
        }
    })
})
</script>

<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明</q-btn
    >
    <div class="q-py-md">
        同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍
    </div>
    <div class="q-py-md">HRD 统计表</div>
    <div class="q-py-md">
        <GuageChartVue />
    </div>
    <div class="q-py-md">
        <div class="row q-gutter-sm">
            <div class="col"><img src="" alt="" style="width:100%;height:300px" /></div>
            <div class="col"><img src="" alt="" style="width:100%;height:300px" /></div>
            <div class="col"><img src="" alt="" style="width:100%;height:300px" /></div>
        </div>
    </div>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">质控解读</q-bar>
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
import { ref, onMounted } from "vue";
import GuageChartVue from "./GuageChart.vue";
const dlgVisible = ref(false)
const props = defineProps({
    intro: {
        type: String,
        required: false
    }
})
</script>

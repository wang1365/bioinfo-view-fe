<template>
    <div class="q-py-md">同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍同源重组缺陷分析结果介绍</div>
    <div class="q-py-md">
        HRD 统计表
    </div>
    <div class="q-py-md">
        <GuageChartVue />
    </div>
    <div class="q-py-md">
        <div class="row q-gutter-sm">
            <div class="col"><img src="" alt="" style="width:100%;height:300px"></div>
            <div class="col"><img src="" alt="" style="width:100%;height:300px"></div>
            <div class="col"><img src="" alt="" style="width:100%;height:300px"></div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import GuageChartVue from "./GuageChart.vue";
</script>
<template>
    <div class="q-py-md">肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍</div>
    <div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-input dense label="基因搜索:" clearable />
            </div>
            <div class="col">
                <q-input dense label="肿瘤深度 >" clearable type="number" />
            </div>
            <div class="col">
                <q-input dense label="对照深度 >" clearable type="number" />
            </div>
            <div class="col">
                <q-input dense label="肿瘤频率 >" clearable type="number" />
            </div>
            <div class="col">
                <q-input dense label="对照频率 >" clearable type="number" />
            </div>
            <div class="col">
                <q-input dense label="人群频率 <" clearable type="number" />
            </div>
        </div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-select clearable dense :options='["All", "SNP", "INDEL"]' label="突变类型" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["All", "Exonic", "Intronic", "Intergenic"]' label="突变位置" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["All", "Missense", "Frameshift", "Stopgain", "Stoploss"]'
                    label="突变意义" />
            </div>

        </div>
        <div class="q-gutter-md text-center q-py-sm">
            <q-btn color="primary" label="确定" icon="search" @click="refreshPage()" />
            <q-btn color="grey" label="清除" icon="delete" @click="refreshPage()" />
        </div>
    </div>
    <div class="q-py-md">图表数据</div>
    <div>
        <GuageChartVue />
    </div>

</template>
<script setup>
import { ref, onMounted } from "vue";
import GuageChartVue from "./GuageChart.vue";
</script>
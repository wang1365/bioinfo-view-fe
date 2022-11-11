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
        肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍肿瘤突变负荷分析结果介绍
    </div>
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
                <q-select
                    clearable
                    dense
                    :options='["All", "Missense", "Frameshift", "Stopgain", "Stoploss"]'
                    label="突变意义"
                />
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

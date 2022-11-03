<template>
    <div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-input dense label="基因搜索:" clearable />
            </div>
            <div class="col">
                <q-input dense label="深度 >" clearable type="number" />
            </div>
            <div class="col">
                <q-input dense label="频率 >" clearable type="number" />
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
            <div class="col">
                <q-select clearable dense :options='["All", "Benign", "not_provided"]' label="突变危险" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["D", "T", "点"]' label="SIFT_p" />
            </div>
        </div>
        <div class="q-gutter-md text-center q-py-sm">
            <q-btn color="primary" label="确定" icon="search" @click="refreshPage()" />
            <q-btn color="grey" label="清除" icon="delete" @click="refreshPage()" />
        </div>
    </div>
    <div class="bio-data-table q-py-sm">
        <table>
            <thead>
                <tr>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td @click="showColumn = true;" class="cursor-pointer">数据</td>
                    <td @click="showColumn = true;" class="cursor-pointer">数据</td>
                    <td @click="showColumn = true;" class="cursor-pointer">数据</td>
                    <td @click="showColumn = true;" class="cursor-pointer">数据</td>
                    <td @click="showColumn = true;" class="cursor-pointer">数据</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="q-py-sm" v-if="!showColumn">
        <div class="row q-gutter-sm">
            <div class="col">
                <BarChartVue />
            </div>
            <div class="col">
                <PieChartVue />
            </div>
        </div>
        <div class="row q-gutter-sm q-py-sm">
            <div class="col">
                <BubbleChartVue />
            </div>
            <div class="col">
                <RoseChartVue />
            </div>
            <div class="col">
                <RoseChartVue />
            </div>
        </div>
    </div>
    <div class="q-py-sm" v-if="showColumn">
        <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
            :breakpoint="0">
            <q-tab name="突变信息" label="突变信息" />
            <q-tab name="药物关联信息" label="药物关联信息" />

        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="突变信息">
                <div class="row q-gutter-xs">
                    <div class="col" style="border-right:solid 1px black">数据</div>
                    <div class="col" style="border-right:solid 1px black">数据</div>
                    <div class="col" style="border-right:solid 1px black">数据</div>
                    <div class="col">
                        <RadarChartVue />
                    </div>
                </div>
            </q-tab-panel>
            <q-tab-panel name="药物关联信息">
                <div>
                    药物关联信息描述药物关联信息描述药物关联信息描述药物关联信息描述药物关联信息描述
                </div>
                <div class="bio-data-table q-py-sm">
                    <table>
                        <thead>
                            <tr>
                                <td>数据</td>
                                <td>数据</td>
                                <td>数据</td>
                                <td>数据</td>
                                <td>数据</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>数据</td>
                                <td>数据</td>
                                <td>数据</td>
                                <td>数据</td>
                                <td>数据</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import BarChartVue from "./SomaticInfoCharts/BarChart.vue"
import PieChartVue from "./SomaticInfoCharts/PieChart.vue"
import RoseChartVue from "./SomaticInfoCharts/RoseChart.vue"
import BubbleChartVue from "./SomaticInfoCharts/BubbleChart.vue"
import RadarChartVue from "./SomaticColumnCharts/RadarChart.vue"

const tab = ref('突变信息')
const showColumn = ref(false)

const refreshPage = () => {
    showColumn.value = false
}
</script>
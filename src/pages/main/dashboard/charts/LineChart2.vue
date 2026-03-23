<template>
    <q-card class="dashboard-chart-card" flat>
        <div ref="linechart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch } from "vue";
import { useApi } from "src/api/apiBase";
import { useI18n } from "vue-i18n";

import { storeToRefs } from 'pinia'
import { globalStore } from 'src/stores/global'
const store = globalStore()
const { langCode } = storeToRefs(store)

const { t } = useI18n();
const { apiGet } = useApi()

const echarts = require("echarts");
const chart = ref(null);
const linechart = ref(null);


onMounted(() => {
    init();
});
const init = () => {
    apiGet('account/summary', (res) => {
        console.log(res)
        let data = []
        let values = []
        for (const item of res.data) {

            data.push(item.month.substr(0, 7))
            values.push(item.count)
        }
        const colors = ["#5470C6", "#EE6666"];

        const option = {
            color: colors,
            tooltip: {
                trigger: "none",
                axisPointer: {
                    type: "cross",
                },
            },
            legend: {},
            grid: {
                top: 70,
                bottom: 50,
            },
            xAxis: [
                {
                    type: "category",

                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: colors[0],
                        },
                    },

                    // prettier-ignore
                    data: data,
                },
            ],
            yAxis: [
                {
                    type: "value",
                },
            ],
            series: [
                {
                    name: t('DashboardUsersRegist'),
                    type: "line",
                    smooth: true,
                    emphasis: {
                        focus: "series",
                    },
                    data: values,
                },
            ],
        };
        let ct = linechart.value;
        echarts.dispose(ct);
        chart.value = markRaw(echarts.init(ct));
        chart.value.setOption(option);
    })
};
const onResize = () => {
    if (chart.value)
        chart.value.resize();
};
watch(langCode, lc => {
    init()
})
</script>

<style lang="scss" scoped>
.dashboard-chart-card {
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(210, 219, 233, 0.7);
    box-shadow: 0 14px 40px rgba(17, 38, 68, 0.08);
}
</style>

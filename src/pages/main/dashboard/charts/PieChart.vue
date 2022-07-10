<template>
    <q-card>
        <div ref="piechart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch } from "vue";

const echarts = require("echarts");
const chart = ref(null);
const piechart = ref(null);

onMounted(() => {
    init();
});
const init = () => {
    let ct = piechart.value;
    echarts.dispose(ct);
    chart.value = markRaw(echarts.init(ct));
    chart.value.setOption({
        title: {
            text: "内存占用情况",
            subtext: "单位 G",
            left: "center",
        },
        tooltip: {
            trigger: "item",
        },
        legend: {
            orient: "vertical",
            left: "left",
        },
        series: [
            {
                name: "内存",
                type: "pie",
                radius: "50%",
                data: [
                    { value: 100, name: "剩余内存" },
                    { value: 28, name: "当前占用" },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                },
            },
        ],
    });
};
const onResize = () => {
    chart.value.resize();
};
</script>

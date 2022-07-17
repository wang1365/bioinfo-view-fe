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
            text: "用户使用磁盘情况",
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
                name: "磁盘",
                type: "pie",
                radius: "50%",
                data: [
                    { value: 300, name: "用户1" },
                    { value: 388, name: "用户2" },
                    { value: 100, name: "用户3" },
                    { value: 418, name: "用户4" },
                    { value: 510, name: "用户5" },
                    { value: 588, name: "用户6" },
                    { value: 600, name: "用户7" },
                    { value: 188, name: "用户8" },
                    { value: 400, name: "用户9" },
                    { value: 388, name: "用户10" },
                    { value: 200, name: "用户11" },
                    { value: 888, name: "用户12" },
                    { value: 900, name: "用户13" },
                    { value: 88, name: "用户14" },
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

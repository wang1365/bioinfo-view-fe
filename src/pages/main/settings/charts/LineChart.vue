<template>
    <q-card>
        <div ref="linechart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch } from "vue";

const echarts = require("echarts");
const chart = ref(null);
const linechart = ref(null);

onMounted(() => {
    init();
});
const init = () => {
    const colors = ["#5470C6", "#EE6666"];
    let now = new Date();
    let nowMinutes = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes()
    ).getTime();
    console.log(nowMinutes);
    let data = [];
    for (let i = 0; i < 50; i++) {
        let newDate = new Date(nowMinutes - i * 10 * 1000);
        data.push(
            newDate.getHours() +
                ":" +
                newDate.getMinutes() +
                ":" +
                newDate.getSeconds()
        );
    }
    console.log(data);
    let values = [
        16.1, 18.7, 18.4, 18.7, 18.4, 18.7, 19.1, 19.7, 20.7, 25.9, 36.4, 26.7,
        18.4, 18.7, 18.4, 18.7, 18.4, 16.7, 15.4, 14.7, 18.4, 27.7, 49.4, 59.4,
        55.7, 35.4, 38.7, 35.4, 20.7, 18.4, 17.4, 20.7, 20.5, 19.9, 17, 16, 10,
        11, 11.5, 14, 15, 14, 16, 14, 18, 19, 26, 24, 23, 29, 20,
    ];
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
                name: "CPU 使用率",
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
};
const onResize = () => {
    chart.value.resize();
};
</script>

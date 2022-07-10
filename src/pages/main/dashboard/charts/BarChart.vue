<template>
    <q-card>
        <div ref="barchart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch } from "vue";

const echarts = require("echarts");
const chart = ref(null);
const barchart = ref(null);

onMounted(() => {
    init();
});

const init = () => {
    let ct = barchart.value;
    echarts.dispose(ct);
    chart.value = markRaw(echarts.init(ct));
    chart.value.setOption({
        xAxis: {
            type: "category",
            data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
            type: "value",
        },
        series: [
            {
                data: [120, 200, 150, 80, 70, 110, 130],
                type: "bar",
            },
        ],
    });
};
const onResize = () => {
    chart.value.resize();
};
</script>

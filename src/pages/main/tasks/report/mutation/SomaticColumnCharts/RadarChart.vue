<template>
    <q-card>
        <div ref="barchart" style="height: 400px"></div>
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
        title: {
            text: 'Multiple Radar'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            left: 'center',
            data: [
                'A Software',
                'A Phone',
                'Another Phone',
                'Precipitation',
                'Evaporation'
            ]
        },
        radar: [
            {
                indicator: [
                    { text: 'Brand', max: 100 },
                    { text: 'Content', max: 100 },
                    { text: 'Usability', max: 100 },
                    { text: 'Function', max: 100 }
                ],
                center: ['50%', '50%'],
                radius: 80
            }
        ],
        series: [
            {
                type: 'radar',
                tooltip: {
                    trigger: 'item'
                },
                areaStyle: {},
                data: [
                    {
                        value: [60, 73, 85, 40],
                        name: 'A Software'
                    }
                ]
            }

        ]
    });
};
const onResize = () => {
    chart.value.resize();
};
</script>

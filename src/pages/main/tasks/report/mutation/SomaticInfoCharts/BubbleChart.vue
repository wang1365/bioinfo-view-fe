<template>
    <q-card>
        <div ref="piechart" style="height: 400px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch } from "vue";

const echarts = require("echarts");
const chart = ref(null);
const piechart = ref(null);

const props = defineProps({
    data: {
        type: Array,
        required: false,
        default: () => []
    }
})
onMounted(() => {
    init();
});
const init = () => {
    let ct = piechart.value;
    echarts.dispose(ct);
    chart.value = markRaw(echarts.init(ct));
    const data = [
        [
            [28604, 10, 17096869, 'Australia', 1990],
            [31163, 10, 27662440, 'Canada', 1990],
            [1516, 10, 1154605773, 'China', 1990],
            [13670, 10, 10582082, 'Cuba', 1990],
            [28599, 10, 4986705, 'Finland', 1990],
            [29476, 10, 56943299, 'France', 1990],
            [31476, 10, 78958237, 'Germany', 1990],
            [28666, 10, 254830, 'Iceland', 1990],
            [1777, 10, 870601776, 'India', 1990],
            [29550, 10, 122249285, 'Japan', 1990],
            [2076, 10, 20194354, 'North Korea', 1990],
            [12087, 10, 42972254, 'South Korea', 1990],
            [24021, 10, 3397534, 'New Zealand', 1990],
            [43296, 10, 4240375, 'Norway', 1990],
            [10088, 10, 38195258, 'Poland', 1990],
            [19349, 10, 147568552, 'Russia', 1990],
            [10670, 10, 53994605, 'Turkey', 1990],
            [26424, 10, 57110117, 'United Kingdom', 1990],
            [37062, 10, 252847810, 'United States', 1990]
        ],
        [
            [44056, 30, 23968973, 'Australia', 2015],
            [43294, 30, 35939927, 'Canada', 2015],
            [13334, 30, 1376048943, 'China', 2015],
            [21291, 30, 11389562, 'Cuba', 2015],
            [38923, 30, 5503457, 'Finland', 2015],
            [37599, 30, 64395345, 'France', 2015],
            [44053, 30, 80688545, 'Germany', 2015],
            [42182, 30, 329425, 'Iceland', 2015],
            [5903, 30, 1311050527, 'India', 2015],
            [36162, 30, 126573481, 'Japan', 2015],
            [1390, 30, 25155317, 'North Korea', 2015],
            [34644, 30, 50293439, 'South Korea', 2015],
            [34186, 30, 4528526, 'New Zealand', 2015],
            [64304, 30, 5210967, 'Norway', 2015],
            [24787, 30, 38611794, 'Poland', 2015],
            [23038, 30, 143456918, 'Russia', 2015],
            [19360, 30, 78665830, 'Turkey', 2015],
            [38225, 30, 64715810, 'United Kingdom', 2015],
            [53354, 50, 0, 'United States', 2015]
        ]
    ];
    chart.value.setOption({

        title: {
            text: 'Life Expectancy and GDP by Country',
            left: '5%',
            top: '3%'
        },
        legend: {
            right: '10%',
            top: '3%',
            data: ['1990', '2015']
        },
        grid: {
            left: '8%',
            top: '10%'
        },
        xAxis: {
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            },
            scale: true
        },
        series: [
            {
                name: '1990',
                data: data[0],
                type: 'scatter',
                symbolSize: function (data) {
                    return Math.sqrt(data[2]) / 5e2;
                },
                emphasis: {
                    focus: 'series',
                    label: {
                        show: true,
                        formatter: function (param) {
                            return param.data[3];
                        },
                        position: 'top'
                    }
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(120, 36, 50, 0.5)',
                    shadowOffsetY: 5,
                    color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                        {
                            offset: 0,
                            color: 'rgb(251, 118, 123)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(204, 46, 72)'
                        }
                    ])
                }
            },
            {
                name: '2015',
                data: data[1],
                type: 'scatter',
                symbolSize: function (data) {
                    return Math.sqrt(data[2]) / 5e2;
                },
                emphasis: {
                    focus: 'series',
                    label: {
                        show: true,
                        formatter: function (param) {
                            return param.data[3];
                        },
                        position: 'top'
                    }
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(25, 100, 150, 0.5)',
                    shadowOffsetY: 5,
                    color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                        {
                            offset: 0,
                            color: 'rgb(129, 227, 238)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(25, 183, 207)'
                        }
                    ])
                }
            }
        ]
    });
};
const onResize = () => {
    chart.value.resize();
};
</script>

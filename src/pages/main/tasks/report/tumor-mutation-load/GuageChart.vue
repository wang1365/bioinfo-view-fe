<template>
    <q-card>
        <div ref="barchart" style="height: 400px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch, toRefs } from 'vue'

const echarts = require('echarts')
const chart = ref(null)
const barchart = ref(null)

const props = defineProps({
    tmb: {
        type: Number,
        required: true,
    },
    maxTmb: {
        type: Number,
        required: true,
    },
    showSticky: {
        type: Boolean,
        required: false,
        default: () => false,
    },
})

const { tmb } = toRefs(props)

const option = {
    series: [
        {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '75%'],
            radius: '90%',
            min: 0,
            max: 100,
            splitNumber: 10,
            axisLine: {
                lineStyle: {
                    width: 6,
                    color: [
                        [0.1, 'green'],
                        // [0.25, '#7CFFB2'],
                        // [1, '#7CFFB2'],

                        [70, '#FF6E76'],
                    ],
                },
            },
            pointer: {
                icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                length: '12%',
                width: 20,
                offsetCenter: [0, '-60%'],
                itemStyle: {
                    color: 'auto',
                },
            },
            axisTick: {
                length: 12,
                lineStyle: {
                    color: 'auto',
                    width: 2,
                },
            },
            splitLine: {
                length: 20,
                lineStyle: {
                    color: 'auto',
                    width: 5,
                },
            },
            axisLabel: {
                color: '#464646',
                fontSize: 20,
                distance: -160,
                rotate: 'tangential',
                formatter: function (value) {
                    if (value === 0.875) {
                        return 'TMB hign'
                    } else if (value === 0.125) {
                        return 'TMB low'
                    }
                    return ''
                },
            },
            title: {
                offsetCenter: [0, '-10%'],
                fontSize: 20,
            },
            detail: {
                fontSize: 30,
                offsetCenter: [0, '-35%'],
                valueAnimation: true,
                formatter: function (value) {
                    return value
                },
                color: 'auto',
            },
            data: [
                {
                    value: tmb,
                    name: 'Mutation/MB',
                },
            ],
        },
    ],
}

onMounted(() => {
    init()
})

watch(tmb, (v) => {
    if (chart.value) {
        option.series[0].data[0].value = v
        chart.value.setOption(option)
    }
})

const init = () => {
    let ct = barchart.value
    echarts.dispose(ct)
    chart.value = markRaw(echarts.init(ct))
    chart.value.setOption(option)
}

const onResize = () => {
    if (chart.value) {
        chart.value.resize()
    }
}
</script>

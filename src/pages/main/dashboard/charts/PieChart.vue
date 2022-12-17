<template>
    <q-card>
        <div ref="piechart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, onUpdated, ref, watch } from 'vue'

const echarts = require('echarts')
const chart = ref(null)
const piechart = ref(null)

const props = defineProps({
    total: {
        type: Number,
        required: false,
        default: 0,
    },
    used: {
        type: Number,
        required: false,
        default: 0,
    },
})
onMounted(() => {
    init()
})
onUpdated(() => {
    init()
})
const init = () => {
    let ct = piechart.value
    echarts.dispose(ct)
    chart.value = markRaw(echarts.init(ct))
    chart.value.setOption({
        title: {
            text: `内存占用情况, 总共 ${props.total}G`,
            subtext: '单位 G',
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
        },
        series: [
            {
                name: '内存',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: props.total - props.used, name: '剩余内存' },
                    { value: props.used, name: '当前占用' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    })
}
const onResize = () => {
    if (chart.value)
        chart.value.resize()
}
</script>

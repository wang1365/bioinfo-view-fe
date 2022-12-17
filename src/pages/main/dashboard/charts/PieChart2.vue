<template>
    <q-card>
        <div ref="piechart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch, defineProps, onUpdated } from 'vue'

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

onUpdated(() => {
    init()
})
onMounted(() => {
    init()
})
const init = () => {
    let ct = piechart.value
    echarts.dispose(ct)
    chart.value = markRaw(echarts.init(ct))
    chart.value.setOption({
        title: {
            text: `磁盘使用情况, 总空间 ${props.total}T`,
            subtext: '单位 T',
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
                name: '磁盘',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: (props.total - props.used).toFixed(3), name: '剩余空间' },
                    { value: props.used, name: '已经使用' },
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

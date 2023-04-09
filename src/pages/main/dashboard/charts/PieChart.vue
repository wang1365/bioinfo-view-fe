<template>
    <q-card>
        <div ref="piechart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, onUpdated, ref, watch } from 'vue'
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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
            text: `${t('Memory')}, ${t('TotalCount')} ${props.total}G`,
            subtext: `${t('Unit')} G`,
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
                name: t('Memory'),
                type: 'pie',
                radius: '50%',
                data: [
                    { value: props.total - props.used, name: t('DashboardFree') },
                    { value: props.used, name: t('DashboardUsed') },
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

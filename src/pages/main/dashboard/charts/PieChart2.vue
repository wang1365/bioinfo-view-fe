<template>
    <q-card class="dashboard-chart-card" flat>
        <div ref="piechart" style="height: 300px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, onUpdated, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { globalStore } from 'src/stores/global'

const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n()
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
    const ct = piechart.value
    echarts.dispose(ct)
    chart.value = markRaw(echarts.init(ct))
    chart.value.setOption({
        title: {
            text: t('DashboardDiskUsageTitle'),
            left: 'center',
            top: 18,
            textStyle: {
                fontSize: 16,
                fontWeight: 700,
                color: '#374151',
            },
        },
        graphic: [
            {
                type: 'text',
                left: 'center',
                top: '60%',
                z: 20,
                style: {
                    text: `{value|${props.total}T}\n{name|${t('DashboardTotalLabel')}}`,
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    rich: {
                        value: {
                            fontSize: 20,
                            fontWeight: 700,
                            fill: '#374151',
                            lineHeight: 26,
                        },
                        name: {
                            fontSize: 12,
                            fill: '#7b8794',
                            lineHeight: 18,
                        },
                    },
                },
            },
        ],
        tooltip: {
            trigger: 'item',
        },
        legend: {
            orient: 'horizontal',
            left: 'center',
            top: 48,
            itemWidth: 14,
            itemHeight: 14,
            textStyle: {
                color: '#4b5563',
                fontSize: 12,
            },
        },
        series: [
            {
                name: t('Disk'),
                type: 'pie',
                radius: ['44%', '70%'],
                center: ['50%', '60%'],
                avoidLabelOverlap: true,
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                },
                data: [
                    { value: (props.total - props.used).toFixed(3), name: t('DashboardFree'), itemStyle: { color: '#9bbd8a' } },
                    { value: props.used, name: t('DashboardUsed'), itemStyle: { color: '#c98b8b' } },
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
    if (chart.value) chart.value.resize()
}

watch(langCode, () => {
    init()
})
</script>

<style lang="scss" scoped>
.dashboard-chart-card {
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(210, 219, 233, 0.7);
    box-shadow: 0 14px 40px rgba(17, 38, 68, 0.08);
}
</style>

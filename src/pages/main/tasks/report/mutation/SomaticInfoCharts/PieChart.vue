<template>
    <q-card>
        <div ref="piechart" style="height: 400px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import {markRaw, onMounted, ref, watch, toRefs, computed} from "vue";
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const props = defineProps({
    data: {
        type: Array,
        required: false,
        default: () => []
    },
    titleKey: {
        type: String,
        required: false,
        default: () => ''
    }
})

const chart = ref(null);
const piechart = ref(null);
const option = ref({
    title: {
      text: computed(() => t(props.titleKey))
    },
    tooltip: {
        trigger: "item",
    },
    legend: {
        orient: "horizontal",
        bottom: "5%",
    },
    toolbox: {
        show: true,
        feature: {
            mark: {show: true},
            dataView: {show: true, readOnly: false},
            saveAsImage: {show: true}
        }
    },
    series: [
        {
            name: "",
            type: "pie",
            radius: "50%",
            data: [
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
})


const { data } = toRefs(props)

onMounted(() => {
    init();
});

watch(data, () => {
    refreshChart()
})
watch(locale, () => refreshChart() )

const refreshChart = () => {
    const snp = ['A','T','C','G']
    // snp筛选
    const snpCount = data.value.filter(t => snp.includes(t.col4) && snp.includes(t.col5)).length
    const indelCount = data.value.length - snpCount

    option.value.series[0].data = []
    if (snpCount > 0) {
        option.value.series[0].data.push({value:snpCount, name: 'SNP'})
    }
    if (indelCount > 0) {
        option.value.series[0].data.push({value:indelCount, name: 'INDEL'})
    }
    chart.value.setOption(option.value)
}

const init = () => {
    let ct = piechart.value;
    echarts.dispose(ct);
    chart.value = markRaw(echarts.init(ct));
    refreshChart()
};
const onResize = () => {
    chart.value.resize();
};
</script>

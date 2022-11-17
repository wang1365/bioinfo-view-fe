<template>
    <q-card>
        <div ref="piechart" style="height: 400px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch, toRefs } from "vue";


const echarts = require("echarts");
const chart = ref(null);
const piechart = ref(null);
const option = ref({
    title: {
      text: '突变类型统计'
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
                { value: 100, name: "SNP" },
                { value: 28, name: "INDEL" },
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

const props = defineProps({
    data: {
        type: Array,
        required: false,
        default: () => []
    }
})

const { data } = toRefs(props)

onMounted(() => {
    init();
});

watch(data, () => {
    refreshChart()
})

const refreshChart = () => {
    const snp = ['A','T','C','G']
    // snp筛选
    const snpCount = data.value.filter(t => snp.includes(t.col4) && snp.includes(t.col5)).length
    const indelCount = data.value.length - snpCount

    option.value.series[0].data[0].value = snpCount
    option.value.series[0].data[1].value = indelCount
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

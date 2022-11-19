<template>
    <q-card>
        <div ref="barchart" style="height: 400px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import { markRaw, onMounted, ref, watch, toRefs } from "vue";
import * as _ from 'lodash'
import * as echarts from 'echarts'

const chart = ref(null);
const barchart = ref(null);

const props = defineProps({
    data: {
        type: Array,
        required: false,
        default: () => { return [] }
    }
})

const { data } = toRefs(props)

const option = ref({
    title: {
      text: 'SNP统计'
    },
    xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
            rotate: 45,
            interval: 0
        }
    },
    yAxis: {
        type: 'value'
    },
    label: {
      show: true
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
            data: [],
            type: 'bar'
        }
    ]
})

watch(data, v => {
    refreshChart()
})

const refreshChart = () => {
    const snp = ['A','T','C','G']
    // snp筛选
    const filteredData = data.value.filter(t => snp.includes(t.col4) && snp.includes(t.col5))
    // 补充x轴标签
    filteredData.forEach( t => t.xLable = `${t.col4}->${t.col5}`)
    // 分组统计
    const result = _.countBy(filteredData, t => t.xLable)

    console.log('bar char ===>', data.value, filteredData, result)

    option.value.xAxis.data = Object.keys(result)
    option.value.series[0].data = Object.values(result)
    chart.value.setOption(option.value)
}

onMounted(() => {
    init();
});

const init = () => {
    let ct = barchart.value;
    echarts.dispose(ct);
    chart.value = markRaw(echarts.init(ct));

    refreshChart()
};

const onResize = () => {
    chart.value.resize();
};
</script>

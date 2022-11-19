<template>
    <div>
        <div ref="barchart" style="height: 400px; width: 600px"></div>
        <q-resize-observer @resize="onResize"/>
    </div>
</template>

<script setup>
import {markRaw, onMounted, ref, watch, toRefs} from "vue";
import * as echarts from 'echarts'

const chart = ref(null);
const barchart = ref(null);
const option = ref({
    title: {
        text: '非同义突变检测'
    },
    tooltip: {
        trigger: 'axis'
    },
    radar: [
        {
            indicator: [
                {text: 'SIFT', max: 1},
                {text: 'LRT', max: 1},
                {text: 'MutationTaster', max: 1},
                {text: 'MutationAssessor', max: 1},
                {text: 'FATHMM', max: 1}
            ],
            // center: ['50%', '50%'],
            // radius: 80
        }
    ],
    series: [
        {
            type: 'radar',
            tooltip: {
                trigger: 'item'
            },
            data: [
                {
                    value: [],
                    name: '非同义突变'
                }
            ]
        }

    ]
})

const props = defineProps({
    data: {
        type: Object,
        require: false,
        default: () => {
        }
    }
})

const {data} = toRefs(props)

watch(data, v => {
    refresh()
})

onMounted(() => {
    console.log('radar onMounted')
    init();
});

const init = () => {
    let ct = barchart.value;
    echarts.dispose(ct);
    chart.value = markRaw(echarts.init(ct));
    refresh()
};

const refresh = () => {
    let {col54, col60, col63, col66, col69} = data.value
    col54 = col54 === '.' ? 0 : 1 - Number(col54)
    col60 = col60 === '.' ? 0 : Number(col60)
    col63 = col63 === '.' ? 0 : Number(col63)
    col66 = col66 === '.' ? 0 : Math.abs(Number(col66))
    col69 = col69 === '.' ? 0 : Math.abs(Number(col69))

    option.value.series[0].data = [{
        value: [col54, col60, col63, col66, col69],
        name: '非同义突变'
    }]

    chart.value.setOption(option.value);
}
const onResize = () => {
    chart.value.resize();
};
</script>

<template>
    <div class="row">
        <div class="col-10" ref="barchart" style="height: 400px; width: 550px"></div>
        <div class="col-2">
            <div v-for="(item, i) in vs" :key="i">
                <q-input
                    :label="vsLabels[i]"
                    :model-value="item ? item : '-'"
                    readonly
                    label-color="primary"
                    stack-label
                    prefix=" "
                ></q-input>
            </div>
        </div>
    </div>
    <q-resize-observer @resize="onResize" />
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

const vsLabels = ['SIFT', 'LRT', 'MutationTaster', 'MutationAssessor', 'FATHMM',]
const vs = ref([])

const props = defineProps({
    data: {
        type: Object,
        require: false,
        default: () => {
        }
    },
    isGermline: {
        type: Boolean,
        required: false,
        default: () => true
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
    let colKeys = props.isGermline ? ['col55', 'col61', 'col63', 'col67', 'col70'] : ['col59', 'col65', 'col68', 'col71', 'co74']
    const v1 = data.value[colKeys[0]] === '.' ? 0 : Number(data.value[colKeys[0]])
    const v2 = data.value[colKeys[1]] === '.' ? 0 : Number(data.value[colKeys[1]])
    const v3 = data.value[colKeys[2]] === '.' ? 0 : Number(data.value[colKeys[2]])
    const v4 = data.value[colKeys[3]] === '.' ? 0 : Number(data.value[colKeys[3]])
    const v5 = data.value[colKeys[4]] === '.' ? 0 : Number(data.value[colKeys[4]])

    const serialData = [v1, v2, v3, v4, v5]
    vs.value = serialData
    console.log('radar dat', serialData, colKeys, props.isGermline)

    option.value.series[0].data = [{
        value: serialData,
        name: '非同义突变'
    }]

    chart.value.setOption(option.value);
}
const onResize = () => {
    chart.value.resize();
};
</script>

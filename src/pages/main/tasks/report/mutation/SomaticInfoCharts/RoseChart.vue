<template>
    <q-card>
        <div ref="piechart" style="height: 400px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import {markRaw, onMounted, ref, watch, toRefs, computed} from "vue";
import * as echarts from 'echarts'
import * as _ from 'lodash'

const chart = ref(null);
const piechart = ref(null);


const props = defineProps({
    data: {
        type: Array,
        required: false,
        default: () => []
    },
    colKey: {
        type: String,
        required: false,
        default: () => ''
    },
    title: {
        type: String,
        required: false,
        default: () => ''
    }
})

const option = ref({
    title: {
        text: props.title
    },
    legend: {
        show: false,
        top: 'bottom'
    },
    toolbox: {
        show: true,
        feature: {
            mark: {show: true},
            dataView: {show: true, readOnly: false},
            saveAsImage: {show: true}
        }
    },
    tooltip: [
        {
            trigger: 'item'
        }
    ],
    series: [
        {
            name: props.title,
            type: 'pie',
            radius: [30, 120],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            roseType: 'radius',
            itemStyle: {
                borderRadius: 5
            },
            label: {
                show: true,
                overflow: 'truncate',
            },
            data: []
        }
    ]
})


const {data} = toRefs(props)

watch(data, () => {
    refreshChart()
})

onMounted(() => {
    init();
});

const refreshChart = () => {
    let result = _.countBy(data.value, t => t[props.colKey])
    console.log('======result', result, props.colKey, data.value)


    const items = Object.keys(result).map(k => {
        return {name: k, value: result[k]}
    })

    const dt = _.max(items.map(t => t.value))/2

    console.log('======items', items, dt)
    const displayData = items.map(t => {
        t.value += dt;
        return t
    })

    option.value.series[0].data = displayData
    // console.log('======option.value', displayData, dt)

    chart.value.setOption(option.value);
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

<template>
    <div>
        <q-resize-observer @resize="onResize" />
        <div ref="barchart" style="height: 260px; width: 280px"></div>
        <div class="column" style="font-size: 12px">
            <div class="row">
                <div class="col"><span class="text-primary">SIF: </span>{{props.record.SIFT_converted_rankscore}}</div>
                <div class="col"><span class="text-primary">LRT: </span>{{props.record.LRT_converted_rankscore}}</div>
                <div class="col">
                    <span class="text-primary">FATHMM: </span>{{props.record.FATHMM_converted_rankscore}}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <span class="text-primary">MutationTaster: </span
                    >{{props.record.MutationTaster_converted_rankscore}}
                </div>
                <div class="col">
                    <span class="text-primary">MutationAssessor: </span>{{props.record.MutationAssessor_rankscore}}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {markRaw, onMounted, ref, watch, toRefs, computed} from "vue";
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const chart = ref(null);
const barchart = ref(null);
const option = ref({
    title: {
        text: computed(() => t(props.titleKey))
    },
    radar: [
        {
            indicator: [
                {text: 'SIFT', max: 1},
                {text: 'LRT', min: 0, max: 1}, // -16.13 - 10.64
                {text: 'MutationTaster', max: 1},
                {text: 'MutationAssessor', min: 0, max: 1}, // -5.135 - 6.49
                {text: 'FATHMM', max: 1}
            ],
            axisName: {
                fontSize: 10,
                width:100,
            }
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

const vs = ref([])

const props = defineProps({
    record: {
        type: Object,
        require: false,
        default: () => {
        }
    },
    titleKey: {
        type: String,
        required: false,
        default: ''
    }
})


const {data, isGermline} = toRefs(props)

watch([data, isGermline, locale], () => {
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
    const serialData = [
        props.record.SIFT_converted_rankscore,
        props.record.LRT_converted_rankscore,
        props.record.MutationTaster_converted_rankscore,
        props.record.MutationAssessor_rankscore,
        props.record.FATHMM_converted_rankscore,
    ]
    vs.value = serialData
    console.log('radar dat', serialData)

    option.value.series[0].data = [{
        value: serialData,
        name: '非同义突变'
    }]

    chart.value.setOption(option.value);
}
const onResize = () => {
    if (chart.value) {
        chart.value.resize()
    }
}
</script>

<style scoped></style>

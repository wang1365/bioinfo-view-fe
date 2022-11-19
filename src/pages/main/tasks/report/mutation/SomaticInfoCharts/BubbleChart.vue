<template>
    <q-card>
        <div ref="piechart" style="height: 600px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import {markRaw, onMounted, ref, watch, toRefs} from "vue";
import * as echarts from 'echarts'

const chart = ref(null);
const piechart = ref(null);

const props = defineProps({
    data: {
        type: Array,
        required: false,
        default: () => []
    }
})

const {data} = toRefs(props)

watch(data, () => {
    refresh()
})

const option = ref({
    title: [
        {
            text: '人群频率分布',
        },
        {
            text: 'ExAC_EAS',
            textBaseline: 'middle',
            top: (0.5 * 100) / 3 + '%',
            textStyle: {
                color: 'blue'
            }
        }, {
            text: '1000g2015aug_eas',
            textBaseline: 'middle',
            top: (100) / 3 + 10 + '%',
            textStyle: {
                color: 'green'
            }
        }, {
            text: 'gnomAD_genome_EAS',
            textBaseline: 'middle',
            top: (2 * 100) / 3 + 10 + '%',
            textStyle: {
                color: 'orange'
            }
        }
    ],
    tooltip: {
        position: 'top',
    },
    singleAxis: [
        {
            left: 150,
            type: 'category',
            boundaryGap: false,
            data: [-1, -0.5, ..._.range(0, 1.025, 0.025).map(t => Number(t.toFixed(2)))],
            top: '5%',
            height: 100 / 3 - 10 + '%',
            axisLabel: {
                interval: 1
            }
        }, {
            left: 150,
            type: 'category',
            boundaryGap: false,
            data: [-1, -0.5, ..._.range(0, 1.025, 0.025).map(t => Number(t.toFixed(2)))],
            top: 100 / 3 + 5 + '%',
            height: 100 / 3 - 10 + '%',
            axisLabel: {
                interval: 1
            }
        }, {
            left: 150,
            type: 'category',
            boundaryGap: false,
            data: [-1, -0.5, ..._.range(0, 1.025, 0.025).map(t => Number(t.toFixed(2)))],
            top: 200 / 3 + 5 + '%',
            height: 100 / 3 - 10 + '%',
            axisLabel: {
                interval: 1
            }
        }
    ],
    legend: {
        right: '10%',
        top: '3%',
        data: ['1990', '2015']
    },
    series: [
        {
            name: 'ExAC_EAS',
            data: [],
            type: 'scatter',
            singleAxisIndex: 0,
            coordinateSystem: 'singleAxis',
            symbol: 'circle',
            symbolOffset: [0, 50],
            symbolSize: function (data) {
                let ret = data[1] / 2
                if (ret > 100) {
                    ret = 100
                }
                return ret;
                // return Math.sqrt(data[1])
                // return 10
            },
            tooltip: {
                trigger: 'item',
                formatter: function (param) {
                    // return `${param.data[0]} - ${param.data[1]}`;
                    return `${param.data[1]}`;
                },
                textStyle: {
                    fontSize: 18,
                    fontWight: 'bolder'
                }
            },
            emphasis: {
                focus: 'series',
                label: {
                    show: true,
                    formatter: function (param) {
                        return param.data[3];
                    },
                    position: 'top'
                }
            },
        },
        {
            name: '1000g2015aug_eas',
            data: [],
            type: 'scatter',
            singleAxisIndex: 1,
            symbol: 'circle',
            symbolOffset: [0, 50],
            coordinateSystem: 'singleAxis',
            symbolSize: function (data) {
                let ret = data[1] / 2
                if (ret > 100) {
                    ret = 100
                }
                return ret;
                // return Math.sqrt(data[1])
                // return 10
            },
            tooltip: {
                trigger: 'item',
                formatter: function (param) {
                    // return `${param.data[0]} - ${param.data[1]}`;
                    return `${param.data[1]}`;
                },
                textStyle: {
                    fontSize: 18,
                    fontWight: 'bolder'
                }
            },
            emphasis: {
                focus: 'series',
                label: {
                    show: true,
                    formatter: function (param) {
                        return param.data[3];
                    },
                    position: 'top'
                }
            },
        },
        {
            name: 'gnomAD_genome_EAS',
            data: [],
            type: 'scatter',
            singleAxisIndex: 2,
            symbol: 'circle',
            symbolOffset: [0, 50],
            coordinateSystem: 'singleAxis',
            symbolSize: function (data) {
                let ret = data[1] / 2
                if (ret > 100) {
                    ret = 100
                }
                return ret;
                // return Math.sqrt(data[1])
                // return 10
            },
            tooltip: {
                trigger: 'item',
                formatter: function (param) {
                    // return `${param.data[0]} - ${param.data[1]}`;
                    return `${param.data[1]}`;
                },
                textStyle: {
                    fontSize: 18,
                    fontWight: 'bolder'
                }
            },
            emphasis: {
                focus: 'series',
                label: {
                    show: false,
                    formatter: function (param) {
                        // return `${param.data[0]} - ${param.data[1]}`;
                        return `${param.data[1]}`;
                    },
                    position: 'center'
                }
            },
        },
    ]
})
onMounted(() => {
    init();
});
const init = () => {
    let ct = piechart.value;
    echarts.dispose(ct);
    chart.value = markRaw(echarts.init(ct));

    refresh()
};

const refresh = () => {
    const data1 = groupAndCount('col26')
    const data2 = groupAndCount('col31')
    const data3 = groupAndCount('col39')

    option.value.series[0].data = data1
    option.value.series[1].data = data2
    option.value.series[2].data = data3

    chart.value.setOption(option.value);
}

const groupAndCount = (colName) => {
    // 初始化刻度，第一个刻度为-1，后续为0-20
    const arr = new Array(21)
    arr.fill(0)

    // 数据归纳到刻度
    data.value.forEach(row => {
        const v = row[colName]
        if (v === '.') {
            arr[0] += 1
        } else {
            const ratio = Number(row[colName])
            const idx = Math.floor(ratio / 0.05)
            arr[idx] += 1
        }
    })

    // 构造数据
    // const result = arr.map((v, i) => {
    //     return [Number((-0.05 + 0.05*(i+1)).toFixed(2)), v]
    // })
    // result[0] = [-0.5, result[0][1]]

    const result = [[0, arr[0]], [1, 0]]
    arr.forEach((v, i) => {
        if (i > 0) {
            result.push([i * 2 + 1, v])
            result.push([i * 2 + 2, 0])
        }
    })
    // arr.map((v, i) => [i, v] )
    return result
}

const onResize = () => {
    chart.value.resize();
};
</script>

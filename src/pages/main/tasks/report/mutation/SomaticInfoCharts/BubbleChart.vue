<template>
    <q-card>
        <div ref="piechart" style="height: 400px"></div>
        <q-resize-observer @resize="onResize" />
    </q-card>
</template>

<script setup>
import {markRaw, onMounted, ref, watch, toRefs, computed} from "vue";
import * as echarts from 'echarts'
import { useI18n }from 'vue-i18n'

const { t, locale } = useI18n()
const chart = ref(null);
const piechart = ref(null);
const adjustedData = ref([])

const props = defineProps({
    data: {
        type: Array,
        required: false,
        default: () => []
    },
    colKeys: {
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

const {data} = toRefs(props)

watch(data, () => {
    refresh()
})

watch(locale, () => refresh() )

const option = ref({
    title: [
        {
            text: computed(() => t(props.titleKey))
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
            top: (100) / 3 + 15 + '%',
            textStyle: {
                color: 'green'
            }
        }, {
            text: 'gnomAD_genome_EAS',
            textBaseline: 'middle',
            top: (2 * 100) / 3 + 15 + '%',
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
            data: ['.', -0.5, ..._.range(0, 1.025, 0.025).map(t => Number(t.toFixed(2)))],
            top: '5%',
            height: 100 / 3 - 10 + '%',
            axisLabel: {
                interval: 1
            }
        }, {
            left: 150,
            type: 'category',
            boundaryGap: false,
            data: ['.', -0.5, ..._.range(0, 1.025, 0.025).map(t => Number(t.toFixed(2)))],
            top: 100 / 3 + 5 + '%',
            height: 100 / 3 - 10 + '%',
            axisLabel: {
                interval: 1
            }
        }, {
            left: 150,
            type: 'category',
            boundaryGap: false,
            data: ['.', -0.5, ..._.range(0, 1.025, 0.025).map(t => Number(t.toFixed(2)))],
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
            symbolOffset: [0, 40],
            symbolSize: function (data, {dataIndex}) {
                return adjustedData.value[0][dataIndex]
                // let ret = data[1]
                // return ret;
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
            symbolOffset: [0, 40],
            coordinateSystem: 'singleAxis',
            symbolSize: function (data, {dataIndex}) {
                return adjustedData.value[1][dataIndex]
                // let ret = data[1]
                // return ret;
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
            symbolOffset: [0, 40],
            coordinateSystem: 'singleAxis',
            symbolSize: function (data, {dataIndex}) {
                return adjustedData.value[2][dataIndex]

                // let ret = data[1]
                // if (dataIndex === 0 && ret > 100) {
                //     ret = 100
                // }
                // return ret;
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
    props.colKeys.forEach((key, i) => {
        const result = groupAndCount(props.colKeys[i])
        // 原始数据分布概率
        option.value.series[i].data = result

        // 根据原始数据调整bubble大小
        const mx = _.max(result.map(t => t[1]))
        let scale = 1
        if (mx > 100) {
            // bubble缩小比例
            scale = 100/mx
        }

        // 防止最小bubble过小，设置最小+5
        adjustedData.value[i] = result.map((t, i) => {
            return t[1] === 0 ? 0 : Math.round(t[1] * scale) + 10
        })
    })

    chart.value.setOption(option.value);
}

const groupAndCount = (colName) => {
    // 初始化刻度，第一个刻度为-1，后续为0-20
    const arr = new Array(40)
    let other = 0
    arr.fill(0)

    // 数据归纳到刻度
    data.value.forEach(row => {
        const v = row[colName]
        if (v === '.') {
            other += 1
        } else {
            const ratio = Number(row[colName])
            const idx = Math.floor(ratio / 0.05)*2 + 1
            arr[idx] += 1
        }
    })


    // 构造数据
    // const result = arr.map((v, i) => {
    //     return [Number((-0.05 + 0.05*(i+1)).toFixed(2)), v]
    // })
    // result[0] = [-0.5, result[0][1]]



    const result = [[0, other], [1, 0]]
    arr.forEach((v, i) => {
        result.push([i+ 2, v])
    })
    // arr.map((v, i) => [i, v] )

    return result
}

const onResize = () => {
    if (chart.value) {
        chart.value.resize()
    }
}
</script>

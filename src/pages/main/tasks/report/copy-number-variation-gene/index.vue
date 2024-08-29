<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right q-mr-md q-mb-sm"
        @click="dlgVisible = !dlgVisible"
        >{{ $t('Intro') }}
    </q-btn>
    <q-option-group v-model="current_kpi" :options="kpi_headers" color="primary" inline class="q-my-sm" />
    <div class="flex flex-center" style="width:100%;">
        <div :id="chartDiv" style="min-width: 95%;max-width:100%; height: 500px" />
    </div>
    <a-table :columns="columns" :data-source="rows" bordered size="small">
        <template #bodyCell="{record, column}">
            <!--        <template #bodyCell="{ column}">-->
            <template v-if="column.key === 'Chromesome'  || column.key === '染色体'">
                <q-btn
                    size="small"
                    :outline="highlightLineNumber !== record.lineNumber"
                    color="primary"
                    :label="record.chrs[0]"
                    @click="highlightLineNumber = record.lineNumber; highlightChr = record.chrs[0]; refreshChartData()"
                />
                <q-btn
                    size="small"
                    outline
                    v-if="record.chrs.length>1"
                    :label="record.chrs[1]"
                    @click="highlightLineNumber = record.lineNumber; highlightChr = record.chrs[1]; refreshChartData()"
                />
            </template>
        </template>
    </a-table>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 75%; max-width: 2000px">
            <q-bar class="bg-primary text-white">{{ $t('CopyNumberVariationGeneAnalysis') }}</q-bar>
            <q-card-section>
                <div style="white-space:pre-wrap; line-height: 35px">{{ props.intro }}</div>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">{{ $t('Close') }}</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch, toRef, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { readTaskFile } from 'src/api/task';
import { getCsvData, getCsvDataAndSetLineNumber, getCsvHeader } from 'src/utils/csv';
import { readSystemFile } from 'src/api/report';
import { toMap, partition } from 'src/utils/collection';
import { uid } from 'quasar';
import * as echarts from 'echarts';
import { errorMessage } from 'src/utils/notify';
import { useI18n } from 'vue-i18n';
import { globalStore } from 'src/stores/global';
import { storeToRefs } from 'pinia';
import _ from 'lodash';

const store = globalStore();
const { langCode } = storeToRefs(store);
const { t } = useI18n();

const props = defineProps({
    intro: {
        type: String,
        required: false
    },
    task: {
        type: Object,
        required: true
    },
    samples: {
        type: Array,
        required: false,
        default: () => []
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showCNVcircos: true,
                showCNVtable: true,
                showSticky: false
            };
        }
    },
    stepData: {
        type: Object,
        default: () => {
        }
    }
});

const emit = defineEmits(['stickDone', 'reset']);
const viewConfig = toRef(props, 'viewConfig');
const stepData = toRef(props, 'stepData');
// 表头名称集合
const headers = ref([]);
const highlightLineNumber = ref(1);
const highlightChr = ref('');
// 表头定义集合
const columns = computed(() => {
    const result = headers.value.map(h => {
        let values = [...new Set(rows.value.map((t) => t[h]))];
        // 选项太多，说明数据十分散列，无需筛选
        values = values.length > 100 ? [] : values;
        let h_define = {
            key: h, title: h, dataIndex: h, align: 'center'
        };
        h_define.customCell = (record, rowIndex, column) => {
            return {
                // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
                style: {
                    'font-weight': highlightLineNumber.value === record.lineNumber ? 'bold' : '',
                    'color': highlightLineNumber.value === record.lineNumber ? '#1976d2' : 'black'
                    // cursor: 'pointer',
                }
                // 鼠标单击行
                // onClick: (event) => {
                //     highlightLineNumber.value = record.lineNumber;
                // },
            };
        };
        if (values.length > 0) {
            h_define = {
                ...h_define,
                filters: values.map((v) => {
                    return { text: v, value: v };
                }),
                onFilter: (value, record) => record[h].indexOf(value) === 0
            };
        }
        return h_define;
    });
    // 添加操作列
    // result.push({ title: t('Operate'), dataIndex: 'Operate', align: 'center' })
    return result;
});

// 统计数据，数据来自cnvkit_gene.txt，用于选择表格一列后，从该数据进行筛选统计
const detail_rows = ref([]);
const route = useRoute();
const dlgVisible = ref(false);
const rows = ref([]);
const filteredRows = ref([]);
const loading = ref(false);
const tableFileUrl = ref('');
const tableFileName = ref('');
// 需要统计的指标选项清单
const kpi_headers = ref([]);
// 当前KPI
const current_kpi = ref();
const chart = shallowRef();
const chartDiv = ref(uid());


watch(langCode, v => loadData());
watch(rows, v => {
    // selectedRows.value = rows.value.filter(t => t.Report === 'Y').map(t => t.lineNumber)
});

onMounted(() => {
    initChart();
    loadData();
});

let selectedDefaultRows = ref([]);
let defaultRows = ref([]);
const loadData = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN';
    const filePath = `${props.task.result_dir}/CNV_gene/gene_${suffix}.txt`;
    tableFileUrl.value = `igv${filePath}`;
    tableFileName.value = `gene_${suffix}.txt`;
    // 加载表格数据 - /CNV_gene/gene_CN.txt
    // 表头英文：Gene | Transcript | Chromosome | Inheritance | Exon |
    // 表头中文：基因	转录本	染色体	遗传特征	外显子数
    readTaskFile(route.params.id, filePath).then((res) => {
        headers.value = getCsvHeader(res);
        const results = getCsvDataAndSetLineNumber(res, { fields: headers.value });
        rows.value = results;
        rows.value.map(dr => {
            const chr_value = dr[headers.value[2]];
            dr.chrs = chr_value.split(',');
            return dr;
        });

        highlightChr.value = results[0]['染色体'] || results[0]['Chromosome'];
        filteredRows.value = results;
        console.log('///////////////////////', highlightChr.value);
    });

    // 加载详细数据，用于表格点击后从该数据查找统计 - /CNV_gene/cnvkit_gene.txt
    // 表头：Gene | Chromosome | Exon | Depth | Unfilter copys | Filter copys
    readTaskFile(route.params.id, `${props.task.result_dir}/CNV_gene/cnvkit_gene.txt`).then((res) => {
        const detail_headers = getCsvHeader(res);
        // 第4列以及之后的列作为指标列，需要在chart中统计展示
        kpi_headers.value = detail_headers.slice(3).map(kpi => {
            return { label: kpi, value: kpi };
        });
        current_kpi.value = kpi_headers.value[0].value;
        // 详细数据
        detail_rows.value = getCsvData(res, { fields: detail_headers });
        console.log('readTaskFile and convert to detail_rows', detail_rows.value);

        refreshChartData();
    });
};

const initChart = () => {
    const div = document.getElementById(chartDiv.value);
    chart.value = echarts.init(div);
    chart.value.setOption(option);
};

const refreshChartData = () => {
    const x_data = detail_rows.value.filter(r => {
        const highlightRow = rows.value[highlightLineNumber.value - 1];
        const geneMatch = r['Gene'] === highlightRow['基因'] || r['Gene'] === highlightRow['Gene'];
        const charMatch = r['Chromosome'] === highlightChr.value;

        return geneMatch && charMatch;
    }).map(r => {
        return { value: r['Exon'] };
    });

    const y_data = detail_rows.value.filter(r => {
        const highlightRow = rows.value[highlightLineNumber.value - 1];
        const geneMatch = r['Gene'] === highlightRow['基因'] || r['Gene'] === highlightRow['Gene'];
        const charMatch = r['Chromosome'] === highlightChr.value;
        return geneMatch && charMatch;
    })
        .map(r => r[current_kpi.value])
        .map(v => {
            const r = _.toNumber(v);
            // 每个元素2个值，0为数字，1为原始数据（可能为GC fail、Probe uncovered等）
            return { value: _.isNumber(r) ? r : null, raw: v };
        });


    for (let i = 0; i < y_data.length; i++) {
        if (_.isNaN(y_data[i].value)) {
            x_data[i].textStyle = { color: 'red' };
        }
    }
    console.log('OOOOOOOOOOOOOOOOOOOO - x & Y', x_data, y_data);

    option.xAxis.data = x_data;
    option.series[0].data = y_data;
    chart.value.setOption(option);
};


const option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        },
        formatter: function (params) {
            return `${params[0].axisValue}<br/>${params[0].data.raw}`
        }
    },
    xAxis: {
        data: [],
        // type: 'category',
        axisLabel: {
            inside: false,
            // textStyle: {
            //     color: function(data, index) {
            //         console.log('xxxxxxxxxxxxxxxxxxx', data, index)
            //         return _.isNumber(data.value) ? 'black' : 'red';
            //     }
            // }
        },
        axisTick: {
            show: true,
            alignWithLabel: true
        },
        axisLine: {
            show: true
        }
    },
    yAxis: {
        axisLine: {
            show: true
        },
        axisTick: {
            show: true
        },
        axisLabel: {
            textStyle: {
                color: '#999'
            }
        }
    },
    series: [
        {
            type: 'bar',
            barWidth: '90%',
            barMaxWidth: 40,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        { offset: 0, color: '#83bff6' },
                        { offset: 0.5, color: '#188df0' },
                        { offset: 1, color: '#188df0' }
                    ]
                )
            },
            label: {
                show: true,
                position: 'top',
                formatter: (param) => _.isNumber(param.data.value) ? param.data.value : param.data.name
            },
            // emphasis: {
            //     itemStyle: {
            //         color: new echarts.graphic.LinearGradient(
            //             0, 0, 0, 1,
            //             [
            //                 { offset: 0, color: '#2378f7' },
            //                 { offset: 0.7, color: '#2378f7' },
            //                 { offset: 1, color: '#83bff6' }
            //             ]
            //         )
            //     }
            // },
            // tooltip: {
            //     show: true,
            //     trigger: 'axis',
            //     formatter: (param) => 'param.data.value'
            // },
            data: []
        }
    ]
};


const refreshChart = () => {
    const dataShadow = [];


    chart.value.setOption(option.value);
    const ss = {
        title: {
            text: '特性示例：渐变色 阴影 点击缩放',
            subtext: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
        },
        xAxis: {
            data: x_data.value,
            axisLabel: {
                inside: true,
                textStyle: {
                    color: '#fff'
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            z: 10
        },
        yAxis: {
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#999'
                }
            }
        },
        dataZoom: [
            {
                type: 'inside'
            }
        ],
        series: [
            { // For shadow
                type: 'bar',
                itemStyle: {
                    color: 'rgba(0,0,0,0.05)'
                },
                barGap: '-100%',
                barCategoryGap: '40%',
                data: dataShadow,
                animation: false
            },
            {
                type: 'bar',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            { offset: 0, color: '#83bff6' },
                            { offset: 0.5, color: '#188df0' },
                            { offset: 1, color: '#188df0' }
                        ]
                    )
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: '#2378f7' },
                                { offset: 0.7, color: '#2378f7' },
                                { offset: 1, color: '#83bff6' }
                            ]
                        )
                    }
                },
                data: y_data.value
            }
        ]
    };
};

const searchFilterRows = (searchParams) => {
    filteredRows.value = rows.value.filter((t) => {
        if (searchParams.includeDefaultReport && t.Report === 'Y') {
            return true;
        }

        return [];
    });
};
const clickSearch = () => {
    if (viewConfig.value.showStick && viewConfig.value.stickDone) {
        errorMessage(t('DefineReportUnlockReuired'));
        return false;
    }
    searchFilterRows(searchParams.value);
    selectedRows.value = selectedDefaultRows.value;
};


const selectedRows = ref([]);

const onSelectChange = (selectedRowKeys) => {
    // if (viewConfig.value.showStick && viewConfig.value.stickDone) {
    //     errorMessage('请先取消过滤')
    //     return false
    // }
    console.log(selectedRowKeys);
    selectedRows.value = selectedRowKeys;
    selectedDefaultRows.value = [];
    for (let item of selectedRowKeys) {
        let finded = false;
        for (let lineNumber of defaultRows.value) {
            if (lineNumber === item) {
                finded = true;
                break;
            }
        }
        if (finded) {
            selectedDefaultRows.value.push(item);
        }
    }
    console.log(selectedDefaultRows);
};


const reset = () => {
    emit('reset', null);
    selectedRows.value = [];
    clickSearch();
};
</script>

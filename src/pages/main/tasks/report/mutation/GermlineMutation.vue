<template>
    <div>
        <div class="row justify-between">
            <div class="col-2 column q-gutter-xs">
                <div class="col">
                    <q-input
                        v-model="searchParams.depth"
                        label="基因"
                        clearable
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.depth"
                        label="深度 >"
                        clearable
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.ratio"
                        label="肿瘤频率 >"
                        clearable
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>

                <div class="col">
                    <q-select
                        v-model="searchParams.mutationType"
                        clearable
                        :options='options.mutationType'
                        label="突变类型"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-select
                        v-model="searchParams.mutationPosition"
                        clearable
                        multiple
                        :options="options.mutationPosition"
                        label="突变位置"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-select
                        clearable
                        v-model="searchParams.mutationMeaning"
                        stack-label
                        label-color="primary"
                        :options="options.mutationMeaning"
                        label="突变意义"
                    />
                </div>
                <div class="col">
                    <q-select
                        clearable
                        v-model="searchParams.mutationRisk"
                        stack-label
                        label-color="primary"
                        :options="options.mutationRisk"
                        label="突变意义"
                    />
                </div>
                <div class="col">
                    <q-input
                        v-model="searchParams.humanRatio"
                        label="人群频率 <"
                        clearable
                        type="number"
                        stack-label
                        label-color="primary"
                    />
                </div>
                <div class="col">
                    <q-select
                        clearable
                        v-model="searchParams.sift"
                        stack-label
                        label-color="primary"
                        :options="['T', 'D', '.']"
                        label="SIFT_pred"
                    />
                </div>
                <div class="q-gutter-md text-center q-py-sm">
                    <q-btn color="primary" label="确定" icon="search" @click="search()"/>
                    <q-btn color="primary" label="重置" icon="settings_backup_restore" @click="reset"/>
                </div>
            </div>

            <div class="col-10" >
                <a-table size="small" bordered :loading="loading" :data-source="filteredRows" :columns="columns"
                         :scroll="{ x: 2000, y: 600 }"
                         :sticky="true">
                </a-table>
            </div>

        </div>
    </div>

    <div class="q-py-sm" v-if="!showColumn">
        <div class="row q-gutter-sm">
            <div class="col">
                <BarChartVue/>
            </div>
            <div class="col">
                <PieChartVue/>
            </div>
        </div>
        <div class="row q-gutter-sm q-py-sm">
            <div class="col">
                <BubbleChartVue/>
            </div>
            <div class="col">
                <RoseChartVue/>
            </div>
            <div class="col">
                <RoseChartVue/>
            </div>
        </div>
    </div>
    <div class="q-py-sm" v-if="showColumn">
        <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
                :breakpoint="0">
            <q-tab name="突变信息" label="突变信息"/>
            <q-tab name="药物关联信息" label="药物关联信息"/>

        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="突变信息">
                <div class="row q-gutter-xs">
                    <div class="col" style="border-right:solid 1px black">数据</div>
                    <div class="col" style="border-right:solid 1px black">数据</div>
                    <div class="col" style="border-right:solid 1px black">数据</div>
                    <div class="col">
                        <RadarChartVue/>
                    </div>
                </div>
            </q-tab-panel>
            <q-tab-panel name="药物关联信息">
                <div>
                    药物关联信息描述药物关联信息描述药物关联信息描述药物关联信息描述药物关联信息描述
                </div>
                <div class="bio-data-table q-py-sm">
                    <table>
                        <thead>
                        <tr>
                            <td>数据</td>
                            <td>数据</td>
                            <td>数据</td>
                            <td>数据</td>
                            <td>数据</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>数据</td>
                            <td>数据</td>
                            <td>数据</td>
                            <td>数据</td>
                            <td>数据</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>
<script setup>
import {ref, onMounted} from "vue";
import BarChartVue from "./SomaticInfoCharts/BarChart.vue"
import PieChartVue from "./SomaticInfoCharts/PieChart.vue"
import RoseChartVue from "./SomaticInfoCharts/RoseChart.vue"
import BubbleChartVue from "./SomaticInfoCharts/BubbleChart.vue"
import RadarChartVue from "./SomaticColumnCharts/RadarChart.vue"
import {readTaskFile} from "src/api/task";
import {getCsvHeader, getCsvData} from "src/utils/csv";
import {useRoute} from 'vue-router'

const route = useRoute()
const tab = ref('突变信息')
const showColumn = ref(false)
const searchParams = ref({
    gene: null,
    depth: null,
    ratio: null,
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    mutationRisk: null,
    humanRatio: null,
    sift: null
})

const options = ref({
    mutationType: ["All", "SNP", "INDEL"],
    mutationPosition: [],
    mutationMeaning: [],
    mutationRisk: [],
})

const loading = ref(false)
const rows = ref([])
const filteredRows = ref([])

const columns = ref([
    {i: 1, title: '', dataIndex: 'col1', align: 'center', width: 60, fixed: 'left'},
    {i: 2, title: '', dataIndex: 'col2', align: 'center', width: 85, fixed: 'left'},
    {i: 3, title: '', dataIndex: 'col3', align: 'center', width: 85},
    {i: 4, title: '', dataIndex: 'col4', align: 'center', width: 70},
    {i: 5, title: '', dataIndex: 'col5', align: 'center', width: 70}, // Alt
    {i: 6, title: '', dataIndex: 'col6', align: 'center', width: 90},
    {i: 6, title: '', dataIndex: 'col6', align: 'center', width: 90},
    {i: 7, title: '', dataIndex: 'col7', align: 'center', width: 105},
    {i: 8, title: '', dataIndex: 'col8', align: 'center', width: 90},
    {i: 9, title: '', dataIndex: 'col9', align: 'center', width: 110},
    {i: 10, title: '', dataIndex: 'col10', align: 'center', width: 105},// Func.refGene
    {i: 11, title: '', dataIndex: 'col11', align: 'center', width: 105},
    {i: 12, title: '', dataIndex: 'col12', align: 'center', width: 145},
    {i: 13, title: '', dataIndex: 'col13', align: 'center', width: 160},
    {i: 14, title: '', dataIndex: 'col14', align: 'left', width: 140}, // exon
    {i: 15, title: '', dataIndex: 'col15', align: 'left', width: 160, ellipsis: true},
    {i: 16, title: '', dataIndex: 'col16', align: 'left', width: 160, ellipsis: true},
    {i: 17, title: '', dataIndex: 'col17', align: 'center', width: 120},
    {i: 18, title: '', dataIndex: 'col18', align: 'left', width: 200, ellipsis: true},  // CLNDN
    {i: 19, title: '', dataIndex: 'col19', align: 'left', width: 400, ellipsis: true},
    {i: 20, title: '', dataIndex: 'col20', align: 'left', width: 280},
    {i: 21, title: '', dataIndex: 'col21', align: 'center', width: 90},  // CLNIG
    {i: 22, title: '', dataIndex: 'col22', align: 'center', width: 100},
    {i: 23, title: '', dataIndex: 'col23', align: 'center', width: 95},
    {i: 24, title: '', dataIndex: 'col24', align: 'center', width: 100},
    {i: 25, title: '', dataIndex: 'col25', align: 'center', width: 100},
    {i: 26, title: '', dataIndex: 'col26', align: 'center', width: 100},

    {i: 31, title: '', dataIndex: 'col31', align: 'center', width: 100},
    {i: 32, title: '', dataIndex: 'col32', align: 'center', width: 100},

    {i: 34, title: '', dataIndex: 'col34', align: 'center', width: 100},// avsnp150
    {i: 35, title: '', dataIndex: 'col35', align: 'center', width: 100},

    {i: 39, title: '', dataIndex: 'col39', align: 'center', width: 100},

    {i: 56, title: '', dataIndex: 'col56', align: 'center', width: 100},

    {i: 144, title: '', dataIndex: 'col144', align: 'center', width: 100},
])

const reset = () => {
    searchParams.value = {
        gene: null,
        depth: null,
        ratio: null,
        mutationType: null,
        mutationPosition: [],
        mutationMeaning: null,
        mutationRisk: null,
        humanRatio: null,
        sift: null
    }
    search()
}

const search = () => {

}
const refreshPage = () => {
    showColumn.value = false
}

onMounted(() => {
    readTaskFile(route.params.id, 'Mut_germline/QT11.combined.standard-new.csv').then(res => {
        const headNames = getCsvHeader(res, ',')
        columns.value.forEach(col => col.title = headNames[col.i-1])

        const visibleColIdx = columns.value.map(t => t.i)
        const colKeys = columns.value.map(t => t.dataIndex)
        const csvRows = getCsvData(res, {splitter: ',', hasHeaderLine: true, colIndex: visibleColIdx, fields: colKeys})
        rows.value = csvRows
        filteredRows.value = csvRows
    })
})
</script>

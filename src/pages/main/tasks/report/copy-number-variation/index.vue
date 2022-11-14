<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明
    </q-btn>
    <div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-input dense label="搜索基因:" clearable />
            </div>
            <div class="col">
                <q-select clearable dense :options='["DUP", "DEL"]' label="拷贝数变异分类" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["无", "正", "反",]' label="CN 排序" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["All", "Yes", "No",]' label="药物靶点" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["A", "B", "C", "D", "E"]' label="突变位置" />
            </div>
        </div>
        <div class="q-gutter-md text-center q-py-sm">
            <q-btn color="primary" label="确定" icon="search" @click="refreshPage()" />
            <q-btn color="grey" label="清除" icon="delete" @click="refreshPage()" />
        </div>
    </div>

    <a-table
        class="col-5"
        size="small"
        bordered
        :loading="loading"
        :data-source="filteredRows"
        :columns="columns"
        :sticky="true"
    >
    </a-table>

    <div class="q-py-sm">过滤结果的图表数据</div>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">质控解读</q-bar>
            <q-card-section>
                <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">关闭</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <!-- <div class="q-py-md">
        <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
            :breakpoint="0">
            <q-tab name="胚系突变分析" label="胚系突变分析" />
            <q-tab name="体细胞突变分析" label="体细胞突变分析" />

        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="胚系突变分析">
                <GermlineMutationVue />
            </q-tab-panel>
            <q-tab-panel name="体细胞突变分析">
                <SomaticMutationVue />
            </q-tab-panel>
        </q-tab-panels>
    </div> -->
</template>
<script setup>
import {ref, onMounted} from "vue";
import { useRoute } from 'vue-router'
import { readTaskFile } from "src/api/task"
import { getCsvData } from 'src/utils/csv'
import GermlineMutationVue from "./GermlineMutation.vue"
import SomaticMutationVue from "./SomaticMutation.vue"

const route = useRoute()
const tab = ref("胚系突变分析")
const dlgVisible = ref(false)
const props = defineProps({
    intro: {
        type: String,
        required: false
    }
})

const rows = ref([])
const filteredRows = ref([])
const loading = ref(false)
const keyword = ref('')
const columns = [
    {key: 'Chr', title: 'Chr', dataIndex: 'Chr', align: 'center', width: 50},
    {key: 'Start', title: 'Start', dataIndex: 'Start', align: 'center', width: 80},
    {key: 'End', title: 'End', dataIndex: 'End', align: 'center', width: 80},
    {key: 'Type', title: 'Type', dataIndex: 'Type', align: 'center', width: 50},
    {key: 'Gene', title: 'Gene', dataIndex: 'Gene', align: 'center', width: 50},
    {key: 'Copys', title: 'Copys', dataIndex: 'Copys', align: 'center', width: 50},
    {key: 'Rank', title: 'Rank', dataIndex: 'Rank', align: 'center', width: 50},
    {key: 'Phenotypes', title: 'Phenotypes', dataIndex: 'Phenotypes', align: 'left', width: 200},
    {key: 'Drugs', title: 'Drugs', dataIndex: 'Drugs', align: 'center', width: 80}
]

onMounted(() => {
    readTaskFile(route.params.id, 'CNV/AnnotSV.tsv.filter.txt').then(res => {
        const columnFields = columns.map(t => t.dataIndex)
        const result = getCsvData(res, { fields: columnFields })
        rows.value = result
        filteredRows.value = result
        console.log('===> rows.value', rows.value)
    })
})
</script>

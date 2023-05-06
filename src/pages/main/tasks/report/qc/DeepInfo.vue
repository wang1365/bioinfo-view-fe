<template>
    <div>
        <div class="row items-start q-gutter-sm">
            <q-input v-model="keyword" :label="$t('InputGeneToSearch') + ':'" clearable dense @clear="clearKeyword">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-btn class="q-ml-sm" color="primary" :label="$t('GeneSearch')" @click="searchKeyword"></q-btn>
        </div>
    </div>
    <div class="q-py-md">
        <div class="row q-col-gutter-lg-md justify-around">
            <div class="col q-mr-md" v-if="props.samples.length > 1">
                <div class="text-center text-bold text-primary text-h6" style="position:relative">
                    {{$t('ControlSample')}}
                    <q-btn
                        :href="fileUrl1"
                        style="position:absolute;right:10px;bottom: 5px;cursor:pointer"
                        :label="$t('Download')"
                        padding="sm"
                        icon="south"
                        color="primary"
                        target="_blank"
                        size="xs"
                    />
                </div>
                <q-separator></q-separator>
                <a-table
                    class="col-5"
                    size="small"
                    bordered
                    :loading="loading1"
                    :data-source="filteredRows1"
                    :columns="columns"
                    :sticky="true"
                >
                </a-table>
            </div>
            <div class="col q-ml-md">
                <div
                    class="text-center text-bold text-purple text-h6"
                    style="position:relative"
                    v-if="props.samples.length > 1"
                >
                    {{$t('TumorSample')}}
                    <q-btn
                        :href="fileUrl2"
                        style="position:absolute;right:10px;bottom: 5px;cursor:pointer"
                        :label="$t('Download')"
                        padding="sm"
                        icon="south"
                        color="primary"
                        target="_blank"
                        size="xs"
                    />
                </div>
                <q-separator></q-separator>
                <a-table
                    size="small"
                    bordered
                    :loading="loading2"
                    :data-source="filteredRows2"
                    :columns="columns"
                    :sticky="true"
                >
                </a-table>
            </div>
        </div>
    </div>
</template>
<script setup>
import {ref, onMounted, computed} from "vue";
import { readTaskFile } from "src/api/task"
import { getCsvData } from "src/utils/csv"
import { useRoute } from 'vue-router'
import { exportFile } from 'quasar'
import { getDualIdentifiers } from "src/utils/samples"
import { useI18n }from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const props = defineProps({
    intro: {
        type: String,
        required: false
    },
    task: {
        type: Object,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => []
    }
})

const columns = computed(() => [
    { key: 'gene', title: t('Gene'), dataIndex: 'k1', align: 'center', width: 120 },
    { key: 'avg', title: t('DepthAverage'), dataIndex: 'k2', align: 'center', width: 120, sorter: (row1, row2) => row1.k2 - row2.k2 },
    { key: 'mid', title: t('DepthMedian'), dataIndex: 'k3', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k3 },
    { key: 'ratio', title: t('GeneCoverage'), dataIndex: 'k4', align: 'center', width: 120, sorter: (row1, row2) => row1.k3 - row2.k4 },
])

const keyword = ref('')
const rows1 = ref([])
const filteredRows1 = ref([])
const rows2 = ref([])
const filteredRows2 = ref([])
const loading1 = ref(false)
const loading2 = ref(false)
const fileUrl1 = ref('')
const fileUrl2 = ref('')


const searchKeyword = () => {
    filteredRows1.value = rows1.value.filter(t => t.k1.includes(keyword.value))
    filteredRows2.value = rows2.value.filter(t => t.k1.includes(keyword.value))
}

const clearKeyword = () => {
    filteredRows1.value = rows1.value
    filteredRows2.value = rows2.value
}

const download = (idx) => {
    const name = idx === 0 ? 'normal.txt' : ' tumor.txt'
    let data = '基因\t深度平均值\t深度中位值\t基因覆盖度\n'
    let objects = idx === 0 ? filteredRows1.value : filteredRows2.value
    objects.forEach(row => {
        data += `${row.k1}\t${row.k2}\t${row.k3}\n`
    })

    // let data = [['基因', '深度平均值', '深度中位值', '基因覆盖度']]
    // let objects = idx === 0 ? filteredRows1.value : filteredRows2.value
    // objects.forEach(row => {
    //     data.push([row.k1, row.k1, row.k1])
    // })
    const status = exportFile(name, data,
        //     {
        //     // encoding: 'windows-1252',
        //     // mimeType: 'text/csv;charset=windows-1252;'
        //     mimeType: 'text/csv'
        // }
    )

    if (status === true) {
        // 浏览器允许
    } else {
        // 浏览器拒绝
    }
}

onMounted(() => {
    const fields = ['k1', 'k2', 'k3', 'k4']
    const { qt, qn } = getDualIdentifiers(props.samples)
    fileUrl1.value = `/igv/${props.task.result_dir}/QC/${qt}.depth`
    fileUrl2.value = `/igv/${props.task.result_dir}/QC/${qn}.depth`

    loading2.value = true
    readTaskFile(route.params.id, `QC/${qt}.depth`, {}, fields).then(res => {
        rows2.value = getCsvData(res, { fields: fields, hasHeaderLine: false })
        filteredRows2.value = rows2.value
    }).finally(() => {
        loading2.value = false
    })

    if (props.samples.length > 1) {
        loading1.value = true
        readTaskFile(route.params.id, `QC/${qn}.depth`,).then(res => {
            rows1.value = getCsvData(res, { fields: fields, hasHeaderLine: false })
            filteredRows1.value = rows1.value
        }).finally(() => {
            loading1.value = false
        })
    }
})
</script>

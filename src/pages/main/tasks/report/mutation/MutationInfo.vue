<template>
    <div>
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left"
            dense
            class="bg-grey-1"
            :breakpoint="0"
        >
            <q-tab name="突变信息" :label="$t('MutationInfo')" />
            <q-tab name="药物关联信息" :label="$t('DrugRelatedInfo')" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="突变信息">
                <div class="row q-gutter-xs">
                    <div class="col" style="border-right:solid 1px black; padding-left: 5px">
                        <div>{{'VCF filter: '}}</div>
                        <div class="text-purple" style="word-break: break-all">
                            {{isGermline ? props.row.col248 : props.row.col252}}
                        </div>
                    </div>
                    <div class="col" style="border-right:solid 1px black; padding-left: 5px">
                        <div>
                            {{`Gene: `}}
                            <span class="text-purple">{{geneProperties.gene}}</span>
                        </div>
                        <div>
                            {{`Transcript: `}}
                            <span class="text-purple">{{geneProperties.transcript}}</span>
                        </div>
                        <div>
                            {{`Exon: `}}
                            <span class="text-purple">{{geneProperties.exon}}</span>
                        </div>
                        <div>
                            {{`cDNA: `}}
                            <span class="text-purple">{{geneProperties.cDna}}</span>
                        </div>
                        <div>
                            {{`Ref/Alt: `}}
                            <span class="text-purple">{{geneProperties.ref}}</span>
                        </div>
                        <div>
                            {{`Protein: `}}
                            <span class="text-purple">{{geneProperties.protein}}</span>
                        </div>
                    </div>
                    <div class="col" style="padding-left: 5px">
                        <div>
                            <span>{{'RS: '}}</span>
                            <a :href="'https://www.ncbi.nlm.nih.gov/snp/' + rs" target="_blank">{{rs}}</a>
                        </div>
                        <div>
                            <span>{{`ClinVar Allele ID: `}}</span>
                            <a
                                :href="`https://www.ncbi.nlm.nih.gov/clinvar?term=${clinVar}%5BAlleleID%5D`"
                                target="_blank"
                                >{{clinVar}}</a
                            >
                        </div>
                        <div>
                            <span>{{'OMIM: '}}</span>
                            <a :href="'https://omim.org/entry/' + omim" target="_blank">{{omim}}</a>
                        </div>
                    </div>
                </div>
                <q-separator class="q-my-sm" />
                <div class="q-mt-sm">
                    <RadarChartVue
                        :data="props.row"
                        :title-key="'NonsynonymousMutationTest'"
                        :is-germline="props.isGermline"
                    />
                </div>
            </q-tab-panel>

            <q-tab-panel name="药物关联信息">
                <div class="q-py-sm">{{intro}}</div>

                <div>
                    <a-table
                        :columns="columns"
                        :data-source="rows"
                        :scroll="{ x: 800}"
                        size="small"
                        bordered
                        :sticky="true"
                    ></a-table>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup>
import { ref, onMounted, toRefs, computed, watch } from 'vue'
import RadarChartVue from './SomaticColumnCharts/RadarChart'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import {getCsvData, getCsvHeader} from 'src/utils/csv'
import { useRoute } from 'vue-router'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import MutationInfo from "pages/main/tasks/report/mutation/MutationInfo.vue";

const store = globalStore()
const { langCode } = storeToRefs(store)
const route = useRoute()
const tab = ref('突变信息')

const props = defineProps({
    row: {
        type: Object,
        required: true,
        default: () => {},
    },
    isGermline: {
        type: Boolean,
        required: false,
        default: () => true,
    },
    samples: {
        type: Array,
        required: false,
    },
    headers: {
        type: Array,
        required: false,
    },
    task: {
        type: Object,
        required: false,
    },
})

const { row, isGermline } = toRefs(props)
const intro = ref('')

const fullColumns = [
    { title: 'Molecular Profile', dataIndex: 'k1', align: 'center', width: 80 },
    { title: 'Tumor Type', dataIndex: 'k2', align: 'center', width: 100 },
    { title: 'Response Type', dataIndex: 'k3', align: 'center', width: 80 },
    { title: 'Therapy Name', dataIndex: 'k4', align: 'center', width: 80 },
    { title: 'Approval Status', dataIndex: 'k5', align: 'center', width: 80 },
    { title: 'Evidence Type', dataIndex: 'k6', align: 'center', width: 80 },
    { title: 'Efficacy Evidence', dataIndex: 'k7', align: 'center', width: 250 },
    { title: 'Efficacy Level', dataIndex: 'k8', align: 'center', width: 80 },
    { title: 'Inferred Tier', dataIndex: 'k9', align: 'center', width: 80 },
]

const columns = ref([])
const rows = ref([])
const geneProperties = computed(() => {
    const result = {
        ref: `${row.value.col4} > ${row.value.col5}`,
    }
    const col = isGermline.value ? row.value.col247 : row.value.col251
    const items = col.split(':')
    if (items.length < 5) {
        return result
    }
    const [gene, transcript, exon, cDna, protein] = items
    return {
        gene,
        transcript,
        exon,
        cDna,
        protein,
        ...result,
    }
})

const rs = computed(() => {
    return isGermline.value ? props.row.col38 : props.row.col42
})

const clinVar = computed(() => {
    return isGermline.value ? props.row.col17 : props.row.col21
})

const omim = computed(() => {
    return isGermline.value ? props.row.col245 : props.row.col249
})

onMounted(() => {
    loadRows()
})

watch(langCode, () => loadRows())

const loadRows = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    let row = props.row
    let match = ''
    const introIdx = props.headers.findIndex(name => name === 'Mut_info')
    intro.value = props.row[`col${introIdx+1}`]
    if (props.isGermline) {
        match = `${row.col1}:${row.col2}-${row.col3}_${row.col4}>${row.col5}_${row.col11}`
    } else {
        match = `${row.col1}:${row.col2}-${row.col3}_${row.col4}>${row.col5}_${row.col15}`
    }


    const tableFile = props.isGermline ? `Mut_germline/germline_${suffix}.evidence` : `Mut_somatic/somatic_${suffix}.evidence`
    readTaskFile(route.params.id, tableFile).then((res) => {
        const items = getCsvData(res)
        const headers = getCsvHeader(res, '\t')

        // 表格头（排除第一列）
        columns.value = headers.slice(1).map(h => {
            return { title: h, dataIndex: h, align: 'center', ellipsis: true }
        })

        // 表格数据
        items.filter(row => row[0] === match)
            .forEach(row => {
                let item = {}
                for (let index = 1; index < row.length; index++) {
                    item[headers[index]] = row[index]
                }
                rows.value.push(item)
            })

        console.log('===> columns', columns.value)
        console.log('===> rows', rows.value)
    })
}
</script>

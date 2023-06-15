<template>
    <div>
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="relative-position float-right q-mr-md"
            @click="dlgVisible = !dlgVisible"
            >Intro.
        </q-btn>
        <div v-if="props.viewConfig.showHRDtable">
            <div class="q-py-md text-bold text-h6 text-primary">{{$t('HRDStatistics')}}</div>
            <div class="row q-gutter-x-sm">
                <div class="col-7 justify-end">
                    <a-table
                        size="small"
                        bordered
                        :loading="loading"
                        :data-source="rows"
                        :columns="columns"
                        :sticky="true"
                    >
                    </a-table>
                    <div class="q-pl-lg">
                        <div class="text-bold text-primary">{{$t('OnlyForResearch')}}</div>
                        <div class="text-bold text-primary q-mt-sm" style="white-space: pre">{{tableTip}}</div>
                    </div>
                </div>
                <div class="col-4">
                    <GuageChartVue :hrd="hrd" />
                </div>
            </div>
        </div>

        <div class="column q-gutter-sm" v-if="props.viewConfig.showHRDpicture">
            <div class="col q-mx-sm q-my-lg">
                <q-img :src="images[0]" alt="" style="width:100%;height:300px" />
                <div class="text-grey-7">{{$t('X1Comment')}}</div>
            </div>
            <div class="col q-mx-sm q-my-lg">
                <q-img :src="images[1]" alt="" style="width:100%;height:300px" />
                <div class="text-grey-7">{{$t('X2Comment')}}</div>
            </div>
            <div class="col q-mx-sm q-my-lg">
                <q-img :src="images[2]" alt="" style="width:100%;height:300px" />
                <div class="text-grey-7">{{$t('X3Comment')}}</div>
            </div>
        </div>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{$t('HomologousRecombinationDefectAnalysis')}}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{props.intro}}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">{{$t('Close')}}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue"
import { readTaskFile} from "src/api/task"
import { getCsvData} from "src/utils/csv"
import GuageChartVue from "./GuageChart.vue"
import { useRoute} from 'vue-router'
import { getDualIdentifiers} from "src/utils/samples"
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'

const store = globalStore()
const { langCode } = storeToRefs(store)
const route = useRoute()
const loading = ref(false)
const dlgVisible = ref(false)
const tableTip = ref('')
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
                "showHRDtable": true,
                "showHRDpicture": true,
            }
        }
    }
})

const hrd = ref(null)
const rows = ref([])
const columns = [
    {title: 'LOH(Loss of Heterozygosity)', dataIndex: 'k1', align: 'center'},
    {title: 'Telomeric_AI(Telomeric Allelic Imbalance)', dataIndex: 'k2', align: 'center'},
    {title: 'LST(Large Scale Transitions)', dataIndex: 'k3', align: 'center'},
    {title: 'HRD-sum', dataIndex: 'k4', align: 'center'},
]
const images = ref([])

onMounted(() => {
    const {qt, qn} = getDualIdentifiers(props.samples)
    console.log('===> 样本识别号qt, qn:', qt, qn)
    readTaskFile(route.params.id, `HRD/${qn}_${qt}.sequenza.HRD`).then(res => {
        rows.value = getCsvData(res, {hasHeaderLine: true, fields: ['k1', 'k2', 'k3', 'k4']})
        hrd.value = rows.value[0].k4
    })

    images.value = [
        `/igv${props.task.result_dir}/HRD/${qn}_${qt}.001.seqz.png`,
        `/igv${props.task.result_dir}/HRD/${qn}_${qt}.002.seqz.png`,
        `/igv${props.task.result_dir}/HRD/${qn}_${qt}.003.seqz.png`,
    ]

    loadHrdDrug()
})

watch(langCode, () => loadHrdDrug())
const loadHrdDrug = () => {
    const suffix = langCode === 'en' ? 'EN' : 'CN'
    readTaskFile(route.params.id, `HRD/HRD_drug_${suffix}.txt`).then(res => {
        tableTip.value = res
    })
}
</script>

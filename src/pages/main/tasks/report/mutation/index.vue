<template>
    <div>
        <q-btn
            v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            color="primary"
            class="relative-position float-right q-mr-md"
            label="已固定过滤"
            @click="reset()"
        />
        <q-btn
            v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            outline
            color="primary"
            class="relative-position float-right q-mr-md"
            @click="stickFilter()"
            >固定过滤</q-btn
        >
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="relative-position float-right q-mr-md"
            @click="dlgVisible = !dlgVisible"
            >{{$t('Intro')}}</q-btn
        >
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left"
            class="bg-grey-1"
            :breakpoint="0"
            dense
        >
            <q-tab name="胚系突变分析" :label="$t('GermlineMutationAnalysis')" v-if="props.viewConfig.showMutGermline" />
            <q-tab name="体细胞突变分析" :label="$t('SomaticMutationAnalysis')" v-if="props.viewConfig.showMutSomatic" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated v-if="loaded">
            <q-tab-panel name="胚系突变分析">
                <GermlineMutationVue
                    :samples="props.samples"
                    :task="props.task"
                    ref="germlineVue"
                    :rows="germlineData.rows"
                    :header="germlineData.header"
                    :options="germlineData.options"
                    :searchParams="germlineData.searchParams"
                    :drugRows="germlineData.drugRows"
                    :selectedRows="germlineData.selectedRows"
                    :showSticky="props.viewConfig.showStick"
                    :stickDone="props.viewConfig.stickDone"
                    @filterChange="filterChange('germline', $event)"
                />
            </q-tab-panel>
            <q-tab-panel name="体细胞突变分析">
                <SomaticMutationVue
                    :samples="props.samples"
                    :task="props.task"
                    ref="somaticVue"
                    :rows="somaticData.rows"
                    :header="somaticData.header"
                    :options="somaticData.options"
                    :searchParams="somaticData.searchParams"
                    :drugRows="somaticData.drugRows"
                    :selectedRows="somaticData.selectedRows"
                    :showSticky="props.viewConfig.showStick"
                    :stickDone="props.viewConfig.stickDone"
                    @filterChange="filterChange('somatic', $event)"
                />
            </q-tab-panel>
        </q-tab-panels>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ $t('MutationAnalysis') }}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{props.intro}}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">{{ $t('Close') }}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { errorMessage, infoMessage } from 'src/utils/notify'
import { ref, onMounted, computed, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import GermlineMutationVue from './GermlineMutation.vue'
import SomaticMutationVue from './SomaticMutation.vue'
import { useQuasar } from 'quasar'
import igv from "igv"

const germlineVue = ref(null)
const somaticVue = ref(null)
const $q = useQuasar()
const route = useRoute()
const loaded = ref(false)
const tab = ref('胚系突变分析')
const dlgVisible = ref(false)
const emit = defineEmits(['stickDone', 'reset'])
const viewConfig = toRef(props, 'viewConfig')
const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showMutGermline: true,
                showMutSomatic: true,
                showSticky: false,
            }
        },
    },
    task: {
        type: Object,
        required: false,
    },
    stepData: {
        type: Object,
        default: () => {}
    }
})

const germlineData = ref({
    rows: [],
    header: [],
    options: {
        mutationType: ['SNP', 'INDEL'],
        mutationPosition: [],
        mutationMeaning: [],
        mutationRisk: [],
    },
    searchParams: {
        gene: null,
        depth: null,
        depthCmp: '>',
        ratio: null,
        ratioCmp: '>',
        mutationType: null,
        mutationPosition: [],
        mutationMeaning: null,
        mutationRisk: null,
        humanRatio: null,
        sift: null,
        drug: false,
    },
    drugRows: [],
    selectedRows: [],
})
const origingermlineData = ref('')
const originsomaticData = ref('')
const somaticData = ref({
    rows: [],
    header: [],
    options: {
        mutationType: ['SNP', 'INDEL'],
        mutationPosition: [],
        mutationMeaning: [],
        mutationRisk: [],
    },
    searchParams: {
        gene: null,
        tumorDepth: null,
        compareDepth: null,
        tumorRatio: null,
        compareRatio: null,
        mutationType: null,
        mutationPosition: [],
        mutationMeaning: null,
        mutationRisk: null,
        humanRatio: null,
        sift: null,
        drug: false,
    },
    drugRows: [],
    selectedRows: [],
})

const filterData = ref({ somatic: null, germline: null })
const stepData = toRef(props, 'stepData')
onMounted(() => {
    console.log('===================>>>>', igv)
    loaded.value = false
    if (viewConfig.value.showMutGermline) {
        loadGermlineData()
    }
    if (viewConfig.value.showMutSomatic) {
        loadSomaticData()
    }
    loaded.value = true
})
// germlinemutation 和 somaticmutation 的数据同步
const filterChange = (name, data) => {
    filterData.value[name] = data
    if (name === 'germline') {
        germlineData.value.searchParams = data.searchParams
        germlineData.value.selectedRows = data.selectedRows
    } else if (name === 'somatic') {
        somaticData.value.searchParams = data.searchParams
        somaticData.value.selectedRows = data.selectedRows
    }
    console.log(name, data)
}
// 同步子组件的过滤参数
const onSearchParamsChange = (name, data) => {
    if (name === 'germline') {
        germlineData.value.searchParams = data
    } else {
        somaticData.value.searchParams = data
    }
}
const stickFilter = () => {
    if (!filterData.value.germline && viewConfig.value.showMutGermline) {
        if (germlineVue.value) {
            let data = germlineVue.value.getChangedData()
            filterData.value.germline = data
        } else {
            errorMessage('胚系突变分析未进行过滤')
            return false
        }

    }
    if (!filterData.value.somatic && viewConfig.value.showMutSomatic) {
        if (somaticVue.value) {
            let data = somaticVue.value.getChangedData()
            filterData.value.somatic = data
        } else {
            errorMessage('体细胞突变分析未进行过滤')
            return false
        }
    }
    emit('stickDone', filterData.value)
}

const reset = () => {
    try {
        germlineData.value = JSON.parse(origingermlineData.value)
        germlineData.value.selectedRows = []
        somaticData.value = JSON.parse(originsomaticData.value)
        somaticData.value.selectedRows = []
    }
    catch(error) {

    }
    emit('reset', null)

}
const loadGermlineData = () => {
    $q.loading.show({ delay: 100 })
    readTaskMuFile(route.params.id, 'Mut_germline').then((res) => {
        const headNames = getCsvHeader(res, '\t')

        const colKeys = _.range(1, headNames.length + 1, 1).map((i) => 'col' + i)
        const csvRows = getCsvDataAndSetLineNumber(res, { splitter: '\t', hasHeaderLine: true, fields: colKeys })
        csvRows.forEach((row, i) => (row.id = i))

        // 提取options
        let positions = new Set()
        let meanings = new Set()
        let risks = new Set()
        for (let columns of csvRows) {
            const items = columns.col10.split(';')
            items.forEach((item) => positions.add(item))

            if (columns.col13 === '.') {
                meanings.add('●')
            } else {
                meanings.add(columns.col13)
            }

            if (columns.col21 !== '.') {
                risks.add(columns.col21)
            } else {
                risks.add('●')
            }
        }
        germlineData.value.rows = csvRows
        germlineData.value.header = headNames
        germlineData.value.options.mutationPosition = Array.from(positions)
        germlineData.value.options.mutationMeaning = Array.from(meanings)
        germlineData.value.options.mutationRisk = Array.from(risks)
        origingermlineData.value = JSON.stringify(germlineData.value)
        if (stepData.value && stepData.value.germline) {
            germlineData.value.searchParams = stepData.value.germline.searchParams

            germlineData.value.selectedRows = stepData.value.germline.selectedRows
        }
    }).finally(() => {
        $q.loading.hide()
    })
    const tablefile = 'Mut_germline/germline.evidence'
    readTaskFile(route.params.id, tablefile).then((res) => {
        const items = getCsvData(res)
        germlineData.value.drugRows = items
        origingermlineData.value = JSON.stringify(germlineData.value)
    })
}

const loadSomaticData = () => {
    readTaskMuFile(route.params.id, 'Mut_somatic').then((res) => {
        const headNames = getCsvHeader(res, '\t')
        const colKeys = _.range(1, headNames.length + 1, 1).map((i) => 'col' + i)
        const csvRows = getCsvDataAndSetLineNumber(res, { splitter: '\t', hasHeaderLine: true, fields: colKeys })
        csvRows.forEach((row, i) => (row.id = i))

        // 提取options
        let positions = new Set()
        let meanings = new Set()
        let risks = new Set()
        for (let columns of csvRows) {
            const items = columns.col14.split(';')
            items.forEach((item) => positions.add(item))

            if (columns.col17 !== '.') {
                meanings.add(columns.col17)
            } else {
                meanings.add('●')
            }

            if (columns.col25 !== '.') {
                risks.add(columns.col25)
            } else {
                risks.add('●')
            }
        }
        somaticData.value.rows = csvRows
        somaticData.value.header = headNames
        somaticData.value.options.mutationPosition = Array.from(positions)
        somaticData.value.options.mutationMeaning = Array.from(meanings)
        somaticData.value.options.mutationRisk = Array.from(risks)
        originsomaticData.value = JSON.stringify(somaticData.value)
        if (stepData.value && stepData.value.somatic) {
            somaticData.value.searchParams = stepData.value.somatic.searchParams
            somaticData.value.selectedRows = stepData.value.somatic.selectedRows
        }
    })
    const tablefile = 'Mut_somatic/somatic.evidence'
    readTaskFile(route.params.id, tablefile).then((res) => {
        const items = getCsvData(res)
        somaticData.value.drugRows = items
        originsomaticData.value = JSON.stringify(somaticData.value)
    })
}
</script>

<template>
    <div>
        <q-btn
            v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            color="primary"
            class="relative-position float-right q-mr-md"
            label="已固定过滤"
        />
        <q-btn
            v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            outline
            color="primary"
            class="relative-position float-right q-mr-md"
            @click="stickFilter()"
        >固定过滤</q-btn>
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="relative-position float-right q-mr-md"
            @click="dlgVisible = !dlgVisible"
        >说明</q-btn>
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left"
            class="bg-grey-1"
            :breakpoint="0"
            dense
        >
            <q-tab name="胚系突变分析" label="胚系突变分析" v-if="props.viewConfig.showMutGermline" />
            <q-tab name="体细胞突变分析" label="体细胞突变分析" v-if="props.viewConfig.showMutSomatic" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated v-if="loaded">
            <q-tab-panel name="胚系突变分析">
                <GermlineMutationVue
                    :samples="props.samples"
                    :task="props.task"
                    ref="germlineMutationVue"
                    :rows="germlineData.rows"
                    :header="germlineData.header"
                    :options="germlineData.options"
                    :searchParams="germlineData.searchParams"
                    :drugRows="germlineData.drugRows"
                    :selectedRows="germlineData.selectedRows"
                    @filterChange="filterChange('germline',$event)"
                />
            </q-tab-panel>
            <q-tab-panel name="体细胞突变分析">
                <SomaticMutationVue
                    :samples="props.samples"
                    :task="props.task"
                    ref="somaticMutationVue"
                    :rows="somaticData.rows"
                    :header="somaticData.header"
                    :options="somaticData.options"
                    :searchParams="somaticData.searchParams"
                    :drugRows="somaticData.drugRows"
                    :selectedRows="somaticData.selectedRows"
                    @filterChange="filterChange('somatic',$event)"
                />
            </q-tab-panel>
        </q-tab-panels>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 800px; max-width: 2000px">
                <q-bar class="bg-primary text-white">突变分析</q-bar>
                <q-card-section>
                    <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">关闭</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { errorMessage } from 'src/utils/notify'
import { ref, onMounted, computed, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import GermlineMutationVue from './GermlineMutation.vue'
import SomaticMutationVue from './SomaticMutation.vue'

const route = useRoute()
const loaded = ref(false)
const tab = ref('胚系突变分析')
const dlgVisible = ref(false)
const emit = defineEmits('stickDone')
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
        ratio: null,
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

const filterData = ref({ somatic: {}, germline: {} })

onMounted(() => {
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
    if (name == 'germline') {
        germlineData.value.searchParams = data.searchParams
        germlineData.value.selectedRows = data.selectedRows
    }else{
        somaticData.value.searchParams = data.searchParams
        somaticData.value.selectedRows = data.selectedRows
    }
 }
 // 同步子组件的过滤参数
 const onSearchParamsChange = (name, data) => {
    if (name == 'germline') {
        germlineData.value.searchParams = data
    } else {
        somaticData.value.searchParams = data
    }
}
const stickFilter = () => {
    if (!filterData.value.germline && viewConfig.value.showMutGermline) {
        errorMessage('胚系突变分析未进行过滤')
        return false
    }
    if (!filterData.value.somatic && viewConfig.value.showMutSomatic) {
        errorMessage('体细胞突变分析未进行过滤')
        return false
    }
    emit('stickDone', filterData.value)
}

const loadGermlineData = () => {
    readTaskMuFile(route.params.id, 'Mut_germline').then((res) => {
        const headNames = getCsvHeader(res, ',')

        const colKeys = _.range(1, 150, 1).map((i) => 'col' + i)
        const csvRows = getCsvDataAndSetLineNumber(res, { splitter: ',', hasHeaderLine: true, fields: colKeys })
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
    })
    const tablefile = 'Mut_germline/germline.evidence'
    readTaskFile(route.params.id, tablefile).then((res) => {
        const items = getCsvData(res)
        germlineData.value.drugRows = items
    })
}

const loadSomaticData = () => {
    readTaskMuFile(route.params.id, 'Mut_somatic').then((res) => {
        const headNames = getCsvHeader(res, ',')
        const colKeys = _.range(1, 155, 1).map((i) => 'col' + i)
        const csvRows = getCsvDataAndSetLineNumber(res, { splitter: ',', hasHeaderLine: true, fields: colKeys })
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
    })
    const tablefile = 'Mut_somatic/somatic.evidence'
    readTaskFile(route.params.id, tablefile).then((res) => {
        const items = getCsvData(res)
        somaticData.value.drugRows = items
    })
}
</script>

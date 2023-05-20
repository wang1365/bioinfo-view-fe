<template>
    <div class="q-py-sm">
        <q-btn
            v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            color="primary"
            class="relative-position float-right q-mr-md"
            :label="$t('ReportStickDone')"
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
            :label="$t('ReportStickData')"
        />
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
            <q-tab
                name="单样品融合分析"
                :label="$t('SingleSampleFusionAnalysis')"
                v-if="props.viewConfig.showFusionGermline"
            />
            <q-tab
                name="体细胞融合分析"
                :label="$t('SomaticCellFusionAnalysis')"
                v-if="props.viewConfig.showFusionSomatic"
            />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="单样品融合分析">
                <Single
                    :samples="props.samples"
                    :qtRows="singleData.qt.rows"
                    :qtHeader="singleData.qt.header"
                    :qtSearchParam="singleData.qt.searchParam"
                    :qtSelectedRows="singleData.qt.selectedRows"
                    :qnRows="singleData.qn.rows"
                    :qnHeader="singleData.qn.header"
                    :qnSearchParam="singleData.qn.searchParam"
                    :qnSelectedRows="singleData.qn.selectedRows"
                    :showSticky="props.viewConfig.showStick"
                    :stickDone="props.viewConfig.stickDone"
                    :qt="singleData.qt"
                    :qn="singleData.qn"
                    @filterChange="filterChange('single', $event)"
                    ref="singleVue"
                />
            </q-tab-panel>
            <q-tab-panel name="体细胞融合分析">
                <NormalVue
                    :samples="props.samples"
                    :rows="normalData.rows"
                    :header="normalData.header"
                    :searchParam="normalData.searchParam"
                    :selectedRows="normalData.selectedRows"
                    :showSticky="props.viewConfig.showStick"
                    :stickDone="props.viewConfig.stickDone"
                    :url="normalData.url"
                    @filterChange="filterChange('normal', $event)"
                    ref="normalVue"
                />
            </q-tab-panel>
        </q-tab-panels>
        <q-separator class="bg-separator" />
        <!--        <div class="q-py-md">-->
        <!--            <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>-->
        <!--        </div>-->
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ $t('FusionAnalysis') }}</q-bar>
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
import { ref, onMounted, toRef, watch } from 'vue'
import NormalVue from './Normal.vue'
import Single from './Single.vue'
import { readTaskFile } from 'src/api/task'
import { getCsvData, getCsvDataAndSetLineNumber, getCsvHeader } from 'src/utils/csv'
import { getDualIdentifiers } from 'src/utils/samples'
import { useRoute } from 'vue-router'
import { errorMessage } from 'src/utils/notify'
import { globalStore }from 'src/stores/global'
import { storeToRefs } from 'pinia'

const store = globalStore()
const { langCode } = storeToRefs(store)
const singleVue = ref(null)
const normalVue = ref(null)
const route = useRoute()
const tab = ref('单样品融合分析')
const dlgVisible = ref(false)

const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    task: {
        type: Object,
        required: true,
        default: () => {},
    },
    samples: {
        type: Array,
        required: true,
        default: () => [],
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showFusionGermline: true,
                showFusionSomatic: true,
                showStick: false,
            }
        },
    },
    stepData: {
        type: Object,
        default: () => { }
    }
})

const singleData = ref({
    qt: {
        rows: [],
        header: [],
        searchParam: '',
        selectedRows: [],
    },
    qn: {
        rows: [],
        header: [],
        searchParam: '',
        selectedRows: [],
    },
})

const normalData = ref({
    rows: [],
    header: [],
    searchParam: '',
    selectedRows: [],
})
const filterData = ref({})
const emit = defineEmits(['stickDone', 'reset'])
const viewConfig = toRef(props, 'viewConfig')
const samples = toRef(props, 'samples')
const stepData = toRef(props, 'stepData')

onMounted(() => {
    console.log('mounted')
    loadData()
})

const filterChange = (name, data) => {
    if (name === 'normal') {
        filterData.value.normal = data
        normalData.value.searchParam = data.searchParam
        normalData.value.selectedRows = data.selectedRows
    } else if (name === 'single') {
        filterData.value.single = data
        singleData.value.qt.searchParam = data.qt.searchParam
        singleData.value.qn.searchParam = data.qn.searchParam
        singleData.value.qt.selectedRows = data.qt.selectedRows
        singleData.value.qn.selectedRows = data.qn.selectedRows
    }
}

const stickFilter = () => {
    if (viewConfig.value.showFusionGermline && !filterData.value.single) {
        if (singleVue.value) {
            filterData.value.single = singleVue.value.getChangedData()
        } else {
            errorMessage('单样品融合没有过滤数据')
            return false
        }
    }
    if (viewConfig.value.showFusionSomatic && !filterData.value.normal) {
        if (normalVue.value) {
            try {
                filterData.value.single = singleVue.value.getChangedData()

            } catch (error) {

            }
        }
    }
    emit('stickDone', filterData.value)
}
const reset = () => {
    emit('reset', null)
    // try {
    //     singleVue.value.reset()
    // } catch (error) {

    // }
    // try {
    //     normalVue.value.reset()
    // } catch (error) {

    // }

    singleData.value.qt.searchParam = ''
    singleData.value.qt.selectedRows = []
    singleData.value.qn.searchParam = ''
    singleData.value.qn.selectedRows = []
    normalData.value.searchParam = ''
    normalData.value.selectedRows = []
}
watch([samples, langCode], () => {
    loadData()
})

const loadData = () => {
    console.log(viewConfig.value)
    if (viewConfig.value.showFusionGermline) {
        loadSingleData()
    }
    if (viewConfig.value.showFusionSomatic) {
        loadNormalData()
    }
}

const loadSingleData = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'

    const fields = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const { qt, qn } = getDualIdentifiers(samples.value)
    if (!qt) return
    const qtFile = `fusion_germline/${qt}_${suffix}.fusions`
    readTaskFile(route.params.id, qtFile).then((res) => {
        const lines = getCsvDataAndSetLineNumber(res, { fields: fields, hasHeaderLine: true })
        let header = getCsvHeader(res)
        header.splice(header.length - 1, 1)
        header.push('Igv')
        singleData.value.qt.header = header
        singleData.value.qt.rows = lines
        singleData.value.qt.url = `igv${props.task.result_dir}/${qtFile}`
        if (stepData.value && stepData.value.single) {
            if (stepData.value.single.qt) {
                singleData.value.qt.searchParam = stepData.value.single.qt.searchParam
                singleData.value.qt.selectedRows = stepData.value.single.qt.selectedRows
            }
        }
    })
    if (samples.value.length > 1) {
        const qnFile = `fusion_germline/${qn}_${suffix}.fusions`
        readTaskFile(route.params.id, qnFile).then((res) => {
            const lines = getCsvDataAndSetLineNumber(res, { fields: fields, hasHeaderLine: true })
            let header = getCsvHeader(res)
            header.splice(header.length - 1, 1)
            header.push('Igv')
            singleData.value.qn.header = header
            singleData.value.qn.rows = lines
            singleData.value.qn.url = `igv${props.task.result_dir}/${qnFile}`
            if (stepData.value && stepData.value.single) {
                if (stepData.value.single.qn) {
                    singleData.value.qn.searchParam = stepData.value.single.qn.searchParam
                    singleData.value.qn.selectedRows = stepData.value.single.qn.selectedRows
                }
            }
        })
    }
}
const loadNormalData = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    const fields = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const { qt, qn } = getDualIdentifiers(props.samples)
    if (!qt || !qn) return
    const filePath = `fusion_somatic/${qn}_${qt}_${suffix}.somatic_fusions`
    readTaskFile(route.params.id, filePath).then((res) => {
        const lines = getCsvDataAndSetLineNumber(res, { fields, hasHeaderLine: true })
        // let header = getCsvHeader(res)
        // header.splice(header.length - 1, 1)
        // header.push('Igv')
        normalData.value.header = getCsvHeader(res)
        normalData.value.rows = lines
        normalData.value.url = `igv${props.task.result_dir}/${filePath}`
        if (stepData.value && stepData.value.normal) {
            normalData.value.searchParam = stepData.value.normal.searchParam
            normalData.value.selectedRows = stepData.value.normal.selectedRows
        }
    })
}
</script>

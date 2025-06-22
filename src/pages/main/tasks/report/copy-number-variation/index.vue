<template>
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
        >{{ $t('Intro') }}</q-btn
    >
    <div>
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
                name="拷贝数变异分析"
                :label="$t('CopyNumberVariationAnalysis')"
                v-if="props.viewConfig.showCNVcircos || props.viewConfig.showCNVtable"
            />
            <q-tab name="WES突变分析" :label="$t('WES突变分析')" v-if="props.viewConfig.showCNVWES" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="拷贝数变异分析">
                <CNVTable
                    ref="cnvTableVue"
                    :info="props.intro"
                    :task="props.task"
                    :samples="props.samples"
                    :viewConfig="props.viewConfig"
                    :stepData="props.stepData"
                    @filterChange="filterChange('cnvtable', $event)"
                ></CNVTable>
            </q-tab-panel>
            <q-tab-panel name="WES突变分析">
                <CNVWES
                    ref="cnvWESVue"
                    :samples="props.samples"
                    :task="props.task"
                    :viewConfig="props.viewConfig"
                    :stepData="props.stepData"
                />
            </q-tab-panel>
        </q-tab-panels>
    </div>

    <q-dialog v-model="dlgVisible">
        <q-card style="width: 75%; max-width: 2000px">
            <q-bar class="bg-primary text-white">{{ $t('CopyNumberVariationAnalysis') }}</q-bar>
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
import { ref, computed, watch, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from "vue-i18n"
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import CNVWES from "./CNVWES.vue"
import CNVTable from "./CNVTable.vue"

const cnvTableVue = ref(null)
const cnvWESVue = ref(null)
const tab = ref('拷贝数变异分析')
const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n()

// hg19基因组数据，/data/bioinfo/database_dir/hg19/hg19_genome/hg19.length
// hg38基因组数据，/data/bioinfo/database_dir/hg38/hg38_genome/hg38.length
const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    task: {
        type: Object,
        required: true,
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
                showCNVcircos: true,
                showCNVtable: true,
                showSticky: false,
                showCNVWES: false,
            }
        },
    },
    stepData: {
        type: Object,
        default: () => { }
    }
})

watch(langCode, v => loadData())

watch(props.samples,v=>console.log("samples ----------",v))

const dlgVisible = ref(false)

const emit = defineEmits(['stickDone', 'reset'])
const stickFilter = () => {
    if (cnvTableVue.value) {
        try {
            console.log(cnvTableVue.value)
            let data = cnvTableVue.value.getChangedData()
            emit('stickDone', data)
        }
        catch (e) {
            console.log(e)
        }
    }
}

const filterChange = (data) => {
    emit('stickDone', data)
}
const reset = () => {

    emit('reset', null)
    if (cnvTableVue.value) {
        try {
            cnvTableVue.value.reset()

        } catch (e) {
            console.log(e)
        }
    }
}
</script>

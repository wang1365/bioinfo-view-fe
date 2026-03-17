<template>
    <div>
        <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary">
            <q-tab name="positive" :label="t('Rp2PositiveStatsTab')" />
            <q-tab name="species" :label="t('Rp2PathogenSummaryTab')" />
            <q-tab name="pathogenType" :label="t('Rp2PathogenTypeTab')" />
            <q-tab name="ncOverlap" :label="t('Rp2NcOverlapTab')" />
            <q-tab name="similarity" :label="t('Rp2SimilarityTab')" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="positive">
                <TextFileTable
                    :task-id="taskId"
                    cn-file="menu/analysis_positive_negative_stats.CN.txt"
                    en-file="menu/analysis_positive_negative_stats.EN.txt"
                />
                <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-6">
                        <ImageCard :src="plotImage('positive_negative_bar')" :title="t('Rp2BarChart')" />
                    </div>
                    <div class="col-12 col-md-6">
                        <ImageCard :src="plotImage('positive_negative_pie')" :title="t('Rp2PieChart')" />
                    </div>
                </div>
            </q-tab-panel>

            <q-tab-panel name="species">
                <TextFileTable
                    :task-id="taskId"
                    cn-file="menu/analysis_pathogen_summary.CN.txt"
                    en-file="menu/analysis_pathogen_summary.EN.txt"
                />
                <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-6">
                        <ImageCard :src="plotImage('pathogen_pie')" :title="t('Rp2PieChart')" />
                    </div>
                    <div class="col-12 col-md-6">
                        <ImageCard :src="plotImage('pathogen_bar')" :title="t('Rp2BarChart')" />
                    </div>
                </div>
            </q-tab-panel>

            <q-tab-panel name="pathogenType">
                <TextFileTable
                    :task-id="taskId"
                    cn-file="menu/analysis_sample_pathogen_count.CN.add.txt"
                    en-file="menu/analysis_sample_pathogen_count.EN.add.txt"
                />
                <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-6">
                        <ImageCard :src="plotImage('by_type_bar')" :title="t('Rp2BarChart')" />
                    </div>
                </div>
            </q-tab-panel>

            <q-tab-panel name="ncOverlap">
                <TextFileTable
                    :task-id="taskId"
                    :title="t('Rp2TableOne')"
                    cn-file="menu/analysis_NC_overlap_stats.CN.add.txt"
                    en-file="menu/analysis_NC_overlap_stats.EN.add.txt"
                />
                <div class="q-mt-md">
                    <TextFileTable
                        :task-id="taskId"
                        :title="t('Rp2TableTwo')"
                        cn-file="menu/analysis_NC_overlap_stats.CN.txt"
                        en-file="menu/analysis_NC_overlap_stats.EN.txt"
                    />
                </div>
            </q-tab-panel>

            <q-tab-panel name="similarity">
                <TextFileTable
                    :task-id="taskId"
                    cn-file="menu/analysis_sample_similarity.CN.txt"
                    en-file="menu/analysis_sample_similarity.EN.txt"
                />
                <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-8">
                        <ImageCard :src="plotImage('similarity_heatmap')" :title="t('Rp2Heatmap')" />
                    </div>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import TextFileTable from './TextFileTable.vue'
import ImageCard from './imageCard.vue'

const props = defineProps({
    taskId: {
        type: [String, Number],
        required: true
    },
    taskRootDir: {
        type: String,
        default: ''
    }
})

const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)
const tab = ref('positive')
const imagePrefix = computed(() => (langCode.value === 'en' ? 'en' : 'cn'))

const imagePath = (relativePath) => {
    if (!props.taskRootDir) {
        return ''
    }

    const root = String(props.taskRootDir).replace(/\\/g, '/').replace(/\/+$/, '')
    return `/igv${root}/${relativePath}`.replace(/\/{2,}/g, '/')
}

const plotImage = (name) => imagePath(`menu/plots/${imagePrefix.value}_${name}.png`)
</script>

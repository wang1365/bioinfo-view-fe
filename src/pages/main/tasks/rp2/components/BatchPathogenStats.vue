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
                        <ImageCard :src="imagePath('menu/plots/cn_positive_negative_bar.png')" :title="t('Rp2BarChart')" />
                    </div>
                    <div class="col-12 col-md-6">
                        <ImageCard :src="imagePath('menu/plots/cn_positive_negative_pie.png')" :title="t('Rp2PieChart')" />
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
                        <ImageCard :src="imagePath('menu/plots/cn_pathogen_pie.png')" :title="t('Rp2PieChart')" />
                    </div>
                    <div class="col-12 col-md-6">
                        <ImageCard :src="imagePath('menu/plots/cn_pathogen_bar.png')" :title="t('Rp2BarChart')" />
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
                        <ImageCard :src="imagePath('menu/plots/cn_by_type_bar.png')" :title="t('Rp2BarChart')" />
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
                        <ImageCard :src="imagePath('menu/plots/similarity_heatmap.png')" :title="t('Rp2Heatmap')" />
                    </div>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
const tab = ref('positive')

const imagePath = (relativePath) => {
    if (!props.taskRootDir) {
        return ''
    }

    return `/igv${props.taskRootDir}/${relativePath}`
}
</script>

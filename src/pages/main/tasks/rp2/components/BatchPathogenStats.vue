<template>
    <div class="rp2-batch-pathogen-stats">
        <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary" class="rp2-stats-tabs">
            <q-tab name="positive" :label="t('Rp2PositiveStatsTab')" />
            <q-tab name="species" :label="t('Rp2PathogenSummaryTab')" />
            <q-tab name="pathogenType" :label="t('Rp2PathogenTypeTab')" />
            <q-tab name="ncOverlap" :label="t('Rp2NcOverlapTab')" />
            <q-tab name="similarity" :label="t('Rp2SimilarityTab')" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated class="rp2-batch-pathogen-stats__panels">
            <q-tab-panel name="positive">
                <BatchPositiveStatsTab :task-id="taskId" :task-root-dir="taskRootDir" :active="tab === 'positive'" />
            </q-tab-panel>

            <q-tab-panel name="species">
                <BatchSpeciesStatsTab :task-id="taskId" :task-root-dir="taskRootDir" :active="tab === 'species'" />
            </q-tab-panel>

            <q-tab-panel name="pathogenType">
                <BatchPathogenTypeStatsTab :task-id="taskId" :task-root-dir="taskRootDir" :active="tab === 'pathogenType'" />
            </q-tab-panel>

            <q-tab-panel name="ncOverlap">
                <BatchNcOverlapStatsTab :task-id="taskId" :task-root-dir="taskRootDir" />
            </q-tab-panel>

            <q-tab-panel name="similarity">
                <BatchSimilarityStatsTab :task-id="taskId" :task-root-dir="taskRootDir" :active="tab === 'similarity'" />
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup lang="js">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BatchPositiveStatsTab from './batch-tabs/BatchPositiveStatsTab.vue'
import BatchSpeciesStatsTab from './batch-tabs/BatchSpeciesStatsTab.vue'
import BatchPathogenTypeStatsTab from './batch-tabs/BatchPathogenTypeStatsTab.vue'
import BatchNcOverlapStatsTab from './batch-tabs/BatchNcOverlapStatsTab.vue'
import BatchSimilarityStatsTab from './batch-tabs/BatchSimilarityStatsTab.vue'

defineProps({
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
</script>

<style scoped>
.rp2-batch-pathogen-stats {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.rp2-batch-pathogen-stats__panels {
    min-height: 0;
}

.rp2-batch-pathogen-stats__panels :deep(.q-tab-panel) {
    padding-left: 0;
    padding-right: 0;
}

:deep(.rp2-stats-tabs) {
    border-bottom: 1px solid #d8e2ef;
    padding: 0 4px;
}

:deep(.rp2-stats-tabs .q-tab) {
    margin-right: 6px;
    border: 1px solid #d8e2ef;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    background: #f4f7fb;
    min-height: 34px;
    padding: 0 12px;
    color: #4f5d75;
}

:deep(.rp2-stats-tabs .q-tab__content) {
    min-width: 0;
    padding: 0;
}

:deep(.rp2-stats-tabs .q-tab__label) {
    font-size: 13px;
    line-height: 1.1;
}

:deep(.rp2-stats-tabs .q-tab:last-child) {
    margin-right: 0;
}

:deep(.rp2-stats-tabs .q-tab--active) {
    background: #fff;
    border-color: #78a9ff;
    color: #1677ff;
    font-weight: 600;
}

:deep(.rp2-stats-tabs .q-tab__indicator) {
    height: 2px;
}
</style>

<template>
    <TextFileTable
        :task-id="taskId"
        :task-root-dir="taskRootDir"
        :title="t('Rp2NcOverlapTab')"
        cn-file="menu/analysis_NC_overlap_stats.CN.add.txt"
        en-file="menu/analysis_NC_overlap_stats.EN.add.txt"
        :column-widths="[120, 120, 120, 120, 120, 120, 80, 80, 80, 80, 360]"
    />
</template>

<script setup lang="js">
import { useI18n } from 'vue-i18n'
import TextFileTable from '../TextFileTable.vue'

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
</script>

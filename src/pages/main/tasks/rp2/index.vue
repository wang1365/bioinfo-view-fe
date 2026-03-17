<template>
    <q-page style="padding: 10px; overflow: auto; height: 90vh">
        <div class="row items-center">
            <h6>{{ pageTitle }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" class="q-mr-lg" color="primary" flat @click="router.back()" />
        </div>

        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-5"
            align="justify"
            class="bg-grey-2 shadow-2"
            indicator-color="primary"
            inline-label
            :breakpoint="0"
            dense
        >
            <q-tab name="sampleList" :label="$t('Rp2SampleList')" icon="list" />
            <q-tab name="basicQc" :label="$t('Rp2BasicQcTab')" icon="fact_check" />
            <q-tab name="ncQc" :label="$t('Rp2NcQcTab')" icon="science" />
            <q-tab name="contaminationQc" :label="$t('Rp2ContaminationQcTab')" icon="biotech" />
            <q-tab name="batchStats" :label="$t('Rp2BatchStats')" icon="analytics" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="sampleList">
                <SampleList :task-id="taskId" />
            </q-tab-panel>
            <q-tab-panel name="basicQc">
                <TextFileTable
                    :task-id="taskId"
                    :title="$t('Rp2BasicQcTableTitle')"
                    cn-file="menu/ALL.QC.base.CN.txt"
                    en-file="menu/ALL.QC.base.CN.txt"
                />
            </q-tab-panel>
            <q-tab-panel name="ncQc">
                <TextFileTable
                    :task-id="taskId"
                    :title="$t('Rp2NcResultTableTitle')"
                    cn-file="menu/NC.CN.info"
                    en-file="menu/NC.CN.info"
                    :column-widths="[160]"
                />
                <div class="q-mt-md">
                    <TextFileTable
                        :task-id="taskId"
                        :title="$t('Rp2NcMarkTableTitle')"
                        cn-file="menu/merged_results.NCmark.CN.txt"
                        en-file="menu/merged_results.NCmark.CN.txt"
                        :compact-first-two-columns="true"
                    />
                </div>
            </q-tab-panel>
            <q-tab-panel name="contaminationQc">
                <TextFileTable
                    :task-id="taskId"
                    :title="$t('Rp2TagContaminationTableTitle')"
                    cn-file="menu/Contamination.CN.txt"
                    en-file="menu/Contamination.CN.txt"
                    :column-widths="[160, null, null, null, 110]"
                />
                <div class="q-mt-md">
                    <TextFileTable
                        :task-id="taskId"
                        :title="$t('Rp2InternalControlTableTitle')"
                        cn-file="menu/InternalControl.CN.txt"
                        en-file="menu/InternalControl.CN.txt"
                    />
                </div>
            </q-tab-panel>
            <q-tab-panel name="batchStats">
                <BatchPathogenStats :task-id="taskId" :task-root-dir="taskRootDir" />
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getTask } from 'src/api/task'
import SampleList from './components/SampleList.vue'
import BatchPathogenStats from './components/BatchPathogenStats.vue'
import TextFileTable from './components/TextFileTable.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const taskId = route.params.id
const taskRootDir = ref('')
const taskName = ref('')
const tab = ref('sampleList')
const pageTitle = computed(() => {
    return taskName.value ? `"${taskName.value}" ${t('Rp2SummaryTitleSuffix')}` : t('Rp2PageTitle')
})

onMounted(async () => {
    try {
        const task = await getTask(taskId)
        taskName.value = task?.name || ''
        const resultDir = (task?.result_dir || '').replace(/\\/g, '/')
        taskRootDir.value = resultDir.replace(/\/result\/?$/, '')
    } catch (error) {
        taskRootDir.value = ''
    }
})
</script>

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
                <IntroHelpButton :title="$t('Rp2SampleList')" />
                <SampleList :task-id="taskId" />
            </q-tab-panel>
            <q-tab-panel name="basicQc">
                <IntroHelpButton :title="$t('Rp2BasicQcTab')" />
                <TextFileTable
                    :task-id="taskId"
                    :title="$t('Rp2BasicQcTableTitle')"
                    cn-file="menu/ALL.QC.base.CN.add.txt"
                    en-file="menu/ALL.QC.base.EN.add.txt"
                />
            </q-tab-panel>
            <q-tab-panel name="ncQc">
                <IntroHelpButton :title="$t('Rp2NcQcTab')" />
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
                        cn-file="menu/merged_results.NCmark.CN.add.txt"
                        en-file="menu/merged_results.NCmark.EN.add.txt"
                        :compact-first-two-columns="true"
                        :column-widths="[160, 170]"
                        :hidden-header-aliases="['是否NC', 'isnc', '耐药基因', 'drug resistance genes', 'resistance genes']"
                    />
                </div>
            </q-tab-panel>
            <q-tab-panel name="contaminationQc">
                <IntroHelpButton :title="$t('Rp2ContaminationQcTab')" />
                <q-tabs v-model="contaminationTab" dense active-color="primary" align="left" indicator-color="primary">
                    <q-tab name="contaminationTag" :label="$t('Rp2TagContaminationTableTitle')" />
                    <q-tab name="internalControl" :label="$t('Rp2InternalControlTableTitle')" />
                </q-tabs>
                <q-tab-panels v-model="contaminationTab" animated>
                    <q-tab-panel name="contaminationTag" class="q-px-none">
                        <TextFileTable
                            :task-id="taskId"
                            :title="$t('Rp2TagContaminationTableTitle')"
                            cn-file="menu/Contamination.CN.add.txt"
                            en-file="menu/Contamination.EN.add.txt"
                            :column-widths="[160, null, null, null, 110]"
                        />
                    </q-tab-panel>
                    <q-tab-panel name="internalControl" class="q-px-none">
                        <TextFileTable
                            :task-id="taskId"
                            :title="$t('Rp2InternalControlTableTitle')"
                            cn-file="menu/InternalControl.CN.add.txt"
                            en-file="menu/InternalControl.EN.add.txt"
                        />
                    </q-tab-panel>
                </q-tab-panels>
            </q-tab-panel>
            <q-tab-panel name="batchStats">
                <IntroHelpButton :title="$t('Rp2BatchStats')" />
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
import IntroHelpButton from './components/IntroHelpButton.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const taskId = route.params.id
const taskRootDir = ref('')
const taskName = ref('')
const tab = ref('sampleList')
const contaminationTab = ref('contaminationTag')
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

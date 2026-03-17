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
            <q-tab name="batchStats" :label="$t('Rp2BatchStats')" icon="analytics" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="sampleList">
                <SampleList :task-id="taskId" />
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
        const resultDir = task?.result_dir || ''
        taskRootDir.value = resultDir.endsWith('/result')
            ? resultDir.slice(0, -('/result'.length))
            : resultDir
    } catch (error) {
        taskRootDir.value = ''
    }
})
</script>

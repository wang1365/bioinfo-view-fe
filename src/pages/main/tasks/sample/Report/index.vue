<template>
    <q-page style="padding: 10px; overflow: auto; height: 90vh">
        <div class="row items-center">
            <h6 class="q-my-none">
                <span class="task-link" @click="goBack">{{ taskName || '-' }}</span>
                <span class="q-mx-sm">/</span>
                <span>{{ sampleName }}</span>
            </h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" class="q-mr-lg" color="primary" flat @click="goBack" />
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
            <q-tab name="bacteria" :label="$t('Bacteria')" />
            <q-tab name="fungus" :label="$t('Fungus')" />
            <q-tab name="virus" :label="$t('Virus')" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="bacteria">
                <IntroHelpButton :title="$t('Bacteria')" />
                <SamplePathogenTable :task-id="taskId" :sample-name="sampleName" category="bacteria" />
            </q-tab-panel>
            <q-tab-panel name="fungus">
                <IntroHelpButton :title="$t('Fungus')" />
                <SamplePathogenTable :task-id="taskId" :sample-name="sampleName" category="fungus" />
            </q-tab-panel>
            <q-tab-panel name="virus">
                <IntroHelpButton :title="$t('Virus')" />
                <SamplePathogenTable :task-id="taskId" :sample-name="sampleName" category="virus" />
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTask } from 'src/api/task'
import SamplePathogenTable from '../../rp2/components/SamplePathogenTable.vue'
import IntroHelpButton from '../../rp2/components/IntroHelpButton.vue'

const route = useRoute()
const router = useRouter()

const tab = ref('bacteria')
const taskId = computed(() => route.params.id)
const sampleName = computed(() => decodeURIComponent(route.params.sampleId || ''))
const taskName = ref('')

const goBack = () => {
    router.push(`/main/tasks/${taskId.value}/rp2`)
}

onMounted(async () => {
    try {
        const task = await getTask(taskId.value)
        taskName.value = task?.name || ''
    } catch (error) {
        taskName.value = ''
    }
})
</script>

<style scoped>
.task-link {
    color: var(--q-primary);
    cursor: pointer;
}

.task-link:hover {
    text-decoration: underline;
}
</style>

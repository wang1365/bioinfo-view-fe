<template>
    <q-page style="padding: 10px; overflow: auto; height: 90vh">
        <div class="row items-center">
            <h6>{{ $t('Rp2PageTitle') }} - {{ sampleName }}</h6>
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
                <SamplePathogenTable :task-id="taskId" :sample-name="sampleName" category="bacteria" />
            </q-tab-panel>
            <q-tab-panel name="fungus">
                <SamplePathogenTable :task-id="taskId" :sample-name="sampleName" category="fungus" />
            </q-tab-panel>
            <q-tab-panel name="virus">
                <SamplePathogenTable :task-id="taskId" :sample-name="sampleName" category="virus" />
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SamplePathogenTable from '../../rp2/components/SamplePathogenTable.vue'

const route = useRoute()
const router = useRouter()

const tab = ref('bacteria')
const taskId = computed(() => route.params.id)
const sampleName = computed(() => decodeURIComponent(route.params.sampleId || ''))

const goBack = () => {
    router.push(`/main/tasks/${taskId.value}/rp2`)
}
</script>

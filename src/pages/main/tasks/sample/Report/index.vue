<template>
    <q-page style="padding: 10px; overflow: auto; height: 90vh">
        <div class="row items-center">
            <h6>{{ $t('Rp2PageTitle') }} - {{ sampleName }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" class="q-mr-lg" color="primary" flat @click="goBack" />
        </div>
        <div class="q-pt-xs">
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
                <q-tab name="contamination" :label="$t('Rp2Contamination')" icon="warning" />
                <q-tab
                    v-for="(commonTab, i) in commonTabs"
                    :key="`commonTab${i}`"
                    :name="`commonTab${i}`"
                    :label="commonTab.title"
                    :icon="commonTab.icon || 'web_stories'"
                />
            </q-tabs>
            <q-tab-panels v-model="tab" animated v-if="sampleLoaded">
                <q-tab-panel name="contamination">
                    <div class="text-center q-pa-xl text-grey">
                        <q-icon name="construction" size="64px" class="q-mb-md" />
                        <div class="text-h6">{{ $t('Rp2Contamination') }}</div>
                        <div class="text-body2 q-mt-sm">{{ $t('ComingSoon') }}</div>
                    </div>
                </q-tab-panel>
                <q-tab-panel
                    v-for="(commonTab, i) in commonTabs"
                    :key="`commonTab${i}`"
                    :name="`commonTab${i}`"
                >
                    <CommonModuleVue :viewConfig="commonTab" :task="taskDetail" :enablePagination="true" />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useApi } from 'src/api/apiBase'
import { getTask, readTaskFile } from 'src/api/task'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import CommonModuleVue from '../../report/common-module/index.vue'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { errorMessage } from 'src/utils/notify'
import { nextTick } from 'vue'

const store = globalStore()
const route = useRoute()
const router = useRouter()
const { apiPost } = useApi()
const { t } = useI18n()
const { langCode } = storeToRefs(store)

const tab = ref('contamination')
const taskDetail = ref({})
const sample = ref(null)
const sampleName = ref('')
const sampleLoaded = ref(false)
const commonTabs = ref([])
const intros = ref({})

const taskId = computed(() => route.params.id)
const sampleId = computed(() => route.params.sampleId)

onMounted(() => {
    loadSampleAndTask()
})

watch(langCode, lc => {
    nextTick(() => readSampleResultAndModuleJson())
})

const loadSampleAndTask = async () => {
    // Load task details
    const taskRes = await getTask(taskId.value)
    taskDetail.value = taskRes

    // Load sample details
    const query = buildModelQuery([], { id: sampleId.value })
    apiPost(
        `/model_query/sample`,
        (res) => {
            if (res.data.results && res.data.results.length > 0) {
                sample.value = res.data.results[0]
                sampleName.value = sample.value.identifier || sample.value.name || sampleId.value
                sampleLoaded.value = true
                readSampleResultAndModuleJson()
            } else {
                errorMessage('Sample not found')
            }
        },
        query
    )
}

const readSampleResultAndModuleJson = async () => {
    if (!sampleName.value) return

    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    const samplePathPrefix = sampleName.value

    // Read sample-scoped result file
    try {
        let res = await readTaskFile(taskId.value, `${samplePathPrefix}/result_${suffix}.json`, true)
        if (res) {
            const raw = JSON.parse(res)
            intros.value = raw
        }
    } catch (error) {
        console.log('Sample result file not found or invalid:', error)
        intros.value = {}
    }

    // Read sample-scoped module file
    try {
        let res = await readTaskFile(taskId.value, `${samplePathPrefix}/module_${suffix}.json`, true)
        if (res) {
            let data = null
            try {
                data = JSON.parse(res)
            } catch (error) {
                // Try to fix JSON with extra commas
                try {
                    data = JSON.parse(res.replace(/,[ \t\r\n]+}/g, '}').replace(/,[ \t\r\n]+\]/g, ']'))
                } catch (error) {
                    errorMessage(`module.json file content is not valid JSON format`)
                }
            }

            if (data) {
                // Parse commonModules
                commonTabs.value = []
                if (data.commonModules && Array.isArray(data.commonModules)) {
                    data.commonModules.forEach((item, i) => {
                        commonTabs.value.push({
                            key: `commonTab${i}`,
                            title: item.title || item.name || `${t('CommonModule')} ${i + 1}`,
                            icon: item.icon || 'web_stories',
                            ...item
                        })
                    })
                }

                // Set initial active tab
                tab.value = 'contamination'
            }
        }
    } catch (error) {
        console.log('Sample module file not found:', error)
        commonTabs.value = []
    }
}

const goBack = () => {
    router.push(`/main/tasks/${taskId.value}/rp2`)
}
</script>

<style scoped>
</style>

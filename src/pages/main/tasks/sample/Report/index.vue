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
            <q-tab name="bacteria" :label="$t('Bacteria')" icon="biotech" />
            <q-tab name="fungus" :label="$t('Fungus')" icon="spa" />
            <q-tab name="virus" :label="$t('Virus')" icon="coronavirus" />
            <q-tab
                v-for="(moduleItem, index) in customModules"
                :key="`sample-custom-tab-${index}`"
                :name="customTabName(index)"
                :label="moduleItem.title || `Module ${index + 1}`"
                icon="widgets"
            />
        </q-tabs>

        <div class="sample-panels-wrap">
            <div v-if="showOuterIntro" class="sample-panel-intro">
                <IntroHelpButton :title="introTitle" :disable-float="true" />
            </div>
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
                <q-tab-panel
                    v-for="(moduleItem, index) in customModules"
                    :key="`sample-custom-panel-${index}`"
                    :name="customTabName(index)"
                    class="sample-custom-panel"
                >
                    <CommonModuleVue
                        :view-config="moduleItem"
                        :task="taskForCommonModule"
                        :enable-pagination="true"
                        :show-row-selection="false"
                        :file-base-dir="sampleName"
                        :from-task-root="true"
                        :enhanced-table-border="true"
                    />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getTask, readTaskFile } from 'src/api/task'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import SamplePathogenTable from '../../rp2/components/SamplePathogenTable.vue'
import IntroHelpButton from '../../rp2/components/IntroHelpButton.vue'
import CommonModuleVue from '../../report/common-module/index.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const tab = ref('bacteria')
const taskId = computed(() => route.params.id)
const sampleName = computed(() => decodeURIComponent(route.params.sampleId || ''))
const taskName = ref('')
const taskDetail = ref({ id: taskId.value })
const customModules = ref([])
const taskForCommonModule = computed(() => ({ id: taskDetail.value?.id || taskId.value }))
const customTabName = (index) => `sampleCustomTab${index}`
const showOuterIntro = computed(() => !tab.value.startsWith('sampleCustomTab'))
const introTitle = computed(() => {
    if (tab.value.startsWith('sampleCustomTab')) {
        const index = Number(tab.value.replace('sampleCustomTab', ''))
        return customModules.value?.[index]?.title || t('Intro')
    }
    if (tab.value === 'fungus') {
        return t('Fungus')
    }
    if (tab.value === 'virus') {
        return t('Virus')
    }
    return t('Bacteria')
})

const goBack = () => {
    router.replace(`/main/tasks/${taskId.value}/rp2`)
}

const tryParseJson = (text) => {
    if (!text) {
        return null
    }
    try {
        return JSON.parse(text)
    } catch (error) {
        try {
            return JSON.parse(String(text).replace(/,[ \t\r\n]+}/g, '}').replace(/,[ \t\r\n]+\]/g, ']'))
        } catch (ignored) {
            return null
        }
    }
}

const extractCustomModules = (rawConfig) => {
    if (!rawConfig) {
        return []
    }
    if (Array.isArray(rawConfig.commonModules)) {
        return rawConfig.commonModules
    }
    if (Array.isArray(rawConfig.modules)) {
        return rawConfig.modules
    }
    if (Array.isArray(rawConfig.tabs)) {
        return rawConfig.tabs
    }
    if (Array.isArray(rawConfig)) {
        return rawConfig
    }
    const fallback = []
    Object.entries(rawConfig).forEach(([key, value]) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return
        }
        if (value.tables || value.images || value.files || value.descriptionFile) {
            fallback.push({
                title: value.title || key,
                ...value
            })
        }
    })
    return fallback
}

const loadCustomModules = async () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    const candidates = [`${sampleName.value}/module_${suffix}.json`]

    let configText = ''
    for (const path of candidates) {
        try {
            configText = await readTaskFile(taskId.value, path, true, true)
            if (typeof configText === 'string' && configText.trim()) {
                break
            }
        } catch (error) {
            configText = ''
        }
    }

    const configJson = tryParseJson(typeof configText === 'string' ? configText : '')
    customModules.value = extractCustomModules(configJson)
}

onMounted(async () => {
    try {
        const task = await getTask(taskId.value)
        taskDetail.value = task || { id: taskId.value }
        taskName.value = task?.name || ''
    } catch (error) {
        taskDetail.value = { id: taskId.value }
        taskName.value = ''
    } finally {
        await loadCustomModules()
    }
})

watch(
    () => [langCode.value, sampleName.value, taskId.value],
    loadCustomModules
)
</script>

<style scoped>
.task-link {
    color: var(--q-primary);
    cursor: pointer;
}

.task-link:hover {
    text-decoration: underline;
}

.sample-panels-wrap {
    position: relative;
}

.sample-panel-intro {
    position: absolute;
    top: 8px;
    right: 12px;
    z-index: 5;
}

.sample-panel-intro :deep(.intro-help-float) {
    float: none;
    margin: 0;
}

.sample-panels-wrap :deep(.q-tab-panel) {
    padding-top: 52px;
}

.sample-panels-wrap :deep(.sample-custom-panel) {
    padding-top: 12px;
}

.sample-panels-wrap :deep(.ant-table-wrapper) {
    width: 100%;
}

.sample-panels-wrap :deep(.ant-table) {
    width: 100%;
}
</style>

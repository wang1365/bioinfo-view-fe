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
            <q-tab
                v-for="(moduleItem, index) in customModules"
                :key="`rp2-custom-tab-${index}`"
                :name="customTabName(index)"
                :label="moduleItem.title || `Module ${index + 1}`"
                icon="widgets"
            />
            <q-tab name="batchStats" :label="$t('Rp2BatchStats')" icon="analytics" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="sampleList">
                <div class="rp2-tab-wrap rp2-tab-wrap--no-intro">
                    <SampleList :task-id="taskId" />
                </div>
            </q-tab-panel>
            <q-tab-panel
                v-for="(moduleItem, index) in customModules"
                :key="`rp2-custom-panel-${index}`"
                :name="customTabName(index)"
            >
                <CommonModuleVue
                    :view-config="moduleItem"
                    :task="taskForCommonModule"
                    :enable-pagination="true"
                    :show-row-selection="false"
                    :enhanced-table-border="true"
                />
            </q-tab-panel>
            <q-tab-panel name="batchStats">
                <div class="rp2-tab-wrap">
                    <div class="rp2-tab-intro">
                        <IntroHelpButton :title="$t('Rp2BatchStats')" :disable-float="true" />
                    </div>
                    <BatchPathogenStats :task-id="taskId" :task-root-dir="taskRootDir" />
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getTask, readTaskFile } from 'src/api/task'
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import SampleList from './components/SampleList.vue'
import BatchPathogenStats from './components/BatchPathogenStats.vue'
import IntroHelpButton from './components/IntroHelpButton.vue'
import CommonModuleVue from '../report/common-module/index.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const store = globalStore()
const { langCode } = storeToRefs(store)

const taskId = route.params.id
const taskRootDir = ref('')
const taskName = ref('')
const taskDetail = ref({ id: taskId })
const customModules = ref([])
const tab = ref('sampleList')
const pageTitle = computed(() => {
    return taskName.value ? `"${taskName.value}" ${t('Rp2SummaryTitleSuffix')}` : t('Rp2PageTitle')
})
const taskForCommonModule = computed(() => ({ id: taskDetail.value?.id || taskId }))

const customTabName = (index) => `rp2CustomTab${index}`

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
    let configText = ''

    try {
        configText = await readTaskFile(taskId, `module_${suffix}.json`, true)
    } catch (error) {
        configText = ''
    }

    if (!configText && suffix !== 'CN') {
        try {
            configText = await readTaskFile(taskId, 'module_CN.json', true)
        } catch (error) {
            configText = ''
        }
    }

    const configJson = tryParseJson(typeof configText === 'string' ? configText : '')
    customModules.value = extractCustomModules(configJson)
}

onMounted(async () => {
    try {
        const task = await getTask(taskId)
        taskDetail.value = task || { id: taskId }
        taskName.value = task?.name || ''
        const resultDir = (task?.result_dir || '').replace(/\\/g, '/')
        taskRootDir.value = resultDir.replace(/\/result\/?$/, '')
    } catch (error) {
        taskRootDir.value = ''
    } finally {
        await loadCustomModules()
    }
})

watch(
    () => [langCode.value, locale.value],
    loadCustomModules
)
</script>

<style scoped>
.rp2-tab-wrap {
    position: relative;
    padding-top: 36px;
}

.rp2-tab-wrap--no-intro {
    padding-top: 0;
}

.rp2-tab-intro {
    position: absolute;
    top: 6px;
    right: 12px;
    z-index: 5;
}

.rp2-tab-wrap :deep(.ant-table-wrapper),
.rp2-tab-wrap :deep(.ant-table) {
    width: 100%;
}
</style>

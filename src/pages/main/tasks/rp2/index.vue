<template>
    <q-page style="padding: 10px; overflow: auto; height: 90vh">
        <div class="row items-center">
            <h6>{{ $t('Rp2PageTitle') }}</h6>
            <q-space />
            <q-btn :label="$t('Back')" icon="arrow_back" class="q-mr-lg" color="primary" flat @click="router.back()" />
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
                <q-tab name="contamination" :label="$t('Rp2ContaminationPlaceholder')" />
                <q-tab name="sample-list" :label="$t('Rp2SampleList')" icon="list" />
                <q-tab
                    v-for="(commonTab, i) in commonTabs"
                    :key="`commonTab${i}`"
                    :name="`commonTab${i}`"
                    :label="commonTab.title"
                    :icon="commonTab.icon || 'web_stories'"
                />
            </q-tabs>
        <q-tab-panels v-model="tab" animated v-if="samples.length > 0">
                <q-tab-panel name="contamination">
                    <!-- Placeholder kept empty per requirement: empty state for Contamination tab -->
                    
                </q-tab-panel>
                <q-tab-panel name="sample-list">
                    <SampleList :task-id="route.params.id" :samples="samples" />
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
import SampleList from './components/SampleList.vue'
import { buildModelQuery } from 'src/api/modelQueryBuilder'
import CommonModuleVue from '../report/common-module/index.vue'
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
const samples = ref([])
const commonTabs = ref([])
const intros = ref({})

onMounted(() => {
    readResultAndModuleJson()

    // 查询任务
    getTask(route.params.id).then((res) => {
        taskDetail.value = res

        // 查询任务样本，用于获取样本（样本识别号）是肿瘤样本还是对照样本
        const query = buildModelQuery([], { id__in: res.samples })
        apiPost(
            `/model_query/sample`,
            (res) => {
                samples.value = res.data.results
            },
            query
        )
    })
})

watch(langCode, lc => {
    nextTick(() => readResultAndModuleJson())
})

const readResultAndModuleJson = async () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'

    // 读取任务的 result.json 结果文件, 他是一个 json 文件, key:value
    // key 是 页面上的 tab 名称, value 是每个 tab 的说明信息
    // 如果没有 key 那么对应的 tab 也就不显示
    // 这里将 每个 tab 的说明信息放入 intros 中传递到 tab 中
    let res = await readTaskFile(route.params.id, `result_${suffix}.json`)
    try {
        const raw = JSON.parse(res)
        intros.value = raw
    } catch (error) {
        console.error('Failed to parse result json:', error)
    }

    // module.json
    // 这个文件中配置每个 tab 下展示的内容
    res = await readTaskFile(route.params.id, `module_${suffix}.json`)
    {
        let data = null
        try {
            data = JSON.parse(res)
        } catch (error) {
            // 尝试修复 json 的额外 ","
            try {
                data = JSON.parse(res.replace(/,[ \t\r\n]+}/g, '}').replace(/,[ \t\r\n]+\]/g, ']'))
            } catch (error) {
                errorMessage(`module.json 文件内容非正确 json 格式`)
            }
        }
        if (!data) {
            return
        }

        // 解析 commonModules
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

        // 设置初始的Active Tab
        // 默认显示 contamination tab
        tab.value = 'contamination'
    }
}
</script>

<style scoped>
</style>

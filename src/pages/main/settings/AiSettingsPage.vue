<template>
    <div class="ai-settings-page">
        <div class="ai-settings-header">
            <PageTitle title="AI 配置" />
            <div class="ai-settings-header__hint">统一管理模型连接、AI 助手和分析提示词。</div>
        </div>

        <div class="ai-settings-workspace">
            <q-tabs
                v-model="activeTab"
                align="left"
                active-color="primary"
                indicator-color="primary"
                class="ai-settings-tabs text-grey-8"
                inline-label
                outside-arrows
                mobile-arrows
            >
                <q-tab name="base" icon="tune" label="基础配置" />
                <q-tab name="assistant" icon="smart_toy" label="AI助手" />
                <q-tab
                    v-for="section in promptSections"
                    :key="section.key"
                    :name="section.key"
                    icon="edit_note"
                    :label="section.label"
                />
            </q-tabs>

            <q-tab-panels v-model="activeTab" animated keep-alive class="ai-settings-panels">
                <q-tab-panel name="base" class="ai-settings-panel">
                    <div class="panel-heading">
                        <div>
                            <div class="panel-title">基础配置</div>
                            <div class="panel-caption">配置所有 AI 功能共用的模型服务连接。</div>
                        </div>
                    </div>
                    <div class="row q-col-gutter-md q-mt-sm">
                        <q-select
                            class="col-12 col-md-4"
                            v-model="agentForm.model"
                            :options="agentModelOptions"
                            label="LLM 模型"
                            outlined
                            dense
                            emit-value
                            map-options
                        />
                        <q-input
                            class="col-12 col-md-4"
                            v-model="agentForm.baseURL"
                            label="API Base URL"
                            outlined
                            dense
                            hint="兼容 OpenAI 接口格式的 API 地址"
                        />
                        <q-input
                            class="col-12 col-md-4"
                            v-model="agentForm.apiKey"
                            label="API Key"
                            outlined
                            dense
                            :type="agentShowKey ? 'text' : 'password'"
                            hint="保存到系统后端配置表"
                        >
                            <template v-slot:append>
                                <q-icon
                                    :name="agentShowKey ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="agentShowKey = !agentShowKey"
                                />
                            </template>
                        </q-input>
                    </div>

                    <q-banner class="config-note q-mt-md" rounded>
                        <template v-slot:avatar>
                            <q-icon name="info" />
                        </template>
                        模型、Base URL 和 API Key 会保存到系统配置表，供 AI 助手、突变分析和提示词优化共同使用。
                    </q-banner>

                    <div class="row justify-end q-gutter-sm q-mt-lg">
                        <q-btn flat label="重置" color="grey" @click="baseResetForm" />
                        <AppActionButton variant="primary" icon="save_as" label="保存" @click="agentSave" />
                    </div>
                </q-tab-panel>

                <q-tab-panel name="assistant" class="ai-settings-panel">
                    <div class="panel-heading">
                        <div>
                            <div class="panel-title">AI助手</div>
                            <div class="panel-caption">配置全局 AI 助手的启用状态、输出语言和系统提示词。</div>
                        </div>
                        <q-toggle v-model="agentForm.enabled" label="启用" color="primary" />
                    </div>

                    <div class="row q-col-gutter-md q-mt-sm">
                        <q-select
                            class="col-12 col-md-4"
                            v-model="agentForm.language"
                            :options="languageOptions"
                            label="输出语言"
                            outlined
                            dense
                            emit-value
                            map-options
                        />
                    </div>
                    <q-input
                        v-model="agentForm.globalPrompt"
                        type="textarea"
                        autogrow
                        outlined
                        class="q-mt-md"
                        label="AI助手提示词"
                    />

                    <q-banner class="config-note q-mt-md" rounded>
                        <template v-slot:avatar>
                            <q-icon name="info" />
                        </template>
                        AI助手提示词会应用到顶部 AI 问答抽屉和 PageAgent，全局输出语言通过系统提示约束模型回答。
                    </q-banner>

                    <div class="row justify-end q-gutter-sm q-mt-lg">
                        <q-btn flat label="重置" color="grey" @click="assistantResetForm" />
                        <AppActionButton variant="primary" icon="save_as" label="保存" @click="agentSave" />
                    </div>
                </q-tab-panel>

                <q-tab-panel v-for="section in promptSections" :key="section.key" :name="section.key" class="ai-settings-panel">
                    <div class="panel-heading">
                        <div>
                            <div class="panel-title">{{ section.label }}</div>
                            <div class="panel-caption">{{ section.hint }}</div>
                        </div>
                    </div>
                    <div class="row q-col-gutter-md">
                        <q-select
                            class="col-12 col-md-4"
                            v-model="promptForm[section.key].language"
                            :options="languageOptions"
                            label="输出语言"
                            outlined
                            dense
                            emit-value
                            map-options
                        />
                    </div>
                    <q-input
                        v-model="promptForm[section.key].prompt"
                        type="textarea"
                        autogrow
                        outlined
                        class="q-mt-md"
                        :label="section.label"
                        :hint="section.hint"
                    />

                    <div class="row justify-end q-gutter-sm q-mt-lg">
                        <q-btn flat label="重置" color="grey" @click="resetPrompt(section.key)" />
                        <q-btn
                            flat
                            label="AI 优化"
                            color="primary"
                            icon="auto_fix_high"
                            :loading="optimizingKey === section.key"
                            @click="optimizePrompt(section.key)"
                        />
                        <AppActionButton variant="primary" icon="save_as" label="保存" @click="savePromptConfig" />
                    </div>
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import PageTitle from 'components/page-title/PageTitle.vue'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import { createConfig, listConfig, updateConfig } from 'src/api/config'
import { SYSTEM_INSTRUCTION } from 'src/boot/agentInstructions'
import {
    AI_LANGUAGE_OPTIONS,
    AI_PROMPT_CONFIG_NAME,
    createDefaultAiPromptConfig,
    parseAiPromptConfig,
} from 'src/boot/aiPromptConfig'
import { usePageAgentStore } from 'src/stores/pageAgent'

const PAGE_AGENT_CONFIG_NAME = 'page_agent_config'

const $q = useQuasar()
const agentStore = usePageAgentStore()
const defaults = agentStore.defaults

const languageOptions = AI_LANGUAGE_OPTIONS.map(item => ({
    label: item.label,
    value: item.value,
}))

const agentModelOptions = [
    { label: 'Qwen3.5 Plus (推荐)', value: 'qwen3.5-plus' },
    { label: 'Qwen3 Plus', value: 'qwen3-plus' },
    { label: 'Qwen3 235B A22B', value: 'qwen3-235b-a22b' },
    { label: 'Qwen Max', value: 'qwen-max' },
    { label: 'Qwen Plus', value: 'qwen-plus' },
    { label: 'Qwen Turbo', value: 'qwen-turbo' },
    { label: 'DeepSeek Chat', value: 'deepseek-chat' },
    { label: 'DeepSeek Reasoner', value: 'deepseek-reasoner' },
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
    { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
]

const promptSections = [
    {
        key: 'mutation',
        label: '突变分析提示词',
        hint: '支持占位符：{defaultPrompt}、{fields}、{analysisType}',
    },
    {
        key: 'batchMutation',
        label: '批量突变分析提示词',
        hint: '支持占位符：{defaultPrompt}、{recordCount}、{analysisType}',
    },
    {
        key: 'pathogen',
        label: '病原检测提示词',
        hint: '本次仅保存预留，暂不新增病原检测 AI 解读入口',
    },
]

const agentShowKey = ref(false)
const agentBackendId = ref(null)
const promptBackendId = ref(null)
const optimizingKey = ref('')
const activeTab = ref('base')

const agentForm = reactive({
    enabled: defaults.enabled,
    apiKey: '',
    model: defaults.model,
    baseURL: defaults.baseURL,
    language: defaults.language,
    globalPrompt: SYSTEM_INSTRUCTION,
})

const promptForm = reactive(createDefaultAiPromptConfig())

onMounted(() => {
    refresh()
})

function safeParseJson(data, fallback = {}) {
    if (!data) return fallback
    try {
        return typeof data === 'string' ? JSON.parse(data) : data
    } catch {
        return fallback
    }
}

function fillPromptForm(data) {
    const normalized = parseAiPromptConfig(data)
    for (const key of Object.keys(normalized)) {
        promptForm[key].prompt = normalized[key].prompt
        promptForm[key].language = normalized[key].language
    }
}

async function refresh() {
    const res = await listConfig()
    const configs = res.results || []
    const agentCfg = configs.find(item => item.name === PAGE_AGENT_CONFIG_NAME)
    const promptCfg = configs.find(item => item.name === AI_PROMPT_CONFIG_NAME)

    if (agentCfg) {
        agentBackendId.value = agentCfg.id
        const data = safeParseJson(agentCfg.data)
        agentForm.enabled = data.enabled ?? defaults.enabled
        agentForm.apiKey = data.apiKey || ''
        agentForm.model = data.model || defaults.model
        agentForm.baseURL = data.baseURL || defaults.baseURL
        agentForm.language = data.language || defaults.language
        agentForm.globalPrompt = data.globalPrompt || SYSTEM_INSTRUCTION
    }

    if (promptCfg) {
        promptBackendId.value = promptCfg.id
        fillPromptForm(promptCfg.data)
    } else {
        fillPromptForm(null)
    }
}

function baseResetForm() {
    agentForm.apiKey = ''
    agentForm.model = defaults.model
    agentForm.baseURL = defaults.baseURL
}

function assistantResetForm() {
    agentForm.enabled = defaults.enabled
    agentForm.language = defaults.language
    agentForm.globalPrompt = SYSTEM_INSTRUCTION
}

async function upsertConfig(id, name, data) {
    const payload = {
        id,
        name,
        data: JSON.stringify(data),
    }
    if (id) {
        return updateConfig(payload)
    }
    return createConfig(payload)
}

async function agentSave() {
    const data = {
        apiKey: agentForm.apiKey,
        model: agentForm.model,
        baseURL: agentForm.baseURL,
        language: agentForm.language,
        enabled: agentForm.enabled,
        globalPrompt: agentForm.globalPrompt,
    }
    const res = await upsertConfig(agentBackendId.value, PAGE_AGENT_CONFIG_NAME, data)
    agentBackendId.value = res.id || agentBackendId.value

    agentStore.syncFromBackend(data)
    if (typeof window.__initPageAgent === 'function') {
        window.__initPageAgent()
    }

    $q.notify({ message: 'AI 助手配置已保存', type: 'positive' })
}

async function savePromptConfig() {
    const data = {
        mutation: { ...promptForm.mutation },
        batchMutation: { ...promptForm.batchMutation },
        pathogen: { ...promptForm.pathogen },
    }
    const res = await upsertConfig(promptBackendId.value, AI_PROMPT_CONFIG_NAME, data)
    promptBackendId.value = res.id || promptBackendId.value
    $q.notify({ message: '提示词配置已保存', type: 'positive' })
}

function resetPrompt(key) {
    const defaults = createDefaultAiPromptConfig()
    promptForm[key].prompt = defaults[key].prompt
    promptForm[key].language = defaults[key].language
}

async function optimizePrompt(key) {
    if (!agentForm.apiKey) {
        $q.notify({ message: '请先填写 API Key', type: 'warning' })
        return
    }

    optimizingKey.value = key
    try {
        const response = await fetch(`${agentForm.baseURL.replace(/\/+$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${agentForm.apiKey}`,
            },
            body: JSON.stringify({
                model: agentForm.model,
                messages: [
                    {
                        role: 'system',
                        content: '你是专业的生物信息学 AI 提示词工程师。请优化用户提供的提示词，使其更清晰、可控、适合临床基因组学分析。只输出优化后的提示词。',
                    },
                    {
                        role: 'user',
                        content: promptForm[key].prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: 2000,
                stream: false,
            }),
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        if (!content) throw new Error('AI 未返回优化结果')
        promptForm[key].prompt = content.trim()
        $q.notify({ message: '提示词已优化，请确认后保存', type: 'positive' })
    } catch (e) {
        $q.notify({ message: e.message || '提示词优化失败', type: 'negative' })
    } finally {
        optimizingKey.value = ''
    }
}
</script>

<style scoped>
.ai-settings-page {
    padding: 18px 22px 28px;
}

.ai-settings-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
}

.ai-settings-header__hint {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.6;
}

.ai-settings-workspace {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
}

.ai-settings-tabs {
    min-height: 48px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
}

.ai-settings-panels {
    background: #fff;
}

.ai-settings-panel {
    padding: 22px;
}

.panel-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}

.panel-title {
    color: #111827;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.4;
}

.panel-caption {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
    margin-top: 2px;
}

.config-note {
    background: #eff6ff;
    color: #1e3a8a;
}
</style>

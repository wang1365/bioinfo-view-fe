import { defineStore } from 'pinia'

// 前端兜底默认值（后端无配置时使用，apiKey 无默认值需用户填写）
const DEFAULTS = {
    apiKey: '',
    model: 'qwen3.5-plus',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    language: 'zh-CN',
    enabled: true,
    globalPrompt: '',
}

export const usePageAgentStore = defineStore('pageAgent', {
    state: () => ({
        // 所有配置均从后端 page_agent_config 读取，后端无配置时使用 DEFAULTS 兜底
        apiKey: DEFAULTS.apiKey,
        model: DEFAULTS.model,
        baseURL: DEFAULTS.baseURL,
        language: DEFAULTS.language,
        enabled: DEFAULTS.enabled,
        globalPrompt: DEFAULTS.globalPrompt,
        // 运行时状态
        initialized: false,
    }),
    getters: {
        isConfigured: (state) => !!state.apiKey,
        config: (state) => ({
            model: state.model,
            baseURL: state.baseURL,
            apiKey: state.apiKey,
            language: state.language,
            globalPrompt: state.globalPrompt,
        }),
        defaults: () => DEFAULTS,
    },
    actions: {
        setApiKey(key) {
            this.apiKey = key
        },
        setModel(model) {
            this.model = model
        },
        setBaseURL(url) {
            this.baseURL = url
        },
        setLanguage(lang) {
            this.language = lang
        },
        setEnabled(val) {
            this.enabled = val
        },
        setGlobalPrompt(prompt) {
            this.globalPrompt = prompt
        },
        setInitialized(val) {
            this.initialized = val
        },
        updateConfig({ apiKey, model, baseURL, language, globalPrompt }) {
            if (apiKey !== undefined) this.apiKey = apiKey
            if (model !== undefined) this.model = model
            if (baseURL !== undefined) this.baseURL = baseURL
            if (language !== undefined) this.language = language
            if (globalPrompt !== undefined) this.globalPrompt = globalPrompt
        },
        /**
         * 从后端配置数据同步到 store（含 apiKey）
         */
        syncFromBackend(data) {
            if (data.apiKey !== undefined) this.apiKey = data.apiKey
            if (data.model !== undefined) this.model = data.model
            if (data.baseURL !== undefined) this.baseURL = data.baseURL
            if (data.language !== undefined) this.language = data.language
            if (data.enabled !== undefined) this.enabled = data.enabled
            if (data.globalPrompt !== undefined) this.globalPrompt = data.globalPrompt
        },
        /**
         * 导出全部配置（用于保存到后端）
         */
        exportBackendData() {
            return {
                apiKey: this.apiKey,
                model: this.model,
                baseURL: this.baseURL,
                language: this.language,
                enabled: this.enabled,
                globalPrompt: this.globalPrompt,
            }
        },
        clearConfig() {
            this.apiKey = DEFAULTS.apiKey
            this.model = DEFAULTS.model
            this.baseURL = DEFAULTS.baseURL
            this.language = DEFAULTS.language
            this.enabled = DEFAULTS.enabled
            this.globalPrompt = DEFAULTS.globalPrompt
            this.initialized = false
        },
    },
    // 所有配置存后端，不再需要 localStorage 持久化
    persist: false,
})

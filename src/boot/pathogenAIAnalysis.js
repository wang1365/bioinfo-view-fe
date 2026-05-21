import { listConfig } from 'src/api/config'
import { usePageAgentStore } from 'src/stores/pageAgent'
import {
    AI_PROMPT_CONFIG_NAME,
    applyPromptTemplate,
    getLanguageInstruction,
    parseAiPromptConfig,
} from 'src/boot/aiPromptConfig'

let aiPromptConfigCache = null

async function getAiPromptConfig() {
    if (aiPromptConfigCache) return aiPromptConfigCache
    try {
        const res = await listConfig({ name: AI_PROMPT_CONFIG_NAME })
        const cfg = (res.results || []).find(item => item.name === AI_PROMPT_CONFIG_NAME)
        aiPromptConfigCache = parseAiPromptConfig(cfg?.data)
    } catch {
        aiPromptConfigCache = parseAiPromptConfig(null)
    }
    return aiPromptConfigCache
}

export function analyzePathogenWithAI(fields, callbacks = {}, options = {}) {
    const store = usePageAgentStore()
    const { onThinking, onContent, onDone, onError } = callbacks

    if (!store.isConfigured || !store.enabled) {
        onError?.(new Error('AI 助手未配置或未启用，请在 AI 配置中填写 API Key 并启用 AI 助手'))
        return null
    }

    const controller = new AbortController()

    const doStream = async () => {
        try {
            const aiPromptConfig = await getAiPromptConfig()
            const promptConfig = aiPromptConfig.pathogen
            const prompt = applyPromptTemplate(promptConfig.prompt, {
                fields,
                sampleName: options.sampleName,
                analysisType: 'pathogen',
            })
            const languageInstruction = getLanguageInstruction(promptConfig.language)

            const response = await fetch(`${store.baseURL.replace(/\/+$/, '')}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${store.apiKey}`,
                },
                body: JSON.stringify({
                    model: store.model,
                    messages: [
                        {
                            role: 'system',
                            content: `你是纳昂达生物信息分析云平台的 AI 助手，专注于病原微生物检测结果解读。${languageInstruction} 所有临床建议仅供参考，临床决策需由专业医生做出。`,
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.3,
                    max_tokens: options.maxTokens || 2500,
                    stream: true,
                }),
                signal: controller.signal,
            })

            if (!response.ok) {
                const errText = await response.text()
                throw new Error(`AI 服务调用失败 (${response.status}): ${errText}`)
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    const trimmed = line.trim()
                    if (!trimmed || !trimmed.startsWith('data:')) continue

                    const dataStr = trimmed.slice(5).trim()
                    if (dataStr === '[DONE]') continue

                    try {
                        const data = JSON.parse(dataStr)
                        const delta = data.choices?.[0]?.delta
                        if (!delta) continue
                        if (delta.reasoning_content) onThinking?.(delta.reasoning_content)
                        if (delta.content) onContent?.(delta.content)
                    } catch {
                        // ignore malformed stream chunks
                    }
                }
            }

            onDone?.()
        } catch (e) {
            if (e.name === 'AbortError') {
                onDone?.()
            } else {
                onError?.(e)
            }
        }
    }

    doStream()
    return controller
}

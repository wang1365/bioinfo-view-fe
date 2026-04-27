/**
 * AI 生信助手流式调用封装
 * 使用 OpenAI 兼容接口（通义千问等），支持流式响应和推理模式
 */
import { usePageAgentStore } from 'src/stores/pageAgent'

/** 生信专家系统提示词 */
const SYSTEM_INSTRUCTION = `你是一位资深的生物信息学（Bioinformatics）专家，具备深厚的基因组学、转录组学、蛋白质组学和生物数据分析背景。

你的职责是回答用户提出的生物信息学相关问题，包括但不限于：
- 基因变异解读（SNP、InDel、CNV、融合基因等）
- 肿瘤突变负荷（TMB）、微卫星不稳定性（MSI）等肿瘤标志物
- NGS 测序流程、质量控制与数据分析方法
- 致病性变异分级标准（ACMG/AMP 指南）
- 基因检测Panel设计与临床应用
- 生物信息分析工具与数据库使用

回答原则：
1. 优先从生物信息学专业角度解答问题
2. 回答准确、专业但不晦涩，适当举例说明
3. 如涉及临床建议，请说明仅供参考，具体以医生诊断为准
4. 使用中文回答，专有术语可保留英文原文`

/**
 * 流式聊天请求
 * @param {string} userInput - 用户当前输入的问题
 * @param {Array} history - 已完成的对话历史 [{ role: 'user'|'assistant', content: '' }]
 * @param {Object} callbacks - 回调函数集合
 * @param {Function} callbacks.onContent - 收到正文文本时的回调 (text: string)
 * @param {Function} [callbacks.onThinking] - 收到推理文本时的回调 (text: string)
 * @param {boolean} [enableReasoning=false] - 是否开启推理模式
 * @param {AbortSignal} [signal] - 可选的 AbortController signal，用于取消请求
 * @returns {Promise<{content: string, thinking: string}>} 完整的助手回复
 */
export async function streamChat(userInput, history, callbacks, enableReasoning = false, signal) {
    const store = usePageAgentStore()

    if (!store.apiKey) {
        throw new Error('未配置 API Key，请在设置中填写')
    }

    const url = `${store.baseURL.replace(/\/+$/, '')}/chat/completions`

    // 组装消息：系统提示词 + 历史对话 + 当前问题
    const messages = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userInput },
    ]

    const body = {
        model: store.model,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
        stream: true,
    }

    // 推理模式控制（通义千问 qwen3 系列）
    // 必须明确传值：true=返回reasoning_content, false=禁用推理直接输出
    body.enable_thinking = !!enableReasoning

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.apiKey}`,
        },
        body: JSON.stringify(body),
        signal,
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let fullThinking = ''
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 立即解码当前 chunk
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') break

            try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta

                // 推理内容（thinking）—— 仅在用户主动开启推理模式时处理
                if (enableReasoning && delta?.reasoning_content && callbacks.onThinking) {
                    fullThinking += delta.reasoning_content
                    callbacks.onThinking(delta.reasoning_content)
                }

                // 正文内容
                if (delta?.content) {
                    fullContent += delta.content
                    callbacks.onContent(delta.content)
                }
            } catch {
                // 忽略解析失败的行
            }
        }
    }

    return { content: fullContent, thinking: fullThinking }
}

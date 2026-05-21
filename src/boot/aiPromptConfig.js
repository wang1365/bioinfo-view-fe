export const AI_PROMPT_CONFIG_NAME = 'ai_prompt_config'

export const AI_LANGUAGE_OPTIONS = [
    { label: '中文', value: 'zh-CN', instruction: '请用中文回答，专业术语可保留英文原文。' },
    { label: 'English', value: 'en-US', instruction: 'Please answer in English. Keep technical terms precise.' },
    { label: 'Türkçe', value: 'tr-TR', instruction: 'Lütfen Türkçe yanıt verin. Teknik terimleri doğru kullanın.' },
    { label: 'Tiếng Việt', value: 'vi-VN', instruction: 'Vui lòng trả lời bằng tiếng Việt. Giữ thuật ngữ chuyên môn chính xác.' },
]

const DEFAULT_LANGUAGE = 'zh-CN'

export const DEFAULT_MUTATION_PROMPT = `请基于以下变异信息进行专业临床解读。

{defaultPrompt}

输出要求：
1. 说明致病性/临床意义，并标注不确定性
2. 结合数据库证据、测序质量和人群频率进行判断
3. 如涉及用药建议，明确说明仅供参考，临床决策需由专业医生做出`

export const DEFAULT_BATCH_MUTATION_PROMPT = `请基于以下多条变异信息逐条进行专业临床解读。

{defaultPrompt}

输出要求：
1. 按变异编号逐个解读
2. 每个变异说明致病性、临床意义、用药/遗传咨询建议和数据质量
3. 最后给出总体摘要
4. 所有临床建议仅供参考，临床决策需由专业医生做出`

export const DEFAULT_PATHOGEN_PROMPT = `请基于病原检测结果进行专业解读。

可重点关注：
1. 病原体检出可信度和丰度水平
2. 与样本类型、感染部位和临床表现的相关性
3. 可能的定植、污染或背景微生物风险
4. 复核、补充检测或临床沟通建议

所有临床建议仅供参考，临床决策需由专业医生做出。`

export function getLanguageInstruction(language) {
    return AI_LANGUAGE_OPTIONS.find(item => item.value === language)?.instruction || AI_LANGUAGE_OPTIONS[0].instruction
}

export function createDefaultAiPromptConfig() {
    return {
        mutation: {
            prompt: DEFAULT_MUTATION_PROMPT,
            language: DEFAULT_LANGUAGE,
        },
        batchMutation: {
            prompt: DEFAULT_BATCH_MUTATION_PROMPT,
            language: DEFAULT_LANGUAGE,
        },
        pathogen: {
            prompt: DEFAULT_PATHOGEN_PROMPT,
            language: DEFAULT_LANGUAGE,
        },
    }
}

export function parseAiPromptConfig(rawConfig) {
    const defaults = createDefaultAiPromptConfig()
    if (!rawConfig) return defaults

    try {
        const data = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig
        return {
            mutation: {
                ...defaults.mutation,
                ...(data.mutation || {}),
            },
            batchMutation: {
                ...defaults.batchMutation,
                ...(data.batchMutation || {}),
            },
            pathogen: {
                ...defaults.pathogen,
                ...(data.pathogen || {}),
            },
        }
    } catch {
        return defaults
    }
}

export function stringifyFields(fields) {
    if (!fields || typeof fields !== 'object') return ''
    return Object.entries(fields)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join('; ') : value}`)
        .join('\n')
}

export function applyPromptTemplate(template, context = {}) {
    const replacements = {
        defaultPrompt: context.defaultPrompt || '',
        fields: stringifyFields(context.fields),
        analysisType: context.analysisType || '',
        recordCount: context.recordCount || '',
    }

    let prompt = template || '{defaultPrompt}'
    for (const [key, value] of Object.entries(replacements)) {
        prompt = prompt.replaceAll(`{${key}}`, value)
    }
    return prompt
}

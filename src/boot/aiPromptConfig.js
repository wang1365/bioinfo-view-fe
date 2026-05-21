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

export const DEFAULT_PATHOGEN_PROMPT = `请基于以下 RP 病原检测结果进行专业解读。

样本信息：
{sampleName}

检测结果：
{fields}

解读要求：
1. 分别概述细菌、真菌、病毒的检出情况，优先关注明确检出的阳性病原体
2. 结合 RPM/reads/丰度、阴性对照或表格中已有质量信息，评估检出可信度
3. 重点分析检测出的病原体与耐药基因之间的可能关系：耐药基因可能来源于哪些检出病原，是否与该病原常见耐药机制一致，是否存在来源不明确或需谨慎解释的情况
4. 给出患者用药建议：结合检出病原、耐药基因、常见治疗原则提出可考虑和应避免的药物方向；必须说明建议需结合感染部位、临床表现、既往用药、当地指南和药敏试验确认，不能替代医生处方
5. 提醒可能的定植、污染、背景菌或低丰度假阳性风险
6. 给出复核、补充检测、临床沟通或报告关注建议

请使用结构化小标题输出。所有临床建议仅供参考，临床决策需由专业医生做出。`

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

function stringifyValue(value) {
    if (value === null || value === undefined) return ''
    return Array.isArray(value) ? value.join('; ') : String(value)
}

export function applyPromptTemplate(template, context = {}) {
    const fields = context.fields && typeof context.fields === 'object' ? context.fields : {}
    const fieldReplacements = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, stringifyValue(value)])
    )
    const replacements = {
        ...fieldReplacements,
        defaultPrompt: context.defaultPrompt || '',
        fields: stringifyFields(context.fields),
        analysisType: context.analysisType || '',
        recordCount: context.recordCount || '',
        sampleName: context.sampleName || fields.dataIdentifier || fields.sampleIdentifier || '',
        patientName: fields.patientName || '',
        patientIdentifier: fields.patientIdentifier || '',
        sampleIdentifier: fields.sampleIdentifier || '',
        dataIdentifier: fields.dataIdentifier || '',
        bacteria: fields.bacteria || '',
        fungus: fields.fungus || '',
        virus: fields.virus || '',
        resistance: fields.resistance || '',
        resistanceGenes: fields.resistance || fields.resistanceGenes || '',
    }

    let prompt = template || '{defaultPrompt}'
    for (const [key, value] of Object.entries(replacements)) {
        prompt = prompt.replaceAll(`{${key}}`, value)
    }
    return prompt.replace(/\{([^{}]+)\}/g, (match, key) => {
        if (Object.prototype.hasOwnProperty.call(replacements, key)) {
            return replacements[key]
        }
        return match
    })
}

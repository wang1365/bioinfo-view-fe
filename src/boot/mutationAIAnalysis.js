/**
 * 突变行 AI 分析工具
 * 从行数据中提取关键字段，构建 prompt，调用 LLM 生成解读
 */
import { usePageAgentStore } from 'src/stores/pageAgent'

/**
 * Somatic 列映射（colN → 语义名）
 * 基于实际 TSV 文件列顺序
 */
const SOMATIC_COL_MAP = {
    1: 'Chr',
    2: 'Start',
    3: 'End',
    4: 'Ref',
    5: 'Alt',
    6: 'GenoType_Tumor',
    7: 'AllelicDepths_Tumor',
    8: 'SeqDepths_Tumor',
    9: 'MutationRate_Tumor',
    10: 'GenoType_Control',
    11: 'AllelicDepths_Control',
    12: 'SeqDepths_Control',
    13: 'MutationRate_Control',
    14: 'Func_refGene',
    15: 'Gene_refGene',
    17: 'ExonicFunc_refGene',
    19: 'NUChange',
    20: 'AAChange',
    25: 'CLNSIG',
    27: 'ExAC_ALL',
    42: 'rsID',
    64: 'SIFT_pred',
    249: 'OMIM',
    251: 'GeneFullAnnotation',
    252: 'VCF_filter',
    254: 'Report',
}

/**
 * Germline 列映射
 */
const GERMLINE_COL_MAP = {
    1: 'Chr',
    2: 'Start',
    3: 'End',
    4: 'Ref',
    5: 'Alt',
    6: 'GenoType',
    7: 'AllelicDepths',
    8: 'SeqDepths',
    9: 'MutationRate',
    10: 'Func_refGene',
    11: 'Gene_refGene',
    13: 'ExonicFunc_refGene',
    15: 'NUChange',
    16: 'AAChange',
    21: 'CLNSIG',
    23: 'ExAC_ALL',
    38: 'rsID',
    60: 'SIFT_pred',
    245: 'OMIM',
    247: 'GeneFullAnnotation',
    248: 'VCF_filter',
    250: 'Report',
}

/**
 * 从 Somatic/Germline 行数据中提取可读字段
 * @param {Object} record - 行数据（col1~colN 格式）
 * @param {string} type - 'somatic' | 'germline'
 * @param {Array} header - 可选的 header 数组，用于动态列名
 * @returns {Object} 可读字段映射
 */
export function extractMutationFields(record, type, header) {
    const colMap = type === 'somatic' ? SOMATIC_COL_MAP : GERMLINE_COL_MAP
    const result = {}

    // 使用固定映射提取关键字段
    for (const [colNum, fieldName] of Object.entries(colMap)) {
        const val = record[`col${colNum}`]
        if (val !== undefined && val !== '' && val !== '.') {
            result[fieldName] = val
        }
    }

    // 如果有 header，补充更多有意义的字段
    if (header && Array.isArray(header)) {
        for (let i = 0; i < header.length; i++) {
            const colKey = `col${i + 1}`
            const val = record[colKey]
            if (val !== undefined && val !== '' && val !== '.' && !result[header[i]]) {
                // 只补充一些关键的人群频率和预测列
                const h = header[i].toLowerCase()
                if (
                    h.includes('gnomad') ||
                    h.includes('1000g') ||
                    h.includes('sift') ||
                    h.includes('polyphen') ||
                    h.includes('revel') ||
                    h.includes('cadd') ||
                    h.includes('acmg') ||
                    h.includes('clinvar') ||
                    h.includes('cosmic')
                ) {
                    result[header[i]] = val
                }
            }
        }
    }

    return result
}

/**
 * 从 WES 行数据中提取可读字段（WES 已使用语义化列名）
 * @param {Object} record - WES 行数据
 * @returns {Object} 可读字段映射
 */
export function extractWESMutationFields(record) {
    const keys = [
        'Chr', 'Start', 'End', 'Ref', 'Alt',
        'Gene.refGene', 'GeneDetail.refGene',
        'ExonicFunc.refGene', 'NUChange', 'AAChange',
        'Class', 'Genotype', 'Depth_Quality',
        'Seq_Depths_', 'Mutation_Rate_',
        'ACMG_result', 'ACMG', 'Clinvar', 'Clinvar_ReviewStatus',
        'Gene_Related_Diseases', 'HPO',
        'Software_Prediction_result',
        'gnomAD_genome_ALL', 'gnomAD_exome_ALL', 'ExAC_ALL', '1000g2015aug_all',
        'cohort', 'geneIdentifier', 'userVerdict', 'Report',
    ]
    const result = {}
    for (const key of keys) {
        const val = record[key]
        if (val !== undefined && val !== '' && val !== '.') {
            // 数组类型（如 ACMG, Gene_Related_Diseases）转为字符串
            result[key] = Array.isArray(val) ? val.join('; ') : val
        }
    }
    return result
}

/**
 * 从 Fusion 行数据中提取可读字段（数组索引式）
 * @param {Array} record - 行数据（数组索引式 record[0~N]）
 * @param {Array} header - CSV header 数组
 * @param {string} subType - 'single' | 'somatic'
 * @returns {Object} 可读字段映射
 */
export function extractFusionFields(record, header) {
    const result = {}
    if (!header || !Array.isArray(header)) return result

    for (let i = 0; i < header.length; i++) {
        const val = record[i + 1] // record[0] 是 lineNumber，数据从 [1] 开始
        if (val !== undefined && val !== '' && val !== '.') {
            const h = header[i]
            // 跳过 IGV 和 Report 列
            if (h === 'IGV' || h === 'Report') continue
            result[h] = val
        }
    }
    return result
}

/**
 * 从 CNV 基础版行数据中提取可读字段（语义化属性）
 * @param {Object} record - 行数据对象
 * @returns {Object} 可读字段映射
 */
export function extractCNVFields(record) {
    const keys = [
        'Chr', 'Start', 'End', 'Type', 'Gene', 'Copys', 'Rank',
        'Phenotypes', 'Drugs', 'Plot', 'Report',
    ]
    const result = {}
    for (const key of keys) {
        const val = record[key]
        if (val !== undefined && val !== '' && val !== '.') {
            result[key] = Array.isArray(val) ? val.join('; ') : val
        }
    }
    return result
}

/**
 * 从 CNV WES 行数据中提取可读字段
 * @param {Object} record - 行数据对象
 * @returns {Object} 可读字段映射
 */
export function extractCNVWESFields(record) {
    const keys = [
        'Gene', 'Chr', 'Start', 'End', 'CNV_Type', 'Copy_Number',
        'CNV_Cover_Type', 'CNV_Length', 'ACMG_result', 'ACMG',
        'HPO', 'DGV', 'Clinvar', 'Gene_Related_Diseases',
        'Chromosomal_Region', 'Report',
    ]
    const result = {}
    for (const key of keys) {
        const val = record[key]
        if (val !== undefined && val !== '' && val !== '.') {
            result[key] = Array.isArray(val) ? val.join('; ') : val
        }
    }
    // 用户判定
    if (record.userVerdict && record.userVerdict.length > 0) {
        result.userVerdict = record.userVerdict.join('; ')
    }
    return result
}

/**
 * 构建 Fusion 分析的 prompt
 * @param {Object} fields - 提取后的可读字段
 * @param {string} subType - 'single' | 'somatic'
 * @returns {string} prompt
 */
export function buildFusionPrompt(fields, subType) {
    const label = subType === 'somatic' ? '体细胞' : '单样品'
    const lines = []
    lines.push(`请解读以下${label}融合基因的临床意义：`)
    lines.push('')

    // 基因信息
    const geneKeys = Object.keys(fields).filter(k =>
        k.toLowerCase().includes('gene') || k.toLowerCase().includes('fusion')
    )
    for (const k of geneKeys) {
        lines.push(`${k}: ${fields[k]}`)
    }

    // 位置
    for (const k of Object.keys(fields)) {
        if (k.toLowerCase().includes('chr') || k.toLowerCase().includes('breakpoint') ||
            k.toLowerCase().includes('position') || k.toLowerCase().includes('location')) {
            lines.push(`${k}: ${fields[k]}`)
        }
    }

    // 其他所有字段
    for (const [k, v] of Object.entries(fields)) {
        if (!geneKeys.includes(k) &&
            !k.toLowerCase().includes('chr') && !k.toLowerCase().includes('breakpoint') &&
            !k.toLowerCase().includes('position') && !k.toLowerCase().includes('location')) {
            lines.push(`${k}: ${v}`)
        }
    }

    lines.push('')
    lines.push('请从以下维度进行解读：')
    lines.push('1. 融合基因的致癌机制（如激酶域重排、信号通路激活）')
    lines.push('2. 临床意义（与癌症类型的关联，如NTRK融合泛癌靶向）')
    lines.push('3. 用药指导（如有靶向药物，如拉罗替尼、恩曲替尼等）')
    lines.push('4. 可信度评估（reads数、断点支持等）')

    return lines.join('\n')
}

/**
 * 构建 CNV 分析的 prompt
 * @param {Object} fields - 提取后的可读字段
 * @param {string} subType - 'basic' | 'wes'
 * @returns {string} prompt
 */
export function buildCNVPrompt(fields, subType) {
    const label = subType === 'wes' ? 'WES全外显子' : ''
    const typeLabel = fields.Type || fields.CNV_Type || ''
    const typeDesc = typeLabel === 'DUP' ? '拷贝数扩增' : typeLabel === 'DEL' ? '拷贝数缺失' : typeLabel
    const lines = []

    lines.push(`请解读以下${label}拷贝数变异（${typeDesc}）的临床意义：`)
    lines.push('')

    if (fields.Gene) {
        lines.push(`基因: ${fields.Gene}`)
    }
    if (fields.Chr) {
        lines.push(`位置: ${fields.Chr}:${fields.Start}-${fields.End}`)
    }
    if (typeDesc) {
        lines.push(`变异类型: ${typeDesc}`)
    }
    if (fields.Copy_Number || fields.Copys) {
        lines.push(`拷贝数: ${fields.Copy_Number || fields.Copys}`)
    }
    if (fields.CNV_Length) {
        const len = Number(fields.CNV_Length)
        if (len >= 1000000) {
            lines.push(`变异长度: ${(len / 1000000).toFixed(2)} Mb`)
        } else if (len >= 1000) {
            lines.push(`变异长度: ${(len / 1000).toFixed(2)} Kb`)
        } else {
            lines.push(`变异长度: ${fields.CNV_Length} bp`)
        }
    }
    if (fields.CNV_Cover_Type) {
        lines.push(`覆盖类型: ${fields.CNV_Cover_Type}`)
    }
    if (fields.ACMG_result) {
        lines.push(`ACMG分类: ${fields.ACMG_result}`)
    }
    if (fields.ACMG) {
        lines.push(`ACMG标准: ${fields.ACMG}`)
    }
    if (fields.Phenotypes || fields.HPO) {
        lines.push(`表型/HPO: ${fields.Phenotypes || fields.HPO}`)
    }
    if (fields.Drugs) {
        lines.push(`药物证据: ${fields.Drugs}`)
    }
    if (fields.Gene_Related_Diseases) {
        lines.push(`相关疾病: ${fields.Gene_Related_Diseases}`)
    }
    if (fields.Clinvar) {
        lines.push(`ClinVar: ${fields.Clinvar}`)
    }
    if (fields.DGV) {
        lines.push(`DGV: ${fields.DGV}`)
    }
    if (fields.userVerdict) {
        lines.push(`用户判定: ${fields.userVerdict}`)
    }
    if (fields.Report) {
        lines.push(`报告标记: ${fields.Report === 'Y' ? '默认入报告' : '默认不入报告'}`)
    }

    lines.push('')
    lines.push('请从以下维度进行解读：')
    lines.push('1. 致病性评估（基于ACMG-CNV指南证据）')
    lines.push('2. 临床意义（与疾病/癌症的关联）')
    lines.push('3. 用药指导（如有相关靶向药物）')
    lines.push('4. 变异特征评估（片段大小、基因覆盖、人群数据库频率）')

    return lines.join('\n')
}

/**
 * 构建突变分析的 prompt
 * @param {Object} fields - 提取后的可读字段
 * @param {string} type - 'somatic' | 'germline' | 'wes'
 * @returns {string} prompt
 */
export function buildMutationPrompt(fields, type) {
    const typeLabel = { somatic: '体细胞', germline: '胚系', wes: 'WES全外显子' }
    const lines = []

    lines.push(`请解读以下${typeLabel[type] || ''}突变的临床意义：`)
    lines.push('')

    // 基本信息
    if (fields.Gene_refGene || fields['Gene.refGene']) {
        const gene = fields.Gene_refGene || fields['Gene.refGene']
        lines.push(`基因: ${gene}`)
    }
    if (fields.AAChange) {
        lines.push(`氨基酸变化: ${fields.AAChange}`)
    }
    if (fields.NUChange) {
        lines.push(`核苷酸变化: ${fields.NUChange}`)
    }
    if (fields.ExonicFunc_refGene || fields['ExonicFunc.refGene']) {
        lines.push(
            `突变功能: ${fields.ExonicFunc_refGene || fields['ExonicFunc.refGene']}`
        )
    }
    if (fields.Chr) {
        lines.push(`位置: ${fields.Chr}:${fields.Start}-${fields.End} ${fields.Ref}>${fields.Alt}`)
    }

    // 致病性
    if (fields.CLNSIG || fields.Clinvar) {
        lines.push(`\nClinVar致病性: ${fields.CLNSIG || fields.Clinvar}`)
    }
    if (fields.ACMG_result) {
        lines.push(`ACMG分类: ${fields.ACMG_result}`)
    }
    if (fields.ACMG) {
        lines.push(`ACMG标准: ${fields.ACMG}`)
    }

    // 测序质量
    const qualityParts = []
    if (fields.SeqDepths_Tumor || fields.Seq_Depths_) {
        qualityParts.push(`深度=${fields.SeqDepths_Tumor || fields.Seq_Depths_}`)
    }
    if (fields.MutationRate_Tumor || fields.MutationRate_ || fields.MutationRate) {
        qualityParts.push(`VAF=${fields.MutationRate_Tumor || fields.MutationRate_ || fields.MutationRate}`)
    }
    if (qualityParts.length) {
        lines.push(`\n测序质量: ${qualityParts.join(', ')}`)
    }

    // 人群频率
    const freqParts = []
    for (const [key, val] of Object.entries(fields)) {
        if (
            (key.toLowerCase().includes('gnomad') || key === 'ExAC_ALL' || key.includes('1000g')) &&
            !key.includes('AFR') && !key.includes('AMR') && !key.includes('EAS') &&
            !key.includes('SAS') && !key.includes('FIN')
        ) {
            freqParts.push(`${key}=${val}`)
        }
    }
    if (fields.cohort) {
        freqParts.push(`队列频率=${fields.cohort}`)
    }
    if (freqParts.length) {
        lines.push(`\n人群频率: ${freqParts.join(', ')}`)
    }

    // 软件预测
    if (fields.SIFT_pred) {
        lines.push(`SIFT预测: ${fields.SIFT_pred} (T=耐受 D=有害)`)
    }
    if (fields.Software_Prediction_result) {
        lines.push(`综合预测: ${fields.Software_Prediction_result}`)
    }

    // 其他
    if (fields.OMIM) {
        lines.push(`\nOMIM: ${fields.OMIM}`)
    }
    if (fields.Gene_Related_Diseases) {
        lines.push(`相关疾病: ${fields.Gene_Related_Diseases}`)
    }
    if (fields.HPO) {
        lines.push(`HPO表型: ${fields.HPO}`)
    }
    if (fields.rsID) {
        lines.push(`rs号: ${fields.rsID}`)
    }
    if (fields.userVerdict) {
        lines.push(`用户判定: ${fields.userVerdict}`)
    }
    if (fields.Report) {
        lines.push(`报告标记: ${fields.Report === 'Y' ? '默认入报告' : '默认不入报告'}`)
    }

    lines.push('')
    lines.push('请从以下维度进行解读：')
    lines.push('1. 致病性评估（基于ClinVar/ACMG证据）')
    lines.push('2. 临床意义（与疾病/癌症的关联）')
    lines.push('3. 用药指导（如有相关药物证据）')
    lines.push('4. 遗传咨询建议（如为胚系突变）')
    lines.push('5. 数据质量评估（深度/VAF是否可靠）')

    return lines.join('\n')
}

/**
 * 构建批量分析的 prompt（多条记录合并）
 * @param {Array<Object>} fieldsList - 多条记录的可读字段数组
 * @param {string} type - 分析类型
 * @returns {string} prompt
 */
export function buildBatchPrompt(fieldsList, type) {
    const typeLabel = {
        somatic: '体细胞突变',
        germline: '胚系突变',
        wes: 'WES全外显子突变',
        'fusion-single': '融合基因',
        'fusion-somatic': '融合基因',
        cnv: '拷贝数变异',
        'cnv-wes': '拷贝数变异',
    }
    const lines = []
    const label = typeLabel[type] || '变异'
    lines.push(`请解读以下 ${fieldsList.length} 个${label}的临床意义，逐个进行分析：`)
    lines.push('')

    fieldsList.forEach((fields, idx) => {
        lines.push(`--- 变异 ${idx + 1} ---`)
        for (const [k, v] of Object.entries(fields)) {
            lines.push(`${k}: ${v}`)
        }
        lines.push('')
    })

    lines.push('请对每个变异分别从以下维度进行解读：')

    if (type.startsWith('fusion')) {
        lines.push('1. 融合基因的致癌机制')
        lines.push('2. 临床意义')
        lines.push('3. 用药指导')
        lines.push('4. 可信度评估')
    } else if (type.startsWith('cnv')) {
        lines.push('1. 致病性评估（基于ACMG-CNV指南证据）')
        lines.push('2. 临床意义')
        lines.push('3. 用药指导')
        lines.push('4. 变异特征评估')
    } else {
        lines.push('1. 致病性评估（基于ClinVar/ACMG证据）')
        lines.push('2. 临床意义')
        lines.push('3. 用药指导')
        lines.push('4. 数据质量评估')
    }

    lines.push('')
    lines.push('请用清晰的格式逐个编号解读，最后给出总体摘要。')
    return lines.join('\n')
}

/**
 * 流式调用 LLM 分析
 * @param {Object} fields - 提取后的可读字段（单条）或 fieldsList（批量时由外部构建 prompt）
 * @param {string} type - 'somatic' | 'germline' | 'wes' | 'fusion-single' | 'fusion-somatic' | 'cnv' | 'cnv-wes'
 * @param {Object} callbacks - 回调函数集
 * @param {Object} [options] - 可选参数
 * @param {string} [options.customPrompt] - 自定义 prompt（批量模式时使用）
 * @param {string} [options.customHint] - 自定义系统提示
 * @returns {AbortController} 可通过 .abort() 取消请求
 */
export function analyzeMutationWithAI(fields, type, callbacks = {}, options = {}) {
    const store = usePageAgentStore()
    const { onThinking, onContent, onDone, onError } = callbacks

    if (!store.isConfigured || !store.enabled) {
        onError?.(new Error('AI 助手未配置或未启用，请在系统设置中配置 API Key'))
        return null
    }

    // 根据 type 选择 prompt 构建器
    let prompt = options.customPrompt
    if (!prompt) {
        if (type.startsWith('fusion')) {
            const subType = type === 'fusion-somatic' ? 'somatic' : 'single'
            prompt = buildFusionPrompt(fields, subType)
        } else if (type === 'cnv') {
            prompt = buildCNVPrompt(fields, 'basic')
        } else if (type === 'cnv-wes') {
            prompt = buildCNVPrompt(fields, 'wes')
        } else {
            prompt = buildMutationPrompt(fields, type)
        }
    }

    // 系统提示根据类型调整
    const systemHints = {
        mutation: '专注于临床基因组学突变解读',
        fusion: '专注于基因融合（gene fusion）的致癌机制和靶向治疗解读',
        cnv: '专注于拷贝数变异（CNV）的致病性评估和临床意义解读',
    }
    let hint = options.customHint || systemHints.mutation
    if (!options.customHint) {
        if (type.startsWith('fusion')) hint = systemHints.fusion
        else if (type.startsWith('cnv')) hint = systemHints.cnv
    }
    const controller = new AbortController()

    const doStream = async () => {
        try {
            const response = await fetch(`${store.baseURL}/chat/completions`, {
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
                            content: `你是纳昂达生物信息分析云平台的 AI 助手，${hint}。请用中文回答，专业术语保留英文原文。所有用药建议仅供参考，临床决策需由专业医生做出。`,
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.3,
                    max_tokens: options.maxTokens || 2000,
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

                // 按行解析 SSE 数据
                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // 保留最后不完整的行

                for (const line of lines) {
                    const trimmed = line.trim()
                    if (!trimmed || !trimmed.startsWith('data:')) continue

                    const dataStr = trimmed.slice(5).trim()
                    if (dataStr === '[DONE]') continue

                    try {
                        const data = JSON.parse(dataStr)
                        const delta = data.choices?.[0]?.delta
                        if (!delta) continue

                        // 思维过程（部分模型如 qwen3 支持推理输出）
                        if (delta.reasoning_content) {
                            onThinking?.(delta.reasoning_content)
                        }
                        // 正文内容
                        if (delta.content) {
                            onContent?.(delta.content)
                        }
                    } catch {
                        // 忽略解析失败的行
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

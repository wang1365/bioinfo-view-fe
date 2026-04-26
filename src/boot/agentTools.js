/**
 * AI Agent 自定义工具集
 * 为 PageAgent 提供生信领域专属能力
 */
import { tool } from 'page-agent'

// zod 从 page-agent 的依赖中获取（与 PageAgentCore 使用同一版本）
import { z } from 'zod/v4'

/**
 * 工具：解读突变报告
 * 根据突变数据（基因、变异、致病性、人群频率等）生成临床解读摘要
 */
const interpret_mutation = tool({
    description:
        '解读基因突变报告数据。输入突变的基因名、变异信息、ClinVar致病性、人群频率等，输出中文临床解读摘要。' +
        '适用于体细胞突变(Somatic)、胚系突变(Germline)、WES突变报告的解读。',
    inputSchema: z.object({
        gene: z.string().describe('基因名，如 EGFR, BRCA1, TP53'),
        variant: z.string().describe('变异描述，如 p.L858R, c.5266dupC, exon19 del'),
        clinvar_significance: z
            .string()
            .optional()
            .describe('ClinVar致病性，如 Pathogenic, Likely pathogenic, VUS, Benign'),
        acmg_classification: z.string().optional().describe('ACMG分类，如 P, LP, VUS, LB, B'),
        population_frequency: z
            .string()
            .optional()
            .describe('人群频率信息，如 gnomAD AF=0.0001'),
        mutation_type: z
            .enum(['SNP', 'INDEL', 'CNV', 'Fusion'])
            .optional()
            .describe('突变类型'),
        cancer_type: z.string().optional().describe('关联癌症类型，如 肺腺癌, 乳腺癌'),
        is_somatic: z.boolean().optional().describe('是否为体细胞突变'),
        drug_evidence: z.string().optional().describe('药物证据，如 FDA批准/NCCN指南/临床试验'),
        depth: z.string().optional().describe('测序深度'),
        variant_allele_frequency: z.string().optional().describe('突变等位基因频率(VAF)'),
    }),
    execute: async function (input) {
        const parts = []
        parts.push(`【突变解读】${input.gene} ${input.variant}`)

        // 致病性判断
        const sig = input.clinvar_significance || input.acmg_classification
        if (sig) {
            const sigLower = sig.toLowerCase()
            if (sigLower.includes('pathogenic') || sigLower === 'p' || sigLower === 'lp') {
                parts.push(
                    `⚠️ 致病性: ${sig} — 该变异被判定为致病/可能致病，具有临床意义。`
                )
            } else if (sigLower.includes('benign') || sigLower === 'b' || sigLower === 'lb') {
                parts.push(`致病性: ${sig} — 该变异为良性/可能良性，通常无临床意义。`)
            } else {
                parts.push(
                    `致病性: ${sig} — 意义未明(VUS)，需结合家族史和其他证据综合判断。`
                )
            }
        }

        // 人群频率
        if (input.population_frequency) {
            parts.push(`人群频率: ${input.population_frequency}`)
        }

        // 体细胞/胚系区分
        if (input.is_somatic !== undefined) {
            if (input.is_somatic) {
                parts.push('变异类型: 体细胞突变 — 获得性变异，与肿瘤发生相关。')
            } else {
                parts.push('变异类型: 胚系突变 — 遗传性变异，可能影响家族成员。')
            }
        }

        // 测序质量
        if (input.depth || input.variant_allele_frequency) {
            const quality = []
            if (input.depth) quality.push(`深度=${input.depth}`)
            if (input.variant_allele_frequency) quality.push(`VAF=${input.variant_allele_frequency}`)
            parts.push(`测序质量: ${quality.join(', ')}`)
        }

        // 药物证据
        if (input.drug_evidence) {
            parts.push(`💊 药物证据: ${input.drug_evidence}`)
        }

        // 癌症关联
        if (input.cancer_type) {
            parts.push(`关联癌症: ${input.cancer_type}`)
        }

        return parts.join('\n')
    },
})

/**
 * 工具：解读CNV报告
 */
const interpret_cnv = tool({
    description:
        '解读拷贝数变异(CNV)报告。输入CNV的基因、变异类型(扩增/缺失)、拷贝数、药物证据等，输出临床解读。',
    inputSchema: z.object({
        gene: z.string().describe('基因名'),
        cnv_type: z.enum(['DUP', 'DEL']).describe('变异类型: DUP=扩增, DEL=缺失'),
        copy_number: z.number().optional().describe('拷贝数'),
        phenotypes: z.string().optional().describe('关联表型'),
        drug_info: z.string().optional().describe('药物信息及证据等级'),
        chromosome: z.string().optional().describe('染色体位置'),
    }),
    execute: async function (input) {
        const parts = []
        parts.push(
            `【CNV解读】${input.gene} — ${input.cnv_type === 'DUP' ? '拷贝数扩增' : '拷贝数缺失'}`
        )

        if (input.copy_number !== undefined) {
            const isAmplified = input.cnv_type === 'DUP' && input.copy_number >= 6
            const isHighLevel = input.cnv_type === 'DUP' && input.copy_number >= 3.6
            if (isAmplified) {
                parts.push(
                    `拷贝数: ${input.copy_number} — 高水平扩增，通常具有显著临床意义。`
                )
            } else if (isHighLevel) {
                parts.push(`拷贝数: ${input.copy_number} — 低水平扩增，可能具有临床意义。`)
            } else {
                parts.push(`拷贝数: ${input.copy_number}`)
            }
        }

        if (input.phenotypes) {
            parts.push(`关联表型: ${input.phenotypes}`)
        }

        if (input.drug_info) {
            parts.push(`💊 药物信息: ${input.drug_info}`)
        }

        return parts.join('\n')
    },
})

/**
 * 工具：解读融合报告
 */
const interpret_fusion = tool({
    description: '解读基因融合报告。输入融合基因名称、断点信息等，输出致癌机制和临床意义。',
    inputSchema: z.object({
        fusion_name: z.string().describe('融合基因名，如 EML4-ALK, BCR-ABL1'),
        breakpoint: z.string().optional().describe('断点信息'),
        supporting_reads: z.number().optional().describe('支持reads数'),
        known_oncogenic: z.boolean().optional().describe('是否为已知致癌融合'),
    }),
    execute: async function (input) {
        const parts = []
        parts.push(`【融合解读】${input.fusion_name}`)

        if (input.known_oncogenic) {
            parts.push('⚠️ 已知致癌融合 — 该融合具有明确的致癌机制和临床意义。')
        }

        if (input.supporting_reads !== undefined) {
            const reliability =
                input.supporting_reads >= 10
                    ? '可靠'
                    : input.supporting_reads >= 3
                      ? '需验证'
                      : '低可信度'
            parts.push(
                `支持reads: ${input.supporting_reads} (${reliability})`
            )
        }

        if (input.breakpoint) {
            parts.push(`断点: ${input.breakpoint}`)
        }

        return parts.join('\n')
    },
})

/**
 * 工具：解读肿瘤标志物（TMB/MSI/HRD）
 */
const interpret_biomarker = tool({
    description:
        '解读肿瘤标志物指标(TMB/MSI/HRD)。输入标志物类型和数值，输出临床意义和用药指导。',
    inputSchema: z.object({
        biomarker_type: z
            .enum(['TMB', 'MSI', 'HRD'])
            .describe('标志物类型: TMB=肿瘤突变负荷, MSI=微卫星不稳定性, HRD=同源重组缺陷'),
        value: z.number().describe('标志物数值'),
        unit: z.string().optional().describe('单位'),
    }),
    execute: async function (input) {
        const parts = []
        if (input.biomarker_type === 'TMB') {
            parts.push(`【TMB解读】TMB = ${input.value} ${input.unit || 'Muts/Mb'}`)
            if (input.value >= 10) {
                parts.push(
                    '✅ TMB-High (≥10 Muts/Mb) — 可能从免疫检查点抑制剂治疗中获益。' +
                        '参考: Keytruda(pembrolizumab) 已获FDA批准用于TMB-High实体瘤。'
                )
            } else {
                parts.push(
                    'TMB-Low (<10 Muts/Mb) — 免疫治疗获益可能性较低，建议结合MSI和其他指标综合评估。'
                )
            }
        } else if (input.biomarker_type === 'MSI') {
            parts.push(`【MSI解读】MSI比例 = ${input.value}%`)
            if (input.value >= 30) {
                parts.push(
                    '✅ MSI-H (≥30%) — 高度微卫星不稳定，提示可能从免疫治疗中获益，' +
                        '也可能提示林奇综合征(Lynch Syndrome)风险。'
                )
            } else if (input.value >= 10) {
                parts.push('MSI-L (10%-30%) — 低度微卫星不稳定，临床意义有限。')
            } else {
                parts.push('MSS (<10%) — 微卫星稳定，免疫治疗获益可能性较低。')
            }
        } else if (input.biomarker_type === 'HRD') {
            parts.push(`【HRD解读】HRD-sum = ${input.value}`)
            if (input.value >= 42) {
                parts.push(
                    '✅ HRD阳性 (≥42) — 同源重组缺陷，可能从PARP抑制剂治疗中获益。' +
                        '参考: 奥拉帕利(Olaparib)、尼拉帕利(Niraparib)等。'
                )
            } else {
                parts.push(
                    'HRD阴性 (<42) — 同源重组功能尚可，PARP抑制剂获益可能性较低。' +
                        '建议结合BRCA1/2突变状态综合评估。'
                )
            }
        }
        return parts.join('\n')
    },
})

/**
 * 工具：解读病原体报告
 */
const interpret_pathogen = tool({
    description:
        '解读病原微生物检测报告。输入病原体名称、相对丰度、reads数等，输出临床意义。',
    inputSchema: z.object({
        pathogen_name: z.string().describe('病原体名称（属名或种名）'),
        relative_abundance: z
            .string()
            .optional()
            .describe('相对丰度(%)'),
        reads_count: z.number().optional().describe('reads数'),
        pathogen_type: z
            .enum(['bacteria', 'fungus', 'virus', 'parasite'])
            .optional()
            .describe('病原体类型'),
    }),
    execute: async function (input) {
        const parts = []
        const typeMap = {
            bacteria: '细菌',
            fungus: '真菌',
            virus: '病毒',
            parasite: '寄生虫',
        }
        parts.push(
            `【病原体解读】${input.pathogen_name}${input.pathogen_type ? ` (${typeMap[input.pathogen_type] || input.pathogen_type})` : ''}`
        )

        if (input.relative_abundance) {
            parts.push(`相对丰度: ${input.relative_abundance}`)
        }

        if (input.reads_count !== undefined) {
            const reliability =
                input.reads_count >= 100
                    ? '高可信度'
                    : input.reads_count >= 10
                      ? '中等可信度'
                      : '低可信度，可能为环境污染'
            parts.push(`reads数: ${input.reads_count} (${reliability})`)
        }

        return parts.join('\n')
    },
})

/**
 * 工具：智能推荐分析流程
 */
const recommend_flow = tool({
    description:
        '根据样本类型和临床需求推荐合适的分析流程(Flow/Panel)。' +
        '输入样本类型、癌症类型或临床需求，输出推荐流程及理由。',
    inputSchema: z.object({
        sample_type: z
            .string()
            .optional()
            .describe('样本类型，如 肿瘤组织, 血液, FFPE'),
        cancer_type: z.string().optional().describe('癌症类型，如 肺癌, 乳腺癌, 结直肠癌'),
        clinical_need: z
            .string()
            .optional()
            .describe('临床需求，如 靶向用药指导, 免疫治疗评估, 遗传风险评估'),
        is_germline: z
            .boolean()
            .optional()
            .describe('是否为遗传性检测'),
    }),
    execute: async function (input) {
        const parts = []
        parts.push('【流程推荐】')

        const recommendations = []

        if (input.clinical_need?.includes('免疫治疗') || input.clinical_need?.includes('TMB')) {
            recommendations.push({
                flow: 'NanOncoPlus Panel',
                reason: '包含TMB和MSI评估，适合免疫治疗受益评估。',
            })
        }

        if (input.cancer_type?.includes('肺癌')) {
            recommendations.push({
                flow: 'LungCancer Panel',
                reason: '针对肺癌驱动基因和靶向药物设计的Panel，覆盖EGFR/ALK/ROS1等。',
            })
        }

        if (input.is_germline || input.clinical_need?.includes('遗传')) {
            recommendations.push({
                flow: 'HRR Panel',
                reason: '覆盖同源重组修复基因，适合遗传性肿瘤风险评估。',
            })
        }

        if (input.clinical_need?.includes('全外显子') || input.clinical_need?.includes('WES')) {
            recommendations.push({
                flow: 'WES (全外显子测序)',
                reason: '全外显子覆盖，适合罕见病诊断和全面遗传筛查。',
            })
        }

        if (input.clinical_need?.includes('靶向用药') || input.clinical_need?.includes('靶向')) {
            recommendations.push({
                flow: 'NanOncoPlus Panel',
                reason: '覆盖常见靶向药物相关基因，包含药物证据等级。',
            })
        }

        if (recommendations.length === 0) {
            recommendations.push({
                flow: 'NanOncoPlus Panel (通用肿瘤Panel)',
                reason: '覆盖范围广，包含突变/CNV/融合/TMB/MSI/HRD等多维度分析，适合大多数肿瘤检测场景。',
            })
        }

        recommendations.forEach((r, i) => {
            parts.push(`${i + 1}. ${r.flow} — ${r.reason}`)
        })

        parts.push('\n💡 提示: 最终流程选择需结合样本类型和数据量，请确认后创建任务。')
        return parts.join('\n')
    },
})

/**
 * 工具：任务异常智能诊断
 */
const diagnose_task_error = tool({
    description:
        '分析任务失败原因。输入错误信息，输出可能的根因和修复建议。' +
        '适用于任务状态为 FAILURED 时的诊断。',
    inputSchema: z.object({
        error_message: z.string().describe('任务错误信息'),
        task_name: z.string().optional().describe('任务名称'),
        flow_name: z.string().optional().describe('流程名称'),
    }),
    execute: async function (input) {
        const parts = []
        parts.push('【任务异常诊断】')

        const msg = (input.error_message || '').toLowerCase()
        const suggestions = []

        if (msg.includes('memory') || msg.includes('oom') || msg.includes('out of memory')) {
            suggestions.push('内存不足(OOM) — 建议减少并行任务数或联系管理员增加内存配额。')
        }
        if (msg.includes('disk') || msg.includes('space') || msg.includes('no space left')) {
            suggestions.push('磁盘空间不足 — 建议清理中间文件或联系管理员扩容。')
        }
        if (msg.includes('fastq') || msg.includes('bam') || msg.includes('file not found')) {
            suggestions.push(
                '数据文件缺失 — 建议检查FASTQ/BAM文件是否已正确上传，路径是否正确。'
            )
        }
        if (msg.includes('timeout') || msg.includes('time out') || msg.includes('killed')) {
            suggestions.push(
                '任务超时 — 可能由于数据量过大或流程参数不当，建议检查输入数据量。'
            )
        }
        if (msg.includes('sample') || msg.includes('quality') || msg.includes('qc')) {
            suggestions.push('样本质量问题 — 测序数据质量未达标，建议重新测序或调整QC参数。')
        }
        if (msg.includes('docker') || msg.includes('image') || msg.includes('container')) {
            suggestions.push('Docker容器错误 — 建议检查Docker镜像配置和参考基因组设置。')
        }
        if (msg.includes('reference') || msg.includes('genome') || msg.includes('index')) {
            suggestions.push('参考基因组问题 — 建议检查参考基因组索引文件是否完整。')
        }

        if (suggestions.length === 0) {
            suggestions.push(
                '无法自动诊断具体原因，建议: 1) 查看完整运行日志 2) 检查输入数据完整性 3) 联系技术支持'
            )
        }

        suggestions.forEach((s, i) => {
            parts.push(`${i + 1}. ${s}`)
        })

        return parts.join('\n')
    },
})

/**
 * 工具：生成自定义报告推荐
 */
const suggest_report_mutations = tool({
    description:
        '根据当前报告数据推荐应纳入自定义报告的突变/变异。' +
        '输入突变列表摘要信息，输出推荐入报告的变异及理由。',
    inputSchema: z.object({
        mutations_summary: z
            .string()
            .describe(
                '突变列表摘要，格式: 每行一个突变 "基因 变异 致病性 VAF"，如 "EGFR p.L858R Pathogenic 35%"'
            ),
        report_purpose: z
            .string()
            .optional()
            .describe('报告目的，如 靶向用药指导, 遗传咨询, 科研'),
    }),
    execute: async function (input) {
        const parts = []
        parts.push('【自定义报告推荐】')

        const lines = input.mutations_summary
            .split('\n')
            .filter((l) => l.trim())
        const recommended = []
        const optional = []

        for (const line of lines) {
            const fields = line.trim().split(/\s+/)
            if (fields.length < 3) continue

            const [gene, variant, ...rest] = fields
            const sigAndVaf = rest.join(' ').toLowerCase()

            if (
                sigAndVaf.includes('pathogenic') ||
                sigAndVaf.includes('likely pathogenic')
            ) {
                recommended.push({ gene, variant, reason: '致病/可能致病变异' })
            } else if (sigAndVaf.includes('vus')) {
                optional.push({ gene, variant, reason: 'VUS，建议结合临床判断' })
            }
        }

        if (recommended.length > 0) {
            parts.push('\n✅ 推荐纳入报告:')
            recommended.forEach((r) => {
                parts.push(`  - ${r.gene} ${r.variant}: ${r.reason}`)
            })
        }

        if (optional.length > 0) {
            parts.push('\n⚠️ 可选纳入:')
            optional.forEach((r) => {
                parts.push(`  - ${r.gene} ${r.variant}: ${r.reason}`)
            })
        }

        if (recommended.length === 0 && optional.length === 0) {
            parts.push('未发现明确致病性变异，建议根据临床需求选择VUS或良性变异入报告。')
        }

        return parts.join('\n')
    },
})

/**
 * 导出所有自定义工具
 */
export const bioAgentTools = {
    interpret_mutation,
    interpret_cnv,
    interpret_fusion,
    interpret_biomarker,
    interpret_pathogen,
    recommend_flow,
    diagnose_task_error,
    suggest_report_mutations,
}

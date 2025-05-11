export const useCustomCell = (columnName) => {
    return (record, rowIndex, column) => {
        return {
            // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
            style: {
                // 'font-weight': record.id === currentRow.value.id ? 'bolder' : 'normal',
                // 'background-color': record[columnName] === 'Y' ? '#1976d2' : '',
                'background-color': record[columnName] === 'Y' && column.key !== 'operation' ? '#fff5ee' : '',
                // cursor: 'pointer',
            },
            // 鼠标单击行
            onClick: (event) => {},
        }
    }
}

export const WES_PARAMS = {
    diseaseCategories: ['A', 'B', 'C'],
    phenoType: null,
    diseases: [],
    diseaseInheritanceModes: [],
    geneSet: '',
    excludeGensets: false,
    gene: [],
    prioritizationTier: [],
    acmgPathogenicity: [],
    clinvarPathogenicity: [],
    populationAlleleFrequency: [],
    pafComp: '>',
    pafValue: null,
    genoType: null,
    seqQuality: null,

    genoTypeComp: '>',
    genoTypeValue: null,

    variantQualityComp: '>',
    variantQualityValue: null,

    seqDepthComp: '>',
    seqDepthValue: null,

    minAlleleFraction: null,
    maxAlleleFraction: null,

    chromosome: null,
    chromosomeStart: null,
    chromosomeEnd: null,

    ratio: { type: Number },
    ratioCmp: '>',
    mutationType: null,
    mutationPosition: [],
    mutationMeaning: null,
    mutationRisk: null,
    human: 'ALL',
    humanRatio: { type: Number },
    sift: null,
    drug: false,
}

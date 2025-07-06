export const pieOption = {
    tooltip: {
        trigger: 'item',
    },
    legend: {
        show: false,
        top: '5%',
        left: 'center',
    },
    series: [
        {
            type: 'pie',
            radius: ['70%', '78%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 5,
                borderColor: '#fff',
                borderWidth: 1,
            },
            label: {
                show: true,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            tooltip: {
                position: 'top',
                textStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                },
                formatter: (param) => {
                    return `${param.data.name}: ${param.data.value}bp`
                },
            },
            emphasis: {
                label: {
                    show: false,
                    fontSize: '40',
                    fontWeight: 'bold',
                },
            },
            labelLine: {
                show: true,
            },
            data: [],
        },
        {
            type: 'pie',
            radius: ['55%', '60%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 3,
                borderColor: '#fff',
                borderWidth: 1,
                color: (object) => {
                    return object.data.ratio ? 'red' : '#f0f0f5'
                },
            },
            label: {
                show: false,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            tooltip: {
                position: 'top',
                textStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                },
                formatter: (param) => {
                    return param.data.ratio
                        ? `${param.data.name}: ${param.data.start}-${param.data.end} ${param.data.ratio} copy`
                        : null
                },
            },
            emphasis: {
                label: {
                    show: false,
                    position: 'center',
                    fontSize: '28',
                    fontWeight: 'bold',
                    formatter: (param) => {
                        const ratio = param.data.ratio || ''
                        return param.data.ratio ? `${param.data.name}: ${ratio}` : null
                    },
                },
            },
            labelLine: {
                show: false,
            },
            data: [],
        },
        {
            type: 'pie',
            radius: ['47%', '52%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 2,
                borderColor: '#fff',
                borderWidth: 1,
                color: (object) => {
                    return object.data.ratio ? 'green' : '#f0f0f5'
                },
            },
            label: {
                show: false,
                position: 'outside',
                padding: 0,
                lineHeight: 2,
            },
            tooltip: {
                position: 'top',
                textStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                },
                formatter: (param) => {
                    return param.data.ratio
                        ? `${param.data.name}: ${param.data.start}-${param.data.end} ${param.data.ratio} copy`
                        : null
                },
            },
            emphasis: {
                label: {
                    show: false,
                    position: 'center',
                    fontSize: '28',
                    fontWeight: 'bold',
                    formatter: (param) => {
                        const ratio = param.data.ratio || ''
                        return param.data.ratio ? `${param.data.name}: ${ratio}` : ''
                    },
                },
            },
            labelLine: {
                show: false,
            },
            data: [],
        },
    ],
}

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
    userPathogenicity: [],
    populationAlleleFrequency: [],
    pafComp: '>',
    pafValue: null,
    genoType: null,
    genoTypeComp: '>',
    genoTypeValue: null,
    seqQuality: null,
    variantQualityComp: '>',
    variantQuality: null,
    minAlleleFraction: null,
    maxAlleleFraction: null,
    depth: { type: Number },
    depthCmp: '>',
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

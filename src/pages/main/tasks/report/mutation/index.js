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

export const populations = {
    'GnomAD Genome Total': 'gnomAD_genome_ALL',
    'GnomAD Genome AFRF': 'gnomAD_genome_AFR',
    'GnomAD Genome AMRF': 'gnomAD_genome_AMR',
    'GnomAD Genome ASJF': 'gnomAD_genome_ASJ',
    'GnomAD Genome EASF': 'gnomAD_genome_EAS',
    'GnomAD Genome FINF': 'gnomAD_genome_FIN',
    'GnomAD Genome NFEF': 'gnomAD_genome_NFE',
    'GnomAD Genome OTHF': 'gnomAD_genome_OTH',
    'GnomAD exome Total': 'gnomAD_exome_ALL',
    'GnomAD exome AFR': 'gnomAD_exome_AFR',
    'GnomAD exome AMR': 'gnomAD_exome_AMR',
    'GnomAD exome ASJ': 'gnomAD_exome_ASJ',
    'GnomAD exome EAS': 'gnomAD_exome_EAS',
    'GnomAD exome FIN': 'gnomAD_exome_FIN',
    'GnomAD exome NFE': 'gnomAD_exome_NFE',
    'GnomAD exome OTH': 'gnomAD_exome_OTH',
    'GnomAD exome SAS': 'gnomAD_exome_SAS',
    'ExAC Total': 'ExAC_ALL',
    'ExAC AFR': 'ExAC_AFR',
    'ExAC AMR': 'ExAC_AMR',
    'ExAC EAS': 'ExAC_EAS',
    'ExAC FIN': 'ExAC_FIN',
    'ExAC NFE': 'ExAC_NFE',
    'ExAC OTH': 'ExAC_OTH',
    'ExAC SAS': 'ExAC_SAS',
    '1000 Genomes Total': '1000g2015aug_all',
    '1000 Genomes AFR': '1000g2015aug_afr',
    '1000 Genomes AMR': '1000g2015aug_amr',
    '1000 Genomes ESA': '1000g2015aug_eas',
    '1000 Genomes EUR': '1000g2015aug_eur',
    '1000 Genomes SAS': '1000g2015aug_sas',
}

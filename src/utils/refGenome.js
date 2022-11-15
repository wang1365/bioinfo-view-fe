export const hg19 = {
    // id: "hg19",
    // name: "Human (GRCh37/hg19)",
    fastaURL: "/igv/data/bioinfo/database_dir/hg19/hg19_genome/hg19.fa",
    indexURL: "/igv/data/bioinfo/database_dir/hg19/hg19_genome/hg19.fa.fai",
    // cytobandURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/cytoBand.txt",
    // aliasURL: "https://s3.amazonaws.com/igv.org.genomes/hg19/hg19_alias.tab",
    tracks: [
        {
            name: "===Refseq Genes",
            format: "refgene",
            id: "hg19_genes",
            url: "/igv/data/bioinfo/database_dir/refseq/hg19/ncbiRefSeq.sorted.hg19.txt.gz",
            indexURL: "/igv/data/bioinfo/database_dir/refseq/hg19/ncbiRefSeq.sorted.hg19.txt.gz.tbi",
            visibilityWindow: -1,
            supportsWholeGenome: false,
            removable: false,
            order: 1000000,
            infoURL: "https://www.ncbi.nlm.nih.gov/gene/?term=$$"
        }
    ],
    chromosomeOrder: "chr1, chr2, chr3, chr4, chr5, chr6, chr7, chr8, chr9, chr10, chr11, chr12, chr13, chr14, chr15, chr16, chr17, chr18, chr19, chr20, chr21, chr22, chrX, chrY"
}

export const hg38 = {
    // id: "hg38",
    // name: "Human (GRCh38/hg38)",
    fastaURL: "/igv/data/bioinfo/database_dir/hg38/hg38_genome/hg38.fa",
    indexURL: "/igv/data/bioinfo/database_dir/hg38/hg38_genome/hg38.fa.fai",
    // cytobandURL: "https://s3.amazonaws.com/igv.org.genomes/hg38/annotations/cytoBandIdeo.txt.gz",
    // aliasURL: "https://s3.amazonaws.com/igv.org.genomes/hg38/hg38_alias.tab",
    tracks: [
        {
            name: "===Refseq Genes",
            format: "refgene",
            url: "/igv/data/bioinfo/database_dir/refseq/hg38/ncbiRefSeq.sorted.hg38.txt.gz",
            indexURL: "/igv/data/bioinfo/database_dir/refseq/hg38/ncbiRefSeq.sorted.hg38.txt.gz.tbi",
            visibilityWindow: -1,
            supportsWholeGenome: false,
            removable: false,
            order: 1000000,
            infoURL: "https://www.ncbi.nlm.nih.gov/gene/?term=$$"
        }
    ],
    chromosomeOrder: "chr1, chr2, chr3, chr4, chr5, chr6, chr7, chr8, chr9, chr10, chr11, chr12, chr13, chr14, chr15, chr16, chr17, chr18, chr19, chr20, chr21, chr22, chrX, chrY"
}

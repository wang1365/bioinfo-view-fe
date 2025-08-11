import { api } from 'src/boot/axios'

// 获取自建参考基因组列表
export const getCustomReferenceGenomeList = (params) => {
    return api.get('/reference_genomes/', { params })
}

// 获取自建参考基因组详情
export const getCustomReferenceGenomeDetail = (id) => {
    return api.get(`/reference_genomes/${id}/`)
}

// 创建自建参考基因组
export const createCustomReferenceGenome = (data) => {
    return api.post('/reference_genomes/', data)
}

// 删除自建参考基因组
export const deleteCustomReferenceGenome = (id) => {
    return api.delete(`/reference_genomes/${id}/`)
}

export function collectInformation(data) {
    return api({
        url: `/reference_genomes/collect_information`,
        method: 'post',
        data,
    })
}

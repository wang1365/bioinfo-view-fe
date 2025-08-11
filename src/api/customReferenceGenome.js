import { api } from 'src/boot/axios'


// 获取自建参考基因组列表
export const getCustomReferenceGenomeList = (params) => {
    return api.get('/reference-genomes/', { params });
};

// 获取自建参考基因组详情
export const getCustomReferenceGenomeDetail = (id) => {
    return api.get(`/reference-genomes/${id}/`);
};

// 创建自建参考基因组
export const createCustomReferenceGenome = (data) => {
    return api.post('/reference-genomes/', data);
};


// 删除自建参考基因组
export const deleteCustomReferenceGenome = (id) => {
    return api.delete(`/reference-genomes/${id}/`);
};

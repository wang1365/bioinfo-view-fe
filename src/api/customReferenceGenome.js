import axios from 'axios';

// 创建axios实例
const api = axios.create({
    baseURL: '/api',
});

// 获取自建参考基因组列表
export const getCustomReferenceGenomeList = (params) => {
    return api.get('/custom-reference-genome/', { params });
};

// 获取自建参考基因组详情
export const getCustomReferenceGenomeDetail = (id) => {
    return api.get(`/custom-reference-genome/${id}/`);
};

// 创建自建参考基因组
export const createCustomReferenceGenome = (data) => {
    return api.post('/custom-reference-genome/', data);
};

// 更新自建参考基因组
export const updateCustomReferenceGenome = (id, data) => {
    return api.put(`/custom-reference-genome/${id}/`, data);
};

// 删除自建参考基因组
export const deleteCustomReferenceGenome = (id) => {
    return api.delete(`/custom-reference-genome/${id}/`);
};
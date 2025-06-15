import { api } from 'src/boot/axios'

// 分页查询用户列表
export function listVerdictByPatient(patient_identifier) {
    return api({
        url: '/verdict/by_patient/',
        method: 'get',
        params: { patient_identifier },
    })
}

export function setVerdictResult(patient_identifier, gene_identifier, result) {
    return api({
        url: '/verdict/',
        method: 'post',
        data: { patient_identifier, gene_identifier, result },
    })
}

import { api } from 'src/boot/axios'

// 分页查询用户列表
export function listVerdictByPatient(username) {
    return api({
        url: '/verdict/by_patient/',
        method: 'get',
        params: { patient_identifier: username },
    })
}

export function setVerdictResult(username, gene_identifier, result) {
    return api({
        url: '/verdict/',
        method: 'post',
        data: { patient_identifier:username, gene_identifier, result },
    })
}

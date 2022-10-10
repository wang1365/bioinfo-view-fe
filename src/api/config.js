import { api } from 'src/boot/axios'

// 分页查询用户列表
export function listConfig(params) {
    return api({
        url: '/config',
        method: 'get',
        params,
    })
}

export function createConfig(config) {
    return api({
        url: `/config`,
        method: 'post',
        data: config,
    })
}

export function updateConfig(config) {
    return api({
        url: `/config/${config.id}`,
        method: 'put',
        data: config,
    })
}

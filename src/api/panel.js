import { api } from 'src/boot/axios'

export function getPanels(params) {
    return api({
        url: `/flow/panels/`,
        method: 'get',
        params,
    })
}

export function getPanelDetail(id) {
    return api({
        url: `/flow/panels/${id}/`,
        method: 'get',
    })
}

export function createPanel(data) {
    return api({
        url: '/flow/panels/',
        method: 'post',
        data,
    })
}

export function updatePanel(data) {
    return api({
        url: `/flow/panels/${data.id}/`,
        method: 'patch',
        data,
    })
}

export function deletePanel(id) {
    return api({
        url: `/flow/panels/${id}/`,
        method: 'delete',
    })
}

import { api } from 'src/boot/axios'

export function getPanelGroups() {
    return api({
        url: `/flow/panelGroups/`,
        method: 'get',
    })
}

export function getPanelGroupDetail(id) {
    return api({
        url: `/flow/panelGroups/${id}/`,
        method: 'get',
    })
}

export function createPanelGroup(data) {
    // {
    //   "name": "WGS",
    //   "location": "first.sh",
    //   "alignment_tool": "bioinfo",
    //   "parameters": [{"key": "AAA", "required": true}],
    //   "desp": "xxx"
    // }
    return api({
        url: '/flow/panelGroups/',
        method: 'post',
        data,
    })
}

export function updatePanelGroup(id, data) {
    // {
    //   "name": "WGS",
    //   "location": "first.sh",
    //   "alignment_tool": "bioinfo",
    //   "parameters": [{"key": "AAA", "required": true}],
    //   "desp": "xxx"
    // }
    return api({
        url: `/flow/panelGroups/${id}/`,
        method: 'put',
        data,
    })
}

export function deletePanelGroup(id) {
    return api({
        url: `/flow/panelGroups/${id}/`,
        method: 'delete',
    })
}

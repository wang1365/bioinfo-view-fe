import { api } from 'src/boot/axios'

export function getFlows(page = 1, size = 1000) {
    return api({
        url: `/flow/flows/`,
        method: 'get',
        params: { page, size }
    })
}

export function getFlowsQuery(data, page = 1, size = 1000) {
    return api({
        url: `/flow/flows/query`,
        method: 'post',
        params: { page, size },
        data
    })
}

export function getUserFlows(userId) {
    return api({
        url: `/flow/flows/query`,
        method: 'post',
        params: { pag: 1, size: 10000 },
        data: {
            account_id: userId
        }
    })
}

export function getFlowDetail(id) {
    return api({
        url: `/flow/flows/${id}/`,
        method: 'get'
    })
}

export function createFlow(data) {
    // {
    //   "name": "WGS",
    //   "location": "first.sh",
    //   "alignment_tool": "bioinfo",
    //   "parameters": [{"key": "AAA", "required": true}],
    //   "desp": "xxx"
    // }
    return api({
        url: '/flow/flows/',
        method: 'post',
        data
    })
}

export function updateFlow(id, data) {
    // {
    //   "name": "WGS",
    //   "location": "first.sh",
    //   "alignment_tool": "bioinfo",
    //   "parameters": [{"key": "AAA", "required": true}],
    //   "desp": "xxx"
    // }
    return api({
        url: `/flow/flows/${id}/`,
        method: 'put',
        data
    })
}

export function deleteFlow(id) {
    return api({
        url: `/flow/flows/${id}/`,
        method: 'delete'
    })
}

export function getFlowFields() {
    return api({
        url: `/flow/flows/list_fields`,
        method: 'get'
    })
}

export function authFlows(userId, flowIds) {
    return api({
        url: `/flow/members/`,
        method: 'post',
        data: { flow_ids: flowIds, account_ids: [userId] }
    })
}


import { api } from 'src/boot/axios'

export function listSample(data) {
    return api({
        url: '/sample/samples/query',
        method: 'post',
        data: data,
    })
}

export function getSample(id) {
    return api({
        url: `/sample/samples/${id}/detail`,
        method: 'get',
    })
}

export function listSampleMetaByParams(params) {
    return api({
        url: `/sample/sampledatas/?${params}`,
        method: 'get',
    })
}

import { api } from 'src/boot/axios'

export function listSample(data, page, size) {
    return api({
        url: '/sample/samples/query',
        method: 'post',
        data: data,
        params: { page, size }
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

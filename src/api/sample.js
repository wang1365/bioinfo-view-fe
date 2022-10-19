import { api } from 'src/boot/axios'

export function listSample(keyword, page = 1, size = 10) {
    return api({
        url: '/sample/samples/query',
        method: 'post',
        data: { keyword, page, size },
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

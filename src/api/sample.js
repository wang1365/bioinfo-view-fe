import { api } from 'src/boot/axios'

export function listSample(keyword, page = 1, size = 10) {
    return api({
        url: '/sample/samples/query',
        method: 'post',
        data: { keyword, page, size },
    })
}

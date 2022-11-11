import { api } from 'src/boot/axios'

export function getTask(id) {
    return api({
        url: `/task/${id}`,
        method: 'get',
    })
}

export function readTaskFile(id, path) {
    return api({
        url: `/task/${id}/file/`,
        method: 'get',
        params: {
            path,
        },
    })
}

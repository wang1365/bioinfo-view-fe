import { api } from 'src/boot/axios'

export function listUser(page = 1, size = 10) {
    return api({
        url: '/account/',
        method: 'get',
        params: { page, size }
    })
}

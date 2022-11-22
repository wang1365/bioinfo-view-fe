import { api } from 'src/boot/axios'

export function login(data) {
    return api({
        url: '/account/?action=login',
        method: 'post',
        data: {
            email: data.username,
            password: data.password,
        },
    })
}

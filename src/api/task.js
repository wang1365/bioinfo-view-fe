import { api } from 'src/boot/axios'


export function getTask(id) {
    return api({
        url: `/task/${id}`,
        method: 'get',
    })
}

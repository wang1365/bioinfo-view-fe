import { api } from 'src/boot/axios'

export function collectInformation(data) {
    return api({
        url: `/cdc/collect_information`,
        method: 'post',
        data,
    })
}

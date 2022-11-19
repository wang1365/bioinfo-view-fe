import { api } from 'src/boot/axios'

export function getWeeklyDiskUsage() {
    return api({
        url: `/resource/resources/week`,
        method: 'get',
    })
}

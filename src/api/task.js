import { api } from 'src/boot/axios'
import moment from 'moment'

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

export function readTaskMuFile(id, name) {
    return api({
        url: `/task/${id}/mufile/`,
        method: 'get',
        params: {
            name,
        },
    })
}

export function getSummary() {
    return api({
        url: `/task/summary`,
        method: 'get',
    })
}

export function getWeeklySummary() {
    const params = {
        start_time__gte: moment().weekday(1).format('YYYY-MM-DD HH:mm:ss'),
        end_time__lte: moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss'),
    }
    return api({
        url: `/task/summary`,
        method: 'get',
        params,
    })
}

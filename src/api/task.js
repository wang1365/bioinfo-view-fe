import { api } from 'src/boot/axios'
import moment from 'moment'

export function getTask(id) {
    return api({
        url: `/task/${id}`,
        method: 'get',
    })
}

export function readTaskFile(id, path, ignore_not_existed, from_task_root = false) {
    const ignoreNotExistedFlag = typeof ignore_not_existed === 'boolean' ? ignore_not_existed : false
    const fromTaskRootFlag =
        from_task_root === true ||
        from_task_root === 1 ||
        from_task_root === '1' ||
        from_task_root === 'true'

    return api({
        url: `/task/${id}/file/`,
        method: 'get',
        params: {
            path,
            ignore_not_existed: ignoreNotExistedFlag,
            from_task_root: fromTaskRootFlag ? 1 : 0
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

export function updateTask(id, data) {
    return api({
        url: `/task/${id}`,
        method: 'put',
        data,
    })
}

export function createRp2CustomReport(id, data) {
    return api({
        url: `/task/${id}/rp2_custom_report/`,
        method: 'post',
        data
    })
}

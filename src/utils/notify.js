import { Notify } from 'quasar'

export function infoMessage(message = '成功') {
    Notify.create({
        type: 'positive',
        message: message,
    })
}
export function warnMessage(message = '成功') {
    Notify.create({
        type: 'yellow',
        message: message,
    })
}
export function errorMessage(message = '发生错误') {
    Notify.create({
        type: 'negative',
        message: message,
    })
}

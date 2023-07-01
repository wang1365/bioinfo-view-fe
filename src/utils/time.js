//时间格式yyyy-MM-dd HH:MM:SS
import { date } from 'quasar'
export const format = (dateStr) => {
    return date.formatDate(dateStr,  'YYYY-MM-DD HH:mm:ss')
}

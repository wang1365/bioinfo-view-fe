//时间格式yyyy-MM-dd HH:MM:SS
export const format = (dateStr) => {
    const date = new Date(dateStr)
    let month = (date.getMonth() + 1).toString().padStart(2, '0')
    let strDate = date.getDate().toString().padStart(2, '0')
    let hh = date.getHours().toString().padStart(2, '0')
    let mm = date.getMinutes().toString().padStart(2, '0')
    let ss = date.getSeconds().toString().padStart(2, '0')

    return `${date.getFullYear()}-${month}-${strDate} ${hh}:${mm}:${ss}`
}

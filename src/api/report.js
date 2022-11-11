import { api } from 'src/boot/axios'

export function getReportTable(taskId, name, queryBody = {}, fields = []) {
    return api({
        url: `/report/data/${taskId}/${name}/`,
        method: 'post',
        data: queryBody,
        transformResponse: [
            (res) => {
                const raw = JSON.parse(res).data.table
                // 文本分割多行，每行转多列，形成二维数组
                let lines = raw
                    .split('\n')
                    .filter((t) => t.length > 0)
                    .map((t) => t.split(','))

                // 根据fields进行，将每行的元素转为对象，以便于后续数据绑定
                if (fields.length > 0) {
                    const bound = fields.length
                    lines = lines.map((line) => {
                        if (line.length < bound) {
                            return null
                        }

                        const item = {}
                        fields.forEach((field, idx) => {
                            item[field] = line[idx]
                        })
                        return item
                    })
                    // .filter((t) => t != null)
                }
                return lines
            },
        ],
    })
}

export function getReportText(taskId, name) {
    return api({
        url: `/report/data/${taskId}/${name}/`,
        method: 'post',
        data: {},
    })
}

import { api } from 'src/boot/axios'

export function getReport(taskId, name, queryBody = {}, fields = []) {
    return api({
        url: `/report/data/${taskId}/${name}/`,
        method: 'post',
        data: queryBody,
        transformResponse: [
            (res) => {
                const raw = JSON.parse(res).data.table
                let lines = raw
                    .split('\n')
                    .filter((t) => t.length > 0)
                    .map((t) => t.split(','))
                if (fields.length > 0) {
                    const bound = fields.length
                    lines = lines
                        .map((line) => {
                            if (line.length > bound) {
                                return null
                            }

                            const item = {}
                            fields.forEach((field, idx) => {
                                item[field] = line[idx]
                            })
                            return item
                        })
                        .filter((t) => t != null)
                }
                return lines
            },
        ],
    })
}

import { getRelatedTasks } from 'src/api/report'
import { readTaskFile } from 'src/api/task'
import { getCsvDataAndSetLineNumber } from 'src/utils/csv'

export function fillCompareData(fields, taskId, file, rows, isVirus = false) {
    if (isVirus) {
        fields = ['speciesName', 'readsCount2', 'totalProportion', 'file', 'report']
    }
    compare(fields, taskId, file, rows, false)
}

function compare(fields, taskId, file, rows) {
    rows.forEach((row) => (row.compareResult = []))

    getRelatedTasks(taskId).then((res) => {
        // 遍历项目下的任务
        res.forEach((task) => {
            // 数据key（基于表头的dataIndex，额外增加行的数据文件列file）
            // 解析数据（开始2行为表头，需要排除）
            // console.log('=============>', task.id, file)
            readTaskFile(task.id, file, true).then((fileData) => {
                const lines = getCsvDataAndSetLineNumber(fileData, { start: 2, fields })
                if (!lines) {
                    return
                }
                // 找到种名相同的病原体数据
                rows.forEach((row) => {
                    const target = lines.filter((line) => line.speciesName === row.speciesName)[0]
                    // console.log('=============>target', target, lines, row.speciesName)
                    if (!target) {
                        return
                    }
                    row.compareResult.push({
                        sample: task.samples[0].identifier,
                        speciesName: target.speciesName,
                        totalProportion: target.totalProportion,
                        readsCount: target.readsCount2,
                    })
                })
            })
        })
    })
}

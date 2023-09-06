export function getCsvData(str, options = {}) {
    const defaultOptions = {
        splitter: '\t',
        hasHeaderLine: true,
        start: 0,
        fields: [],
        colIndex: [],
    }

    const finalOptions = {...defaultOptions}
    Object.assign(finalOptions, options)

    // 文本分割多行，每行转多列，形成二维数组
    let lines = str
        .split('\n')
        .filter((t) => t.length > 0)
        .map((t) => t.split(finalOptions.splitter))
    if (finalOptions.hasHeaderLine || finalOptions.start > 0) {
        lines = lines.splice(finalOptions.start || 1)
    }

    // 列过滤
    if (finalOptions.colIndex.length > 0) {
        lines = lines.map((cols) => {
            const items = []
            finalOptions.colIndex.forEach((i) => items.push(cols[i - 1]))
            return items
        })
    }

    // 根据fields进行，将每行的元素转为对象，以便于后续数据绑定
    if (finalOptions.fields.length > 0) {
        lines = lines.map((line) => {
            const item = {}
            finalOptions.fields.forEach((field, idx) => {
                item[field] = idx < line.length ? line[idx] : ''
            })
            return item
        })
        // .filter((t) => t != null)
    }
    return lines
}

export function getCsvDataAndSetLineNumber(str, options = {}) {
    const defaultOptions = {
        splitter: '\t',
        hasHeaderLine: true,
        fields: [],
        colIndex: []
    }
    const finalOptions = {...defaultOptions}
    Object.assign(finalOptions, options)
    let lines = str.split('\n')
    let start = 0
    if (finalOptions.hasHeaderLine) {
        start = 1
    }
    let rows = []
    for (let lineNumber = start; lineNumber < lines.length; lineNumber++) {
        let line = lines[lineNumber]
        if (line.length > 0) {
            let originRow = line.split(finalOptions.splitter)
            let row = []
            if (finalOptions.colIndex.length > 0) {
                finalOptions.colIndex.forEach((i) => row.push(originRow[i - 1]))
            } else {
                row = originRow

            }

            if (finalOptions.fields.length > 0) {
                // // mergeTail, 如果最后一列中存在跟splitter相同的字符，会导致分割错误；特殊处理：用于最后一列错误分割出来的数据join回到正确的最后一列
                // if (row.length > finalOptions.fields.length  && finalOptions.mergeTail) {
                //     row[finalOptions.fields.length - 1] = row.splice(finalOptions.fields.length - 1, row.length).join(finalOptions.splitter)
                // }
                let finalRow = {}
                finalOptions.fields.forEach((field, idx) => {
                    finalRow[field] = idx < row.length ? row[idx] : ''
                })
                finalRow.lineNumber = lineNumber
                rows.push(finalRow)
            } else {
                let linenumber = [lineNumber]
                row = linenumber.concat(row)
                rows.push(row)
            }
        }
    }
    return rows
}

export function getCsvHeader(str, splitter = '\t', line=0) {
    const lines = str.split('\n')
    // let headLine = str.substring(0, str.indexOf('\n'))
    return lines[line].split(splitter)
}

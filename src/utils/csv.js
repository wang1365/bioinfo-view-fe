export function getCsvData(str, options = {}) {
    const defaultOptions = {
        splitter: '\t',
        hasHeaderLine: true,
        fields: [],
    }

    const finalOptions = { ...defaultOptions }
    Object.assign(finalOptions, options)

    // 文本分割多行，每行转多列，形成二维数组
    let lines = str
        .split('\n')
        .filter((t) => t.length > 0)
        .map((t) => t.split(finalOptions.splitter))
    if (finalOptions.hasHeaderLine) {
        lines = lines.splice(1)
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

export function getCsvHeader(str, splitter = '\t') {
    let headLine = str.substring(0, str.indexOf('\n'))
    return headLine.split(splitter)
}

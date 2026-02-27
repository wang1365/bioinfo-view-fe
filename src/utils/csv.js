import Papa from 'papaparse'
import jschardet from 'jschardet'

const stripBom = (text) => {
    if (typeof text !== 'string') {
        return text
    }
    return text.replace(/^\ufeff/, '')
}

const countReplacementChars = (text) => {
    if (!text) {
        return 0
    }
    const matches = text.match(/\uFFFD/g)
    return matches ? matches.length : 0
}

const safeDecode = (bytes, encoding, options = {}) => {
    try {
        const decoder = new TextDecoder(encoding, options)
        return { text: decoder.decode(bytes), error: null }
    } catch (error) {
        return { text: '', error }
    }
}

const getTextStats = (text) => {
    const stats = {
        length: text.length,
        printable: 0,
        replacement: 0,
        cjk: 0,
        latin: 0,
        combining: 0,
        control: 0,
    }
    for (let i = 0; i < text.length; i += 1) {
        const code = text.charCodeAt(i)
        if (code === 0xfffd) {
            stats.replacement += 1
        }
        if (code < 0x20 && code !== 0x0a && code !== 0x0d && code !== 0x09) {
            stats.control += 1
            continue
        }
        stats.printable += 1
        if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)) {
            stats.cjk += 1
        } else if (
            (code >= 0x41 && code <= 0x5a) ||
            (code >= 0x61 && code <= 0x7a) ||
            (code >= 0x00c0 && code <= 0x024f)
        ) {
            stats.latin += 1
        } else if (code >= 0x0300 && code <= 0x036f) {
            stats.combining += 1
        }
    }
    return stats
}

const normalizeIfNeeded = (text) => {
    if (!text || !text.normalize) {
        return text
    }
    if (/\u0300|\u0301|\u0302|\u0303|\u0309|\u0323|\u0306|\u031B|\u036F/.test(text)) {
        return text.normalize('NFC')
    }
    return text
}

export function decodeCsvArrayBuffer(arrayBuffer, options = {}) {
    const defaultOptions = {
        encodings: ['gb18030', 'gbk', 'windows-1258'],
        maxReplacementRatio: 0.02,
        detectEncoding: true,
    }
    const finalOptions = { ...defaultOptions }
    Object.assign(finalOptions, options)

    const bytes = new Uint8Array(arrayBuffer || [])
    if (bytes.length === 0) {
        return ''
    }

    let bomEncoding = null
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        bomEncoding = 'utf-8'
    } else if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        bomEncoding = 'utf-16le'
    } else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        bomEncoding = 'utf-16be'
    }

    if (bomEncoding) {
        const decoded = safeDecode(bytes, bomEncoding)
        return stripBom(decoded.text)
    }

    if (finalOptions.detectEncoding) {
        const probe = bytes.slice(0, 10240)
        const binary = Array.from(probe)
            .map((b) => String.fromCharCode(b))
            .join('')
        const detected = jschardet.detect(binary)
        const detectedEncoding = detected?.encoding ? detected.encoding.toLowerCase() : ''
        if (detectedEncoding) {
            const normalizedEncoding = detectedEncoding.replace(/[_\s]/g, '-')
            const decoded = safeDecode(bytes, normalizedEncoding)
            if (!decoded.error) {
                return normalizeIfNeeded(stripBom(decoded.text))
            }
        }
    }

    const utf8Strict = safeDecode(bytes, 'utf-8', { fatal: true })
    if (!utf8Strict.error) {
        return stripBom(utf8Strict.text)
    }

    let bestText = ''
    let bestRatio = Number.POSITIVE_INFINITY
    let bestStats = null

    for (const encoding of finalOptions.encodings) {
        const decoded = safeDecode(bytes, encoding)
        if (decoded.error) {
            continue
        }
        const text = normalizeIfNeeded(stripBom(decoded.text))
        const replacementCount = countReplacementChars(text)
        const ratio = text.length > 0 ? replacementCount / text.length : 0
        const stats = getTextStats(text)
        if (ratio < bestRatio) {
            bestRatio = ratio
            bestText = text
            bestStats = stats
        }
        if (ratio <= finalOptions.maxReplacementRatio) {
            if (bestStats) {
                const printable = Math.max(1, bestStats.printable)
                const cjkRatio = bestStats.cjk / printable
                const latinRatio = bestStats.latin / printable
                const combiningRatio = bestStats.combining / printable
                if (cjkRatio >= 0.2 && cjkRatio > latinRatio) {
                    return text
                }
                if (latinRatio >= 0.2 && combiningRatio > 0) {
                    return text
                }
            }
            return text
        }
    }

    if (bestStats) {
        const printable = Math.max(1, bestStats.printable)
        const cjkRatio = bestStats.cjk / printable
        const latinRatio = bestStats.latin / printable
        const combiningRatio = bestStats.combining / printable
        if (latinRatio >= 0.2 && combiningRatio > 0) {
            return normalizeIfNeeded(bestText)
        }
        if (cjkRatio >= 0.2 && cjkRatio > latinRatio) {
            return bestText
        }
    }

    return bestText
}

export function parseCsvTextWithPapa(text, options = {}) {
    const defaultOptions = {
        header: true,
        delimiter: '',
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.replace(/^\ufeff/, '').trim(),
    }
    const finalOptions = { ...defaultOptions }
    Object.assign(finalOptions, options)

    const result = Papa.parse(text, finalOptions)
    const rows = Array.isArray(result.data) ? result.data.filter((row) => row && Object.keys(row).length > 0) : []
    return { rows, headers: result.meta?.fields || [], errors: result.errors || [], meta: result.meta || {} }
}

export function getCsvData(str, options = {}) {
    const defaultOptions = {
        splitter: '\t',
        hasHeaderLine: true,
        start: 0,
        fields: [],
        colIndex: [],
    }

    const finalOptions = { ...defaultOptions }
    Object.assign(finalOptions, options)

    const content = stripBom(str || '')
    // 文本分割多行，每行转多列，形成二维数组
    let lines = content
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
    if (!str) {
        console.log('getCsvDataAndSetLineNumber: No data')
        return []
    }
    const defaultOptions = {
        splitter: '\t',
        hasHeaderLine: true,
        fields: [],
        colIndex: [],
    }
    const finalOptions = { ...defaultOptions }
    Object.assign(finalOptions, options)
    const content = stripBom(str)
    let lines = content.split('\n')
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

export function getCsvHeader(str, splitter = '\t', line = 0) {
    if (!str) {
        console.log('getCsvHeader: No data')
        return []
    }
    const lines = stripBom(str).split('\n')
    // let headLine = str.substring(0, str.indexOf('\n'))
    return lines[line].split(splitter)
}

export function parseCsvToList(str, splitter = '\t', hasHeader = true) {
    const content = stripBom(str || '')
    if (!hasHeader) {
        return { rows: getCsvData(content, { splitter, hasHeaderLine: false }), headers: [] }
    }
    return parseCsvTextWithPapa(content, { delimiter: splitter })
}

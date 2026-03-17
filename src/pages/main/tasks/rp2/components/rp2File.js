export function getRp2LangSuffix(langCode) {
    return langCode === 'en' ? 'EN' : 'CN'
}

export function parseTabText(rawText, { hasHeader = true } = {}) {
    if (!rawText || typeof rawText !== 'string') {
        return {
            headers: [],
            rows: []
        }
    }

    const lines = rawText
        .split(/\r?\n/)
        .map((line) => line.replace(/\r$/, ''))
        .filter((line) => line.trim().length > 0)

    if (lines.length === 0) {
        return {
            headers: [],
            rows: []
        }
    }

    const splitLine = (line) => line.split('\t')

    let headers = []
    let dataLines = lines

    if (hasHeader) {
        headers = splitLine(lines[0]).map((header) => header.trim())
        dataLines = lines.slice(1)
    } else {
        const firstCols = splitLine(lines[0])
        headers = firstCols.map((_, index) => `column_${index + 1}`)
    }

    const rows = dataLines.map((line, rowIndex) => {
        const cols = splitLine(line)
        const row = {
            __rowKey: `${rowIndex + 1}`
        }

        headers.forEach((header, headerIndex) => {
            row[header] = cols[headerIndex] ?? ''
        })

        return row
    })

    return {
        headers,
        rows
    }
}

export function isDetected(text) {
    if (!text) {
        return false
    }

    const normalized = String(text).trim().toLowerCase()
    if (!normalized) {
        return false
    }

    return !['未检出', 'not detected', 'none', '-', '--'].includes(normalized)
}

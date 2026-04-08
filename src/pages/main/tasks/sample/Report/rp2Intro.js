const SAMPLE_CATEGORY_LABELS = {
    bacteria: '细菌',
    fungus: '真菌',
    virus: '病毒'
}

const getSampleModuleConfigCandidates = (sampleName, langCode) => {
    const normalizedSampleName = String(sampleName || '').trim()
    if (!normalizedSampleName) {
        return []
    }

    const suffix = String(langCode || '').toLowerCase() === 'en' ? 'EN' : 'CN'
    const candidates = [`${normalizedSampleName}/module_${suffix}.json`]
    if (suffix !== 'CN') {
        candidates.push(`${normalizedSampleName}/module_CN.json`)
    }
    return candidates
}

const tryParseJson = (text) => {
    if (!text) {
        return null
    }

    try {
        return JSON.parse(text)
    } catch (error) {
        try {
            return JSON.parse(String(text).replace(/,[ \t\r\n]+}/g, '}').replace(/,[ \t\r\n]+\]/g, ']'))
        } catch (ignored) {
            return null
        }
    }
}

const resolveSampleRelativePath = (sampleName, filePath) => {
    const normalizedPath = String(filePath || '').trim()
    if (!normalizedPath) {
        return ''
    }
    if (normalizedPath.startsWith('/')) {
        return normalizedPath
    }

    const normalizedSampleName = String(sampleName || '').trim().replace(/\/+$/, '')
    if (!normalizedSampleName) {
        return normalizedPath
    }

    return `${normalizedSampleName}/${normalizedPath.replace(/^\/+/, '')}`
}

const getSampleIntroDescriptionPath = (configJson, category, sampleName) => {
    const tabLabel = SAMPLE_CATEGORY_LABELS[category]
    if (!tabLabel || !configJson || typeof configJson !== 'object') {
        return ''
    }

    const rawPath = configJson?.[tabLabel]?.descriptionFile
    return resolveSampleRelativePath(sampleName, rawPath)
}

const getSampleTabTitle = (category, t) => {
    if (category === 'fungus') {
        return t('Fungus')
    }
    if (category === 'virus') {
        return t('Virus')
    }
    return t('Bacteria')
}

module.exports = {
    getSampleIntroDescriptionPath,
    getSampleModuleConfigCandidates,
    getSampleTabTitle,
    tryParseJson
}

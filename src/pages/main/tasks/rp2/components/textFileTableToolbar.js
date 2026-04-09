const normalizeTaskRootDir = (taskRootDir) => String(taskRootDir || '').trim().replace(/\/+$/, '')

const normalizeRelativeFilePath = (filePath) => String(filePath || '').trim().replace(/^\/+/, '')

const buildIgvTaskFileUrl = (taskRootDir, filePath) => {
    const normalizedTaskRootDir = normalizeTaskRootDir(taskRootDir)
    const normalizedFilePath = normalizeRelativeFilePath(filePath)
    if (!normalizedTaskRootDir || !normalizedFilePath) {
        return ''
    }
    return `igv${normalizedTaskRootDir}/${normalizedFilePath}`
}

const getTaskFileDownloadName = (filePath) => {
    const normalizedFilePath = String(filePath || '').trim().replace(/[?#].*$/, '')
    if (!normalizedFilePath) {
        return 'download.txt'
    }
    const segments = normalizedFilePath.split('/').filter(Boolean)
    return segments[segments.length - 1] || 'download.txt'
}

const shouldShowTableToolbar = ({ title = '', showDownload = false, hasActionsSlot = false } = {}) => {
    return Boolean(String(title || '').trim() || showDownload || hasActionsSlot)
}

module.exports = {
    buildIgvTaskFileUrl,
    getTaskFileDownloadName,
    shouldShowTableToolbar
}

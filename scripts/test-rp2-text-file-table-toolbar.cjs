const assert = require('node:assert/strict')

const {
    buildIgvTaskFileUrl,
    getTaskFileDownloadName,
    shouldShowTableToolbar
} = require('../src/pages/main/tasks/rp2/components/textFileTableToolbar.js')

assert.equal(
    buildIgvTaskFileUrl('/data/tasks/42', 'menu/analysis_pathogen_summary.CN.txt'),
    'igv/data/tasks/42/menu/analysis_pathogen_summary.CN.txt'
)
assert.equal(
    buildIgvTaskFileUrl('/data/tasks/42/', '/menu/analysis_pathogen_summary.CN.txt'),
    'igv/data/tasks/42/menu/analysis_pathogen_summary.CN.txt'
)
assert.equal(buildIgvTaskFileUrl('', 'menu/file.txt'), '')

assert.equal(getTaskFileDownloadName('menu/analysis_pathogen_summary.CN.txt'), 'analysis_pathogen_summary.CN.txt')
assert.equal(getTaskFileDownloadName('/menu/analysis_NC_overlap_stats.EN.add.txt?token=1'), 'analysis_NC_overlap_stats.EN.add.txt')
assert.equal(getTaskFileDownloadName(''), 'download.txt')

assert.equal(shouldShowTableToolbar({ title: 'Title', showDownload: false, hasActionsSlot: false }), true)
assert.equal(shouldShowTableToolbar({ title: '', showDownload: true, hasActionsSlot: false }), true)
assert.equal(shouldShowTableToolbar({ title: '', showDownload: false, hasActionsSlot: true }), true)
assert.equal(shouldShowTableToolbar({ title: '', showDownload: false, hasActionsSlot: false }), false)

console.log('rp2 text file table toolbar tests passed')

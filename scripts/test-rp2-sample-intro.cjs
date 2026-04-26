const assert = require('node:assert/strict')

const {
    getSampleIntroDescriptionPath,
    getSampleModuleConfigCandidates,
    getSampleTabTitle
} = require('../src/pages/main/tasks/sample/Report/rp2Intro.js')

const sampleName = 'D00002415'
const config = {
    细菌: {
        descriptionFile: 'final_result/Bacteria/Bacteria_intro_CN.txt'
    },
    真菌: {
        descriptionFile: '/shared/fungus_intro.txt'
    },
    病毒: {}
}

assert.deepEqual(getSampleModuleConfigCandidates(sampleName, 'en'), [
    `${sampleName}/module_EN.json`,
    `${sampleName}/module_CN.json`
])

assert.equal(getSampleTabTitle('bacteria', (value) => value), 'Bacteria')
assert.equal(getSampleTabTitle('fungus', (value) => value), 'Fungus')
assert.equal(getSampleTabTitle('virus', (value) => value), 'Virus')

assert.equal(
    getSampleIntroDescriptionPath(config, 'bacteria', sampleName),
    `${sampleName}/final_result/Bacteria/Bacteria_intro_CN.txt`
)
assert.equal(
    getSampleIntroDescriptionPath(config, 'fungus', sampleName),
    '/shared/fungus_intro.txt'
)
assert.equal(getSampleIntroDescriptionPath(config, 'virus', sampleName), '')
assert.equal(getSampleIntroDescriptionPath(null, 'bacteria', sampleName), '')

console.log('rp2 sample intro tests passed')

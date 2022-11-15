<template>
    <q-page style="overflow-x: hidden">
        <!--        <PageTitle title="基因组浏览器" />-->
        <!--        <div class="full-width full-height" id="igv" />-->
        <!--        <q-expansion-item expand-separator icon="settings_suggest" label="参数设置" class="shadow-1">-->
        <!--            <q-card>-->
        <!--                <q-card-section>-->
        <!--                    <span class="q-mr-md">基因组:</span>-->
        <!--                    <q-radio v-model="shape" val="hg19" label="hg19" size="xs" />-->
        <!--                    <q-radio v-model="shape" val="hg18" label="hg18" size="xs" />-->
        <!--                </q-card-section>-->
        <!--                <q-card-section>-->
        <!--                    <span class="q-mr-md">捕获 panel:</span>-->
        <!--                    <q-radio v-model="shape" val="hg19" label="hg19" size="xs" />-->
        <!--                    <q-radio v-model="shape" val="hg18" label="hg18" size="xs" />-->
        <!--                </q-card-section>-->
        <!--                <q-card-section>-->
        <!--                    <span class="q-mr-md">数据选择:</span>-->
        <!--                    <q-icon name="folder" color="info" size="sm"></q-icon>-->
        <!--                </q-card-section>-->
        <!--            </q-card>-->
        <!--            <div class="row justify-around">-->
        <!--                <q-btn label="提交" color="primary"></q-btn>-->
        <!--            </div>-->
        <!--            <div class="q-py-sm"></div>-->
        <!--        </q-expansion-item>-->

        <!--        <q-expansion-item label="样本信息" header-class="bg-primary text-white" dense> 2222</q-expansion-item>-->
        <!--        <q-expansion-item label="基因组浏览器" :default-opened="true" dense header-class="bg-purple text-white">-->
        <!--            <div id="igv"></div>-->
        <!--        </q-expansion-item>-->
        <q-banner>
            <q-tabs v-model="tab" dense>
                <q-tab label="基因组浏览" name="igv"></q-tab>
                <q-tab label="样本信息" name="sample"></q-tab>
                <q-space />
                <q-btn
                    v-if="hasAnyRole(['super'])"
                    label="选择基因组文件"
                    color="primary"
                    size="sm"
                    @click="inputDlgVisible = true"
                ></q-btn>
                <q-dialog v-model="inputDlgVisible">
                    <q-card class="my-card">
                        <q-card-section>
                            <q-input
                                v-model="inputForm.file"
                                label-color="primary"
                                label="输入结果文件路径"
                                stack-label
                            />
                            <div class="row">
                                <q-select
                                    v-model="inputForm.format"
                                    label="选择文件格式"
                                    label-color="primary"
                                    stack-label
                                    class="col-6"
                                    :options="['bam', 'bed', 'cvf', 'cram', 'gff', 'gff3']"
                                />
                                <q-select
                                    v-model="inputForm.type"
                                    label="选择Track类型"
                                    label-color="primary"
                                    stack-label
                                    class="col-6"
                                    :options="['annotation', 'alignment', 'variant', 'gwas']"
                                />
                            </div>
                            <q-input type="textarea" v-model="inputForm.refText" readonly />
                        </q-card-section>
                        <q-card-actions align="right">
                            <q-btn label="确定" color="primary" @click="addIgvFile" v-close-popup />
                            <q-btn label="取消" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>
            </q-tabs>
        </q-banner>

        <div v-show="tab === 'igv'" id="igv"></div>
        <div v-if="tab !== 'igv'" class="col">
            <sample-card :sample="sample" v-for="sample in samples" :key="sample.id" class="row-auto q-ma-md" />
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import {ref, reactive, onMounted, nextTick} from "vue"
import {useRoute, onBeforeRouteUpdate} from "vue-router"
import {getSample, listSampleMetaByParams} from 'src/api/sample'
import {getTask} from 'src/api/task'
import {errorMessage} from "src/utils/notify"
import {useQuasar, QSpinnerFacebook} from 'quasar'
import SampleCard from './components/SampleCard'
import {buildModelQuery, queryModel} from 'src/api/modelQueryBuilder'
import igv from 'igv'
import * as refGenomes from 'src/utils/refGenome'
import { hasAnyRole } from 'src/utils/user'
import {hg38} from "src/utils/refGenome";

const $q = useQuasar()
const route = useRoute()
const sample = ref(null)
const task = ref(null)
const tab = ref('igv')
// const options = ref({})
const inputDlgVisible = ref(false)
const inputForm = ref({
    file: '',
    type: 'annotation',
    format: 'bam',
    refText: ''
})
const samples = ref([])
let trackNames = []
let options = {}

onBeforeRouteUpdate(async (to, from) => {
    console.log('Route update', from, to)
})

onMounted(() => {
    refresh()
})

const refresh = () => {
    getSample(route.query.sample).then(res => {
        console.log(res)
        sample.value = res
        // refreshBrowser()
    }).finally(() => {
    })

    getTask(route.query.task).then(res => {
        console.log('==> 任务详情：', res)
        task.value = res

        const reference = res.env.GENOME === 'hg19' ? refGenomes.hg19 : refGenomes.hg38

        function toBai(bam) {
            return bam.substring(0, bam.length - 1) + 'i'
        }

        if (res && res.samples) {
            // 查询任务中的多个样本信息
            getSamples(res.samples)
        }

        let tracks = []
        let genome = 'hg19'
        if (!res || !res.igv || res.igv.length === 0) {
            errorMessage('中间文件不存在')
        } else {
            inputForm.value.refText = res.igv.map(t => t.join('\t')).join('\n')

            const base = '/igv'
            genome = 'hg19'
            tracks = []
            for (let line of res.igv) {
                if (line.length === 2) {
                    genome = line[1]
                }

                if (line.length === 4) {
                    const track = {
                        name: line[0],
                        type: line[1],
                        format: line[2],
                        url: base + line[3],
                    }

                    if (track.format === 'bam') {
                        track.indexURL = toBai(track.url)
                    }
                    tracks.push(track)
                }
            }
        }

        options = {
            // genome,
            reference,
            tracks,
            showCircularViewButton: true
        }

        trackNames = tracks.map(t => t.name)

        nextTick(() => {
            refreshBrowser()
        })
    }).finally(() => {
    })
}

const getSamples = (sampleDataIds) => {
    let query = buildModelQuery([], {'id__in': sampleDataIds})
    queryModel('sample', query).then(res => {
        const sampleMetaIds = res.results.map(t => t.sample_meta.id).filter(t => t !== null)
        query = buildModelQuery([], {'id__in': sampleMetaIds})
        queryModel('sample_meta', query).then(res => {
            samples.value = res.results
        })
    })
}

const refreshBrowser = () => {
    const igvDiv = document.getElementById('igv')

    console.log('==> 创建IGV浏览器节点', igvDiv, options)

    igv.createBrowser(igvDiv, options)
        .then(function (browser) {
            console.log("Created IGV browser", browser)
            igv.browser = browser
        })
}

const addIgvFile = () => {
    for (let name of trackNames) {
        igv.browser.removeTrackByName()
    }

    console.log('addIgvFile', inputForm.value)
    $q.loading.show({
        spinner: QSpinnerFacebook,
        spinnerColor: 'yellow',
        spinnerSize: 140,
        backgroundColor: 'grey',
        message: '正在加载和解析结果文件...',
        messageColor: 'black'
    })
    igv.browser.loadTrack({
        url: '/igv' + inputForm.value.file,
        type: inputForm.value.type,
        format: inputForm.value.format,
        label: inputForm.value.file
    })
        .then(function (newTrack) {
            console.log("Track loaded: " + newTrack.name)
            trackNames = [inputForm.value.type]
        })
        .catch(function (error) {
            alert("结果文件加载失败: " + error)
        })
        .finally(() => {
            $q.loading.hide()
        })
}
</script>

<style lang="scss" scoped>
.my-card {
    width: 1000px;
    max-width: 1800px;
}
</style>

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
                <q-btn label="选择基因组文件" color="primary" size="sm" @click="inputDlgVisible = true"></q-btn>
                <q-dialog v-model="inputDlgVisible">
                    <q-card style="width:500px">
                        <q-card-section>
                            <q-input
                                v-model="inputForm.file"
                                label-color="primary"
                                label="输入结果文件路径"
                                stack-label
                            />
                            <q-select
                                v-model="inputForm.type"
                                label="选择Track类型"
                                label-color="primary"
                                stack-label
                                :options="['annotation', 'alignment', 'variant', 'gwas']"
                            />
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
        <div v-if="tab !== 'igv'">
            <sample-card :sample="sample" v-for="sample in samples" :key="sample.id" />
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref, reactive, onMounted, nextTick } from "vue"
import { useRoute, onBeforeRouteUpdate } from "vue-router"
import { getSample, listSampleMetaByParams } from 'src/api/sample'
import { getTask } from 'src/api/task'
import { errorMessage } from "src/utils/notify"
import { useQuasar, QSpinnerFacebook } from 'quasar'
import SampleCard from './components/SampleCard'
import { buildModelQuery, queryModel } from 'src/api/modelQueryBuilder'
import igv from 'igv'

const $q = useQuasar()
const route = useRoute()
const sample = ref(null)
const task = ref(null)
const tab = ref('igv')
// const options = ref({})
const inputDlgVisible = ref(false)
const inputForm = ref({
    file: '',
    type: 'annotation'
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
            const base = '/igv'
            genome = res.igv[2][1]
            tracks = [{
                name: res.igv[0][0],
                type: 'annotation',
                format: 'bed',
                url: base + res.igv[0][1],
                indexed: false,
            }, {
                name: res.igv[1][0],
                type: 'annotation',
                format: 'bed',
                url: base + res.igv[1][1],
                indexed: false,
            }, {
                name: res.igv[3][0],
                type: 'alignment',
                format: 'bam',
                url: base + res.igv[3][1],
                indexURL: base + toBai(res.igv[3][1]),
                height: 250
            }, {
                name: res.igv[4][0],
                type: 'alignment',
                format: 'bam',
                url: base + res.igv[4][1],
                indexURL: base + toBai(res.igv[4][1]),
                height: 250
            }]

        }

        options = {
            genome,
            tracks,
            showCircularViewButton: true,
            showROITableButton: true,
        }

        trackNames = tracks.map(t => t.name)

        nextTick(() => {
            refreshBrowser()
        })
    }).finally(() => {
    })
}

const getSamples = (sampleDataIds) => {
    const query = buildModelQuery([], {'id__in': sampleDataIds})
    queryModel('sample_meta', query).then(res => {
        console.log('samples', res)
        samples.value = res.results
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
        label: inputForm.value.file,
        name: inputForm.value.file,
    })
    .then(function (newTrack) {
        console.log("Track loaded: " + newTrack.name)
        trackNames = [inputForm.value.type]
    }).catch(function (error)  {
        alert("结果文件加载失败: " + error)
    }).finally(() => {
        $q.loading.hide()
    })
}
</script>

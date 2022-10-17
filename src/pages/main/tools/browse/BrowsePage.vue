<template>
    <q-page id="igv" style="overflow-x: hidden">
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
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import {ref, reactive, onMounted, nextTick} from "vue"
import {useRoute, onBeforeRouteUpdate} from "vue-router"
import {getSample} from 'src/api/sample'
import {getTask} from 'src/api/task'
import igv from 'igv'

// const options = ref(["Google", "Facebook", "Twitter", "Apple", "Oracle"])
// const database = ref("Google");

const route = useRoute()
const browser = ref(null)
const sample = ref(null)
const task = ref(null)
// const options = ref({})
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

        const base = '/igv'
        const genome = res.igv[2][1]
        const tracks = [{
            name: res.igv[0][0],
            type: 'annotation',
            format: 'bed',
            url: base + res.igv[0][1],
            indexed: false,
            autoHeight: true
        }, {
            name: res.igv[1][0],
            type: 'annotation',
            format: 'bed',
            url: base + res.igv[1][1],
            indexed: false,
            autoHeight: true
        }, {
            name: res.igv[3][0],
            type: 'alignment',
            format: 'bam',
            url: base + res.igv[3][1],
            indexURL: base + toBai(res.igv[3][1]),
            autoHeight: true
        }, {
            name: res.igv[4][0],
            type: 'alignment',
            format: 'bam',
            url: base + res.igv[4][1],
            indexURL: base + toBai(res.igv[4][1]),
            autoHeight: true
        }]

        options = {
            genome,
            tracks,
            showCircularViewButton: true,
            showROITableButton: true,
        }

        nextTick(() => {
            refreshBrowser()
        })
    }).finally(() => {
    })
}

const refreshBrowser = () => {
    const igvDiv = document.getElementById('igv')
    // const genome = route.query.genome || 'hg38'
    // const format = route.query.format || 'cram'
    // const url = route.query.url || "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram"
    // const indexURL = route.query.indexURL || "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai"

    // const name = sample.value ? `${sample.value.patient.name}-${sample.value.library_number}` : '测试bam'
    // const genome = route.query.genome || 'hg19'
    // const format = route.query.format || 'bam'
    // const url = route.query.url || "http://10.10.0.208/mounted/test-igv-data/test.recal.bam"
    // const indexURL = route.query.indexURL || "http://10.10.0.208/mounted/test-igv-data/test.recal.bai"
    // http://10.10.0.208/#/main/tools/browse?genome=hg19&format=bam&url=http://10.10.0.208/mounted/test-igv-data/test.recal.bam&indexURL=http://10.10.0.208/mounted/test-igv-data/test.recal.bai

    //
    // const options = {
    //     genome,
    //     locus: "chr8:127,736,588-127,739,371",
    //     tracks: [
    //         {
    //             name,
    //             url,
    //             indexURL,
    //             format,
    //         }
    //     ]
    // }

    console.log('==> 创建IGV浏览器节点', igvDiv, options)

    igv.createBrowser(igvDiv, options)
        .then(function (browser) {
            console.log("Created IGV browser", browser)
        })
}
</script>

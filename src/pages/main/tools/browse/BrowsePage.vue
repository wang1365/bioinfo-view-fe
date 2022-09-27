<template>
    <q-page id="igv" padding style="overflow-x: hidden">
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
import {ref, onMounted, defineProps} from "vue"
import {useRoute, onBeforeRouteUpdate} from "vue-router"
import { getSample } from 'src/api/sample'
import igv from 'igv'

const options = ref(["Google", "Facebook", "Twitter", "Apple", "Oracle"])
const database = ref("Google");
const shape = ref("hg19");

const route = useRoute()
const browser = ref(null)
const sample = ref(null)

onBeforeRouteUpdate(async (to, from) => {
    console.log('Route upate', from, to)
})

onMounted(() => {
    refresh()
})

const refresh = () => {
    getSample(route.query.sample).then(res => {
        console.log(res)
        sample.value = res
        refreshBrowser()
    }).finally(() => {
    })
}

const refreshBrowser = () => {
    const igvDiv = document.getElementById('igv')
    // const genome = route.query.genome || 'hg38'
    // const format = route.query.format || 'cram'
    // const url = route.query.url || "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram"
    // const indexURL = route.query.indexURL || "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai"

    const name = sample.value ? `${sample.value.patient.name}-${sample.value.library_number}` : '测试bam'
    const genome = route.query.genome || 'hg19'
    const format = route.query.format || 'bam'
    const url = route.query.url || "http://10.10.0.208/mounted/test-igv-data/test.recal.bam"
    const indexURL = route.query.indexURL || "http://10.10.0.208/mounted/test-igv-data/test.recal.bai"
    // http://10.10.0.208/#/main/tools/browse?genome=hg19&format=bam&url=http://10.10.0.208/mounted/test-igv-data/test.recal.bam&indexURL=http://10.10.0.208/mounted/test-igv-data/test.recal.bai


    const options = {
        genome,
        locus: "chr8:127,736,588-127,739,371",
        tracks: [
            {
                name,
                url,
                indexURL,
                format,
            }
        ]
    }

    console.log('创建IGV浏览器节点', options)

    igv.createBrowser(igvDiv, options)
        .then(function (browser) {
            console.log("Created IGV browser", browser)
        })
}
</script>

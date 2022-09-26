<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="基因组浏览器" />
        <div class="full-width full-height" id="igv" />
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
import { ref, onMounted } from "vue";
import  igv  from 'igv'
const options = ref(["Google", "Facebook", "Twitter", "Apple", "Oracle"]);
const database = ref("Google");
const shape = ref("hg19");


onMounted(() => {
    const igvDiv = document.getElementById('igv')
    const options =
        {
            genome: "hg38",
            locus: "chr8:127,736,588-127,739,371",
            tracks: [
                {
                    "name": "HG00103",
                    "url": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram",
                    "indexURL": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai",
                    "format": "cram"
                }
            ]
        }

    igv.createBrowser(igvDiv, options)
        .then(function (browser) {
            console.log("Created IGV browser");
        })
})
</script>

<template>

    <div class="q-py-md">
        {{qcIntro}}
    </div>

    <div class="q-py-md">


        <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-4" align="left" class="bg-grey-1"
            :breakpoint="0" dense>
            <q-tab name="试剂盒捕获质控信息" label="试剂盒捕获质控信息" />
            <q-tab name="深度信息" label="深度信息" />

        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="试剂盒捕获质控信息">
                <KitCaptureVue />
            </q-tab-panel>
            <q-tab-panel name="深度信息">
                <DeepInfoVue />
            </q-tab-panel>
        </q-tab-panels>
    </div>

</template>
<script setup>
import { ref, onMounted } from "vue";
import KitCaptureVue from "./KitCapture.vue"
import DeepInfoVue from "./DeepInfo.vue"
import { useRoute } from 'vue-router'
import { getReportText } from "src/api/report"

const route = useRoute()
const tab = ref("试剂盒捕获质控信息")
const qcIntro = ref('')


onMounted(() => {
    getReportText(route.params.id, 'QC_TIP').then(res => {
        console.log('====>', res)
        qcIntro.value = res
    })
})

</script>

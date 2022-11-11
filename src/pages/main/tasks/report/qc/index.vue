<template>
    <div class="q-py-sm">
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="relative-position float-right z-top q-mr-md"
            @click="dlgVisible = !dlgVisible"
            >说明</q-btn
        >
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left"
            class="bg-grey-1"
            :breakpoint="0"
            dense
        >
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
        <q-separator class="bg-separator" />
        <div class="q-py-md">
            {{ intro }}
        </div>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 800px; max-width: 2000px">
                <q-bar class="bg-primary text-white">质控解读</q-bar>
                <q-card-section>{{intro}}</q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">关闭</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import {ref, onMounted} from "vue";
import KitCaptureVue from "./KitCapture.vue"
import DeepInfoVue from "./DeepInfo.vue"
import {useRoute} from 'vue-router'
import {getReportText} from "src/api/report"

const route = useRoute()
const tab = ref("试剂盒捕获质控信息")
const intro = ref('')
const dlgVisible = ref(false)


onMounted(() => {
    getReportText(route.params.id, 'QC_TIP').then(res => {
        console.log('====>', res)
        intro.value = res
    })
})
</script>

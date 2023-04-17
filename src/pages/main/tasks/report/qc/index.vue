<template>
    <div class="q-py-sm">
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="relative-position float-right q-mr-md"
            @click="dlgVisible = !dlgVisible"
            >{{$t('Intro')}}</q-btn
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
            <q-tab name="试剂盒捕获质控信息" :label="$t('CaptureKitQcInformation')" v-if="props.viewConfig.showQCsummary" />
            <q-tab name="深度信息" :label="$t('DepthInformation')" v-if="props.viewConfig.showQCdepth" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="试剂盒捕获质控信息">
                <KitCaptureVue :samples="samples" />
            </q-tab-panel>
            <q-tab-panel name="深度信息">
                <DeepInfoVue :samples="samples" />
            </q-tab-panel>
        </q-tab-panels>
        <q-separator class="bg-separator" />
        <div class="q-py-md">
            <q-input v-if="tab === '试剂盒捕获质控信息'" :model-value="tip" readonly autogrow type="textarea"></q-input>
        </div>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{$t('QC')}}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{props.intro}}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">{{$t('Close')}}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, toRefs, watch } from 'vue'
import KitCaptureVue from './KitCapture.vue'
import DeepInfoVue from './DeepInfo.vue'
import { useRoute } from 'vue-router'
import { readTaskFile } from "src/api/task";
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'

const store = globalStore()
const { langCode } = storeToRefs(store)
const route = useRoute()
const tab = ref('试剂盒捕获质控信息')
const dlgVisible = ref(false)
const tip = ref('')

const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showQCsummary: true,
                showQCdepth: true,
            }
        },
    },
})

const { samples } = toRefs(props)

onMounted(() => {
    getQcTip()
})

watch(langCode, v => {
    getQcTip()
})


const getQcTip = () => {
    const suffix = langCode.value === 'en' ? 'EN' : 'CN'
    readTaskFile(route.params.id, `QC/QC_tip_${suffix}`).then(res => {
        tip.value = res
    })
}
</script>

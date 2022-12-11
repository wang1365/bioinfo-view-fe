<template>
    <div class="q-py-sm">
        <q-btn
            v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            color="primary"
            class="relative-position float-right q-mr-md"
            label="已固定过滤"
        />
        <q-btn
            v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            outline
            color="primary"
            class="relative-position float-right q-mr-md"
            @click="stickFilter()"
            label="固定过滤"
        />
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class="relative-position float-right q-mr-md"
            @click="dlgVisible = !dlgVisible"
        >说明</q-btn>
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left"
            class="bg-grey-1"
            :breakpoint="0"
            dense
        >
            <q-tab name="单样品融合分析" label="单样品融合分析" v-if="props.viewConfig.showFusionGermline" />
            <q-tab name="体细胞融合分析" label="体细胞融合分析" v-if="props.viewConfig.showFusionSomatic" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="单样品融合分析">
                <Single :samples="props.samples" />
            </q-tab-panel>
            <q-tab-panel name="体细胞融合分析">
                <NormalVue :samples="props.samples" />
            </q-tab-panel>
        </q-tab-panels>
        <q-separator class="bg-separator" />
        <!--        <div class="q-py-md">-->
        <!--            <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>-->
        <!--        </div>-->
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 800px; max-width: 2000px">
                <q-bar class="bg-primary text-white">融合分析</q-bar>
                <q-card-section>
                    <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">关闭</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, toRef } from 'vue'
import NormalVue from './Normal.vue'
import Single from './Single.vue'

const tab = ref('单样品融合分析')
const dlgVisible = ref(false)

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
                showFusionGermline: true,
                showFusionSomatic: true,
                showStick: false,
            }
        },
    },
})
const stickData = ref({ somaticMutation: {}, germlineMutation: {} })
const stickDone = (name, data) => {
    console.log(name, data)
    stickData.value[name] = data
}
const emit = defineEmits('stickDone')
const config = toRef(props, 'viewConfig')
const stickFilter = () => {
    if (!stickData.value.germlineMutation.filter && config.value.showMutGermline) {
        errorMessage('胚系突变分析未进行过滤')
        return false
    }
    if (!stickData.value.somaticMutation.filter && config.value.showMutSomatic) {
        errorMessage('体细胞突变分析未进行过滤')
        return false
    }
    emit('stickDone', stickData.value)
}
</script>

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
            <q-tab name="单样品融合分析" label="单样品融合分析" />
            <q-tab name="体细胞融合分析" label="体细胞融合分析" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="单样品融合分析">
                <TumorVue />
            </q-tab-panel>
            <q-tab-panel name="体细胞融合分析">
                <NormalVue />
            </q-tab-panel>
        </q-tab-panels>
        <q-separator class="bg-separator" />
        <!--        <div class="q-py-md">-->
        <!--            <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>-->
        <!--        </div>-->
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 800px; max-width: 2000px">
                <q-bar class="bg-primary text-white">融合分析解读</q-bar>
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
import { ref, onMounted } from "vue";
import NormalVue from "./Normal.vue";
import TumorVue from "./Tumor.vue";

const tab = ref("单样品融合分析")
const dlgVisible = ref(false)

const props = defineProps({
    intro: {
        type: String,
        required: false
    }
})
</script>

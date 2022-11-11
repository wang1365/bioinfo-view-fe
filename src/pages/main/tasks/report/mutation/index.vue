<template>
    <q-btn
        icon="help_outline"
        size="small"
        outline
        color="orange"
        class="relative-position float-right z-top q-mr-md"
        @click="dlgVisible = !dlgVisible"
        >说明</q-btn
    >
    <div class="q-py-md">突变介绍:突变介绍:突变介绍:突变介绍:突变介绍:突变介绍:突变介绍:突变介绍:</div>
    <div class="q-py-md">
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left"
            class="bg-grey-1"
            :breakpoint="0"
            dense
        >
            <q-tab name="胚系突变分析" label="胚系突变分析" />
            <q-tab name="体细胞突变分析" label="体细胞突变分析" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="胚系突变分析">
                <GermlineMutationVue />
            </q-tab-panel>
            <q-tab-panel name="体细胞突变分析">
                <SomaticMutationVue />
            </q-tab-panel>
        </q-tab-panels>
    </div>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 800px; max-width: 2000px">
            <q-bar class="bg-primary text-white">质控解读</q-bar>
            <q-card-section>
                <q-input :model-value="props.intro" readonly autogrow type="textarea"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-close-popup color="primary">关闭</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import GermlineMutationVue from "./GermlineMutation.vue"
import SomaticMutationVue from "./SomaticMutation.vue"
const tab = ref("胚系突变分析")
const dlgVisible = ref(false)
const props = defineProps({
    intro: {
        type: String,
        required: false
    }
})
</script>

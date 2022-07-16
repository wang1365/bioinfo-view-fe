<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="Panel 分析流程" />
        <q-card>
            <q-splitter v-model="splitterModel">
                <template v-slot:before>
                    <q-tabs
                        v-model="ctab"
                        dense
                        align="left"
                        vertical
                        class="shadow-2 felx-end"
                        :breakpoint="0"
                    >
                        <q-tab
                            v-for="tab in tabs"
                            :key="tab.name"
                            :name="tab.name"
                            class="text-hover q-my-sm text-h3"
                            :class="{
                                'text-primary': ctab === tab.name,
                                'bg-primary': ctab === tab.name,
                                'text-white': ctab === tab.name,
                            }"
                            :label="tab.label"
                        />
                    </q-tabs>
                </template>
                <template v-slot:after>
                    <q-tab-panels v-model="ctab" animated>
                        <q-tab-panel name="ExomePlusPanelV2">
                            <ExomePlusPanelV2></ExomePlusPanelV2>
                        </q-tab-panel>
                        <q-tab-panel name="HiSNPPanelV1">
                            <HiSNPPanelV1></HiSNPPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="HiSNPUltraPanelV1">
                            <HiSNPUltraPanelV1></HiSNPUltraPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="HLAtypingPanelV1">
                            <HLAtypingPanelV1></HLAtypingPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="HPVisualPanelV1">
                            <HPVisualPanelV1></HPVisualPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="HRRPanelV1">
                            <HRRPanelV1></HRRPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="LungCancerPanelV1">
                            <LungCancerPanelV1></LungCancerPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="NanoHemaReseachPanelV1">
                            <NanoHemaReseachPanelV1></NanoHemaReseachPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="NanOncoPlusPanelV2">
                            <NanOncoPlusPanelV2></NanOncoPlusPanelV2>
                        </q-tab-panel>
                        <q-tab-panel name="NanOncoPlusPanelV3">
                            <NanOncoPlusPanelV3></NanOncoPlusPanelV3>
                        </q-tab-panel>
                        <q-tab-panel name="NanOnCTPanelV1">
                            <NanOnCTPanelV1></NanOnCTPanelV1>
                        </q-tab-panel>
                        <q-tab-panel name="NanoRVPanelV1TechAccess">
                            <NanoRVPanelV1TechAccess></NanoRVPanelV1TechAccess>
                        </q-tab-panel>
                        <q-tab-panel name="NEXomeCorePanel">
                            <NEXomeCorePanel></NEXomeCorePanel>
                        </q-tab-panel>
                        <q-tab-panel name="NEXomePlusPanelV1">
                            <NEXomePlusPanelV1></NEXomePlusPanelV1>
                        </q-tab-panel>
                    </q-tab-panels>
                </template>
            </q-splitter>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ExomePlusPanelV2 from "./flows/ExomePlusPanelV2.vue";
import HiSNPPanelV1 from "./flows/HiSNPPanelV1.vue";
import HiSNPUltraPanelV1 from "./flows/HiSNPUltraPanelV1.vue";
import HLAtypingPanelV1 from "./flows/HLAtypingPanelV1.vue";
import HPVisualPanelV1 from "./flows/HPVisualPanelV1.vue";
import HRRPanelV1 from "./flows/HRRPanelV1.vue";
import LungCancerPanelV1 from "./flows/LungCancerPanelV1.vue";
import NanoHemaReseachPanelV1 from "./flows/NanoHemaReseachPanelV1.vue";
import NanOncoPlusPanelV2 from "./flows/NanOncoPlusPanelV2.vue";
import NanOncoPlusPanelV3 from "./flows/NanOncoPlusPanelV3.vue";
import NanOnCTPanelV1 from "./flows/NanOnCTPanelV1.vue";
import NanoRVPanelV1TechAccess from "./flows/NanoRVPanelV1TechAccess.vue";
import NEXomeCorePanel from "./flows/NEXomeCorePanel.vue";
import NEXomePlusPanelV1 from "./flows/NEXomePlusPanelV1.vue";
import { ref } from "vue";
const ctab = ref("ExomePlusPanelV2");
const tabs = ref([
    { label: "Exome Plus Panel v2.0", name: "ExomePlusPanelV2" },
    { label: "HiSNP Panel v1.0", name: "HiSNPPanelV1" },
    { label: "HiSNP Ultra Panel v1.0", name: "HiSNPUltraPanelV1" },
    { label: "HLAtyping Panel v1.0", name: "HLAtypingPanelV1" },
    { label: "HPVisual Panel v1.0", name: "HPVisualPanelV1" },
    { label: "HRR Panel v1.0", name: "HRRPanelV1" },
    { label: "LungCancer Panel v1.0", name: "LungCancerPanelV1" },
    {
        label: "NanoHema Reseach Panel v1.0",
        name: "NanoHemaReseachPanelV1",
    },
    { label: "NanOnco Plus Panel v2.0", name: "NanOncoPlusPanelV2" },
    { label: "NanOnco Plus Panel v3.0", name: "NanOncoPlusPanelV3" },
    { label: "NanOnCT Panel v1.0", name: "NanOnCTPanelV1" },
    {
        label: "NanoRV Panel v1.0-Tech Access",
        name: "NanoRVPanelV1TechAccess",
    },
    { label: "NEXome Core Panel", name: "NEXomeCorePanel" },
    { label: "NEXome Plus Panel v1.0", name: "NEXomePlusPanelV1" },
]);
</script>

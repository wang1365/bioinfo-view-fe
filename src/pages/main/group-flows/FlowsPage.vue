<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="群体分析流程" />
        <q-card>
            <q-splitter v-model="splitterModel">
                <template v-slot:before>
                    <q-tabs v-model="ctab" dense align="left" vertical class="shadow-2 felx-end" :breakpoint="0">
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
                        <q-tab-panel name="exome_plus_panel_v2.0">
                            <PanelTab></PanelTab>
                        </q-tab-panel>

                        <q-tab-panel name="group">
                            <GroupTab></GroupTab>
                        </q-tab-panel>
                    </q-tab-panels>
                </template>
            </q-splitter>
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import PanelTab from "./PanelTab.vue";
import GroupTab from "./GroupTab.vue";
import { ref } from "vue";
const ctab = ref("exome_plus_panel_v2.0");
const tabs = ref([
    { label: "Exome Plus Panel v2.0", name: "exome_plus_panel_v2.0" },
    { label: "HiSNP Panel v1.0", name: "hisnp_panel_v1.0" },
    { label: "HiSNP Ultra Panel v1.0", name: "hisnp_ultra_panel_v1.0" },
    { label: "HLAtyping Panel v1.0", name: "hlatyping_panel_v1.0" },
    { label: "HPVisual Panel v1.0", name: "hpvisual_panel_v1.0" },
    { label: "HRR Panel v1.0", name: "hrr_panel_v1.0" },
    { label: "HRR Panel v1.0", name: "hrr_panel_v1.0" },
    { label: "LungCancer Panel v1.0", name: "lungcancer_panel_v1.0" },
    {
        label: "NanoHema Reseach Panel v1.0",
        name: "nanohema_reseach_panel_v1.0",
    },
    { label: "NanOnco Plus Panel v2.0", name: "nanonco_plus_panel_v2.0" },
    { label: "NanOnco Plus Panel v3.0", name: "nanonco_plus_panel_v3.0" },
    { label: "NanOnCT Panel v1.0", name: "nanonct_panel_v1.0" },
    {
        label: "NanoRV Panel v1.0-Tech Access",
        name: "nanorv_panel_v1.0-tech_access",
    },
    { label: "NEXome Core Panel", name: "nexome_core_panel" },
    { label: "NEXome Plus Panel v1.0", name: "nexome_plus_panel_v1.0" },
]);
</script>

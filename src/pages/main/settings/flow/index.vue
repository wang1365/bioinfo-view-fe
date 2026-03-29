<template>
    <q-page class="flow-management-page q-pa-md">
        <q-tabs
            v-model="tabValue"
            active-color="white"
            active-bg-color="primary"
            indicator-color="purple"
            class="flow-management-tabs bg-grey-2 text-black"
            align="justify"
            dense
        >
            <q-tab name="flow" :label="$t('AnalysisModule')" />
            <q-tab name="panel" :label="$t('PanelFlow')" />
            <q-tab name="group" :label="$t('PanelGroup')" />
        </q-tabs>
        <q-tab-panels v-model="tabValue" class="bg-transparent">
            <q-tab-panel name="flow" class="q-pa-none q-pt-sm">
                <FlowTable />
            </q-tab-panel>
            <q-tab-panel name="panel" class="q-pa-none q-pt-sm">
                <PanelTable />
            </q-tab-panel>
            <q-tab-panel name="group" class="q-pa-none q-pt-sm">
                <GroupTab />
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import FlowTable from 'pages/main/settings/flow/FlowTable'
import GroupTab from 'pages/main/settings/flow/GroupTab'
import PanelTable from 'pages/main/settings/flow/PanelTable'

const tabValue = ref('flow')
</script>

<style lang="scss" scoped>
.flow-management-tabs {
    border-radius: 8px;
    border: 1px solid #d7deea;
    overflow: hidden;
}
</style>

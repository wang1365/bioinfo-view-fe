<template>
    <q-page padding>
        <q-tabs
            v-model="tabValue"
            active-color="white"
            active-bg-color="primary"
            indicator-color="purple"
            class="bg-gray text-black shadow-2"
            align="justify"
        >
            <q-tab name="flow" :label="$t('AnalysisModule')" />
            <q-tab name="panel" :label="$t('PanelFlow')" />
            <q-tab name="group" :label="$t('PanelGroup')" />
        </q-tabs>
        <q-tab-panels v-model="tabValue">
            <q-tab-panel name="flow">
                <FlowTable />
            </q-tab-panel>
            <q-tab-panel name="panel">
                <PanelTable />
            </q-tab-panel>
            <q-tab-panel name="group">
                <GroupTab />
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import FlowTable from "pages/main/settings/flow/FlowTable"
import GroupTab from "pages/main/settings/flow/GroupTab"
import PanelTable from "pages/main/settings/flow/PanelTable"

const $q = useQuasar()

const tabValue = ref('flow')



onMounted(() => {
})
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}
</style>

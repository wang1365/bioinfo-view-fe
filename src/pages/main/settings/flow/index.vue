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
            <q-tab name="group" label="Panel分组" />
            <q-tab name="panel" label="Panel流程" />
            <q-tab name="flow" label="分析模块" />
        </q-tabs>
        <q-tab-panels v-model="tabValue">
            <q-tab-panel name="group">
                <GroupTab />
            </q-tab-panel>
            <q-tab-panel name="panel">
                <PanelTab />
            </q-tab-panel>
            <q-tab-panel name="flow">
                <FlowTab />
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import FlowTab from "pages/main/settings/flow/FlowTab"
import GroupTab from "pages/main/settings/flow/GroupTab"
import PanelTab from "pages/main/settings/flow/PanelTab"
const $q = useQuasar()

const tabValue = ref('group')



onMounted(() => {
})
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}
</style>

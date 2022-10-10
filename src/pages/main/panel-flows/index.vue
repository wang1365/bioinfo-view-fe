<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="Panel 分析流程" />
        <div v-if="groupEnabled">
            <q-tabs
                v-model="tab"
                class="bg-gray"
                active-bg-color="primary"
                active-color="white"
                indicator-color="purple"
                align="justify"
            >
                <q-tab v-for="item in rows" :key="item.id" :label="item.name" :name="item.name" />
            </q-tabs>
            <q-tab-panels v-model="tab">
                <q-tab-panel v-for="item in rows" :key="item.id" :label="item.name" :name="item.name">
                    <PanelTab :panelGroupId="item.id" />
                </q-tab-panel>
            </q-tab-panels>
        </div>
        <PanelTab v-else />
    </q-page>
</template>

<script setup>
import {ref, onMounted} from "vue"
import {getPanelGroups} from "src/api/panelGroup"
import {listConfig} from "src/api/config"
import PanelTab from "pages/main/panel-flows/PanelTab"

const rows = ref([])
const tab = ref('')
const groupEnabled = ref(false)
const refreshRows = () => {
    getPanelGroups().then(res => {
        rows.value = res
        if (res.length > 0) {
            tab.value = res[0].name
        }
    })
}

onMounted(() => {
    listConfig({name: 'panel_group_enabled'}).then(res => {
        if (res.results.length > 0) {
            groupEnabled.value = res.results[0].value === 1
        }

        if (groupEnabled.value) {
            refreshRows()
        }
    })
})
</script>

<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="Panel 分析流程" />
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
                <FlowsPage />
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getPanelGroups } from "src/api/panelGroup"
import FlowsPage from "pages/main/panel-flows/FlowsPage"
const rows = ref([])
const tab = ref('')
const refreshRows = () => {
    getPanelGroups().then(res => {
        rows.value = res
        if (res.length > 0) {
            tab.value = res[0].name
        }
    })
}

onMounted(() => {
    refreshRows()
})
</script>

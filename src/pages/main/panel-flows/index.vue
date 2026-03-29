<template>
    <q-page class="panel-page">
        <div v-if="groupEnabled" class="panel-page-inner">
            <q-tabs
                v-model="tab"
                class="panel-group-tabs bg-grey-2"
                active-bg-color="primary"
                active-color="white"
                indicator-color="purple"
                align="justify"
                dense
            >
                <q-tab v-for="item in rows" :key="item.id" :label="item.name" :name="item.name" />
            </q-tabs>
            <q-tab-panels v-model="tab" class="panel-group-content bg-transparent">
                <q-tab-panel
                    v-for="item in rows"
                    :key="item.id"
                    :label="item.name"
                    :name="item.name"
                    class="q-pa-none"
                >
                    <PanelTab :panelGroupId="item.id" />
                </q-tab-panel>
            </q-tab-panels>
        </div>
        <div v-else class="panel-page-inner">
            <PanelTab />
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPanelGroups } from 'src/api/panelGroup'
import { listConfig } from 'src/api/config'
import PanelTab from 'pages/main/panel-flows/PanelTab'

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
    listConfig({ name: 'panel_group_enabled' }).then(res => {
        if (res.results.length > 0) {
            groupEnabled.value = res.results[0].value === 1
        }

        if (groupEnabled.value) {
            refreshRows()
        }
    })
})
</script>

<style scoped lang="scss">
.panel-page {
    height: calc(100vh - 74px);
    overflow: hidden;
}

.panel-page-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.panel-group-tabs {
    flex: 0 0 auto;
    border: 1px solid #d5deea;
    border-radius: 8px;
    overflow: hidden;
}

.panel-group-content {
    flex: 1 1 auto;
    min-height: 0;
}
</style>

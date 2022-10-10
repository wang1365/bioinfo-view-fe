<template>
    <q-page padding style="overflow-x: hidden">
        <q-card>
            <q-splitter v-model="splitterModel">
                <template v-slot:before>
                    <q-tabs
                        v-model="tab"
                        indicator-color="primary"
                        active-bg-color="blue-2"
                        vertical
                        class="shadow-2 flex-end"
                        :breakpoint="0"
                    >
                        <q-tab v-for="tab in rows" :key="tab.name" :name="tab.name" :label="tab.name" />
                    </q-tabs>
                </template>
                <template v-slot:after>
                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel
                            v-for="item in rows"
                            :key="item.id"
                            :name="item.name"
                            vertical
                            transition-prev="jump-up"
                            transition-next="jump-up"
                        >
                            <PanelDetail :id="item.id" />
                        </q-tab-panel>
                    </q-tab-panels>
                </template>
            </q-splitter>
        </q-card>
    </q-page>
</template>

<script setup>
import {getPanels} from "src/api/panel"
import {ref, onMounted, defineProps, watch, toRefs} from "vue"
import PanelDetail from "pages/main/panel-flows/PanelDetail"

const rows = ref([])
const tab = ref([])
const splitterModel = ref(15)
const refreshRows = () => {
    let params = {}
    if (props.panelGroupId) {
        params = {
            panel_group_id: props.panelGroupId
        }
    }
    getPanels(params).then(res => {
        rows.value = res.results
        if (res.results.length > 0) {
            tab.value = res.results[0].name
        }
    })
}

const props = defineProps({
    panelGroupId: {
        required: false,
        type: Number
    }
})

const {panelGroupId} = toRefs(props)

onMounted(() => {
    refreshRows()
})

watch(panelGroupId, value => {
    refreshRows()
})
</script>

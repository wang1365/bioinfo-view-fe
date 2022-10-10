<template>
    <div class="q-pa-xs">
        <PageTitle :title="detail.name + '分析流程说明'" />
        <q-list>
            <q-expansion-item
                label="捕获Panel介绍"
                dense
                default-opened
                class="shadow-1 overflow-hidden"
                style="border-radius: 5px"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
            >
            </q-expansion-item>
        </q-list>
        <q-input readonly></q-input>
    </div>
</template>
<script setup>
import {ref, onMounted, defineProps, watch, toRefs} from "vue"
import { getPanelDetail } from "src/api/panel"
import PageTitle from "components/page-title/PageTitle"
const detail = ref({})
const refresh = () => {
    console.log('Query panel detail', props.id)
    if (props.id) {
        getPanelDetail(props.id).then(res => {
            detail.value = res
        })
    }
}

onMounted(() => [
    refresh()
])

const props = defineProps({
    id: {
        type: Number,
        required: true
    }
})

const {panelId} =  toRefs(props)
watch(panelId, (val) => {
    refresh()
})
</script>

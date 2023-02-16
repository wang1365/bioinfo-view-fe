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
                <q-input v-model="detail.desp" type="textarea" readonly> </q-input>
            </q-expansion-item>
            <q-expansion-item
                label="流程分析模块"
                dense
                default-opened
                class="shadow-1 overflow-hidden q-my-sm"
                style="border-radius: 5px"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
            >
                <q-btn
                    v-for="flow in detail.flows"
                    :key="flow.id"
                    :label="flow.name"
                    color="purple"
                    class="q-ma-sm"
                    @click="amISuper() ? showFlowDlg(flow) : () => {}"
                >
                    <q-badge
                        color="orange"
                        v-if="flow.sample_type === 'double'"
                        label="配对"
                        floating
                        transparent
                        align="bottom"
                    />
                </q-btn>
            </q-expansion-item>
            <q-expansion-item
                label="说明"
                dense
                default-opened
                class="shadow-1 overflow-hidden q-my-sm"
                style="border-radius: 5px"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
            >
                <q-card>
                    <q-card-section v-html="detail.detail" />
                </q-card>
            </q-expansion-item>
        </q-list>
        <q-input readonly></q-input>
        <flow-dialog ref="dlgFlow" action="info" :id="currentFlowId" />
    </div>
</template>
<script setup>
import {ref, onMounted, defineProps, watch, toRefs} from "vue"
import { getPanelDetail } from "src/api/panel"
import PageTitle from "components/page-title/PageTitle"
import FlowDialog from "pages/main/settings/flow/FlowDialog"
import { amISuper } from 'src/utils/user'
const detail = ref({})
const currentFlowId = ref(null)
const dlgFlow = ref(null)
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

const showFlowDlg = (row) => {
    currentFlowId.value = row.id
    dlgFlow.value.show()
}
</script>

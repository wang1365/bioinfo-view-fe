<template>
    <q-card style="width: 80vw; max-width: 80vw; max-height: 90vh" class="q-mt-md">
        <div style="display: flex; flex-direction: column; max-height: 80vh">
            <div style="height: 50px">
                <q-toolbar>
                    <q-toolbar-title>选择分析流程</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </div>
            <div
                style="
                    margin: 10px;
                    flex: 1 1 auto;
                    overflow-y: scroll;
                    overflow-x: hidden;
                "
                class="bio-data-table"
            >
                <table>
                    <thead
                        style="
                            background-color: white;
                            position: sticky;
                            top: 0;
                            z-index: 1;
                        "
                    >
                        <tr>
                            <td>选择</td>
                            <td>名称</td>
                            <td>code</td>
                            <td>类型</td>
                            <td>描述</td>
                            <td>创建时间</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="cursor-pointer"
                            v-for="(item, index) of flows"
                            :key="index"
                            @click="selectFlow(item)"
                        >
                            <td>
                                <q-radio v-model="selectedFlow.id" :val="item.id" />
                            </td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.code }}</td>
                            <td>{{ item.flow_category }}</td>
                            <td>{{ item.desp }}</td>
                            <td>{{ item.create_time }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style="">
                <q-toolbar>
                    <q-toolbar-title>当前选择的是: {{ selectedFlow.name }}</q-toolbar-title>
                    <q-btn class="q-mr-md" label="取消" v-close-popup />
                    <q-btn v-if="selectedFlow.id" color="primary" label="确认" @click="flowSelect()" />
                </q-toolbar>
            </div>
        </div>
    </q-card>
</template>
<script setup>
import { ref, onMounted, defineEmits } from "vue";
import { useApi } from "src/api/apiBase.js";
import { errorMessage } from "src/utils/notify.js";

const emit = defineEmits(["flowSelected"]);
const { apiGet } = useApi();
const selectedFlow = ref({});
const flowSelect = () => {
    if (!selectedFlow.value.id) {
        errorMessage("流程未选择");
        return;
    }
    emit("flowSelected", selectedFlow.value);
};
const flows = ref([]);
const selectFlow = (flow) => {
    selectedFlow.value = flow;
};
onMounted(() => {
    getFlows();
});
const getFlows = () => {
    apiGet("/flow/flows/", (res) => {
        for (const item of res.data.results) {
            item.checked = false;
            flows.value.push(item);
        }
    });
};
</script>

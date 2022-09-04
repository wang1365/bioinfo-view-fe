<template>
    <q-card
        style="width: 90vw; max-width: 90vw; max-height: 100vh"
        class="q-mt-md"
    >
        <div style="display: flex; flex-direction: column; max-height: 90vh">
            <div style="height: 50px">
                <q-toolbar>
                    <q-toolbar-title>选择样本</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </div>
            <div
                class="filters"
                style="height: 300px; border: solid 1px silver"
            ></div>
            <div
                style="
                    margin: 10px;
                    flex: 1 1 auto;
                    overflow-y: scroll;
                    overflow-x: hidden;
                "
            >
                <table>
                    <thead
                        style="
                            background-color: white;
                            position: sticky;
                            top: 0px;
                            z-index: 1;
                        "
                    >
                        <tr class="text-body1 text-weight-bold">
                            <td>选择</td>
                            <td>名称</td>
                            <td>code</td>
                            <td>分类</td>
                            <td>描述</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="cursor-pointer q-py-sm"
                            v-for="(item, index) of flows"
                            :key="index"
                            @click="selectFlow(item)"
                        >
                            <td>
                                <q-radio
                                    v-model="selectedFlow.id"
                                    :val="item.id"
                                />
                            </td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.code }}</td>
                            <td>{{ item.flow_category }}</td>
                            <td>{{ item.details }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div
                class="selected"
                style="
                    height: 400px;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    border: solid 1px silver;
                "
            >
                <div class="text-bold">
                    当前选择的是: {{ selectedFlow.name }}
                </div>
                <div>asdfasdf;asdfasdf;asdfasdf</div>
            </div>
            <div style="">
                <q-toolbar>
                    <q-toolbar-title></q-toolbar-title>
                    <q-btn class="q-mr-md" label="取消" v-close-popup />
                    <q-btn color="primary" label="确认" @click="flowSelect()" />
                </q-toolbar>
            </div>
        </div>
    </q-card>
</template>
<script setup>
import { useQuasar } from "quasar";
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
    let i = 0;
    while (i < 50) {
        flows.value.push({
            id: i,
            name: "test" + i,
            code: "test" + i,
            flow_category: "dddd",
            details: "dasdfasdf",
            checked: false,
        });
        i += 1;
    }
    // getFlows();
});
const getFlows = () => {
    apiGet("/flow/flows/", (res) => {
        for (const item of res.data.results) {
            item.checked = false;
            flows.value.append(item);
        }
    });
};
</script>
<style lang="scss">
table {
    width: 100%;
    border-collapse: collapse;
    td {
        padding: 5px;
        border-bottom: silver 1px solid;
    }

    tbody {
        tr {
            // &:nth-child(odd) {
            //     td {
            //         background-color: rgba(0, 0, 0, 0.05);
            //     }
            // }
            // &:nth-child(even) {
            //     td {
            //         background-color: rgba(0, 0, 0, 0.08);
            //     }
            // }
        }

        tr {
            border-bottom: solid silver 1px;
            &:hover {
                td {
                    background-color: rgba(0, 0, 0, 0.15);
                }
            }
        }
    }
}
</style>

<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6"> 公共样本 </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="选择样本"
                    icon="description"
                    @click="showSampleNew = true"
                />
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md">
                <table>
                    <thead>
                        <tr class="text-body1 text-weight-bold">
                            <td class="q-pa-md text-center">
                                <q-checkbox
                                    v-model="selected"
                                    color="negative"
                                />
                            </td>
                            <td class="text-center">样本名称</td>
                            <td>胚系突变分析</td>
                            <td>体细胞突变分析</td>
                            <td>融合分析</td>
                            <td>拷贝数变异分析</td>
                            <td>HRD</td>
                            <td>报告下载</td>
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="bg-grey-1 hover"
                            v-for="item in data"
                            v-bind:key="item.name"
                        >
                            <td class="q-pa-md text-center">
                                <q-checkbox
                                    v-model="item.selected"
                                    color="negative"
                                />
                            </td>
                            <td>
                                <div class="text-left">
                                    <span class="text-body1">
                                        {{ item.name }}
                                    </span>
                                </div>
                                <div class="row q-gutter-xs q-mt-sm">
                                    <q-btn
                                        size="sm"
                                        color="primary"
                                        label="LungCancer Panel v1.0"
                                    />
                                    <q-btn
                                        size="sm"
                                        color="accent"
                                        label="Tumor"
                                    />
                                    <q-btn
                                        size="sm"
                                        color="teal"
                                        label="FFPE"
                                    />
                                    <q-btn
                                        size="sm"
                                        color="warning"
                                        label="No UMI"
                                    />
                                </div>
                            </td>
                            <td class="text-center">已完成</td>
                            <td class="text-center">不可分析</td>
                            <td class="text-center">可分析</td>
                            <td class="text-center">不可分析</td>
                            <td class="text-center">可分析</td>
                            <td class="text-center q-gutter-x-sm">
                                <q-btn
                                    color="primary"
                                    label="下载"
                                    icon="cloud_download"
                                    size="sm"
                                />
                                <q-btn
                                    color="grey"
                                    label="下载"
                                    icon="cloud_download"
                                    size="sm"
                                />
                            </td>
                            <td class="q-gutter-x-sm">
                                <q-btn
                                    color="info"
                                    label="样本信息"
                                    icon="visibility"
                                    @click="showSampleInfo = true"
                                    size="sm"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <q-pagination
                        :model-value="current"
                        :max="10"
                        :max-pages="6"
                        boundary-numbers
                    />
                </div>
            </div>
        </q-section>
    </q-card>
    <q-dialog v-model="showSampleNew">
        <SampleNew />
    </q-dialog>
    <q-dialog v-model="showSampleInfo">
        <SampleInfo />
    </q-dialog>
    <q-dialog v-model="showSampleEdit">
        <SampleEdit />
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
// import SampleInfo from "./SampleInfo.vue";
// import SampleEdit from "./SampleEdit.vue";
// import SampleNew from "./SampleNew.vue";
import { ref } from "vue";
const showSampleEdit = ref(false);
const showSampleInfo = ref(false);
const showSampleNew = ref(false);

const current = ref(5);
const selected = ref([]);

const $q = useQuasar();

const confirm = () => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    })
        .onOk(() => {
            // console.log('>>>> OK')
        })
        .onOk(() => {
            // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
            // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
            // console.log('I am triggered on both OK and Cancel')
        });
};
const data = ref([
    {
        name: "Jelly bean",
        info: 375,
        fat: 0.0,
        carbs: 94,
        protein: 0.0,
        sodium: 50,
        calcium: "0%",
        iron: "0%",
    },
    {
        name: "Lollipop",
        info: 392,
        fat: 0.2,
        carbs: 98,
        protein: 0,
        sodium: 38,
        calcium: "0%",
        iron: "2%",
    },
    {
        name: "Honeycomb",
        info: 408,
        fat: 3.2,
        carbs: 87,
        protein: 6.5,
        sodium: 562,
        calcium: "0%",
        iron: "45%",
    },
    {
        name: "Donut",
        info: 452,
        fat: 25.0,
        carbs: 51,
        protein: 4.9,
        sodium: 326,
        calcium: "2%",
        iron: "22%",
    },
    {
        name: "KitKat",
        info: 518,
        fat: 26.0,
        carbs: 65,
        protein: 7,
        sodium: 54,
        calcium: "12%",
        iron: "6%",
    },
]);
const getSelectedString = () => {
    return selected.value.length === 0
        ? ""
        : `${selected.value.length} record${
              selected.value.length > 1 ? "s" : ""
          } selected of ${data.value.length}`;
};
</script>

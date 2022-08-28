<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6"> 数据 </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="新建数据"
                    icon="description"
                    @click="showDataNew = true"
                />
                <q-btn color="positive" label="批量上传" icon="file_upload" />
                <q-btn color="positive" label="模板下载" icon="file_download">
                    <q-tooltip>批量上传使用的模板文件 </q-tooltip>
                </q-btn>
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
                            <td class="text-center">UID</td>
                            <td>创建时间</td>
                            <td>创建者</td>
                            <td>大小</td>
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

                            <td class="text-center">XXXX-XXXX-XXXXX-XXXXXX</td>
                            <td class="text-center">2022-08-22</td>
                            <td class="text-center">张三</td>
                            <td class="text-center q-gutter-x-sm">100G</td>
                            <td class="q-gutter-x-sm">
                                <q-btn
                                    color="primary"
                                    label="编辑"
                                    icon="edit"
                                    @click="showDataEdit = true"
                                    size="sm"
                                />
                                <q-btn
                                    color="red"
                                    label="删除"
                                    icon="delete"
                                    @click="showDataInfo = true"
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
    <q-dialog v-model="showDataNew">
        <DataNew />
    </q-dialog>
    <q-dialog v-model="showDataInfo">
        <DataInfo />
    </q-dialog>
    <q-dialog v-model="showDataEdit">
        <DataEdit />
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import DataInfo from "./DataInfo.vue";
import DataEdit from "./DataEdit.vue";
import DataNew from "./DataNew.vue";
import { ref } from "vue";
const showDataEdit = ref(false);
const showDataInfo = ref(false);
const showDataNew = ref(false);

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

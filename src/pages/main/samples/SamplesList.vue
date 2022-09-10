<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6"> 样本 </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="新建样本"
                    icon="description"
                    @click="showSampleNew = true"
                />
                <q-btn
                    color="info"
                    label="导出数据"
                    icon="file_download"
                    @click="exportData()"
                />
                <q-btn color="positive">
                    <label for="file">
                        <q-icon name="file_upload"></q-icon>
                        批量上传
                        <span
                            style="
                                width: 0;
                                height: 0;
                                overflow: hidden;
                                display: inline-block;
                            "
                        >
                            <input
                                id="file"
                                type="file"
                                style="rgba(0,0,0,0)"
                                @change="fileSelected($event)"
                            />
                        </span>
                    </label>
                </q-btn>
                <q-btn
                    color="positive"
                    label="模板下载"
                    icon="file_download"
                    @click="downloadTemplate()"
                >
                    <q-tooltip>批量上传使用的模板文件 </q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <!-- <td >
                                <q-checkbox
                                    v-model="selected"
                                    color="negative"
                                />
                            </td> -->
                            <td>ID</td>
                            <td>采样日期</td>
                            <td>送测日期</td>
                            <td>采样部位</td>
                            <td>样本类型</td>
                            <td>肿瘤含量</td>
                            <td>肿瘤样本</td>
                            <!-- <td>患者ID</td> -->
                            <td>患者识别号</td>
                            <td>样本识别号</td>
                            <!-- <td>样本所有者</td> -->
                            <!-- <td>创建时间</td>
                            <td>更新时间</td> -->
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="hover"
                            v-for="item in dataItems"
                            v-bind:key="item.name"
                        >
                            <!-- <td class="q-pa-md text-center">
                                <q-checkbox
                                    v-model="item.selected"
                                    color="negative"
                                />
                            </td> -->
                            <td>
                                {{ item.id }}
                            </td>
                            <td>
                                {{ item.sample_date }}
                            </td>
                            <td>
                                {{ item.test_date }}
                            </td>
                            <td>{{ item.sample_componet }}</td>
                            <td>
                                {{ item.sample_type }}
                            </td>
                            <td>
                                {{ item.panel_proportion }}
                            </td>
                            <td>{{ item.is_panel }}</td>
                            <!-- <td>{{ item.patient_id }}</td> -->
                            <td>{{ item.patient_identifier }}</td>
                            <td>{{ item.identifier }}</td>
                            <!-- <td>{{ item.user_id }}</td> -->
                            <!-- <td>{{ item.create_time }}</td>
                            <td>{{ item.modify_time }}</td> -->
                            <td class="q-gutter-x-sm">
                                <q-btn
                                    color="secondary"
                                    label="详情"
                                    icon="visibility"
                                    @click="info(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="primary"
                                    label="编辑"
                                    icon="edit"
                                    @click="edit(item)"
                                    size="sm"
                                />

                                <q-btn
                                    color="red"
                                    label="删除"
                                    icon="delete"
                                    @click="confirm(item)"
                                    size="sm"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <PaginatorVue
                        :total="total"
                        :currentPage="currentPage"
                        @pageChange="pageChange($event)"
                    />
                </div>
            </div>
        </q-section>
    </q-card>
    <q-dialog persistent v-model="showSampleNew">
        <SampleNew
            @refresh="
                refreshPage();
                showSampleNew = false;
            "
        />
    </q-dialog>
    <q-dialog v-model="showSampleInfo">
        <SampleInfo :id="infoId" />
    </q-dialog>
    <q-dialog persistent v-model="showSampleEdit">
        <SampleEdit
            :id="editId"
            @refresh="
                refreshPage();
                showSampleEdit = false;
            "
        />
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import SampleInfo from "./SampleInfo.vue";
import SampleEdit from "./SampleEdit.vue";
import SampleNew from "./SampleNew.vue";
import { ref, onMounted } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import { api } from "src/boot/axios";
const { apiGet, apiDelete, downloadData } = useApi();
const showSampleEdit = ref(false);
const showSampleInfo = ref(false);
const showSampleNew = ref(false);
const infoId = ref(0);
const editId = ref(0);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const $q = useQuasar();

const edit = async (item) => {
    editId.value = item.id;
    showSampleEdit.value = true;
};
const info = async (item) => {
    infoId.value = item.id;
    showSampleInfo.value = true;
};
onMounted(() => {
    loadPage();
});
const pageChange = async (event) => {
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};

const refreshPage = async () => {
    currentPage.value = 1;
    loadPage();
};
const loadPage = async () => {
    if (currentPage.value) {
        apiGet(
            `/sample/sampledatas/?page=${currentPage.value}&size=${pageSize.value}`,
            (res) => {
                total.value = res.data.count;
                dataItems.value = [];
                for (const iterator of res.data.results) {
                    dataItems.value.push(iterator);
                }
            }
        );
    }
};

const confirm = (item) => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/sample/sampledatas/${item.id}/`, (_) => {
            infoMessage("删除成功");
            refreshPage();
        });
    });
};

const exportData = () => {
    downloadData("/sample/samplemeta/export", null);
};
const downloadTemplate = () => {
    downloadData("/sample/samplemeta/template/download", null);
};
const fileSelected = (event) => {
    let data = new FormData();
    data.append(file, event.target.files[0]);
    api.post("/sample/samplemeta/upload", data)
        .then((resp) => {
            $q.notify({
                message: "上传完成",
                timeout: 300,
                position: "center",
            });
            refreshPage();
        })
        .catch((e) => {
            console.log(e.response.data);
        });
};
</script>

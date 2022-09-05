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
                            <!-- <td class="q-pa-md text-center">
                                <q-checkbox
                                    v-model="selected"
                                    color="negative"
                                />
                            </td> -->
                            <td>项目编码</td>
                            <td>文库编号</td>
                            <!-- <td>捕获试剂盒</td>
                            <td>核酸打断方式</td>
                            <td>建库input</td>
                            <td>index 类型</td>
                            <td>index 编号</td>
                            <td>杂交 input</td>
                            <td>风险上机</td>
                            <td>核酸降解等级</td> -->
                            <td>样本元信息 ID</td>
                            <td>样本识别号</td>
                            <td>数据识别号</td>
                            <td>送检机构</td>
                            <td>核酸类型</td>
                            <td>R1 数据名称</td>
                            <td>R2 数据名称</td>
                            <!-- <td>样本所有者</td>
                            <td>创建时间</td>
                            <td>更新时间</td> -->
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="bg-grey-1 hover"
                            v-for="item in dataItems"
                            v-bind:key="item.name"
                        >
                            <!-- <td class="q-pa-md text-center">
                                <q-checkbox
                                    v-model="item.selected"
                                    color="negative"
                                />
                            </td> -->

                            <td class="text-center">
                                {{ item.project_index }}
                            </td>
                            <td class="text-center">
                                {{ item.library_number }}
                            </td>
                            <!-- <td class="text-center">{{ item.reagent_box }}</td>
                            <td class="text-center">
                                {{ item.nucleicx_type }}
                            </td>
                            <td class="text-center">
                                {{ item.library_input }}
                            </td>
                            <td class="text-center">{{ item.index_type }}</td>
                            <td class="text-center">{{ item.index_number }}</td>
                            <td class="text-center">{{ item.hybrid_input }}</td>
                            <td class="text-center">{{ item.risk }}</td>
                            <td class="text-center">
                                {{ item.nucleic_level }}
                            </td> -->
                            <td class="text-center">
                                {{ item.sample_meta_id }}
                            </td>
                            <td class="text-center">
                                {{ item.sample_identifier }}
                            </td>
                            <td class="text-center">{{ item.identifier }}</td>
                            <td class="text-center">{{ item.company }}</td>
                            <td class="text-center">{{ item.nucleic_type }}</td>
                            <td class="text-center">{{ item.fastq1_path }}</td>
                            <td class="text-center">{{ item.fastq2_path }}</td>
                            <!-- <td class="text-center">{{ item.user_id }}</td>
                            <td class="text-center">{{ item.create_time }}</td>
                            <td class="text-center">{{ item.modify_time }}</td> -->
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
    <q-dialog persistent v-model="showDataNew">
        <DataNew
            @refresh="
                refreshPage();
                showDataNew = false;
            "
        />
    </q-dialog>
    <q-dialog persistent v-model="showDataInfo">
        <DataInfo :id="infoId" />
    </q-dialog>
    <q-dialog persistent v-model="showDataEdit">
        <DataEdit
            :id="editId"
            @refresh="
                refreshPage();
                showDataEdit = false;
            "
        />
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import DataInfo from "./DataInfo.vue";
import DataEdit from "./DataEdit.vue";
import DataNew from "./DataNew.vue";
import { ref, onMounted } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";

const { apiGet, apiPut, apiPost, apiDelete } = useApi();
const showDataEdit = ref(false);
const showDataInfo = ref(false);
const showDataNew = ref(false);
const infoId = ref(0);
const editId = ref(0);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const $q = useQuasar();

const edit = async (item) => {
    editId.value = item.id;
    showDataEdit.value = true;
};
const info = async (item) => {
    infoId.value = item.id;
    showDataInfo.value = true;
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
            `/sample/samples/?page=${currentPage.value}&size=${pageSize.value}`,
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
        apiDelete(`/sample/samples/${item.id}`, (_) => {
            infoMessage("删除成功");
            refreshPage();
        });
    });
};
</script>

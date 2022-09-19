<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="groups_2" />
                <q-toolbar-title class="text-h6"> 患者数据 </q-toolbar-title>
                <q-input dense v-model="text" label="输入文本: 回车查询">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-btn color="primary" label="新建患者" icon="groups_2" @click="showPatientNew = true" />
                <q-btn color="info" label="导出数据" icon="file_download" @click="exportData()" />
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
                            <input id="file" type="file" style="rgba(0,0,0,0)" @change="fileSelected($event)" />
                        </span>
                    </label>
                </q-btn>
                <q-btn color="positive" label="模板下载" icon="file_download" @click="downlaodTemplate()">
                    <q-tooltip>批量上传使用的模板文件 </q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>姓名</td>
                            <td>送检机构</td>
                            <td>诊疗医生</td>
                            <td>性别</td>
                            <td>年龄</td>
                            <td>临床诊断</td>
                            <td>肿瘤分期</td>
                            <td>遗传病</td>
                            <td>家族史</td>
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(patient, index) in patients" :key="index">
                            <td>{{ patient.id }}</td>
                            <td>{{ patient.name }}</td>
                            <td>{{ patient.inspection_agency }}</td>
                            <td>{{ patient.medical_doctor }}</td>
                            <td>{{ patient.gender=="male"?'男':'女' }}</td>
                            <td>{{ patient.age }}</td>
                            <td>{{ patient.diagnosis }}</td>
                            <td>{{ patient.tumor_stage }}</td>
                            <td>{{ patient.disease }}</td>
                            <td>{{ patient.family_history }}</td>
                            <td class="q-gutter-x-sm">
                                <q-btn color="primary" label="编辑" icon="edit" size="sm" @click="edit(patient)" />
                                <q-btn color="secondary" label="关联样本" icon="link" size="sm" />
                                <q-btn
                                    color="info"
                                    label="患者信息"
                                    icon="visibility"
                                    @click="info(patient)"
                                    size="sm"
                                />
                                <q-btn color="red" label="删除" icon="delete" size="sm" @click="confirm(patient)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <PaginatorVue :total="total" :currentPage="currentPage" @pageChange="pageChange($event)" />
                </div>
            </div>
        </q-section>
        <q-section class="q-pd-md"> </q-section>
    </q-card>
    <q-dialog v-model="showPatientNew" persistent>
        <PatientNew
            @refresh="
                refreshPage();
                showPatientNew = false;
            "
        />
    </q-dialog>
    <q-dialog v-model="showPatientInfo">
        <PatientInfo
            :id="infoId"
            @refresh="
                refreshPage();
                showPatientInfo = false;
            "
        />
    </q-dialog>
    <q-dialog v-model="showPatientEdit" persistent>
        <PatientEdit
            :id="editId"
            @refresh="
                refreshPage();
                showPatientEdit = false;
            "
        />
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import PatientInfo from "./PatientInfo.vue";
import PatientEdit from "./PatientEdit.vue";
import PatientNew from "./PatientNew.vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import { onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import { globalStore } from "src/stores/global";
import { useApi } from "src/api/apiBase";

const { apiGet, downloadData, apiDelete } = useApi();
const showPatientInfo = ref(false);
const showPatientEdit = ref(false);
const showPatientNew = ref(false);
const uploadData = ref(false);
const current = ref(5);
const infoId = ref(0);
const editId = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const maxPages = ref(0);

const $q = useQuasar();
const store = globalStore();
const patients = ref([]);
onMounted(() => {
    loadPage();
});

const pageChange = async (event) => {
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};
const confirm = async (patient) => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/patient/patients/${patient.id}`, (_) => {
            refreshPage();
        });
    });
};
const edit = async (patient) => {
    editId.value = patient.id;
    showPatientEdit.value = true;
};
const info = async (patient) => {
    infoId.value = patient.id;
    showPatientInfo.value = true;
};
const refreshPage = async () => {
    console.log("refresh page");
    currentPage.value = 1;
    loadPage();
};
const loadPage = async () => {
    apiGet(
        `/patient/patients?page=${currentPage.value}&size=${pageSize.value}`,
        (res) => {
            total.value = res.data.count;
            patients.value = [];
            if (total.value % pageSize.value == 0) {
                maxPages.value = total.value / pageSize.value;
            } else {
                maxPages.value = total.value / pageSize.value + 1;
            }
            for (const iterator of res.data.results) {
                patients.value.push(iterator);
            }
        }
    );
};

const downlaodTemplate = () => {
    downloadData("/patient/patients/dl_patient_template", null);
};
const fileSelected = (event) => {
    let data = new FormData();
    data.append(file, event.target.files[0]);
    api.post("/patient/patients/import_patients", data)
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
const exportData = () => {
    downloadData("/patient/patients/dl_patient_template", null);
};
</script>

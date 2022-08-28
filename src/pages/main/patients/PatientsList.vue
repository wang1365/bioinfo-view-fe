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
                <q-btn
                    color="primary"
                    label="新建患者"
                    icon="groups_2"
                    @click="showPatientNew = true"
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
                    @click="downlaodTemplate()"
                >
                    <q-tooltip>批量上传使用的模板文件 </q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md">
                <table>
                    <thead>
                        <tr class="text-body1 text-weight-bold">
                            <td>患者识别号</td>
                            <td>送检机构</td>
                            <td>年龄</td>
                            <td>诊疗医生</td>
                            <td>性别</td>
                            <td class="text-right">操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(patient, index) in patients" :key="index">
                            <td>{{ patient.name }}</td>
                            <td>{{ patient.inspection_agency }}</td>
                            <td>{{ patient.age }}</td>
                            <td>{{ patient.medical_doctor }}</td>
                            <td>{{ patient.gender }}</td>
                            <td class="q-gutter-x-sm text-right">
                                <q-btn
                                    color="primary"
                                    label="编辑"
                                    icon="edit"
                                    size="sm"
                                    @click="edit(patient)"
                                />
                                <q-btn
                                    color="secondary"
                                    label="关联样本"
                                    icon="link"
                                    size="sm"
                                />
                                <q-btn
                                    color="info"
                                    label="患者信息"
                                    icon="visibility"
                                    @click="info(patient)"
                                    size="sm"
                                />
                                <q-btn
                                    color="red"
                                    label="删除"
                                    icon="delete"
                                    size="sm"
                                    @click="confirm(patient)"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <q-pagination
                        :model-value="currentPage"
                        @update:model-value="pageChange($event)"
                        :max="maxPages"
                        boundary-numbers
                    />
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
    <q-dialog v-model="showPatientInfo" persistent>
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
import { onMounted, ref } from "vue";
import { api, getTokenCookie } from "src/boot/axios";
import { globalStore } from "src/stores/global";

const showPatientInfo = ref(false);
const showPatientEdit = ref(false);
const showPatientNew = ref(false);
const uploadData = ref(false);
const current = ref(5);
const infoId = ref(0);
const editId = ref(0);
const currentPage = ref(1);
const pageSize = ref(4);
const total = ref(0);
const maxPages = ref(0);

const $q = useQuasar();
const store = globalStore();
const patients = ref([]);
onMounted(() => {
    loadPage();
});

const pageChange = async (event) => {
    currentPage.value = event;
    loadPage();
};
const confirm = async (patient) => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        api.delete(`/patient/patients/${patient.id}`).then((resp) => {
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
    api.get(
        `/patient/patients?page=${currentPage.value}&size=${pageSize.value}`
    ).then((resp) => {
        total.value = resp.data.data.count;
        patients.value = [];
        if (total.value % pageSize.value == 0) {
            maxPages.value = total.value / pageSize.value;
        } else {
            maxPages.value = total.value / pageSize.value + 1;
        }
        for (const iterator of resp.data.data.results) {
            patients.value.push(iterator);
        }
    });
};

const downlaodTemplate = () => {
    var link = document.createElement("a");
    link.href = api.defaults.baseURL + "/patient/patients/dl_patient_template";
    link.download = "患者批量上传模板.csv";
    link.click();
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
</script>

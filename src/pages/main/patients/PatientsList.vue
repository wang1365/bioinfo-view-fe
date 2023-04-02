<template>
    <q-card class="q-mt-md">
        <q-section>
            <div class=" q-gutter-md row items-start q-pa-md bio-data-table">
                <q-input
                    style="width:350px"
                    v-model="searchParams.search"
                    dense
                    label="关键词: 姓名, 患者识别号,临床诊断,医生, 性别"
                    clearable
                >
                </q-input>
                <q-input type="number" v-model="searchParams.age_start" dense label="年龄起始" clearable> </q-input>
                <q-input type="number" v-model="searchParams.age_end" dense label="截止年龄" clearable> </q-input>
                <q-input clearable dense label="起始录入时间(YYYY-MM-DD)" v-model="searchParams.ctime_start">
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.ctime_start" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input clearable dense label="截止录入时间(YYYY-MM-DD)" v-model="searchParams.ctime_end">
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.ctime_end" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>

                <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                <q-btn color="primary" :label="$t('Reset')" icon="clear" @click="reset()" />
            </div>
        </q-section>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="groups_2" />
                <q-toolbar-title class="text-h6"> 患者数据 </q-toolbar-title>
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
                            <td>样本数</td>
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(patient, index) in dataItems" :key="index">
                            <td>{{ patient.id }}</td>
                            <td>{{ patient.name }}</td>
                            <td>{{ patient.inspection_agency }}</td>
                            <td>{{ patient.medical_doctor }}</td>
                            <td>{{ patient.gender }}</td>
                            <td>{{ patient.age }}</td>
                            <td>{{ patient.diagnosis }}</td>
                            <td>{{ patient.tumor_stage }}</td>
                            <td>{{ patient.disease }}</td>
                            <td>{{ patient.family_history }}</td>
                            <td>{{ patient.samplemeta_set.length }}</td>
                            <td class="q-gutter-xs">
                                <q-btn color="primary" :label="$t('Edit')" icon="edit" size="sm" @click="edit(patient)" />
                                <q-btn
                                    color="secondary"
                                    label="关联样本"
                                    icon="link"
                                    size="sm"
                                    @click="link(patient)"
                                />
                                <q-btn
                                    color="info"
                                    label="患者信息"
                                    icon="visibility"
                                    @click="info(patient)"
                                    size="sm"
                                />
                                <q-btn color="red" :label="$t('Delete')" icon="delete" size="sm" @click="confirm(patient)" />
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
    <q-dialog persistent v-model="showLinkSample">
        <SampleList
            :linkId="linkId"
            :patient="linkSamplePatient"
            @refresh="
            linkSample($event);
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
import SampleList from "./SampleList.vue";
import { useRouter } from "vue-router";
import { buildModelQuery } from "src/api/modelQueryBuilder";
import { infoMessage ,warnMessage} from "src/utils/notify";

const router = useRouter()
const searchParams = ref({
    search: '',
    name: '',
    identifier: '',
    diagnosis: '',
    medical_doctor: '',
    gender: '',
    age_start: '',
    age_end: '',
    ctime_start: '',
    ctime_end: ''

})

const { apiGet, downloadData, apiDelete, apiPatch, apiPost } = useApi();
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
const dataItems = ref([]);

const linkId = ref(0);
const showLinkSample = ref(false);
const linkSamplePatient = ref({})
const link = async (item) => {
    linkId.value = item.id;
    showLinkSample.value = true;
    linkSamplePatient.value = item

}
const linkSample = (event) => {
    showLinkSample.value = false;
    let samples = []
    for (const item of event) {
        samples.push(item.id)
    }
    if (samples.length > 0) {

        for (const sampleid of samples) {
            apiPatch(`/sample/sampledatas/${sampleid}/`, (res) => {

            }, { patient_id: linkSamplePatient.value.id, patient_identifier: linkSamplePatient.value.identifier })
        }
        for (const iterator of linkSamplePatient.value.samplemeta_set) {
            if (samples.indexOf(iterator.id) < 0) {
                apiPatch(`/sample/sampledatas/${iterator.id}/`, (res) => {

                }, { patient_id: null, patient_identifier: null })
            }
        }
        showLinkSample.value = false;
        refreshPage()
        // apiPatch(`/patient/patients/${linkId.value}`, (res) => {
        //     showLinkSample.value = false;
        //     refreshPage()
        // }, { samplemeta_set: samples })
    }
}

onMounted(() => {
    loadBackup()
    loadPage();
});

const pageChange = async (event) => {
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};
const confirm = async (item) => {
    $q.dialog({
        title: `确认删除吗,当前患者关联了 ${item.samplemeta_set.length} 样本?`,
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/patient/patients/${item.id}`, (_) => {
            infoMessage("删除成功")
            if (dataItems.value.length > 1) {
                let index = 0
                for (let i = 0; i < dataItems.value.length; i++) {
                    if (dataItems.value[i].id === item.id) {
                        index = i
                    }
                }
                total.value-=1
                dataItems.value.splice(index, 1)
            } else {
                if (currentPage.value > 1) {
                    currentPage.value = currentPage.value - 1
                }else{
                    currentPage.value = 1
                }
                refreshPage()
            }
        });
    });
};
const edit = async (patient) => {
    editId.value = patient.id;
    showPatientEdit.value = true;
};
const info = async (patient) => {
    router.push(`/main/patients/${patient.id}`)
    // infoId.value = patient.id;
    // showPatientInfo.value = true;
};
const reset = () => {
    searchParams.value = {
        search: '',
        name: '',
        identifier: '',
        diagnosis: '',
        medical_doctor: '',
        gender: '',
        age_start: '',
        age_end: '',
        ctime_start: '',
        ctime_end: ''

    }
    refreshPage()
}
const refreshPage = async () => {
    console.log("refresh page");
    currentPage.value = 1;
    loadPage();
};
const backupSearch = ()=>{
    let data ={
        page:currentPage.value,
        size:pageSize.value,
        searchParams:searchParams.value
    }
    sessionStorage.setItem('patient-search',JSON.stringify(data))
}
const loadBackup = ()=>{
    let dataStr = sessionStorage.getItem('patient-search')
    if(dataStr){
        let data = JSON.parse(dataStr)
        // currentPage.value=data.page
        pageSize.value=data.size
        searchParams.value=data.searchParams
    }
}
const loadPage = async () => {
    let andFields = {}
    let searchFields = buildModelQuery()
    if (searchParams.value.search) {
        searchFields = buildModelQuery([], {
            name__icontains: searchParams.value.search,
            identifier__icontains: searchParams.value.search,
            diagnosis__icontains: searchParams.value.search,
            medical_doctor__icontains: searchParams.value.search,
            gender__icontains: searchParams.value.search,
        }, 'OR')
    }
    if (searchParams.value.age_start) {
        andFields.age__gte = searchParams.value.age_start
    }
    if (searchParams.value.age_end) {
        andFields.age__lte = searchParams.value.age_end
    }
    if (searchParams.value.ctime_start) {
        andFields.create_time__gte = searchParams.value.ctime_start
    }
    if (searchParams.value.ctime_end) {
        andFields.create_time__lte = searchParams.value.ctime_end
    }

    let query = buildModelQuery([searchFields], andFields)
    let params = `?page=${currentPage.value}&size=${pageSize.value}`
    backupSearch()
    apiPost(`/model_query/patient${params}`, (res) => {
        total.value = res.data.count;
        dataItems.value = [];
        for (const iterator of res.data.results) {
            dataItems.value.push(iterator);
        }
    }, query)

    // let params = `?page=${currentPage.value}&size=${pageSize.value}`
    // let identifiers = 'name,identifier,diagnosis,medical_doctor,gender'
    // if (searchParams.value.search) {
    //     params += `&search=${searchParams.value.search}&identifiers=${identifiers}`
    // }
    // if (searchParams.value.age_start) {
    //     params += `&age__gte=${searchParams.value.age_start}`
    // }
    // if (searchParams.value.age_end) {
    //     params += `&age__lte=${searchParams.value.age_end}`
    // }
    // if (searchParams.value.ctime_start) {
    //     params += `&create_time__gte=${searchParams.value.ctime_start}`
    // }
    // if (searchParams.value.ctime_end) {
    //     params += `&create_time__lte=${searchParams.value.ctime_end}`
    // }
    // apiGet(
    //     `/patient/patients${params}`,
    //     (res) => {
    //         total.value = res.data.count;
    //         patients.value = [];
    //         if (total.value % pageSize.value == 0) {
    //             maxPages.value = total.value / pageSize.value;
    //         } else {
    //             maxPages.value = total.value / pageSize.value + 1;
    //         }
    //         for (const iterator of res.data.results) {
    //             patients.value.push(iterator);
    //         }
    //     }
    // );
};

const downlaodTemplate = () => {
    downloadData("/patient/patients/template", null);
};
const fileSelected = (event) => {
    let data = new FormData();
    data.append('file', event.target.files[0]);
    api.post("/patient/patients/upload", data)
        .then((resp) => {
            $q.notify({
                message: "上传完成",
                timeout: 300,
                position: "center",
            });
            if(resp.length>0){
                for(let item of resp){
                    warnMessage(`"${item.name}" 这条记录可能已存在,不会被重复导入`)
                }
            }
            refreshPage();
        })
        .catch((e) => {
            console.log(e.response.data);
        });
};
const exportData = () => {
    downloadData("/patient/patients/export", null);
};
</script>

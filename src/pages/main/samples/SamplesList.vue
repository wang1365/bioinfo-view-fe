<template>
    <q-card class="q-mt-md">
        <q-section>
            <div class=" q-gutter-md row items-start q-pa-md bio-data-table">
                <q-input
                    style="width:350px"
                    v-model="searchParams.search"
                    dense
                    label="关键词: 采样部位, 样本类型, 患者识别号, 样本识别号"
                    clearable
                >
                </q-input>

                <q-input clearable dense label="起始送检日期(YYYY-MM-DD)" v-model="searchParams.test_date_start">
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.test_date_start" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input clearable dense label="截止送检日期(YYYY-MM-DD)" v-model="searchParams.test_date_end">
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.test_date_end" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input clearable dense label="起始采样日期(YYYY-MM-DD)" v-model="searchParams.sample_date_start">
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.sample_date_start" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input clearable dense label="截止采样日期(YYYY-MM-DD)" v-model="searchParams.sample_date_end">
                    <template v-slot:append>
                        <q-icon color="primary" name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="searchParams.sample_date_end" mask="YYYY-MM-DD">
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-select
                    style="width:100px"
                    clearable
                    dense
                    v-model="searchParams.is_panel"
                    :options="['是', '否']"
                    label="肿瘤样本"
                />
                <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                <q-btn color="primary" :label="$t('Reset')" icon="clear" @click="reset()" />
            </div>
        </q-section>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6"> 样本 </q-toolbar-title>
                <q-btn color="primary" label="新建样本" icon="description" @click="showSampleNew = true" />
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
                <q-btn color="positive" label="模板下载" icon="file_download" @click="downloadTemplate()">
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
                            <td>{{$t('Action')}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="hover" v-for="item in dataItems" v-bind:key="item.name">
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
                            <td>{{ item.patient?.identifier }}</td>
                            <td>{{ item.identifier }}</td>
                            <!-- <td>{{ item.user_id }}</td> -->
                            <!-- <td>{{ item.create_time }}</td>
                                <td>{{ item.modify_time }}</td> -->
                            <td class="q-gutter-xs">
                                <q-btn color="info" :label="$t('Detail')" icon="visibility" @click="info(item)" size="sm" />
                                <q-btn color="primary" :label="$t('Edit')" icon="edit" @click="edit(item)" size="sm" />
                                <q-btn color="secondary" label="关联患者" icon="link" @click="link(item)" size="sm" />

                                <q-btn color="red" :label="$t('Delete')" icon="delete" @click="confirm(item)" size="sm" />
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
    <q-dialog persistent v-model="showLinkPatient">
        <PatientList
            :linkId="linkId"
            @refresh="
            linkPatient($event);

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
import PatientList from "./PatientList.vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import { api } from "src/boot/axios";
import { buildModelQuery } from "src/api/modelQueryBuilder"
const { apiGet, apiDelete, downloadData, apiPatch, apiPost } = useApi();
const showSampleEdit = ref(false);
const showSampleInfo = ref(false);
const showSampleNew = ref(false);
const showLinkPatient = ref(false);
const infoId = ref(0);
const editId = ref(0);
const linkId = ref(0);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const searchParams = ref({
    search: '',
    is_panel: '',

    sample_date_start: '',
    sample_date_end: '',
    test_date_start: '',
    test_date_end: ''

})

const $q = useQuasar();

const edit = async (item) => {
    editId.value = item.id;
    showSampleEdit.value = true;
};
const info = async (item) => {
    infoId.value = item.id;
    showSampleInfo.value = true;
};
const link = async (item) => {
    linkId.value = item.id;
    showLinkPatient.value = true;
}
onMounted(() => {
    loadPage();
});
const pageChange = async (event) => {
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};
const linkPatient = (event) => {
    apiPatch(`/sample/sampledatas/${linkId.value}/`, (res) => {
        showLinkPatient.value = false;
        refreshPage()
    }, { patient_id: event.id, patient_identifier: event.identifier })
}
const reset = () => {
    searchParams.value = {
        search: '',
        is_panel: '',

        sample_date_start: '',
        sample_date_end: '',
        test_date_start: '',
        test_date_end: ''

    }
    refreshPage()
}
const refreshPage = async () => {
    currentPage.value = 1;
    loadPage();
};
const loadPage = async () => {
    let andFields = {}
    let searchFields = buildModelQuery()
    if (searchParams.value.search) {
        searchFields = buildModelQuery([], {
            patient_identifier__icontains: searchParams.value.search,
            identifier__icontains: searchParams.value.search,
            sample_componet__icontains: searchParams.value.search,
            sample_type__icontains: searchParams.value.search,
        }, 'OR')
    }
    if (searchParams.value.age_start) {
        andFields.sample_date__gte = searchParams.value.sample_date_start
    }
    if (searchParams.value.sample_date_end) {
        andFields.sample_date__lte = searchParams.value.sample_date_end
    }
    if (searchParams.value.test_date_start) {
        andFields.test_date__gte = searchParams.value.test_date_start
    }
    if (searchParams.value.test_date_end) {
        andFields.test_date__lte = searchParams.value.test_date_end
    }
    if (searchParams.value.is_panel === '是') {
        andFields.is_panel = true
    } if (searchParams.value.is_panel === '否') {
        andFields.is_panel = false
    }

    let query = buildModelQuery([searchFields], andFields)
    let params = `?page=${currentPage.value}&size=${pageSize.value}`
    apiPost(`/model_query/sample_meta${params}`, (res) => {
        total.value = res.data.count;
        dataItems.value = [];
        for (const iterator of res.data.results) {
            dataItems.value.push(iterator);
        }
    }, query)

};

const confirm = (item) => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/sample/sampledatas/${item.id}/`, (_) => {
            infoMessage("删除成功");
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

const exportData = () => {
    downloadData("/sample/samplemeta/export", null);
};
const downloadTemplate = () => {
    downloadData("/sample/samplemeta/template/download", null);
};
const fileSelected = (event) => {
    let data = new FormData();
    data.append('file', event.target.files[0]);
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

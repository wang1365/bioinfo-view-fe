<template>
    <q-card class="q-mt-md">
        <q-section>
            <div class=" q-gutter-md row items-start q-pa-md bio-data-table">
                <q-input
                    style="width:350px"
                    v-model="searchParams.search"
                    dense
                    :label="$t('SampleListPageSearchInput')"
                    clearable
                >
                </q-input>

                <q-input
                    clearable
                    dense
                    :label="$t('SampleListPageSearchStartTestDate')"
                    v-model="searchParams.test_date_start"
                >
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
                <q-input
                    clearable
                    dense
                    :label="$t('SampleListPageSearchEndTestDate')"
                    v-model="searchParams.test_date_end"
                >
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
                <q-input
                    clearable
                    dense
                    :label="$t('SampleListPageSearchStartTestDate')"
                    v-model="searchParams.sample_date_start"
                >
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
                <q-input
                    clearable
                    dense
                    :label="$t('SampleListPageSearchEndTestDate')"
                    v-model="searchParams.sample_date_end"
                >
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
                    :options="[{label:$t('Yes'),value:'是'}, {label:$t('No'),value:'否'}]"
                    emit-value
                    map-options
                    :label="$t('SampleListPageSearchIsPanel')"
                />
                <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                <q-btn color="primary" :label="$t('Reset')" icon="clear" @click="reset()" />
            </div>
        </q-section>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6"> {{$t('SampleListTableTitle')}} </q-toolbar-title>
                <q-btn
                    color="primary"
                    :label="$t('SampleListTableBtnNew')"
                    icon="description"
                    @click="showSampleNew = true"
                />
                <q-btn color="info" :label="$t('PageListTableExport')" icon="file_download" @click="exportData()" />
                <q-btn color="positive">
                    <label for="file">
                        <q-icon name="file_upload"></q-icon>
                        {{ $t('PageListTableUpload') }}
                        <span style="width: 0;height: 0;overflow: hidden;display: inline-block;">
                            <input id="file" type="file" style="rgba(0,0,0,0)" @change="fileSelected($event)" />
                        </span>
                    </label>
                </q-btn>
                <q-btn
                    color="positive"
                    :label="$t('PageListTableTemplate')"
                    icon="file_download"
                    @click="downloadTemplate()"
                >
                </q-btn>
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>{{$t('SampleListTableColumnSamplingDate')}}</td>
                            <td>{{$t('SampleListTableColumnSubmissionDate')}}</td>
                            <td>{{$t('SampleListTableColumnSamplingSite')}}</td>
                            <td>{{$t('SampleListTableColumnSampleType')}}</td>
                            <td>{{$t('SampleListTableColumnTumorContent')}}</td>
                            <td>{{$t('SampleListTableColumnTumorSample')}}</td>
                            <td>{{$t('SampleListTableColumnPatientIdentificationNumber')}}</td>
                            <td>{{$t('SampleListTableColumnSampleIdentificationNumber')}}</td>
                            <td>{{$t('SampleListTableColumnOperations')}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="hover" v-for="item in dataItems" v-bind:key="item.name">
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
                            <td>{{ item.patient?.identifier }}</td>
                            <td>{{ item.identifier }}</td>
                            <td class="q-gutter-xs">
                                <q-btn
                                    color="info"
                                    :label="$t('SampleListTableColumnBtnDetail')"
                                    icon="visibility"
                                    @click="info(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="primary"
                                    :label="$t('SampleListTableColumnBtnEdit')"
                                    icon="edit"
                                    @click="edit(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="secondary"
                                    :label="$t('SampleListTableColumnBtnAssociatewithPatient')"
                                    icon="link"
                                    @click="link(item)"
                                    size="sm"
                                />

                                <q-btn
                                    color="red"
                                    :label="$t('SampleListTableColumnBtnDelete')"
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
import { useI18n } from "vue-i18n";
import { computed } from 'vue'
const { t } = useI18n();
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
        title: t('Confirm'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/sample/sampledatas/${item.id}/`, (_) => {
            infoMessage(t('Success'));
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
                message: t('Success'),
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

<template>
    <q-card class="q-mt-md">
        <q-section>
            <div class=" q-gutter-md row items-start q-pa-md bio-data-table">
                <q-input
                    style="width:450px"
                    v-model="searchParams.search"
                    dense
                    :label="$t('DataListPageSearchInput')"
                    clearable
                >
                </q-input>
                <q-select
                    style="width:100px"
                    clearable
                    dense
                    v-model="searchParams.nucleic_type"
                    :options='["gDNA", "cfDNA", "RNA"]'
                    :label="$t('DataListPageSearchTypeOfNucleicAcids')"
                />
                <q-select
                    style="width:100px"
                    clearable
                    dense
                    v-model="searchParams.nucleic_level"
                    :options='["A", "B", "C", "D"]'
                    :label="$t('DataListPageSearchDegradationGradeOfNucleicAcids')"
                />
                <q-select
                    style="width:100px"
                    clearable
                    dense
                    v-model="searchParams.risk"
                    :options="[{label:$t('Yes'),value:'是'}, {label:$t('No'),value:'否'}]"
                    emit-value
                    map-options
                    :label="$t('DataListPageSearchRiskSequencing')"
                />
                <q-btn
                    color="primary"
                    :label="$t('DataListPageListSearchEnsure')"
                    icon="search"
                    @click="refreshPage()"
                />
                <q-btn color="primary" :label="$t('DataListPageListSearchReset')" icon="clear" @click="reset()" />
            </div>
        </q-section>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6"> {{ $t('DataListTableTitle') }} </q-toolbar-title>
                <q-btn
                    color="primary"
                    :label="$t('DataListTableBtnNew')"
                    icon="description"
                    @click="showDataNew = true"
                />
                <q-btn color="info" :label="$t('PageListTableExport')" icon="file_download" @click="exportData()" />
                <q-btn color="positive">
                    <label for="file">
                        <q-icon name="file_upload"></q-icon>
                        {{ $t('PageListTableUpload') }}
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
                            <td>{{$t('DataListTableColumnDataDetails')}}</td>
                            <td>{{$t('DataListTableColumnLibraryNumber')}}</td>
                            <td>{{$t('DataListTableColumnSampleIdentificationNumber')}}</td>
                            <td>{{$t('DataListTableColumnDataIdentificationNumber')}}</td>
                            <td>{{$t('DataListTableColumnDataNameOfR1')}}</td>
                            <td>{{$t('DataListTableColumnDataNameOfR2')}}</td>
                            <td>{{$t('DataListTableColumnOperations')}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="hover" v-for="item in dataItems" v-bind:key="item.name">
                            <td>
                                {{ item.id }}
                            </td>
                            <td>
                                {{ item.project_index }}
                            </td>
                            <td>
                                {{ item.library_number }}
                            </td>
                            <td>
                                {{ item.sample_identifier }}
                            </td>
                            <td>{{ item.identifier }}</td>
                            <td>{{ item.fastq1_path }}</td>
                            <td>{{ item.fastq2_path }}</td>
                            <td class="q-gutter-xs">
                                <q-btn
                                    color="info"
                                    :label="$t('DataListTableColumnBtnDetail')"
                                    icon="visibility"
                                    @click="info(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="primary"
                                    :label="$t('DataListTableColumnBtnEdit')"
                                    icon="edit"
                                    @click="edit(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="secondary"
                                    :label="$t('DataListTableColumnBtnAssociatewithSample')"
                                    icon="link"
                                    @click="link(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="red"
                                    :label="$t('DataListTableColumnBtnDelete')"
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
    <q-dialog persistent v-model="showDataNew">
        <DataNew
            @refresh="
            refreshPage();
        showDataNew = false;
                                            "
        />
    </q-dialog>
    <q-dialog v-model="showDataInfo">
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
    <q-dialog persistent v-model="showLinkSample">
        <SampleList
            :linkId="linkId"
            @itemSelected="
            linkSample($event);
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
import SampleList from "./SampleList.vue";

import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import { api } from "src/boot/axios";
import { buildModelQuery } from "src/api/modelQueryBuilder";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
const { t } = useI18n();

const { apiGet, downloadData, apiDelete, apiPatch, apiPost } = useApi();
const showDataEdit = ref(false);
const showDataInfo = ref(false);
const showDataNew = ref(false);
const infoId = ref(0);
const editId = ref(0);
const linkId = ref(0);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const $q = useQuasar();
const searchParams = ref({
    search: '',
    risk: '',
    nucleic_type: '',
    nucleic_level: ''

})
const showLinkSample = ref(false);
const link = async (item) => {
    linkId.value = item.id;
    showLinkSample.value = true;
}
const linkSample = (event) => {
    apiPatch(`/sample/samples/${linkId.value}/`, (res) => {
        showLinkSample.value = false;
        refreshPage()
    }, { sample_meta_id: event.id, sample_identifier: event.identifier })
}

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

const reset = () => {
    searchParams.value = {
        search: '',
        risk: '',
        nucleic_type: '',
        nucleic_level: ''

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
            library_input__icontains: searchParams.value.search,
            nucleic_break_type__icontains: searchParams.value.search,
            reagent_box__icontains: searchParams.value.search,
            identifier__icontains: searchParams.value.search,
            sample_identifier__icontains: searchParams.value.search,
            company__icontains: searchParams.value.search,
        }, 'OR')
    }
    if (searchParams.value.nucleic_level) {
        andFields.nucleic_level = searchParams.value.nucleic_level
    }
    if (searchParams.value.nucleic_type) {
        andFields.nucleic_type = searchParams.value.nucleic_type
    }
    if (searchParams.value.risk == '是') {
        andFields.risk = true
    }
    if (searchParams.value.risk == '否') {
        andFields.risk = false
    }
    let query = buildModelQuery([searchFields], andFields)
    let params = `?page=${currentPage.value}&size=${pageSize.value}`
    apiPost(`/model_query/sample${params}`, (res) => {
        total.value = res.data.count;
        dataItems.value = [];
        for (const iterator of res.data.results) {
            dataItems.value.push(iterator);
        }
    }, query)

};

const confirm = (item) => {
    $q.dialog({
        title: t("Confirm"),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/sample/samples/${item.id}/`, (_) => {
            infoMessage(t("Success"));
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
    downloadData("/sample/samples/export", null);
};
const downloadTemplate = () => {
    downloadData("/sample/samples/template/download", null);
};
const fileSelected = (event) => {
    let data = new FormData();
    data.append('file', event.target.files[0]);
    api.post("/sample/samples/upload", data)
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

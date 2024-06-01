<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6">
                    {{ $t('Data') }}

                    <span
                        v-if="props.projectDetail.parent"
                        class="text-body2 bg-yellow-11"
                        >{{ $t('ProjectDetailPageDataFromParent') }}</span
                    >
                </q-toolbar-title>
                <q-btn
                    color="primary"
                    :label="$t('ProjectDetailPageSelectData')"
                    icon="description"
                    @click="openDataSelector = true"
                />
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <a-table
                    :columns="columns"
                    :data-source="dataItems"
                    :scroll="{ x: 2000, y: 1000 }"
                    size="small"
                    :pagination="pagination"
                    @change="handleTableChange"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.dataIndex === 'operation'">
                            <q-btn
                                color="secondary"
                                :label="$t('Detail')"
                                icon="visibility"
                                @click="info(record)"
                                padding="5px 10px"
                                size="sm"
                            />
                            <q-btn
                                color="red"
                                :label="$t('Delete')"
                                icon="delete"
                                @click="confirm(record)"
                                size="sm"
                                class="q-ml-xs"
                                padding="5px 10px"
                                v-if="!fromParent(record)"
                            />
                        </template>
                    </template>
                </a-table>
            </div>
        </q-section>
    </q-card>

    <q-dialog v-model="showDataInfo">
        <DataInfo :id="infoId" />
    </q-dialog>
    <q-dialog persistent v-model="openDataSelector">
        <ProjectDetailDataSelect :projectDetail="projectDetail" @refresh="dataSelected()" />
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import DataInfo from "../../../data/DataInfo.vue";
import { ref, onMounted, defineProps, watch, onUpdated, computed } from 'vue';
import PaginatorVue from "src/components/paginator/Paginator.vue";
import ProjectDetailDataSelect from "./ProjectDetailDataSelect.vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const emit = defineEmits(["refresh"]);
const props = defineProps({
    projectId: { type: Number, required: true },
    projectDetail: { type: Object, required: true },
});

const { apiPut, apiPost } = useApi();
const showDataInfo = ref(false);
const openDataSelector = ref(false);
const infoId = ref(0);
const dataItems = ref([]);

const $q = useQuasar();

const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: total => `${t('TotalCount')}: ${total}`,
    pageSizeOptions: [10, 20, 50, 100]
})

const columns = computed(() => [
    { title: t('DataNewFormDataDetails'), dataIndex: 'project_index',align: 'left', width: 50},
    { title: t('DataNewFormLibraryNumber'), dataIndex: 'library_number', align: 'left', width: 90},
    { title: t('DataNewFormDataIdentificationNumber'), dataIndex: 'identifier', align: 'left', width: 60},
    { title: t('DataNewFormSubmissionUnit'), dataIndex: 'company', align: 'left', width: 40},
    { title: t('DataNewFormTypeOfNucleicAcids'), dataIndex: 'nucleic_type', align: 'left', width: 50},
    { title: t('DataNewFormDataNameOfR1'), dataIndex: 'fastq1_path',  align: 'left', width: 110},
    { title: t('DataNewFormDataNameOfR2'), dataIndex: 'fastq2_path',  align: 'left', width: 110},
    { title: t('PatientNewFormPatientIdentificationNumber'), dataIndex: ['patient', 'identifier'], align: 'left', width: 50},
    { title: t('PatientName'), dataIndex: ['patient', 'name'],  align: 'center', width: 50},
    { title: t('PatientPageListTableColumnGender'), dataIndex: ['patient', 'gender'],  align: 'left', width: 40,
        customRender: ({text}) => text === '男' ? t('Male') : t('Female') },
    { title: t('SampleListTableColumnSampleIdentificationNumber'), dataIndex: ['sample_meta', 'identifier'], align: 'left', width: 60},
    { title: t('SampleListTableColumnSamplingSite'), dataIndex: ['sample_meta', 'sample_componet'],  align: 'left', width: 60},
    { title: t('SampleListTableColumnTumorSample'), dataIndex: 'sample_meta',  align: 'left', width: 40,
        customRender: ({text, record}) => `${JSON.stringify(record?.sample_meta?.is_panel)}` },
    { title: t('Operation'), dataIndex: 'operation', fixed: 'right', align: 'center', width: 70},
])

const info = async (item) => {
    infoId.value = item.id;
    showDataInfo.value = true;
};

const handleTableChange = (pag, filters, sorter) => {
    pagination.value = {...pagination.value, ...pag}
    loadPage()
};

const dataSelected = () => {
    openDataSelector.value = false;
    emit("refresh");
};

const fromParent = (item) => {
    for(let sample of props.projectDetail.samples){
        if(sample.id===item.id) return false
    }
    return true
    //return props.projectDetail.samples.indexOf(item.id) < 0;
};
onMounted(() => {
    loadPage();
});

onUpdated(() => {
    refreshPage();
});
const pageChange = async (event) => {
    loadPage();
};

const refreshPage = async () => {
    loadPage();
};
const loadPage = async () => {
    let projectIds = [props.projectDetail.id];
    if (props.projectDetail.parent) {
        projectIds.push(props.projectDetail.parent.id);
    }
    apiPost(
        `/sample/samples/query?page=${pagination.value.current}&size=${pagination.value.pageSize}`,
        (res) => {
            pagination.value.total = res.data.count;
            dataItems.value = [];
            for (const iterator of res.data.results) {
                dataItems.value.push(iterator);
            }
        },
        {
            project_id: {
                in: projectIds,
            },
        }
    );
};
const confirm = (item) => {
    $q.dialog({
        title: t('Confirm'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        let sampleIds = [];
        for (const iterator of props.projectDetail.samples) {
            if (iterator.id !== item.id) sampleIds.push(iterator.id);
        }
        apiPut(
            `/project/${props.projectDetail.id}`,
            (_) => {
                emit("refresh");
                // refreshPage();
            },
            { samples: sampleIds }
        );
    });
};
</script>

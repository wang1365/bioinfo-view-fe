<template>
    <div style="max-width: 100%">
        <PopupMultiSelector
            :title="$t('ProjectSelectDataTitle')"
            :dataItems="dataItems"
            :total="total"
            :tableHeaders="tableHeaders"
            :tableRowFields="tableRowFields"
            :currentPage="currentPage"
            selectedShowField="identifier"
            @pageChange="pageChange($event)"
            @ensureSelect="ensureSelect($event)"
        >
            <template v-slot:tableFilter>
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
                    <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                </div>
            </template>
            <template v-slot:itemRow="{ row }">
                <td>
                    {{ row.identifier }}
                </td>
                <td>{{ row.library_number }}</td>
                <td>{{ row.company }}</td>
                <td>{{ row.nucleic_type }}</td>
                <td>{{ row.index_type }}</td>
                <td>{{ row.fastq1_path }}</td>
                <td>{{ row.fastq2_path }}</td>
                <td>{{ row.sample_meta?.patient?.identifier }}</td>
                <td>{{ row.sample_meta?.patient?.name }}</td>
                <td>{{ row.sample_meta?.patient?.gender }}</td>
                <td>{{ row.sample_meta?.identifier }}</td>
                <td>{{ row.sample_meta?.sample_componet }}</td>
                <td>{{ row.sample_meta?.is_panel }}</td>
            </template>
        </PopupMultiSelector>
    </div>
</template>
<script setup>
import { onMounted, ref ,computed} from "vue";
import { useApi } from "src/api/apiBase";
import PopupMultiSelector from "components/popup-multi-selector/PopupMultiSelector.vue";
import { infoMessage } from "src/utils/notify";
import { buildModelQuery } from "src/api/modelQueryBuilder";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const tableHeaders = computed(() => [
    t('DataListTableColumnDataIdentificationNumber'),
    t('DataListTableColumnLibraryNumber'),
    t('DataNewFormSubmissionUnit'),
    t('DataNewFormTypeOfNucleicAcids'),
    t('DataNewFormIndexType'),
    t('DataNewFormDataNameOfR1'),
    t('DataNewFormDataNameOfR2'),
    t('PatientNewFormPatientIdentificationNumber'),
    t('PatientName'),
    t('PatientPageListTableColumnGender'),
    t('SampleListTableColumnSampleIdentificationNumber'),
    t('SampleListTableColumnSamplingSite'),
    t('SampleListTableColumnTumorSample'),
]);

const searchParams = ref({
    search: '',
    risk: '',
    nucleic_type: '',
    nucleic_level: ''

})

const emit = defineEmits(["refresh"]);
const { apiPost, apiPut } = useApi();

const indexType = ref("");
const company = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

onMounted(() => {
    loadPage();
});
const ensureSelect = (event) => {
    emit("refresh", event);
};
const pageChange = async (event) => {
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};
const refreshPage = async () => {
    currentPage.value = 1;
    loadPage();
};
const props = defineProps({
    projectDetail: { type: Object, required: true },
});
const loadPage = async () => {
    let projectIds = [props.projectDetail.id];
    if (props.projectDetail.parent) {
        projectIds.push(props.projectDetail.parent);
    }
    let andFields = {}
    let searchFields=buildModelQuery()
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
    let notInProject = buildModelQuery([], {
        project__id__in:projectIds
        }, 'NOT',false)
    let query = buildModelQuery([searchFields,notInProject], andFields)
    console.log(query)
    let params = `?page=${currentPage.value}&size=${pageSize.value}`
    apiPost(`/model_query/sample${params}`, (res) => {
        total.value = res.data.count;
                dataItems.value = [];
                for (const iterator of res.data.results) {
                    iterator.selected = false;
                    dataItems.value.push(iterator);
                }
    }, query)
    // let params = `?page=${currentPage.value}&size=${pageSize.value}`;
    // if (indexType.value) params += `&index_type=${indexType.value}`;
    // if (company.value) params += `&company=${company.value}`;
    // apiPost(
    //     `/sample/samples/query/${params}`,
    //     (res) => {
    //         total.value = res.data.count;
    //         dataItems.value = [];
    //         for (let iterator of res.data.results) {
    //             iterator.selected = false;
    //             dataItems.value.push(iterator);
    //         }
    //     },
    //     {
    //         project_id: {
    //             not_in: projectIds,
    //         },
    //     }
    // );
};
</script>

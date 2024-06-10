<template>
    <div style="max-width: 100%">
        <q-card class="q-px-lg">
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
            <a-table
                :columns="columns"
                :data-source="dataItems"
                :scroll="{ x: 1500, y: 1000 }"
                size="small"
                :row-selection="rowSelection"
                :pagination="pagination"
                row-key="id"
                v-bind="$attrs"
            />
            <q-card-actions align="right">
                <q-btn class="q-mr-lg" :label="$t('Cancel')" v-close-popup />
                <q-btn color="primary" :label="$t('Confirm')" @click="ensureSelect()" />
            </q-card-actions>
        </q-card>
        <!--        <PopupSingleSelector-->
        <!--            :title="$t('ProjectSelectDataTitle')"-->
        <!--            :dataItems="dataItems"-->
        <!--            :total="total"-->
        <!--            :tableHeaders="tableHeaders"-->
        <!--            :tableRowFields="tableRowFields"-->
        <!--            :currentPage="currentPage"-->
        <!--            selectedShowField="identifier"-->
        <!--            @pageChange="pageChange($event)"-->
        <!--            @ensureSelect="ensureSelect($event)"-->
        <!--        >-->
        <!--            <template v-slot:tableFilter>-->
        <!--                <div class=" q-gutter-md row items-start q-pa-md bio-data-table">-->
        <!--                    <q-input style="width:450px" v-model="searchParams.search" dense :label="$t('DataListPageSearchInput')" clearable> </q-input>-->
        <!--                    <q-select-->
        <!--                        style="width:100px"-->
        <!--                        clearable-->
        <!--                        dense-->
        <!--                        v-model="searchParams.nucleic_type"-->
        <!--                        :options='["gDNA", "cfDNA", "RNA"]'-->
        <!--                        :label="$t('DataListPageSearchTypeOfNucleicAcids')"-->
        <!--                    />-->
        <!--                    <q-select-->
        <!--                        style="width:100px"-->
        <!--                        clearable-->
        <!--                        dense-->
        <!--                        v-model="searchParams.nucleic_level"-->
        <!--                        :options='["A", "B", "C", "D"]'-->
        <!--                        :label="$t('DataListPageSearchDegradationGradeOfNucleicAcids')"-->
        <!--                    />-->
        <!--                    <q-select-->
        <!--                        style="width:100px"-->
        <!--                        clearable-->
        <!--                        dense-->
        <!--                        v-model="searchParams.risk"-->
        <!--                        :options="[{label:$t('Yes'),value:'是'}, {label:$t('No'),value:'否'}]"-->
        <!--                        emit-value-->
        <!--                        map-options-->
        <!--                        :label="$t('DataListPageSearchRiskSequencing')"-->
        <!--                    />-->
        <!--                    <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />-->
        <!--                </div>-->
        <!--            </template>-->
        <!--            <template v-slot:itemRow="{ row }">-->
        <!--                <td>-->
        <!--                    {{ row.identifier }}-->
        <!--                </td>-->
        <!--                <td>{{ row.library_number }}</td>-->
        <!--                <td>{{ row.company }}</td>-->
        <!--                <td>{{ row.nucleic_type }}</td>-->
        <!--                <td>{{ row.index_type }}</td>-->
        <!--                <td>{{ row.fastq1_path }}</td>-->
        <!--                <td>{{ row.fastq2_path }}</td>-->
        <!--                <td>{{ row.sample_meta?.patient?.identifier }}</td>-->
        <!--                <td>{{ row.sample_meta?.patient?.name }}</td>-->
        <!--                <td>{{ row.sample_meta?.patient?.gender=='男'?$t('Male'):$t('Female') }}</td>-->
        <!--                <td>{{ row.sample_meta?.identifier }}</td>-->
        <!--                <td>{{ row.sample_meta?.sample_componet }}</td>-->
        <!--                <td>{{ row.sample_meta?.is_panel }}</td>-->
        <!--            </template>-->
        <!--        </PopupSingleSelector>-->
    </div>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { useApi } from "src/api/apiBase"
import PopupSingleSelector from "components/popup-single-selector/PopupSingleSelector.vue";
import { buildModelQuery } from "src/api/modelQueryBuilder"

import { useI18n } from "vue-i18n"
const { t } = useI18n()


const props = defineProps({
    projectDetail: { type: Object, required: true },
    multiSelect: { type: Boolean, default: true }
})

const columns = computed(() => [
    { title: t('DataNewFormDataDetails'), dataIndex: 'project_index',align: 'left', width: 50},
    { title: t('DataNewFormLibraryNumber'), dataIndex: 'library_number', align: 'left', width: 90},
    { title: t('DataNewFormDataIdentificationNumber'), dataIndex: 'identifier', align: 'left', width: 60},
    { title: t('DataNewFormSubmissionUnit'), dataIndex: 'company', align: 'left', width: 40},
    { title: t('DataNewFormTypeOfNucleicAcids'), dataIndex: 'nucleic_type', align: 'left', width: 50},
    { title: t('DataNewFormDataNameOfR1'), dataIndex: 'fastq1_path',  align: 'left', width: 110},
    { title: t('DataNewFormDataNameOfR2'), dataIndex: 'fastq2_path',  align: 'left', width: 110},
    { title: t('PatientNewFormPatientIdentificationNumber'), dataIndex: ['sample_meta', 'patient', 'identifier'], align: 'left', width: 50},
    { title: t('PatientName'), dataIndex: ['sample_meta', 'patient', 'name'],  align: 'center', width: 50},
    { title: t('PatientPageListTableColumnGender'), dataIndex: ['sample_meta', 'patient', 'gender'],  align: 'left', width: 40,
        customRender: ({text}) => text === '男' ? t('Male') : t('Female') },
    { title: t('SampleListTableColumnSampleIdentificationNumber'), dataIndex: ['sample_meta', 'identifier'], align: 'left', width: 60},
    { title: t('SampleListTableColumnSamplingSite'), dataIndex: ['sample_meta', 'sample_componet'],  align: 'left', width: 60},
    { title: t('SampleListTableColumnTumorSample'), dataIndex: 'sample_meta',  align: 'left', width: 40,
        customRender: ({text, record}) => `${JSON.stringify(record?.sample_meta?.is_panel)}` },
])

const pagination = {

}

const selectedRows = computed(() => {
    return dataItems.value.filter(item => rowSelection.selectedRowKeys.includes(item.id))
})

const onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('>>>>>>>>>>>>>', selectedRowKeys, selectedRows)
    rowSelection.selectedRowKeys = selectedRowKeys
}

const rowSelection = reactive({
    // hideDefaultSelections: true,
    type: props.multiSelect ? 'checkbox' : 'radio',
    selectedRowKeys: [],
    onChange: onSelectChange,
})

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

const emit = defineEmits(["select"])
const { apiPost, apiPut } = useApi()

const indexType = ref("")
const company = ref("")
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dataItems = ref([])

onMounted(() => {
    loadPage()
})

const ensureSelect = () => {
    emit("select", selectedRows.value)
}

const pageChange = async (event) => {
    currentPage.value = event.currentPage
    pageSize.value = event.pageSize
    loadPage()
}

const refreshPage = async () => {
    currentPage.value = 1
    loadPage()
}

const loadPage = async () => {
    let projectIds = [props.projectDetail.id]
    if (props.projectDetail.parent) {
        projectIds.push(props.projectDetail.parent.id)
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
    if (searchParams.value.risk === '是') {
        andFields.risk = true
    }
    if (searchParams.value.risk === '否') {
        andFields.risk = false
    }
    let notInProject = buildModelQuery([], {
        project__id__in:projectIds
        }, 'NOT',false)
    let query = buildModelQuery([searchFields,notInProject], andFields)
    console.log(query)
    let params = `?page=${currentPage.value}&size=${pageSize.value}`
    apiPost(`/model_query/sample${params}`, (res) => {
        total.value = res.data.count
        dataItems.value = []
        for (const iterator of res.data.results) {
            // iterator.selected = false
            iterator.key = iterator.id
            dataItems.value.push(iterator)
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
}
</script>

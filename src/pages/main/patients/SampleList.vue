<template>
    <div style="max-width: 100%">
        <PopupMultiSelector
            :title="$t('Select')+' '+$t('Sample')"
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

                            <q-select
                                style="width:100px"
                                clearable
                                dense
                                v-model="searchParams.is_panel"
                                :options="['是', '否']"
                                :label="$t('SampleListPageSearchIsPanel')"
                            />
                            <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                        </div>
                    </q-section>
                </q-card>
            </template>
        </PopupMultiSelector>
    </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useApi } from "src/api/apiBase";
import PopupMultiSelector from "components/popup-multi-selector/PopupMultiSelector.vue";
import { buildModelQuery } from "src/api/modelQueryBuilder";
const searchParams = ref({
    search: '',
    is_panel: '',

    sample_date_start: '',
    sample_date_end: '',
    test_date_start: '',
    test_date_end: ''

})

const tableHeaders = ref([
    "ID",
    "样本识别号",
    "患者识别号",
    "样本类型",
    "肿瘤样本",
    "采样日期",
]);
const tableRowFields = ref([
    "id",
    "identifier",
    "patient_identifier",
    "sample_type",
    "is_panel",
    "sample_date",
]);
const emit = defineEmits(["refresh"]);
const { apiGet, apiPost } = useApi();


const selectedItem = ref({});
const props = defineProps({
    linkId: { type: Number, required: true },
    patient:{type:Object,required:true}
})
const selectItem = (item) => {
    selectedItem.value = item;
};
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);


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
const ensureSelect = (event) => {
    emit('refresh', event)
}
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
        for (let iterator of res.data.results) {
            iterator.selected = false;
            for (const sample of props.patient.samplemeta_set) {
                if(sample.id===iterator.id){
                    iterator.selected=true
                    break
                }
            }
            dataItems.value.push(iterator);
        }
    }, query)
    // let params = `?page=${currentPage.value}&size=${pageSize.value}`;
    // apiGet(`/sample/sampledatas/${params}`, (res) => {
    //     total.value = res.data.count;
    //     dataItems.value = [];
    //     for (let iterator of res.data.results) {
    //         iterator.selected = false;
    //         dataItems.value.push(iterator);
    //     }
    // });
};
</script>

<template>
    <div style="max-width: 100%">
        <PopupSingleSelector
            :title="$t('Select')+' '+$t('Patient')"
            :dataItems="dataItems"
            :total="total"
            :tableHeaders="tableHeaders"
            :tableRowFields="tableRowFields"
            :currentPage="currentPage"
            selectedShowField="name"
            @pageChange="pageChange($event)"
            @ensureSelect="ensureSelect($event)"
        >
            <template v-slot:tableFilter>
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

                    <q-btn color="primary" :label="$t('Search')" icon="search" @click="refreshPage()" />
                </div>
            </template>
            <!-- <template v-slot:itemRow="{ row }">
                <td>
                    {{ row.name }}
                </td>
                <td>{{ row.samples.length }}</td>
                <td>{{ row.task_count }}</td>
                <td>{{ row.owner }}</td>
                <td>{{ row.create_time }}</td>
            </template> -->
        </PopupSingleSelector>
    </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useApi } from "src/api/apiBase";
import PopupSingleSelector from "components/popup-single-selector/PopupSingleSelector.vue";
import { buildModelQuery } from "src/api/modelQueryBuilder";

const tableHeaders = ref([
    "ID",
    "姓名",
    "患者识别号",
    "送检机构",
    "诊疗医生",
    "性别",
    "年龄",
]);
const tableRowFields = ref([
    "id",
    "name",
    "identifier",
    "inspection_agency",
    "medical_doctor",
    "gender",
    "age"
]);
const emit = defineEmits(["refresh"]);
const { apiGet,apiPost } = useApi();
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

const selectedItem = ref({});
const props = defineProps({
    linkId: { type: Number, required: true }
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
    console.log(event);
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};
const refreshPage = async () => {
    currentPage.value = 1;
    loadPage();
};
const ensureSelect =  (event) => {
    emit('refresh',event)
}
const loadPage = async () => {
    let andFields = {}
    let searchFields=buildModelQuery()
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
    apiPost(`/model_query/patient${params}`, (res) => {
        total.value = res.data.count;
                dataItems.value = [];
                for (const iterator of res.data.results) {
                    iterator.selected = false;
                    dataItems.value.push(iterator);
                }
    }, query)
    // let params = `?page=${currentPage.value}&size=${pageSize.value}`;
    // apiGet(`/patient/patients${params}`, (res) => {
    //     total.value = res.data.count;
    //     dataItems.value = [];
    //     for (let iterator of res.data.results) {
    //         iterator.selected = false;
    //         dataItems.value.push(iterator);
    //     }
    // });
};
</script>

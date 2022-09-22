<template>
    <div style="max-width: 100%">
        <PopupSingleSelector
            title="选择患者"
            :dataItems="dataItems"
            :total="total"
            :tableHeaders="tableHeaders"
            :tableRowFields="tableRowFields"
            :currentPage="currentPage"
            selectedShowField="name"
            @pageChange="pageChange($event)"
            @ensureSelect="ensureSelect($event)"
        >
            <!-- <template v-slot:tableFilter>
                <div class="row q-px-md q-gutter-sm">
                    <q-input style="width: 250px" dense v-model="projectName" label="项目名称" clearable />
                    <q-btn color="primary" icon="search" @click="refreshPage()"></q-btn>
                </div>
            </template> -->
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
const { apiGet } = useApi();


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
    let params = `?page=${currentPage.value}&size=${pageSize.value}`;
    apiGet(`/patient/patients${params}`, (res) => {
        total.value = res.data.count;
        dataItems.value = [];
        for (let iterator of res.data.results) {
            iterator.selected = false;
            dataItems.value.push(iterator);
        }
    });
};
</script>

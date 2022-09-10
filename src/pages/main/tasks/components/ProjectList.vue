<template>
    <div style="max-width: 100%">
        <PopupSingleSelector
            title="选择项目"
            :dataItems="dataItems"
            :total="total"
            :tableHeaders="tableHeaders"
            :tableRowFields="tableRowFields"
            selectedShowField="name"
            @pageChange="pageChange($event)"
            @ensureSelect="ensureSelect($event)"
        >
            <template v-slot:itemRow="{ row }">
                <td>
                    {{ row.name }}
                </td>
                <td>{{ row.samples.length }}</td>
                <td>{{ row.task_count }}</td>
                <td>{{ row.owner }}</td>
                <td>{{ row.create_time }}</td>
            </template>
        </PopupSingleSelector>
    </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useApi } from "src/api/apiBase";
import PopupSingleSelector from "components/popup-single-selector/PopupSingleSelector.vue";
const tableHeaders = ref([
    "项目名称",
    "样本数量",
    "任务数量",
    "创建人",
    "创建时间",
]);
const tableRowFields = ref([
    "name",
    "samples",
    "task_count",
    "owner",
    "create_time",
]);
const emit = defineEmits(["itemSelected"]);
const { apiGet } = useApi();

const selectedItem = ref({});

const selectItem = (item) => {
    selectedItem.value = item;
};
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const itemSelected = () => {
    emit("itemSelected", selectedItem.value);
};
onMounted(() => {
    loadPage();
});
const ensureSelect = (event) => {
    emit("itemSelected", event);
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
const loadPage = async () => {
    if (currentPage.value) {
        apiGet(
            `/project?page=${currentPage.value}&size=${pageSize.value}`,
            (res) => {
                total.value = res.data.count;
                dataItems.value = [];
                for (let iterator of res.data.results) {
                    iterator.selected = false;
                    dataItems.value.push(iterator);
                }
            }
        );
    }
};
</script>

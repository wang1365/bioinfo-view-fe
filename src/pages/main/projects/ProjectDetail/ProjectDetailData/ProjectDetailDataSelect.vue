<template>
    <div style="max-width: 100%">
        <PopupMultiSelector
            title="选择数据"
            :dataItems="dataItems"
            :total="total"
            :tableHeaders="tableHeaders"
            :tableRowFields="tableRowFields"
            :currentPage="currentPage"
            selectedShowField="library_number"
            @pageChange="pageChange($event)"
            @ensureSelect="ensureSelect($event)"
        >
            <template v-slot:tableFilter>
                <div class="row q-px-md q-gutter-sm">
                    <q-input
                        style="width: 250px"
                        dense
                        v-model="indexType"
                        label="index 类型"
                        clearable
                    />
                    <q-input
                        style="width: 250px"
                        dense
                        v-model="company"
                        label="送检机构"
                        clearable
                    />
                    <q-btn
                        color="primary"
                        icon="search"
                        @click="refreshPage()"
                    ></q-btn>
                </div>
            </template>
        </PopupMultiSelector>
    </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useApi } from "src/api/apiBase";
import PopupMultiSelector from "components/popup-multi-selector/PopupMultiSelector.vue";
import { infoMessage } from "src/utils/notify";

const tableHeaders = ref([
    "文库编号",
    "数据识别号",
    "送检机构",
    "核酸类型",
    "index 类型",
    "R1 数据名称",
    "R2 数据名称",
]);
const tableRowFields = ref([
    "library_number",
    "identifier",
    "company",
    "nucleic_type",
    "index_type",
    "fastq1_path",
    "fastq2_path",
]);

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
    console.log(event);
    let selectedIds = [];
    for (const iterator of event) {
        selectedIds.push(iterator.id);
    }
    if (selectedIds.length > 0) {
        for (const iterator of props.projectDetail.samples) {
            selectedIds.push(iterator);
        }
        apiPut(
            `/project/${props.projectDetail.id}`,
            (_) => {
                infoMessage("更新成功");
                emit("refresh");
            },
            {
                samples: selectedIds,
            }
        );
    } else {
        errorMessage("没有选择数据");
    }
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
    let params = `?page=${currentPage.value}&size=${pageSize.value}`;
    if (indexType.value) params += `&index_type=${indexType.value}`;
    if (company.value) params += `&company=${company.value}`;
    apiPost(
        `/sample/samples/query/${params}`,
        (res) => {
            total.value = res.data.count;
            dataItems.value = [];
            for (let iterator of res.data.results) {
                iterator.selected = false;
                dataItems.value.push(iterator);
            }
        },
        {
            project_id: {
                not_in: projectIds,
            },
        }
    );
};
</script>

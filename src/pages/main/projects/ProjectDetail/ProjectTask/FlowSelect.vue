<template>
    <div style="width: 80vw; max-width: 80vw; max-height: 90vh">
        <PopupSingleSelector
            :title="t('ProjectSelectFlowTitle')"
            :dataItems="dataItems"
            :total="total"
            :tableHeaders="tableHeaders"
            :tableRowFields="tableRowFields"
            :currentPage="currentPage"
            selectedShowField="name"
            @pageChange="pageChange($event)"
            @ensureSelect="ensureSelect($event)"
        />
    </div>
</template>
<script setup>
import { ref, onMounted, defineEmits ,computed} from "vue";
import { useApi } from "src/api/apiBase.js";
import { errorMessage } from "src/utils/notify.js";
import PopupSingleSelector from "components/popup-single-selector/PopupSingleSelector.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const emit = defineEmits(["flowSelected"]);
const { apiGet } = useApi();
const tableHeaders = computed(()=>[
t('FlowName'),
t('Category'),
t('FlowDetail')
]);
const tableRowFields = ref([
    "name",
    "flow_category",
    "desp",
]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

onMounted(() => {
    loadPage();
});
const loadPage = () => {
    dataItems.value=[]
    apiGet("/flow/flows/", (res) => {
        for (const item of res.data.results) {
            item.checked = false;
            total.value+=1
            dataItems.value.push(item);
        }
        console.log(total.value)
    });
};
const pageChange = async (event) => {
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};
const ensureSelect = (event) => {
    emit("flowSelected", event);
};
</script>

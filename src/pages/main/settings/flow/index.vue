<template>
    <q-page padding>
        <PageTitle title="流程列表"/>
        <q-table
            :rows="rows"
            :columns="columns"
            row-key="name"
            color="primary"
            separator="vertical"
            dense
            hide-no-data
            wrap-cells
            v-model:pagination="pagination"
            rows-per-page-label="每页条数"
            :rows-per-page-options="[10, 20, 50, 100]"
        >
            <template v-slot:top>
                <q-btn color="primary" label="新建流程" @click="addFlow"/>
            </template>
        </q-table>

        <flow-dialog
            ref="dlgCreate"
            action="create"
            @handleFinish="refreshFlows"
        />
<!--        <flow-dialog ref="dlgEdit" action="edit" @handleFinish="refreshFlows"/>-->
<!--        <flow-dialog ref="dlgInfo" action="info" @handleFinish="refreshFlows"/>-->
    </q-page>
</template>

<script setup>
import {getFlows, deleteFlow} from "src/api/flow";
import {ref, onMounted} from "vue";
import {useQuasar} from "quasar";
import PageTitle from "components/page-title/PageTitle";
import FlowDialog from "./FlowDialog";

const dlgCreate = ref(null);
const dlgEdit = ref(null);
const dlgInfo = ref(null);

const $q = useQuasar();
const rows = [];
const columns = [
    {name: "id", label: "ID", align: "center", style: "width:80px", field: (row) => row.id, format: (val) => `${val}`,},
    {name: "name", label: "名 称", field: "name", sortable: true, align: "center",},
    {name: "code", align: "center", label: "code", field: "calories", sortable: true,},
    {name: "flow_category", label: "分 类", field: "flow_category", align: "center",},
    {name: "memory", label: "内存(m)", align: "center", field: "memory"},
    {name: "docker_image", label: "Docker镜像", field: "docker_image", align: "center",},
    {name: "desp", label: "描述", align: "center", style: "width:220px"},
    {name: "create_time", label: "创建时间", align: "center", style: "width:220px",},
    {name: "operation", label: "操 作", align: "center", style: "width:220px",},
];

const pagination = ref({
    sortBy: "desc",
    descending: false,
    page: 1,
    rowsPerPage: 10,
    // rowsNumber: xx if getting data from a server
});

const flows = ref([
    {
        name: "WGS",
        location: "first.sh",
        alignment_tool: "bioinfo",
        parameters: [
            {key: "INPUT_DIR", type: "array", required: true, blank: false,},
            {key: "REPORT_OUTPUT_DIR", type: "array", required: true, blank: false,},
        ],
        desp: "xxx",
    },
]);
const selectedFlow = ref({});
const isDlgShow = ref(false);
const isCreateDlgShow = ref(false);
const isInfoDlgShow = ref(false);
const mode = ref("info");
const page = ref(1);
const total = ref(0);
const pageSize = ref(10);

onMounted(() => {
    refreshFlows();
});
const refreshFlows = () => {
    getFlows(page, pageSize).then((data) => {
        flows.value = data.results;
        total.value = data.count;
    });
};
const getTagType = (row) => {
    const cat = row.flow_category;
    const data = {
        DNA: "success",
        RNA: "primary",
        AMP: "info",
    };

    return data[cat] || "info";
};

const showEditDlg = (row) => {
    isDlgShow.value = true;
    this.$refs.dlgEdit.setData(row);
};

const showDeleteDlg = (row) => {
    $q.dialog({
        title: `是否要删除流程“${row.name}”?`,
    }).onOk(() => {
        deleteFlow(row.id).then(() => {
            $q.notify.create({type: "positive", message: "删除成功"});
            refreshFlows();
        });
    });
};

const showInfoDlg = (row) => {
    isInfoDlgShow.value = true;
    dlgInfo.value.setData(row);
};

const addFlow = () => {
    dlgCreate.value.setData({
        name: "",
        location: "",
        alignment_tool: "",
        desp: "",
        flow_category: "",
        details: "",
        parameters: [],
        builtin_parameters: [],
        sample_type: "multiple",
    })
    dlgCreate.value.reset()
    dlgCreate.value.show()
    // isCreateDlgShow.value = true
}

const handleSizeChange = (size) => {
    pageSize.value = size;
    refreshFlows();
}

const handleCurrentChange = (page) => {
    page.value = page;
    refreshFlows();
}
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}
</style>

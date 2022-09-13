<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="任务管理" />
        <div class="row">
            <div class="col-2"></div>
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div class="row">
                    <div class="col-2">
                        <q-select
                            v-model="status"
                            :options="options"
                            stack-label
                            :display-value="`状态: ${status.label}`"
                            @update:model-value="refreshPage()"
                        >
                        </q-select>
                    </div>
                    <div class="col-10 q-pl-sm">
                        <q-input readonly @click="showProjectSelect = true" :model-value="'所属项目: ' + projectName">
                            <template v-slot:prepend>
                                <q-icon class="cursor-pointer" name="search" @click="showProjectSelect = true" />
                            </template>
                            <template v-slot:append>
                                <q-icon
                                    class="cursor-pointer"
                                    name="backspace"
                                    @click="
                                        projectName = '';
                                        projectId = '';
                                        refreshPage();
                                    "
                                />
                            </template>
                        </q-input>
                    </div>
                </div>
            </div>
            <div class="col-2"></div>
        </div>
        <div class="bio-data-table">
            <table>
                <thead>
                    <tr>
                        <!-- <td>
                            <q-checkbox v-model="selected" color="negative" />
                        </td> -->
                        <td>ID</td>
                        <td>名称</td>
                        <td>项目</td>
                        <td>分析流程</td>
                        <td>进度</td>
                        <td>状态</td>
                        <td>创建者</td>
                        <td>创建时间</td>
                        <td>操作</td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="hover" v-for="item in dataItems" v-bind:key="item.name">
                        <!-- <td class="q-pa-md text-center">
                            <q-checkbox
                                v-model="item.selected"
                                color="negative"
                            />
                        </td> -->

                        <td>
                            {{ item.id }}
                        </td>
                        <td>
                            {{ item.name }}
                        </td>
                        <td>
                            {{ item.project.name }}
                        </td>
                        <td>{{ item.flow.name }}</td>

                        <td>
                            <q-linear-progress rounded size="10px" :value="item.progess" />
                        </td>
                        <td>{{ getItemStatus(item) }}</td>
                        <td>{{ item.creator.username }}</td>
                        <td>{{ item.create_time }}</td>
                        <td class="q-gutter-x-sm">
                            <q-btn
                                color="secondary"
                                label="详情"
                                icon="visibility"
                                @click="gotoDetail(item)"
                                size="sm"
                            />
                            <q-btn color="primary" label="下载" icon="download" @click="downlaod(item)" size="sm" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="row q-mt-md">
                <q-space></q-space>
                <PaginatorVue :total="total" :currentPage="currentPage" @pageChange="pageChange($event)" />
            </div>
        </div>
        <q-dialog v-model="showProjectSelect">
            <ProjectListVue @itemSelected="projectSelected($event)" />
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "src/api/apiBase";
import PageTitle from "components/page-title/PageTitle.vue";
import ProjectListVue from "./components/ProjectList.vue";
import { useRouter } from "vue-router";
const options = ref([
    { label: "全部", value: "ALL" },
    { label: "运行中", value: "RUNNING" },
    { label: "排队", value: "PENDING" },
    { label: "失败", value: "FAILURED" },
    { label: "完成", value: "FINISHED" },
    { label: "取消", value: "CANCELED" },
]);
const status = ref({ label: "全部", value: "ALL" });
const showProjectSelect = ref(false);
const projectId = ref(0);
const projectName = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);
const { apiGet,downloadData } = useApi();
const router = useRouter();

const getItemStatus = (item) => {
    switch (item.status) {
        case "PENDING":
            return "排队中";
        case "RUNNING":
            return "运行中";
        case "FINISHED":
            return "完成";
        case "FAILURED":
            return "失败";
        case "CANCELED":
            return "取消";
        default:
            return item.status;
    }
};

const projectSelected = (event) => {
    console.log(event);
    projectName.value = event.name;
    projectId.value = event.id;
    showProjectSelect.value = false;
    console.log(projectId.value);
    refreshPage();
};
const gotoDetail = (item) => {
    router.push(`/main/tasks/${item.id}`);
};
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
const loadPage = async () => {
    let params = `?page=${currentPage.value}&size=${pageSize.value}`;
    if (status.value.label != "全部") params += `&status=${status.value.value}`;
    if (projectId.value) params += `&project_id=${projectId.value}`;

    apiGet(`/task${params}`, (res) => {
        total.value = res.data.total_count;
        dataItems.value = [];
        for (const iterator of res.data.item_list) {
            dataItems.value.push(iterator);
        }
    });
 };


const downlaod = (item) => {
    downloadData(`/task/download/${item.id}`, null);
};
</script>

<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="folder" />
                <q-toolbar-title class="text-h6"> 子项目 </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="新建子项目"
                    icon="folder"
                    @click="openNewProject = true"
                />
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md">
                <table>
                    <thead>
                        <tr class="text-body1 text-weight-bold">
                            <td>项目名称</td>
                            <td>创建人</td>
                            <td>创建时间</td>
                            <td>样本数量</td>
                            <td>任务数量</td>

                            <td class="text-right">操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataItems" :key="item">
                            <td>
                                {{ item.name }}
                            </td>
                            <td>{{ item.owner }}</td>
                            <td>{{ item.create_time }}</td>
                            <td>{{ item.samples.length }}</td>
                            <td>{{ item.task_count }}</td>
                            <td class="q-gutter-x-sm text-right">
                                <q-btn
                                    color="info"
                                    label="详情"
                                    icon="arrow_outward"
                                    @click="gotoChild(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="primary"
                                    label="修改"
                                    icon="edit"
                                    @click="
                                        updateProjectName = item.name;
                                        currentProject = item;
                                        openEditProject = true;
                                    "
                                    size="sm"
                                />
                                <q-btn
                                    color="red"
                                    label="删除"
                                    icon="delete"
                                    @click="confirm(item)"
                                    size="sm"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <PaginatorVue
                        :total="total"
                        :currentPage="currentPage"
                        @pageChange="pageChange($event)"
                    />
                </div>
            </div>
        </q-section>
        <q-section class="q-pd-md"> </q-section>
    </q-card>
    <q-dialog v-model="openNewProject" persistent>
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>新建项目</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input
                                v-model="newProjectName"
                                label="项目名称"
                            />
                        </q-section>
                    </q-item>
                    <q-item>
                        <q-section
                            v-if="newProjectNameError"
                            class="full-width text-red"
                        >
                            {{ newProjectNameError }}
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-section>
            <q-card-actions align="right" class="bg-white text-teal">
                <q-list>
                    <q-item>
                        <q-section class="q-gutter-x-sm">
                            <q-btn label="取消" v-close-popup />
                            <q-btn
                                color="primary"
                                label="确认"
                                @click="createProject()"
                            />
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="openEditProject" persistent>
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>修改项目</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input
                                v-model="updateProjectName"
                                label="项目名称"
                            />
                        </q-section>
                    </q-item>
                    <q-item>
                        <q-section
                            v-if="updateProjectNameError"
                            class="full-width text-red"
                        >
                            {{ updateProjectNameError }}
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-section>
            <q-card-actions align="right" class="bg-white text-teal">
                <q-list>
                    <q-item>
                        <q-section class="q-gutter-x-sm">
                            <q-btn label="取消" v-close-popup />
                            <q-btn
                                color="primary"
                                label="确认"
                                @click="updateProject()"
                            />
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "src/api/apiBase";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import { infoMessage } from "src/utils/notify";

const props = defineProps({ projectDetail: Object });

const { apiGet, apiDelete } = useApi();

const route = useRoute();

const openNewProject = ref(false);

const openEditProject = ref(false);
const newProjectName = ref("");
const currentProject = ref({});
const newProjectNameError = ref("");
const updateProjectName = ref("");
const updateProjectNameError = ref("");

const router = useRouter();
const $q = useQuasar();
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

const gotoChild = (item) => {
    router.push(`/main/projects/${item.id}`);
};

const createProject = () => {
    newProjectName.value = newProjectName.value.trim();
    if (!newProjectName.value) {
        newProjectNameError.value = "项目名称不可为空";
        return;
    }
    api.post("/project", {
        name: newProjectName.value,
        parent: props.projectDetail.id,
    }).then((resp) => {
        newProjectNameError.value = "";
        openNewProject.value = false;
        refreshPage();
    });
};
const updateProject = () => {
    updateProjectName.value = updateProjectName.value.trim();
    if (!updateProjectName.value) {
        updateProjectNameError.value = "项目名称不可为空";
        return;
    }
    api.put(`/project/${currentProject.value.id}`, {
        name: updateProjectName.value,
    }).then((resp) => {
        openEditProject.value = false;
        updateProjectNameError.value = "";
        console.log(resp);
        refreshPage();
    });
};

const refreshPage = async () => {
    currentPage.value = 1;
    loadPage();
};

const loadPage = async () => {
    if (currentPage.value) {
        apiGet(
            `/project?page=${currentPage.value}&size=${pageSize.value}&parent_id=${route.params.id}`,
            (res) => {
                total.value = res.data.count;
                dataItems.value = [];
                for (const iterator of res.data.results) {
                    dataItems.value.push(iterator);
                }
            }
        );
    }
};

const confirm = (project) => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/project/${project.id}`, (_) => {
            infoMessage("删除成功");
            refreshPage();
        });
    });
};
</script>

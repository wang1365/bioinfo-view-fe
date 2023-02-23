<template>
    <q-card>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="folder" />
                <q-toolbar-title class="text-h6"> 项目 </q-toolbar-title>
                <q-input style="width: 250px" dense v-model="search" label="项目名称" clearable />
                <q-btn color="primary" icon="search" @click="refreshPage()"></q-btn>
                <q-btn color="primary" label="新建项目" icon="folder" @click="openNewProject = true" />
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>项目名称</td>
                            <td>创建人</td>
                            <td>创建时间</td>
                            <td>样本数量</td>
                            <td>任务数量</td>
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataItems" :key="item">
                            <td>
                                {{ item.id }}
                            </td>
                            <td>
                                {{ item.name }}
                            </td>
                            <td>{{ item.owner }}</td>
                            <td>{{ item.create_time }}</td>
                            <td>{{ item.samples.length }}</td>
                            <td>{{ item.task_count }}</td>
                            <td class="q-gutter-x-sm">
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
                                <q-btn color="red" label="删除" icon="delete" @click="confirm(item)" size="sm" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <PaginatorVue :total="total" :currentPage="currentPage" @pageChange="pageChange($event)" />
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
            <q-separator></q-separator>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width"> <q-input v-model="newProjectName" label="项目名称" /></q-section>
                    </q-item>
                    <q-item>
                        <q-section v-if="newProjectNameError" class="full-width text-red">
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
                            <q-btn color="primary" label="确认" @click="createProject()" />
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
                            <q-input v-model="updateProjectName" label="项目名称"
                        /></q-section>
                    </q-item>
                    <q-item>
                        <q-section v-if="updateProjectNameError" class="full-width text-red">
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
                            <q-btn color="primary" label="确认" @click="updateProject()" />
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
import { useRouter } from "vue-router";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import PaginatorVue from "src/components/paginator/Paginator.vue";

const { apiGet, apiPut, apiPost, apiDelete } = useApi();

const search=ref("")
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
    apiPost(
        "/project",
        (_) => {
            newProjectNameError.value = "";
            newProjectName.value = "";
            openNewProject.value = false;
            infoMessage("创建成功");
            refreshPage();
        },
        { name: newProjectName.value }
    );
};
const updateProject = () => {
    updateProjectName.value = updateProjectName.value.trim();
    if (!updateProjectName.value) {
        updateProjectNameError.value = "项目名称不可为空";
        return;
    }
    apiPut(
        `/project/${currentProject.value.id}`,
        (_) => {
            openEditProject.value = false;
            updateProjectNameError.value = "";
            infoMessage("更新成功");
            refreshPage();
        },
        {
            name: updateProjectName.value,
        }
    );
};

const refreshPage = async () => {
    currentPage.value = 1;
    loadPage();
};
const loadPage = async () => {
    let params=`?page=${currentPage.value}&size=${pageSize.value}`
    if(search.value){
        params+=`&name=${search.value}`
    }
    if (currentPage.value) {
        apiGet(
            `/project${params}`,
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
        title: "确认删除项目吗?",
        message:"注意: 删除项目后,项目下的任务也会级联删除掉, 且不可恢复!",
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

<template>
    <q-card>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="folder" />
                <q-toolbar-title class="text-h6"> 项目 </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="新建项目"
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
                                    @click="confirm()"
                                    size="sm"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <q-pagination
                        :model-value="currentPage"
                        @update:model-value="pageChange($event)"
                        :max="maxPages"
                        boundary-numbers
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
                            <q-input v-model="newProjectName" label="项目名称"
                        /></q-section>
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
                        /></q-section>
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
import { useRouter } from "vue-router";

const openNewProject = ref(false);

const openEditProject = ref(false);
const newProjectName = ref("");
const currentProject = ref({});
const newProjectNameError = ref("");
const updateProjectName = ref("");
const updateProjectNameError = ref("");

const current = ref(5);
const router = useRouter();
const $q = useQuasar();
const currentPage = ref(1);
const pageSize = ref(4);
const total = ref(0);
const maxPages = ref(0);
const dataItems = ref([]);

onMounted(() => {
    loadPage();
});
const pageChange = async (event) => {
    currentPage.value = event;
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
    api.post("/project", { name: newProjectName.value }).then((resp) => {
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
const edit = async (patient) => {
    editId.value = patient.id;
    showPatientEdit.value = true;
};
const refreshPage = async () => {
    console.log("refresh page");
    currentPage.value = 1;
    loadPage();
};
const loadPage = async () => {
    api.get(`/project?page=${currentPage.value}&size=${pageSize.value}`).then(
        (resp) => {
            total.value = resp.data.data.count;
            dataItems.value = [];
            if (total.value % pageSize.value == 0) {
                maxPages.value = total.value / pageSize.value;
            } else {
                maxPages.value = total.value / pageSize.value + 1;
            }
            for (const iterator of resp.data.data.results) {
                dataItems.value.push(iterator);
            }
        }
    );
};

const confirm = () => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    })
        .onOk(() => {
            // console.log('>>>> OK')
        })
        .onOk(() => {
            // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
            // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
            // console.log('I am triggered on both OK and Cancel')
        });
};
</script>

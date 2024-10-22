<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="folder" />
                <q-toolbar-title class="text-h6"> {{ $t('ProjectDetailPageChildTitle') }} </q-toolbar-title>
                <q-btn color="primary" :label="$t('ProjectDetailPageCreateChildProject')" icon="folder"
                    @click="openNewProject = true" />
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>{{ $t('ProjectPageListTableName') }}</td>
                            <td>{{ $t('ProjectPageListTableCreater') }}</td>
                            <td>{{ $t('ProjectPageListTableCreateTime') }}</td>
                            <td>{{ $t('ProjectPageListTableSampleCount') }}</td>
                            <td>{{ $t('ProjectPageListTableTaskCount') }}</td>
                            <td>{{ $t('Action') }}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataItems" :key="item">
                            <td>
                                {{ item.name }}
                            </td>
                            <td>{{ item.owner }}</td>
                            <td>{{ toLocalString(item.create_time) }}</td>
                            <td>{{ item.samples.length }}</td>
                            <td>{{ item.task_count }}</td>
                            <td class="q-gutter-x-sm">
                                <q-btn color="info" :label="$t('Detail')" icon="arrow_outward" @click="gotoChild(item)"
                                    size="sm" />
                                <q-btn color="primary" :label="$t('Edit')" icon="edit" @click="
                    updateProjectName = item.name;
                currentProject = item;
                openEditProject = true;
                " size="sm" />
                                <q-btn color="red" :label="$t('Delete')" icon="delete" @click="confirm(item)"
                                    size="sm" />
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
                <q-toolbar-title>{{ $t('ProjectPageListSearchNewBtn') }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input v-model="newProjectName" :label="$t('ProjectPageListTableName')" />
                        </q-section>
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
                            <q-btn :label="$t('Cancel')" v-close-popup />
                            <q-btn color="primary" :label="$t('Confirm')" @click="createProject()" />
                        </q-section>
                    </q-item>
                </q-list>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="openEditProject" persistent>
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>{{ $t('ProjectDetailPageEditProjectTitle') }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input v-model="updateProjectName" :label="$t('ProjectPageListTableName')" />
                        </q-section>
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
                            <q-btn :label="$t('Cancel')" v-close-popup />
                            <q-btn color="primary" :label="$t('Confirm')" @click="updateProject()" />
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
import { useI18n } from "vue-i18n";
import { toLocalString } from "src/utils/time";
const { t } = useI18n();
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
        newProjectNameError.value = t('ProjectPageListTableName') + t('Required');
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
        updateProjectNameError.value = t('ProjectPageListTableName') + t('Required');
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
        title: t('Confirm'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/project/${project.id}`, (_) => {
            infoMessage(t('Success'));
            refreshPage();
        });
    });
};
</script>

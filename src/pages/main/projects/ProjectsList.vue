<template>
    <q-card>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="folder" />
                <q-toolbar-title class="text-h6">
                    {{$t("ProjectPageListSearchTitle")}}
                </q-toolbar-title>
                <q-input
                    style="width: 250px"
                    dense
                    v-model="search"
                    :label="$t('ProjectPageListSearchInput')"
                    clearable
                    @clear="refreshPage()"
                />
                <q-btn color="primary" icon="search" @click="refreshPage()"></q-btn>
                <q-btn
                    color="primary"
                    :label="$t('ProjectPageListSearchNewBtn')"
                    icon="folder"
                    @click="openNewProject = true"
                />
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>{{$t('ProjectPageListTableName')}}</td>
                            <td>{{$t('ProjectPageListTableCreater')}}</td>
                            <td>{{$t('ProjectPageListTableCreateTime')}}</td>
                            <td>{{$t('ProjectPageListTableSampleCount')}}</td>
                            <td>{{$t('ProjectPageListTableTaskCount')}}</td>
                            <td>{{$t('Action')}}</td>
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
                                    :label="$t('Detail')"
                                    icon="arrow_outward"
                                    @click="gotoChild(item)"
                                    size="sm"
                                />
                                <q-btn
                                    color="primary"
                                    :label="$t('Edit')"
                                    icon="edit"
                                    @click=" updateProjectName =
                                item.name; currentProject = item; openEditProject = true; "
                                    size="sm"
                                />
                                <q-btn
                                    color="red"
                                    :label="$t('Delete')"
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
                    <PaginatorVue :total="total" :currentPage="currentPage" @pageChange="pageChange($event)" />
                </div>
            </div>
        </q-section>
        <q-section class="q-pd-md"> </q-section>
    </q-card>
    <q-dialog v-model="openNewProject" persistent>
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>{{$t('ProjectPageListSearchNewBtn')}}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-separator></q-separator>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input v-model="newProjectName" :label="$t('ProjectPageListSearchInput')"
                        /></q-section>
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
                <q-toolbar-title>{{$t('ProjectPageListEditProject')}}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input v-model="updateProjectName" :label="$t('ProjectPageListSearchInput')"
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
import { useRouter } from "vue-router";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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
    loadBackup()
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
        newProjectNameError.value = t('ProjectPageListEditProjectNameRequired');
        return;
    }
    apiPost(
        "/project",
        (_) => {
            newProjectNameError.value = "";
            newProjectName.value = "";
            openNewProject.value = false;
            infoMessage(t('Success'));
            refreshPage();
        },
        { name: newProjectName.value }
    );
};
const updateProject = () => {
    updateProjectName.value = updateProjectName.value.trim();
    if (!updateProjectName.value) {
        updateProjectNameError.value = t('ProjectPageListEditProjectNameRequired');
        return;
    }
    apiPut(
        `/project/${currentProject.value.id}`,
        (_) => {
            openEditProject.value = false;
            updateProjectNameError.value = "";
            infoMessage(t('Success'));
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
    backupSearch()
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
const backupSearch = ()=>{
    let data ={
        page:currentPage.value,
        size:pageSize.value,
        name:search.value
    }
    sessionStorage.setItem('project-search',JSON.stringify(data))
}
const loadBackup = ()=>{
    let dataStr = sessionStorage.getItem('project-search')
    if(dataStr){
        let data = JSON.parse(dataStr)
        // currentPage.value=data.page
        pageSize.value=data.size
        search.value=data.name
    }
}

const confirm = (item) => {
    $q.dialog({
        title: t('ProjectPageListEditProjectDeleteTitle'),
        message:t('ProjectPageListEditProjectDeleteDesc'),
        cancel: true,
        persistent: true,
    }).onOk(() => {
        apiDelete(`/project/${item.id}`, (_) => {
            infoMessage(t('Success'))
            if (dataItems.value.length > 1) {
                let index = 0
                for (let i = 0; i < dataItems.value.length; i++) {
                    if (dataItems.value[i].id === item.id) {
                        index = i
                    }
                }
                total.value-=1
                dataItems.value.splice(index, 1)
            } else {
                if (currentPage.value > 1) {
                    currentPage.value = currentPage.value - 1
                }else{
                    currentPage.value = 1
                }
                refreshPage()
            }
        });
    });
};
</script>

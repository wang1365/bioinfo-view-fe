<template>
    <q-card class="q-mt-md">
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="description" />
                <q-toolbar-title class="text-h6">
                    数据

                    <span v-if="props.projectDetail.parent" class="text-body2 bg-yellow-11">继承自于上级项目</span>
                </q-toolbar-title>
                <q-btn color="primary" label="选择数据" icon="description" @click="openDataSelector = true" />
            </q-toolbar>
        </q-section>
        <q-section>
            <div class="q-pa-md bio-data-table">
                <table style="min-width: 1000px;">
                    <thead>
                        <tr>
                            <td>数据详情</td>
                            <td>文库编号</td>
                            <!--                            <td>样本识别号</td>-->
                            <td>数据识别号</td>
                            <td>送检机构</td>
                            <td>核酸类型</td>
                            <td>R1 数据名称</td>
                            <td>R2 数据名称</td>
                            <td>患者识别号</td>
                            <td>患者姓名</td>
                            <td>性别</td>
                            <td>样本识别号</td>
                            <td>采样部位</td>
                            <td>肿瘤样本</td>
                            <td>{{$t('Action')}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="hover"
                            v-for="item in dataItems"
                            v-bind:key="item.name"
                            :class="{
                                'bg-yellow-11': fromParent(item),
                            }"
                        >
                            <td>
                                {{ item.project_index }}
                            </td>
                            <td>
                                {{ item.library_number }}
                            </td>

                            <!--                            <td>-->
                            <!--                                {{ item.identifier }}-->
                            <!--                            </td>-->
                            <td>{{ item.identifier }}</td>
                            <td>{{ item.company }}</td>
                            <td>{{ item.nucleic_type }}</td>
                            <td>{{ item.fastq1_path }}</td>
                            <td>{{ item.fastq2_path }}</td>
                            <td>{{ item.patient?.identifier }}</td>
                            <td>{{ item.patient?.name }}</td>
                            <td>{{ item.patient?.gender }}</td>
                            <td>{{ item.sample_meta?.identifier }}</td>
                            <td>{{ item.sample_meta?.sample_componet }}</td>
                            <td>{{ item.sample_meta?.is_panel }}</td>

                            <td class="q-gutter-x-sm">
                                <q-btn color="secondary" :label="$t('Detail')" icon="visibility" @click="info(item)" size="sm" />
                                <q-btn
                                    color="red"
                                    :label="$t('Delete')"
                                    icon="delete"
                                    @click="confirm(item)"
                                    size="sm"
                                    v-if="!fromParent(item)"
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
    </q-card>

    <q-dialog v-model="showDataInfo">
        <DataInfo :id="infoId" />
    </q-dialog>
    <q-dialog persistent v-model="openDataSelector">
        <ProjectDetailDataSelect :projectDetail="projectDetail" @refresh="dataSelected()" />
    </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import DataInfo from "../../../data/DataInfo.vue";
import { ref, onMounted, defineProps, watch, onUpdated } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import ProjectDetailDataSelect from "./ProjectDetailDataSelect.vue";
import { useApi } from "src/api/apiBase";
import { infoMessage } from "src/utils/notify";
const emit = defineEmits(["refresh"]);
const props = defineProps({
    projectId: { type: Number, required: true },
    projectDetail: { type: Object, required: true },
});

const { apiPut, apiPost } = useApi();
const showDataInfo = ref(false);
const openDataSelector = ref(false);
const infoId = ref(0);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const $q = useQuasar();

const info = async (item) => {
    infoId.value = item.id;
    showDataInfo.value = true;
};

const dataSelected = () => {
    openDataSelector.value = false;
    emit("refresh");
};

const fromParent = (item) => {
    for(let sample of props.projectDetail.samples){
        if(sample.id===item.id) return false
    }
    return true
    //return props.projectDetail.samples.indexOf(item.id) < 0;
};
onMounted(() => {
    loadPage();
});

onUpdated(() => {
    refreshPage();
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
    let projectIds = [props.projectDetail.id];
    if (props.projectDetail.parent) {
        projectIds.push(props.projectDetail.parent.id);
    }
    apiPost(
        `/sample/samples/query?page=${currentPage.value}&size=${pageSize.value}`,
        (res) => {
            total.value = res.data.count;
            dataItems.value = [];
            for (const iterator of res.data.results) {
                dataItems.value.push(iterator);
            }
        },
        {
            project_id: {
                in: projectIds,
            },
        }
    );
};
const confirm = (item) => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        let sampleIds = [];
        for (const iterator of props.projectDetail.samples) {
            if (iterator.id != item.id) sampleIds.push(iterator.id);
        }
        apiPut(
            `/project/${props.projectDetail.id}`,
            (_) => {
                emit("refresh");
                // refreshPage();
            },
            { samples: sampleIds }
        );
    });
};
</script>

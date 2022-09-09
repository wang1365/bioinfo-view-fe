<template>
    <q-card style="width: 90vw; max-width: 90vw; max-height: 100vh">
        <div
            class="q-px-md"
            style="display: flex; flex-direction: column; max-height: 90vh"
        >
            <div style="height: 50px">
                <q-toolbar>
                    <q-toolbar-title>选择样本</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </div>
            <q-separator></q-separator>
            <div
                class="q-py-sm"
                style="height: 70px; min-height: 70px; overflow-y: scroll"
            >
                <div class="row q-gutter-sm">
                    <q-input
                        style="width: 250px"
                        dense
                        v-model="text"
                        label="index 类型"
                    />
                    <q-input
                        style="width: 250px"
                        dense
                        v-model="text"
                        label="送检机构"
                    />
                    <q-btn color="primary" icon="search"></q-btn>
                </div>
            </div>
            <q-separator></q-separator>
            <div
                style="flex: 1 1 auto; overflow-y: scroll; overflow-x: hidden"
                class="q-py-sm bio-data-table"
            >
                <table>
                    <thead
                        style="
                            background-color: white;
                            position: sticky;
                            top: 0;
                            z-index: 1;
                        "
                    >
                        <tr>
                            <td class="text-center">
                                <q-checkbox
                                    :model-value="checkAll"
                                    color="primary"
                                    @update:model-value="checkedAll($event)"
                                />
                            </td>
                            <!-- <td>项目编码</td> -->
                            <td>文库编号</td>
                            <!-- <td>捕获试剂盒</td>
                            <td>核酸打断方式</td>
                            <td>建库input</td>
                            <td>index 类型</td>
                            <td>index 编号</td>
                            <td>杂交 input</td>
                            <td>风险上机</td>
                            <td>核酸降解等级</td> -->
                            <!-- <td>样本元信息 ID</td> -->
                            <!-- <td>样本识别号</td> -->
                            <td>数据识别号</td>
                            <td>送检机构</td>
                            <td>核酸类型</td>
                            <td>R1 数据名称</td>
                            <td>R2 数据名称</td>
                            <!-- <td>样本所有者</td>
                            <td>创建时间</td>
                            <td>更新时间</td> -->
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="dataItems.length == 0">
                            <td class="text-center" colspan="8">无数据...</td>
                        </tr>
                        <tr
                            style="
                                position: sticky;
                                top: 0;
                                background-color: white;
                            "
                            class="hover"
                            v-for="item in dataItems"
                            v-bind:key="item.name"
                        >
                            <td class="text-center">
                                <q-checkbox
                                    v-model="item.selected"
                                    color="primary"
                                />
                            </td>

                            <!-- <td> {{ item.project_index }}</td> -->
                            <td>
                                {{ item.library_number }}
                            </td>
                            <!-- <td >{{ item.reagent_box }}</td>
                            <td >
                                {{ item.nucleic_break_type }}
                            </td>
                            <td >
                                {{ item.library_input }}
                            </td>
                            <td >{{ item.index_type }}</td>
                            <td >{{ item.index_number }}</td>
                            <td >{{ item.hybrid_input }}</td>
                            <td >{{ item.risk }}</td>
                            <td >
                                {{ item.nucleic_level }}
                            </td> -->
                            <!-- <td>
                                {{ item.sample_meta_id }}
                            </td>
                            <td>
                                {{ item.sample_identifier }}
                            </td> -->
                            <td>{{ item.identifier }}</td>
                            <td>{{ item.company }}</td>
                            <td>{{ item.nucleic_type }}</td>
                            <td>{{ item.fastq1_path }}</td>
                            <td>{{ item.fastq2_path }}</td>
                            <!-- <td>{{ item.user_id }}</td>
                            <td >{{ item.create_time }}</td>
                            <td >{{ item.modify_time }}</td> -->
                        </tr>
                    </tbody>
                </table>
            </div>
            <div
                class="selected"
                style="
                    height: 100px;
                    min-height: 100px;
                    overflow-y: scroll;
                    overflow-x: hidden;
                "
            >
                <div
                    class="row"
                    style="position: sticky; top: 0; background-color: white"
                >
                    <q-btn flat class="text-bold text-h6">当前选择的是:</q-btn>
                    <q-space></q-space>
                    <PaginatorVue
                        :total="total"
                        :currentPage="currentPage"
                        @pageChange="pageChange($event)"
                    />
                </div>
                <div class="q-gutter-xs">
                    <q-chip
                        v-for="item of selectedItems"
                        :key="item.id"
                        removable
                        @remove="item.selected = false"
                        color="primary"
                        text-color="white"
                    >
                        {{ item.library_number }}
                    </q-chip>
                </div>
            </div>
            <q-separator></q-separator>

            <div>
                <q-toolbar>
                    <q-toolbar-title></q-toolbar-title>
                    <q-btn class="q-mr-md" label="取消" v-close-popup />
                    <q-btn
                        color="primary"
                        label="确认"
                        @click="ensureSelect()"
                    />
                </q-toolbar>
            </div>
        </div>
    </q-card>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import { useApi } from "src/api/apiBase";
import { errorMessage, infoMessage } from "src/utils/notify";

const { apiPost, apiPut } = useApi();
const emit = defineEmits(["refresh"]);
const props = defineProps({
    projectDetail: { type: Object, required: true },
});
const checkAll = ref(false);
const showDataInfo = ref(false);
const infoId = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const checkedAll = (event) => {
    checkAll.value = event;
    if (event) {
        for (let item of dataItems.value) {
            item.selected = true;
        }
    } else {
        for (let item of dataItems.value) {
            item.selected = false;
        }
    }
};
const selectedItems = computed(() => {
    let items = [];
    for (const iterator of dataItems.value) {
        if (iterator.selected) items.push(iterator);
    }
    return items;
});

const info = async (item) => {
    infoId.value = item.id;
    showDataInfo.value = true;
};

const ensureSelect = () => {
    let selectedIds = [];
    for (const iterator of dataItems.value) {
        if (iterator.selected) selectedIds.push(iterator.id);
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
    let projectIds = [props.projectDetail.id];
    if (props.projectDetail.parent) {
        projectIds.push(props.projectDetail.parent);
    }
    apiPost(
        `/sample/samples/query/?page=${currentPage.value}&size=${pageSize.value}`,
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

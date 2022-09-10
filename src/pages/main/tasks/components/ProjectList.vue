<template>
    <q-card
        style="width: 80vw; max-width: 80vw; max-height: 90vh"
        class="q-mt-md"
    >
        <div style="display: flex; flex-direction: column; max-height: 80vh">
            <div style="height: 50px">
                <q-toolbar>
                    <q-toolbar-title>选择项目</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </div>
            <div
                style="
                    margin: 10px;
                    flex: 1 1 auto;
                    overflow-y: scroll;
                    overflow-x: hidden;
                "
                class="bio-data-table"
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
                            <td>选择</td>
                            <td>项目名称</td>
                            <td>创建人</td>
                            <td>创建时间</td>
                            <td>样本数量</td>
                            <td>任务数量</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in dataItems"
                            :key="item"
                            @click="selectItem(item)"
                        >
                            <td>
                                <q-radio
                                    v-model="selectedItem.id"
                                    :val="item.id"
                                />
                            </td>
                            <td>
                                {{ item.name }}
                            </td>
                            <td>{{ item.owner }}</td>
                            <td>{{ item.create_time }}</td>
                            <td>{{ item.samples.length }}</td>
                            <td>{{ item.task_count }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div
                class="selected"
                style="
                    height: 130px;
                    min-height: 130px;
                    overflow-y: scroll;
                    overflow-x: hidden;
                "
            >
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <PaginatorVue
                        :total="total"
                        :currentPage="currentPage"
                        @pageChange="pageChange($event)"
                    />
                </div>
                <div class="q-my-sm"></div>
                <q-separator></q-separator>
                <q-toolbar>
                    <q-toolbar-title
                        >当前选择的是: {{ selectedItem.name }}</q-toolbar-title
                    >
                    <q-btn class="q-mr-md" label="取消" v-close-popup />
                    <q-btn
                        color="primary"
                        label="确认"
                        v-if="selectedItem.id"
                        @click="itemSelected()"
                    />
                </q-toolbar>
            </div>
        </div>
    </q-card>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useApi } from "src/api/apiBase";
import PaginatorVue from "src/components/paginator/Paginator.vue";

const emit = defineEmits(["itemSelected"]);
const { apiGet } = useApi();

const selectedItem = ref({});

const selectItem = (item) => {
    selectedItem.value = item;
};
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);

const itemSelected = () => {
    emit("itemSelected", selectedItem.value);
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
    if (currentPage.value) {
        apiGet(
            `/project?page=${currentPage.value}&size=${pageSize.value}`,
            (res) => {
                total.value = res.data.count;
                dataItems.value = [];
                for (let iterator of res.data.results) {
                    iterator.checked = false;
                    dataItems.value.push(iterator);
                }
            }
        );
    }
};
</script>

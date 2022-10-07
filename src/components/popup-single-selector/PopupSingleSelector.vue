<template>
    <q-card class="q-mt-md popup-selector">
        <div class="popup-content">
            <div class="popup-content-header">
                <q-toolbar>
                    <q-toolbar-title>{{ props.title }}</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </div>
            <slot name="tableFilter"></slot>
            <div class="bio-data-table popup-content-table-container">
                <table>
                    <thead class="popup-content-table-head">
                        <tr>
                            <td>选择</td>
                            <td v-for="item of props.tableHeaders" :key="item">
                                {{ item }}
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="dataItems.length===0">
                            <td colspan="10" class="text-center">无数据</td>
                        </tr>
                        <tr class="cursor-pointer" v-for="item of dataItems" :key="item" @click="selectItem(item)">
                            <td>
                                <q-radio v-model="selectedItem.id" :val="item.id" />
                            </td>
                            <slot :row="item" name="itemRow">
                                <td v-for="field of tableRowFields" :key="field">
                                    {{ item[field] }}
                                </td>
                            </slot>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- <div class="popup-content-multi-footer">
                <div class="row popup-content-multi-footer-selected-sticky">
                    <q-btn flat class="text-bold text-h6"></q-btn>
                    <q-space></q-space>
                    <PaginatorVue
                        :total="props.total"
                        :currentPage="props.currentPage"
                        @pageChange="pageChange($event)"
                    />
                </div>
            </div> -->
            <q-separator></q-separator>
            <div>
                <q-toolbar>
                    <q-toolbar-title
                        >当前选择的是:
                        {{
                            selectedItem[props.selectedShowField]
                        }}</q-toolbar-title
                    >
                    <PaginatorVue
                        :total="props.total"
                        :currentPage="props.currentPage"
                        @pageChange="pageChange($event)"
                    />
                    <q-btn class="q-mr-md" label="取消" v-close-popup />
                    <q-btn
                        v-if="selectedItem[props.selectedShowField]"
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
import { defineProps, ref, defineEmits } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";

const selectedItem = ref({});
const selectItem = (flow) => {
    selectedItem.value = flow;
};

const props = defineProps({
    title: { require: true, type: String },
    tableHeaders: { require: true, type: Array },
    tableRowFields: { require: true, type: Array },
    dataItems: { require: true, type: Array },
    selectedShowField: { require: true, type: String },
    total: { require: true, type: Number },
    currentPage: { require: true, type: Number },
});
const emit = defineEmits("pageChange", "ensureSelect");
const pageChange = (event) => {
    // selectedItem.value = {};
    emit("pageChange", event);
};

const ensureSelect = () => {
    if (selectedItem.value[props.selectedShowField]) {
        emit("ensureSelect", selectedItem.value);
    }
};
</script>

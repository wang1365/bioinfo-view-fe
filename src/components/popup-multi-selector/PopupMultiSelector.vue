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
                            <td>
                                <q-checkbox
                                    :model-value="checkAll"
                                    color="primary"
                                    @update:model-value="checkedAll($event)"
                                />
                            </td>
                            <td v-for="item of props.tableHeaders" :key="item">
                                {{ item }}
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="cursor-pointer"
                            v-for="item of dataItems"
                            :key="item"
                            @click="item.selected = !item.selected"
                        >
                            <td>
                                <q-checkbox
                                    v-model="item.selected"
                                    color="primary"
                                />
                            </td>
                            <slot :row="item" name="itemRow">
                                <td
                                    v-for="field of tableRowFields"
                                    :key="field"
                                >
                                    {{ item[field] }}
                                </td>
                            </slot>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="popup-content-multi-footer">
                <div class="row popup-content-multi-footer-selected-sticky">
                    <q-btn flat class="text-bold text-h6">当前选择的是:</q-btn>
                    <q-space></q-space>
                    <PaginatorVue
                        :total="props.total"
                        :currentPage="props.currentPage"
                        @pageChange="pageChange($event)"
                    />
                </div>
                <div
                    class="popup-content-multi-footer-selected-container q-gutter-xs"
                >
                    <q-chip
                        v-for="item of selectedItems"
                        :key="item.id"
                        removable
                        @remove="item.selected = false"
                        color="primary"
                        text-color="white"
                    >
                        {{ item[props.selectedShowField] }}
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
import { defineProps, ref, computed, defineEmits } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";

const checkAll = ref(false);
const selectedItems = computed(() => {
    let items = [];
    for (const iterator of props.dataItems) {
        if (iterator.selected) items.push(iterator);
    }
    return items;
});
const checkedAll = (event) => {
    checkAll.value = event;
    if (event) {
        for (let item of props.dataItems) {
            item.selected = true;
        }
    } else {
        for (let item of props.dataItems) {
            item.selected = false;
        }
    }
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
    emit("pageChange", event);
};

const ensureSelect = () => {
    let selected = [];
    for (const iterator of props.dataItems) {
        if (iterator.selected) selected.push(iterator);
    }
    if (selected.length > 0) {
        emit("ensureSelect", selected);
    }
};
</script>

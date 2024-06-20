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

            <div class="bio-data-table popup-content-table-container" style="overflow: auto;">
                <table style="width: 100%;">
                    <thead class="popup-content-table-head">
                        <tr>
                            <td>
                                <q-checkbox :model-value="checkAll" color="primary"
                                    @update:model-value="checkedAll($event)" />
                            </td>
                            <td v-for="item of props.tableHeaders" :key="item">
                                {{ item }}
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!dataItems">
                            {{ $t('PopupSelectNoData') }}
                        </tr>
                        <tr class="cursor-pointer" v-for="item of dataItems" :key="item" @click="checkItem(item)">
                            <td>
                                <q-checkbox @click="checkItem(item)" :model-value="item.selected" color="primary"
                                    disable="true" />
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
            <div class="popup-content-multi-footer">
                <div class="row popup-content-multi-footer-selected-sticky">
                    <q-btn flat class="text-bold text-h6">{{ $t('PopupSelectCurrrentSelected') }}:</q-btn>
                    <q-space></q-space>
                    <PaginatorVue :total="props.total" :currentPage="props.currentPage"
                        @pageChange="pageChange($event)" />
                </div>
                <div class="popup-content-multi-footer-selected-container q-gutter-xs">
                    <q-chip v-for="item of selectedItems" :key="item.id" removable @remove="removeItem(item)"
                        color="primary" text-color="white">
                        {{ item[props.selectedShowField] }}
                    </q-chip>
                </div>
            </div>
            <q-separator></q-separator>
            <div>
                <q-toolbar>
                    <q-toolbar-title></q-toolbar-title>
                    <q-btn class="q-mr-md" :label="$t('PopupSelectCancel')" v-close-popup />
                    <q-btn color="primary" :label="$t('PopupSelectEnsure')" @click="ensureSelect()" />
                </q-toolbar>
            </div>
        </div>
    </q-card>
</template>
<script setup>
import { defineProps, ref, onUpdated, computed, defineEmits, onMounted } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";

const checkAll = ref(false);
// const selectedItems = computed(() => {
//     let items = [];
//     for (const iterator of props.dataItems) {
//         if (iterator.selected) items.push(iterator);
//     }
//     return items;
// });
const selectedItems = ref([])
onMounted(() => {
    for (const iterator of props.dataItems) {
        if (iterator.selected) {
            selectedItems.value.push(iterator)
        }
    }
    console.log(props.dataItems)
    console.log(selectedItems.value)
})
onUpdated(() => {
    for (let iterator of props.dataItems) {
        if (iterator.selected) {
            let hasIn = false;
            for (let i = 0; i < selectedItems.value.length; i++) {
                if (selectedItems.value[i].id === iterator.id) {
                    hasIn = true
                    break
                }
            }
            if (!hasIn) {
                selectedItems.value.push(iterator)
            }
        }
    }
    for (const iterator of selectedItems.value) {
        for (let item of props.dataItems) {
            if (item.id === iterator.id) {
                item.selected = true
            }
        }

    }
    console.log(props.dataItems)
    console.log(selectedItems.value)
})
const checkItem = (item) => {
    item.selected = !item.selected
    if (item.selected) {
        let hasIn = false;
        for (let i = 0; i < selectedItems.value.length; i++) {
            if (selectedItems.value[i].id === item.id) {
                hasIn = true
                break
            }
        }
        if (!hasIn) {
            selectedItems.value.push(item)
        }
    } else {
        for (let i = 0; i < selectedItems.value.length; i++) {
            if (selectedItems.value[i].id === item.id) {
                selectedItems.value.splice(i, 1)
                break
            }
        }
    }
}
const checkedAll = (event) => {
    checkAll.value = event;
    if (event) {
        for (let item of props.dataItems) {
            item.selected = true;
            let hasIn = false;
            for (let i = 0; i < selectedItems.value.length; i++) {
                if (selectedItems.value[i].id === item.id) {
                    hasIn = true
                    break
                }
            }
            if (!hasIn) {
                selectedItems.value.push(item)
            }
        }
    } else {
        for (let item of props.dataItems) {
            item.selected = false;
            for (let i = 0; i < selectedItems.value.length; i++) {
                if (selectedItems.value[i].id === item.id) {
                    selectedItems.value.splice(i, 1)
                    break
                }
            }
        }
    }
};
const removeItem = (item) => {
    item.selected = false
    for (let i = 0; i < selectedItems.value.length; i++) {
        if (selectedItems.value[i].id === item.id) {
            selectedItems.value.splice(i, 1)
            break
        }
    }
    for (let iterator of props.dataItems) {
        if (iterator.id === item.id) {
            iterator.selected = false
        }
    }
}
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
    if (selectedItems.value.length > 0) {
        emit("ensureSelect", selectedItems.value);
    }
    // let selected = [];
    // for (const iterator of props.dataItems) {
    //     if (iterator.selected) selected.push(iterator);
    // }
    // if (selected.length > 0) {
    //     emit("ensureSelect", selected);
    // }
};
</script>

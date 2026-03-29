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
                <table>
                    <thead class="popup-content-table-head">
                        <tr>
                            <td>{{ $t('PopupSelectRowCheck') }}</td>
                            <td v-for="item of props.tableHeaders" :key="item">
                                {{ item }}
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="dataItems.length === 0">
                            <td colspan="10" class="text-center">{{ $t('PopupSelectNoData') }}</td>
                        </tr>
                        <tr
                            class="cursor-pointer"
                            v-for="item of dataItems"
                            :key="item"
                            @click="tableRowSelectable(item) ? selectedItem = item: ''"
                        >
                            <td>
                                <q-radio
                                    v-model="selectedItem"
                                    :val="item"
                                    @click="selectedItem = item"
                                    v-if="tableRowSelectable(item)"
                                    keep-color
                                />
                            </td>
                            <slot :row="item" name="itemRow">
                                <td v-for="field of tableRowFields" :key="field">
                                    <span :class='tableRowSelectable(item) ? "black" : "text-grey-5"'
                                        >{{ item[field] }}
                                    </span>
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
                        >{{ $t('PopupSelectCurrrentSelected') }}:
                        {{
                            selectedItem[props.selectedShowField]
                        }}</q-toolbar-title
                    >
                    <PaginatorVue
                        :total="props.total"
                        :currentPage="props.currentPage"
                        @pageChange="pageChange($event)"
                    />
                    <AppActionButton class="q-mr-md" :label="$t('PopupSelectCancel')" v-close-popup />
                    <AppActionButton
                        v-if="selectedItem[props.selectedShowField]"
                        variant="primary"
                        :label="$t('PopupSelectEnsure')"
                        @click="ensureSelect()"
                    />
                </q-toolbar>
            </div>
        </div>
    </q-card>
</template>
<script setup>
import { ref } from "vue";
import PaginatorVue from "src/components/paginator/Paginator.vue";
import AppActionButton from 'src/components/button/AppActionButton.vue'

const selectedItem = ref({});
const selectItem = (flow) => {
    selectedItem.value = flow;
};

const props = defineProps({
    title: { require: true, type: String },
    tableHeaders: { require: true, type: Array },
    tableRowFields: { require: true, type: Array },
    tableRowSelectable: { require: true, type: Function, default: (data) => true },
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

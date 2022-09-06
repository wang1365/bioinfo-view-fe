<template>
    <!--  <div class="param-item-main param-item">-->
    <div>
        <h4>{{ title }}</h4>
        <div style="padding-left: 40px; padding-right: 40px">
            <q-table
                ref="paramTable"
                :rows="params"
                :columns="columns"
                row-key="name"
                color="primary"
                separator="vertical"
                dense
                hide-no-data
                wrap-cells
            >
                <template v-slot:top>
                    <q-btn v-if="!isInfoMode" color="primary" label="新增参数" @click="addParameter"/>
                    <q-space/>
                </template>
                <template v-slot:body-cell-key="props">
                    <q-input v-model="props.row.key"/>
                </template>
                <template v-slot:body-cell-type="props">
                    <q-input v-model="props.row.type"/>
                </template>
                <template v-slot:body-cell-required="props">
                    <q-input v-model="props.row.required"/>
                </template>
                <template v-slot:body-cell-choices="props">
                    <q-input v-model="props.row.choices"/>
                </template>
                <template v-slot:body-cell-description="props">
                    <q-input v-model="props.row.description"/>
                </template>
            </q-table>
        </div>
    </div>
</template>

<script setup>
import {defineProps, computed, defineExpose, ref} from "vue";

const props = defineProps({
    data: {
        type: Array,
        default: () => {
            return [];
        },
    },
    action: {
        type: String,
        default: "info",
    },
    title: {
        type: String,
        default: "",
    },
});

const columns = [
    {name: "id", label: "ID", align: "center", style: "width:80px", field: (row) => row.id, format: (val) => `${val}`,},
    {name: "key", label: "参数名", field: "key", align: "center"},
    {name: "type", label: "值类型", align: "center", field: "type"},
    {name: "required", label: "必填", field: "required", align: "center"},
    {name: "choices", label: "值域", align: "center", field: "choices"},
    {name: "description", label: "说明", field: "description", align: "center",},
];

const isEditMode = computed(() => {
    return props.action === "edit";
});
const isInfoMode = computed(() => {
    return props.action === "info";
});
const isCreateMode = computed(() => {
    return props.action === "create";
});

const valueTypes = ["string", "file"];
const params = ref(props.data)

const setData = (data) => {
    params.value = data;
};

defineExpose({setData})
const addParameter = () => {
    console.log("addParameter");
    // this.$set(params, params.value.length, { choices: [] });
    params.value.push({})
};
const deleteParam = (row, index) => {
    params.value.splice(index, 1);
};
const deleteChoice = (row, idx) => {
    row.choices.splice(idx, 1);
};
const addChoice = (row) => {
    row.newValue = "";
    this.$set(row, "add", true);
};
const confirmAddChoice = (row) => {
    const value = this._.get(row, "newChoice", "");
    if (value !== "") {
        if (row.choices === undefined) {
            row.choices = [];
        }
        row.choices.push(value);
    }
    this.$set(row, "add", false);
};
const resetFields = () => {
    params.value = [];
};
const joinChoices = (choices) => {
    return choices.join("; ");
};
</script>

<style lang="scss" scoped>
.param-item {
    margin-bottom: 5px;
}

//span {
//  margin-left: 20px;
//  margin-right: 5px;
//}
</style>

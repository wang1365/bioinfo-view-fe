<template>
    <!--  <div class="param-item-main param-item">-->
    <div>
        <div v-if="!isInfoMode" style="float: right">
            <q-btn
                size="small"
                icon="el-icon-plus"
                type="primary"
                @click="addParameter"
                >新增参数</q-btn
            >
        </div>
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
            </q-table>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
defineProps({
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
    {
        name: "id",
        label: "ID",
        align: "center",
        style: "width:80px",
        field: (row) => row.id,
        format: (val) => `${val}`,
    },
    { name: "key", label: "参数名", field: "key", align: "center" },
    { name: "type", label: "值类型", align: "center", field: "type" },
    { name: "required", label: "必填", field: "required", align: "center" },
    { name: "choices", label: "值域", align: "center", field: "choices" },
    {
        name: "description",
        label: "说明",
        field: "description",
        align: "center",
    },
];

const isEditMode = computed(() => {
    return this.action === "edit";
});
const isInfoMode = computed(() => {
    return this.action === "info";
});
const isCreateMode = computed(() => {
    return this.action === "create";
});

const valueTypes = ["string", "file"];
const params = this.data;

const setData = (data) => {
    params.vaue = data;
};
const addParameter = () => {
    console.log("addParameter");
    this.$set(this.params, this.params.length, { choices: [] });
    // this.params.push({})
};
const deleteParam = (row, index) => {
    this.params.splice(index, 1);
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
    this.params = [];
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

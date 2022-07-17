<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="任务管理" />
        <div class="row">
            <div class="col-2"></div>
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div class="row">
                    <div class="col-2">
                        <q-select
                            v-model="database"
                            :options="options"
                            stack-label
                            :display-value="`状态: ${
                                database ? database : '*none*'
                            }`"
                        >
                        </q-select>
                    </div>
                    <div class="col-10">
                        <q-input v-model="text" label="输入文本: 回车查询">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </div>
                </div>
            </div>
            <div class="col-2"></div>
        </div>
        <q-table :rows="data" :columns="columns" row-key="name">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="name" :props="props">
                        {{ props.row.name }}
                    </q-td>
                    <q-td key="calories" :props="props">
                        <q-badge color="green">
                            {{ props.row.calories }}
                        </q-badge>
                    </q-td>
                    <q-td key="fat" :props="props">
                        <q-badge color="purple">
                            {{ props.row.fat }}
                        </q-badge>
                    </q-td>
                    <q-td key="carbs" :props="props">
                        <q-badge color="orange">
                            {{ props.row.carbs }}
                        </q-badge>
                    </q-td>
                    <q-td key="protein" :props="props">
                        <q-badge color="primary">
                            {{ props.row.protein }}
                        </q-badge>
                    </q-td>
                    <q-td key="sodium" :props="props">
                        <q-badge color="teal">
                            {{ props.row.sodium }}
                        </q-badge>
                    </q-td>
                    <q-td key="calcium" :props="props">
                        <q-badge color="accent">
                            {{ props.row.calcium }}
                        </q-badge>
                    </q-td>
                    <q-td key="iron" :props="props">
                        <q-badge color="amber">
                            {{ props.row.iron }}
                        </q-badge>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref } from "vue";
const options = ref(["全部", "运行中", "排队", "失败", "完成"]);
const database = ref("全部");
const shape = ref("hg19");

const columns = ref([
    {
        name: "name",
        required: true,
        label: "任务编号",
        align: "left",
        field: (row) => row.name,
        format: (val) => `${val}`,
    },
    {
        name: "calories",
        align: "center",
        label: "日期",
        field: "calories",
    },
    { name: "fat", label: "样本名", field: "fat" },
    { name: "carbs", label: "流程", field: "carbs" },
    { name: "protein", label: "流程参数", field: "protein" },
    { name: "sodium", label: "分析进度", field: "sodium" },
    {
        name: "calcium",
        label: "报告",
        field: "calcium",
    },
]);
const data = ref([
    {
        name: "Frozen Yogurt",
        calories: 159,
        fat: 6.0,
        carbs: 24,
        protein: 4.0,
        sodium: 87,
        calcium: "14%",
        iron: "1%",
    },
    {
        name: "Ice cream sandwich",
        calories: 237,
        fat: 9.0,
        carbs: 37,
        protein: 4.3,
        sodium: 129,
        calcium: "8%",
        iron: "1%",
    },
    {
        name: "Eclair",
        calories: 262,
        fat: 16.0,
        carbs: 23,
        protein: 6.0,
        sodium: 337,
        calcium: "6%",
        iron: "7%",
    },
    {
        name: "Cupcake",
        calories: 305,
        fat: 3.7,
        carbs: 67,
        protein: 4.3,
        sodium: 413,
        calcium: "3%",
        iron: "8%",
    },
    {
        name: "Gingerbread",
        calories: 356,
        fat: 16.0,
        carbs: 49,
        protein: 3.9,
        sodium: 327,
        calcium: "7%",
        iron: "16%",
    },
    {
        name: "Jelly bean",
        calories: 375,
        fat: 0.0,
        carbs: 94,
        protein: 0.0,
        sodium: 50,
        calcium: "0%",
        iron: "0%",
    },
    {
        name: "Lollipop",
        calories: 392,
        fat: 0.2,
        carbs: 98,
        protein: 0,
        sodium: 38,
        calcium: "0%",
        iron: "2%",
    },
    {
        name: "Honeycomb",
        calories: 408,
        fat: 3.2,
        carbs: 87,
        protein: 6.5,
        sodium: 562,
        calcium: "0%",
        iron: "45%",
    },
    {
        name: "Donut",
        calories: 452,
        fat: 25.0,
        carbs: 51,
        protein: 4.9,
        sodium: 326,
        calcium: "2%",
        iron: "22%",
    },
    {
        name: "KitKat",
        calories: 518,
        fat: 26.0,
        carbs: 65,
        protein: 7,
        sodium: 54,
        calcium: "12%",
        iron: "6%",
    },
]);
</script>

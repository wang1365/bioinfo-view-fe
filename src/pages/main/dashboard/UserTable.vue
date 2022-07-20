<template>
    <q-table
        class="my-sticky-header-column-table"
        title="用户情况"
        :rows="rows"
        :columns="columns"
        row-key="name"
    />

</template>

<script setup>
import { ref } from "vue";
const columns = ref([
    {
        name: "name",
        required: true,
        label: "用户名",
        align: "left",
        field: (row) => row.name,
        format: (val) => `${val}`,
    },
    {
        name: "regist",
        align: "center",
        label: "注册时间",
        field: "regist",
    },
    { name: "lastLogin", label: "最近登录时间", field: "lastLogin" },
    { name: "carbs", label: "样本数", field: "carbs" },
    { name: "protein", label: "磁盘使用", field: "protein" },
    { name: "sodium", label: "运行中的任务", field: "sodium" },
]);

const rows = ref([
    {
        name: "张三",
        regist: "2022-07-01 12:22:00",
        lastLogin: "2022-07-02 12:22:00",
        carbs: 24,
        protein: 4.0,
        sodium: 87,
        calcium: "14%",
        iron: "1%",
    },
    {
        name: "李四",
        regist: "2022-07-01 12:22:00",
        lastLogin: "2022-07-02 12:22:00",
        carbs: 37,
        protein: 4.3,
        sodium: 129,
        calcium: "8%",
        iron: "1%",
    },
    {
        name: "王五",
        regist: "2022-07-01 12:22:00",
        lastLogin: "2022-07-02 12:22:00",
        carbs: 23,
        protein: 6.0,
        sodium: 337,
        calcium: "6%",
        iron: "7%",
    },
    {
        name: "赵六",
        regist: "2022-07-01 12:22:00",
        lastLogin: "2022-07-02 12:22:00",
        carbs: 67,
        protein: 4.3,
        sodium: 413,
        calcium: "3%",
        iron: "8%",
    },
]);
</script>

<style lang="scss">
.my-sticky-header-column-table {
    /* height or max-height is important */
    height: 300px;

    /* specifying max-width so the example can
    highlight the sticky column on any browser window */
    width: 100%;
    td:first-child {
        background-color: silver !important;
        z-index: 10;
    }
    tr th {
        position: sticky;
        /* higher than z-index for td below */
        z-index: 2;
        /* bg color is important; just specify one */
        background: #fff;
    }
    /* this will be the loading indicator */
    thead tr:last-child th {
        /* height of all previous header rows */
        top: 48px;
        /* highest z-index */
        z-index: 3;
    }
    thead tr:first-child th {
        top: 0;
        z-index: 1;
    }
    tr:first-child th:first-child {
        /* highest z-index */
        z-index: 3;
    }
    td:first-child {
        z-index: 1;
    }

    td:first-child,
    th:first-child {
        position: sticky;
        left: 0;
    }
}
</style>

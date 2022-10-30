<template>
    <div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-input dense label="基因搜索:" clearable />
            </div>
            <div class="col">
                <q-input dense label="深度 >" clearable type="number" />
            </div>
            <div class="col">
                <q-input dense label="频率 >" clearable type="number" />
            </div>
            <div class="col">
                <q-input dense label="人群频率 <" clearable type="number" />
            </div>
        </div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-select clearable dense :options='["选项 1", "选项 2", "选项 3"]' label="突变类型" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["选项 1", "选项 2", "选项 3"]' label="突变位置" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["选项 1", "选项 2", "选项 3"]' label="突变意义" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["选项 1", "选项 2", "选项 3"]' label="突变危险" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["选项 1", "选项 2", "选项 3"]' label="SIFT_p" />
            </div>
        </div>
        <div class="q-gutter-md text-center q-py-sm">
            <q-btn color="primary" label="确定" icon="search" @click="refreshPage()" />
            <q-btn color="grey" label="清除" icon="delete" @click="refreshPage()" />
        </div>
    </div>
    <div class="bio-data-table q-py-sm">
        <table>
            <thead>
                <tr>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                    <td>数据</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="q-py-sm">
        过滤结果的图表数据
    </div>
    <div class="q-py-sm">
        特定行图表数据
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
</script>
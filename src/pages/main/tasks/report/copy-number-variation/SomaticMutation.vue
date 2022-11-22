<template>
    <div>
        <div class="row q-gutter-sm ">
            <div class="col">
                <q-input dense label="搜索:" clearable />
            </div>
            <div class="col">
                <q-select clearable dense :options='["All", "Yes", "No",]' label="药物靶点" />
            </div>
            <div class="col">
                <q-select clearable dense :options='["A", "B", "C", "D", "E"]' label="突变位置" />
            </div>
        </div>
        <div class="q-gutter-md text-center q-py-sm">
            <q-btn color="primary" label="确定" icon="search" @click="refreshPage()" />
            <q-btn color="grey" label="清除" icon="delete" @click="refreshPage()" />
        </div>
    </div>

    <div class="q-py-sm">过滤结果的图表数据</div>
</template>
<script setup>
import { ref, onMounted } from "vue";
</script>

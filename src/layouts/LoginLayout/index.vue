<template>
    <q-layout style="overflow-x: hidden">
        <q-page-container>
            <indexSimple></indexSimple>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import indexSimple from "./indexSimple.vue";

onBeforeMount(() => {
    console.info("欢迎使用纳昂达可视化解读!");
    console.info("项目地址: https://github.com/Junvary/gin-quasar-admin ");
    console.info("欢迎交流, 感谢Star!");
});
</script>

<style lang="scss" scoped></style>

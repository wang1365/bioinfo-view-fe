<template>
    <q-layout style="overflow-x: hidden">
        <q-page-container>
            <indexSimple></indexSimple>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { onBeforeMount, ref, onMounted} from "vue";
import indexSimple from "./indexSimple.vue";
import { refreshSystemUi } from 'src/api/ui'
import { globalStore } from 'src/stores/global'

const store = globalStore()

onBeforeMount(() => {
    console.info("欢迎使用纳昂达可视化解读!");
    console.info("项目地址: https://github.com/Junvary/gin-quasar-admin ");
    console.info("欢迎交流, 感谢Star!");
});

onMounted(() => {
    refreshSystemUi()
})
</script>

<style lang="scss" scoped></style>

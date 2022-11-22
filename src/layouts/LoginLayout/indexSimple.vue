<template>
    <div class="row gin-quasar-admin-init-db-page">
        <div class="col column justify-center items-center text-center" style="margin-bottom: 100px">
            <q-avatar :size="'100px'" @click="home">
                <img :src="store.ui.image" alt="" />
            </q-avatar>
            <br />
            <span class="text-weight-bold text-h3 text-white">
                {{ store.ui.title }}
            </span>
            <span class="text-white text-subtitle1" style="margin-top: 20px"> 一站式解决基因文库分析结果. </span>
            <span class="q-gutter-md">
                <!-- <q-btn
                    push
                    glossy
                    color="primary"
                    @click="openLink('http://www.njnad.com/')"
                >
                    官网
                </q-btn> -->
                <!-- <q-btn push glossy color="primary">
                    {{ $t("Version") }}{{ $t("Info") }}
                </q-btn>
                <q-btn
                    push
                    glossy
                    color="primary"
                    @click="openLink('http://www.njnad.com/')"
                >
                    纳昂达
                </q-btn> -->
            </span>
        </div>
        <div class="col row column justify-center items-center" style="margin-bottom: 80px">
            <q-card
                style="
                    width: 60%;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 10px;
                "
            >
                <LoginForm />
            </q-card>
        </div>
    </div>
</template>

<script setup>
import { globalStore } from "src/stores/global";
import { useRouter } from "vue-router";
import LoginForm from "./LoginForm.vue";
const router = useRouter();
const store = globalStore();
const openLink = (link) => {
    window.open(link, "_blank");
};
const home = () => {
    router.push("/");
};
</script>

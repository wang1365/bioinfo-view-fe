<template>
    <q-layout view="hHh LpR fFf">
        <q-header reveal elevated class="bg-primary text-white">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <img
                            src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg"
                        />
                    </q-avatar>
                    纳昂达可视化解读
                </q-toolbar-title>
                <q-btn dense flat @click="login">
                    <q-icon name="person_pin" />
                    &nbsp;&nbsp;&nbsp;&nbsp; 登录
                </q-btn>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const router = useRouter();
const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}
function showProfile() {
    router.push("/profile");
}
function login() {
    router.push("/login");
}
</script>

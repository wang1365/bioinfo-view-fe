<template>
    <q-layout view="hHh LpR fFf">
        <q-header reveal elevated>
            <q-toolbar>
                <q-toolbar-title> 纳昂达可视化解读 </q-toolbar-title>
                <q-btn dense flat>
                    <q-icon name="person_pin" />
                    &nbsp;&nbsp;&nbsp;&nbsp;管理员
                    <q-menu class="row items-center justify-around q-pa-md">
                        <div class="column">
                            <div class="text-h6">摘要</div>
                            <q-list>
                                <q-item clickable>
                                    <q-item-section avatar>
                                        <q-icon
                                            size="lg"
                                            name="star"
                                            class="text-warning"
                                        />
                                    </q-item-section>
                                    <q-item-section>等级:23</q-item-section>
                                </q-item>
                                <q-item clickable>
                                    <q-item-section avatar>
                                        <q-icon
                                            size="lg"
                                            name="star"
                                            class="text-warning"
                                        />
                                    </q-item-section>
                                    <q-item-section>积分:88888</q-item-section>
                                </q-item>
                                <q-item clickable>
                                    <q-item-section avatar>
                                        <q-icon
                                            size="lg"
                                            name="star"
                                            class="text-warning"
                                        />
                                    </q-item-section>
                                    <q-item-section>成就:888</q-item-section>
                                </q-item>
                            </q-list>
                        </div>

                        <q-separator vertical inset class="q-mx-lg" />

                        <div class="column items-center">
                            <q-icon></q-icon>
                            <div class="text-subtitle1 q-mt-md q-mb-md">
                                管理员
                            </div>

                            <div class="row q-gutter-md">
                                <q-btn
                                    icon="person_pin"
                                    color="primary"
                                    :label="$t('个人中心')"
                                    push
                                    size="sm"
                                    v-close-popup
                                    @click="showProfile"
                                />
                                <q-btn
                                    icon="logout"
                                    color="primary"
                                    :label="$t('退出')"
                                    push
                                    size="sm"
                                    v-close-popup
                                    @click="logout"
                                />
                            </div>
                        </div>
                    </q-menu>
                </q-btn>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            side="left"
            overlay
            behavior="desktop"
            elevated
        >
            <!-- drawer content -->
        </q-drawer>

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
function logout() {
    router.push("/login");
}
</script>

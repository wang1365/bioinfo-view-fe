<template>
    <q-layout view="hHh lpR lFf">
        <!--        <q-header reveal elevated class="bg-primary text-white header_normal">-->
        <q-header reveal elevated class="header_normal">
            <q-toolbar>
                <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

                <q-toolbar-title shrink class="text-bold text-italic cursor-pointer" style="padding: 0 5px">
                    <q-avatar @click="router.push('/')">
                        <img :src="store.ui.image" style="width: 30px; height: 25px" />
                    </q-avatar>
                    {{ store.ui.title }}
                </q-toolbar-title>
                <q-space />
                <div class="q-gutter-sm row items-center no-wrap">
                    <SelectLanguage dark v-if="store.langConfig.langSwitch" />
                    <Fullscreen />
                    <q-btn dense flat>
                        <q-icon name="person_pin" />
                        &nbsp;&nbsp;&nbsp;&nbsp;{{store.currentUser?.nickname}}
                        <q-menu class="row items-center justify-around q-pa-md">
                            <div class="column">
                                <div class="text-h6">{{$t('UserDetail')}}</div>
                                <q-list>
                                    <q-item clickable>
                                        <q-item-section avatar>
                                            <q-icon size="lg" name="star" class="text-warning" />
                                        </q-item-section>
                                        <q-item-section>
                                            {{ $t('Username') + ": " + store.currentUser?.username }}
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable>
                                        <q-item-section avatar>
                                            <q-icon size="lg" name="star" class="text-warning" />
                                        </q-item-section>
                                        <q-item-section
                                            >{{ $t('Nickname')  + ": " + store.currentUser?.nickname  }}</q-item-section
                                        >
                                    </q-item>
                                    <q-item clickable>
                                        <q-item-section avatar>
                                            <q-icon size="lg" name="star" class="text-warning" />
                                        </q-item-section>
                                        <q-item-section>{{ $t('Role') + ': ' + getRole() }}</q-item-section>
                                    </q-item>
                                </q-list>
                            </div>

                            <!--                            <q-separator vertical inset class="q-mx-lg" />-->

                            <div class="column items-center">
                                <q-icon></q-icon>
                                <!--                                <div class="text-subtitle1 q-mt-md q-mb-md">管理员</div>-->

                                <div class="row q-gutter-md">
                                    <q-btn
                                        icon="person_pin"
                                        color="primary"
                                        :label="$t('UserProfile')"
                                        push
                                        size="sm"
                                        v-close-popup
                                        @click="showProfile"
                                    />
                                    <q-btn
                                        icon="logout"
                                        color="primary"
                                        :label="$t('Logout')"
                                        push
                                        size="sm"
                                        v-close-popup
                                        @click="logout"
                                    />
                                </div>
                            </div>
                        </q-menu>
                    </q-btn>
                </div>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            side="left"
            class="left-navigation text-white"
            show-if-above
            style="background-image: url('images/lake.jpg') !important"
            elevated
            width="225"
        >
            <div class="full-height drawer_normal">
                <q-scroll-area class="fit">
                    <q-list>
                        <template v-for="(item, index) in menuList" :key="index">
                            <SideBarLeftItem :addRoutesItem="item" :initLevel="0" />
                        </template>
                        <!--                        <template-->
                        <!--                            v-for="(menuItem, index) in menuList"-->
                        <!--                            :key="index"-->
                        <!--                        >-->
                        <!--                            <q-item clickable v-ripple :to="menuItem.path">-->
                        <!--                                <q-item-section avatar>-->
                        <!--                                    <q-icon :name="menuItem.icon" />-->
                        <!--                                </q-item-section>-->
                        <!--                                <q-item-section>-->
                        <!--                                    {{ menuItem.label }}-->
                        <!--                                </q-item-section>-->
                        <!--                            </q-item>-->
                        <!--                            <q-separator-->
                        <!--                                :key="'sep' + index"-->
                        <!--                                v-if="menuItem.separator"-->
                        <!--                            />-->
                        <!--                        </template>-->
                    </q-list>
                </q-scroll-area>
                <!-- drawer content -->
            </div>
        </q-drawer>

        <q-page-container>
            <div style="height:calc(100vh - 50px);overflow-y: scroll;">
                <router-view />
            </div>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import Fullscreen from "./Fullscreen.vue"
import SideBarLeftItem from "./SideBarLeft/SideBarLeftItem.vue"
import { onBeforeMount, ref } from "vue"
import { useRouter } from "vue-router"
import { globalStore } from "src/stores/global"
import { getAuthMenu } from './menu'
import SelectLanguage from "components/SelectLanguage.vue"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = globalStore();
const menuList = getAuthMenu(store.currentUser)

const router = useRouter();
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}

function showProfile() {
    router.push("/main/profile");
}

function logout() {
    store.$reset()
    router.push("/login");
}

const getRole = () => {
    const roles = store.currentUser?.role_list || []
    if (roles.includes('super')) {
        return t('SuperAdmin')
    }

    if (roles.includes('admin')) {
        return t('Admin')
    }

    return t('NormalUser')
}
onBeforeMount(() => {
    //    console.log(store.currentUser);
});
</script>

<style lang="scss" scoped>

.q-field__input {
    color: white !important;
}
.q-drawer {
    /*background-image: url(https://demos.creative-tim.com/vue-material-dashboard/img/sidebar-2.32103624.jpg) !important;*/
    background-image: url("/images/lake.jpg") !important;
    background-size: cover !important;
}

.drawer_normal {
    background-color: rgba(1, 1, 1, 0.75);
}

.drawer_dark {
    background-color: #010101f2;
}

.navigation-item {
    border-radius: 5px;
}

.tab-active {
    background-color: green;
}

body {
    background: #f1f1f1 !important;
}

.header_normal {
    background: linear-gradient(
        145deg,
        rgb(21, 57, 102) 70%,
        rgb(32, 106, 80) 15%
    );
}

.header_dark {
    background: linear-gradient(
        145deg,
        rgb(61, 14, 42) 15%,
        rgb(14, 43, 78) 70%
    );
}
</style>

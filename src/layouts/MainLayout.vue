<template>
    <q-layout view="hHh Lpr lff">
        <!--        <q-header reveal elevated class="bg-primary text-white header_normal">-->
        <q-header reveal elevated class="header_normal">
            <q-toolbar class="main-toolbar">
                <q-btn dense flat round icon="menu" class="toolbar-icon-btn" @click="toggleLeftDrawer" />

                <q-toolbar-title shrink class="toolbar-brand cursor-pointer" @click="router.push('/')">
                    <q-avatar class="toolbar-brand__avatar">
                        <img :src="store.ui.image" alt="logo" />
                    </q-avatar>
                    <div class="toolbar-brand__content">
                        <div class="toolbar-brand__title">{{ store.ui.title }}</div>
                    </div>
                </q-toolbar-title>
                <q-space />
                <div class="toolbar-actions row items-center no-wrap">
                    <SelectLanguage dark v-if="store.langConfig.langSwitch" />
                    <Fullscreen />
                    <q-btn dense flat no-caps class="user-entry">
                        <q-icon name="person_pin" size="20px" />
                        <div class="user-entry__meta gt-xs">
                            <div class="user-entry__name">{{ store.currentUser?.nickname }}</div>
                            <div class="user-entry__role">{{ getRole() }}</div>
                        </div>
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
            elevated
            :width="208"
        >
            <div class="full-height drawer_normal">
                <q-scroll-area class="fit">
                    <q-list class="sidebar-list">
                        <template v-for="(item, index) in menuList" :key="index">
                            <SideBarLeftItem :addRoutesItem="item" :initLevel="0" />
                        </template>
                    </q-list>
                </q-scroll-area>
            </div>
        </q-drawer>

        <q-page-container class="main-page-container">
            <div class="main-page-host">
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
.q-layout {
    min-height: 100vh;
}

.q-page-container,
.main-page-container {
    height: 100vh;
    overflow: hidden;
}

.main-page-host {
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.main-page-host :deep(.q-page) {
    min-height: 100%;
}

.q-field__input {
    color: white !important;
}

.drawer_normal {
    background: linear-gradient(180deg, #18222c 0%, #131c24 100%);
    border-right: 1px solid rgba(148, 163, 184, 0.14);
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


.header_normal {
    backdrop-filter: blur(14px);
    background:
        linear-gradient(120deg, rgba(21, 57, 102, 0.96) 0%, rgba(24, 74, 126, 0.94) 58%, rgba(31, 123, 92, 0.92) 100%);
    box-shadow: 0 12px 30px rgba(10, 25, 41, 0.22);
}

.header_dark {
    background: linear-gradient(
        145deg,
        rgb(61, 14, 42) 15%,
        rgb(14, 43, 78) 70%
    );
}

.sidebar-list {
    padding: 10px 10px 18px;
}

.left-navigation :deep(.q-scrollarea__content) {
    min-height: 100%;
}

.main-toolbar {
    min-height: 56px;
    padding: 0 12px 0 10px;
    gap: 8px;
}

.toolbar-icon-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
}

.toolbar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 0 6px;
}

.toolbar-brand__avatar {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 6px 14px rgba(8, 20, 34, 0.2);
    background: rgba(255, 255, 255, 0.14);
}

.toolbar-brand__avatar img {
    width: 24px;
    height: 20px;
    object-fit: contain;
}

.toolbar-brand__content {
    min-width: 0;
}

.toolbar-brand__title {
    font-size: 0.96rem;
    font-weight: 700;
    font-style: italic;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.toolbar-actions {
    gap: 6px;
}

.user-entry {
    gap: 10px;
    padding: 4px 8px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
}

.user-entry__meta {
    text-align: left;
    line-height: 1.15;
}

.user-entry__name {
    font-size: 0.9rem;
    font-weight: 600;
}

.user-entry__role {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 900px) {
    .main-toolbar {
        min-height: 52px;
    }

}
</style>

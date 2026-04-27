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
                    <div
                        class="ai-bio-btn"
                        @click="aiChatOpen = !aiChatOpen"
                        :class="{ 'ai-bio-btn--active': aiChatOpen }"
                    >
                        <!-- 旋转渐变背景 -->
                        <span class="ai-bio-btn__glow"></span>
                        <!-- 轨道粒子 -->
                        <span class="ai-bio-btn__orbit"></span>
                        <span class="ai-bio-btn__dot ai-bio-btn__dot--1"></span>
                        <span class="ai-bio-btn__dot ai-bio-btn__dot--2"></span>
                        <span class="ai-bio-btn__dot ai-bio-btn__dot--3"></span>
                        <!-- 图标 -->
                        <q-icon name="smart_toy" class="ai-bio-btn__icon" />
                        <q-tooltip>AI 生信助手</q-tooltip>
                    </div>
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

        <AiChatDrawer v-model="aiChatOpen" />
    </q-layout>
</template>

<script setup>
import Fullscreen from "./Fullscreen.vue"
import SideBarLeftItem from "./SideBarLeft/SideBarLeftItem.vue"
import AiChatDrawer from "src/components/AiChatDrawer.vue"
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
const aiChatOpen = ref(false);

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

// ---- AI 生信助手按钮（科技感，默认常亮）----
.ai-bio-btn {
    position: relative;
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    z-index: 1;

    // 底层背景 — 默认渐变
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(57, 182, 255, 0.14), rgba(189, 69, 251, 0.10));
        border: 1px solid rgba(57, 182, 255, 0.28);
        transition: all 0.35s ease;
        z-index: -2;
    }

    &:hover::before {
        background: linear-gradient(135deg, rgba(57, 182, 255, 0.22), rgba(189, 69, 251, 0.18));
        border-color: rgba(57, 182, 255, 0.5);
    }

    // 旋转渐变光晕 — 默认常亮
    &__glow {
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        background: conic-gradient(
            from var(--angle, 0deg),
            transparent 40%,
            rgba(57, 182, 255, 0.65) 55%,
            rgba(189, 69, 251, 0.55) 70%,
            transparent 85%
        );
        opacity: 1;
        --angle: 0deg;
        animation: aiBtnSpin 2.2s linear infinite;
        z-index: -1;
    }

    &:hover &__glow {
        opacity: 1;
        animation-duration: 1.6s;
    }

    // 轨道环 — 默认常亮
    &__orbit {
        position: absolute;
        inset: 2px;
        border-radius: 50%;
        border: 1px solid transparent;
        border-top-color: rgba(57, 182, 255, 0.45);
        border-right-color: rgba(189, 69, 251, 0.28);
        opacity: 1;
        transform: scale(1);
        animation: aiBtnOrbitSpin 3.2s linear infinite reverse;
    }

    &:hover &__orbit {
        transform: scale(1.08);
        animation-duration: 2.4s;
    }

    // 轨道粒子 — 默认常亮
    &__dot {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        opacity: 1;

        &--1 {
            top: 0;
            left: 50%;
            margin-left: -1.5px;
            background: #39b6ff;
            box-shadow: 0 0 6px #39b6ff;
            animation: aiDotFloat1 2.6s ease-in-out infinite;
        }

        &--2 {
            right: 0;
            top: 50%;
            margin-top: -1.5px;
            background: #bd45fb;
            box-shadow: 0 0 6px #bd45fb;
            animation: aiDotFloat2 2.9s ease-in-out infinite;
        }

        &--3 {
            bottom: 0;
            left: 50%;
            margin-left: -1.5px;
            background: #39b6ff;
            box-shadow: 0 0 6px #39b6ff;
            animation: aiDotFloat3 2.6s ease-in-out infinite;
        }
    }

    &:hover &__dot--1 { animation-duration: 2s; }
    &:hover &__dot--2 { animation-duration: 2.2s; }
    &:hover &__dot--3 { animation-duration: 2s; }

    // 图标 — 默认脉冲发光
    &__icon {
        position: relative;
        width: 24px;
        height: 24px;
        font-size: 22px;
        color: #fff;
        filter: drop-shadow(0 0 8px rgba(57, 182, 255, 0.55));
        animation: aiIconPulse 2s ease-in-out infinite;
        transition: all 0.3s ease;
    }

    &:hover &__icon {
        filter: drop-shadow(0 0 12px rgba(57, 182, 255, 0.8));
        transform: scale(1.08) rotate(-4deg);
        animation-duration: 1.4s;
    }

    // 点击波纹
    &:active &__icon {
        transform: scale(0.9) rotate(-2deg);
    }

    // 激活状态增强
    &--active::before {
        background: linear-gradient(135deg, rgba(57, 182, 255, 0.22), rgba(189, 69, 251, 0.18));
        border-color: rgba(57, 182, 255, 0.5);
    }
}

@keyframes aiBtnSpin {
    from { --angle: 0deg; }
    to { --angle: 360deg; }
}

@property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
}

@keyframes aiBtnOrbitSpin {
    to { transform: scale(1.08) rotate(360deg); }
}

@keyframes aiDotFloat1 {
    0%, 100% { top: 0; left: 50%; opacity: 1; }
    33%      { top: 30%; left: 90%; opacity: .5; }
    66%      { top: 60%; left: 65%; opacity: .8; }
}

@keyframes aiDotFloat2 {
    0%, 100% { right: 0; top: 50%; opacity: 1; }
    33%      { right: 30%; top: 10%; opacity: .5; }
    66%      { right: 60%; top: 75%; opacity: .8; }
}

@keyframes aiDotFloat3 {
    0%, 100% { bottom: 0; left: 50%; opacity: 1; }
    33%      { bottom: 25%; left: 10%; opacity: .5; }
    66%      { bottom: 55%; left: 80%; opacity: .8; }
}

@keyframes aiIconPulse {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(57, 182, 255, 0.7)); }
    50%      { filter: drop-shadow(0 0 16px rgba(189, 69, 251, 0.6)); }
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

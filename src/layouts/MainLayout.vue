<template>
    <q-layout view="hHh lpR lFf">
<!--        <q-header reveal elevated class="bg-primary text-white header_normal">-->
        <q-header reveal elevated class="header_normal">
            <q-toolbar>
                <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

                <q-toolbar-title>
                    <q-avatar @click="router.push('/')">
                        <img
                            src="~assets/nanodi.svg"
                            style="width: 30px; height: 25px"
                        />
                    </q-avatar>
                    纳昂达可视化解读
                </q-toolbar-title>
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
                                    label="个人中心"
                                    push
                                    size="sm"
                                    v-close-popup
                                    @click="showProfile"
                                />
                                <q-btn
                                    icon="logout"
                                    color="primary"
                                    label="退出"
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
            class="left-navigation text-white"
            show-if-above
            style="background-image: url('images/lake.jpg') !important;"
            elevated
        >
            <div class="full-height drawer_normal" >
            <q-scroll-area class="fit">
                <q-list>
                    <template
                        v-for="(menuItem, index) in menuList"
                        :key="index"
                    >
                        <q-item clickable v-ripple :to="menuItem.path">
                            <q-item-section avatar>
                                <q-icon :name="menuItem.icon" />
                            </q-item-section>
                            <q-item-section>
                                {{ menuItem.label }}
                            </q-item-section>
                        </q-item>
                        <q-separator
                            :key="'sep' + index"
                            v-if="menuItem.separator"
                        />
                    </template>
                </q-list>
            </q-scroll-area>
            <!-- drawer content -->
            </div>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const menuList = [
    {
        icon: "inbox",
        label: "平台监控",
        separator: true,
        path: "/main/dashboard",
    },
    {
        icon: "folder",
        label: "文件管理",
        separator: false,
        path: "/main/files",
    },
    {
        icon: "hub",
        label: "Panel 分析流程",
        separator: false,
        path: "/main/panel",
    },
    {
        icon: "hub",
        label: "(暂时不做)群体分析流程",
        separator: false,
        path: "/main/group",
    },
    {
        icon: "auto_mode",
        label: "任务管理",
        separator: false,
        path: "/main/tasks",
    },
    {
        icon: "rate_review",
        label: "数据库注释",
        separator: false,
        path: "/main/tools/comment",
    },
    {
        icon: "biotech",
        label: "基因组浏览器",
        separator: true,
        path: "/main/tools/browse",
    },
    {
        icon: "settings",
        label: "系统设置",
        separator: false,
        path: "/main/settings",
    },
    {
        icon: "people",
        label: "用户管理",
        separator: false,
        path: "/main/users",
    },
    {
        icon: "manage_accounts",
        label: "个人中心",
        separator: false,
        path: "/main/profile",
    },
];
const router = useRouter();
const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}
function showProfile() {
    router.push("/main/profile");
}
function logout() {
    router.push("/login");
}

</script>


<style>
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
    background: linear-gradient(145deg, rgb(61, 14, 42) 15%, rgb(14, 43, 78) 70%);
}
</style>

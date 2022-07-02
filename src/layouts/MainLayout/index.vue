<template>
    <q-layout view="hHh LpR lFf">
<!--        <q-header reveal elevated :class="darkTheme">-->
        <q-header reveal elevated :class="darkTheme ? 'header_normal' : 'header_dark'">
            <q-toolbar class="q-mr-sm">
                <q-btn dense round flat icon="menu" aria-label="Menu" @click="toggleLeftDrawer = !toggleLeftDrawer" />

                <GqaAvatar class="gin-quasar-admin-logo" :src="gqaFrontend.logo" style="margin-left: 5px;" />

                <q-toolbar-title shrink class="text-bold text-italic cursor-pointer" style="padding: 0 5px;">
                    {{ gqaFrontend.subTitle }}
                </q-toolbar-title>

<!--                <q-tabs dense inline-label outside-arrows mobile-arrows shrink stretch v-model="currentItemMenu"-->
<!--                    class="flex-wrap" :class="darkTheme">-->
<!--                    <q-tab @click="changeTopMenu(item)" :name="item.top.name" :label="$t(item.top.title)"-->
<!--                        v-for="item in topMenu.filter(tm => tm?.top?.is_plugin === 'no')" :key="item.top.name" />-->
<!--                    <q-btn stretch flat class="text-grey-8" style="width: 100%;"-->
<!--                        @click="changeTopMenu(topMenuItemPlugin)"-->
<!--                        v-if="pageDashboard && topMenu.filter(tm => tm?.top?.is_plugin === 'yes').length"-->
<!--                        :label="topMenuItemPlugin?.top?.title ? $t(topMenuItemPlugin?.top?.title) : $t('Plugin') + $t('Menu') + '(' + topMenu.filter(tm => tm?.top?.is_plugin === 'yes').length + ')'">-->
<!--                        <q-btn dense stretch flat round icon="install_desktop" text-color="text-grey-8">-->
<!--                            <q-menu transition-show="flip-right" transition-hide="flip-left">-->
<!--                                <q-list>-->
<!--                                    <q-item clickable v-close-popup @click="changeTopMenuPlugin(item)"-->
<!--                                        v-for="item in topMenu.filter(tm => tm?.top?.is_plugin === 'yes')">-->
<!--                                        <q-item-section>-->
<!--                                            {{ $t(item.top.title) }}-->
<!--                                        </q-item-section>-->
<!--                                    </q-item>-->
<!--                                </q-list>-->
<!--                            </q-menu>-->
<!--                        </q-btn>-->
<!--                    </q-btn>-->
<!--                </q-tabs>-->

                <q-space />

                <div class="q-gutter-sm row items-center no-wrap">
                    <Fullscreen />
<!--                    <ChatAndNotice />-->
                    <AddNoteTodo />
                    <Setting />
                    <GitLink v-if="gqaFrontend.showGit === 'yes'" />
                    <UserMenu @showProfile="$refs.userProfile.show()" />
                </div>
            </q-toolbar>

            <!-- <q-separator /> -->
            <!-- header下面的标签页 -->
<!--            <div class="row bg-white">-->
<!--                <TabMenu v-show="!pageDashboard" />-->
<!--            </div>-->
        </q-header>

        <q-drawer elevated  v-model="toggleLeftDrawer" show-if-above bordered
            content-class="bg-grey-1">
            <SideBarLeft :topMenuItem="topMenuItem" :topMenu="topMenu" :topMenuItemPlugin="topMenuItemPlugin"
                @changeTopMenu="changeTopMenu" @changeTopMenuPlugin="changeTopMenuPlugin" />
        </q-drawer>

        <q-page-container>
            <router-view />
            <q-page-sticky position="bottom-right" :offset="fabPos" class="column">
                <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[0, -80]">
                    <q-btn push fab glossy rounded icon="keyboard_arrow_up" color="primary"
                        v-touch-pan.prevent.mouse="moveFab" />
                </q-page-scroller>
            </q-page-sticky>
        </q-page-container>

        <q-footer reveal elevated>
            <PageFooter />
        </q-footer>

        <UserProfile ref="userProfile" />

    </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { usePermissionStore } from 'src/stores/permission';
import { useStorageStore } from 'src/stores/storage';
import useDarkTheme from 'src/composables/useDarkTheme';
import SideBarLeft from './SideBarLeft/index.vue'
import TabMenu from './TabMenu.vue'
import Fullscreen from './Fullscreen.vue'
import ChatAndNotice from './ChatAndNotice/index.vue'
import GitLink from './GitLink.vue'
import UserMenu from './UserMenu.vue'
import Setting from './Setting.vue'
import PageFooter from './PageFooter.vue'
import GqaAvatar from 'src/components/GqaAvatar/index.vue'
import UserProfile from './UserProfile/index.vue'
import AddNoteTodo from './AddNoteTodo.vue';
import { useRoute, useRouter } from 'vue-router';
import useDocument from 'src/composables/useDocument'
import { useQuasar, LocalStorage } from 'quasar';
// 动态更改网站标题和favicon
useDocument()

const $q = useQuasar();
const { darkTheme } = useDarkTheme()
const route = useRoute();
const router = useRouter();
const storageStore = useStorageStore();
const permissionStore = usePermissionStore();
const toggleLeftDrawer = ref(true);
const topMenuItem = ref({name: '系统管理'});
const currentItemMenu = ref('dashboard');
const fabPos = ref([3, 80]);
const userProfile = ref(null);

const gqaFrontend = computed(() => {
    return storageStore.GetGqaFrontend()
})

onMounted(() => {
    const localDark = LocalStorage.getItem('gqa-dark-theme') || false
    $q.dark.set(localDark)

    if (findTopItemMenu.value.top?.is_plugin === 'yes') {
        topMenuItemPlugin.value = findTopItemMenu.value
    }
    topMenuItem.value = findTopItemMenu.value
})
watch(route, () => {
    if (findTopItemMenu.value.top?.is_plugin === 'yes') {
        topMenuItemPlugin.value = findTopItemMenu.value
    }
    topMenuItem.value = findTopItemMenu.value
})

const topMenu = computed(() => {
    return permissionStore.topMenu
})
const pageDashboard = computed(() => {
    const menu = topMenuItem.value?.top?.name === 'dashboard' || JSON.stringify(topMenuItem.value) === '{}'
    if (route.name === 'dashboard' && menu) {
        return true
    }
    return false
})
const findTopItemMenu = computed(() => {
    const name = route.name
    let item = {}
    for (let m of topMenu.value) {
        if (m.top.name === name || (m.arrayChildren && m.arrayChildren.find((item) => item.name === name))) {
            item = m
            break
        }
    }
    currentItemMenu.value = item.top ? item.top.name : ''
    return item
})

const changeTopMenu = (item) => {
    if (item && item.top) {
        currentItemMenu.value = item.top ? item.top.name : ''
        if (item.top.name === 'dashboard') {
            router.push('/dashboard')
        }
        topMenuItem.value = item
    }
}

const topMenuItemPlugin = ref({})
const changeTopMenuPlugin = (item) => {
    currentItemMenu.value = item.top ? item.top.name : ''
    topMenuItemPlugin.value = item
    changeTopMenu(item)
}

const moveFab = (ev) => {
    fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}
</script>

<style lang="scss" scoped>

.header_normal {
  background: linear-gradient(
      145deg,
      rgb(32, 106, 80) 15%,
      rgb(21, 57, 102) 70%
  );
}

.header_dark {
  background: linear-gradient(145deg, rgb(61, 14, 42) 15%, rgb(14, 43, 78) 70%);
}
</style>

<template>
    <q-layout view="hHh LpR fFf">
        <q-page-container>
            <q-page>
                <div class="row">
                    <div class="col-lg-1 col-md-1">&nbsp;</div>
                    <div class="col-lg-10 col-md-10 col-sm-12 col-xs-12">
                        <q-toolbar>
                            <q-skeleton
                                type="circle"
                                class="bg-secondary"
                                width="80px"
                                height="80px"
                            />
                            <q-skeleton
                                class="q-ml-md bg-positive"
                                type="text"
                                width="100px"
                                height="80px"
                            />
                            <q-skeleton
                                class="q-ml-md bg-positive"
                                type="text"
                                width="100px"
                                height="80px"
                            />
                            <q-skeleton
                                class="q-ml-md bg-positive"
                                type="text"
                                width="100px"
                                height="80px"
                            />
                            <q-skeleton
                                class="q-ml-md bg-positive"
                                type="text"
                                width="100px"
                                height="80px"
                            />
                            <q-skeleton
                                class="q-ml-md bg-positive"
                                type="text"
                                width="100px"
                                height="80px"
                            />
                            <q-toolbar-title> </q-toolbar-title>
                            <q-btn
                                label="登陆"
                                color="info"
                                icon="login"
                                to="/login"
                            />
                        </q-toolbar>
                        <div class="q-py-lg"></div>
                        <div>
                            <q-carousel
                                v-model="slide"
                                transition-prev="jump-right"
                                transition-next="jump-left"
                                swipeable
                                animated
                                control-color="white"
                                prev-icon="arrow_left"
                                next-icon="arrow_right"
                                navigation-icon="radio_button_unchecked"
                                navigation
                                padding
                                arrows
                                height="350px"
                                class="text-white shadow-1 rounded-borders"
                            >
                                <q-carousel-slide
                                    name="style"
                                    class="column no-wrap flex-center bg-primary"
                                >
                                    <q-icon name="style" size="56px" />
                                    <div class="q-mt-md text-center">
                                        {{ lorem }}
                                    </div>
                                </q-carousel-slide>
                                <q-carousel-slide
                                    name="tv"
                                    class="column no-wrap flex-center bg-secondary"
                                >
                                    <q-icon name="live_tv" size="56px" />
                                    <div class="q-mt-md text-center">
                                        {{ lorem }}
                                    </div>
                                </q-carousel-slide>
                                <q-carousel-slide
                                    name="layers"
                                    class="column no-wrap flex-center bg-accent"
                                >
                                    <q-icon name="layers" size="56px" />
                                    <div class="q-mt-md text-center">
                                        {{ lorem }}
                                    </div>
                                </q-carousel-slide>
                                <q-carousel-slide
                                    name="map"
                                    class="column no-wrap flex-center bg-warning"
                                >
                                    <q-icon name="terrain" size="56px" />
                                    <div class="q-mt-md text-center">
                                        {{ lorem }}
                                    </div>
                                </q-carousel-slide>
                            </q-carousel>
                        </div>
                        <div class="q-py-md"></div>

                        <div class="row justify-center">
                            <div class="col-lg-4 col-md-6 col-sm-11 col-xs-12">
                                <div class="q-pa-sm">
                                    <q-card>
                                        <q-item>
                                            <q-item-section avatar>
                                                <q-skeleton type="QAvatar" />
                                            </q-item-section>

                                            <q-item-section>
                                                <q-item-label>
                                                    <q-skeleton type="text" />
                                                </q-item-label>
                                                <q-item-label caption>
                                                    <q-skeleton type="text" />
                                                </q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-skeleton height="200px" square />
                                    </q-card>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 col-sm-11 col-xs-12">
                                <div class="q-pa-sm">
                                    <q-card>
                                        <q-item>
                                            <q-item-section avatar>
                                                <q-skeleton type="QAvatar" />
                                            </q-item-section>

                                            <q-item-section>
                                                <q-item-label>
                                                    <q-skeleton type="text" />
                                                </q-item-label>
                                                <q-item-label caption>
                                                    <q-skeleton type="text" />
                                                </q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-skeleton height="200px" square />
                                    </q-card>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-12 col-sm-12 col-xs-12">
                                <div class="q-pa-sm">
                                    <q-card>
                                        <q-item>
                                            <q-item-section avatar>
                                                <q-skeleton type="QAvatar" />
                                            </q-item-section>

                                            <q-item-section>
                                                <q-item-label>
                                                    <q-skeleton type="text" />
                                                </q-item-label>
                                                <q-item-label caption>
                                                    <q-skeleton type="text" />
                                                </q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-skeleton height="200px" square />
                                    </q-card>
                                </div>
                            </div>
                        </div>
                        <div class="q-py-lg"></div>
                        <div class="row">
                            <div
                                class="col-lg-5 col-md-6 col-sm-12 col-xs-12 q-pa-sm"
                            >
                                <q-skeleton
                                    type="text"
                                    width="60%"
                                    height="80px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="50%"
                                    height="2px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="55%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="40%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="60%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="52%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="57%"
                                    height="40px"
                                ></q-skeleton>
                            </div>
                            <div
                                class="col-lg-7 col-md-6 col-sm-12 col-xs-12 q-pa-sm"
                            >
                                <q-card class="bg-secondary">
                                    <div style="height: 280px"></div>
                                </q-card>
                            </div>
                        </div>
                        <div class="q-py-md"></div>
                        <div class="row">
                            <div
                                class="col-lg-7 col-md-6 col-sm-12 col-xs-12 q-pa-sm"
                            >
                                <q-card class="bg-accent">
                                    <div style="height: 280px"></div>
                                </q-card>
                            </div>
                            <div
                                class="col-5 col-md-6 col-sm-12 col-xs-12 q-pa-sm"
                            >
                                <q-skeleton
                                    type="text"
                                    width="60%"
                                    height="80px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="50%"
                                    height="2px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="55%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="40%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="60%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="52%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="57%"
                                    height="40px"
                                ></q-skeleton>
                            </div>
                        </div>
                        <div class="q-py-md"></div>
                        <div class="row">
                            <div
                                class="col-lg-5 col-md-6 col-sm-12 col-xs-12 q-pa-sm"
                            >
                                <q-skeleton
                                    type="text"
                                    width="60%"
                                    height="80px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="50%"
                                    height="2px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="55%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="40%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="60%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="52%"
                                    height="40px"
                                ></q-skeleton>
                                <q-skeleton
                                    type="text"
                                    width="57%"
                                    height="40px"
                                ></q-skeleton>
                            </div>
                            <div
                                class="col-lg-7 col-md-6 col-sm-12 col-xs-12 q-pa-sm"
                            >
                                <q-card class="bg-info">
                                    <div style="height: 280px"></div>
                                </q-card>
                            </div>
                        </div>
                        <div class="q-py-lg"></div>
                        <q-separator></q-separator>

                        <div class="q-py-lg"></div>
                        <div class="row">
                            <div class="col-lg-4 col-md-3 col-sm-12 col-xs-12">
                                <div class="column flex-center">
                                    <q-skeleton
                                        type="circle"
                                        width="150px"
                                        height="150px"
                                    ></q-skeleton>
                                    <q-skeleton
                                        type="text"
                                        width="150px"
                                        height="70px"
                                    ></q-skeleton>
                                </div>
                            </div>
                            <div class="col-lg-8 col-md-9 col-sm-12 col-xs-12">
                                <div class="row justify-center">
                                    <div
                                        class="col-lg-4 col-md-6 col-sm-12 col-xs-12 self-center"
                                    >
                                        <q-skeleton
                                            type="text"
                                            width="80%"
                                            height="80px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="70%"
                                            height="2px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="65%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="75%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="40%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="55%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="160px"
                                            height="40px"
                                        ></q-skeleton>
                                    </div>
                                    <div
                                        class="col-lg-4 col-md-6 col-sm-12 col-xs-12"
                                    >
                                        <q-skeleton
                                            type="text"
                                            width="80%"
                                            height="80px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="70%"
                                            height="2px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="65%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="75%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="40%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="55%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="160px"
                                            height="40px"
                                        ></q-skeleton>
                                    </div>
                                    <div
                                        class="col-lg-4 col-md-12 col-sm-12 col-xs-12"
                                    >
                                        <q-skeleton
                                            type="text"
                                            width="80%"
                                            height="80px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="70%"
                                            height="2px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="65%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="75%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="40%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="55%"
                                            height="40px"
                                        ></q-skeleton>
                                        <q-skeleton
                                            type="text"
                                            width="160px"
                                            height="40px"
                                        ></q-skeleton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-1 col-md-1">&nbsp;</div>
                </div>
                <q-page-sticky position="bottom-right" :offset="[18, 150]">
                    <q-icon
                        name="forum"
                        color="info"
                        class="q-mr-sm"
                        size="30px"
                    />
                </q-page-sticky>
                <div style="height: 100px"></div>
                <router-view />
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const slide = ref("style");
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

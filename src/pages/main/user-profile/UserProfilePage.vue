<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="个人中心" />
        <q-card class="column full-height full-width bg-white">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">用户中心</div>
                <q-space />
                <!--                <q-btn icon="close" flat round dense v-close-popup />-->
            </q-card-section>
            <q-card-section>
                <div class="row q-pa-md items-center justify-around" style="max-width: 95vw">
                    <div class="col-4 items-center">
                        <!--                        <q-avatar icon="diversity_1" size="200px" />-->
                        <q-img :src="store.ui.image" spinner-color="white" style="height: 200px; max-width: 200px" />
                        <q-space />
                    </div>
                    <div class="col-8 items-center">
                        <q-list>
                            <q-item clickable>
                                <q-item-section avatar>
                                    <q-icon size="lg" name="star" class="text-warning" />
                                </q-item-section>
                                <q-item-section>{{
                                        "账号: " + me.username
                                }}</q-item-section>
                            </q-item>
                            <q-item clickable>
                                <q-item-section avatar>
                                    <q-icon size="lg" name="person_add" class="text-warning" />
                                </q-item-section>
                                <q-item-section>{{
                                        "姓名: " + me.nickname
                                }}</q-item-section>
                            </q-item>
                            <q-item clickable>
                                <q-item-section avatar>
                                    <q-icon size="lg" name="face" class="text-warning" />
                                </q-item-section>
                                <q-item-section>{{'角色: ' + getRole() }}</q-item-section>
                            </q-item>
                            <q-item clickable>
                                <q-item-section avatar>
                                    <q-icon size="lg" name="email" class="text-warning" />
                                </q-item-section>
                                <q-item-section>{{'邮箱: ' + me.email }} </q-item-section>
                            </q-item>
                        </q-list>

                        <q-separator inset spaced />

                        <!--                        <div class="row q-gutter-md">-->
                        <!--                            <q-btn color="primary" :label="$t('Change') + ' ' + $t('Nickname')"-->
                        <!--                                   @click="showNicknameDialog"></q-btn>-->
                        <!--                            <q-btn color="primary" :label="$t('Change') + ' ' + $t('Password')"-->
                        <!--                                   @click="showPasswordDialog"></q-btn>-->
                        <!--                        </div>-->
                    </div>
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn
                    icon="password"
                    color="primary"
                    text-color="white"
                    size="1rem"
                    label="修改密码"
                    @click="showPasswordDialog"
                ></q-btn>
                <q-btn icon="logout" color="red-10" text-color="white" size="1rem" label="退出" @click="logout"></q-btn>
            </q-card-actions>
            <ChangePasswordDialog ref="changePasswordDialog" />
            <ChangeNicknameDialog ref="changeNicknameDialog" />
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { globalStore } from "src/stores/global";

const store = globalStore();

const me = {
    username: store.currentUser ? store.currentUser.username : "",
    nickname: store.currentUser ? store.currentUser.nickname : "",
    roles: store.currentUser.role_list,
    email: store.currentUser.email
};

const changePasswordDialog = ref(null);
const showPasswordDialog = () => {
    changePasswordDialog.value.show();
};
const showProfile = ref(false);
const router = useRouter();

const logout = () => {
    store.$reset()
    router.push('/login')
}

const getRole = () => {
    if (me.roles.includes('super')) {
        return '超级管理员'
    }

    if (me.roles.includes('admin')) {
        return '管理员'
    }

    return '普通用户'
}
</script>

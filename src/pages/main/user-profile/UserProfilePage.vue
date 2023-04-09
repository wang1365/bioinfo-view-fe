<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('UserProfile')" />
        <q-card class="column full-height full-width bg-white">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">{{$t('UserProfile')}}</div>
                <q-space />
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
                                        $t('Username') + ': ' + me.username
                                }}</q-item-section>
                            </q-item>
                            <q-item clickable>
                                <q-item-section avatar>
                                    <q-icon size="lg" name="person_add" class="text-warning" />
                                </q-item-section>
                                <q-item-section>{{
                                        $t('Nickname') + ': ' + me.nickname
                                }}</q-item-section>
                            </q-item>
                            <q-item clickable>
                                <q-item-section avatar>
                                    <q-icon size="lg" name="face" class="text-warning" />
                                </q-item-section>
                                <q-item-section>{{$t('Role') + ': ' + getRole() }}</q-item-section>
                            </q-item>
                            <q-item clickable>
                                <q-item-section avatar>
                                    <q-icon size="lg" name="email" class="text-warning" />
                                </q-item-section>
                                <q-item-section>{{$t('Email') + ': ' + me.email }} </q-item-section>
                            </q-item>
                        </q-list>

                        <q-separator inset spaced />
                    </div>
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn
                    icon="password"
                    color="primary"
                    text-color="white"
                    size="1rem"
                    :label="$t('ChangePassword')"
                    @click="showPasswordDialog()"
                ></q-btn>
                <q-btn icon="logout" color="red-10" text-color="white" size="1rem" :label="$t('Logout')" @click="logout"></q-btn>
            </q-card-actions>
            <ChangePasswordDialog ref="changePasswordDialog" v-model="passwordDialogVisible" />
        </q-card>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { ref } from "vue";
import { useRouter } from "vue-router"
import { globalStore } from "src/stores/global"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const store = globalStore()

const me = {
    username: store.currentUser ? store.currentUser.username : "",
    nickname: store.currentUser ? store.currentUser.nickname : "",
    roles: store.currentUser.role_list,
    email: store.currentUser.email
};

const passwordDialogVisible = ref(false)

const showPasswordDialog = () => {
    console.log('showPasswordDialog 1')
    passwordDialogVisible.value = true
    console.log('showPasswordDialog 2')
}

const logout = () => {
    store.$reset()
    router.push('/login')
}

const getRole = () => {
    if (me.roles.includes('super')) {
        return t('SuperAdmin')
    }

    if (me.roles.includes('admin')) {
        return t('Admin')
    }

    return t('NormalUser')
}
</script>

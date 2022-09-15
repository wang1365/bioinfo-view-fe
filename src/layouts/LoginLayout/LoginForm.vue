<template>
    <q-card-section>
        <q-card-section>
            <div class="text-center">
                <q-avatar size="100px">
                    <img :src="store.ui.image" alt="" />
                </q-avatar>
            </div>
            <div class="text-h5 text-center text-primary">
                {{ "" }}
            </div>
            <div class="text-h7 text-center text-primary q-mt-md q-mb-xs">欢迎回来</div>
            <q-form @submit="onSubmit" class="q-mt-lg gqa-form">
                <q-input
                    :disable="loading"
                    outlined
                    dense
                    no-error-icon
                    v-model.trim="form.username"
                    :placeholder="$t('Username')"
                    :rules="[
                        (val) => (val && val.length > 0) || $t('NeedInput'),
                    ]"
                    autocomplete="username"
                />
                <q-input
                    :disable="loading"
                    outlined
                    dense
                    no-error-icon
                    :type="isPwd ? 'password' : 'text'"
                    v-model.trim="form.password"
                    :placeholder="$t('Password')"
                    :rules="[
                        (val) => (val && val.length > 0) || $t('NeedInput'),
                    ]"
                    autocomplete="current-password"
                >
                    <template v-slot:append>
                        <q-icon
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd"
                        />
                    </template>
                </q-input>
                <!-- <q-input
                    v-if="false"
                    :disable="loading"
                    outlined
                    dense
                    no-error-icon
                    v-model.trim="form.captcha"
                    :placeholder="$t('Captcha')"
                    :rules="[
                        (val) => (val && val.length > 0) || $t('NeedInput'),
                    ]"
                >
                    <template v-slot:after>
                        <q-btn
                            padding="none"
                            style="width: 120px; height: 100%"
                            @click="getCaptcha"
                        >
                            <q-img :src="captchaImage" />
                        </q-btn>
                    </template>
                </q-input> -->
                <div class="column q-gutter-y-md q-mt-none">
                    <q-checkbox
                        :disable="loading"
                        v-model="rememberMe"
                        label="记住我"
                        dense
                        @update:model-value="changeRememberMe"
                    />
                </div>
                <div class="items-center justify-around q-mt-md row">
                    <q-btn label="登录" type="submit" color="primary" :loading="loading" style="width: 100%" />
                </div>
                <div class="items-center justify-around q-mt-md row">
                    <q-btn label="回到首页" type="button" color="default" :loading="loading" style="width: 100%" />
                </div>
            </q-form>
            <q-inner-loading :showing="loading" style="background-color: rgba(0, 0, 0, 0)">
                <q-spinner-hourglass color="primary" size="3em" />
            </q-inner-loading>
        </q-card-section>
        <q-separator />

        <q-card-actions v-if="$q.screen.gt.sm">
            <!-- <GqaLanguage /> -->
        </q-card-actions>
    </q-card-section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { globalStore } from "src/stores/global";
import { api } from "src/boot/axios";
import { useQuasar } from "quasar";
import { refreshSystemUi } from "src/api/ui";

const $q = useQuasar();
const { t } = useI18n();
const store = globalStore();

const isPwd = ref(true);
const form = ref({
    username: "super",
    password: "1234qwer",
    captcha: "",
    captcha_id: "",
});
const router = useRouter();
const route = useRoute();
const rememberMe = ref(true);
const captchaImage = ref("");
const loading = ref(false);
const getCaptcha = () => {
    // postAction('public/get-captcha').then((res) => {
    //     captchaImage.value = res.data.captcha_image
    //     form.value.captcha_id = res.data.captcha_id
    // })

    captchaImage.value = "";
    form.value.captcha_id = 0;
};
const changeRememberMe = (value) => {
    // userStore.ChangeRememberMe(value);
};

onMounted(() => {
    getCaptcha();
});

const onSubmit = async () => {
    loading.value = true;
    api.post("/account/login", {
        username: form.value.username,
        password: form.value.password,
    })
        .then((resp) => {
            loading.value = false;
            store.currentUserToken = resp.data.data.access_token;

            $q.cookies.set("token", store.currentUserToken);
            api.get("/account/me", {
                headers: {
                    Authorization: store.currentUserToken,
                },
            })
                .then((resp) => {
                    store.currentUser = resp;
                    router.push(route.query.redirect || "/main");
                })
                .catch((e) => {
                    alert("获取用户信息失败!");
                });
        })
        .catch((e) => {
            alert(e.response.data.msg);
            loading.value = false;
        });
};
</script>

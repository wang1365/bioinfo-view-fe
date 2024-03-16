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
            <!--            <div class="text-h7 text-center text-primary q-mt-md q-mb-xs">{{$t('WelcomeBack')}}</div>-->
            <q-form @submit="onSubmit" class="q-mt-lg gqa-form">
                <q-input
                    :disable="loading"
                    dense
                    outlined
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
                <div class="row q-gutter-y-md q-mt-none">
                    <q-checkbox
                        :disable="loading"
                        v-model="rememberMe"
                        :label="$t('RememberMe')"
                        dense
                        class="col"
                        @update:model-value="changeRememberMe"
                    />
                    <!--                    <q-select dense v-model:model-value="lang" class="col-4" :options="langOptions" options-dense>-->
                    <!--                        <template v-slot:before>-->
                    <!--                            <q-btn flat dense color="primary" :label="lang === 'cn' ? '语言' : 'Language'"/>-->
                    <!--                        </template>-->
                    <!--                    </q-select>-->
                    <div v-if="langConfig.langSwitch" class="col-4">
                        <SelectLanguage />
                    </div>
                </div>
                <div class="items-center justify-around q-mt-md row">
                    <q-btn :label="$t('Login')" type="submit" color="primary" :loading="loading" style="width: 100%" />
                </div>
                <!--                <div class="items-center justify-around q-mt-md row">-->
                <!--                    <q-btn :label="$t('BackToHome')" type="button" color="default" :loading="loading" style="width: 100%" />-->
                <!--                </div>-->
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
const { locale } = useI18n({ useScope: 'global' })
import { useRouter, useRoute } from "vue-router";
import { globalStore } from "src/stores/global";
import { api } from "src/boot/axios";
import { useQuasar } from "quasar";
import { refreshSystemUi } from "src/api/ui";
import SelectLanguage from 'src/components/SelectLanguage.vue'
import { listConfig } from 'src/api/config'
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
// const { t } = useI18n();
const store = globalStore();

const isPwd = ref(true);
const form = ref({
    username: "",  // super
    password: "",  // 1234qwer
    captcha: "",
    captcha_id: "",
});
const router = useRouter();
const route = useRoute();
const rememberMe = ref(true);
const captchaImage = ref("");
const loading = ref(false);
const lang = ref('cn')
const langConfig = ref({ lang_switch: false })


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

    listConfig().then(res => {
        for (let item of res.results) {
            if (item.name === 'langConfig') {
                langConfig.value = JSON.parse(item.data)

                store.langConfig.langSwitch = langConfig.value.langSwitch
                store.langConfig.defaultLang = langConfig.value.defaultLang
                console.log('---------->', langConfig.value)
                // 如果没有开启语言切换，则使用语言配置中的默认语言
                if (!langConfig.value.lang_switch) {
                    locale.value = langConfig.value.defaultLang === 'en' ? 'en-US' : 'zh-CN'
                    store.langConfig.lang =  langConfig.value.defaultLang
                }
            }
        }
    })
});

const onSubmit = async () => {
    loading.value = true;
    api.post("/account/login", {
        username: form.value.username,
        password: form.value.password,
    })
        .then((resp) => {
            loading.value = false;
            store.currentUserToken = resp.access_token;

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

<style lang="scss">

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active{
    -webkit-box-shadow: 0 0 0 30px #4cb494 inset !important;
}
</style>

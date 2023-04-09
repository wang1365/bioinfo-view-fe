<template>
    <q-dialog v-model="passwordDialog" persistent>
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">{{$t('ChangePassword')}}</div>
            </q-card-section>
            <q-form class="q-gutter-md" @submit="onSubmit">
                <q-card-section class="q-pt-none">
                    <q-input
                        filled
                        v-model.trim="passwordForm.old_password"
                        autocomplete="off"
                        :label="$t('OldPassword')"
                        :type="isPwd ? 'password' : 'text'"
                        :rules="[
                            (val) => (val && val.length > 0) || $t('NotAllowEmpty'),
                        ]"
                    >
                        <template v-slot:append>
                            <q-icon
                                :name="isPwd ? 'visibility_off' : 'visibility'"
                                class="cursor-pointer"
                                @click="isPwd = !isPwd"
                            />
                        </template>
                    </q-input>

                    <q-input
                        filled
                        v-model.trim="passwordForm.new_password_1"
                        autocomplete="off"
                        :label="$t('NewPassword')"
                        :type="isPwd ? 'password' : 'text'"
                        :rules="[
                            (val) => (val && val.length > 0) || $t('NotAllowEmpty'),
                        ]"
                    >
                        <template v-slot:append>
                            <q-icon
                                :name="isPwd ? 'visibility_off' : 'visibility'"
                                class="cursor-pointer"
                                @click="isPwd = !isPwd"
                            />
                        </template>
                    </q-input>

                    <q-input
                        filled
                        v-model.trim="passwordForm.new_password_2"
                        autocomplete="off"
                        :label="$t('ConfirmPassword')"
                        :type="isPwd ? 'password' : 'text'"
                        :rules="[
                            (val) => (val && val.length > 0) || $t('NotAllowEmpty'),
                        ]"
                    >
                        <template v-slot:append>
                            <q-icon
                                :name="isPwd ? 'visibility_off' : 'visibility'"
                                class="cursor-pointer"
                                @click="isPwd = !isPwd"
                            />
                        </template>
                    </q-input>
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn :label="$t('Cancel')" v-close-popup />
                    <!--                    <q-btn flat label="确认" @click="handleChangePassword"/>-->
                    <q-btn :label="$t('Confirm')" color="primary" type="submit" v-close-popup />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useQuasar } from 'quasar'
import { changePassword } from 'src/api/user'
import { globalStore} from 'src/stores/global'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const store = globalStore();
const router = useRouter();
const passwordDialog = ref(false);
const passwordForm = ref({
    old_password: "",
    new_password_1: "",
    new_password_2: "",
})
const isPwd = ref(true);

onMounted(() => {
    console.log('ChangePasswordDialog mounted')
})

const onSubmit = () => {
    changePassword(store.currentUser.id, passwordForm.value.old_password, passwordForm.value.new_password_1).then((res) => {
        console.log('Pwd changed', res)
        if (res.length > 0) {
            $q.notify({
                message: t('ChangePasswordSuccess')
            })
        }
        passwordDialog.value = false
    })
    // const success = await passwordFormRef.value.validate()
    // if (success) {
    //     if (passwordForm.value.new_password_1 !== passwordForm.value.new_password_2) {
    //         $q.notify({
    //             type: 'negative',
    //             message: t('TwoPasswordsCheck'),
    //         })
    //     } else {
    //         const res = await postAction(changePasswordUrl, passwordForm.value)
    //         if (res.code === 1) {
    //             $q.notify({
    //                 type: 'positive',
    //                 message: t('Change') + ' ' + t('Password') + ' ' + t('Success') + ',' + t('Relogin'),
    //             })
    //             passwordDialog.value = false
    //             userStore.HandleLogout()
    //             router.push({ name: 'login' })
    //         }
    //     }
    // } else {
    //     $q.notify({
    //         type: 'negative',
    //         message: t('FixForm'),
    //     })
    // }
};
</script>

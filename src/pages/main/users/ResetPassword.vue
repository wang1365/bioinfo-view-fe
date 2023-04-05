<template>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 500px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>{{$t('ChangePassword') + ':' + user.username}}</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            type="password"
                            v-model="password"
                            :label="$t('Password')"
                            lazy-rules
                            :rules="[
                              val => val !== null && val !== '' || $t('NotAllowEmpty')
                            ]"
                        />
                    </q-item>
                    <q-item>
                        <q-input
                            ref="againInput"
                            class="full-width"
                            filled
                            type="password"
                            v-model="password_again"
                            :label="$t('ConfirmPassword')"
                            lazy-rules
                            :rules="[
                                  val => val !== null && val !== '' || $t('NotAllowEmpty'),
                                  val => val === password || $t('PasswordIsNotSame')
                                ]"
                        />
                    </q-item>
                    <q-card-actions align="right">
                        <q-btn :label="$t('Confirm')" type="button" color="primary" @click="clickOk" />
                        <q-btn :label="$t('Cancel')" type="button" color="primary" v-close-popup flat class="q-ml-sm" />
                    </q-card-actions>
                </q-list>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, defineProps, toRefs, onMounted } from 'vue'
import { createUser, resetPassword } from 'src/api/user'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()


const props = defineProps({
    user: {
        default: function () {
            return {
                id: null,
                username: '',
                email: ''
            };
        },
        type: Object,
    }
})

const { user } = toRefs(props)

const password = ref('')
const password_again = ref('')
const dlgVisible = ref(false)
const againInput = ref(null)

const clickOk = () => {
    if (againInput.value.validate()) {
        resetPassword(user.value.id, password.value).then(() => {
            $q.notify({message: t('ChangePasswordSuccess'), type: 'positive'})
            dlgVisible.value = false
        })
    }
}

const show = () => {
    dlgVisible.value = true
}

defineExpose({ show })
onMounted(() => {
})

const onReset = () => {

}
</script>

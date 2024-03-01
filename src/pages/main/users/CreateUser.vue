<template>
    <q-dialog v-model="dlgVisible" transition-hide="scale">
        <q-card style="width: 500px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>{{$t('AddUser')}}</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            v-model="form.username"
                            :label="$t('Username')"
                            lazy-rules
                            :rules="[ val => val && val.length > 0 || $t('NotAllowEmpty')]"
                        />
                    </q-item>
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            v-model="form.nickname"
                            :label="$t('Nickname')"
                            lazy-rules
                            :rules="[ val => val && val.length > 0 || $t('NotAllowEmpty')]"
                        />
                    </q-item>
                    <!--                <q-item>-->
                    <!--                    <q-input class="full-width"-->
                    <!--                        filled-->
                    <!--                        type="text"-->
                    <!--                        v-model="form.email"-->
                    <!--                        label="邮箱"-->
                    <!--                        lazy-rules-->
                    <!--                        :rules="[-->
                    <!--                          val => val !== null && val !== '' || '请输入邮箱'-->
                    <!--                        ]"-->
                    <!--                    />-->
                    <!--                </q-item>-->
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            type="password"
                            v-model="form.password"
                            :label="$t('Password')"
                            lazy-rules
                            :rules="[
                              val => val !== null && val !== '' || $t('NotAllowEmpty'),
                              val => val !== null && val.length >= 6 || $t('PasswordLengthValidateFailed'),
                            ]"
                        />
                    </q-item>
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            type="password"
                            v-model="form.password_again"
                            :label="$t('ConfirmPassword')"
                            lazy-rules
                            :rules="[
                                  val => val !== null && val !== '' || $t('NotAllowEmpty'),
                                  val => val === form.password || $t('PasswordIsNotSame')
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
import { ref } from 'vue'
import { createUser } from 'src/api/user'
import { useQuasar } from 'quasar'
import { useApi }from 'src/api/apiBase'
import { amISuper } from 'src/utils/user'

const $q = useQuasar()
const { apiPost } = useApi()

const dlgVisible = ref(false)
const emit = defineEmits( [ 'success'] )

const form = ref({
    username: '',
    nickname: '',
    email: '',
    password: '',
    password_again: '',
    role_list: [ amISuper() ? 'super' : 'admin' ]
})

const clickOk = () => {
    if (form.value.password.length < 6) {
        $q.notify({message: '至少输入6位', type: 'negative'})
        return
    }

    apiPost('/account/create_user', ()=>{
        emit('success')
        dlgVisible.value = false
        $q.notify({message: '创建用户成功', type: 'positive'})
    }, form.value)
    // createUser(form.value).then(() => {
    //     emit('success')
    //     dlgVisible.value = false
    //     $q.notify({message: '创建用户成功', type: 'positive'})
    // }).catch(err => {
    //     console.log('ddddddddddd', err)
    //     $q.notify({message: err, type: 'negative'})
    // })
}

const show = () => {
    dlgVisible.value = true
}
defineExpose({ show })


const onReset = () => {

}
</script>

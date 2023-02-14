<template>
    <q-dialog v-model="dlgVisible" transition-hide="scale">
        <q-card style="width: 500px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>新建用户</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            v-model="form.username"
                            label="账号"
                            hint="登录账号"
                            lazy-rules
                            :rules="[ val => val && val.length > 0 || '请输入账号']"
                        />
                    </q-item>
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            v-model="form.nickname"
                            label="姓名"
                            hint="登录账号"
                            lazy-rules
                            :rules="[ val => val && val.length > 0 || '请输入姓名']"
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
                            label="密码"
                            lazy-rules
                            :rules="[
                              val => val !== null && val !== '' || '请输入密码',
                              val => val !== null && val.length >= 6 || '至少输入6位',
                            ]"
                        />
                    </q-item>
                    <q-item>
                        <q-input
                            class="full-width"
                            filled
                            type="password"
                            v-model="form.password_again"
                            label="确认密码"
                            lazy-rules
                            :rules="[
                                  val => val !== null && val !== '' || '请输入确认密码',
                                  val => val === form.password || '两次输入密码不一致'
                                ]"
                        />
                    </q-item>
                    <q-card-actions align="right">
                        <q-btn label="确定" type="button" color="primary" @click="clickOk" />
                        <q-btn label="取消" type="button" color="primary" v-close-popup flat class="q-ml-sm" />
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
    role_list: ['normal']
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

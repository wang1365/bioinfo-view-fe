<template>
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
                        label="用户名"
                        hint="登录账号"
                        lazy-rules
                        :rules="[ val => val && val.length > 0 || '请输入用户名']"
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
                    <q-input class="full-width"
                             filled
                             type="password"
                             v-model="form.password"
                             label="密码"
                             lazy-rules
                             :rules="[
                          val => val !== null && val !== '' || '请输入密码'
                        ]"
                    />
                </q-item>
                <q-item>
                    <q-input class="full-width"
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
                    <q-btn label="确定" type="button" color="primary" @click="clickOk"/>
                    <q-btn label="取消" type="button" color="primary" v-close-popup flat class="q-ml-sm"/>
                </q-card-actions>
            </q-list>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref, defineProps, toRefs } from 'vue'
import { createUser } from 'src/api/user'
import { useQuasar } from 'quasar'

const $q = useQuasar()


const props = defineProps({
    user: {
        default: function () {
            return {
                username: '',
                email: ''
            };
        },
        type: Object,
    }
})

const { user } = toRefs(props)
const form = ref(user)

const clickOk = () => {
    createUser(form.value).then(() => {
        $q.notify({message: '创建用户成功', type: 'positive'})
    })
}

const onReset = () => {

}
</script>

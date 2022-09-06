<template>
    <q-dialog v-model="dlgVisible">
        <q-card style="width: 500px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>{{'修改密码:' + user.username}}</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-input class="full-width"
                                 filled
                                 type="password"
                                 v-model="password"
                                 label="密码"
                                 lazy-rules
                                 :rules="[
                              val => val !== null && val !== '' || '请输入密码'
                            ]"
                        />
                    </q-item>
                    <q-item>
                        <q-input ref='againInput' class="full-width"
                                 filled
                                 type="password"
                                 v-model="password_again"
                                 label="确认密码"
                                 lazy-rules
                                 :rules="[
                                  val => val !== null && val !== '' || '请输入确认密码',
                                  val => val === password || '两次输入密码不一致'
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
    </q-dialog>
</template>

<script setup>
import { ref, defineProps, toRefs, onMounted } from 'vue'
import {createUser, resetPassword} from 'src/api/user'
import { useQuasar } from 'quasar'

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
        resetPassword(user.id, password.value).then(() => {
            $q.notify({message: '修改密码用户成功', type: 'positive'})
            dlgVisible.value = false
        })
    }
}

const show = () => {
    dlgVisible.value = true
}

defineExpose({ show })
onMounted(() => {
    console.log('============> ', user)
})

const onReset = () => {

}
</script>

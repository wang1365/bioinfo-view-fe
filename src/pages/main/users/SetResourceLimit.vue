<template>
    <q-card style="width: 500px; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>{{'资源配置:' + user.username}}</q-toolbar-title>
        </q-toolbar>
        <q-card-section>
            <q-list>
                <q-item>
                    <q-input class="full-width"
                             filled
                             type="password"
                             v-model="disk"
                             label="磁盘空间（G）"
                             lazy-rules
                             :rules="[
                          val => val !== null && val !== '' || '请输入磁盘空间大小（G）'
                        ]"
                    />
                </q-item>
<!--                <q-item>-->
<!--                    <q-input class="full-width"-->
<!--                             filled-->
<!--                             type="password"-->
<!--                             v-model="password_again"-->
<!--                             label="确认密码"-->
<!--                             lazy-rules-->
<!--                             :rules="[-->
<!--                              val => val !== null && val !== '' || '请输入确认密码',-->
<!--                              val => val === password || '两次输入密码不一致'-->
<!--                            ]"-->
<!--                    />-->
<!--                </q-item>-->
                <q-card-actions align="right">
                    <q-btn label="确定" type="button" color="primary" @click="clickOk"/>
                    <q-btn label="取消" type="button" color="primary" v-close-popup flat class="q-ml-sm"/>
                </q-card-actions>
            </q-list>
        </q-card-section>
    </q-card>
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
                disk: 0,
            };
        },
        type: Object,
    }
})

const { user } = toRefs(props)

const password = ref('')
const password_again = ref('')

const clickOk = () => {
    resetPassword(user.id, password.value).then(() => {
        $q.notify({message: '修改密码用户成功', type: 'positive'})
    })
}
onMounted(() => {
    console.log('============> ', user)
})

const onReset = () => {

}
</script>

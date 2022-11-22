<template>
    <q-dialog v-model="dlgVisible" transition-show="scale">
        <q-card style="width: 500px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>用户设置</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-input
                            class="full-width"
                            readonly
                            filled
                            stack-label
                            v-model="form.username"
                            label="用户名"
                            :rules="[ val => val && val.length > 0 || '请输入用户名']"
                        />
                    </q-item>
                    <q-item>
                        <q-input
                            class="full-width"
                            stack-label
                            v-model="form.nickname"
                            label="姓名"
                            :rules="[ val => val && val.length > 0 || '请输入用户名']"
                        />
                    </q-item>
                    <q-item>
                        <q-input class="full-width" stack-label v-model.number="form.disk_limit" label="磁盘配额(MB)" />
                    </q-item>
                    <q-item>
                        <q-toggle
                            v-model="form.is_active"
                            checked-icon="check"
                            color="green"
                            label="启用"
                            left-label
                            unchecked-icon="clear"
                        />
                    </q-item>

                    <!--                    <q-item>-->
                    <!--                        <q-input class="full-width"-->
                    <!--                            filled-->
                    <!--                            type="text"-->
                    <!--                            v-model="form.nickname"-->
                    <!--                            label="邮箱"-->
                    <!--                            lazy-rules-->
                    <!--                            :rules="[-->
                    <!--                              val => val !== null && val !== '' || '请输入邮箱'-->
                    <!--                            ]"-->
                    <!--                        />-->
                    <!--                    </q-item>-->
                    <!--                    <q-item>-->
                    <!--                        <q-input class="full-width"-->
                    <!--                                 filled-->
                    <!--                                 type="password"-->
                    <!--                                 v-model="form.password"-->
                    <!--                                 label="密码"-->
                    <!--                                 lazy-rules-->
                    <!--                                 :rules="[-->
                    <!--                              val => val !== null && val !== '' || '请输入密码'-->
                    <!--                            ]"-->
                    <!--                        />-->
                    <!--                    </q-item>-->
                    <!--                    <q-item>-->
                    <!--                        <q-input class="full-width"-->
                    <!--                                 filled-->
                    <!--                                 type="password"-->
                    <!--                                 v-model="form.password_again"-->
                    <!--                                 label="确认密码"-->
                    <!--                                 lazy-rules-->
                    <!--                                 :rules="[-->
                    <!--                                  val => val !== null && val !== '' || '请输入确认密码',-->
                    <!--                                  val => val === form.password || '两次输入密码不一致'-->
                    <!--                                ]"-->
                    <!--                        />-->
                    <!--                    </q-item>-->
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
import {ref, defineProps, toRefs, watch} from 'vue'
import {patchUser} from 'src/api/user'
import {useQuasar} from 'quasar'

const $q = useQuasar()
const dlgVisible = ref(false)
const emit = defineEmits(['success'])

const show = () => {
    dlgVisible.value = true
}
defineExpose({show})

const props = defineProps({
    user: {
        default: function () {
            return {
                id: null,
                username: '',
                nickname: '',
                is_active: true,
                disk_limit: null
            };
        },
        type: Object,
    }
})

const { user } = toRefs(props)
const form = ref({})

watch(user,  (v) => {
    console.log('xxxxxxxx user change', user, v)
    form.value = {
        username: props.user.username,
        nickname: props.user.nickname,
        disk_limit: props.user.disk_limit,
        is_active: props.user.is_active
    }
})

const clickOk = () => {
    patchUser(props.user.id, form.value).then(() => {
        $q.notify({message: '修改用户成功', type: 'positive'})
        emit('success')
        dlgVisible.value = false
    })
}

const onReset = () => {

}
</script>

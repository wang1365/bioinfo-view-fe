<template>
    <q-dialog persistent transition-show="fade" transition-hide="fade" v-model="dlgVisible" :title="title">
        <q-card class="my-card">
            <q-card-section>
                <q-form>
                    <q-input
                        v-model="form.name"
                        label="分组名称"
                        dense
                        stack-label
                        :rules="[(val) => (val !== null && val.length >= 3) || '名称至少为3个字符']"
                    />
                </q-form>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn color="primary" label="确定" @click="clickSubmit" />
                <q-btn label="取消" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import {ref, defineProps, defineExpose, defineEmits} from 'vue'
import {createPanelGroup} from 'src/api/panelGroup'
import {useQuasar} from 'quasar'

const $q = useQuasar()
const dlgVisible = ref(false)

const props = defineProps({
    mode: {
        validator: (value) => {
            return ['edit', 'create', 'info'].indexOf(value) !== -1
        },
        default: 'info',
    },
    id: {
        type: Number,
        default: -1,
    },
})

const form = ref({})

const setData = (data) => {
    form.value = data
}
const reset = () => {
    // this.$refs.params.resetFields()
    // this.$refs.builtinParams.resetFields()
    // this.$refs.form.resetFields()
}

const close = () => {
    dlgVisible.value = false
}

const show = () => {
    dlgVisible.value = true
}
defineExpose({setData, reset, show})
const emit = defineEmits(['success'])

const clickSubmit = () => {
    createPanelGroup(form.value).then(() => {
        $q.notify({message: '流程创建成功'})
        emit('success')
        close()
    })
}
</script>

<style lang="scss" scoped>
.my-card {
    width: 300px;
    max-width: 500px;
}
</style>

<template>
    <q-dialog persistent transition-show="fade" transition-hide="fade" v-model="dlgVisible" :title="title">
        <q-card class="my-card">
            <q-card-section>
                <q-form>
                    <div class="row justify-between">
                    <q-input class="col-6" v-model="form.name" label="Panel名称" dense clearable stack-label
                             :rules="[(val) => (val !== null && val.length >= 3) || '名称至少为3个字符']"
                    />
                    <q-select class="col-5" label="Panel分组" v-model="form.panel_group"
                              emit-value filled :options="panelGroups"
                              map-options dense  stack-label
                    />
                    </div>
                    <q-input v-model="form.desp" label="描述" dense type="textarea" clearable stack-label counter
                    />

                </q-form>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn color="primary" label="确定" @click="clickSubmit"/>
                <q-btn label="取消" v-close-popup/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import {ref, defineProps, defineExpose, defineEmits, onMounted} from 'vue'
import {createPanel, updatePanel} from 'src/api/panel'
import {useQuasar} from 'quasar'
import {getPanelGroups} from "src/api/panelGroup";

const $q = useQuasar()
const dlgVisible = ref(false)
const panelGroups = ref([])

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

onMounted(() => {
    getPanelGroups().then(res => {
        panelGroups.value = res.map(t => {
            return {
                label: t.name,
                value: t.id
            }
        })
    })
})

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
    if (props.mode === 'create') {
        createPanel(form.value).then(() => {
            $q.notify({message: '创建成功', type: 'positive'})
            emit('success')
            close()
        })
    }

    if (props.mode === 'edit') {
        updatePanel(form.value).then(() => {
            $q.notify({message: '更新成功', type: 'positive'})
            emit('success')
            close()
        })
    }

}
</script>

<style lang="scss" scoped>
.my-card {
    min-width: 800px;
}
</style>

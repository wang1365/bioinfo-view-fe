<template>
    <q-dialog
        persistent
        full-width
        transition-show="fade"
        transition-hide="fade"
        v-model="dlgVisible"
        :title="title"
        :content-style="{ width: '800px' }"
        @hide="close()"
    >
        <q-card class="my-card">
            <q-bar>
                <q-icon name="mediation" />
                <div>流程管理</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup>
                    <q-tooltip>取消</q-tooltip>
                </q-btn>
            </q-bar>
            <q-form ref="qForm" @submit="onSubmit">
                <q-card-section class="q-pa-sm">
                    <div class="row q-col-gutter-x-lg q-pl-lg">
                        <div class="col-5 q-pa-sm">
                            <q-input
                                v-model="form.name"
                                label="流程名称" :label-color="labelColor"
                                stack-label filled
                                clearable
                                :readonly="isInfoMode"
                                :rules="[(val) => (val !== null && val !== '') || '请输入流程名称']"
                            />
                            <div class="row justify-between">
                                <q-input
                                    class="col-5" :label-color="labelColor"
                                    v-model="form.code"
                                    label="流程code"
                                    stack-label filled
                                    clearable
                                    :readonly="isInfoMode"
                                    :rules="[(val) => (val !== null && val !== '') || '请输入流程code']"
                                />
                                <q-select
                                    class="col-5"  :label-color="labelColor"
                                    v-model="form.panel"
                                    label="Panel"
                                    :options="panels"
                                    option-label="name"
                                    option-value="id"
                                    map-options  filled
                                    emit-value
                                    stack-label
                                />
                            </div>
                            <q-input
                                v-model="form.flow_category"
                                label="分类名称"  :label-color="labelColor"
                                stack-label filled
                                clearable
                                :readonly="isInfoMode"
                                :rules="[(val) => (val !== null && val !== '') || '请输入流程code']"
                            />
                            <q-input
                                v-model="form.memory"
                                :min="0"
                                :step="100"
                                label="内存(m)" :label-color="labelColor"
                                stack-label filled
                                clearable
                                :readonly="isInfoMode"
                                :rules="[(val) => (val !== null && val !== '') || '请输入内存数值']"
                            />

                            <q-input
                                v-model="form.tar_path"
                                label="Docker存档地址" :label-color="labelColor"
                                stack-label filled
                                clearable
                                :readonly="isInfoMode"
                                :rules="[(val) => (val !== null && val !== '') || '请输入docker存档路径']"
                            />
                            <q-input
                                v-model="form.image_name"
                                label="Docker镜像名称" :label-color="labelColor"
                                stack-label filled
                                clearable
                                :readonly="isInfoMode"
                                :rules="[(val) => (val !== null && val !== '') || '请输入docker镜像名称']"
                            />

                            <q-input
                                v-model="form.alignment_tool"
                                label="对比软件" :label-color="labelColor"
                                stack-label filled
                                clearable
                                :readonly="isInfoMode"
                                :rules="[(val) => (val !== null && val !== '') || '请输入对比软件']"
                            />
                        </div>
                        <div class="col-6 q-pa-sm">
                            <q-expansion-item default-opened icon="perm_identity" header-class="red" label="样本数目" class="shadow-1 bg-grey-3">
                                <q-radio
                                    v-model="form.sample_type"
                                    val="single"
                                    label="单样本"
                                    color="teal"
                                    keep-color
                                    :disable="isInfoMode"
                                />
                                <q-radio
                                    v-model="form.sample_type"
                                    val="double"
                                    label="配对样本"
                                    color="orange"
                                    keep-color
                                    :disable="isInfoMode"
                                />
                                <q-radio
                                    v-model="form.sample_type"
                                    val="multiple"
                                    label="多样本"
                                    color="cyan"
                                    keep-color
                                    :disable="isInfoMode"
                                />
                            </q-expansion-item>
                            <br />
                            <q-expansion-item
                                default-opened
                                icon="perm_identity"
                                label="支持非标准样本"
                                class="shadow-1 bg-grey-3"
                            >
                                <q-radio
                                    v-model="form.allow_nonstandard_samples"
                                    :val="true"
                                    label="是"
                                    color="teal"
                                    keep-color
                                    :disable="isInfoMode"
                                />
                                <q-radio
                                    v-model="form.allow_nonstandard_samples"
                                    :val="false"
                                    label="否"
                                    color="orange"
                                    keep-color
                                    :disable="isInfoMode"
                                />
                            </q-expansion-item>
                            <br />
                            <q-input
                                v-model="form.desp"
                                type="textarea"
                                filled
                                label="描 述"
                                stack-label
                                clearable
                                counter
                                :readonly="isInfoMode"
                            />
                            <br />
                            <q-input
                                v-model="form.details"
                                :readonly="isInfoMode"
                                type="textarea"
                                filled
                                :autosize="{ minRows: 18, maxRows: 380 }"
                                label="提示说明"
                                stack-label
                                clearable
                                counter
                            />
                        </div>
                    </div>
                </q-card-section>

                <!--        <param-table ref="builtinParams" :data="form.builtin_parameters" title="内置参数" />-->
                <param-table
                    ref="paramsTable"
                    title="自定义参数"
                    :readonly="isInfoMode"
                    :data="form.parameters"
                    :action="action"
                />

                <q-card-actions align="right">
                    <q-btn v-if="isInfoMode" label="确 定" color="primary" v-close-popup />
                    <q-btn v-if="!isInfoMode" label="确 定" color="primary" type="submit" />
                    <q-btn v-if="!isInfoMode" label="取 消" color="negative" v-close-popup />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup>
import ParamTable from './components/ParamTable'
import { getFlowDetail, createFlow, updateFlow } from 'src/api/flow'
import { getPanels } from "src/api/panel"
import { defineProps, computed, ref, toRefs, defineExpose, defineEmits, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const dlgVisible = ref(false)
const panels = ref([])
const titles = ref({
    edit: '修改流程',
    info: '流程详情',
    create: '新建流程',
})
const props = defineProps({
    action: {
        validator: (value) => {
            return ['edit', 'create', 'info'].indexOf(value) !== -1
        },
        default: 'info',
    },
    id: {
        type: Number,
        default: null,
        required: false
    },
})

const { id } = toRefs(props)

const labelColor = 'blue-7'

watch(id, v => {
    console.log('flow id changed:', v)
    getFlowDetail(v).then(res => {
        form.value = res
    })
})


const isEditMode = computed(() => {
    return props.action === 'edit'
})
const isInfoMode = computed(() => {
    return props.action === 'info'
})
const isCreateMode = computed(() => {
    return props.action === 'create'
})
const title = computed(() => {
    return titles[props.action]
})

const valueTypes = ['string', 'file']
const form = ref(null)
onMounted(() => {
    form.value = {
        id: -1,
        name: '',
        code: '',
        panel: null,
        allow_nonstandard_samples: true,
        tar_path: '',
        image_name: '',
        memory: 1024,
        alignment_tool: '',
        desp: '',
        flow_category: '',
        details: '',
        parameters: [],
        builtin_parameters: [],
        sample_type: 'multiple',
    }

    getPanels().then(res => {
        panels.value = res
    })
})

const paramsTable = ref(null)

const setData = (data) => {
    console.log('------> set data', data)
    // this.form = data
    // Object.assign(form.value, data)
    form.value = data
    if (paramsTable.value) {
        paramsTable.value.setData(data.parameters)
    }
}

const reset = () => {
    form.value = {
        parameters:[]
    }
}

const show = () => {
    dlgVisible.value = true
    console.log('dlg data is:', form.value)
}

defineExpose({ setData, reset, show })
const emit = defineEmits(['success'])

const addParam = (key) => {
    const idx = form.value.parameters.findIndex((item) => item.key === key)
    const newItem = {
        name: '',
        type: '',
        required: false,
        choices: [],
        default: null,
    }
    form.value.parameters.splice(idx + 1, 0, newItem)
}
const deleteParam = (row, index) => {
    this.form.parameters.splice(index, 1)
}

const close = () => {
    reset()

    dlgVisible.value = false
}

// const qForm = ref(null)
// const onConfirm = () => {
//     qForm.value.validate().then(success => {
//         if (success) {
//             // 是的，模型是正确的
//             onSubmit()
//         }
//     })
// }

const onSubmit = () => {
    console.log('start submit')
    if (isInfoMode.value) {
        console.log('not support info log')
        this.close()
    }

    for (const param of form.value.parameters) {
        if (param.key === undefined || param.key === '' || param.key === null) {
            $q.notify({ message: '自定义参数名不允许为空' })
            return
        }
    }

    const items = form.value.parameters.map((t) => t.key)
    if (items.length !== new Set(items).size) {
        $q.notify({ message: '存在相同名称的自定义参数' })
        return
    }

    if (isCreateMode.value) {
        // this.$refs.form.validate((valid) => {
        //     if (valid) {
        form.value.parameters = paramsTable.value.getData()
        createFlow(form.value).then(() => {
            $q.notify({ message: '流程创建成功' })
            emit('success')
            close()
        })
        // }
        // });
    }

    if (isEditMode.value) {
        form.value.parameters = paramsTable.value.getData()
        updateFlow(form.value.id, form.value).then(() => {
            $q.notify({ message: '修改成功' })
            emit('success')
            close()
        })
    }

    console.log('unsupported mode', props.action)
}
</script>

<style lang="scss" scoped>
.my-card {
    width: 100%;
    max-width: 800px;
}
</style>

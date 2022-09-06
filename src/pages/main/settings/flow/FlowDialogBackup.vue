<template>
    <q-dialog
        full-width
        full-height
        transition-show="scale"
        transition-hide="scale"
        v-model="dlgVisible"
        :title="title"
        class="q-pa-sm width:800px"
        @close="close"
    >
        <q-card>
            <q-form @submit="onSubmit">
            <q-bar>
                <q-icon name="mediation"/>
                <div>流程管理</div>
                <q-space/>
                <q-btn dense flat icon="close" v-close-popup>
                    <q-tooltip>Close</q-tooltip>
                </q-btn>
            </q-bar>
            <q-card-section>
                <q-list dense bordered>
                    <q-item dense>
                        <q-input v-model="form.name" label="流程名称" stack-label clearable
                                 :rules="[ val => val !== null && val !== '' || '请输入流程名称' ]"/>
                    </q-item>
                    <q-item dense>
                        <q-input v-model="form.code" label="流程code" stack-label clearable
                                 :rules="[ val => val !== null && val !== '' || '请输入流程code']"/>
                    </q-item>
                    <q-item dense>
                        <q-input v-model="form.flow_category" label="分类名称" stack-label clearable
                                 rules="[ val => val !== null && val !== '' || '请输入分类名称', ]"/>
                    </q-item>
                    <q-item dense>
                        <q-input v-model="form.memory" :min="0" :step="100" label="内存(m)" stack-label clearable
                                 :rules="[val => val !== null && val !== '' || '请输入内存数值']"
                        />
                    </q-item>
                    <q-item dense>
                        <q-input v-model="form.location" label="脚本路径" stack-label clearable
                                 :rules="[val => val !== null && val !== '' ||  '请输入脚本路径']"/>
                    </q-item>
                    <q-item dense>
                        <q-input v-model="form.alignment_tool" label="对比软件" stack-label clearable
                                 :rules="[val => val !== null && val !== '' || '请输入对比软件']"/>
                    </q-item>
                    <q-item dense prop="sample_count" label="样本数目" size="small"
                    >
                        <q-expansion-item default-opened icon="perm_identity" label="样本数目" class="shadow-1">
                            <q-radio v-model="form.sample_type" val="single" label="单样本" color="teal" keep-color/>
                            <q-radio v-model="form.sample_type" val="double" label="配对样本" color="orange" keep-color/>
                            <q-radio v-model="form.sample_type" val="multiple" label="多样本" color="cyan" keep-color/>
                        </q-expansion-item>
                    </q-item>
                    <q-item dense
                            prop="sample_count"
                            label="支持非标准样本"
                            size="small"
                    >
                        <q-expansion-item default-opened icon="perm_identity" label="支持非标准样本" class="shadow-1">
                            <q-radio v-model="form.allow_nonstandard_samples" val="true" label="是" color="teal"
                                     keep-color/>
                            <q-radio v-model="form.allow_nonstandard_samples" val="false" label="否" color="orange"
                                     keep-color/>
                        </q-expansion-item>
                    </q-item>

                </q-list>
            </q-card-section>
            <q-card-section class="q-gutter-lg row">
                <q-input v-model="form.desp" type="textarea" label="描 述" stack-label clearable/>
                <q-input
                    v-model="form.details"
                    type="textarea"
                    :autosize="{ minRows: 18, maxRows: 380 }"
                    label="提示说明"
                    stack-label clearable
                />
            </q-card-section>
            <!--        <param-table ref="builtinParams" :data="form.builtin_parameters" title="内置参数" />-->
            <param-table ref="paramsTable" :data="form.parameters" title="自定义参数" :action="action"/>

            <q-card-actions align="right">
<!--                <q-btn label="确 定" color="primary" @click="onConfirm"/>-->
                <q-btn label="确 定" color="primary" type="submit"/>
                <q-btn v-if="!isInfoMode" label="取 消" color="negative" v-close-popup/>
            </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup>
import ParamTable from "./components/ParamTable"
import {createFlow, updateFlow} from "src/api/flow"
import {defineProps, computed, ref, toRefs, defineExpose} from "vue"
import { useQuasar } from 'quasar'

const $q = useQuasar()
const dlgVisible = ref(false)
const titles = ref({
    edit: "修改流程",
    info: "流程详情",
    create: "新建流程",
})
const props = defineProps({
    action: {
        validator: (value) => {
            return ["edit", "create", "info"].indexOf(value) !== -1;
        },
        default: "info",
    },
    id: {
        type: Number,
        default: -1,
    },
})

const isEditMode = computed(() => {
    return props.action === "edit";
})
const isInfoMode = computed(() => {
    return props.action === "info";
})
const isCreateMode = computed(() => {
    return props.action === "create";
})
const title = computed(() => {
    return titles[props.action];
})
const valueTypes = ["string", "file"];
const form = ref({
    id: -1,
    name: "",
    code: "",
    allow_nonstandard_samples: true,
    location: "",
    memory: 1024,
    alignment_tool: "",
    desp: "",
    flow_category: "",
    details: "",
    parameters: [],
    builtin_parameters: [],
    sample_type: "multiple",
})
const formRules = {
    name: [{message: "流程名称不能为空", trigger: "blur"}],
    location: [{message: "脚本路径不能为空", trigger: "blur"}],
}

const paramsTable = ref(null)

const setData = (data) => {
    console.log("------> set data", data);
    // this.form = data
    Object.assign(form.value, data);
    if (paramsTable.value) {
        paramsTable.value.setData(data.parameters);
    }
}

const reset = () => {
    // this.$refs.params.resetFields()
    // this.$refs.builtinParams.resetFields()
    // this.$refs.form.resetFields()
}

const show = () => {
    dlgVisible.value = true
}
defineExpose({setData, reset, show})

const addParam = (key) => {
    const idx = form.value.parameters.findIndex((item) => item.key === key);
    const newItem = {
        name: "",
        type: "",
        required: false,
        choices: [],
        default: null,
    }
    form.value.parameters.splice(idx + 1, 0, newItem);
}
const deleteParam = (row, index) => {
    this.form.parameters.splice(index, 1);
}

const close = () => {
    if (!isInfoMode.value) {
        this.reset()
    }

    this.$emit("update:visible", false);
}
const onSubmit = () => {
    if (isInfoMode.value) {
        this.close();
    }

    for (const param of form.value.parameters) {
        if (param.key === undefined || param.key === "" || param.key === null) {
            $q.notify({message:"自定义参数名不允许为空"})
            return;
        }
    }

    const items = form.value.parameters.map((t) => t.key);
    if (items.length !== new Set(items).size) {
        $q.notify({message:"存在相同名称的自定义参数"})
        return;
    }

    if (isCreateMode.value) {
        // this.$refs.form.validate((valid) => {
        //     if (valid) {
                form.value.parameters = paramsTable.value.getData();
                createFlow(form.value).then(() => {
                    $q.notify({message:"流程创建成功"})
                    close()
                });
            // }
        // });
    }

    if (isEditMode.value) {
        this.$refs.form.validate((valid) => {
            ParamTable.vue;
            if (valid) {
                form.value.parameters = this.$refs.params.params;
                updateFlow(this.form.id, this.form).then(() => {
                    $q.notify({message:"修改成功"})
                    close();
                });
            }
        });
    }
}
</script>

<style lang="scss" scoped></style>

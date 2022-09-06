<template>
    <q-dialog
        v-model="dlgVisible"
        :title="title"
        class="q-pa-sm width:800px"
        @close="close"
    >
        <q-card class="row">
            <q-card-section>
                <q-list dense bordered>
                    <q-item dense
                            prop="name"
                            label="流程名称"
                            size="small"
                            :rules="[ val => val !== null && val !== '' || '请输入流程名称' ]"
                    >
                        <q-item-label>流程名称</q-item-label>
                        <q-input v-model="form.name"/>
                    </q-item>
                    <q-item dense
                            prop="code"
                            label="Code"
                            size="small"
                            :rules="[ val => val !== null && val !== '' || '请输入流程code']"
                    >
                        <q-item-label>流程code</q-item-label>
                        <q-input v-model="form.code"/>
                    </q-item>
                    <q-item dense
                            prop="flow_category"
                            label="分 类"
                            size="small"
                            :rules="[
                                val => val !== null && val !== '' || '请输入分类名称',
                            ]"
                    >
                        <q-item-label>分类名称</q-item-label>
                        <q-input v-model="form.flow_category"/>
                    </q-item>
                    <q-item dense
                            prop="flow_category"
                            label="内存(m)"
                            size="small"
                            :rules="[val => val !== null && val !== '' || '请输入内存数值']"
                    >
                        <q-item-label>内存数值</q-item-label>
                        <q-input-number v-model="form.memory" :min="0" :step="100"/>
                    </q-item>
                    <q-item dense
                            prop="location"
                            label="脚本路径"
                            size="small"
                            :rules="[val => val !== null && val !== '' ||  '请输入脚本路径']"
                    >
                        <q-item-label>脚本路径</q-item-label>
                        <q-input v-model="form.location"/>
                    </q-item>
                    <q-item dense
                            prop="alignment_tool"
                            label="对比软件"
                            size="small"
                            :rules="[val => val !== null && val !== '' || '请输入对比软件']"
                    >
                        <q-input v-model="form.alignment_tool"/>
                    </q-item>
                    <q-item dense prop="sample_count" label="样本数目" size="small"
                    >
                        <el-radio-group v-model="form.sample_type">
                            <el-radio label="single">单样本</el-radio>
                            <el-radio label="double">配对样本</el-radio>
                            <el-radio label="multiple">多样本</el-radio>
                        </el-radio-group>
                    </q-item>
                    <q-item dense
                            prop="sample_count"
                            label="支持非标准样本"
                            size="small"
                    >
                        <el-radio-group
                            v-model="form.allow_nonstandard_samples"
                        >
                            <el-radio :label="true">是</el-radio>
                            <el-radio :label="false">否</el-radio>
                        </el-radio-group>
                    </q-item>
                    <q-item prop="desp" label="描述">
                        <q-input v-model="form.desp" type="textarea"/>
                    </q-item>
                </q-list>
            </q-card-section>
            <q-card-section>
                <q-item prop="details" label="提示说明">
                    <q-input
                        v-model="form.details"
                        type="textarea"
                        :autosize="{ minRows: 18, maxRows: 380 }"
                    />
                </q-item>
            </q-card-section>
            <!--        <param-table ref="builtinParams" :data="form.builtin_parameters" title="内置参数" />-->
            <param-table ref="paramsTable" :data="form.parameters" title="自定义参数" :action="action"/>

            <q-card-actions align="right">
                <q-btn label="确 定" color="primary" @click="onConfirm"/>
                <q-btn v-if="!isInfoMode" label="取 消" color="negative" v-close-popup/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import ParamTable from "./components/ParamTable";
import {createFlow, updateFlow} from "src/api/flow";
import {defineProps, computed, ref, toRefs, defineExpose} from "vue";

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
const {action, id} = toRefs(props)

const isEditMode = computed(() => {
    return action === "edit";
})
const isInfoMode = computed(() => {
    return action === "info";
})
const isCreateMode = computed(() => {
    return action === "create";
})
const title = computed(() => {
    return titles[action];
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
    if (!this.isInfoMode) {
        this.reset();
    }

    this.$emit("update:visible", false);
}
const onConfirm = () => {
    if (this.isInfoMode) {
        this.close();
    }

    for (const param of this.form.parameters) {
        if (param.key === undefined || param.key === "" || param.key === null) {
            this.$message.error("自定义参数名不允许为空");
            return;
        }
    }

    const items = this.form.parameters.map((t) => t.key);
    if (items.length !== new Set(items).size) {
        this.$message.error("存在相同名称的自定义参数");
        return;
    }

    if (this.isCreateMode) {
        this.$refs.form.validate((valid) => {
            if (valid) {
                this.form.parameters = this.$refs.params.params;
                createFlow(this.form).then(() => {
                    this.$message.success("流程创建成功");
                    this.close();
                });
            }
        });
    }

    if (this.isEditMode) {
        this.$refs.form.validate((valid) => {
            ParamTable.vue;
            if (valid) {
                this.form.parameters = this.$refs.params.params;
                updateFlow(this.form.id, this.form).then(() => {
                    this.$message.success("修改成功");
                    this.close();
                });
            }
        });
    }
}
</script>

<style lang="scss" scoped></style>

<template>
    <q-card style="width: 80vw; max-width: 80vw">
        <PopupContentScroll title="创建任务">
            <template v-slot:contentBody>
                <div class="q-py-md">
                    <div class="text-h6">参数填写:</div>
                    <div>
                        <q-input
                            v-model="newTaskName"
                            label="任务名称"
                        ></q-input>
                    </div>
                    <div class="row">
                        <template
                            v-for="param of convertParameterSchema()"
                            :key="param.key"
                        >
                            <div
                                class="col-6 q-pr-sm"
                                v-if="param.type == 'string'"
                            >
                                <q-input
                                    v-model="param.value"
                                    :label="param.key"
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-input>
                            </div>
                            <div
                                class="col-6 q-pr-sm"
                                v-if="param.type == 'number'"
                            >
                                <q-input
                                    type="number"
                                    v-model="param.value"
                                    :label="param.key"
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-input>
                            </div>
                            <div
                                class="col-6 q-pr-sm"
                                v-if="param.type == 'select'"
                            >
                                <q-select
                                    v-model="param.value"
                                    :options="param.choices"
                                    :label="param.key"
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-select>
                            </div>
                        </template>
                    </div>
                    <div class="text-h6 q-py-md">数据</div>
                    <div v-if="props.flowDetail.sample_type == 'single'">
                        <div class="row">
                            <div class="col-6">
                                <q-btn
                                    label="选择数据"
                                    color="primary"
                                    style="width: 100%"
                                ></q-btn>
                            </div>
                        </div>
                    </div>
                    <div v-if="props.flowDetail.sample_type == 'double'">
                        <div class="row">
                            <div class="col">
                                <q-btn
                                    label="选择数据-1"
                                    color="primary"
                                    style="width: 99%"
                                ></q-btn>
                            </div>
                            <div class="col">
                                <q-btn
                                    label="选择数据-2"
                                    color="secondary"
                                    style="width: 99%"
                                ></q-btn>
                            </div>
                        </div>
                    </div>
                    <div v-if="props.flowDetail.sample_type == 'multiple'">
                        <div class="row">
                            <div class="col-6">
                                <q-btn
                                    label="选择数据"
                                    color="primary"
                                    style="width: 100%"
                                ></q-btn>
                            </div>
                        </div>
                    </div>
                </div>
                <q-separator />
                <div class="text-h6 q-py-md">流程信息:</div>
                <div>
                    <div class="row">
                        <div class="col">名称: {{ props.flowDetail.name }}</div>
                        <div class="col">Code: {{ props.flowDetail.code }}</div>
                    </div>
                    <div class="row q-col-gutter-md">
                        <div class="col">
                            样本数目:
                            {{ sampleTypetrans(props.flowDetail) }}
                        </div>
                        <div class="col">
                            是否支持非标准样本:
                            {{
                                props.flowDetail.allow_nonstandard_samples
                                    ? "是"
                                    : "否"
                            }}
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">描述: {{ props.flowDetail.desc }}</div>
                    </div>
                    <div class="row">
                        <div class="col">
                            提示说明: {{ props.flowDetail.details }}
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:contentFooter>
                <q-btn label="取消" v-close-popup />
                <q-btn color="primary" label="确定" @click="clickConfirm" />
            </template>
        </PopupContentScroll>
    </q-card>
</template>

<script setup>
import { defineProps, ref, toRefs, defineEmits } from "vue";
import PopupContentScroll from "src/components/popup-content-scroll/PopupContentScroll.vue";
import { useApi } from "src/api/apiBase";

const { apiPost } = useApi();
const emit = defineEmits(["taskCreated"]);
const props = defineProps({
    flowDetail: { type: Object, required: true },
    projectId: { type: Number, required: true },
});

const newTaskName = ref("");
const convertParameterSchema = () => {
    return JSON.parse(props.flowDetail.parameter_schema);
};

const { flowId } = toRefs(props);

const confirmTaskCreated = () => {
    apiPost(
        "/task",
        (res) => {
            console.log(res);
            emit("taskCreated");
        },
        {
            name: newTaskName.value,
            project_id: props.projectId,
            flow_id: props.flowDetail.id,
        },
        (error) => {
            console.log(error);
        }
    );
};
const sampleTypetrans = (flow) => {
    switch (flow.sample_type) {
        case "single":
            return "单样本";
        case "double":
            return "配对样本";
        case "multiple":
            return "多样本";
    }
};
</script>

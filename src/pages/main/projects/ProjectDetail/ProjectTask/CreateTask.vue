<template>
    <q-card style="width: 80vw; max-width: 80vw">
        <PopupContentScroll :title="$t('ProjectDetailPageCreateTask')">
            <template v-slot:contentBody>
                <div class="text-h6 q-py-md">{{ $t('Flow') }}:</div>
                <div>
                    <div class="row q-col-gutter-md">
                        <div class="col">{{ $t('FlowName') }}: {{ props.flowDetail.name }}</div>
                        <div class="col">{{ $t('Code') }}: {{ props.flowDetail.code }}</div>
                    </div>
                    <div class="row q-col-gutter-md">
                        <div class="col">
                            {{ $t('Sample') }}:
                            {{ sampleTypetrans(props.flowDetail) }}
                        </div>
                        <div class="col">
                            {{ $t('SupportNonStandardSample') }}:
                            {{
                            props.flowDetail.allow_nonstandard_samples
                            ? $t('Yes')
                            : $t('No')
                            }}
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">{{$t('FlowDetail')}}: {{ props.flowDetail.desc }}</div>
                    </div>
                    <div class="row">
                        <div class="col">{{ $t('Note') }}: {{ props.flowDetail.details }}</div>
                    </div>
                </div>
                <q-separator />
                <div class="q-py-md">
                    <div class="text-h6">{{ $t('CustomParameters') }}:</div>
                    <div>
                        <q-input
                            v-model="newTaskName"
                            :label="$t('Task')"
                            :error="newTaskNameError"
                            :error-message="$t('Required')"
                        >
                        </q-input>
                    </div>
                    <div class="row">
                        <template v-for="param of paramsDefine" :key="param.key">
                            <div class="col-6 q-pr-sm" v-if="param.type == 'file'">
                                <q-file
                                    :error="param.isError"
                                    :error-message="param.error"
                                    v-model="params[param.key]"
                                    :label="param.key"
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-file>
                            </div>
                            <div class="col-6 q-pr-sm" v-if="param.type == 'string'">
                                <q-input
                                    :error="param.isError"
                                    :error-message="param.error"
                                    v-model="params[param.key]"
                                    :label="param.key"
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-input>
                            </div>
                            <div class="col-6 q-pr-sm" v-if="param.type == 'number'">
                                <q-input
                                    :error="param.isError"
                                    :error-message="param.error"
                                    type="number"
                                    v-model="params[param.key]"
                                    :label="param.key"
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-input>
                            </div>
                            <div class="col-6 q-pr-sm" v-if="param.type == 'select'">
                                <q-select
                                    :error="param.isError"
                                    :error-message="param.error"
                                    v-model="params[param.key]"
                                    :options="param.choices"
                                    :label="param.key"
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-select>
                            </div>
                            <div class="col-6 q-pr-sm" v-if="param.type == 'multiSelect'">
                                <q-select
                                    :error="param.isError"
                                    :error-message="param.error"
                                    v-model="params[param.key]"
                                    :options="param.choices"
                                    :label="param.key"
                                    multiple
                                    use-chips
                                >
                                    <q-tooltip>{{
                                        param.description
                                    }}</q-tooltip>
                                </q-select>
                            </div>
                        </template>
                    </div>
                    <div class="text-h6 q-py-md">{{ $t('Data') }}</div>
                    <div v-if="props.flowDetail.sample_type == 'single'">
                        <div class="row">
                            <div class="col-6">
                                <q-btn
                                    :label="
                                        `${$t('Select')}${$t('Data')}-1: ` + sampleFirst?.identifier
                                    "
                                    color="primary"
                                    style="width: 100%"
                                    @click="selectSingle()"
                                ></q-btn>
                            </div>
                            <div class="col-6" v-if="sampleFirstError">
                                <span class="text-red text-bold">{{`${$t('Data')} ${$t('Required')}`}}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="props.flowDetail.sample_type == 'double'">
                        <div class="row">
                            <div class="col-6">
                                <q-btn
                                    :label="
                                        `${$t('Select')}${$t('Data')}-1: ` + sampleFirst?.identifier
                                    "
                                    color="primary"
                                    style="width: 99%"
                                    @click="selectFirst()"
                                ></q-btn>
                            </div>
                            <div class="col-6">
                                <q-btn
                                    :label="
                                        `${$t('Select')}${$t('Data')}-2: ` +
                                        sampleSecond?.identifier
                                    "
                                    color="secondary"
                                    style="width: 99%"
                                    @click="selectSecond()"
                                ></q-btn>
                            </div>
                            <div class="col-6">
                                <span
                                    v-if="sampleFirstError"
                                    class="text-red text-bold"
                                    >{{`${$t('Data')} ${$t('Required')}`}}</span
                                >
                            </div>
                            <div class="col-6">
                                <span
                                    v-if="sampleSecondError"
                                    class="text-red text-bold"
                                    >{{`${$t('Data')} ${$t('Required')}`}}</span
                                >
                            </div>
                        </div>
                    </div>
                    <div v-if="props.flowDetail.sample_type == 'multiple'">
                        <div class="row">
                            <div class="col-6">
                                <q-btn
                                    :label="$t('Select')+$t('Data')"
                                    color="primary"
                                    style="width: 100%"
                                    @click="selectMulti()"
                                ></q-btn>
                            </div>
                            <div class="col-6" v-if="samplesError">
                                <span class="text-red text-bold">{{`${$t('Data')} ${$t('Required')}`}}</span>
                            </div>
                            <div class="col-12">
                                <q-chip
                                    v-for="sample of samples"
                                    :key="sample.id"
                                    class="glossy"
                                    color="primary"
                                    text-color="white"
                                >
                                    {{sample.identifier}}
                                </q-chip>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:contentFooter>
                <q-btn :label="$t('Cancel')" v-close-popup />
                <q-btn color="primary" :label="$t('Confirm')" @click="confirmTaskCreated()" />
            </template>
        </PopupContentScroll>
        <q-dialog persistent v-model="openDataSelectorSingle">
            <TaskDataSelectSingle :projectDetail="props.projectDetail" @refresh="singleSelected($event)" />
        </q-dialog>
        <q-dialog persistent v-model="openDataSelectorMulti">
            <TaskDataSelectMulti :projectDetail="props.projectDetail" @refresh="multiSelected($event)" />
        </q-dialog>
    </q-card>
</template>

<script setup>
import { defineProps, ref, toRefs, defineEmits, onMounted } from "vue";
import PopupContentScroll from "src/components/popup-content-scroll/PopupContentScroll.vue";
import TaskDataSelectMulti from "./TaskDataSelectMulti.vue";
import TaskDataSelectSingle from "./TaskDataSelectSingle.vue";
import { useApi } from "src/api/apiBase";
import { errorMessage,infoMessage } from "src/utils/notify";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const { apiPost } = useApi();
const openDataSelectorSingle = ref(false);
const openDataSelectorMulti = ref(false);
const newTaskName = ref("");
const newTaskNameError = ref(false);
const paramsDefine = ref([]);
const params = ref({});

const samples = ref([]);
const sampleFirst = ref({});
const sampleSecond = ref({});
const currentSample = ref("first");
const sampleFirstError = ref(false);
const sampleSecondError = ref(false);
const samplesError = ref(false);

const emit = defineEmits(["taskCreated"]);
const props = defineProps({
    flowDetail: { type: Object, required: true },
    projectDetail: { type: Object, required: true },
});
const { flowId } = toRefs(props);

onMounted(() => {
    let flowParams = JSON.parse(props.flowDetail.parameter_schema);
    for (const param of flowParams) {
        paramsDefine.value.push({
            required: param.required,
            key: param.key,
            type: param.type,
            description: param.description,
            choices: param.choices,
            error: t('Required'),
            isError: false,
        });
        params.value[param.key] = null;
    }
});

const selectSingle = () => {
    currentSample.value = "first";
    openDataSelectorSingle.value = true;
};
const selectFirst = () => {
    currentSample.value = "first";
    openDataSelectorSingle.value = true;
};
const selectSecond = () => {
    currentSample.value = "second";
    openDataSelectorSingle.value = true;
};
const selectMulti = () => {
    currentSample.value = "multi";
    openDataSelectorMulti.value = true;
};

const singleSelected = (event) => {
    openDataSelectorSingle.value = false;
    if (currentSample.value == "first") {
        sampleFirst.value = event;
    } else {
        sampleSecond.value = event;
    }
    console.log(event);
};

const multiSelected = (event) => {
    openDataSelectorMulti.value = false;
    samples.value = event;
    console.log(event);
};

const confirmTaskCreated = () => {
    let paramsError = false;

    if (!newTaskName.value) {
        newTaskNameError.value = true;
        paramsError = true;
    } else {
        newTaskNameError.value = false;
    }
      let data = new FormData();
    let taskParameter = [];
     for (let param of paramsDefine.value) {

        if (!params.value[param.key] && param.required) {
            param.isError = true;
            paramsError = true;
        } else {
            if (param.type === 'file') {
                data.append(param.key,params.value[param.key])
            }
            else {
            taskParameter.push({
                key: param.key,
                value: params.value[param.key],
            });
            }
            param.isError = false;
        }
    }

    let taskSamples = [];
    switch (props.flowDetail.sample_type) {
        case "single": {
            if (!sampleFirst.value.id) {
                sampleFirstError.value = true;
                paramsError = true;
            } else {
                sampleFirstError.value = false;
                taskSamples.push(sampleFirst.value.id);
            }
            break;
        }
        case "double": {
            if (!sampleFirst.value.id) {
                sampleFirstError.value = true;
                paramsError = true;
            } else {
                taskSamples.push(sampleFirst.value.id);
                sampleFirstError.value = false;
            }
            if (!sampleSecond.value.id) {
                sampleSecondError.value = true;
                paramsError = true;
            } else {
                taskSamples.push(sampleSecond.value.id);
                sampleSecondError.value = false;
            }
            break;
        }
        case "multiple": {
            if (samples.value.length == 0) {
                samplesError.value = true;
                paramsError = true;
            } else {
                for (const item of samples.value) {
                    taskSamples.push(item.id);
                }
                samplesError.value = false;
            }
            break;
        }
    }
    if (paramsError) {
        errorMessage("Fix Error");
        return;
    }


    data.append("flow_id", props.flowDetail.id);
    data.append("project_id", props.projectDetail.id);
    data.append("samples", taskSamples.join(","));
    data.append("parameter", JSON.stringify(taskParameter));
    data.append("name", newTaskName.value);

    apiPost(
        "/task",
        (res) => {
            infoMessage("Success")
            emit("taskCreated");
        },
        data
    );
};
const sampleTypetrans = (flow) => {
    switch (flow.sample_type) {
        case "single":
            return t('SingleSample');
        case "double":
            return t('PairSample');
        case "multiple":
            return t('MultipleSample');
    }
};
</script>

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
                        <div class="col">{{ $t('FlowDetail') }}: {{ props.flowDetail.desc }}</div>
                    </div>
                    <div class="row">
                        <div class="col">{{ $t('Detail') }}: {{ props.flowDetail.details }}</div>
                    </div>
                </div>
                <q-separator />
                <div>
                    <q-splitter v-model="splitterModel">
                        <template v-slot:before>
                            <q-list bordered separator>
                                <q-item
                                    v-ripple
                                    v-for="item, index in paramTabs"
                                    :key="index"
                                    :name="item.name"
                                    :class="{ 'bg-primary': index == activeParamTab, 'text-white': index == activeParamTab }"
                                >
                                    <span class="cursor-pointer" @click="activeParamTab = index"
                                        >{{ $t('Task')


























































                                        }}&nbsp;{{ index + 1
                                        }}
                                    </span>
                                    <q-icon
                                        name="delete"
                                        color="red"
                                        class="q-ml-md cursor-pointer"
                                        @click="deleteParamTab(index)"
                                    ></q-icon>
                                    <q-icon
                                        name="error"
                                        color="red"
                                        style="float:right;top:0px;right:-10px"
                                        v-if="item.isError"
                                    ></q-icon>
                                </q-item>
                                <q-item clickable class="center" @click="addParamTab()">
                                    <q-btn icon="add" color="primary" outline></q-btn>
                                </q-item>
                            </q-list>
                        </template>

                        <template v-slot:after>
                            <div v-for="item, index in paramTabs" :key="index">
                                <div class="q-pa-md" v-if="activeParamTab === index">
                                    <div class="text-h6">{{ $t('CustomParameters') }}:</div>
                                    <div>
                                        <q-input
                                            v-model="item.name"
                                            :label="$t('Task')"
                                            :error="item.nameError"
                                            :error-message="$t('Required')"
                                        >
                                        </q-input>
                                    </div>
                                    <div class="row">
                                        <template v-for="param of paramsDefine" :key="param.key">
                                            <div class="col-6 q-pr-sm" v-if="param.type == 'file'">
                                                <q-file
                                                    :error="item.params[param.key].isError"
                                                    :error-message="param.error"
                                                    v-model="item.params[param.key].value"
                                                    :label="param.key"
                                                >
                                                    <q-tooltip>{{
                                                        param.description
                                                    }}</q-tooltip>
                                                </q-file>
                                            </div>
                                            <div class="col-6 q-pr-sm" v-if="param.type == 'string'">
                                                <q-input
                                                    :error="item.params[param.key].isError"
                                                    :error-message="param.error"
                                                    v-model="item.params[param.key].value"
                                                    :label="param.key"
                                                >
                                                    <q-tooltip>{{
                                                        param.description
                                                    }}</q-tooltip>
                                                </q-input>
                                            </div>
                                            <div class="col-6 q-pr-sm" v-if="param.type == 'number'">
                                                <q-input
                                                    :error="item.params[param.key].isError"
                                                    :error-message="param.error"
                                                    type="number"
                                                    v-model="item.params[param.key].value"
                                                    :label="param.key"
                                                >
                                                    <q-tooltip>{{
                                                        param.description
                                                    }}</q-tooltip>
                                                </q-input>
                                            </div>
                                            <div class="col-6 q-pr-sm" v-if="param.type == 'select'">
                                                <q-select
                                                    :error="item.params[param.key].isError"
                                                    :error-message="param.error"
                                                    v-model="item.params[param.key].value"
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
                                                    :error="item.params[param.key].isError"
                                                    :error-message="param.error"
                                                    v-model="item.params[param.key].value"
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
                                        <div
                                            class="row q-my-md q-pa-sm shadow-1"
                                            v-for="file, file_index in item.files"
                                            :key="`${index}_${file_index}`"
                                            :id="`${index}_${file_index}`"
                                        >
                                            <div class="col-5">
                                                <q-btn
                                                    :label="`${$t('Select')}${$t('Data')}-1: ` + file.sampleFirst?.identifier
                                                    "
                                                    color="primary"
                                                    style="width: 100%"
                                                    @click="selectSingle(file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-2">
                                                <q-btn
                                                    icon="delete"
                                                    color="red"
                                                    @click="deleteParamTabFiles(index, file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-5" v-if="file.sampleFirstError">
                                                <span class="text-red text-bold">{{ `${$t('Data')}
                                                    ${$t('Required')}` }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="props.flowDetail.sample_type == 'double'">
                                        <div
                                            class="row q-my-md q-pa-sm shadow-1"
                                            v-for="file, file_index in item.files"
                                            :key="`${index}_${file_index}`"
                                            :id="`${index}_${file_index}`"
                                        >
                                            <div class="col-5">
                                                <q-btn
                                                    :label="`${$t('Select')}${$t('Data')}-1: ` + file.sampleFirst?.identifier
                                                    "
                                                    color="primary"
                                                    style="width: 99%"
                                                    @click="selectFirst(file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-5">
                                                <q-btn
                                                    :label="`${$t('Select')}${$t('Data')}-2: ` +
                                                    file.sampleSecond?.identifier
                                                    "
                                                    color="secondary"
                                                    style="width: 99%"
                                                    @click="selectSecond(file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-2">
                                                <q-btn
                                                    icon="delete"
                                                    color="red"
                                                    @click="deleteParamTabFiles(index, file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-6">
                                                <span v-if="file.sampleFirstError" class="text-red text-bold"
                                                    >{{
                                                    `${$t('Data')}
                                                    ${$t('Required')}` }}
                                                    {{ file.sampleFirstError }}</span
                                                >
                                            </div>
                                            <div class="col-6">
                                                <span v-if="file.sampleSecondError" class="text-red text-bold"
                                                    >{{
                                                    `${$t('Data')}
                                                    ${$t('Required')}` }}
                                                    {{ file.sampleSecondError }}</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="props.flowDetail.sample_type == 'multiple'" class="">
                                        <div
                                            class="row q-my-md q-pa-sm shadow-1"
                                            v-for="file, file_index in item.files"
                                            :key="`${index}_${file_index}`"
                                            :id="`${index}_${file_index}`"
                                        >
                                            <div class="col-5">
                                                <q-btn
                                                    :label="$t('Select') + $t('Data')"
                                                    color="primary"
                                                    style="width: 100%"
                                                    @click="selectMulti(file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-2">
                                                <q-btn
                                                    icon="delete"
                                                    color="red"
                                                    @click="deleteParamTabFiles(index, file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-5" v-if="file.samplesError">
                                                <span class="text-red text-bold">{{ `${$t('Data')}
                                                    ${$t('Required')}` }}</span>
                                            </div>

                                            <div class="col-12">
                                                <q-chip
                                                    v-for="sample of file.samples"
                                                    :key="sample.id"
                                                    class="glossy"
                                                    color="primary"
                                                    text-color="white"
                                                >
                                                    {{ sample.identifier }}
                                                </q-chip>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="props.flowDetail.sample_type == 'double_multiple'">
                                        <div
                                            class="row q-my-md q-pa-sm shadow-1"
                                            v-for="file, file_index in item.files"
                                            :key="`${index}_${file_index}`"
                                            :id="`${index}_${file_index}`"
                                        >
                                            <div class="col-5">
                                                <q-btn
                                                    :label="$t('Select') + $t('Data')"
                                                    color="primary"
                                                    style="width: 100%"
                                                    @click="selectFirstMulti(file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-5">
                                                <q-btn
                                                    :label="$t('Select') + $t('Data')"
                                                    color="secondary"
                                                    style="width: 100%"
                                                    @click="selectSecondMulti(file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-2">
                                                <q-btn
                                                    icon="delete"
                                                    color="red"
                                                    @click="deleteParamTabFiles(index, file_index)"
                                                ></q-btn>
                                            </div>
                                            <div class="col-5">
                                                <span v-if="file.samplesFirstError" class="text-red text-bold">{{
                                                    `${$t('Data')}
                                                    ${$t('Required')}` }}</span>
                                            </div>
                                            <div class="col-5">
                                                <span v-if="file.samplesSecondError" class="text-red text-bold">{{
                                                    `${$t('Data')}
                                                    ${$t('Required')}` }}</span>
                                            </div>
                                            <div class="col-5">
                                                <q-chip
                                                    v-for="sample of file.samplesFirst"
                                                    :key="sample.id"
                                                    class="glossy"
                                                    color="primary"
                                                    text-color="white"
                                                >
                                                    {{ sample.identifier }}
                                                </q-chip>
                                            </div>
                                            <div class="col-5">
                                                <q-chip
                                                    v-for="sample of file.samplesSecond"
                                                    :key="sample.id"
                                                    class="glossy"
                                                    color="secondary"
                                                    text-color="white"
                                                >
                                                    {{ sample.identifier }}
                                                </q-chip>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="q-my-md">
                                        <q-btn
                                            icon="add"
                                            color="primary"
                                            style="width: 100%"
                                            @click="addParamTabFiles(index)"
                                            >{{ $t('Add') }}
                                            {{ $t('Data')
                                            }}</q-btn
                                        >
                                    </div>
                                </div>
                            </div>
                        </template>
                    </q-splitter>
                </div>
            </template>
            <template v-slot:contentFooter>
                <q-btn :label="$t('Cancel')" v-close-popup />
                <q-btn color="primary" :label="$t('Confirm')" @click="confirmTaskCreated()" />
            </template>
        </PopupContentScroll>
        <!-- <q-dialog persistent v-model="openDataSelectorSingle">
            <TaskDataSelect :multi-select="false" :projectDetail="props.projectDetail" @select="onSelect($event)" />
        </q-dialog>
        <q-dialog persistent v-model="openDataSelectorMulti">
            <TaskDataSelect :multi-select="true" :projectDetail="props.projectDetail" @select="onSelectMulti($event)" />
        </q-dialog> -->
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
import { errorMessage, infoMessage } from "src/utils/notify";
import { useI18n } from "vue-i18n";
import { event } from "quasar";
const { t } = useI18n();
const { apiPost, apiGet } = useApi();
const openDataSelectorSingle = ref(false);
const openDataSelectorMulti = ref(false);
const newTaskName = ref("");
const newTaskNameError = ref(false);
const paramsDefine = ref([]);
const newTabParams = ref({})
const newTabParamFiles = ref([])
const params = ref({});

const paramTabs = ref([])
const activeParamTab = ref(0)
const activeParamFileIndex = ref(0)

const samples = ref([]);
const sampleFirst = ref({});
const sampleSecond = ref({});
const currentSample = ref("first");
const sampleFirstError = ref(false);
const sampleSecondError = ref(false);
const samplesError = ref(false);

const emit = defineEmits(["taskCreated"])
const props = defineProps({
    flowDetail: { type: Object, required: true },
    projectDetail: { type: Object, required: true },
})
const { flowId } = toRefs(props)

onMounted(() => {
    let flowParams = JSON.parse(props.flowDetail.parameter_schema);
    let params = {}
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
        params[param.key] = { value: null, isError: false }
    }
    console.log(paramsDefine)

    let file = []
    switch (props.flowDetail.sample_type) {
        case 'single': { file = { sampleFirst: {}, sampleFirstError: false }; break; };
        case 'double': {
            file = {
                sampleFirst: {},
                sampleSecond: {},
                sampleFirstError: false,
                sampleSecondError: false,
            }; break
        };
        case 'multiple': {
            file = {
                samples: [],
                samplesError: false,
            };
            break
        };
        case 'double_multiple': {
            file = {
                samplesFirst: [],
                samplesSecond: [],
                samplesFirstError: false,
                samplesSecondError: false,
            };
            break
        }

    }
    newTabParamFiles.value = file
    newTabParams.value = { params: params, files: [file], name: "", isError: false };
    paramTabs.value.push(
        JSON.parse(JSON.stringify(newTabParams.value))
    )
});
const addParamTab = () => {
    paramTabs.value.push(
        JSON.parse(JSON.stringify(newTabParams.value))
    )
    activeParamTab.value = paramTabs.value.length - 1
    console.log(paramTabs.value)
}
const deleteParamTab = (index) => {
    if (paramTabs.value.length > 1)
        paramTabs.value.splice(index, 1)
    activeParamTab.value = 0
}

const addParamTabFiles = (index) => {
    paramTabs.value[index].files.push(
        JSON.parse(JSON.stringify(newTabParamFiles.value))
    )
    console.log(paramTabs.value)
}
const deleteParamTabFiles = (index, file_index) => {
    if (paramTabs.value[index].files.length > 1)
        paramTabs.value[index].files.splice(file_index, 1)
}
const selectSingle = (index) => {
    activeParamFileIndex.value = index
    currentSample.value = "first";
    openDataSelectorSingle.value = true;
};
const selectFirst = (index) => {
    activeParamFileIndex.value = index
    currentSample.value = "first";
    openDataSelectorSingle.value = true;
};
const selectSecond = (index) => {
    activeParamFileIndex.value = index
    currentSample.value = "second";
    openDataSelectorSingle.value = true;
};
const selectMulti = (index) => {
    activeParamFileIndex.value = index
    currentSample.value = "multi";
    openDataSelectorMulti.value = true;
};
const selectFirstMulti = (index) => {
    activeParamFileIndex.value = index
    currentSample.value = "first-multi";
    openDataSelectorMulti.value = true;
};
const selectSecondMulti = (index) => {
    activeParamFileIndex.value = index
    currentSample.value = "second-multi";
    openDataSelectorMulti.value = true;
};

const singleSelected = (event) => {
    openDataSelectorSingle.value = false;
    if (currentSample.value == "first") {
        paramTabs.value[activeParamTab.value].files[activeParamFileIndex.value].sampleFirst = event
        sampleFirst.value = event;
    } else {
        paramTabs.value[activeParamTab.value].files[activeParamFileIndex.value].sampleSecond = event
        sampleSecond.value = event;
    }
}

const multiSelected = (event) => {
    openDataSelectorMulti.value = false;
    if (currentSample.value == "multi") {
        paramTabs.value[activeParamTab.value].files[activeParamFileIndex.value].samples = event
    } else if (currentSample.value == "first-multi") {
        paramTabs.value[activeParamTab.value].files[activeParamFileIndex.value].samplesFirst = event
    } else {
        paramTabs.value[activeParamTab.value].files[activeParamFileIndex.value].samplesSecond = event
    }
    samples.value = event;
    console.log(event);
};

const confirmTaskCreated = () => {
    let hasError = false;
    let datas = []
    for (let taskParam of paramTabs.value) {
        let taskParameter = [];
        let taskHasError = false
        if (!taskParam.name) {
            taskParam.nameError = true;
            hasError = true
            taskHasError = true
        } else {
            taskParam.nameError = false;
        }
        let uploadFiles = []
        for (let param of paramsDefine.value) {
            if (!taskParam.params[param.key].value && param.required) {
                taskParam.params[param.key].isError = true
                hasError = true
                taskHasError = true
            } else {
                if (param.type === 'file') {
                    uploadFiles.push([param.key, taskParam.params[param.key].value])
                }
                else {
                    taskParameter.push({
                        key: param.key,
                        value: taskParam.params[param.key].value,
                    });
                }
                taskParam.params[param.key].isError = false
            }
        }

        for (let file of taskParam.files) {

            let taskSamples = ""
            switch (props.flowDetail.sample_type) {
                case "single": {
                    let samples = []
                    if (!file.sampleFirst.id) {
                        file.sampleFirstError = true
                        taskHasError = true
                        hasError = true
                    } else {
                        file.sampleFirstError = false
                        samples.push(file.sampleFirst.id)
                    }
                    taskSamples = samples.join(",")

                    break
                }
                case "double": {
                    let samples = []
                    if (!file.sampleFirst.id) {
                        file.sampleFirstError = true
                        taskHasError = true
                        hasError = true
                    } else {
                        samples.push(file.sampleFirst.id)
                        file.sampleFirstError = false
                    }
                    if (!file.sampleSecond.id) {
                        file.sampleSecondError = true
                        taskHasError = true
                        hasError = true
                    } else {
                        samples.push(file.sampleSecond.id)
                        file.sampleSecondError = false
                    }
                    taskSamples = samples.join(",")
                    break
                }
                case "multiple": {
                    let samples = []
                    if (file.samples.length === 0) {
                        file.samplesError = true
                        taskHasError = true
                        hasError = true
                    } else {
                        for (const item of file.samples) {
                            samples.push(item.id)
                        }
                        file.samplesError = false
                    }
                    taskSamples = samples.join(",")
                    break
                }
                case "double_multiple": {
                    let samples = {
                        first: [],
                        second: []
                    }
                    if (file.samplesFirst.length === 0) {
                        file.samplesFirstError = true
                        taskHasError = true
                        hasError = true
                    } else {
                        for (const item of file.samplesFirst) {
                            samples.first.push(item.id)
                        }
                        file.samplesFirstError = false
                    }
                    if (file.samplesSecond.length === 0) {
                        file.samplesSecondError = true
                        taskHasError = true
                        hasError = true
                    } else {
                        for (const item of file.samplesSecond) {
                            samples.second.push(item.id)
                        }
                        file.samplesSecondError = false
                    }
                    taskSamples = JSON.stringify(samples)
                    break
                }
            }
            let data = {}
            data.uploadFiles = uploadFiles
            data.name = taskParam.name
            data.parameter = JSON.stringify(taskParameter)
            data.samples = taskSamples
            datas.push(data)
            console.log(data)
        }
        taskParam.isError = taskHasError
    }
    console.log(datas)
    if (hasError) {
        errorMessage("Fix Error")
        return
    }
    // TODO 判断资源是否足够
    apiGet(
        `/task/check_multi_create_task?task_count=${datas.length}`,
        (res) => {
            infoMessage("Creating Tasks")
            let created = 0;
            let nameIndex = 0
            for (const item of datas) {
                nameIndex += 1
                let data = new FormData()
                data.append("flow_id", props.flowDetail.id)
                data.append("project_id", props.projectDetail.id)
                data.append("samples", item.samples)
                data.append("parameter", item.parameter)
                data.append("name", `${item.name}-${nameIndex}`)
                for (const file of item.uploadFiles) {
                    data.append(file[0], file[1])
                }
                console.log(data)
                //TODO 创建任务
                apiPost(
                    "/task",
                    (res) => {
                        created += 1
                        infoMessage(`Success Created ${created}/${datas.length} Tasks`)
                        if (created == datas.length) {
                            emit('taskCreated')
                        }
                    },
                    data,
                    (res) => {
                        created += 1;
                        errorMessage(`Fail Created ${created}/${data.length} Tasks, Reason ${res.msg}`)
                    },
                )

            }
        },
        {}, (res) => {
            errorMessage(res.msg)
        }
    )


    return
    let paramsError = false

    if (!newTaskName.value) {
        newTaskNameError.value = true
        paramsError = true
    } else {
        newTaskNameError.value = false
    }
    let data = new FormData();
    let taskParameter = [];
    for (let param of paramsDefine.value) {

        if (!params.value[param.key] && param.required) {
            param.isError = true
            paramsError = true
        } else {
            if (param.type === 'file') {
                data.append(param.key, params.value[param.key])
            }
            else {
                taskParameter.push({
                    key: param.key,
                    value: params.value[param.key],
                });
            }
            param.isError = false
        }
    }

    let taskSamples = []
    switch (props.flowDetail.sample_type) {
        case "single": {
            if (!sampleFirst.value.id) {
                sampleFirstError.value = true
                paramsError = true
            } else {
                sampleFirstError.value = false
                taskSamples.push(sampleFirst.value.id)
            }
            break
        }
        case "double": {
            if (!sampleFirst.value.id) {
                sampleFirstError.value = true
                paramsError = true
            } else {
                taskSamples.push(sampleFirst.value.id)
                sampleFirstError.value = false
            }
            if (!sampleSecond.value.id) {
                sampleSecondError.value = true
                paramsError = true
            } else {
                taskSamples.push(sampleSecond.value.id)
                sampleSecondError.value = false
            }
            break
        }
        case "multiple": {
            if (samples.value.length === 0) {
                samplesError.value = true
                paramsError = true
            } else {
                for (const item of samples.value) {
                    taskSamples.push(item.id)
                }
                samplesError.value = false
            }
            break
        }
    }
    if (paramsError) {
        errorMessage("Fix Error")
        return
    }


    data.append("flow_id", props.flowDetail.id)
    data.append("project_id", props.projectDetail.id)
    data.append("samples", taskSamples.join(","))
    data.append("parameter", JSON.stringify(taskParameter))
    data.append("name", newTaskName.value)

    apiPost(
        "/task",
        (res) => {
            infoMessage("Success")
            emit("taskCreated")
        },
        data
    )
}
const sampleTypetrans = (flow) => {
    switch (flow.sample_type) {
        case "single":
            return t('SingleSample')
        case "double":
            return t('PairSample')
        case "multiple":
            return t('MultipleSample')
    }
}
</script>

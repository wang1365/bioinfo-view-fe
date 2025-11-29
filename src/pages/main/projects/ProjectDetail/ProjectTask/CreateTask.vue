<template>
    <q-card style="width: 100vw; max-width: 100vw; height: 100vh; max-height: 100vh">
        <PopupContentScroll :title="$t('ProjectDetailPageCreateTask')" :fullscreen="true">
            <template v-slot:contentBody>
                <div class="row q-col-gutter-md q-pl-sm">
                    <q-input
                        stack-label
                        :model-value="props.flowDetail.name"
                        :label="$t('FlowName')"
                        label-color="primary"
                        readonly
                        flat
                    />
                    <q-input
                        stack-label
                        :model-value="props.flowDetail.code"
                        :label="$t('Code')"
                        label-color="primary"
                        readonly
                        flat
                    />
                    <q-input
                        stack-label
                        :model-value="sampleTypetrans(props.flowDetail)"
                        :label="$t('Sample')"
                        label-color="primary"
                        readonly
                        flat
                    />
                    <q-input
                        stack-label
                        :model-value="props.flowDetail.allow_nonstandard_samples
                                ? $t('Yes')
                                : $t('No')"
                        :label="$t('SupportNonStandardSample')"
                        label-color="primary"
                        readonly
                        flat
                    />
                    <q-input
                        stack-label
                        :model-value="props.flowDetail.desc"
                        :label="$t('FlowDetail')"
                        label-color="primary"
                        readonly
                        flat
                    />
                    <q-input
                        stack-label
                        :model-value="props.flowDetail.details"
                        :label="$t('Detail')"
                        label-color="primary"
                        readonly
                        flat
                    />
                </div>
                <div>
                    <q-splitter v-model="splitterModel" class="q-mt-sm">
                        <template v-slot:before>
                            <q-list bordered separator dense>
                                <q-item
                                    v-ripple
                                    v-for="(item, index) in paramTabs"
                                    :key="index"
                                    :name="item.name"
                                    :class="{ 'bg-primary': index === activeParamTab, 'text-white': index === activeParamTab }"
                                >
                                    <span class="cursor-pointer" @click="activeParamTab = index">
                                        {{t('Task')}}&nbsp;{{ index + 1}}
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
                                    <q-btn icon="add" color="primary" outline dense></q-btn>
                                </q-item>
                            </q-list>
                        </template>

                        <template v-slot:after>
                            <div v-for="(item, index) in paramTabs" :key="index">
                                <div v-if="activeParamTab === index">
                                    <SingleTaskEditor
                                        :item="item"
                                        :paramsDefine="paramsDefine"
                                        :csvOptions="csvOptions"
                                        :langConfig="langConfig"
                                        :sampleType="props.flowDetail.sample_type"
                                        :supportSampleRatio="props.flowDetail.support_sample_ratio"
                                        :focusSelect="focusSelect"
                                        :filterFn="filterFn"
                                        :openBatchSelectDialog="openBatchSelectDialog"
                                        :projectDetail="props.projectDetail"
                                        @delete-file="(file_index) => deleteParamTabFiles(index, file_index)"
                                        @add-file="() => addParamTabFiles(index)"
                                    />
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

        <!-- 批量选择对话框 -->
        <BatchSelectDialog
            v-model="batchSelectDialog"
            :options="currentBatchSelectParam.choices || []"
            :current-value="getCurrentBatchSelectValue()"
            @confirm="handleBatchSelectConfirm"
        />
    </q-card>
</template>

<script setup>
import { ref, toRefs, onMounted } from "vue";
import PopupContentScroll from "src/components/popup-content-scroll/PopupContentScroll.vue";
// selection dialogs handled in SingleTaskEditor
import BatchSelectDialog from "./BatchSelectDialog.vue";
import TaskDataSection from "./TaskDataSection.vue";
import SingleTaskEditor from "./SingleTaskEditor.vue";
import { useApi } from "src/api/apiBase";
import { errorMessage, infoMessage } from "src/utils/notify";
import { useI18n } from "vue-i18n";
import { event } from "quasar";
import { globalStore } from "src/stores/global";
import { update } from "lodash";
import { readFile } from "src/api/file";

const { langConfig } = globalStore()
const { t } = useI18n();
const { apiPost, apiGet } = useApi();
const newTaskName = ref("");
const newTaskNameError = ref(false);
const paramsDefine = ref([]);
const newTabParams = ref({})
const newTabParamFiles = ref([])
const params = ref({});

const paramTabs = ref([])
const activeParamTab = ref(0)

const csvOptions = ref({});

// 批量选择相关变量
const batchSelectDialog = ref(false);
const currentBatchSelectKey = ref('');
const currentBatchSelectParam = ref({});

const emit = defineEmits(["taskCreated"])
const props = defineProps({
    flowDetail: { type: Object, required: true },
    projectDetail: { type: Object, required: true },
})
const { flowId } = toRefs(props)

const currentFocusSelectKey = ref('')
const currentFocusSelectParam = ref({})
const genomeOptions = ref(['genome1', 'genome2', 'genome3'])

const focusSelect = (key, param) => {
    currentFocusSelectKey.value = key
    currentFocusSelectParam.value = param
    console.log(key)
}
const filterFn = (val, update) => {
    console.log('fileter', val)
    if (val === '') {
        update(() => {
            currentFocusSelectParam.value.choices = selectParams.value[currentFocusSelectKey.value]
        });
        return;
    } else {

        let choices = []
        let re = new RegExp(val, 'i')
        for (const item of selectParams.value[currentFocusSelectKey.value]) {
            if (re.test(item.value) || re.test(item.enLabel) || re.test(item.cnLabel)) {
                choices.push(item)
            }
        }
        update(() => {
            currentFocusSelectParam.value.choices = choices
        });
    }

}
const selectParams = ref({})

onMounted(() => {
    let flowParams = JSON.parse(props.flowDetail.parameter_schema);
    let params = {}
    for (let param of flowParams) {
        if (param.type === 'select' || param.type === 'multiSelect') {
            let choices = []
            for (let item of param.choices) {
                if (!item.cnLabel || !item.enLabel) {
                    choices.push({
                        value: item,
                        cnLabel: item,
                        enLabel: item
                    })
                } else {
                    choices.push(item)
                }
            }
            param.choices = choices
            selectParams.value[param.key] = JSON.parse(JSON.stringify(choices))
        }

        if (param.type === 'select-from-csv') {
            readFile(param.csvPath).then((res) => {
                const items = res.split('\n').map(line => line.trim()).filter(line => line);
                csvOptions.value[param.key] = items.map(item => item.split('\t')[0]);
                console.log("add csv options", param, csvOptions)
            });
        }

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
    file.sampleDetails = [{ customName: '', sampleRatio: null }]
    newTabParamFiles.value = file
    newTabParams.value = {
        params: params,
        files: [file],
        name: "",
        isError: false,
    };
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

// 批量选择相关方法
const openBatchSelectDialog = (key, param) => {
    currentBatchSelectKey.value = key;
    currentBatchSelectParam.value = param;
    batchSelectDialog.value = true;
};

const getCurrentBatchSelectValue = () => {
    if (!currentBatchSelectKey.value || !paramTabs.value[activeParamTab.value]) {
        return [];
    }
    return paramTabs.value[activeParamTab.value].params[currentBatchSelectKey.value].value || [];
};

const handleBatchSelectConfirm = (data) => {
    if (data.allItems && data.allItems.length > 0) {
        // 更新multiSelect的值
        paramTabs.value[activeParamTab.value].params[currentBatchSelectKey.value].value = data.allItems;
    }
};

const confirmTaskCreated = () => {
    console.log(paramTabs.value)
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
                else if (param.type === 'select') {
                    taskParameter.push({
                        key: param.key,
                        value: taskParam.params[param.key].value.value,
                    });
                }
                else if (param.type === 'multiSelect') {
                    let values = []
                    for (const item of taskParam.params[param.key].value) {
                        values.push(item.value)
                    }
                    taskParameter.push({
                        key: param.key,
                        value: values,
                    });
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
            let taskSamplesFirst = ""
            let taskSamplesSecond = ""
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
                    taskSamples = samples.first.join(',') + ',' + samples.second.join(',')
                    taskSamplesFirst = samples.first.join(',')
                    taskSamplesSecond = samples.second.join(',')

                    break
                }
            }
            let data = {}
            data.uploadFiles = uploadFiles
            data.name = taskParam.name
            data.parameter = JSON.stringify(taskParameter)
            data.samples = taskSamples
            data.sampleDetails = JSON.stringify(file.sampleDetails || [])
            if (taskSamplesFirst !== "") {
                data.taskSamplesFirst = taskSamplesFirst
            }
            if (taskSamplesSecond !== "") {
                data.taskSamplesSecond = taskSamplesSecond
            }

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
                data.append("sample_details", item.sampleDetails)
                data.append("parameter", item.parameter)
                data.append("name", `${item.name}-${nameIndex}`)
                if (item.taskSamplesFirst !== "") {
                    data.append("task_samples_first", item.taskSamplesFirst)
                }
                if (item.taskSamplesSecond !== "") {
                    data.append("task_samples_second", item.taskSamplesSecond)
                }

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
                        if (created === datas.length) {
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

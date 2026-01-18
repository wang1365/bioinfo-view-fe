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
                                        @add-file="(params) => addParamTabFiles(index, params)"
                                    />
                                </div>
                            </div>
                        </template>
                    </q-splitter>
                </div>
            </template>
            <template v-slot:contentFooter>
                <div class="row justify-center q-gutter-md q-my-md">
                    <q-btn :label="$t('Cancel')" v-close-popup class="q-px-xl" style="min-width: 160px" />
                    <q-btn
                        color="primary"
                        :label="$t('Confirm')"
                        @click="confirmTaskCreated()"
                        class="q-px-xl"
                        style="min-width: 160px"
                    />
                </div>
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
import SingleTaskEditor from "./SingleTaskEditor.vue";
import { useApi } from "src/api/apiBase";
import { errorMessage, infoMessage } from "src/utils/notify";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { globalStore } from "src/stores/global";
import { readFile } from "src/api/file";

const SAMPLE_TYPES = {
    SINGLE: 'single',
    DOUBLE: 'double',
    MULTIPLE: 'multiple',
    DOUBLE_MULTIPLE: 'double_multiple'
};

const { langConfig } = globalStore()
const { t } = useI18n();
const $q = useQuasar();
const { apiPost, apiGet } = useApi();

const paramsDefine = ref([]);
const newTabParams = ref({})
const newTabParamFiles = ref([])

const paramTabs = ref([])
const activeParamTab = ref(0)

const csvOptions = ref({});
const selectParams = ref({})

// 批量选择相关变量
const batchSelectDialog = ref(false);
const currentBatchSelectKey = ref('');
const currentBatchSelectParam = ref({});

const emit = defineEmits(["taskCreated"])
const props = defineProps({
    flowDetail: { type: Object, required: true },
    projectDetail: { type: Object, required: true },
})

const currentFocusSelectKey = ref('')
const currentFocusSelectParam = ref({})

// Helper for deep cloning
const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));

const focusSelect = (key, param) => {
    currentFocusSelectKey.value = key
    currentFocusSelectParam.value = param
}

const filterFn = (val, update) => {
    if (val === '') {
        update(() => {
            currentFocusSelectParam.value.choices = selectParams.value[currentFocusSelectKey.value]
        });
        return;
    }

    const needle = val.toLowerCase();
    const choices = selectParams.value[currentFocusSelectKey.value].filter(v => {
         return (v.value && v.value.toLowerCase().indexOf(needle) > -1) ||
                (v.enLabel && v.enLabel.toLowerCase().indexOf(needle) > -1) ||
                (v.cnLabel && v.cnLabel.toLowerCase().indexOf(needle) > -1);
    });

    update(() => {
        currentFocusSelectParam.value.choices = choices
    });
}

onMounted(() => {
    initParams();
});

const initParams = () => {
    const flowParams = JSON.parse(props.flowDetail.parameter_schema);
    const initialParams = {};

    for (const param of flowParams) {
        if (['select', 'multiSelect'].includes(param.type)) {
            const choices = param.choices.map(item => {
                if (!item.cnLabel || !item.enLabel) {
                    return { value: item, cnLabel: item, enLabel: item };
                }
                return item;
            });
            param.choices = choices;
            selectParams.value[param.key] = cloneDeep(choices);
        }

        if (param.type === 'select-from-csv') {
            readFile(param.csvPath).then((res) => {
                const items = res.split('\n').map(line => line.trim()).filter(line => line);
                csvOptions.value[param.key] = items.map(item => item.split('\t')[0]);
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
        initialParams[param.key] = { value: null, isError: false };
    }

    let fileStructure = {};
    switch (props.flowDetail.sample_type) {
        case SAMPLE_TYPES.SINGLE:
            fileStructure = { sampleFirst: {}, sampleFirstError: false };
            break;
        case SAMPLE_TYPES.DOUBLE:
            fileStructure = {
                sampleFirst: {},
                sampleSecond: {},
                sampleFirstError: false,
                sampleSecondError: false,
            };
            break;
        case SAMPLE_TYPES.MULTIPLE:
            fileStructure = { samples: [], samplesError: false };
            break;
        case SAMPLE_TYPES.DOUBLE_MULTIPLE:
            fileStructure = {
                samplesFirst: [],
                samplesSecond: [],
                samplesFirstError: false,
                samplesSecondError: false,
            };
            break;
    }

    fileStructure.sampleDetails = [{ customName: '', sampleRatio: null }];
    fileStructure.taskName = '';
    fileStructure.params = cloneDeep(initialParams);

    newTabParamFiles.value = fileStructure;
    newTabParams.value = {
        params: initialParams,
        files: [fileStructure],
        name: "",
        isError: false,
    };

    addParamTab();
};

const addParamTab = () => {
    paramTabs.value.push(cloneDeep(newTabParams.value))
    activeParamTab.value = paramTabs.value.length - 1
}

const deleteParamTab = (index) => {
    if (paramTabs.value.length > 1)
        paramTabs.value.splice(index, 1)
    activeParamTab.value = 0
}

const addParamTabFiles = (index, params) => {
    let newFile = cloneDeep(newTabParamFiles.value)
    const currentTab = paramTabs.value[index]
    if (currentTab.name) {
        newFile.taskName = `${currentTab.name}-${currentTab.files.length + 1}`
    }
    // Inherit params from top-level
    const paramsToInherit = params || currentTab.params
    if (paramsToInherit) {
        newFile.params = cloneDeep(paramsToInherit)
    }
    paramTabs.value[index].files.push(newFile)
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

const createTasks = (datas) => {
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
                data.append("name", item.finalName)
                if (item.taskSamplesFirst !== "") {
                    data.append("task_samples_first", item.taskSamplesFirst)
                }
                if (item.taskSamplesSecond !== "") {
                    data.append("task_samples_second", item.taskSamplesSecond)
                }
                for (const file of item.uploadFiles) {
                    data.append(file[0], file[1])
                }
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

const validateParams = (params, checkRequired = true) => {
    let hasError = false;
    const uploadFiles = [];
    const taskParameter = [];

    for (let param of paramsDefine.value) {
        const paramItem = params[param.key];
        const pValue = paramItem ? paramItem.value : null;
        const isEmpty = !pValue || (Array.isArray(pValue) && pValue.length === 0);

        if (checkRequired && isEmpty && param.required) {
            if (paramItem) paramItem.isError = true;
            hasError = true;
        } else {
            if (paramItem) paramItem.isError = false;

            if (!isEmpty) {
                if (param.type === 'file') {
                    uploadFiles.push([param.key, pValue]);
                } else if (param.type === 'select') {
                    taskParameter.push({
                        key: param.key,
                        value: pValue?.value || pValue,
                    });
                } else if (param.type === 'multiSelect') {
                    taskParameter.push({
                        key: param.key,
                        value: Array.isArray(pValue) ? pValue.map(v => v.value) : [],
                    });
                } else {
                    taskParameter.push({
                        key: param.key,
                        value: pValue,
                    });
                }
            }
        }
    }
    return { hasError, uploadFiles, taskParameter };
}

const validateTaskParams = (taskParam) => {
    let hasError = false;

    // Top-level task name is optional (only required if row names are missing, which is checked per-row)
    taskParam.nameError = false;

    // Validate top-level custom params (Skip required check)
    const { hasError: paramsError } = validateParams(taskParam.params, false);
    if (paramsError) hasError = true;

    return { hasError };
}

const checkSampleFastq = (sample) => {
    const r1Missing = !sample.fastq1_path;
    const r2Missing = !sample.fastq2_path;
    const r1NotReady = !!sample.fastq1_warn || (!!sample.fastq1_path && !sample.fastq1_ok);
    const r2NotReady = !!sample.fastq2_warn || (!!sample.fastq2_path && !sample.fastq2_ok);
    return r1Missing || r2Missing || r1NotReady || r2NotReady;
}

const confirmTaskCreated = () => {
    let hasError = false;
    let hasIdentifierMissing = false;
    let hasFastqIssue = false;
    let datas = [];

    for (let taskParam of paramTabs.value) {
        let { hasError: taskHasError } = validateTaskParams(taskParam);
        if (taskHasError) hasError = true;

        let autoNameIndex = 0;

        for (let file of taskParam.files) {
            let taskSamples = "";
            let taskSamplesFirst = "";
            let taskSamplesSecond = "";
            let currentSampleError = false;

            // Validate file-level params
            const { hasError: fileParamsError, uploadFiles, taskParameter } = validateParams(file.params);
            if (fileParamsError) {
                taskHasError = true;
                currentSampleError = true; // Mark file as having error
            }

            if (!file.taskName) {
                if (!taskParam.name) {
                    file.taskNameError = true
                    taskHasError = true
                    currentSampleError = true
                } else {
                    file.taskNameError = false
                }
            } else {
                file.taskNameError = false
            }

            const checkSingleSample = (sample, errorKey) => {
                 if (!sample.id) {
                    file[errorKey] = true;
                    currentSampleError = true;
                    hasIdentifierMissing = true;
                    return null;
                }
                file[errorKey] = false;
                if (sample.notFound) hasIdentifierMissing = true;
                if (checkSampleFastq(sample)) hasFastqIssue = true;
                return sample.id;
            }

            switch (props.flowDetail.sample_type) {
                case SAMPLE_TYPES.SINGLE: {
                    const id = checkSingleSample(file.sampleFirst, 'sampleFirstError');
                    if (id) taskSamples = id;
                    break;
                }
                case SAMPLE_TYPES.DOUBLE: {
                    const id1 = checkSingleSample(file.sampleFirst, 'sampleFirstError');
                    const id2 = checkSingleSample(file.sampleSecond, 'sampleSecondError');
                    if (id1 && id2) taskSamples = `${id1},${id2}`;
                    break;
                }
                case SAMPLE_TYPES.MULTIPLE: {
                    if (file.samples.length === 0) {
                        file.samplesError = true;
                        currentSampleError = true;
                        hasError = true;
                    } else {
                        file.samplesError = false;
                        const ids = [];
                        file.samples.forEach(s => {
                            if (s.notFound) hasIdentifierMissing = true;
                            if (checkSampleFastq(s)) hasFastqIssue = true;
                            ids.push(s.id);
                        });
                        taskSamples = ids.join(",");
                    }
                    break;
                }
                case SAMPLE_TYPES.DOUBLE_MULTIPLE: {
                    const processList = (list, errorKey) => {
                         if (list.length === 0) {
                            file[errorKey] = true;
                            currentSampleError = true;
                            hasError = true;
                            return [];
                        }
                        file[errorKey] = false;
                        const ids = [];
                        list.forEach(s => {
                            if (s.notFound) hasIdentifierMissing = true;
                            if (checkSampleFastq(s)) hasFastqIssue = true;
                            ids.push(s.id);
                        });
                        return ids;
                    }

                    const firstIds = processList(file.samplesFirst, 'samplesFirstError');
                    const secondIds = processList(file.samplesSecond, 'samplesSecondError');

                    taskSamplesFirst = firstIds.join(',');
                    taskSamplesSecond = secondIds.join(',');
                    taskSamples = `${taskSamplesFirst},${taskSamplesSecond}`;
                    break;
                }
            }

            if (currentSampleError) {
                taskHasError = true;
                hasError = true;
            }

            // Create Data Object
            let data = {};
            data.uploadFiles = uploadFiles;
            data.name = taskParam.name;
            if (file.taskName) {
                data.finalName = file.taskName;
            } else {
                autoNameIndex += 1;
                data.finalName = `${taskParam.name}-${autoNameIndex}`;
            }
            data.parameter = JSON.stringify(taskParameter);
            data.samples = taskSamples;
            data.sampleDetails = JSON.stringify(file.sampleDetails || []);
            if (taskSamplesFirst) data.taskSamplesFirst = taskSamplesFirst;
            if (taskSamplesSecond) data.taskSamplesSecond = taskSamplesSecond;

            datas.push(data);
        }
        taskParam.isError = taskHasError;
    }

    if (datas.length === 0) {
        if (!hasError) errorMessage(t('NoDataToSubmit') || 'Please add at least one sample');
        return;
    }

    if (hasError) {
        errorMessage("Fix Error");
        return;
    }

    const runCreate = () => createTasks(datas);

    const confirmFastq = () => {
        if (hasFastqIssue) {
             $q.dialog({
                title: t('Confirm'),
                message: t('CreateTaskFastqIncompleteConfirm'),
                cancel: true,
                ok: { label: t('Confirm') },
                persistent: true
            }).onOk(runCreate).onCancel(() => {});
        } else {
            runCreate();
        }
    };

    if (hasIdentifierMissing) {
        $q.dialog({
            title: t('Confirm'),
            message: t('CreateTaskIdentifierMissingConfirm'),
            cancel: true,
            ok: { label: t('Confirm') },
            persistent: true
        }).onOk(confirmFastq).onCancel(() => {});
    } else {
        confirmFastq();
    }
}

const sampleTypetrans = (flow) => {
    switch (flow.sample_type) {
        case SAMPLE_TYPES.SINGLE: return t('SingleSample');
        case SAMPLE_TYPES.DOUBLE: return t('PairSample');
        case SAMPLE_TYPES.MULTIPLE: return t('MultipleSample');
        case SAMPLE_TYPES.DOUBLE_MULTIPLE: return 'Double Multiple';
        default: return '';
    }
}
</script>

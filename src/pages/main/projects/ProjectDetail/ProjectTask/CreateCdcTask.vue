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
                                        >{{
                                            $t('Task')

                                        }}&nbsp;{{ index + 1}}
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
                                    <div class="text-h6">{{ $t('SequenceSelection') }}:</div>
                                    <div class="row">
                                        <div class="col-6 q-pr-sm">
                                            <q-select
                                                :error="item.virusNameError"
                                                use-input
                                                @filter="filterVirusName"
                                                :error-message="$t('Required')"
                                                v-model="item.virusName"
                                                :options="virusNameOptions"
                                                :label="$t('VirusName')"
                                                multiple
                                                use-chips
                                                @update:model-value="onVirusNameChange"
                                            >
                                            </q-select>
                                        </div>
                                        <div class="col-6 q-pr-sm">
                                            <q-select
                                                :error="item.virusTypeError"
                                                use-input
                                                @filter="filterVirusType"
                                                :error-message="$t('Required')"
                                                v-model="item.virusType"
                                                :options="virusTypeOptions"
                                                :label="$t('VirusType')"
                                                multiple
                                                use-chips
                                                :disable="item.virusName && item.virusName.length > 1"
                                            >
                                            </q-select>
                                        </div>
                                        <div class="col-6 q-pr-sm">
                                            <q-select
                                                :error="item.hostError"
                                                use-input
                                                @filter="filterHost"
                                                :error-message="$t('Required')"
                                                v-model="item.host"
                                                :options="hostOptions"
                                                :label="$t('Host')"
                                                @update:model-value="onHostChange"
                                            >
                                            </q-select>
                                        </div>
                                        <div class="col-6 q-pr-sm">
                                            <q-select
                                                :error="item.hostGenomeVersionError"
                                                use-input
                                                @filter="filterHostGenomeVersion"
                                                :error-message="$t('Required')"
                                                v-model="item.hostGenomeVersion"
                                                :options="hostGenomeVersionOptions"
                                                :label="$t('HostGenomeVersion')"
                                                :disable="!item.host"
                                            >
                                            </q-select>
                                        </div>
                                        <div class="col-6 q-pr-sm">
                                            <q-input
                                                :error="item.customDatabaseError"
                                                :error-message="item.customDatabaseErrorMsg || $t('Required')"
                                                v-model="item.customDatabase"
                                                :label="$t('CustomDatabase')"
                                                @blur="checkCustomDatabase"
                                            >
                                                <q-tooltip>{{ $t('CustomDatabaseTooltip') }}</q-tooltip>
                                            </q-input>
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

        <q-dialog persistent v-model="openDataSelectorSingle">
            <TaskDataSelectSingle :projectDetail="props.projectDetail" @refresh="singleSelected($event)" />
        </q-dialog>
        <q-dialog persistent v-model="openDataSelectorMulti">
            <TaskDataSelectMulti :projectDetail="props.projectDetail" @refresh="multiSelected($event)" />
        </q-dialog>
    </q-card>
</template>

<script setup>
import { ref, toRefs, onMounted, watch } from "vue";
import PopupContentScroll from "src/components/popup-content-scroll/PopupContentScroll.vue";
import TaskDataSelectMulti from "./TaskDataSelectMulti.vue";
import TaskDataSelectSingle from "./TaskDataSelectSingle.vue";
import { useApi } from "src/api/apiBase";
import { errorMessage, infoMessage } from "src/utils/notify";
import { useI18n } from "vue-i18n";
import { event } from "quasar";
import { globalStore } from "src/stores/global";
import { update } from "lodash";
import { readFile, readFileFromDatabaseDir } from "src/api/file";
const { langConfig } = globalStore()
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

// 病毒种名和病毒分型数据
const virusData = ref([]);
const virusNameOptions = ref([]);
const virusTypeOptions = ref([]);

// 宿主和宿主基因组版本数据
const hostData = ref([]);
const hostOptions = ref([]);
const hostGenomeVersionOptions = ref([]);

// 自定义数据库路径数据
const customDatabasePaths = ref([]);

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

const currentFocusSelectKey = ref('')
const currentFocusSelectParam = ref({})
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

// 加载病毒种名和病毒分型数据
const loadVirusData = async () => {
    try {
        // 使用文件API从服务器路径读取：/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/species/sp_mapdb.species.class
        const response = await readFile('/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/species/sp_mapdb.species.class')

        // 解析文件内容
        const lines = response.split('\n')
        const data = []

        for (const line of lines) {
            if (line.trim()) {
                const [virusName, virusType] = line.split('\t').map(item => item.trim())
                data.push({ virusName, virusType })
            }
        }

        virusData.value = data

        // 提取唯一的病毒种名
        const uniqueVirusNames = [...new Set(data.map(item => item.virusName))]
        virusNameOptions.value = uniqueVirusNames
    } catch (error) {
        console.error('加载病毒数据失败:', error)
        // 使用示例数据
        virusData.value = [
            { virusName: 'ALL', virusType: 'ALL' },
            { virusName: 'Adenoviridae', virusType: 'ALL' },
            { virusName: 'Adenoviridae', virusType: 'HAdVF' },
            { virusName: 'Adenoviridae', virusType: 'HadV40' },
            { virusName: 'Adenoviridae', virusType: 'HadV41' }
        ]
        virusNameOptions.value = ['ALL', 'Adenoviridae']
    }
}

// 加载宿主和宿主基因组版本数据
const loadHostData = async () => {
    try {
        // 使用文件API从服务器路径读取：/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/host_mapdb.species.class
        const response = await readFileFromDatabaseDir('Pathogen_database/ref_seq_db/host/host_mapdb.species.class')

        // 解析文件内容
        const lines = response.split('\n')
        const data = []

        for (const line of lines) {
            if (line.trim()) {
                const [hostName, hostGenomeVersion] = line.split('\t').map(item => item.trim())
                data.push({ hostName, hostGenomeVersion })
            }
        }

        hostData.value = data

        // 提取唯一的宿主名称
        const uniqueHostNames = [...new Set(data.map(item => item.hostName))]
        hostOptions.value = uniqueHostNames
    } catch (error) {
        console.error('加载宿主数据失败:', error)
        // 使用示例数据
        hostData.value = [
            { hostName: 'ALL', hostGenomeVersion: 'ALL' },
            { hostName: 'human', hostGenomeVersion: 'ALL' },
            { hostName: 'human', hostGenomeVersion: 'hg19' }
        ]
        hostOptions.value = ['ALL', 'human']
    }
}

// 加载自定义数据库路径数据
const loadCustomDatabasePaths = async () => {
    try {
        // 使用文件API从服务器路径读取：/data/bioinfo/database_dir/Pathogen_database/customize_ref_db/all.ref.path
        const response = await readFileFromDatabaseDir('Pathogen_database/customize_ref_db/all.ref.path')

        // 解析文件内容
        const lines = response.split('\n')
        const data = []

        for (const line of lines) {
            if (line.trim()) {
                const [dbName, dbFullName, dbPath] = line.split('\t').map(item => item.trim())
                data.push({ dbName, dbFullName, dbPath })
            }
        }

        customDatabasePaths.value = data
    } catch (error) {
        console.error('加载自定义数据库路径失败:', error)
        // 使用示例数据
        customDatabasePaths.value = [
            {
                dbName: 'hg19_Adenoviridae',
                dbFullName: 'human_hg19.Adenoviridae_ALL',
                dbPath: '/data/bioinfo/database_dir/Pathogen_database/customize_ref_db/hg19_Adenoviridae/hg19_Adenoviridae.fasta'
            }
        ]
    }
}
const selectParams = ref({})

onMounted(() => {
    let flowParams = JSON.parse(props.flowDetail.parameter_schema);
    let params = {}
    for (let param of flowParams) {
        if (param.type == 'select' || param.type == 'multiSelect') {
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

    // 加载病毒种名和病毒分型数据
    loadVirusData();
    // 加载宿主和宿主基因组版本数据
    loadHostData();
    // 加载自定义数据库路径数据
    loadCustomDatabasePaths();

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
    let taskParam = {
        name: `${t("Task")} ${paramTabs.value.length + 1}`,
        nameError: false,
        params: JSON.parse(JSON.stringify(newTabParams.value.params)),
        files: JSON.parse(JSON.stringify(newTabParams.value.files)),
        // 序列选择参数
        virusName: null,
        virusNameError: false,
        virusType: null,
        virusTypeError: false,
        host: null,
        hostError: false,
        hostGenomeVersion: null,
        hostGenomeVersionError: false,
        customDatabase: '',
        customDatabaseError: false,
        customDatabaseErrorMsg: '',
        isError: false
    }
    paramTabs.value.push(taskParam)
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

// 过滤病毒种名
const filterVirusName = (val, update) => {
    if (val === '') {
        update(() => {
            virusNameOptions.value = [...new Set(virusData.value.map(item => item.virusName))]
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        virusNameOptions.value = [...new Set(virusData.value
            .map(item => item.virusName)
            .filter(v => v.toLowerCase().indexOf(needle) > -1))]
    })
}

// 过滤病毒分型
const filterVirusType = (val, update) => {
    if (val === '') {
        update(() => {
            const selectedVirusName = paramTabs.value[activeParamTab.value].virusName
            if (Array.isArray(selectedVirusName) && selectedVirusName.length > 1) {
                virusTypeOptions.value = ['ALL']
            } else {
                const virusName = Array.isArray(selectedVirusName) ? selectedVirusName[0] : selectedVirusName
                virusTypeOptions.value = virusData.value
                    .filter(item => item.virusName === virusName)
                    .map(item => item.virusType)
            }
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        virusTypeOptions.value = virusTypeOptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
    })
}

// 过滤宿主
const filterHost = (val, update) => {
    if (val === '') {
        update(() => {
            hostOptions.value = [...new Set(hostData.value.map(item => item.hostName))]
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        hostOptions.value = [...new Set(hostData.value
            .map(item => item.hostName)
            .filter(v => v.toLowerCase().indexOf(needle) > -1))]
    })
}

// 过滤宿主基因组版本
const filterHostGenomeVersion = (val, update) => {
    if (val === '') {
        update(() => {
            const hostName = paramTabs.value[activeParamTab.value].host
            hostGenomeVersionOptions.value = hostData.value
                .filter(item => item.hostName === hostName)
                .map(item => item.hostGenomeVersion)
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        hostGenomeVersionOptions.value = hostGenomeVersionOptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
    })
}

// 当病毒种名变化时的处理函数
const onVirusNameChange = (value) => {
    const item = paramTabs.value[activeParamTab.value]

    // 如果选择了多个病毒种名，则病毒分型固定为ALL
    if (Array.isArray(value) && value.length > 1) {
        item.virusType = ['ALL']
    }

    // 更新病毒分型选项
    if (!value) {
        virusTypeOptions.value = []
    } else if (Array.isArray(value) && value.length > 1) {
        virusTypeOptions.value = ['ALL']
    } else {
        const selectedVirusName = Array.isArray(value) ? value[0] : value
        virusTypeOptions.value = virusData.value
            .filter(item => item.virusName === selectedVirusName)
            .map(item => item.virusType)
    }
}

// 当宿主变化时的处理函数
const onHostChange = (value) => {
    const item = paramTabs.value[activeParamTab.value]

    // 更新宿主基因组版本选项
    if (!value) {
        hostGenomeVersionOptions.value = []
        item.hostGenomeVersion = null
    } else {
        hostGenomeVersionOptions.value = hostData.value
            .filter(item => item.hostName === value)
            .map(item => item.hostGenomeVersion)

        // 如果只有一个选项，自动选择
        if (hostGenomeVersionOptions.value.length === 1) {
            item.hostGenomeVersion = hostGenomeVersionOptions.value[0]
        } else if (hostGenomeVersionOptions.value.includes('ALL')) {
            item.hostGenomeVersion = 'ALL'
        } else {
            item.hostGenomeVersion = null
        }
    }

    // 重置自定义数据库错误状态
    if (item.customDatabaseError) {
        item.customDatabaseError = false
        item.customDatabaseErrorMsg = ''
    }
}

// 检查自定义数据库名称是否已存在
const checkCustomDatabase = (item) => {
    if (!item.customDatabase) {
        item.customDatabaseError = true
        item.customDatabaseErrorMsg = t('Required')
        return
    }

    // 检查格式（字母、数字、下划线）
    const regex = /^[a-zA-Z0-9_]+$/
    if (!regex.test(item.customDatabase)) {
        item.customDatabaseError = true
        item.customDatabaseErrorMsg = t('OnlyAllowAlphanumericAndUnderscore')
        return
    }

    // 检查是否已存在
    const existingDb = customDatabasePaths.value.find(db => db.dbName === item.customDatabase)
    if (existingDb) {
        item.customDatabaseError = true
        item.customDatabaseErrorMsg = `${t('DatabaseAlreadyExists')}: ${existingDb.dbPath}`
        return
    }

    item.customDatabaseError = false
    item.customDatabaseErrorMsg = ''
}

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

        // 验证病毒种名
        if (!taskParam.virusName || (Array.isArray(taskParam.virusName) && taskParam.virusName.length === 0)) {
            taskParam.virusNameError = true;
            hasError = true
            taskHasError = true
        } else {
            taskParam.virusNameError = false;
        }

        // 验证病毒分型
        if (!taskParam.virusType || (Array.isArray(taskParam.virusType) && taskParam.virusType.length === 0)) {
            taskParam.virusTypeError = true;
            hasError = true
            taskHasError = true
        } else {
            taskParam.virusTypeError = false;
        }

        // 验证宿主
        if (!taskParam.host) {
            taskParam.hostError = true;
            hasError = true
            taskHasError = true
        } else {
            taskParam.hostError = false;
        }

        // 验证宿主基因组版本
        if (!taskParam.hostGenomeVersion) {
            taskParam.hostGenomeVersionError = true;
            hasError = true
            taskHasError = true
        } else {
            taskParam.hostGenomeVersionError = false;
        }

        // 验证自定义数据库
        if (!taskParam.customDatabase) {
            taskParam.customDatabaseError = true;
            taskParam.customDatabaseErrorMsg = t('Required');
            hasError = true
            taskHasError = true
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

        // 添加序列选择参数
        taskParameter.push(
            { key: 'virusName', value: Array.isArray(taskParam.virusName) ? taskParam.virusName : [taskParam.virusName] },
            { key: 'virusType', value: Array.isArray(taskParam.virusType) ? taskParam.virusType : [taskParam.virusType] },
            { key: 'host', value: taskParam.host },
            { key: 'hostGenomeVersion', value: taskParam.hostGenomeVersion },
            { key: 'customDatabase', value: taskParam.customDatabase }
        )

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
            if (taskSamplesFirst != "") {
                data.taskSamplesFirst = taskSamplesFirst
            }
            if (taskSamplesSecond != "") {
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
                data.append("parameter", item.parameter)
                data.append("name", `${item.name}-${nameIndex}`)
                if (item.taskSamplesFirst != "") {
                    data.append("task_samples_first", item.taskSamplesFirst)
                }
                if (item.taskSamplesSecond != "") {
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

<template>
    <q-card style="width: 80vw; max-width: 80vw">
        <PopupContentScroll title="创建基因组">
            <template v-slot:contentBody>
                <div class="q-px-md">
                    <div class="row q-col-gutter-md">
                        <div class="col-3">
                            <q-input
                                :model-value="props.flowDetail.name"
                                :label="$t('FlowName')"
                                readonly
                                dense
                                stack-label
                                label-color="primary"
                            />
                        </div>
                        <div class="col-3">
                            <q-input
                                :model-value="props.flowDetail.code"
                                :label="$t('Code')"
                                readonly
                                dense
                                stack-label
                                label-color="primary"
                            />
                        </div>
                        <div class="col-3">
                            <q-input
                                :model-value="sampleTypetrans(props.flowDetail)"
                                :label="$t('Sample')"
                                readonly
                                dense
                                stack-label
                                label-color="primary"
                            />
                        </div>
                        <div class="col-3">
                            <q-input
                                :model-value="props.flowDetail.allow_nonstandard_samples ? $t('Yes') : $t('No')"
                                :label="$t('SupportNonStandardSample')"
                                readonly
                                dense
                                stack-label
                                label-color="primary"
                            />
                        </div>
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-input
                                :model-value="props.flowDetail.desc"
                                :label="$t('FlowDetail')"
                                readonly
                                dense
                                stack-label
                                label-color="primary"
                            />
                        </div>
                        <div class="col-6">
                            <q-input
                                :model-value="props.flowDetail.details"
                                :label="$t('Detail')"
                                readonly
                                dense
                                stack-label
                                label-color="primary"
                            />
                        </div>
                    </div>
                </div>
                <q-separator />
                <div class="q-pa-md" v-if="paramTabs.length > 0">
                    <div class="row">
                        <q-input
                            v-model="paramTabs[0].name"
                            :label="$t('Task')"
                            :error="paramTabs[0].nameError"
                            :error-message="$t('Required')"
                            class="col-5 q-my-sm"
                            required
                            stack-label
                            label-color="purple"
                            outlined
                        />
                    </div>
                    <div class="text-h6 q-my-sm">{{ $t('SequenceSelection') }}:</div>
                    <div class="row">
                        <div class="col-3 q-pr-sm">
                            <q-select
                                :error="paramTabs[0].virusNameError"
                                use-input
                                @filter="filterVirusName"
                                :error-message="$t('Required')"
                                v-model="paramTabs[0].virusName"
                                :options="virusNameOptions"
                                :label="$t('VirusName')"
                                multiple
                                stack-label
                                use-chips
                                outlined
                                label-color="purple"
                                @update:model-value="onVirusNameChange"
                            >
                            </q-select>
                        </div>
                        <div class="col-3 q-pr-sm">
                            <q-select
                                :error="paramTabs[0].virusTypeError"
                                use-input
                                @filter="filterVirusType"
                                :error-message="$t('Required')"
                                v-model="paramTabs[0].virusType"
                                :options="virusTypeOptions"
                                :label="$t('VirusType')"
                                multiple
                                stack-label
                                use-chips
                                outlined
                                label-color="purple"
                                :disable="paramTabs[0].virusName && paramTabs[0].virusName.length > 1"
                            >
                            </q-select>
                        </div>
                        <div class="col-3 q-pr-sm">
                            <q-select
                                :error="paramTabs[0].hostError"
                                use-input
                                @filter="filterHost"
                                :error-message="$t('Required')"
                                v-model="paramTabs[0].host"
                                :options="hostOptions"
                                :label="$t('Host')"
                                stack-label
                                outlined
                                label-color="purple"
                                @update:model-value="onHostChange"
                            >
                            </q-select>
                        </div>
                        <div class="col-3 q-pr-sm">
                            <q-select
                                :error="paramTabs[0].hostGenomeVersionError"
                                use-input
                                @filter="filterHostGenomeVersion"
                                :error-message="$t('Required')"
                                v-model="paramTabs[0].hostGenomeVersion"
                                :options="hostGenomeVersionOptions"
                                :label="$t('HostGenomeVersion')"
                                :disable="!paramTabs[0].host"
                                stack-label
                                outlined
                                label-color="purple"
                            >
                            </q-select>
                        </div>
                    </div>
                    <div class="row q-pr-sm q-my-sm justify-between">
                        <q-input
                            :error="paramTabs[0].customDatabaseError"
                            :error-message="paramTabs[0].customDatabaseErrorMsg || $t('Required')"
                            v-model="paramTabs[0].customDatabase"
                            :label="$t('CustomDatabase')"
                            @blur="checkCustomDatabase"
                            label-color="purple"
                            stack-label
                            outlined
                            class="col-6"
                        >
                            <q-tooltip>{{ $t('CustomDatabaseTooltip') }}</q-tooltip>
                        </q-input>
                        <div class="content-center">
                            <q-btn color="purple" label="信息汇总" @click="showInformationSummary" />
                        </div>
                    </div>

                    <!-- 宿主原序列表格 -->
                    <div class="q-mt-md">
                        <div class="text-h6 q-mb-sm text-purple">宿主原序列信息</div>
                        <a-table
                            :columns="hostSequenceColumns"
                            :data-source="hostSequenceData"
                            :pagination="{
                                current: hostPagination.current,
                                pageSize: hostPagination.pageSize,
                                total: hostSequenceData.length,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                onChange: (page, pageSize) => handleHostPageChange(page, pageSize),
                                onShowSizeChange: (current, size) => handleHostPageChange(current, size)
                            }"
                            size="small"
                            bordered
                        >
                            <template #bodyCell="{ column, index }">
                                <template v-if="column.key === 'action'">
                                    <a-button type="link" size="small" danger @click="deleteHostSequence(index)"
                                        >删除</a-button
                                    >
                                </template>
                            </template>
                        </a-table>
                    </div>

                    <!-- 病原原序列表格 -->
                    <div class="q-mt-md">
                        <div class="text-h6 q-mb-sm text-purple">病原原序列信息</div>
                        <a-table
                            :columns="pathogenSequenceColumns"
                            :data-source="pathogenSequenceData"
                            :pagination="{
                                current: pathogenPagination.current,
                                pageSize: pathogenPagination.pageSize,
                                total: pathogenSequenceData.length,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                onChange: (page, pageSize) => handlePathogenPageChange(page, pageSize),
                                onShowSizeChange: (current, size) => handlePathogenPageChange(current, size)
                            }"
                            size="small"
                            bordered
                        >
                            <template #bodyCell="{ column, index }">
                                <template v-if="column.key === 'action'">
                                    <a-button type="link" size="small" danger @click="deletePathogenSequence(index)"
                                        >删除</a-button
                                    >
                                </template>
                            </template>
                        </a-table>
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
import { ref, toRefs, onMounted } from "vue";
import PopupContentScroll from "src/components/popup-content-scroll/PopupContentScroll.vue";
import TaskDataSelectMulti from "./TaskDataSelectMulti.vue";
import TaskDataSelectSingle from "./TaskDataSelectSingle.vue";
import { useApi } from "src/api/apiBase";
import { errorMessage, infoMessage } from "src/utils/notify";
import { useI18n } from "vue-i18n";
import { readFileFromDatabaseDir } from "src/api/file";
import { collectInformation } from "src/api/cdc";

const { t } = useI18n();
const { apiPost, apiGet } = useApi();
const openDataSelectorSingle = ref(false);
const openDataSelectorMulti = ref(false);
const paramsDefine = ref([]);
const newTabParams = ref({})
const newTabParamFiles = ref([])

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

// 宿主原序列表格数据
const hostSequenceColumns = ref([
    {
        title: '宿主原序列路径',
        dataIndex: 'sequencePath',
        key: 'sequencePath',
        width: 200,
        customRender: ({ text }) => text
    },
    { title: '物种名', dataIndex: 'speciesName', key: 'speciesName', width: 80 },
    { title: '序列ID', dataIndex: 'sequenceId', key: 'sequenceId', width: 100 },
    { title: '版本信息', dataIndex: 'versionInfo', key: 'versionInfo', width: 60 },
    { title: '序列原名', dataIndex: 'originalName', key: 'originalName', width: 100 },
    { title: '操作', key: 'action', width: 30 }
]);

const hostSequenceData = ref([]);

// 病原原序列表格数据
const pathogenSequenceColumns = ref([
    {
        title: '病原原序列路径',
        dataIndex: 'sequencePath',
        key: 'sequencePath',
        width: 200,
        customRender: ({ text }) => text
    },
    { title: '株系名', dataIndex: 'strainName', key: 'strainName', width: 80 },
    { title: '序列ID', dataIndex: 'sequenceId', key: 'sequenceId', width: 80 },
    { title: '分类信息', dataIndex: 'classificationInfo', key: 'classificationInfo', width: 80 },
    { title: '序列原名', dataIndex: 'originalName', key: 'originalName', width: 200 },
    { title: '操作', key: 'action', width: 30 }
]);

const pathogenSequenceData = ref([]);

// 分页相关数据
const hostPagination = ref({
    current: 1,
    pageSize: 10
});

const pathogenPagination = ref({
    current: 1,
    pageSize: 10
});

const paramTabs = ref([])
const activeParamFileIndex = ref(0)

const currentSample = ref("first");

const emit = defineEmits(["taskCreated"])
const props = defineProps({
    flowDetail: { type: Object, required: true },
    projectDetail: { type: Object, required: true },
})

// 加载病毒种名和病毒分型数据
const loadVirusData = async () => {
    try {
        // 使用文件API从服务器路径读取：/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/species/sp_mapdb.species.class
        const response = await readFileFromDatabaseDir('Pathogen_database/ref_seq_db/species/sp_mapdb.species.class')

        // 检查响应数据是否存在
        if (!response) {
            throw new Error('API响应数据为空')
        }

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
        console.log('-------------------------->', response)
        // 检查响应数据是否存在
        if (!response) {
            throw new Error('API响应数据为空')
        }

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

        // 检查响应数据是否存在
        if (!response) {
            throw new Error('API响应数据为空')
        }

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
// 移除了addParamTab和deleteParamTab函数，因为只允许创建一个任务

const addParamTabFiles = (index) => {
    paramTabs.value[index].files.push(
        JSON.parse(JSON.stringify(newTabParamFiles.value))
    )
    console.log(paramTabs.value)
}

const singleSelected = (event) => {
    openDataSelectorSingle.value = false;
    if (currentSample.value == "first") {
        paramTabs.value[0].files[activeParamFileIndex.value].sampleFirst = event
    } else {
        paramTabs.value[0].files[activeParamFileIndex.value].sampleSecond = event
    }
}

const multiSelected = (event) => {
    openDataSelectorMulti.value = false;
    if (currentSample.value == "multi") {
        paramTabs.value[0].files[activeParamFileIndex.value].samples = event
    } else if (currentSample.value == "first-multi") {
        paramTabs.value[0].files[activeParamFileIndex.value].samplesFirst = event
    } else {
        paramTabs.value[0].files[activeParamFileIndex.value].samplesSecond = event
    }
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
            const selectedVirusName = paramTabs.value[0].virusName
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
            const hostName = paramTabs.value[0].host
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
    const item = paramTabs.value[0]

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
    const item = paramTabs.value[0]

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

const checkCustomDatabase = () => {
    const item = paramTabs.value[0]
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

// 显示信息摘要
const showInformationSummary = async () => {
    const item = paramTabs.value[0]

    // 校验所有必填字段
    if (!item.virusName || (Array.isArray(item.virusName) && item.virusName.length === 0)) {
        errorMessage('请先选择病毒名')
        return
    }

    if (!item.virusType || (Array.isArray(item.virusType) && item.virusType.length === 0)) {
        errorMessage('请先选择病毒分型')
        return
    }

    if (!item.host) {
        errorMessage('请先选择宿主')
        return
    }

    if (!item.hostGenomeVersion) {
        errorMessage('请先选择宿主基因组版本')
        return
    }

    // 校验自定义数据库
    checkCustomDatabase()
    if (item.customDatabaseError) {
        errorMessage('请先填写正确的自定义数据库名')
        return
    }

    try {
        // 收集表单信息
        const requestData = {
            virusName: Array.isArray(item.virusName) ? item.virusName : [item.virusName],
            virusType: Array.isArray(item.virusType) ? item.virusType : [item.virusType],
            host: item.host,
            hostGenomeVersion: item.hostGenomeVersion,
            customDatabase: item.customDatabase
        }

        // 调用API获取数据
        infoMessage('正在获取序列信息...')
        const data = await collectInformation(requestData)

        /**
         const data = await collectInformation(requestData) 返回如下内容
          {
                "host_mapdb_info": "/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr1/human.chr1.hg19.fasta\thuman\tchr1\thg19\tchr1\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr10/human.chr10.hg19.fasta\thuman\tchr10\thg19\tchr10\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr11/human.chr11.hg19.fasta\thuman\tchr11\thg19\tchr11\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr11_gl000202_random/human.chr11_gl000202_random.hg19.fasta\thuman\tchr11_gl000202_random\thg19\tchr11_gl000202_random\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr12/human.chr12.hg19.fasta\thuman\tchr12\thg19\tchr12\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr13/human.chr13.hg19.fasta\thuman\tchr13\thg19\tchr13\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr14/human.chr14.hg19.fasta\thuman\tchr14\thg19\tchr14\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr15/human.chr15.hg19.fasta\thuman\tchr15\thg19\tchr15\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr16/human.chr16.hg19.fasta\thuman\tchr16\thg19\tchr16\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr17/human.chr17.hg19.fasta\thuman\tchr17\thg19\tchr17\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr17_ctg5_hap1/human.chr17_ctg5_hap1.hg19.fasta\thuman\tchr17_ctg5_hap1\thg19\tchr17_ctg5_hap1\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/human/hg19/chr17_gl000203_random/human.chr17_gl000203_random.hg19.fasta\thuman\tchr17_gl000203_random\thg19\tchr17_gl000203_random",
                "sp_mapdb_info": "/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/species/Norovirus/GI/2014-USA/KX907730.1/2014-USA.KX907730.1.GI_P7.fasta\t2014-USA\tKX907730.1\tGI_P7\tKX907730.1 Norovirus Hu/USA/2014/GI.P7_GI.7/GA5043, partial genome\n/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/species/Norovirus/GI/2015-China/KY934262.1/2015-China.KY934262.1.GI_P3.fasta\t2015-China\tKY934262.1\tGI_P3\tKY934262.1 Norovirus GI isolate 0304-19, complete genome"
            }
        将host_mapdb_info 和 sp_mapdb_info 分别解析后渲染到2个表格中
         */

        if (data) {
            // 解析宿主原序列信息 (host_mapdb_info)
            if (data.host_mapdb_info) {
                const hostLines = data.host_mapdb_info.split('\n').filter(line => line.trim())
                hostSequenceData.value = hostLines.map((line, index) => {
                    const parts = line.split('\t')
                    return {
                        key: (index + 1).toString(),
                        sequencePath: parts[0] || '',
                        speciesName: parts[1] || '',
                        sequenceId: parts[2] || '',
                        versionInfo: parts[3] || '',
                        originalName: parts[4] || ''
                    }
                })
                // 重置宿主表格分页状态
                hostPagination.value.current = 1;
            }

            // 解析病原原序列信息 (sp_mapdb_info)
            if (data.sp_mapdb_info) {
                const pathogenLines = data.sp_mapdb_info.split('\n').filter(line => line.trim())
                pathogenSequenceData.value = pathogenLines.map((line, index) => {
                    const parts = line.split('\t')
                    return {
                        key: (index + 1).toString(),
                        sequencePath: parts[0] || '',
                        strainName: parts[1] || '',
                        sequenceId: parts[2] || '',
                        classificationInfo: parts[3] || '',
                        originalName: parts[4] || ''
                    }
                })
                // 重置病原表格分页状态
                pathogenPagination.value.current = 1;
            }

            infoMessage('序列信息获取成功')
        } else {
            errorMessage('获取序列信息失败：响应数据格式错误')
        }
    } catch (error) {
        console.error('获取序列信息失败:', error)
        errorMessage(`获取序列信息失败：${error.message || '未知错误'}`)
    }
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

// 宿主原序列表格操作方法
const deleteHostSequence = (index) => {
    console.log('删除宿主原序列:', index);
    // 计算实际的数据索引（考虑分页）
    const actualIndex = (hostPagination.value.current - 1) * hostPagination.value.pageSize + index;
    hostSequenceData.value.splice(actualIndex, 1);

    // 如果当前页没有数据了，跳转到上一页
    const totalPages = Math.ceil(hostSequenceData.value.length / hostPagination.value.pageSize);
    if (hostPagination.value.current > totalPages && totalPages > 0) {
        hostPagination.value.current = totalPages;
    }
}

// 病原原序列表格操作方法
const deletePathogenSequence = (index) => {
    console.log('删除病原原序列:', index);
    // 计算实际的数据索引（考虑分页）
    const actualIndex = (pathogenPagination.value.current - 1) * pathogenPagination.value.pageSize + index;
    pathogenSequenceData.value.splice(actualIndex, 1);

    // 如果当前页没有数据了，跳转到上一页
    const totalPages = Math.ceil(pathogenSequenceData.value.length / pathogenPagination.value.pageSize);
    if (pathogenPagination.value.current > totalPages && totalPages > 0) {
        pathogenPagination.value.current = totalPages;
    }
}

// 宿主原序列表格分页处理
const handleHostPageChange = (page, pageSize) => {
    console.log('宿主表格分页变化:', page, pageSize);
    hostPagination.value.current = page;
    hostPagination.value.pageSize = pageSize;
}

// 病原原序列表格分页处理
const handlePathogenPageChange = (page, pageSize) => {
    console.log('病原表格分页变化:', page, pageSize);
    pathogenPagination.value.current = page;
    pathogenPagination.value.pageSize = pageSize;
}
</script>

<style scoped>
/* 支持表格单元格自动换行 */
:deep(.ant-table-tbody > tr > td) {
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
}

/* 特别针对路径列的样式 */
:deep(.ant-table-tbody > tr > td:first-child) {
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
    line-height: 1.4;
    padding: 8px 16px;
}
</style>

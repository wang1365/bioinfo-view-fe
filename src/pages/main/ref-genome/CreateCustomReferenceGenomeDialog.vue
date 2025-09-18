<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card
            style="min-width: 800px; max-width: 1200px; min-height: 600px; max-height: 80vh; display: flex; flex-direction: column;"
        >
            <!-- 固定标题栏 -->
            <q-card-section
                class="q-pb-sm"
                style="flex-shrink: 0; position: sticky; top: 0; background: white; z-index: 1;"
            >
                <div class="text-h6">
                    {{ isEdit ? $t('EditCustomReferenceGenome') : $t('CreateCustomReferenceGenome') }}
                </div>
            </q-card-section>

            <q-separator />

            <!-- 可滚动内容区域 -->
            <q-card-section class="q-pt-md flex-1" style="overflow-y: auto; min-height: 0;">
                <div class="row">
                    <q-input
                        v-model="formData.customDatabase"
                        :label="$t('CustomDatabase') + ' *'"
                        outlined
                        label-color="purple"
                        stack-label
                        class="col-12"
                        @blur="checkCustomDatabase"
                        :error="!!formErrors.customDatabase"
                        :error-message="formErrors.customDatabase"
                    />
                </div>
                <div class="row q-col-gutter-sm">
                    <div class="col-3">
                        <q-select
                            v-model="formData.virusName"
                            :options="virusNameOptions"
                            :label="$t('VirusName')"
                            outlined
                            stack-label
                            multiple
                            label-color="purple"
                            use-chips
                            use-input
                            input-debounce="0"
                            @filter="filterVirusName"
                            @update:model-value="onVirusNameChange"
                            :error="!!formErrors.virusName"
                            :error-message="formErrors.virusName"
                        />
                    </div>

                    <div class="col-3">
                        <q-select
                            v-model="formData.virusType"
                            :options="virusTypeOptions"
                            :label="$t('VirusType')"
                            outlined
                            stack-label
                            multiple
                            label-color="purple"
                            use-chips
                            use-input
                            input-debounce="0"
                            @filter="filterVirusType"
                            :error="!!formErrors.virusType"
                            :error-message="formErrors.virusType"
                            :disable="formData.virusName && formData.virusName.length > 1"
                        />
                    </div>

                    <div class="col-3">
                        <q-select
                            v-model="formData.host"
                            :options="hostOptions"
                            :label="$t('Host')"
                            outlined
                            stack-label
                            label-color="purple"
                            use-input
                            input-debounce="0"
                            @filter="filterHost"
                            @update:model-value="onHostChange"
                            :error="!!formErrors.host"
                            :error-message="formErrors.host"
                        />
                    </div>

                    <div class="col-3">
                        <q-select
                            v-model="formData.hostGenomeVersion"
                            :options="hostGenomeVersionOptions"
                            :label="$t('HostGenomeVersion')"
                            outlined
                            stack-label
                            label-color="purple"
                            use-input
                            input-debounce="0"
                            @filter="filterHostGenomeVersion"
                            :error="!!formErrors.hostGenomeVersion"
                            :error-message="formErrors.hostGenomeVersion"
                        />
                    </div>

                    <div class="q-pt-md">
                        <q-btn color="primary" @click="showInformationSummary" :label="$t('InformationSummary')" />
                    </div>
                </div>

                <!-- 宿主原序列信息表格 -->
                <div class="q-mt-md">
                    <a-table
                        :columns="hostSequenceColumns"
                        :data-source="hostSequenceData"
                        :pagination="hostPagination"
                        row-key="key"
                        @change="handleHostPageChange"
                        size="small"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'action'">
                                <q-btn
                                    color="negative"
                                    size="12px"
                                    flat
                                    @click="deleteHostSequence(record)"
                                    :label="$t('Delete')"
                                />
                            </template>
                        </template>
                    </a-table>
                </div>

                <!-- 病原原序列信息表格 -->
                <div class="q-mt-md">
                    <a-table
                        :columns="pathogenSequenceColumns"
                        :data-source="pathogenSequenceData"
                        :pagination="pathogenPagination"
                        row-key="key"
                        @change="handlePathogenPageChange"
                        size="small"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'action'">
                                <q-btn
                                    color="negative"
                                    size="12px"
                                    flat
                                    @click="deletePathogenSequence(record)"
                                    :label="$t('Delete')"
                                />
                            </template>
                        </template>
                    </a-table>
                </div>
            </q-card-section>

            <q-separator />

            <!-- 固定按钮栏 -->
            <q-card-actions align="right" class="bg-white text-teal q-pa-md" style="flex-shrink: 0;">
                <q-btn :label="$t('Cancel')" @click="handleCancel" />
                <q-btn color="primary" class="q-mx-md" :label="$t('Create')" @click="handleSave" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { readFileFromDatabaseDir } from 'src/api/file';
import { errorMessage, infoMessage } from "src/utils/notify";
import { createCustomReferenceGenome, collectInformation, checkFile } from 'src/api/customReferenceGenome'
import { parseHostMapdbInfo, parseSpMapdbInfo } from "./mapDb";


const { t } = useI18n();
const $q = useQuasar();

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    isEdit: {
        type: Boolean,
        default: false
    },
    editData: {
        type: Object,
        default: () => ({})
    }
});

// Emits
const emit = defineEmits(['update:visible', 'save', 'cancel']);

// 对话框可见性
const dialogVisible = ref(false);

// 表单数据
const formData = ref({
    customDatabase: '',
    virusName: [],
    virusType: [],
    host: '',
    hostGenomeVersion: '',
});

// 表单错误
const formErrors = ref({});

// 病毒数据
const virusData = ref([]);
const virusNameOptions = ref([]);
const virusTypeOptions = ref([]);

// 宿主数据
const hostData = ref([]);
const hostOptions = ref([]);
const hostGenomeVersionOptions = ref([]);

// 自定义数据库路径
const customDatabasePaths = ref([]);

// 宿主原序列表格数据
const hostSequenceColumns = computed(() =>[
    {
        title: t('HostSequencePath'),
        dataIndex: 'sequencePath',
        key: 'sequencePath',
        width: 200,
        customRender: ({text}) => text
    },
    {title: t('SpeciesName'), dataIndex: 'speciesName', key: 'speciesName', width: 80},
    {title: t('SequenceId'), dataIndex: 'sequenceId', key: 'sequenceId', width: 100},
    {title: t('VersionInfo'), dataIndex: 'versionInfo', key: 'versionInfo', width: 60},
    {title: t('OriginalName'), dataIndex: 'originalName', key: 'originalName', width: 100},
    {title: t('Operation'), key: 'action', width: 30}
]);

const hostSequenceData = ref([]);
const hostPagination = ref({ current: 1, pageSize: 10 });

// 病原原序列表格数据
const pathogenSequenceColumns = computed(() => [
    {
        title: t('PathogenSequencePath'),
        dataIndex: 'sequencePath',
        key: 'sequencePath',
        width: 200,
        customRender: ({text}) => text
    },
    {title: t('StrainName'), dataIndex: 'strainName', key: 'strainName', width: 80},
    {title: t('SequenceId'), dataIndex: 'sequenceId', key: 'sequenceId', width: 80},
    {title: t('ClassificationInfo'), dataIndex: 'classificationInfo', key: 'classificationInfo', width: 80},
    {title: t('OriginalName'), dataIndex: 'originalName', key: 'originalName', width: 200},
    {title: t('Operation'), key: 'action', width: 30}
]);

const pathogenSequenceData = ref([]);
const pathogenPagination = ref({ current: 1, pageSize: 10 });

// 监听props变化
watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
        resetForm();
        if (props.isEdit && props.editData) {
            Object.assign(formData.value, props.editData);
        }
    }
});

watch(dialogVisible, (newVal) => {
    emit('update:visible', newVal);
});

// 重置表单
const resetForm = () => {
    formData.value = {
        customDatabase: '',
        virusName: [],
        virusType: [],
        host: '',
        hostGenomeVersion: '',
    };
    formErrors.value = {};
    hostSequenceData.value = [];
    pathogenSequenceData.value = [];
    hostPagination.value = { current: 1, pageSize: 10 };
    pathogenPagination.value = { current: 1, pageSize: 10 };
    virusTypeOptions.value = [];
    hostGenomeVersionOptions.value = [];
};

// 加载病毒数据
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
                data.push({virusName, virusType})
            }
        }

        virusData.value = data

        // 提取唯一的病毒种名
        virusNameOptions.value = [...new Set(data.map(item => item.virusName))]
    } catch (error) {
        console.error('加载病毒数据失败:', error)
    }
};

// 加载宿主数据
const loadHostData = async () => {
    try {
        // 使用文件API从服务器路径读取：/data/bioinfo/database_dir/Pathogen_database/ref_seq_db/host/host_mapdb.species.class
        const response = await readFileFromDatabaseDir('Pathogen_database/ref_seq_db/host/host_mapdb.species.class')
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
                hostData.value.push(hostName)
                data.push({hostName, hostGenomeVersion})
            }
        }

        hostData.value = data

        // 提取唯一的宿主名称
        hostOptions.value = [...new Set(data.map(item => item.hostName))]
    } catch (error) {
        console.error('加载宿主数据失败:', error)
    }
};

// 加载自定义数据库路径
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
                data.push({dbName, dbFullName, dbPath})
            }
        }

        customDatabasePaths.value = data
        console.log('=====> Pathogen_database/customize_ref_db/all.ref.path: ', data)
    } catch (error) {
        console.error('加载自定义数据库路径失败:', error)
    }
};

// 过滤函数 - 适配Quasar select组件
const filterVirusName = (val, update) => {
    update(() => {
        if (val === '') {
            virusNameOptions.value = [...Array.from(new Set(virusData.value.map(item => item.virusName)))];
        } else {
            const needle = val.toLowerCase();
            const allOptions = [...Array.from(new Set(virusData.value.map(item => item.virusName)))];
            virusNameOptions.value = allOptions.filter(v => v.toLowerCase().includes(needle));
        }
    });
};

const filterVirusType = (val, update) => {
    update(() => {
        if (val === '') {
            // 保持当前选项不变
        } else {
            const needle = val.toLowerCase();
            virusTypeOptions.value = virusTypeOptions.value.filter(v => v.toLowerCase().includes(needle));
        }
    });
};

const filterHost = (val, update) => {
    update(() => {
        if (val === '') {
            hostOptions.value = Array.from(new Set(hostData.value.map(item => item.hostName)));
        } else {
            const needle = val.toLowerCase();
            const allOptions = Array.from(new Set(hostData.value.map(item => item.hostName)));
            hostOptions.value = allOptions.filter(v => v.toLowerCase().includes(needle));
        }
    });
};

const filterHostGenomeVersion = (val, update) => {
    update(() => {
        if (val === '') {
            // 保持当前选项不变
        } else {
            const needle = val.toLowerCase();
            hostGenomeVersionOptions.value = hostGenomeVersionOptions.value.filter(v => v.toLowerCase().includes(needle));
        }
    });
};

// 事件处理函数
const onVirusNameChange = (value) => {
    const item = formData.value

    // 如果选择了多个病毒种名，则病毒分型固定为ALL
    if (Array.isArray(value) && value.length > 1) {
        item.virusType = ['ALL']
        return
    }

    // 更新病毒分型选项
    if (!value) {
        virusTypeOptions.value = []
        return
    }

    const selectedVirusName = Array.isArray(value) ? value[0] : value
    virusTypeOptions.value = virusData.value
        .filter(item => item.virusName === selectedVirusName)
        .map(item => item.virusType)
};

const onHostChange = (value) => {
    const item = formData.value

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
};

const checkCustomDatabase = () => {
    const dbName = formData.value.customDatabase;

    if (!dbName) {
        formErrors.value.customDatabase = t('CustomDatabaseRequired');
        return false;
    }

    // const regex = /^[a-zA-Z0-9_]+$/;
    // if (!regex.test(dbName)) {
    //     formErrors.value.customDatabase = t('OnlyAllowAlphanumericAndUnderscore');
    //     return false;
    // }


    // customDatabasePaths.value 查找第一个匹配项
    const existingDb = customDatabasePaths.value.find(item => item.dbName === dbName);
    if (existingDb) {
        formErrors.value.customDatabase = t('CustomDatabaseExists') + existingDb.dbPath;
        return false;
    }

    formErrors.value.customDatabase = '';
    return true;
};

// 验证表单
const validateForm = () => {
    if (!checkCustomDatabase()) {
        return false;
    }

    // if (formData.value.virusName.length === 0
    //     && formData.value.virusType.length === 0
    //     && formData.value.host === ''
    //     && formData.value.hostGenomeVersion === ''

    // ) {
    //     // 允许病毒名、病毒分型、宿主、宿主基因组版本为空
    //     return true;
    // }


    const errors = {};
    if (!formData.value.virusName || formData.value.virusName.length === 0) {
        errors.virusName = t('VirusNameRequired');
    }

    if (!formData.value.virusType || formData.value.virusType.length === 0) {
        errors.virusType = t('VirusTypeRequired');
    }

    if (!formData.value.host) {
        errors.host = t('HostRequired');
    }

    if (!formData.value.hostGenomeVersion) {
        errors.hostGenomeVersion = t('HostGenomeVersionRequired');
    }

    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};

// 显示信息摘要
const showInformationSummary = async () => {
    // 清除2个表格数据
    hostSequenceData.value = [];
    pathogenSequenceData.value = [];

    if (!validateForm()) {
        return;
    }

    // const result = await checkFile(formData.value.customDatabase)
    // if (!result.ok) {
    //     formErrors.value.customDatabase = result.msg;
    //     return;
    // }

    try {
        // 收集表单信息
        const requestData = {
            virusName: formData.value.virusName,
            virusType: formData.value.virusType,
            host: formData.value.host,
            hostGenomeVersion: formData.value.hostGenomeVersion,
            customDatabase: formData.value.customDatabase
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
                hostSequenceData.value = parseHostMapdbInfo(data.host_mapdb_info);
                // 重置宿主表格分页状态
                hostPagination.value.current = 1;
            }

            // 解析病原原序列信息 (sp_mapdb_info)
            if (data.sp_mapdb_info) {
                pathogenSequenceData.value = parseSpMapdbInfo(data.sp_mapdb_info);
                // 重置病原表格分页状态
                pathogenPagination.value.current = 1;
            }

            infoMessage(t('SequenceInfoSuccess'))
        } else {
            errorMessage(t('SequenceInfoFormatError'))
        }
    } catch (error) {
        console.error(t('SequenceInfoFailed'), error);
        $q.notify({
            type: 'negative',
            message: t('SequenceInfoFailed') + ': ' + (error.message || t('UnknownError'))
        });
    }
};

// 表格操作函数
const deleteHostSequence = (record) => {
    const index = hostSequenceData.value.findIndex(item => item.key === record.key);
    if (index > -1) {
        hostSequenceData.value.splice(index, 1);
    }
};

const deletePathogenSequence = (record) => {
    const index = pathogenSequenceData.value.findIndex(item => item.key === record.key);
    if (index > -1) {
        pathogenSequenceData.value.splice(index, 1);
    }
};

const handleHostPageChange = (pagination) => {
    hostPagination.value = pagination;
};

const handlePathogenPageChange = (pagination) => {
    pathogenPagination.value = pagination;
};

// 将表格数据转换为CSV格式
const convertTableDataToCsv = (data, headers) => {
    if (!data || data.length === 0) {
        return '';
    }

    // headers中过滤掉操作列
    const filteredHeaders = headers.filter(header => header.dataIndex !== 'action');
    const csvRows = [];

    data.forEach(row => {
        const values = filteredHeaders.map(header => row[header.dataIndex] || '');
        csvRows.push(values.join('\t'));
    });

    return csvRows.join('\n');
};

// 处理保存
const handleSave = () => {
    if (!validateForm()) {
        return;
    }

    // 2个表格数据不能为空
    if (hostSequenceData.value.length === 0) {
        errorMessage('宿主原序列信息不能为空')
        return
    }
    if (pathogenSequenceData.value.length === 0) {
        errorMessage('病原原序列信息不能为空')
        return
    }

    // 生成表格数据的CSV字符串
    const hostMapDbInfo = convertTableDataToCsv(hostSequenceData.value, hostSequenceColumns.value);
    const spMapDbInfo = convertTableDataToCsv(pathogenSequenceData.value, pathogenSequenceColumns.value);

    const data = {
        custom_database: formData.value.customDatabase,
        virus_name: formData.value.virusName || [],
        virus_type: formData.value.virusType || [],
        host: formData.value.host || '',
        host_genome_version: formData.value.hostGenomeVersion || '',
        host_map_db: hostMapDbInfo,
        sp_map_db: spMapDbInfo,
    }


    createCustomReferenceGenome(data).then((resp) => {
        infoMessage('创建成功')
        dialogVisible.value = false;
        emit('save', resp.data);
    }).catch((error) => {
        errorMessage('创建失败: ' + (error.message || '未知错误'))
    });
};

// 处理取消
const handleCancel = () => {
    dialogVisible.value = false;
    emit('cancel');
};

// 组件挂载时加载数据
onMounted(() => {
    loadVirusData();
    loadHostData();
    loadCustomDatabasePaths();
});
</script>

<style lang="scss" scoped>
.ant-table {
    .ant-table-tbody > tr > td {
        padding: 12px 16px;
    }
}

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

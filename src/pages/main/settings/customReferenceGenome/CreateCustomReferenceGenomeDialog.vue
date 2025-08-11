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
                        class="col-6"
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
                            :label="$t('VirusName') + ' *'"
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
                            :label="$t('VirusType') + ' *'"
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
                        />
                    </div>

                    <div class="col-3">
                        <q-select
                            v-model="formData.host"
                            :options="hostOptions"
                            :label="$t('Host') + ' *'"
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
                            :label="$t('HostGenomeVersion') + ' *'"
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

                    <div class="col-12">
                        <q-btn color="primary" @click="showInformationSummary" :label="'获取序列信息'" />
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
                                <q-btn color="negative" size="sm" @click="deleteHostSequence(record)" label="删除" />
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
                                    size="sm"
                                    @click="deletePathogenSequence(record)"
                                    label="删除"
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
                <q-btn color="primary" :label="$t('Save')" @click="handleSave" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { readFileFromDatabaseDir } from 'src/api/file';
import { collectInformation } from 'src/api/cdc';
import { errorMessage, infoMessage } from "src/utils/notify";

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
    hostGenomeVersion: ''
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
const hostSequenceColumns = ref([
    {
        title: '宿主原序列路径',
        dataIndex: 'sequencePath',
        key: 'sequencePath',
        width: 200,
        customRender: ({text}) => text
    },
    {title: '物种名', dataIndex: 'speciesName', key: 'speciesName', width: 80},
    {title: '序列ID', dataIndex: 'sequenceId', key: 'sequenceId', width: 100},
    {title: '版本信息', dataIndex: 'versionInfo', key: 'versionInfo', width: 60},
    {title: '序列原名', dataIndex: 'originalName', key: 'originalName', width: 100},
    {title: '操作', key: 'action', width: 30}
]);

const hostSequenceData = ref([]);
const hostPagination = ref({ current: 1, pageSize: 10 });

// 病原原序列表格数据
const pathogenSequenceColumns = ref([
    {
        title: '病原原序列路径',
        dataIndex: 'sequencePath',
        key: 'sequencePath',
        width: 200,
        customRender: ({text}) => text
    },
    {title: '株系名', dataIndex: 'strainName', key: 'strainName', width: 80},
    {title: '序列ID', dataIndex: 'sequenceId', key: 'sequenceId', width: 80},
    {title: '分类信息', dataIndex: 'classificationInfo', key: 'classificationInfo', width: 80},
    {title: '序列原名', dataIndex: 'originalName', key: 'originalName', width: 200},
    {title: '操作', key: 'action', width: 30}
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
        custom_database: '',
        virus_name: [],
        virus_type: [],
        host: '',
        host_genome_version: ''
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
        console.log('======> virusdata', virusData.value)
    } catch (error) {
        console.error('加载病毒数据失败:', error)
    }
};

// 加载宿主数据
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
                hostData.value.push(hostName)
                data.push({hostName, hostGenomeVersion})
            }
        }

        hostData.value = data

        // 提取唯一的宿主名称
        const uniqueHostNames = [...new Set(data.map(item => item.hostName))]
        hostOptions.value = uniqueHostNames
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
    } catch (error) {
        console.error('加载自定义数据库路径失败:', error)
    }
};

// 过滤函数 - 适配Quasar select组件
const filterVirusName = (val, update) => {
    update(() => {
        if (val === '') {
            virusNameOptions.value = ['ALL', ...Array.from(new Set(virusData.value.map(item => item.virusName)))];
        } else {
            const needle = val.toLowerCase();
            const allOptions = ['ALL', ...Array.from(new Set(virusData.value.map(item => item.virusName)))];
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
    if (value && value.length > 0) {
        if (value.includes('ALL')) {
            formData.value.virus_name = ['ALL'];
            virusTypeOptions.value = ['ALL'];
            formData.value.virus_type = ['ALL'];
        } else {
            const filteredTypes = virusData.value
                .filter(item => value.includes(item.virusName))
                .map(item => item.virusType);
            const uniqueTypes = [...new Set(filteredTypes)];
            virusTypeOptions.value = uniqueTypes.length > 1 ? ['ALL', ...uniqueTypes] : uniqueTypes;

            if (uniqueTypes.length === 1) {
                formData.value.virus_type = uniqueTypes;
            } else {
                formData.value.virus_type = [];
            }
        }
    } else {
        virusTypeOptions.value = [];
        formData.value.virus_type = [];
    }
};

const onHostChange = (value) => {
    if (value) {
        const filteredVersions = hostData.value
            .filter(item => item.hostName === value)
            .map(item => item.hostGenomeVersion);
        const uniqueVersions = [...new Set(filteredVersions)];
        hostGenomeVersionOptions.value = uniqueVersions.length > 1 ? ['ALL', ...uniqueVersions] : uniqueVersions;

        if (uniqueVersions.length === 1) {
            formData.value.host_genome_version = uniqueVersions[0];
        } else {
            formData.value.host_genome_version = '';
        }
    } else {
        hostGenomeVersionOptions.value = [];
        formData.value.host_genome_version = '';
    }
};

const checkCustomDatabase = () => {
    const dbName = formData.value.customDatabase;

    if (!dbName) {
        formErrors.value.customDatabase = t('Required');
        return;
    }

    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(dbName)) {
        formErrors.value.customDatabase = t('OnlyAllowAlphanumericAndUnderscore');
        return;
    }

    const exists = customDatabasePaths.value.some(item => item.dbName === dbName);
    if (exists) {
        formErrors.value.customDatabase = '该自定义数据库名称已存在';
        return;
    }

    formErrors.value.customDatabase = '';
};

// 验证表单
const validateForm = () => {
    const errors = {};

    if (!formData.value.customDatabase) {
        errors.customDatabase = '自定义数据库名称不能为空';
    }

    if (!formData.value.virusName || formData.value.virus_name.length === 0) {
        errors.virusName = '病毒种名不能为空';
    }

    if (!formData.value.virusType || formData.value.virusType.length === 0) {
        errors.virusType = '病毒分型不能为空';
    }

    if (!formData.value.host) {
        errors.host = '宿主不能为空';
    }

    if (!formData.value.hostGenomeVersion) {
        errors.hostGenomeVersion = '宿主基因组版本不能为空';
    }

    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};

// 显示信息摘要
const showInformationSummary = async () => {
    if (!validateForm()) {
        return;
    }

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
        console.error('获取序列信息失败:', error);
        $q.notify({
            type: 'negative',
            message: '获取序列信息失败: ' + (error.message || '未知错误')
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
const convertTableDataToCsv = (data) => {
    if (!data || data.length === 0) {
        return '';
    }

    const headers = ['seq_id', 'seq_name', 'seq_length', 'seq_description'];
    const csvRows = [];

    csvRows.push(headers.join(','));

    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
};

// 处理保存
const handleSave = () => {
    if (!validateForm()) {
        return;
    }

    const submitData = {
        ...formData.value,
        host_sequence_csv: convertTableDataToCsv(hostSequenceData.value),
        pathogen_sequence_csv: convertTableDataToCsv(pathogenSequenceData.value)
    };

    emit('save', submitData);
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

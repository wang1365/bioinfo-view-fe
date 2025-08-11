<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="自建参考基因组详情" />

        <q-card v-if="detailData">
            <q-card-section>
                <q-toolbar class="q-gutter-x-sm">
                    <q-icon size="md" color="primary" name="ballot" />
                    <q-toolbar-title class="text-h6">
                        {{ detailData.custom_database }}
                    </q-toolbar-title>
                    <q-btn color="primary" :label="$t('BackToList')" icon="arrow_back" @click="goBack()" flat />
                </q-toolbar>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-lg">
                <div class="row q-gutter-lg">
                    <!-- 基本信息 -->
                    <div class="col-12">
                        <div class="text-h6 q-mb-sm text-primary">{{ $t('BasicInfo') }}</div>
                        <div class="row q-gutter-sm">
                            <div class="col-5">
                                <q-input
                                    :label="$t('CustomDatabase')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :model-value="detailData.custom_database"
                                />
                            </div>
                            <div class="col-5">
                                <q-input
                                    :label="$t('CreatedAt')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :model-value="formatDate(detailData.create_time)"
                                />
                            </div>
                        </div>

                        <div class="row q-gutter-sm q-mt-sm">
                            <div class="col-5">
                                <q-input
                                    :label="$t('Host')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :model-value="detailData.host"
                                />
                            </div>
                            <div class="col-5">
                                <q-input
                                    :label="$t('HostGenomeVersion')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :model-value="detailData.host_genome_version"
                                />
                            </div>
                        </div>

                        <div class="row q-gutter-sm q-mt-sm">
                            <div class="col-5">
                                <q-input
                                    :label="$t('VirusName')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :model-value="formatJson(detailData.virus_name)"
                                />
                            </div>
                            <div class="col-5">
                                <q-input
                                    :label="$t('VirusType')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :model-value="formatJson(detailData.virus_type)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 文件信息 -->
                <div class="row q-gutter-lg q-mt-lg">
                    <div class="col-12">
                        <div class="text-h6 q-mb-sm text-primary">{{ $t('FileInfo') }}</div>
                        <div class="row q-gutter-sm">
                            <div class="col-5">
                                <q-input
                                    :label="$t('HostSeqFile')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :value="detailData.host_seq_file"
                                />
                            </div>
                            <div class="col-5">
                                <q-input
                                    :label="$t('VirusSeqFile')"
                                    label-color="primary"
                                    stack-label
                                    outlined
                                    readonly
                                    :value="detailData.virus_seq_file"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 序列信息 -->
                <div class="row q-gutter-lg q-mt-sm">
                    <div class="col-12">
                        <div class="text-h6 q-mb-sm text-primary">{{ $t('SequenceInfo') }}</div>

                        <!-- 宿主原序列信息表格 -->
                        <div class="q-mb-md">
                            <a-table
                                :columns="hostSequenceColumns"
                                :data-source="hostSequenceData"
                                :pagination="hostPagination"
                                row-key="key"
                                @change="handleHostPageChange"
                                size="small"
                            />
                        </div>

                        <!-- 病原原序列信息表格 -->
                        <div class="q-mb-md">
                            <a-table
                                :columns="pathogenSequenceColumns"
                                :data-source="pathogenSequenceData"
                                :pagination="pathogenPagination"
                                row-key="key"
                                @change="handlePathogenPageChange"
                                size="small"
                            />
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- 加载状态 -->
        <q-card v-else>
            <q-card-section class="text-center">
                <q-spinner-dots size="50px" color="primary" />
                <div class="q-mt-md">加载中...</div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getCustomReferenceGenomeDetail } from 'src/api/customReferenceGenome';
import { errorMessage } from 'src/utils/notify';
import { toLocalString } from 'src/utils/time';
import { parseHostMapdbInfo, parseSpMapdbInfo } from './mapDb';
import PageTitle from "components/page-title/PageTitle.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const detailData = ref(null);

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
    {title: '序列原名', dataIndex: 'originalName', key: 'originalName', width: 100}
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
    {title: '序列原名', dataIndex: 'originalName', key: 'originalName', width: 200}
]);

const pathogenSequenceData = ref([]);
const pathogenPagination = ref({ current: 1, pageSize: 10 });

onMounted(() => {
    loadDetail();
});

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return toLocalString(dateString);
    } catch (e) {
        return dateString;
    }
};

// 格式化JSON字段显示
const formatJson = (jsonData) => {
    if (!jsonData) return '';
    try {
        if (typeof jsonData === 'string') {
            const parsed = JSON.parse(jsonData);
            return Object.values(parsed).join(', ');
        } else if (typeof jsonData === 'object') {
            return Object.values(jsonData).join(', ');
        }
        return String(jsonData);
    } catch (e) {
        return String(jsonData);
    }
};



// 表格分页处理方法
const handleHostPageChange = (pagination) => {
    hostPagination.value = pagination;
};

const handlePathogenPageChange = (pagination) => {
    pathogenPagination.value = pagination;
};

// 处理宿主序列数据转换为表格格式
const processHostSequenceData = (hostInfo) => {
    if (!hostInfo) return [];

    try {
        // 如果是字符串格式（类似host_mapdb_info），使用解析函数
        if (typeof hostInfo === 'string') {
            return parseHostMapdbInfo(hostInfo);
        }

        // 如果是其他格式，保持原有逻辑
        if (Array.isArray(hostInfo)) {
            return hostInfo.map((item, index) => ({
                key: index,
                ...item
            }));
        } else if (typeof hostInfo === 'object') {
            return Object.entries(hostInfo).map(([key, value], index) => ({
                key: index,
                sequencePath: key,
                ...value
            }));
        }

        return [];
    } catch (error) {
        console.error('处理宿主序列数据失败:', error);
        return [];
    }
};

// 处理病原序列数据转换为表格格式
const processPathogenSequenceData = (virusInfo) => {
    if (!virusInfo) return [];

    try {
        // 如果是字符串格式（类似sp_mapdb_info），使用解析函数
        if (typeof virusInfo === 'string') {
            return parseSpMapdbInfo(virusInfo);
        }

        // 如果是其他格式，保持原有逻辑
        if (Array.isArray(virusInfo)) {
            return virusInfo.map((item, index) => ({
                key: index,
                ...item
            }));
        } else if (typeof virusInfo === 'object') {
            return Object.entries(virusInfo).map(([key, value], index) => ({
                key: index,
                sequencePath: key,
                ...value
            }));
        }

        return [];
    } catch (error) {
        console.error('处理病原序列数据失败:', error);
        return [];
    }
};

// 加载详情数据
const loadDetail = async () => {
    try {
        const id = route.params.id;
        detailData.value = await getCustomReferenceGenomeDetail(id);

        // 处理表格数据
        if (detailData.value) {
            hostSequenceData.value = parseHostMapdbInfo(detailData.value.host_map_db);
            pathogenSequenceData.value = parseSpMapdbInfo(detailData.value.sp_map_db);
        }
    } catch (error) {
        errorMessage(t('LoadDataFailed') || '加载详情失败');
        console.error('加载详情失败:', error);
    }
};

// 返回列表
const goBack = () => {
    router.push('/main/settings/customReferenceGenome');
};
</script>

<style lang="scss" scoped>
.q-field--readonly .q-field__control {
    opacity: 1;
}

.q-field--readonly .q-field__control .q-field__control-container {
    padding-top: 8px;
    padding-bottom: 8px;
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

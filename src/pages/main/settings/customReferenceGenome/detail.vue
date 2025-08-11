<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="自建参考基因组详情" />

        <q-card v-if="detailData">
            <q-card-section>
                <q-toolbar class="q-gutter-x-sm">
                    <q-icon size="md" color="primary" name="biotech" />
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
                        <div class="text-h6 q-mb-sm text-purple">{{ $t('BasicInfo') }}</div>
                        <div class="row q-gutter-sm">
                            <div class="col-5">
                                <q-field :label="$t('CustomDatabase')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            {{ detailData.custom_database }}
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                            <div class="col-5">
                                <q-field :label="$t('Host')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            {{ detailData.host }}
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                        </div>

                        <div class="row q-gutter-sm q-mt-sm">
                            <div class="col-5">
                                <q-field :label="$t('HostGenomeVersion')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            {{ detailData.host_genome_version }}
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                            <div class="col-5">
                                <q-field :label="$t('CreatedAt')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            {{ formatDate(detailData.create_time) }}
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                        </div>

                        <div class="row q-gutter-sm q-mt-sm">
                            <div class="col-5">
                                <q-field :label="$t('VirusName')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            <pre>{{ formatJson(detailData.virus_name) }}</pre>
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                            <div class="col-5">
                                <q-field :label="$t('VirusType')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            <pre>{{ formatJson(detailData.virus_type) }}</pre>
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 文件信息 -->
                <div class="row q-gutter-lg q-mt-lg" v-if="detailData.host_seq_file || detailData.virus_seq_file">
                    <div class="col-12">
                        <div class="text-h6 q-mb-sm text-purple">{{ $t('FileInfo') }}</div>
                        <div class="row q-gutter-sm">
                            <div class="col-5" v-if="detailData.host_seq_file">
                                <q-field :label="$t('HostSeqFile')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            {{ detailData.host_seq_file }}
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                            <div class="col-5" v-if="detailData.virus_seq_file">
                                <q-field :label="$t('VirusSeqFile')" stack-label outlined readonly>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline">
                                            {{ detailData.virus_seq_file }}
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 序列信息 -->
                <div class="row q-gutter-lg q-mt-sm" v-if="detailData.host_info || detailData.virus_info">
                    <div class="col-12">
                        <div class="text-h6 q-mb-sm text-purple">{{ $t('SequenceInfo') }}</div>

                        <!-- 宿主原序列信息 -->
                        <div v-if="detailData.host_info" class="q-mb-sm">
                            <div class="text-subtitle1 q-mb-sm text-grey-8">{{ $t('HostSequenceInfo') }}</div>
                            <q-card flat bordered>
                                <q-card-section>
                                    <pre class="sequence-info">{{ formatJsonDisplay(detailData.host_info) }}</pre>
                                </q-card-section>
                            </q-card>
                        </div>

                        <!-- 病原原序列信息 -->
                        <div v-if="detailData.virus_info">
                            <div class="text-subtitle1 q-mb-sm text-grey-8">{{ $t('VirusSequenceInfo') }}</div>
                            <q-card flat bordered>
                                <q-card-section>
                                    <pre class="sequence-info">{{ formatJsonDisplay(detailData.virus_info) }}</pre>
                                </q-card-section>
                            </q-card>
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
import PageTitle from "components/page-title/PageTitle.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const detailData = ref(null);

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

// 格式化JSON显示（用于序列信息）
const formatJsonDisplay = (jsonData) => {
    if (!jsonData) return '';
    try {
        if (typeof jsonData === 'string') {
            return JSON.stringify(JSON.parse(jsonData), null, 2);
        } else if (typeof jsonData === 'object') {
            return JSON.stringify(jsonData, null, 2);
        }
        return String(jsonData);
    } catch (e) {
        return String(jsonData);
    }
};

// 加载详情数据
const loadDetail = async () => {
    try {
        const id = route.params.id;
        // 模拟数据，替换实际API调用
        detailData.value = {
            id: id,
            custom_database: 'test_database_' + id,
            host: 'Human',
            host_genome_version: 'GRCh38',
            create_time: new Date().toISOString(),
            virus_name: { "SARS-CoV-2": "新型冠状病毒" },
            virus_type: { "RNA": "RNA病毒" },
            host_seq_file: 'host_genome.fasta',
            virus_seq_file: 'virus_genome.fasta',
            host_info: { "chromosomes": 23, "size": "3.2GB" },
            virus_info: { "genome_length": 29903, "type": "single-strand RNA" }
        };
        // const response = await getCustomReferenceGenomeDetail(id);
        // detailData.value = response.data;
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
.sequence-info {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 300px;
    overflow-y: auto;
    margin: 0;
    padding: 8px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.q-field--readonly .q-field__control {
    opacity: 1;
}

.q-field--readonly .q-field__control .q-field__control-container {
    padding-top: 8px;
    padding-bottom: 8px;
}
</style>

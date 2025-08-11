<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="自建参考基因组" />
        <q-card>
            <q-card-section>
                <q-toolbar class="q-gutter-x-sm">
                    <q-icon size="md" color="primary" name="biotech" />
                    <q-toolbar-title class="text-h6">
                        {{ $t('CustomReferenceGenomeList') }}
                    </q-toolbar-title>
                    <q-input
                        style="width: 250px"
                        dense
                        v-model="search"
                        :label="$t('SearchCustomDatabase')"
                        clearable
                        @clear="refreshPage()"
                    />
                    <q-btn color="primary" icon="search" @click="refreshPage()"></q-btn>
                    <q-btn color="primary" :label="$t('Add')" icon="add" @click="openNewDialog = true" />
                </q-toolbar>
            </q-card-section>
            <q-card-section>
                <div class="q-pa-md">
                    <a-table
                        :columns="columns"
                        :data-source="dataItems"
                        :pagination="paginationConfig"
                        :loading="loading"
                        row-key="id"
                        @change="handleTableChange"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'virus_name'">
                                {{ formatJsonField(record.virus_name) }}
                            </template>
                            <template v-else-if="column.key === 'virus_type'">
                                {{ formatJsonField(record.virus_type) }}
                            </template>
                            <template v-else-if="column.key === 'create_time'">
                                {{ toLocalString(record.create_time) }}
                            </template>
                            <template v-if="column.key === 'actions'">
                                <a-space>
                                    <a-button type="primary" size="small" @click="gotoDetail(record)">
                                        <template #icon><EyeOutlined /></template>
                                        {{ $t('Detail') }}
                                    </a-button>
                                    <a-button type="primary" danger size="small" @click="confirmDelete(record)">
                                        <template #icon><DeleteOutlined /></template>
                                        {{ $t('Delete') }}
                                    </a-button>
                                </a-space>
                            </template>
                        </template>
                    </a-table>
                </div>
            </q-card-section>
        </q-card>

        <!-- 新建对话框 -->
        <CreateCustomReferenceGenomeDialog
            v-model:visible="openNewDialog"
            @save="handleDialogSave"
            @cancel="handleDialogCancel"
        />
    </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import {
    getCustomReferenceGenomeList,
    createCustomReferenceGenome,
    deleteCustomReferenceGenome
} from 'src/api/customReferenceGenome';
import { infoMessage, errorMessage } from 'src/utils/notify';
import { toLocalString } from 'src/utils/time';
import PageTitle from "components/page-title/PageTitle.vue";
import CreateCustomReferenceGenomeDialog from './CreateCustomReferenceGenomeDialog.vue';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

// 列表相关
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dataItems = ref([]);
const loading = ref(false);

// 表格列定义
const columns = computed(() => [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
    },
    {
        title: t('CustomDatabase'),
        dataIndex: 'custom_database',
        key: 'custom_database',
        ellipsis: true,
    },
    {
        title: t('VirusName'),
        dataIndex: 'virus_name',
        key: 'virus_name',
        ellipsis: true,
    },
    {
        title: t('VirusType'),
        dataIndex: 'virus_type',
        key: 'virus_type',
        ellipsis: true,
    },
    {
        title: t('Host'),
        dataIndex: 'host',
        key: 'host',
    },
    {
        title: t('HostGenomeVersion'),
        dataIndex: 'host_genome_version',
        key: 'host_genome_version',
    },
    {
        title: t('CreatedAt'),
        dataIndex: 'create_time',
        key: 'create_time',
        width: 180,
    },
    {
        title: t('Actions'),
        key: 'actions',
        width: 150,
        fixed: 'right',
    },
]);

// 分页配置
const paginationConfig = computed(() => ({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
    pageSizeOptions: ['10', '20', '50', '100'],
}));

// 对话框相关
const openNewDialog = ref(false);



onMounted(() => {
    loadPage();
});

// 格式化JSON字段显示
const formatJsonField = (jsonData) => {
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



// 加载列表数据
const loadPage = async () => {
    try {
        loading.value = true;
        const params = {
            page: currentPage.value,
            page_size: pageSize.value
        };

        if (search.value) {
            params.search = search.value;
        }

        const response = await getCustomReferenceGenomeList(params);
        // 模拟数据，因为后端API可能还没有实现
        dataItems.value = [
            {
                id: 1,
                custom_database: 'custom_db_1',
                virus_name: { name: 'SARS-CoV-2' },
                virus_type: { type: 'Beta' },
                host: 'Human',
                host_genome_version: 'GRCh38',
                create_time: new Date().toISOString()
            },
            {
                id: 2,
                custom_database: 'custom_db_2',
                virus_name: { name: 'Influenza A' },
                virus_type: { type: 'H1N1' },
                host: 'Human',
                host_genome_version: 'GRCh37',
                create_time: new Date().toISOString()
            }
        ];
        total.value = 2;
    } catch (error) {
        errorMessage(t('LoadDataFailed') || '加载数据失败');
        console.error('加载数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 刷新页面
const refreshPage = () => {
    currentPage.value = 1;
    loadPage();
};

// 处理表格变化（分页、排序、筛选）
const handleTableChange = (pagination, filters, sorter) => {
    currentPage.value = pagination.current;
    pageSize.value = pagination.pageSize;
    loadPage();
};

// 分页变化（保留兼容性）
const pageChange = async (event) => {
    currentPage.value = event.currentPage;
    pageSize.value = event.pageSize;
    loadPage();
};

// 跳转到详情页
const gotoDetail = (item) => {
    router.push(`/main/settings/customReferenceGenome/${item.id}`);
};





// 处理对话框保存事件
const handleDialogSave = async (formData) => {
    try {
        await createCustomReferenceGenome(formData);
        infoMessage(t('CreateSuccess') || '创建成功');

        openNewDialog.value = false;
        loadPage();
    } catch (error) {
        errorMessage(t('CreateFailed') || '创建失败');
        console.error('保存失败:', error);
    }
};

// 处理对话框取消事件
const handleDialogCancel = () => {
    openNewDialog.value = false;
};

// 确认删除
const confirmDelete = (item) => {
    $q.dialog({
        title: t('ConfirmDelete') || '确认删除',
        message: `${t('ConfirmDeleteCustomReferenceGenome') || '确定要删除此自建参考基因组吗？'} "${item.custom_database}"`,
        cancel: true,
        persistent: true
    }).onOk(async () => {
        try {
            await deleteCustomReferenceGenome(item.id);
            infoMessage(t('DeleteSuccess') || '删除成功');
            loadPage();
        } catch (error) {
            errorMessage(t('DeleteFailed') || '删除失败');
            console.error('删除失败:', error);
        }
    });
};
</script>

<style lang="scss" scoped>
// Ant Design Vue表格样式已经内置，这里可以添加自定义样式
.ant-table {
    .ant-table-tbody > tr > td {
        padding: 12px 16px;
    }
}
</style>

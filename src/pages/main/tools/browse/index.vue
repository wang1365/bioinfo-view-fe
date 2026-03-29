<template>
    <div class="q-pa-md browse-list-page">
        <PageTitle :title="$t('SampleDataSearch')" />

        <div class="page-list-filter row q-px-md bio-data-table">
            <q-input
                v-model="searchOption.keyword"
                :placeholder="$t('PatientName')"
                clearable
                dense
                filled
                class="page-list-filter__field"
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <q-input
                v-model="searchOption.sampleIdentifier"
                :placeholder="$t('SampleIdentifier')"
                clearable
                dense
                filled
                class="page-list-filter__field"
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <q-input
                v-model="searchOption.dataIdentifier"
                :placeholder="$t('DataIdentifier')"
                clearable
                dense
                filled
                class="page-list-filter__field"
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <q-input
                v-model="searchOption.reagentBox"
                :placeholder="$t('CaptureKit')"
                clearable
                dense
                filled
                class="page-list-filter__field"
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <AppActionButton variant="primary" icon="search" :label="$t('Search')" @click="clickSearch" />
            <AppActionButton icon="close" :label="$t('Reset')" @click="clickReset" />
        </div>

        <a-table
            :data-source="rows"
            :columns="columns"
            :loading="loading"
            size="small"
            bordered
            class="page-grid-table"
            :scroll="{ x: 2000, y: 550 }"
            :sticky="true"
            :pagination="pagination"
            @change="tableChange"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'operation'">
                    <div class="table-operation-buttons">
                        <TableActionButton
                            v-if="filterTasks(record.tasks || [], 3).length > 0"
                            label="IGV"
                            variant="primary"
                        >
                            <q-menu>
                                <q-list>
                                    <q-item
                                        v-for="task in filterTasks(record.tasks || [], 3)"
                                        :key="task.id"
                                        :disable="!isTaskClickable(task)"
                                        clickable
                                        v-close-popup
                                        @click="clickView(record.id, task)"
                                    >
                                        {{ `${task.flow_name} - ${task.name}` }}
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </TableActionButton>
                    </div>
                </template>

                <template v-else>
                    <template v-if="getCellValue(record, column.dataIndex)">
                        <a-tooltip
                            color="#3b4146"
                            :title="getCellValue(record, column.dataIndex)"
                            :overlay-style="{ maxWidth: '1200px' }"
                        >
                            <div>{{ String(getCellValue(record, column.dataIndex)).substring(0, 20) }}</div>
                        </a-tooltip>
                    </template>
                    <span v-else>{{ getCellValue(record, column.dataIndex) }}</span>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup>
import { listSample } from 'src/api/sample'
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageTitle from 'components/page-title/PageTitle'
import { useI18n } from 'vue-i18n'
import * as _ from 'lodash'
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'

const { t } = useI18n()
const loading = ref(false)
const router = useRouter()
const route = useRoute()

const columns = computed(() => [
    { key: 'id', title: 'ID', dataIndex: 'id', fixed: true, align: 'center', width: 60 },
    { key: 'patient_key', title: t('Patient'), dataIndex: ['patient', 'name'], fixed: true, width: 90 },
    { key: 'patient_age', title: t('Age'), dataIndex: ['patient', 'age'], fixed: true, align: 'center', width: 60 },
    {
        title: t('SamplingSite'),
        dataIndex: ['sample_meta', 'sample_componet'],
        fixed: true,
        align: 'center',
        width: 90,
    },
    {
        title: t('TumorSample'),
        dataIndex: ['sample_meta', 'is_panel'],
        align: 'center',
        width: 90,
    },
    {
        title: t('SampleIdentifier'),
        dataIndex: ['sample_meta', 'identifier'],
        align: 'center',
        width: 120,
    },
    { title: t('DataIdentifier'), dataIndex: 'identifier', width: 120, ellipsis: true },
    { key: 'project_index', title: t('DataDetail'), dataIndex: 'project_index', width: 180, ellipsis: true },
    { key: 'library_number', title: t('LibraryNumber'), dataIndex: 'library_number', width: 120 },
    { key: 'reagent_box', title: t('CaptureKit'), dataIndex: 'reagent_box', width: 200, ellipsis: true },
    { key: 'nucleic_break_type', title: t('NucleicBreakType'), dataIndex: 'nucleic_break_type', width: 120 },
    { key: 'library_input', title: t('LibraryInput'), dataIndex: 'library_input', width: 120 },
    { key: 'index_type', title: t('IndexType'), dataIndex: 'index_type', width: 120 },
    { key: 'index_number', title: t('IndexNumber'), dataIndex: 'index_number', width: 120 },
    { key: 'hybrid_input', title: t('HybridInput'), dataIndex: 'hybrid_input', width: 120 },
    { key: 'risk', title: t('TakeRisks'), dataIndex: 'risk', width: 120 },
    { key: 'nucleic_level', title: t('NucleicLevel'), dataIndex: 'nucleic_level', align: 'center', width: 120 },
    { key: 'nucleic_type', title: t('NucleicType'), dataIndex: 'nucleic_type', align: 'center', width: 120 },
    { key: 'fastq1_path', title: t('Fastq1Path'), dataIndex: 'fastq1_path', width: 130, ellipsis: true },
    { key: 'fastq2_path', title: t('Fastq2Path'), dataIndex: 'fastq2_path', width: 130, ellipsis: true },
    { key: 'operation', title: t('Operate'), dataIndex: 'operation', fixed: 'right', align: 'center', width: 120 },
])

const pagination = ref({
    position: ['bottomRight'],
    current: 1,
    total: 0,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: total => t('PaginationTotal', { total }),
})

const searchOption = ref({
    keyword: null,
    sampleIdentifier: null,
    dataIdentifier: null,
    reagentBox: null,
})

const rows = ref([])

const tableChange = pg => {
    pagination.value = { ...pg, showTotal: pagination.value.showTotal }
}

onMounted(() => {
    searchOption.value = { ...route.query }
    pagination.value.current = Number(route.query.page) || 1
    pagination.value.pageSize = Number(route.query.size) || 10
    refreshSamples()
})

watch(
    () => route.query,
    () => {
        refreshSamples()
    }
)

watch(pagination, () => {
    refreshUrl()
})

const getCellValue = (record, dataIndex) => {
    if (Array.isArray(dataIndex)) {
        return _.get(record, dataIndex)
    }
    return _.get(record, dataIndex)
}

const filterTasks = (tasks, status) => {
    return (tasks || []).filter(task => status === task.status && task.exist_igv)
}

const clickReset = () => {
    searchOption.value = {
        keyword: null,
        sampleIdentifier: null,
        dataIdentifier: null,
        reagentBox: null,
    }
    pagination.value.current = 1
    pagination.value.pageSize = 10
    refreshUrl()
}

const clickSearch = () => {
    refreshUrl()
}

const refreshUrl = () => {
    const { keyword, sampleIdentifier, dataIdentifier, reagentBox } = searchOption.value
    router.replace({
        path: route.path,
        query: {
            keyword,
            sampleIdentifier,
            dataIdentifier,
            reagentBox,
            page: pagination.value.current,
            size: pagination.value.pageSize,
        },
    })
}

const refreshSamples = () => {
    startLoading()
    listSample(searchOption.value, pagination.value.current, pagination.value.pageSize)
        .then(data => {
            rows.value = data.results
            pagination.value.total = data.count
        })
        .finally(stopLoading)
}

const startLoading = () => {
    loading.value = true
}

const stopLoading = () => {
    loading.value = false
}

const isTaskClickable = () => {
    return true
}

const clickView = (sampleId, task) => {
    router.push({
        path: '/main/tools/browse/detail',
        query: { sample: sampleId, task: task.id },
    })
}
</script>

<style lang="scss" scoped>
.browse-list-page {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>

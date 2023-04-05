<template>
    <q-page padding>
        <PageTitle :title="$t('SampleDataSearch')" />
        <div class="row items-center q-gutter-sm q-my-sm">
            <q-input
                :label="$t('PatientName')"
                v-model="searchOption.keyword"
                clearable
                :label-color="primary"
                class="col-2"
                dense
                stack-label
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <q-input
                :label="$t('SampleIdentifier')"
                v-model="searchOption.sampleIdentifier"
                clearable
                :label-color="primary"
                class="col-2"
                dense
                stack-label
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <q-input
                :label="$t('DataIdentifier')"
                v-model="searchOption.dataIdentifier"
                clearable
                :label-color="primary"
                class="col-2"
                dense
                stack-label
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <q-input
                :label="$t('CaptureKit')"
                v-model="searchOption.reagentBox"
                clearable
                :label-color="primary"
                class="col-2"
                dense
                stack-label
                @clear="refreshUrl"
                @keypress.enter="clickSearch"
            />
            <div class="q-ml-sm col-2 col reverse">
                <q-btn color="primary" icon="search" class="row-auto" :label="$t('Search')" @click="clickSearch" />
                <q-btn color="primary" icon="clear" class="row-auto q-mx-sm" :label="$t('Reset')" @click="clickReset" />
            </div>
        </div>
        <a-table
            :data-source="rows"
            :columns="columns"
            :scroll="{ x: 2000 }"
            :sticky="true"
            class="ant-table-striped"
            :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
            :pagination="pagination"
            @change="tableChange"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'operation'">
                    <q-btn
                        label="Igv"
                        color="primary"
                        icon-right="arrow_drop_down"
                        size="xs"
                        v-if="filterTasks(record.tasks, 3).length > 0"
                    >
                        <q-menu>
                            <q-list>
                                <q-item
                                    v-for="task in filterTasks(record.tasks, 3)"
                                    :key="task.id"
                                    :disable="!isTaskClickable(task)"
                                    clickable
                                    v-close-popup
                                    @click="clickView(record.id, task)"
                                >
                                    {{ `【${task.flow_name}】${task.name}` }}
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </template>
            </template>
        </a-table>
    </q-page>
</template>

<script setup>
import { listSample, getSample } from 'src/api/sample'
import {ref, watch, onMounted, computed} from 'vue'
import { useQuasar} from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import PageTitle from 'components/page-title/PageTitle'
import { useI18n }from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const router = useRouter()
const route = useRoute()

const columns = computed(() => [
    {key: 'id', title: 'ID', dataIndex: 'id', fixed: true, align: 'center', width: 50},

    // 患者
    {key: 'patient_key', title: t('Patient'), dataIndex: ["patient", "name"], fixed: true, width: 80},
    {key: 'patient_age', title: t('Age'), dataIndex: ["patient", "age"], fixed: true, align: 'center', width: 60},

    // 样本
    {
        title: t('SampleComponent'),
        dataIndex: ["sample_meta", "sample_componet"],
        fixed: true,
        align: 'center',
        width: 90
    },
    {
        title: t('TumorSample'),
        dataIndex: ["sample_meta", "is_panel"],
        align: 'center',
        width: 90,
        customRender: (text, record) => text ? '√' : '×'
    },
    {
        title: t('SampleIdentifier'),
        dataIndex: ["sample_meta", "identifier"],
        align: 'center',
        width: 120
    },

    // 样本数据
    {title: t('DataIdentifier'), dataIndex: 'identifier', width: 120, ellipsis: true},
    {key: 'project_index', title: t('DataDetail'), dataIndex: 'project_index', width: 180, ellipsis: true},
    {key: 'library_number', title: t('LibraryNumber'), dataIndex: 'library_number', width: 120},
    {key: 'reagent_box', title: t('CaptureKit'), dataIndex: 'reagent_box', width: 200, ellipsis: true},
    {key: 'nucleic_break_type', title: t('NucleicBreakType'), dataIndex: 'nucleic_break_type', width: 120},
    {key: 'library_input', title: t('LibraryInput'), dataIndex: 'library_input', width: 120},
    {key: 'index_type', title: t('IndexType'), dataIndex: 'index_type', width: 120},
    {key: 'index_number', title: t('IndexNumber'), dataIndex: 'index_number', width: 120},
    {key: 'hybrid_input', title: t('HybridInput'), dataIndex: 'hybrid_input', width: 120},
    {key: 'risk', title: t('TakeRisks'), dataIndex: 'risk', width: 120},
    {key: 'nucleic_level', title: t('NucleicLevel'), dataIndex: 'nucleic_level', align: 'center', width: 120},
    {key: 'nucleic_type', title: t('NucleicType'), dataIndex: 'nucleic_type', align: 'center', width: 120},
    {key: 'fastq1_path', title: t('Fastq1Path'), dataIndex: 'fastq1_path', width: 130, ellipsis: true},
    {key: 'fastq2_path', title: t('Fastq2Path'), dataIndex: 'fastq2_path', width: 130, ellipsis: true},
    {key: 'operation', title: t('Actions'), fixed: 'right', align: 'center', width: 120},
])

const pagination = ref({
    position: ['bottomRight'],
    current: 1,
    total: 0,
    pageSize: 5,
    showSizeChanger: true,
    showTotal: (total) => t('TotalCount') + `：${total}`
    // rowsNumber: xx if getting data from a server
})

const searchOption = ref({
    keyword: null,
    sampleIdentifier: null,
    dataIdentifier: null,
    reagentBox: null
})

const rows = ref([])
const mode = ref('info')
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)


const tableChange = (pg, filters, sorter) => {
    pagination.value = { ...pg, showTotal: pagination.value.showTotal }
    refreshSamples()
}

onMounted(() => {
    searchOption.value = {...route.query}
    pagination.value.current = Number(route.query.page) || 1
    pagination.value.pageSize = Number(route.query.size) || 10
    refreshSamples()
})

watch(
    () => route.query,
    (v) => {
        console.log('==> watch route', v)
        // searchOption.value = route.query
        refreshSamples()
    }
)

watch(
    pagination,
    params => {
        refreshUrl()
    }
)

const filterTasks = (tasks, status) => {
    return tasks.filter(t => status === t.status)
}

const clickReset = () => {
    searchOption.value = {
        keyword: null, sampleIdentifier: null, dataIdentifier: null, reagentBox: null
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
    const query = {
        keyword, sampleIdentifier, dataIdentifier, reagentBox,
        page: pagination.value.current,
        size: pagination.value.pageSize
    }
    console.log('===> Push', query)
    router.replace({ path: route.path, query })
}

const refreshSamples = () => {
    startLoading()

    listSample(searchOption.value, pagination.value.current, pagination.value.pageSize)
        .then((data) => {
            rows.value = data.results
            total.value = data.count
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

const isTaskClickable = (task) => {
    return true
    // return !task.exist_igv
}
const clickView = (sample_id, task) => {
    const openInNewTab = false
    if (!openInNewTab) {
        // 直接路由
        router.push({
                path: '/main/tools/browse/detail',
                query: {sample: sample_id, task: task.id}
            }
        )
    } else {
        // 新页面打开
        const routeUrl = router.resolve({
            path: '/browse',
            query: {sample: sample_id, task: task.id}
        })
        window.open(routeUrl.href, '_blank')
    }
}
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}
.ant-table-striped :deep(.table-striped) td {
    background-color: #fafafa;
}
</style>

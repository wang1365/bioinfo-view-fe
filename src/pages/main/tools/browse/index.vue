<template>
    <q-page padding>
        <PageTitle title="样本数据检索" />
        <!--        <q-table-->
        <!--            :rows="rows"-->
        <!--            :columns="columns"-->
        <!--            :loading="loading"-->
        <!--            row-key="name"-->
        <!--            hide-no-data-->
        <!--            wrap-cells-->
        <!--            v-model:pagination="pagination"-->
        <!--            rows-per-page-label="每页条数"-->
        <!--            :rows-per-page-options="[10, 20, 50, 100]"-->
        <!--            class="bio-data-table"-->
        <!--        >-->
        <!--            <template v-slot:top>-->
        <!--                <q-input-->
        <!--                    label="患者姓名"-->
        <!--                    v-model="keyword"-->
        <!--                    clearable-->
        <!--                    @clear="refreshSamples"-->
        <!--                    @keypress.enter="refreshSamples"-->
        <!--                >-->
        <!--                    <template v-slot:prepend>-->
        <!--                        <q-icon name="search" />-->
        <!--                    </template>-->
        <!--                </q-input>-->
        <!--                <q-btn color="primary" class="q-ml-sm" label="查询" @click="refreshSamples" />-->
        <!--            </template>-->
        <!--            &lt;!&ndash;            <template v-slot:header="props">&ndash;&gt;-->
        <!--            &lt;!&ndash;                <q-tr :props="props">&ndash;&gt;-->
        <!--            &lt;!&ndash;                    <q-th v-for="col in columns" :key="col.name" :props="props" class="text-weight-bolder text-h6">&ndash;&gt;-->
        <!--            &lt;!&ndash;                        {{ col.label }}&ndash;&gt;-->
        <!--            &lt;!&ndash;                    </q-th>&ndash;&gt;-->
        <!--            &lt;!&ndash;                </q-tr>&ndash;&gt;-->
        <!--            &lt;!&ndash;            </template>&ndash;&gt;-->
        <!--            <template v-slot:body-cell-operation="props">-->
        <!--                <q-td :props="props" align="center" class="q-gutter-xs">-->
        <!--                    <q-btn-->
        <!--                        v-if="props.row.tasks.length > 0"-->
        <!--                        label="浏览"-->
        <!--                        color="primary"-->
        <!--                        icon="arrow_drop_down"-->
        <!--                        outline-->
        <!--                        size="xs"-->
        <!--                    >-->
        <!--                        <q-menu>-->
        <!--                            <q-list>-->
        <!--                                <q-item-->
        <!--                                    v-for="task in props.row.tasks"-->
        <!--                                    :key="task.id"-->
        <!--                                    :disable="!task.exist_igv"-->
        <!--                                    clickable-->
        <!--                                    v-close-popup-->
        <!--                                    @click="clickView(props.row.id, task)"-->
        <!--                                >-->
        <!--                                    {{`【${task.flow_name}】${task.name}`}}-->
        <!--                                </q-item>-->
        <!--                            </q-list>-->
        <!--                        </q-menu>-->
        <!--                    </q-btn>-->
        <!--                    &lt;!&ndash;                    <q-btn label="编辑" color="orange" outline size="sm" @click="showEditDlg(props.row)"></q-btn>&ndash;&gt;-->
        <!--                </q-td>-->
        <!--            </template>-->
        <!--        </q-table>-->

        <div class="row items-center">
            <q-input
                label="患者姓名"
                v-model="keyword"
                clearable
                class="col-4"
                @clear="refreshSamples"
                @keypress.enter="refreshSamples"
            >
            </q-input>
            <div class="q-ml-sm col-1 col reverse">
                <q-btn color="primary" class="row-auto" label="查询" @click="refreshSamples" />
            </div>
        </div>
        <a-table
            :data-source="rows"
            :columns="columns"
            :scroll="{x:1200}"
            :sticky="true"
            :pagination="pagination"
            @change="tableChange"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'operation'">
                    <q-btn
                        v-if="record.tasks && record.tasks.length > 0"
                        label="浏览"
                        color="primary"
                        icon="arrow_drop_down"
                        outline
                        size="xs"
                    >
                        <!--                    <q-btn label="浏览" color="primary" icon="arrow_drop_down" outline size="xs">-->
                        <q-menu>
                            <q-list>
                                <q-item
                                    v-for="task in record.tasks"
                                    :key="task.id"
                                    :disable="!task.exist_igv"
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
import {listSample, getSample} from 'src/api/sample'
import {ref, reactive, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import {useRouter} from 'vue-router'
import PageTitle from 'components/page-title/PageTitle'

const loading = ref(false)
const currentFlowId = ref(null)
const router = useRouter()

const columns = [
    {key: 'id', title: 'ID', dataIndex: 'id', fixed: true, align: 'center', width: 50},

    // 患者
    {key: 'patient_key', title: '患者', dataIndex: ["patient", "name"], fixed: true, width: 80},
    {key: 'patient_age', title: '年龄', dataIndex: ["patient", "age"], fixed: true, align: 'center', width: 50},

    // 样本
    {
        title: '采样部位',
        dataIndex: ["sample_meta", "sample_componet"],
        fixed: true,
        align: 'center',
        width: 80
    },
    {
        title: '肿瘤样本',
        dataIndex: ["sample_meta", "is_panel"],
        fixed: true,
        align: 'center',
        width: 80,
        customRender: (text, record) => text ? '√' : '×'
    },
    {
        title: '样本标识号',
        dataIndex: ["sample_meta", "identifier"],
        fixed: true,
        align: 'center',
        width: 120
    },

    // 样本数据
    {title: '数据识别号', dataIndex: 'identifier', fixed: 'left', width: 120},
    {key: 'project_index', title: '项目编码', dataIndex: 'project_index', width: 120},
    {key: 'library_number', title: '文库编号', dataIndex: 'library_number', width: 120},
    {key: 'reagent_box', title: '捕获试剂盒', dataIndex: 'reagent_box', width: 120},
    {key: 'nucleic_break_type', title: '核酸打断方式', dataIndex: 'nucleic_break_type', width: 120},
    {key: 'library_input', title: '建库input', dataIndex: 'library_input', width: 120},
    {key: 'index_type', title: 'index类型', dataIndex: 'index_type', width: 120},
    {key: 'index_number', title: 'index编号', dataIndex: 'index_number', width: 120},
    {key: 'hybrid_input', title: '杂交input', dataIndex: 'hybrid_input', width: 120},
    {key: 'risk', title: '风险上机', dataIndex: 'risk', width: 120},
    {key: 'nucleic_level', title: '核酸降解等级', dataIndex: 'nucleic_level', align: 'center', width: 120},
    {key: 'nucleic_type', title: '核酸类型', dataIndex: 'nucleic_type', align: 'center', width: 120},
    {key: 'fastq1_path', title: 'fastq1文件地址', dataIndex: 'fastq1_path', width: 120},
    {key: 'fastq2_path', title: 'fastq2文件地址', dataIndex: 'fastq2_path', width: 120},
    {key: 'operation', title: '操作', fixed: 'right', align: 'center', width: 120},
]

const pagination = ref({
    position: ['bottomRight'],
    current: 1,
    total: 0,
    pageSize: 10,
    showSizeChanger: true,
    // rowsNumber: xx if getting data from a server
})

const rows = ref([])
const selectedFlow = ref({})
const mode = ref('info')
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const keyword = ref('')


const tableChange = (pg, filters, sorter) => {
    console.log('pagination changes', pg)
    pagination.value = pg
    refreshSamples()
}

onMounted(() => {
    refreshSamples()
})

const refreshSamples = () => {
    startLoading()
    listSample(keyword.value, page.value, total.value)
        .then((data) => {
            rows.value = data.results
            total.value = data.count
        })
        .finally(stopLoading)
}


const startLoading = () => {
    loading.value = true
}

const stopLoading = () => {
    loading.value = false
}


const clickView = (sample_id, task) => {
    router.push({
            path: '/main/tools/browse/detail',
            query: {sample: sample_id, task: task.id}
        }
    )
}


const handleSizeChange = (size) => {
    pageSize.value = size
    refreshSamples()
}

const handleCurrentChange = (page) => {
    page.value = page
    refreshSamples()
}
</script>

<style lang="scss" scoped>
.pagination {
    padding: 30px 30px 0 0;
    text-align: center;
}

.bio-data-table {
    max-width: 99%;

    thead tr:first-child th:first-child {
        background-color: #fff;
    }

    /* bg color is important for th; just specify one */


    td:first-child {
        background-color: #f5f5dc;
    }

    th:first-child, td:first-child {
        position: sticky;
        left: 0;
    }
}

/* specifying max-width so the example can
  highlight the sticky column on any browser window */
</style>

<template>
    <q-page padding>
        <PageTitle title="样本数据检索" />
        <q-table
            :rows="rows"
            :columns="columns"
            :loading="loading"
            row-key="name"
            hide-no-data
            wrap-cells
            v-model:pagination="pagination"
            rows-per-page-label="每页条数"
            :rows-per-page-options="[10, 20, 50, 100]"
            class="bio-data-table"
        >
            <template v-slot:top>
                <q-input
                    label="患者姓名"
                    v-model="keyword"
                    clearable
                    @clear="refreshSamples"
                    @keypress.enter="refreshSamples"
                >
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-btn color="primary" class="q-ml-sm" label="查询" @click="refreshSamples" />
            </template>
            <!--            <template v-slot:header="props">-->
            <!--                <q-tr :props="props">-->
            <!--                    <q-th v-for="col in columns" :key="col.name" :props="props" class="text-weight-bolder text-h6">-->
            <!--                        {{ col.label }}-->
            <!--                    </q-th>-->
            <!--                </q-tr>-->
            <!--            </template>-->
            <template v-slot:body-cell-operation="props">
                <q-td :props="props" align="center" class="q-gutter-xs">
                    <q-btn v-if="props.row.tasks.length > 0" label="浏览" color="primary" icon="arrow_drop_down" outline size="xs" >
                        <q-menu>
                            <q-list>
                                <q-item v-for="task in props.row.tasks" :key="task.id"
                                    clickable v-close-popup @click="clickView(props.row.id, task)">
                                    {{`【${task.flow_name}】${task.name}`}}
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                    <!--                    <q-btn label="编辑" color="orange" outline size="sm" @click="showEditDlg(props.row)"></q-btn>-->
                </q-td>
            </template>
        </q-table>
    </q-page>
</template>

<script setup>
import {listSample, getSample} from 'src/api/sample'
import {ref, reactive,  onMounted} from 'vue'
import {useQuasar} from 'quasar'
import {useRouter} from 'vue-router'
import PageTitle from 'components/page-title/PageTitle'

const loading = ref(false)
const currentFlowId = ref(null)
const router = useRouter()

const columns = [
    {name: 'id', label: 'ID', align: 'center', style: 'width:80px', required: true, field: (row) => row.id},
    {
        name: 'patient_name', label: '患者', field: row => row.patient.name, sortable: true, align: 'center',
        headerStyle: 'width: 200px', required: true
    },
    {
        name: 'patient_age',
        label: '年龄',
        field: row => row.patient.age,
        sortable: true,
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'project_index',
        label: '项目编码',
        align: 'center',
        field: 'project_index',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'library_number',
        label: '文库编号',
        field: 'library_number',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'reagent_box',
        label: '捕获试剂盒',
        field: 'reagent_box',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'nucleic_break_type',
        label: '核酸打断方式',
        field: 'nucleic_break_type',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'library_input',
        label: '建库input',
        field: 'library_input',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'index_type',
        label: 'index类型',
        field: 'index_type',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'index_number',
        label: 'index编号',
        field: 'index_number',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'hybrid_input',
        label: '杂交input',
        field: 'hybrid_input',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {name: 'risk', label: '风险上机', field: 'risk', align: 'center', headerStyle: 'width: 200px', required: true},
    {
        name: 'nucleic_level',
        label: '核酸降解等级',
        field: 'nucleic_level',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'nucleic_type',
        label: '核酸类型',
        field: 'nucleic_type',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'fastq1_path',
        label: 'fastq1文件地址',
        field: 'fastq1_path',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {
        name: 'fastq2_path',
        label: 'fastq2文件地址',
        field: 'fastq2_path',
        align: 'center',
        headerStyle: 'width: 200px',
        required: true
    },
    {name: 'operation', label: '操 作', align: 'center', headerStyle: 'width:250px', required: true},
]

const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    // rowsNumber: xx if getting data from a server
})

const rows = ref([])
const selectedFlow = ref({})
const mode = ref('info')
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const keyword = ref('')

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
            query: { sample: sample_id, task: task.id }
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

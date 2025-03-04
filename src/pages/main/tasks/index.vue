<template>
    <q-page class="q-px-sm q-pt-sm" style="overflow-x: hidden">
        <PageTitle :title="$t('TaskPageListTitle')" />
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div
                style="height: 70px;display: flex; padding-bottom: 5px; padding-top: 15px;justify-content: space-around;justify-items: center;align-items: center; "
            >
                <q-btn color="white" @click="clickCard(options[0].value)">
                    <div class="text-black" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ total_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusAll') }}</div>
                    </div>
                </q-btn>

                <q-btn color="primary" @click="clickCard(options[1].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-white text-h6 text-center text-bold">{{ taskSummary.running_task_count }}</div>
                        <div class="text-white text-h6 text-center text-bold">{{ $t('TaskPageListStatusRun') }}</div>
                    </div>
                </q-btn>
                <q-btn color="negative" @click="clickCard(options[3].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ taskSummary.failured_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusFail') }}</div>
                    </div>
                </q-btn>
                <q-btn color="secondary" @click="clickCard(options[2].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ taskSummary.pending_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusQueue') }}</div>
                    </div>
                </q-btn>
                <q-btn color="positive" @click="clickCard(options[4].value)">
                    <div class="text-white" style="width: 7vw">
                        <div class="text-h6 text-center text-bold">{{ taskSummary.finished_task_count }}</div>
                        <div class="text-h6 text-center text-bold">{{ $t('TaskPageListStatusFinish') }}</div>
                    </div>
                </q-btn>
            </div>
        </div>
        <div class="row q-gutter-sm q-my-sm">
            <q-select
                style="width:200px"
                v-model="status"
                :options="options"
                stack-label
                emit-value
                map-options
                clearable
                filled
                @clear="clearSelect()"
                dense
                @update:model-value="refreshPage()"
            />

            <q-input
                style="width:150px"
                filled
                dense
                clearable
                v-model="patient"
                :label="`${$t('Patient')} ${$t('Name')}`"
            />
            <q-input
                style="width:150px"
                filled
                dense
                clearable
                v-model="libraryNumber"
                :label="$t('DataListTableColumnLibraryNumber')"
            />
            <q-input style="width:150px" filled dense clearable v-model="taskName" :label="$t('Task') + $t('Name')" />
            <q-input
                style="width:300px"
                readonly
                filled
                dense
                @click="showProjectSelect = true"
                :model-value="$t('Project') + ': ' + projectName"
            >
                <template v-slot:prepend>
                    <q-icon class="cursor-pointer" name="search" @click="showProjectSelect = true" />
                </template>
            </q-input>
            <q-btn color="primary" size="md" :label="$t('Search')" icon="search" @click="refreshPage()" />
            <q-btn color="primary" size="md" :label="$t('Reset')" icon="clear" @click="reset()" />
        </div>
        <div class="q-px-sm">
            <a-table :columns="columns" :data-source="rows" :pagination="pagination" :scroll="{ x: 1800, y: 550 }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex ==='name'">
                        <span class="text-weight-bolder" style="font-size: 14px" v-if="record.status !== 'FINISHED'">
                            {{ record.name }}
                        </span>
                        <a v-else @click="gotoReport(record)" class="text-weight-bolder" style="font-size: 14px">
                            {{ record.name }}
                        </a>

                        <div style="font-size: 12px">
                            <div class="text-grey">{{ record.project.name }}</div>
                            <div v-if="record.project.parent" class="text-bold text-purple q-mr-xs">
                                {{ record.project.parent.name }}
                            </div>
                        </div>
                    </template>

                    <template v-if="column.dataIndex ==='status'">
                        <q-btn
                            v-if="record.status === 'FAILURED'"
                            color="red"
                            :label="$t('Failed')"
                            flat
                            padding="xs"
                            icon-right="help"
                            @click="showTaskError(record)"
                            size="sm"
                        />
                        <span v-else>{{ $t(statusKey[record.status]) }}</span>
                        <q-linear-progress
                            v-if="record.status === 'CANCELED'"
                            color="warning"
                            rounded
                            size="10px"
                            :value="record.progress / 100"
                        />
                        <q-linear-progress
                            v-if="record.status === 'RUNNING'"
                            color="primary"
                            rounded
                            size="10px"
                            :value="record.progress / 100"
                        />
                        <q-linear-progress
                            v-if="record.status === 'FAILURED'"
                            color="negative"
                            rounded
                            size="10px"
                            :value="record.progress / 100"
                        />
                        <q-linear-progress
                            v-if="record.status === 'PENDING'"
                            color="secondary"
                            rounded
                            size="10px"
                            :value="record.progress / 100"
                        />
                        <q-linear-progress
                            v-if="record.status === 'FINISHED'"
                            color="positive"
                            rounded
                            size="10px"
                            :value="record.progress / 100"
                        />
                    </template>

                    <template v-if="column.dataIndex ==='patient'">
                        <div v-for="sd in record.sample_data.slice(0,3)" :key="sd.sample_data_identifier">
                            {{ sd.patient_name }}
                        </div>
                        <div v-if="record.sample_data.length > 3" class="text-grey">
                            ... ({{ record.sample_data.length }})
                        </div>
                    </template>

                    <template v-if="column.dataIndex ==='sample'">
                        <div v-for="sd in record.sample_data.slice(0,3)" :key="sd.sample_data_identifier">
                            {{ sd.sample_data_identifier }}
                        </div>
                        <div v-if="record.sample_data.length > 3" class="text-grey">
                            ... ({{ record.sample_data.length }})
                        </div>
                    </template>
                    <template v-if="column.dataIndex ==='data'">
                        <div v-for="sd in record.sample_data.slice(0,3)" :key="sd.sample_data_identifier">
                            {{ sd.sample_identifier }}
                        </div>
                        <div v-if="record.sample_data.length > 3" class="text-grey">
                            ... ({{ record.sample_data.length }})
                        </div>
                    </template>
                    <template v-if="column.dataIndex ==='library_number'">
                        <div v-for="sd in record.sample_data.slice(0,3)" :key="sd.sample_data_identifier">
                            {{ sd.library_number }}
                        </div>
                        <div v-if="record.sample_data.length > 3" class="text-grey">
                            ... ({{ record.sample_data.length }})
                        </div>
                    </template>

                    <template v-if="column.dataIndex === 'task_priority'">
                        <template v-if="record.priority === 2">
                            <span class="text-red">{{ $t('High') }}</span>
                            <q-btn
                                v-if="amISuper() || amIAdmin()"
                                size="xs"
                                flat
                                icon="south"
                                padding="xs"
                                @click="raisePriority(record, 1)"
                            />
                        </template>
                        <template v-else>
                            <span class="text-primary">{{ $t('Normal') }}</span>
                            <q-btn
                                v-if="amISuper() || amIAdmin()"
                                size="xs"
                                flat
                                icon="north"
                                padding="xs"
                                @click="raisePriority(record, 2)"
                            />
                        </template>
                    </template>

                    <template v-if="column.dataIndex === 'creator' ">
                        <div>{{ record.creator.username }}</div>
                        <div class="text-grey">
                            {{ date.formatDate(new Date(record.create_time), 'YYYY-MM-DD HH:mm:ss') }}
                        </div>
                    </template>

                    <template v-if="column.dataIndex === 'operate'">
                        <div class="row q-gutter-xs">
                            <q-btn
                                color="primary"
                                :label="$t('Detail')"
                                icon="visibility"
                                @click="gotoDetail(record)"
                                size="md"
                                dense
                                flat
                                padding="0"
                            />
                            <q-separator vertical />
                            <q-btn
                                :disable="record.status !== 'FINISHED'"
                                :color="record.status !== 'FINISHED' ? 'grey' : 'primary'"
                                :label="$t('Result')"
                                icon="query_stats"
                                @click="gotoReport(record)"
                                size="md"
                                dense
                                flat
                                padding="0"
                            />
                            <q-separator vertical />
                            <div v-permission="'createReport'">
                                <q-btn
                                    :disable="record.status !== 'FINISHED' || !record.flow.allow_define_report"
                                    :color="(record.status !== 'FINISHED' || !record.flow.allow_define_report) ? 'grey': 'primary'"
                                    :label="$t('TaskPageBtnCustomReport')"
                                    icon="query_stats"
                                    @click="gotoDefineReport(record)"
                                    size="md"
                                    dense
                                    flat
                                    padding="0"
                                />
                                <q-separator vertical />
                            </div>

                            <q-btn label="" color="primary" size="md" padding="0" dense outline flat icon="more_horiz">
                                <q-menu>
                                    <q-list style="min-width: 100px" dense>
                                        <q-item clickable>
                                            <q-item-section>
                                                <q-btn
                                                    :disable="record.status !== 'FINISHED'"
                                                    color="primary"
                                                    size="md"
                                                    dense
                                                    align="left"
                                                    icon="download"
                                                    flat
                                                    padding="xs sm"
                                                    :href="download(record)"
                                                    :label="$t('Download')"
                                                />
                                            </q-item-section>
                                        </q-item>
                                        <q-item>
                                            <q-item-section>
                                                <q-btn
                                                    color="primary"
                                                    padding="xs sm"
                                                    :disable="record.status !== 'FINISHED'"
                                                    :label="$t('Download') + ' bam'"
                                                    icon="download"
                                                    size="md"
                                                    align="left"
                                                    dense
                                                    flat
                                                    :href="`/igv${record.result_dir}/bam/${record.id}-bam.zip`"
                                                    target="_blank"
                                                />
                                            </q-item-section>
                                        </q-item>
                                        <q-separator />
                                        <q-item clickable>
                                            <q-item-section>
                                                <q-btn
                                                    v-permission="'deleteTaskTmpFile'"
                                                    :disable="record.status !== 'FINISHED' || record.deleted_tempdir"
                                                    color="red"
                                                    :label="$t('TaskPageBtnDeleteTmpFile')"
                                                    icon="delete"
                                                    @click="deleteMiddleFiles(record)"
                                                    size="md"
                                                    dense
                                                    align="left"
                                                    flat
                                                    padding="xs sm"
                                                >
                                                    <q-tooltip
                                                        >{{
                                                            $t('TaskPageListTableRowBtnDeleteTmpTip')
                                                        }}
                                                    </q-tooltip>
                                                </q-btn>
                                            </q-item-section>
                                        </q-item>
                                        <q-item clickable>
                                            <q-item-section>
                                                <q-btn
                                                    v-permission="'deleteTask'"
                                                    color="red"
                                                    padding="xs sm"
                                                    :label="$t('Delete')"
                                                    icon="delete"
                                                    size="md"
                                                    dense
                                                    align="left"
                                                    flat
                                                    @click="confirm(record)"
                                                />
                                            </q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>
                        </div>
                    </template>
                </template>
            </a-table>
        </div>
        <q-dialog v-model="showProjectSelect">
            <ProjectListVue @itemSelected="projectSelected($event)" />
        </q-dialog>
        <q-dialog v-model="showError">
            <q-card class="q-mt-md popup-selector">
                <div class="popup-content">
                    <div class="popup-content-header">
                        <q-toolbar>
                            <q-toolbar-title>{{ $t('Error') }}</q-toolbar-title>
                            <q-btn flat round dense icon="close" v-close-popup />
                        </q-toolbar>
                    </div>
                </div>
                <p class="q-pa-sm">{{ currentTaskError || 'None' }}</p>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useApi } from 'src/api/apiBase';
import PageTitle from 'components/page-title/PageTitle.vue';
import ProjectListVue from './components/ProjectList.vue';
import { useRouter } from 'vue-router';
import { updateTask } from 'src/api/task';
import { infoMessage } from 'src/utils/notify';
import { useQuasar, date } from 'quasar';
import { useI18n } from 'vue-i18n';
import { globalStore } from 'src/stores/global';
import { storeToRefs } from 'pinia';
import { useQTable } from 'src/utils/q-table';
import { amIAdmin, amISuper } from 'src/utils/user';

const store = globalStore();
const { langCode } = storeToRefs(store);
const { t } = useI18n();

const intId = ref(null);
const $q = useQuasar();

// const { tableRef, pagination, rows, refreshPage, loadDataOnMount } = useQTable();
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
    showSizeChanger: true,
    showTotal: (total, range) => `${t('TotalCount')} ${total} `,
    onChange: (page, pageSize) => {
        pagination.value.current = page;
        pagination.value.pageSize = pageSize;
        doRequest();
    }
});

const columns = computed(() => [
    { dataIndex: 'id', title: 'ID', align: 'left', width: 60 , fixed: 'left'},
    { dataIndex: 'name',  title: t('Name'), align: 'left', width: 180 , fixed: 'left'},
    { dataIndex: 'patient', title: t('Patient') + t('Name'), align: 'left', width: 100 },
    { dataIndex: 'sample', title: t('Sample'), align: 'left', width: 120 },
    { dataIndex: 'data', title: t('Data'), align: 'left', width: 120 },
    { dataIndex: 'library_number', title: t('LibraryNumber'), align: 'left', width: 220},
    { dataIndex: ['flow', 'name'], title: t('Flow'), align: 'left', width: 200, },
    { dataIndex: 'status', title: t('Status'), align: 'center', width: 100 },
    { dataIndex: 'task_priority', title: t('TaskPriority'), align: 'left', width: 100, },
    { dataIndex: 'creator', title: t('CreatedBy'), align: 'left', width: 160, },
    { dataIndex: 'operate', title: t('Operate'), align: 'center', fixed: 'right', width: langCode.value === 'en' ? 320 : 270}
]);

// const columns = computed(() => [
//     { dataIndex: 'id', key: '1', title: 'ID', width: 80, fixed: 'left' },
//     { dataIndex: 'name',  key: '2', title: t('Name'), width: 180, fixed: 'left' },
//     { dataIndex: 'patient', key: '3', title: t('Patient') + t('Name'), align: 'left' },
//     { dataIndex: 'sample', key: '4', title: t('Sample'),  },
//     { dataIndex: 'data', key: '5', title: t('Data'),  },
//     { dataIndex: 'library_number', key: '6', title: t('LibraryNumber'), },
//     { dataIndex: ['flow', 'name'], key: '7', title: t('Flow'), },
//     { dataIndex: 'status', key: '8', title: t('Status'), align: 'center',  },
//     { dataIndex: 'task_priority', key: '9', title: t('TaskPriority'), },
//     { dataIndex: 'creator', key: '10', title: t('CreatedBy'), },
//     { dataIndex: 'operate', key: '11', title: t('Operate'),  }
// ]);


const options = computed(() => [
    { label: t('TaskPageListStatusAll'), value: 'ALL' },
    { label: t('TaskPageListStatusRun'), value: 'RUNNING' },
    { label: t('TaskPageListStatusQueue'), value: 'PENDING' },
    { label: t('TaskPageListStatusFail'), value: 'FAILURED' },
    { label: t('TaskPageListStatusFinish'), value: 'FINISHED' },
    { label: t('TaskPageListStatusCancel'), value: 'CANCELED' }
]);

const statusKey = {
    'PENDING': 'TaskPageListStatusQueue',
    'RUNNING': 'TaskPageListStatusRun',
    'FINISHED': 'TaskPageListStatusFinish',
    'FAILURED': 'TaskPageListStatusFail',
    'CANCELED': 'TaskPageListStatusCancel'
};

const status = ref('ALL');
const showProjectSelect = ref(false);
const showError = ref(false);
const currentTaskError = ref('');
const projectId = ref(0);
const projectName = ref('');
const patient = ref('');
const libraryNumber = ref('');
const taskName = ref('');
const { apiGet, downloadData, apiDelete } = useApi();
const router = useRouter();
const rows = ref([]);

const taskSummary = ref({
    canceled_task_count: 0,
    failured_task_count: 0,
    finished_task_count: 0,
    pending_task_count: 0,
    running_task_count: 0
});

const total_task_count = computed(() => {
    const ts = taskSummary.value;
    return (
        ts.canceled_task_count +
        ts.failured_task_count +
        ts.finished_task_count +
        ts.pending_task_count +
        ts.running_task_count
    );
});

const onRequest = (props) => {
    doRequest(props.pagination);
};

const doRequest = (showLoading = true) => {
    if (showLoading) {
        $q.loading.show();
    }
    console.log('==============> show', pagination.value);

    const current = pagination.value.current;
    const pageSize = pagination.value.pageSize;
    let params = `?page=${current}&size=${pageSize}`;

    if (status.value !== 'ALL') params += `&status=${status.value}`;
    if (projectId.value) params += `&project_id=${projectId.value}`;
    if (patient.value) params += `&patient=${patient.value}`;
    if (libraryNumber.value) params += `&libraryNumber=${libraryNumber.value}`;
    if (taskName.value) params += `&task_name=${taskName.value}`;

    backupSearch();
    apiGet(`/task${params}`, (res) => {
            pagination.value.total = res.data.total_count;
            rows.value = res.data.item_list;
            for (let item of rows.value) {
                item.actions = true;
            }
        }, {}, null, null, () => {
            if (showLoading) {
                $q.loading.hide();
            }
        }
    );
};

const showTaskError = (item) => {
    showError.value = true;
    currentTaskError.value = langCode.value === 'en' ? item.error_message_EN : item.error_message_CN;
};

const clickCard = (v) => {
    status.value = v;
    doRequest();
};

const raisePriority = (row, priority) => {
    updateTask(row.id, { priority }).then((res) => {
        const msg = priority === 1 ? '降低' : '提升';
        $q.notify({
            type: 'positive',
            message: `${msg} ${t('Success')}`
        });
        doRequest();
    });
};

const clearSelect = () => {
    status.value = 'ALL';
    doRequest();
};
const projectSelected = (event) => {
    console.log(event);
    projectName.value = event.name;
    projectId.value = event.id;
    showProjectSelect.value = false;
    console.log(projectId.value);
    doRequest();
};
const gotoDetail = (item) => {
    router.push(`/main/tasks/${item.id}`);
};
const gotoReport = (item) => {
    router.push(`/main/tasks/${item.id}/report`);
};
const gotoDefineReport = (item) => {
    router.push(`/main/tasks/${item.id}/define-report`);
};
onMounted(() => {
    loadBackup();
    // loadDataOnMount();
    doRequest(false);
    intId.value = setInterval(() => {
        loadBackup();
        console.log(pagination.value);
        // refreshPage();
        doRequest(false);
    }, 60000);
    summary();
});
onUnmounted(() => {
    if (intId.value) {
        clearInterval(intId.value);
    }
});

const reset = () => {
    projectName.value = '';
    projectId.value = '';
    patient.value = '';
    libraryNumber.value = '';
    status.value = 'ALL';
    doRequest();
};

const backupSearch = () => {
    // const { page, rowsPerPage } = props.pagination
    let data = {
        page: pagination.value.current,
        size: pagination.value.pageSize,
        status: status.value,
        projectId: projectId.value,
        projectName: projectName.value,
        patient: patient.value,
        libraryNumber: libraryNumber.value
    };
    sessionStorage.setItem('task-search', JSON.stringify(data));
    console.log('backup', data);
};

const loadBackup = () => {
    let dataStr = sessionStorage.getItem('task-search-v2');
    if (dataStr) {
        let data = JSON.parse(dataStr);
        pagination.value.pageSize = data.size;
        pagination.value.current = data.page;
        status.value = data?.status;
        projectId.value = data.projectId;
        projectName.value = data.projectName;
        patient.value = data.patient;
        libraryNumber.value = data.libraryNumber;
        console.log('load', data);
    }
};

const confirm = async (item) => {
    $q.dialog({
        title: t('ConfirmToDelete'),
        cancel: true,
        persistent: true
    }).onOk(() => {
        apiDelete(`/task/${item.id}`, (_) => {
            infoMessage(t('DeleteSuccess'));
            if (rows.value.length > 1) {
                let index = 0;
                for (let i = 0; i < rows.value.length; i++) {
                    if (rows.value[i].id === item.id) {
                        index = i;
                    }
                }
                rows.value.splice(index, 1);
            } else {
                const current = pagination.value.current;
                pagination.value.current = current > 1 ? current - 1 : 1;
                refreshPage();
            }
        });
    });
};

const deleteMiddleFiles = async (task) => {
    $q.dialog({
        title: t('TaskPageListTableRowBtnDeleteTmpTitle'),
        message: t('TaskPageListTableRowBtnDeleteTmpComment'),
        cancel: true,
        persistent: true
    }).onOk(() => {
        apiDelete(`/task/${task.id}/remove_temp/`, (res) => {
            console.log(res);
            infoMessage(t('DeleteSuccess'));
        });
    });
};

const download = (item) => {
    let lang = langCode.value === 'en' ? 'EN' : 'CN';
    let path = '/igv' + item.result_path;
    if (lang === 'EN') {
        if (item.result_path_EN) {
            path = '/igv' + item.result_path_EN;
        }
    }
    if (lang === 'CN') {
        if (item.result_path_CN) {
            path = '/igv' + item.result_path_CN;
        }
    }
    return path;
};
const summary = async () => {
    apiGet(`/task/summary`, (res) => {
        taskSummary.value = res.data;
    });
};
</script>
<style lang="sass"></style>

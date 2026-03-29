<template>
    <q-page class="task-list-page q-px-sm q-pt-sm">
        <div class="q-px-sm">
            <div class="task-header-row">
                <div class="task-page-title">{{ $t('Task') + $t('Manage') }}</div>
                <div class="task-cards">
                    <q-btn
                        class="task-card task-card--all"
                        :class="{ 'task-card--active': status === 'ALL' }"
                        color="white"
                        unelevated
                        @click="clickCard(options[0].value)"
                    >
                        <div class="task-card-content text-black">
                            <div class="task-card-text">{{ $t('TaskPageListStatusAll') }} ({{ total_task_count }})</div>
                        </div>
                    </q-btn>

                    <q-btn
                        class="task-card task-card--primary"
                        :class="{ 'task-card--active': status === 'RUNNING' }"
                        color="primary"
                        unelevated
                        @click="clickCard(options[1].value)"
                    >
                        <div class="task-card-content text-white">
                            <div class="task-card-text">
                                {{ $t('TaskPageListStatusRun') }} ({{ taskSummary.running_task_count }})
                            </div>
                        </div>
                    </q-btn>
                    <q-btn
                        class="task-card task-card--negative"
                        :class="{ 'task-card--active': status === 'FAILURED' }"
                        color="negative"
                        unelevated
                        @click="clickCard(options[3].value)"
                    >
                        <div class="task-card-content text-white">
                            <div class="task-card-text">
                                {{ $t('TaskPageListStatusFail') }} ({{ taskSummary.failured_task_count }})
                            </div>
                        </div>
                    </q-btn>
                    <q-btn
                        class="task-card task-card--secondary"
                        :class="{ 'task-card--active': status === 'PENDING' }"
                        color="secondary"
                        unelevated
                        @click="clickCard(options[2].value)"
                    >
                        <div class="task-card-content text-white">
                            <div class="task-card-text">
                                {{ $t('TaskPageListStatusQueue') }} ({{ taskSummary.pending_task_count }})
                            </div>
                        </div>
                    </q-btn>
                    <q-btn
                        class="task-card task-card--positive"
                        :class="{ 'task-card--active': status === 'FINISHED' }"
                        color="positive"
                        unelevated
                        @click="clickCard(options[4].value)"
                    >
                        <div class="task-card-content text-white">
                            <div class="task-card-text">
                                {{ $t('TaskPageListStatusFinish') }} ({{ taskSummary.finished_task_count }})
                            </div>
                        </div>
                    </q-btn>
                </div>
            </div>
        </div>
        <div class="q-px-sm q-my-sm">
            <div class="task-panel task-panel--filters">
                <div class="task-filter-row">
                    <q-input style="width:120px" filled dense clearable v-model="taskId" :label="'ID'" />
                    <q-select
                        style="width:150px"
                        v-model="status"
                        :options="options"
                        stack-label
                        emit-value
                        map-options
                        clearable
                        filled
                        @clear="clearSelect()"
                        dense
                        @update:model-value="search()"
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
                        style="width:250px"
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
                    <q-btn color="primary" size="md" :label="$t('Search')" icon="search" @click="search()" />
                    <q-btn color="primary" size="md" :label="$t('Reset')" icon="clear" @click="reset()" />
                </div>
            </div>
        </div>
        <div ref="tableWrapRef" class="q-px-sm task-table-wrap">
            <a-table
                class="page-grid-table"
                :columns="columns"
                :data-source="rows"
                :pagination="pagination"
                :scroll="tableScroll"
                :loading="tableLoading"
            >
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
                    </template>

                    <template v-if="column.dataIndex ==='patient'">
                        <div v-for="sd in record.sample_data.slice(0,2)" :key="sd.sample_data_identifier">
                            {{ sd.patient_name }}
                        </div>
                        <div v-if="record.sample_data.length > 2" class="text-grey">
                            ... ({{ record.sample_data.length }})
                        </div>
                    </template>

                    <template v-if="column.dataIndex ==='sample'">
                        <div v-for="sd in record.sample_data.slice(0,2)" :key="sd.sample_data_identifier">
                            {{ sd.sample_data_identifier }}
                        </div>
                        <div v-if="record.sample_data.length > 2" class="text-grey">
                            ... ({{ record.sample_data.length }})
                        </div>
                    </template>
                    <template v-if="column.dataIndex ==='data'">
                        <div v-for="sd in record.sample_data.slice(0,2)" :key="sd.sample_data_identifier">
                            {{ sd.sample_identifier }}
                        </div>
                        <div v-if="record.sample_data.length > 2" class="text-grey">
                            ... ({{ record.sample_data.length }})
                        </div>
                    </template>
                    <template v-if="column.dataIndex ==='library_number'">
                        <div v-for="sd in record.sample_data.slice(0,2)" :key="sd.sample_data_identifier">
                            {{ sd.library_number }}
                        </div>
                        <div v-if="record.sample_data.length > 2" class="text-grey">
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
                        <div class="table-operation-buttons task-operate-row">
                            <q-btn
                                class="table-operation-btn table-operation-btn--primary"
                                :label="$t('Detail')"
                                :to="`/main/tasks/${record.id}`"
                                dense
                                flat
                                no-caps
                            />
                            <q-btn
                                class="table-operation-btn table-operation-btn--success"
                                :disable="record.status !== 'FINISHED'"
                                :label="$t('Result')"
                                :to="getResultRoute(record)"
                                dense
                                flat
                                no-caps
                            />

                            <q-btn-dropdown
                                class="table-operation-btn table-operation-btn--primary task-operate-dropdown"
                                :label="$t('More')"
                                dense
                                flat
                                no-caps
                                dropdown-icon="arrow_drop_down"
                                auto-close
                            >
                                <q-list style="min-width: 100px" dense>
                                    <q-item v-permission="'createReport'" clickable>
                                        <q-item-section>
                                            <q-btn
                                                :disable="isRP2Flow(record) || record.status !== 'FINISHED' || !record.flow.allow_define_report"
                                                :color="isRP2Flow(record) || record.status !== 'FINISHED' || !record.flow.allow_define_report ? 'grey': 'primary'"
                                                :label="$t('TaskPageBtnCustomReport')"
                                                :to="`/main/tasks/${record.id}/define-report`"
                                                dense
                                                align="left"
                                                flat
                                                no-caps
                                                padding="xs sm"
                                            />
                                        </q-item-section>
                                    </q-item>
                                    <q-separator v-permission="'createReport'" />
                                    <q-item clickable>
                                        <q-item-section>
                                            <q-btn
                                                :disable="record.status !== 'FINISHED'"
                                                color="primary"
                                                dense
                                                align="left"
                                                flat
                                                no-caps
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
                                                align="left"
                                                dense
                                                flat
                                                no-caps
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
                                                @click="deleteMiddleFiles(record)"
                                                dense
                                                align="left"
                                                flat
                                                no-caps
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
                                                dense
                                                align="left"
                                                flat
                                                no-caps
                                                @click="confirm(record)"
                                            />
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-btn-dropdown>
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
import { isRP2Flow } from 'src/utils/flow'
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue';
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
const tableWrapRef = ref(null);
const tableScrollY = ref(550);

// const { tableRef, pagination, rows, refreshPage, loadDataOnMount } = useQTable();
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
    showSizeChanger: true,
    showTotal: (total) => t('PaginationTotal', { total }),
    onChange: (page, pageSize) => {
        pagination.value.current = page;
        pagination.value.pageSize = pageSize;
        doRequest();
    }
});

const columns = computed(() => [
    { dataIndex: 'id', title: 'ID', align: 'left', width: 60 , fixed: 'left'},
    { dataIndex: 'name',  title: t('Name'), align: 'left', width: 180 , fixed: 'left'},
    { dataIndex: 'patient', title: t('Patient'), align: 'left', width: 100 },
    { dataIndex: 'sample', title: t('Sample'), align: 'left', width: 120 },
    { dataIndex: 'data', title: t('Data'), align: 'left', width: 120 },
    { dataIndex: 'library_number', title: t('LibraryNumber'), align: 'left', width: 220},
    { dataIndex: ['flow', 'name'], title: t('Flow'), align: 'left', width: 200, },
    { dataIndex: 'status', title: t('Status'), align: 'center', width: 100 },
    { dataIndex: 'creator', title: t('CreatedBy'), align: 'left', width: 160, },
    { dataIndex: 'task_priority', title: t('TaskPriority'), align: 'left', width: 100, },
    { dataIndex: 'operate', title: t('Operate'), align: 'center', fixed: 'right', width: langCode.value === 'en' ? 180 : 160}
]);

const tableScroll = computed(() => ({
    x: 1800,
    y: tableScrollY.value
}));

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
const taskId = ref('');
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
const tableLoading = ref(false);

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

const hasActiveTasksOnCurrentPage = computed(() =>
    rows.value.some((item) => ['RUNNING', 'PENDING'].includes(String(item?.status || '').toUpperCase()))
);

const onRequest = (props) => {
    doRequest(props.pagination);
};

const updateTableScrollY = () => {
    const wrapEl = tableWrapRef.value?.$el || tableWrapRef.value;
    if (!wrapEl || typeof window === 'undefined') {
        return;
    }
    const availableHeight = wrapEl.clientHeight || 0;
    const paginationEl = wrapEl.querySelector('.ant-table-pagination');
    const headerEl = wrapEl.querySelector('.ant-table-thead');
    const horizontalScrollbarEl = wrapEl.querySelector('.ant-table-body-horizontal-scroll');
    const paginationHeight = paginationEl ? paginationEl.getBoundingClientRect().height : 64;
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 44;
    const horizontalScrollbarHeight = horizontalScrollbarEl ? horizontalScrollbarEl.getBoundingClientRect().height : 18;
    const extraSpacing = 14;
    const nextHeight = Math.max(
        180,
        Math.floor(availableHeight - paginationHeight - headerHeight - horizontalScrollbarHeight - extraSpacing)
    );
    tableScrollY.value = nextHeight;
};

const doRequest = (showLoading = true) => {
    if (showLoading) {
        $q.loading.show();
    }
    tableLoading.value = true;
    console.log('==============> show', pagination.value);

    const current = pagination.value.current;
    const pageSize = pagination.value.pageSize;
    let params = `?page=${current}&size=${pageSize}`;

    // 先加入ID查询条件
    if (taskId.value) params += `&id=${taskId.value}`;
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
            nextTick(() => {
                updateTableScrollY();
            });
        }, {}, null, null, () => {
            if (showLoading) {
                $q.loading.hide();
            }
            tableLoading.value = false;
        }
    );
};

// 兼容模板中调用的刷新方法
const refreshPage = () => {
    doRequest();
};

const search = () => {
    pagination.value.current = 1;
    doRequest();
};

const showTaskError = (item) => {
    showError.value = true;
    currentTaskError.value = langCode.value === 'en' ? item.error_message_EN : item.error_message_CN;
};

const clickCard = (v) => {
    status.value = v;
    pagination.value.current = 1;
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
    pagination.value.current = 1;
    doRequest();
};
const projectSelected = (event) => {
    console.log(event);
    projectName.value = event.name;
    projectId.value = event.id;
    showProjectSelect.value = false;
    console.log(projectId.value);
    pagination.value.current = 1;
    doRequest();
};
const gotoDetail = (item) => {
    router.push(`/main/tasks/${item.id}`);
};
const gotoReport = (item) => {
    const target = isRP2Flow(item) ? `/main/tasks/${item.id}/rp2` : `/main/tasks/${item.id}/report`;
    router.push(target);
};

const getResultRoute = (item) => {
    return isRP2Flow(item) ? `/main/tasks/${item.id}/rp2` : `/main/tasks/${item.id}/report`;
};
const gotoDefineReport = (item) => {
    router.push(`/main/tasks/${item.id}/define-report`);
};
onMounted(() => {
    loadBackup();
    // loadDataOnMount();
    doRequest(false);
    nextTick(() => {
        updateTableScrollY();
    });
    window.addEventListener('resize', updateTableScrollY);
    intId.value = setInterval(() => {
        if (!hasActiveTasksOnCurrentPage.value) {
            return;
        }
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
    window.removeEventListener('resize', updateTableScrollY);
    backupSearch();
});

watch(
    () => [rows.value.length, pagination.value.current, pagination.value.pageSize, pagination.value.total],
    () => {
        nextTick(() => {
            updateTableScrollY();
        });
    }
);

const reset = () => {
    projectName.value = '';
    projectId.value = '';
    patient.value = '';
    libraryNumber.value = '';
    taskId.value = '';
    status.value = 'ALL';
    pagination.value.current = 1;
    doRequest();
};

const backupSearch = () => {
    let data = {
        page: pagination.value.current,
        size: pagination.value.pageSize,
        id: taskId.value,
        status: status.value,
        projectId: projectId.value,
        projectName: projectName.value,
        patient: patient.value,
        libraryNumber: libraryNumber.value,
        taskName: taskName.value
    };
    sessionStorage.setItem('task-search-v2', JSON.stringify(data));
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
        taskId.value = data.id || '';
        taskName.value = data.taskName || '';
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
<style lang="sass">
.task-list-page
  height: 100%
  min-height: 100%
  display: flex
  flex-direction: column
  overflow: hidden
  position: relative
  background: linear-gradient(180deg, #f5f8ff 0%, #edf4ff 46%, #f8fbff 100%)
  border-radius: 16px
  isolation: isolate

.task-list-page::before
  content: ''
  position: absolute
  inset: -8% auto auto -10%
  width: 420px
  height: 420px
  border-radius: 50%
  background: radial-gradient(circle, rgba(46, 125, 255, .16) 0%, rgba(46, 125, 255, 0) 72%)
  pointer-events: none
  z-index: 0

.task-list-page::after
  content: ''
  position: absolute
  inset: auto -8% 6% auto
  width: 360px
  height: 360px
  border-radius: 50%
  background: radial-gradient(circle, rgba(34, 197, 94, .12) 0%, rgba(34, 197, 94, 0) 74%)
  pointer-events: none
  z-index: 0

.task-list-page > *
  position: relative
  z-index: 1

.task-table-wrap
  flex: 1 1 auto
  min-height: 0
  padding: 10px 12px 12px
  border: 1px solid rgba(151, 173, 205, .45)
  border-radius: 16px
  background: rgba(255, 255, 255, .78)
  box-shadow: 0 16px 40px rgba(38, 84, 124, .08)
  backdrop-filter: blur(10px)

.task-panel
  border: 1px solid rgba(163, 184, 212, .48)
  border-radius: 14px
  background: rgba(255, 255, 255, .86)
  box-shadow: 0 10px 24px rgba(15, 23, 42, .06)
  backdrop-filter: blur(8px)

.task-panel--filters
  padding: 10px 12px

.task-filter-row
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 8px

.task-table-wrap :deep(.ant-table-pagination.ant-pagination)
  margin-top: 10px
  margin-bottom: 0

.task-list-page > :not(.task-table-wrap)
  flex: 0 0 auto

.task-header-row
  display: flex
  align-items: center
  gap: 12px
  margin-bottom: 8px
  padding: 10px 12px
  border: 1px solid rgba(158, 177, 203, .42)
  border-radius: 16px
  background: linear-gradient(135deg, rgba(255, 255, 255, .92) 0%, rgba(245, 250, 255, .86) 100%)
  box-shadow: 0 12px 28px rgba(33, 72, 112, .07)
  backdrop-filter: blur(10px)

.task-page-title
  flex: 0 0 auto
  font-size: 20px
  font-weight: 700
  line-height: 1.2
  color: #183b66
  white-space: nowrap
  letter-spacing: .02em
  padding: 0 4px

.task-cards
  flex: 1 1 auto
  display: grid
  grid-template-columns: repeat(5, minmax(0, 1fr))
  gap: 8px
  padding: 0
  align-items: stretch
  min-width: 0


.task-card
  width: 100%
  height: 48px
  border-radius: 12px
  box-shadow: 0 8px 18px rgba(20, 52, 86, .10)
  transition: transform .2s ease, box-shadow .2s ease
  padding: 0
  min-width: 0
  justify-self: center
  border: 2px solid transparent

.task-card-content
  width: 100%
  height: 100%
  display: flex
  justify-content: center
  align-items: center
  padding: 0 6px

.task-card-text
  font-size: 13px
  font-weight: 600
  line-height: 1
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

@media (min-width: 1280px)
  .task-card
    max-width: 10vw

@media (max-width: 1200px)
  .task-header-row
    align-items: flex-start
    flex-direction: column

  .task-cards
    width: 100%

.task-card:hover
  transform: translateY(-2px)
  box-shadow: 0 12px 24px rgba(20, 52, 86, .16)

.task-card--all
  border-color: rgba(0,0,0,.12)

.task-card--all:not(.task-card--active)
  background: linear-gradient(0deg, #fafafa, #ffffff)

.task-card--all:hover:not(.task-card--active)
  border-color: rgba(0,0,0,.24)
  box-shadow: 0 4px 12px rgba(0,0,0,.12)

.task-card--active
  transform: translateY(-2px) scale(1.02)
  box-shadow: 0 14px 28px rgba(20, 52, 86, .22)

.task-card--active.task-card--primary
  border-color: #fff
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--q-primary), 0 8px 24px rgba(0,0,0,.22)

.task-card--active.task-card--negative
  border-color: #fff
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--q-negative), 0 8px 24px rgba(0,0,0,.22)

.task-card--active.task-card--secondary
  border-color: #fff
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--q-secondary), 0 8px 24px rgba(0,0,0,.22)

.task-card--active.task-card--positive
  border-color: #fff
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--q-positive), 0 8px 24px rgba(0,0,0,.22)

.task-card--active.task-card--all
  border-color: var(--q-primary)
  box-shadow: 0 0 0 2px var(--q-primary), 0 8px 24px rgba(0,0,0,.22)

.task-table-wrap :deep(.ant-table-wrapper)
  height: 100%

.task-table-wrap :deep(.ant-table)
  background: rgba(255, 255, 255, .94)

.task-table-wrap :deep(.ant-table-container)
  border-radius: 12px
  overflow: hidden

.task-table-wrap :deep(.page-grid-table .ant-table-tbody > tr > td:last-child)
  text-align: center

.task-table-wrap :deep(.page-grid-table .ant-table-tbody > tr > td)
  padding-top: 5px !important
  padding-bottom: 5px !important
  line-height: 1.35

.task-table-wrap :deep(.page-grid-table .ant-table-tbody > tr > td > div)
  margin-bottom: 1px

.task-table-wrap :deep(.page-grid-table .ant-table-tbody > tr > td > div:last-child)
  margin-bottom: 0

.task-operate-row
  gap: 10px

.task-operate-dropdown :deep(.q-btn__content)
  flex-wrap: nowrap
  white-space: nowrap

.task-operate-dropdown :deep(.q-btn-dropdown__arrow)
  margin-left: 2px
</style>

<template>
    <q-table
        class="my-sticky-header-column-table"
        :title="$t('DashboardUsers')"
        :rows="rows"
        :columns="columns"
        row-key="id"
        ref="tableRef"
        v-model:pagination="pagination"
        @request="onRequest"
    />
</template>

<script setup>
import { useApi } from 'src/api/apiBase'
import { onMounted, ref ,computed} from 'vue'
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const { apiGet } = useApi()

const tableRef = ref({})
const pagination = ref({
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
})
onMounted(() => {
    tableRef.value.requestServerInteraction()
})
const onRequest = (props) => {
    const { page, rowsPerPage } = props.pagination
    console.log(page, rowsPerPage)
    apiGet(`/account/?page=${page}&size=${rowsPerPage}`, (res) => {
        pagination.value.rowsNumber = res.data.total_count
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        rows.value = res.data.item_list
    })

}
const columns = computed(()=>[
    {
        name: 'nickname',
        required: true,
        label: t('User'),
        align: 'left',
        field: (row) => row.nickname,
        format: (val) => `${val}`,
    },
    { name: 'used_disk', label: t('DiskUsage'), field: (row) => (row.used_disk/1024).toFixed(2) },
    { name: 'sodium', label: t('Task')+t('TaskPageListStatusRun'), field: 'running_task' },
])
const rows = ref([])
</script>

<style lang="scss">
.my-sticky-header-column-table {
    /* height or max-height is important */
    height: 300px;

    /* specifying max-width so the example can
    highlight the sticky column on any browser window */
    width: 100%;
    td:first-child {
        background-color: silver !important;
        z-index: 10;
    }
    tr th {
        position: sticky;
        /* higher than z-index for td below */
        z-index: 2;
        /* bg color is important; just specify one */
        background: #fff;
    }
    /* this will be the loading indicator */
    thead tr:last-child th {
        /* height of all previous header rows */
        top: 48px;
        /* highest z-index */
        z-index: 3;
    }
    thead tr:first-child th {
        top: 0;
        z-index: 1;
    }
    tr:first-child th:first-child {
        /* highest z-index */
        z-index: 3;
    }
    td:first-child {
        z-index: 1;
    }

    td:first-child,
    th:first-child {
        position: sticky;
        left: 0;
    }
}
</style>

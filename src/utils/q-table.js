import { ref } from 'vue'
export function useQTable(rowsPerPage = 15) {
    const rows = ref([])
    const tableRef = ref({})
    const pagination = ref({
        page: 1,
        rowsPerPage: rowsPerPage,
        rowsNumber: 0,
    })
    const refreshPage = () => {
        tableRef.value.setPagination({ page: 1, rowsPerPage: pagination.value.rowsPerPage, rowsNumber: 0 }, true)
    }
    const loadDataOnMount = () => {
        tableRef.value.requestServerInteraction()
    }
    return {
        rows,
        tableRef,
        pagination,
        refreshPage,
        loadDataOnMount
    }
}

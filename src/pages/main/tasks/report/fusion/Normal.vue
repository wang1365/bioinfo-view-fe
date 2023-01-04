<template>
    <q-toolbar class="text-primary">
        <q-input
            v-model="keyword"
            class="q-mr-sm"
            dense
            label="搜索:"
            clearable
            @clear="clearKeyword"
            style="width:300px"
        />
        <q-btn size="small" color="primary" label="搜索" @click="searchKeyword"></q-btn>
    </q-toolbar>
    <div class="bio-data-table q-py-sm">
        <a-table
            size="small"
            bordered
            :loading="loading"
            :data-source="filteredRows"
            :columns="columns"
            :sticky="true"
            rowKey="lineNumber"
            :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange }"
        >
            <template #bodyCell="{ column, record }">
                <q-btn
                    v-if="column.title === 'Igv'"
                    label="查看"
                    color="primary"
                    size="sm"
                    @click="clickView(record)"
                ></q-btn>
            </template>
        </a-table>
        <q-dialog v-model="igvVisible">
            <q-card
                class="full-width"
                style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh"
            >
                <IGV :taskId="route.params.id" :file="selectedFile"></IGV>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import IGV from './Igv.vue'

const route = useRoute()
const columns = ref([])

const keyword = ref('')
const filteredRows = ref([])

const igvVisible = ref(false)
const selectedFile = ref('')
const emit = defineEmits('filterChange')

const props = defineProps({
    samples: {
        type: Array,
        require: true,
        default() {
            return []
        },
    },
    rows: {
        type: Array,
        require: false,
        default() {
            return []
        },
    },
    header: {
        type: Array,
        require: false,
        default() {
            return []
        },
    },
    searchParam: {
        type: String,
        require: false,
        default() {
            return ''
        },
    },
    selectedRows: {
        type: Array,
        require: false,
        default() {
            return []
        },
    },
})
const searchKeyword = () => {
    if (keyword.value) {
        filteredRows.value = rows.value.filter((t) => t[0].includes(keyword.value))
    } else {
        filteredRows.value = rows.value
    }
    filterChange()
}

const clearKeyword = () => {
    keyword.value = ''
    filteredRows.value = rows.value
    filterChange()
}

const clickView = (record) => {
    console.log('clickView', record)
    selectedFile.value = record[7]
    igvVisible.value = true
}
const rows = toRef(props, 'rows')
const header = toRef(props, 'header')
const propSearchParam = toRef(props, 'searchParam')
const propSelectedRows = toRef(props, 'selectedRows')

const selectedRows = ref([])

const onSelectChange = (selectedRowKeys) => {
    selectedRows.value = selectedRowKeys
    filterChange()
}

const filterChange = () => {
    emit('filterChange', {
        searchParam: keyword.value,
        selectedRows: selectedRows.value,
    })
}
watch(propSearchParam, () => {
    loadData()
})
onMounted(() => {
    loadData()
})

const loadData = () => {
    const width = [30, 30, 60, 60, 60, 60, 200, 50, 50]
    columns.value = []
    header.value.forEach((item, index) => {
        if (item == 'Igv') {
            columns.value.push({
                title: item,
                dataIndex: index,
                align: 'center',
                width: width[index],
            })
        } else
            columns.value.push({
                title: item,
                dataIndex: index,
                align: 'center',
                width: width[index],
            })
    })
    keyword.value = propSearchParam.value
    searchKeyword()
    selectedRows.value = []
    for (let item of filteredRows.value) {
        let finded = false
        for (let lineNumber of propSelectedRows.value) {
            if (lineNumber == item.lineNumber) {
                finded = true
                break
            }
        }
        if (finded) {
            selectedRows.value.push(item.lineNumber)
        }
    }
    filterChange()
}
</script>

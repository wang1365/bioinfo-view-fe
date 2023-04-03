<template>
    <div>
        <div style="text-align:right" class="q-py-md">
            <q-btn icon="help_outline" size="small" outline color="orange" class="q-mr-md"
                @click="dlgVisible = !dlgVisible">{{$t('Intro')}}</q-btn>
            <q-btn v-if="props.viewConfig.showStick && props.viewConfig.stickDone" icon="bookmarks" size="small"
                color="primary" class="q-mr-md" label="已固定过滤" @click="unstick()" />
            <q-btn v-if="props.viewConfig.showStick && !props.viewConfig.stickDone" icon="bookmarks" size="small"
                outline color="primary" class="q-mr-md" @click="stickFilter()">固定过滤</q-btn>
        </div>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ viewConfig.title }}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{intro}}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">关闭</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-tabs v-model="tab" dense align="left" active-color="primary" active-bg-color="grey-5"
            class="bg-grey-2 shadow-2" indicator-color="primary" inline-label :breakpoint="0">
            <q-tab v-for="table in tables" :label="table.name" :name="table.name" :key="table.name" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel v-for="table in tables" :name="table.name" :key="table.name">
                <q-toolbar class="text-primary">
                    <q-input v-model="table.keyword" class="q-mr-sm" dense label="搜索:" clearable
                        @clear="clearKeyword(table)" style="width:300px"
                        :disable="props.viewConfig.showStick && props.viewConfig.stickDone" />
                    <q-btn size="small" color="primary" :label="$t('Search')" @click="searchKeyword(table)"
                        :disable="props.viewConfig.showStick && props.viewConfig.stickDone"></q-btn>
                    <q-space />
                    <q-btn :href="table.url" :label="$t('Download')" icon="south" size="sm" flat />
                </q-toolbar>
                <div style="position:relative">
                    <q-icon color="accent" name="question_mark" size="xs"
                        style="position:absolute;z-index:100;left:0px;top:0px">
                        <q-tooltip>仅全选本页筛选结果</q-tooltip>
                    </q-icon>
                    <a-table style="z-index:1" class="col-5" size="middle" rowKey="lineNumber" bordered
                        :scroll="{ x: 2000, y: 600 }" :data-source="table.filteredRows" :columns="table.columns"
                        :sticky="true"
                        :row-selection="{ selectedRowKeys: getTableSelectedRows(table), onChange: onSelectChange, columnWidth: 35, getCheckboxProps: getCheckboxProps }" />
                </div>
            </q-tab-panel>
        </q-tab-panels>
        <!-- <a-table :columns="columns" :data-source="rows" @change="onChange" /> -->
        <q-separator color="primary" />
        <div>
            <template v-for="image in images" :key="image">
                <q-img class="q-mt-lg text-primary" :src="image.url" style="max-height: 500px" fit="contain"
                    position="0 20px" />
                <div class="text-primary">{{ image.description }}</div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, toRef } from 'vue'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import { useQuasar } from "quasar"

const $q = useQuasar()
const dlgVisible = ref(false)
const props = defineProps({
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {
                showSticky: false,
            }
        },
    },
    task: {
        required: true,
        default: () => { },
    },
    stepData: {
        type: Object,
        default: () => { }
    }
})

const tab = ref('')
const stepData = toRef(props, 'stepData')
const tables = ref([])
const intro = ref('')
const images = ref([])
const clearKeyword = (table) => {
    table.filteredRows = table.rows
    table.keyword = ''
    searchKeyword(table)
}
const searchKeyword = (table) => {
    if (table.keyword) {
        table.filteredRows = table.rows.filter((t) => {
            for (let key in t) {
                if (t[key].toString().includes(table.keyword)) {
                    return true
                }
            }
            return false
        })
    } else {
        table.filteredRows = table.rows
    }
    if (tableData.value[table.name]) { tableData.value[table.name].selectedRows = [] }
}
onMounted(() => {
    initIntro()
    initTable()
    initImages()
})

const initIntro = () => {
    const { descriptionFile } = props.viewConfig
    if (descriptionFile) {
        readTaskFile(props.task.id, descriptionFile).then((res) => {
            intro.value = res
        })
    }
}
const tableData = ref({})
const initTable = () => {
    $q.loading.show({
        delay: 100
    })
    const { tables: tableList } = props.viewConfig || []
    tableList.forEach((table, i) => {
        tableData.value[table.title] = {}
        readTaskFile(props.task.id, table.file).then((res) => {
            const colNames = getCsvHeader(res)
            const rows = getCsvDataAndSetLineNumber(res, { fields: colNames })
            const columns = colNames.map((name) => {
                // 当前列所有数据去重，作为筛选项
                const values = [...new Set(rows.map((t) => t[name]))]
                return {
                    title: name,
                    dataIndex: name,
                    width: 200,
                    ellipsis: true,
                    align: 'center',
                    filters: values.map((v) => {
                        return { text: v, value: v }
                    }),
                    onFilter: (value, record) => record[name].indexOf(value) === 0,
                }
            })
            // 添加表格定义
            let data = {
                name: table.name,           // 表格tab名称
                rows,                       // 表格全量数据
                columns,                    // 表格表头
                filteredRows: rows,         // 表格过滤后数据
                url: '/igv' + table.file,   // 下载链接
                keyword: ''                 // 检索关键字
            }
            tables.value.push(data)

            if (i === 0) {
                tab.value = table.name
            }
            console.log(stepData.value)
            if (stepData.value && stepData.value.tables) {
                let selectedRows = []

                for (const item of stepData.value.tables) {
                    if (item.name === table.name) {
                        data.keyword = item.searchParam
                        searchKeyword(data)
                        tableData.value[table.name] = { selectedRows: item.selectedRows }
                    }
                }
            }

            $q.loading.hide()
        })
    })
}

const initImages = () => {
    images.value = props.viewConfig.images || []
    images.value.forEach((img) => {
        img.url = '/igv' + img.file
        readTaskFile(props.task.id, img.descriptionFile).then((res) => {
            img.description = res
        })
    })
}

const getTableSelectedRows = (table) => {
    if (tableData.value[table.name]) {
        return tableData.value[table.name].selectedRows
    }
    return []
}
const onSelectChange = (selectedRowKeys) => {
    if (tableData.value[tab.value]) { tableData.value[tab.value].selectedRows = selectedRowKeys }
    else {
        tableData.value[tab.value] = { selectedRows: selectedRowKeys }
    }
}
const viewConfig = toRef(props, 'viewConfig')
const getCheckboxProps = (record) => {
    return {
        disabled: viewConfig.value.showStick && viewConfig.value.stickDone, // Column configuration not to be checked
        name: record.lineNumber,
    }
}
const emit = defineEmits(['stickDone', 'reset'])
const stickFilter = () => {
    var results = []
    for (const table of tables.value) {
        let selectedRows = []
        if (tableData.value[table.name] && tableData.value[table.name].selectedRows) {
            selectedRows = tableData.value[table.name].selectedRows
        }
        let data = {
            filtered: table.rows.length !== table.filteredRows.length,
            searchParam: table.keyword,
            selected: tableData.value[table.name],
            selectedRows: selectedRows,
            selected: selectedRows.length > 0,
            name: table.name
        }
        results.push(data)
    }
    emit('stickDone', { tables: results })
}
const unstick = () => {
    emit('reset', null)
    tableData.value = {}
    for (let table of tables.value) {
        table.keyword = ''
        table.filteredRows = table.rows
    }
}
</script>

<style scoped>

</style>

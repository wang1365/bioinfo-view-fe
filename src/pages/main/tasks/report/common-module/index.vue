<template>
    <div class="common-module-root" :class="{ 'common-module-root--full': enhancedTableBorder }">
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ viewConfig.title }}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{intro}}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <AppActionButton variant="primary" v-close-popup>{{ $t('Close')}}</AppActionButton>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <div class="tabs-header" :class="{ 'tabs-header--rp2': enhancedTableBorder }">
            <q-tabs
                v-model="tab"
                dense
                align="left"
                active-color="primary"
                :active-bg-color="enhancedTableBorder ? 'white' : 'grey-5'"
                :class="['tabs-main', { 'tabs-main--rp2': enhancedTableBorder }]"
                indicator-color="primary"
                inline-label
                :breakpoint="0"
            >
                <q-tab v-for="table in tables" :label="table.name" :name="table.name" :key="table.name" />
            </q-tabs>
            <div class="intro-actions">
                <q-btn
                    icon="help_outline"
                    size="small"
                    outline
                    color="primary"
                    class="q-mr-md intro-help-button intro-help-btn"
                    @click="dlgVisible = !dlgVisible"
                    >{{$t('Intro')}}</q-btn
                >
                <q-btn
                    v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
                    icon="bookmarks"
                    size="small"
                    color="primary"
                    class="q-mr-md"
                    :label="$t('ReportStickDone')"
                    @click="unstick()"
                />
                <q-btn
                    v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
                    icon="bookmarks"
                    size="small"
                    outline
                    color="primary"
                    class="q-mr-md"
                    @click="stickFilter()"
                    :label="$t('ReportStickData')"
                />
            </div>
        </div>
        <q-tab-panels v-model="tab" animated class="common-tab-panels">
            <q-tab-panel v-for="table in tables" :name="table.name" :key="table.name">
                <q-toolbar class="text-primary search-toolbar">
                    <q-input
                        v-model="table.keyword"
                        class="q-mr-sm search-input"
                        dense
                        outlined
                        clearable
                        :label="$t('Search')"
                        @clear="clearKeyword(table)"
                        :disable="props.viewConfig.showStick && props.viewConfig.stickDone"
                    >
                        <template #prepend>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                    <AppActionButton
                        variant="primary"
                        :label="$t('Search')"
                        @click="searchKeyword(table)"
                        :disable="props.viewConfig.showStick && props.viewConfig.stickDone"
                    />
                    <q-space />
                    <AppActionButton
                        variant="primary"
                        :href="table.url"
                        :download="table.fileName"
                        :label="$t('Download')"
                        icon="download"
                        target="_blank"
                    />
                </q-toolbar>
                <div class="table-host" style="position:relative">
                    <q-icon
                        v-if="showRowSelection"
                        color="accent"
                        name="question_mark"
                        size="xs"
                        style="position:absolute;z-index:100;left:0px;top:0px"
                    >
                        <q-tooltip>{{$t('OnlySelectAllThisPageFilterResult')}}</q-tooltip>
                    </q-icon>
                    <div class="table-region" :ref="setTableRegionRef(table.name)">
                        <AppDataTable
                            :class="{ 'rp2-grid-table': enhancedTableBorder }"
                            style="z-index:1"
                            class="col-5"
                            size="middle"
                            rowKey="lineNumber"
                            bordered
                            :scroll="{ x: table.columns.length * 100, y: getTableScrollY(table.name) }"
                            :data-source="table.filteredRows"
                            :columns="table.columns"
                            :sticky="true"
                            :row-selection="rowSelectionConfig(table)"
                            :pagination="getPaginationConfig(table.name)"
                            @change="(pagination) => handleTableChange(table.name, pagination)"
                        >
                        <template #bodyCell="{ column, record }">
                            <TableActionButton
                                variant="primary"
                                v-if="column.config.type === 'image'"
                                :label="$t('View')"
                                @click="clickView(record,column.title)"
                            />
                            <TableActionButton
                                variant="primary"
                                v-if="column.config.type === 'file'"
                                :href="`igv${record[column.dataIndex]}`"
                                :download="`igv${record[column.dataIndex]}`"
                                :label="$t('Download')"
                                icon="download"
                                target="_blank"
                            />
                            <template v-if="column.config.type === 'link'">
                                <a
                                    v-if="record[column.dataIndex].startsWith('http')"
                                    :href="record[column.dataIndex]"
                                    target="_blank"
                                    >{{$t('View')}}</a
                                >
                                <TableActionButton
                                    variant="primary"
                                    :label="$t('View')"
                                    @click="showHtmlDialg(record, column)"
                                />
                            </template>
                            <template
                                v-if="(column.title.includes('Plot') || column.title.includes('plot')) && record[column.dataIndex]!=='-' && record[column.dataIndex]"
                            >
                                <TableActionButton
                                    variant="primary"
                                    :label="$t('View')"
                                    @click="clickView(record,column.title)"
                                />
                            </template>
                            <template v-else>
                                <template
                                    v-if="record[column.dataIndex].endsWith('.png') || record[column.dataIndex].endsWith('.jpeg')"
                                >
                                    <q-img
                                        class="q-mt-sm cursor-pointer"
                                        :src="'/igv'+ record[column.dataIndex]"
                                        style="max-height: 30px; max-width: 60px; padding: 0; margin: 0;"
                                        fit="contain"
                                        position="left"
                                        @click="clickView(record,column.title)"
                                    />
                                </template>
                            </template>
                        </template>
                        </AppDataTable>
                    </div>
                </div>
            </q-tab-panel>
        </q-tab-panels>

        <template v-for="file in files" :key="file.buttonName">
            <AppActionButton
                variant="primary"
                :label="file.buttonName"
                icon="download"
                type="href"
                :href="`/igv${resolveFilePath(file.filePath)}`"
                target="_blank"
                class="q-mb-sm"
            />
        </template>
        <q-dialog v-model="showImage">
            <q-card style="width:80%;max-width:1000px;height:550px;align-items: center">
                <q-card-section>
                    <img :src="imageUrl" alt="" style="height:500px;background-color:white" />
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- HTML内容弹窗 -->
        <q-dialog v-model="showHtmlDialog" maximized>
            <q-card style="width: 100vw; height: 100vh;">
                <q-bar class="bg-primary text-white">
                    {{ $t('View') }}
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip>{{ $t('Close') }}</q-tooltip>
                    </q-btn>
                </q-bar>
                <q-card-section class="q-pa-none" style="height: calc(100vh - 50px);">
                    <iframe
                        :src="htmlContent"
                        style="width: 100%; height: 100%; border: none;"
                        sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- <AppDataTable :columns="columns" :data-source="rows" @change="onChange" /> -->
        <div>
            <template v-for="(image, index) in images" :key="image">
                <q-separator color="primary" class="q-my-sm" />
                <div class="items-start">
                    <div class="q-ml-sm q-mt-lg">
                        <q-btn
                            icon="add"
                            size="sm"
                            color="primary"
                            outline
                            round
                            class="q-mx-sm"
                            @click="zoomIn(index)"
                            :title="$t('ZoomIn')"
                        />
                        <q-btn
                            icon="remove"
                            size="sm"
                            color="primary"
                            outline
                            round
                            @click="zoomOut(index)"
                            :title="$t('ZoomOut')"
                        />
                    </div>
                    <q-img
                        class="text-primary"
                        :src="image.url"
                        fit="contain"
                        :style="`max-width: ${imageScales[index] || 85}%; transition: all 0.3s ease;`"
                        position="0 20px"
                    />
                </div>
                <div class="text-primary q-mt-sm">{{ image.description }}</div>
            </template>
        </div>
    </div>
</template>

<script setup>
import AppDataTable from 'src/components/table/AppDataTable.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData, getCsvDataAndSetLineNumber } from 'src/utils/csv'
import { useQuasar } from "quasar"
import AppActionButton from 'src/components/button/AppActionButton.vue'
import TableActionButton from 'src/components/button/TableActionButton.vue'
import { storeToRefs } from 'pinia'
import { globalStore } from 'src/stores/global'
import { template } from 'lodash'

const store = globalStore()
const { t } = useI18n()
const { langCode } = storeToRefs(store)
const $q = useQuasar()
const dlgVisible = ref(false)
const imageScales = ref({}) // 存储每个图片的缩放比例
const showHtmlDialog = ref(false) // HTML弹窗显示状态
const htmlContent = ref('') // HTML内容
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
    enablePagination: {
        type: Boolean,
        default: false
    },
    showRowSelection: {
        type: Boolean,
        default: true
    },
    task: {
        required: true,
        default: () => { },
    },
    stepData: {
        type: Object,
        default: () => { }
    },
    fileBaseDir: {
        type: String,
        default: ''
    },
    fromTaskRoot: {
        type: Boolean,
        default: false
    },
    enhancedTableBorder: {
        type: Boolean,
        default: false
    }
})

const showRowSelection = computed(() => props.showRowSelection)
const enhancedTableBorder = computed(() => props.enhancedTableBorder)
const resolveFilePath = (filePath) => {
    const normalized = String(filePath || '').trim()
    if (!normalized) {
        return ''
    }
    if (!props.fileBaseDir || normalized.startsWith('/')) {
        return normalized
    }
    return `${props.fileBaseDir.replace(/\/+$/, '')}/${normalized.replace(/^\/+/, '')}`
}

const readTextFile = (filePath, includeErrors = true) =>
    readTaskFile(props.task.id, resolveFilePath(filePath), includeErrors, props.fromTaskRoot)

const getPaginationState = (tableName) => {
    if (!paginationStateMap.value[tableName]) {
        paginationStateMap.value[tableName] = {
            current: 1,
            pageSize: 10
        }
    }
    return paginationStateMap.value[tableName]
}

const updatePagination = (tableName, current, pageSize) => {
    const state = getPaginationState(tableName)
    paginationStateMap.value = {
        ...paginationStateMap.value,
        [tableName]: {
            current: Number(current) > 0 ? Number(current) : state.current,
            pageSize: Number(pageSize) > 0 ? Number(pageSize) : state.pageSize
        }
    }
}

const handleTablePaginationChange = (tableName, current, pageSize) => {
    updatePagination(tableName, current, pageSize)
    nextTick(() => {
        syncTableScrollY(tableName)
    })
}

const handleTableChange = (tableName, pagination) => {
    if (pagination) {
        updatePagination(tableName, pagination.current, pagination.pageSize)
    }
    nextTick(() => {
        syncTableScrollY(tableName)
    })
}

const getPaginationConfig = (tableName) => {
    if (!props.enablePagination) {
        return undefined
    }
    const state = getPaginationState(tableName)
    return {
        current: state.current,
        pageSize: state.pageSize,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
        onChange: (current, pageSize) => handleTablePaginationChange(tableName, current, pageSize),
        onShowSizeChange: (current, pageSize) => handleTablePaginationChange(tableName, current, pageSize),
        showTotal: (total) => t('PaginationTotal', { total })
    }
}

const tab = ref('')
const stepData = toRef(props, 'stepData')
const unsortedTables = ref([])
const intro = ref('')
const images = ref([])
const tableRegionRefs = ref({})
const tableScrollYMap = ref({})
const paginationStateMap = ref({})
let tableResizeObserver = null

const tables = computed( () => {
    const sortedTables = [...unsortedTables.value];
    sortedTables.sort((a, b) => {
        return a.i - b.i
    })
    return sortedTables.map(t => t.data)
})

const files = computed(() => props.viewConfig.files || [])
const setTableRegionRef = (tableName) => (element) => {
    if (element) {
        tableRegionRefs.value[tableName] = element
    } else {
        delete tableRegionRefs.value[tableName]
    }
}

const getTableScrollY = (tableName) => tableScrollYMap.value[tableName] || 360

const syncTableScrollY = (tableName = tab.value) => {
    const region = tableRegionRefs.value[tableName]
    if (!region) {
        return
    }

    const tableHeader = region.querySelector('.ant-table-header')
    const tableThead = region.querySelector('.ant-table-thead')
    const tablePagination = region.querySelector('.ant-pagination')
    const headerHeight = tableHeader?.offsetHeight || tableThead?.offsetHeight || 44
    const paginationHeight = tablePagination?.offsetHeight || 52
    const regionStyle = window.getComputedStyle(region)
    const paddingTop = Number.parseFloat(regionStyle.paddingTop || '0') || 0
    const paddingBottom = Number.parseFloat(regionStyle.paddingBottom || '0') || 0
    const reserved = headerHeight + paginationHeight + paddingTop + paddingBottom + 18
    const nextY = Math.max(Math.floor(region.clientHeight - reserved), 180)

    tableScrollYMap.value = {
        ...tableScrollYMap.value,
        [tableName]: nextY
    }
}

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
    if (props.enablePagination) {
        updatePagination(table.name, 1, getPaginationState(table.name).pageSize)
    }
    nextTick(() => {
        syncTableScrollY(table.name)
    })
}

onMounted(() => {
    initIntro()
    initTable()
    initImages()
})

onMounted(async () => {
    await nextTick()
    syncTableScrollY(tab.value)
    if (!window.ResizeObserver) {
        return
    }
    tableResizeObserver = new window.ResizeObserver(() => {
        syncTableScrollY(tab.value)
    })
    const currentRegion = tableRegionRefs.value[tab.value]
    if (currentRegion) {
        tableResizeObserver.observe(currentRegion)
    }
})

onBeforeUnmount(() => {
    if (tableResizeObserver) {
        tableResizeObserver.disconnect()
        tableResizeObserver = null
    }
})

// 这个组件内不能通过监听语言变化来重新加载数据，因为数据文件的路径是从父组件传递来的
// 语言切换后父组件会重新读取配置文件更新配置后传递给当前组件
// 所以本组件内可能先侦听到语言切换，此时配置还没有更新，导致加载的还是原来语言的数据
// 所以此处直接监听配置文件来刷新数据
watch(() => props.viewConfig,
    () => {
    initIntro()
    initTable()
    initImages()
})

watch(
    () => [tab.value, tables.value.length],
    async () => {
        await nextTick()
        if (tableResizeObserver) {
            tableResizeObserver.disconnect()
            const currentRegion = tableRegionRefs.value[tab.value]
            if (currentRegion) {
                tableResizeObserver.observe(currentRegion)
            }
        }
        syncTableScrollY(tab.value)
    }
)

// ctr
const showImage = ref(false)
const imageUrl = ref('')
const clickView = (record, title) => {
    showImage.value = true
    imageUrl.value = `/igv${record[title]}`
}
// ctr


const initIntro = () => {
    const { descriptionFile } = props.viewConfig
    intro.value = ''
    if (descriptionFile) {
        readTextFile(descriptionFile, true)
            .then((res) => {
                intro.value = typeof res === 'string' ? res : ''
            })
            .catch(() => {
                intro.value = ''
            })
    }
}
const tableData = ref({})
const initTable = () => {
    const tableList = props.viewConfig.tables || []
    if (tableList.length > 0) {
      $q.loading.show({ delay: 100 })
    }
    unsortedTables.value = []
    paginationStateMap.value = {}

    // const tmpTables = []
    tableList.forEach((table, i) => {
        tableData.value[table.title] = {}
        const configs = table.columns || []
        const configMap = {}
        configs.forEach((config) => {
            configMap[config.name] = config
        })

        const comparator = (a, b) => {
            if (a < b) {
                return -1
            }
            if (a > b) {
                return 1
            }
            return 0
        }



        const compare_obj = (a, b) => {
            if (a < b) {
                return -1
            }
            if (a > b) {
                return 1
            }
            return 0
        }

        const compare_number = (a, b) => {
            return compare_obj(Number(a), Number(b))
        }

        readTextFile(table.file).then((res) => {
            const colNames = getCsvHeader(res)
            const rows = getCsvDataAndSetLineNumber(res, { fields: colNames })
            const columns = colNames.map((name) => {
                const columnConfig = configMap[name] || {}
                // 当前列所有数据去重，作为筛选项
                const values = [...new Set(rows.map((t) => t[name]))]

                let sorter = null;
                if (columnConfig.sorter === 'number') {
                    sorter = (a, b) => {
                        return compare_number(a[name], b[name])
                    }
                } else if (columnConfig.sorter === 'string') {
                    sorter = (a, b) => {
                        return compare_obj(a[name], b[name])
                    }
                }

                const filtered = columnConfig.filtered !== false

                return {
                    title: name,
                    dataIndex: name,
                    width: 200,
                    ellipsis: true,
                    align: 'center',
                    filters: !filtered ? null : values.map((v) => {
                        return { text: v, value: v }
                    }),
                    onFilter: (value, record) => record[name].indexOf(value) === 0,
                    // sorter: columnConfig.sorted ? sorter : null,
                    sorter,
                    config: columnConfig // 列配置
                }
            })
            // 添加表格定义
            let data = {
                name: table.name,           // 表格tab名称
                rows,                       // 表格全量数据
                columns,                    // 表格表头
                filteredRows: rows,         // 表格过滤后数据
                url: '/igv' + resolveFilePath(table.file),   // 下载链接
                fileName: resolveFilePath(table.file).substring(resolveFilePath(table.file).lastIndexOf('/') + 1),
                keyword: ''                 // 检索关键字
            }
            // tables.value[i] = data
            unsortedTables.value.push({data, i})

            if (i === 0) {
                tab.value = table.name
            }
            console.log(stepData.value)
            if (stepData.value && stepData.value.tables) {
                for (const item of stepData.value.tables) {
                    if (item.name === table.name) {
                        data.keyword = item.searchParam
                        searchKeyword(data)
                        tableData.value[table.name] = { selectedRows: item.selectedRows }
                    }
                }
            }

            nextTick(() => {
                syncTableScrollY(tab.value || table.name)
            })

            $q.loading.hide()
        })
    })
}

const initImages = () => {
    images.value = props.viewConfig.images || []
    images.value.forEach((img) => {
        img.url = '/igv' + resolveFilePath(img.file)
        readTextFile(img.descriptionFile).then((res) => {
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
const rowSelectionConfig = (table) => {
    if (!showRowSelection.value) {
        return undefined
    }
    return {
        selectedRowKeys: getTableSelectedRows(table),
        onChange: onSelectChange,
        columnWidth: 35,
        getCheckboxProps: getCheckboxProps
    }
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
        name: String(record.lineNumber),
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

// 图片缩放方法
const zoomIn = (index) => {
    const currentScale = imageScales.value[index] || 85
    const newScale = Math.min(currentScale + 15, 200) // 最大200%
    imageScales.value[index] = newScale
}

const zoomOut = (index) => {
    const currentScale = imageScales.value[index] || 85
    const newScale = Math.max(currentScale - 15, 30) // 最小30%
    imageScales.value[index] = newScale
}

// HTML弹窗方法
const showHtmlDialg = (record, column) => {
    const htmlFilePath = record[column.dataIndex]
    // 直接设置文件路径，让iframe加载
    htmlContent.value = `/igv${htmlFilePath}`
    showHtmlDialog.value = true
}
</script>

<style scoped>
.common-module-root {
    position: relative;
}

.common-module-root--full {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.common-module-root--full .common-tab-panels {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.common-module-root--full .common-tab-panels :deep(.q-tab-panel) {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tabs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.tabs-header--rp2 {
    border-bottom: 1px solid #d8e2ef;
    padding: 0 4px;
}

.tabs-main {
    flex: 1;
}

.tabs-main--rp2 :deep(.q-tab) {
    margin-right: 6px;
    border: 1px solid #d8e2ef;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    background: #f4f7fb;
    min-height: 34px;
    padding: 0 12px;
    color: #4f5d75;
}

.tabs-main--rp2 :deep(.q-tab:last-child) {
    margin-right: 0;
}

.tabs-main--rp2 :deep(.q-tab__content) {
    min-width: 0;
    padding: 0;
}

.tabs-main--rp2 :deep(.q-tab__label) {
    font-size: 13px;
    line-height: 1.1;
}

.tabs-main--rp2 :deep(.q-tab--active) {
    background: #fff;
    border-color: #78a9ff;
    color: #1677ff;
    font-weight: 600;
}

.tabs-main--rp2 :deep(.q-tab__indicator) {
    height: 2px;
}

.intro-actions {
    display: flex;
    align-items: center;
    margin-right: 8px;
    white-space: nowrap;
}

.intro-help-button {
    min-width: 82px;
}

.intro-help-button :deep(.q-btn__content) {
    justify-content: center;
    gap: 4px;
    padding: 0 4px;
}

.search-input {
    width: 25%;
    min-width: 240px;
}

.search-toolbar {
    padding-left: 0;
    padding-right: 0;
}

.table-host {
    min-height: 0;
}

.common-module-root--full .table-host {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.table-region {
    min-height: 0;
}

.common-module-root--full .table-region {
    flex: 1;
    overflow: hidden;
}

.common-module-root--full .table-region :deep(.ant-table-wrapper),
.common-module-root--full .table-region :deep(.ant-spin-nested-loading),
.common-module-root--full .table-region :deep(.ant-spin-container) {
    height: 100%;
}

.search-input :deep(.q-field__control) {
    border-color: var(--q-primary) !important;
}

.common-module-root :deep(.rp2-grid-table .ant-table),
.common-module-root :deep(.rp2-grid-table .ant-table-container) {
    border: 1px solid #6f8098 !important;
}

.common-module-root :deep(.rp2-grid-table .ant-table-container) {
    border-color: #6f8098 !important;
}

.common-module-root :deep(.rp2-grid-table .ant-table-thead > tr > th) {
    border-bottom: 1px solid #c7cfdb !important;
    border-right: 1px solid #cfd7e3 !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    line-height: 1.2 !important;
}

.common-module-root :deep(.rp2-grid-table .ant-table-tbody > tr > td) {
    border-bottom: 1px solid #d4dbe6 !important;
    border-right: 1px solid #d9e0ea !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    line-height: 1.25 !important;
}

.common-module-root :deep(.rp2-grid-table .ant-table-tbody > tr.ant-table-measure-row > td) {
    padding: 0 !important;
    border: 0 !important;
    height: 0 !important;
    line-height: 0 !important;
}

.common-module-root :deep(.rp2-grid-table .ant-table-thead > tr > th:first-child),
.common-module-root :deep(.rp2-grid-table .ant-table-tbody > tr > td:first-child) {
    border-left: 1px solid #d9e0ea !important;
}

.common-module-root :deep(.rp2-grid-table .ant-table-thead > tr > th:last-child),
.common-module-root :deep(.rp2-grid-table .ant-table-tbody > tr > td:last-child) {
    border-right: 0 !important;
}
</style>

<style scoped></style>

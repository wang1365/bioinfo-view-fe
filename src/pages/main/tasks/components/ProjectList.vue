<template>
    <div style="max-width: 100%">
        <PopupSingleSelector
            :title="$t('Project')"
            :dataItems="dataItems"
            :total="total"
            :tableHeaders="tableHeaders"
            :tableRowFields="tableRowFields"
            :currentPage="currentPage"
            selectedShowField="name"
            @pageChange="pageChange($event)"
            @ensureSelect="ensureSelect($event)"
        >
            <template v-slot:tableFilter>
                <div class="row q-px-md q-gutter-sm">
                    <q-input
                        style="width: 250px"
                        dense
                        v-model="projectName"
                        :label="$t('ProjectPageListSearchInput')"
                        clearable
                    />
                    <q-btn color="primary" icon="search" @click="refreshPage()"></q-btn>
                </div>
            </template>
            <template v-slot:itemRow="{ row }">
                <td>
                    <span v-if="row.parent" class="text-bold text-primary q-mr-xs">{{ row.parent.name }}/</span>
                    <span class="text-secondary">
                        {{ row.name }}
                    </span>
                </td>
                <td>{{ row.samples.length }}</td>
                <td>{{ row.task_count }}</td>
                <td>{{ row.owner }}</td>
                <td>{{ row.create_time }}</td>
            </template>
        </PopupSingleSelector>
    </div>
</template>
<script setup>
import { onMounted, ref ,computed, watch } from "vue"
import { useApi } from "src/api/apiBase"
import PopupSingleSelector from "components/popup-single-selector/PopupSingleSelector.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const tableHeaders = computed(()=>[
    `${t('Project')}(${t('TaskPageProjectParent')}/${t('TaskPageProjectSelf') })`,
    t('ProjectPageListTableSampleCount'),
    t('ProjectPageListTableTaskCount'),
    t('ProjectPageListTableCreater'),
    t('ProjectPageListTableCreateTime'),
])
const tableRowFields = ref([
    "name",
    "samples",
    "task_count",
    "owner",
    "create_time",
])
const emit = defineEmits(["itemSelected"])
const { apiGet } = useApi()
const projectName = ref("")
const selectedItem = ref({})

const selectItem = (item) => {
    selectedItem.value = item
}

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0);
const dataItems = ref([])

const itemSelected = () => {
    emit("itemSelected", selectedItem.value)
}

onMounted(() => {
    loadPage()
})

const ensureSelect = (event) => {
    emit("itemSelected", event)
}

const pageChange = async (event) => {
    console.log(event)
    currentPage.value = event.currentPage
    pageSize.value = event.pageSize
    loadPage()
}

const refreshPage = async () => {
    currentPage.value = 1
    loadPage()
}

const loadPage = async () => {
    let params = `?page=${currentPage.value}&size=${pageSize.value}&all_level=1`
    if (projectName.value) params += `&name=${projectName.value}`
    apiGet(`/project${params}`, (res) => {
        total.value = res.data.count
        dataItems.value = []
        for (let iterator of res.data.results) {
            iterator.selected = false
            dataItems.value.push(iterator)
        }
    })
}
</script>

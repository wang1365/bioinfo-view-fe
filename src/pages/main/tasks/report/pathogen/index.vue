<template>
    <div>
        <a-table
            :data-source="rows"
            :columns="columns"
        >

        </a-table>
        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ $t('MutationAnalysis') }}</q-bar>
                <q-card-section>
                    <div style="white-space:pre-wrap; line-height: 35px">{{ props.intro }}</div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn v-close-popup color="primary">{{ $t('Close') }}</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script setup>
import {errorMessage, infoMessage} from 'src/utils/notify'
import {ref, onMounted, computed, toRef, watch} from 'vue'
import {useRoute} from 'vue-router'
import {readTaskFile, readTaskMuFile} from 'src/api/task'
import {getCsvHeader, getCsvData, getCsvDataAndSetLineNumber} from 'src/utils/csv'
import {useQuasar} from 'quasar'
import {useI18n} from "vue-i18n"
import {globalStore} from 'src/stores/global'
import {storeToRefs} from 'pinia'

const store = globalStore()
const {langCode} = storeToRefs(store)
const {t} = useI18n()
const $q = useQuasar()
const route = useRoute()
const dlgVisible = ref(false)
const emit = defineEmits(['stickDone', 'reset'])
const viewConfig = toRef(props, 'viewConfig')
const rows = ref([])
const props = defineProps({
    intro: {
        type: String,
        required: false,
    },
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    viewConfig: {
        type: Object,
        required: false,
        default() {
            return {}
        },
    },
    task: {
        type: Object,
        required: false,
    },
    stepData: {
        type: Object,
        default: () => {
        }
    },
    category: {
        type: String,
        default: 'bacteria'
    }
})


const filterData = ref({somatic: null, germline: null})
const stepData = toRef(props, 'stepData')

const columns = computed(() => [
    {
        name: 'categoryName',
        title: t('ShuMing'),
        dataIndex: 'categoryName',
        sortable: true,
        align: 'center',
        required: true
    },
    {
        name: 'relativeAbundance',
        title: t('RelativeAbundance'),
        dataIndex: 'relativeAbundance',
        sortable: true,
        align: 'center',
        required: true
    },
    {
        name: 'readsCount1',
        title: t('ReadsCount'),
        dataIndex: 'readsCount1',
        sortable: true,
        align: 'center',
        required: true
    },
    {
        name: 'speciesName',
        title: t('SpeciesName'),
        dataIndex: 'speciesName',
        sortable: true,
        align: 'center',
        required: true
    },
    {
        name: 'proportion',
        title: t('Proportion'),
        dataIndex: 'proportion',
        sortable: true,
        align: 'center',
        required: true
    },
    {
        name: 'readsCount2',
        title: t('ReadsCount'),
        field: 'readsCount2',
        sortable: true,
        align: 'center',
        required: true
    },
    {
        name: 'totalProportion',
        title: t('TotalProportion'),
        dataIndex: 'totalProportion',
        sortable: true,
        align: 'center',
        required: true
    },
    {name: 'report', label: t('Report'), dataIndex: 'report', align: 'center', required: true},
])

onMounted(() => loadData())
watch(langCode, () => loadData())


const filterChange = (name, data) => {
    filterData.value[name] = data
    if (name === 'germline') {
        germlineData.value.searchParams = data.searchParams
        germlineData.value.selectedRows = data.selectedRows
        germlineData.value.selectedDefaultRows = data.selectedDefaultRows

    } else if (name === 'somatic') {
        somaticData.value.searchParams = data.searchParams
        somaticData.value.selectedRows = data.selectedRows
        somaticData.value.selectedDefaultRows = data.selectedDefaultRows
    }
    console.log(name, data)
}
// 同步子组件的过滤参数
const onSearchParamsChange = (name, data) => {
    if (name === 'germline') {
        germlineData.value.searchParams = data
    } else {
        somaticData.value.searchParams = data
    }
}
const stickFilter = () => {
    if (!filterData.value.germline && viewConfig.value.showMutGermline) {
        if (germlineVue.value) {
            let data = germlineVue.value.getChangedData()
            filterData.value.germline = data
        } else {
            errorMessage(t('DefineReportMutationGermlineUnlock'))
            return false
        }

    }
    if (!filterData.value.somatic && viewConfig.value.showMutSomatic) {
        if (somaticVue.value) {
            let data = somaticVue.value.getChangedData()
            filterData.value.somatic = data
        } else {
            errorMessage(t('DefineReportMutationSomaticUnlock'))
            return false
        }
    }
    console.log(filterData.value)
    emit('stickDone', filterData.value)
}

const reset = () => {
    try {
    } catch (error) {

    }
    emit('reset', null)
}


const loadData = () => {
    $q.loading.show({delay: 100})
    const suffix = langCode.value === 'cn' ? 'CN' : 'EN'

    readTaskFile(route.params.id, `Bacteria/Bacteria_${suffix}.txt`).then((res) => {
        // const headNames = getCsvHeader(res, '\t', 1)

        const fields = columns.value.map(c => c.dataIndex)
        fields.splice(7, 0, 'file')
        rows.value = getCsvData(res, {start: 2, fields})

        console.log('fields', fields)
        console.log('rows', rows.value)

    }).finally(() => {
        $q.loading.hide()
    })
}

</script>

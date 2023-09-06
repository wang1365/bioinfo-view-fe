<template>
    <div>
        <a-table
            :data-source="rows"
            :columns="columns"
            bordered
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


const columns = computed(() => [
    {
        title: t('Shu'),
        children: [{
            name: 'categoryName',
            title: t('ShuMing'),
            dataIndex: 'categoryName',
            align: 'center',
            sorter: true
        },
        {
            name: 'relativeAbundance',
            title: t('RelativeAbundance'),
            dataIndex: 'relativeAbundance',
            align: 'center',
            sorter: (a, b) => a.relativeAbundance < b.relativeAbundance
        },
        {
            name: 'readsCount1',
            title: t('ReadsCount'),
            dataIndex: 'readsCount1',
            align: 'center',
            sorter: (a, b) => Number(a.readsCount1) < Number(b.readsCount1)
        }]
    },
    {
      title: t('Zhong'),
      children: [
          {
              name: 'speciesName',
              title: t('SpeciesName'),
              dataIndex: 'speciesName',
              align: 'center',
              sorter: true
          },
          {
              name: 'proportion',
              title: t('Proportion'),
              dataIndex: 'proportion',
              align: 'center',
              sorter: (a, b) => a.proportion < b.proportion
          },
          {
              name: 'readsCount2',
              title: t('ReadsCount'),
              field: 'readsCount2',
              align: 'center',
              sorter: (a, b) => Number(a.readsCount2) < Number(b.readsCount2)
          },
          {
              name: 'totalProportion',
              title: t('TotalProportion'),
              dataIndex: 'totalProportion',
              align: 'center',
              sorter: (a, b) => a.totalProportion < b.totalProportion
          },
      ]
    },
    {name: 'report', label: t('Report'), dataIndex: 'report', align: 'center', required: true},
])

onMounted(() => loadData())
watch(langCode, () => loadData())

// 不同病原体的数据文件配置
const dataFile = computed(() => {
    const suffix = langCode.value === 'cn' ? 'CN' : 'EN'
    return {
        bacteria: `Bacteria/Bacteria_${suffix}.txt`,
        fungus: `Fungus/Fungus_${suffix}.txt`,
        virus: `Virus/Virus_${suffix}.txt`,
        parasite: `Parasite/Parasite_${suffix}.txt`,
        specificPathogen: `SpecificPathogen/SpecificPathogen_${suffix}.txt`,
    }[props.category]
})

const loadData = () => {
    $q.loading.show({delay: 100})

    readTaskFile(route.params.id, dataFile.value).then((res) => {
        // const headNames = getCsvHeader(res, '\t', 1)

        const fields = ['categoryName', 'relativeAbundance', 'readsCount1', 'speciesName', 'proportion', 'readsCount2', 'totalProportion', 'file']
        rows.value = getCsvData(res, {start: 2, fields})

        console.log('fields', fields)
        console.log('rows', rows.value)

    }).finally(() => {
        $q.loading.hide()
    })
}

</script>

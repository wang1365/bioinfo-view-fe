<template>
    <div class="q-py-sm align-right" style="text-align: right;">
        <q-btn
            icon="help_outline"
            size="small"
            outline
            color="orange"
            class=" q-mr-md"
            @click="dlgVisible = !dlgVisible"
            :label="$t('Intro')"
        />
        <q-btn
            v-if="props.viewConfig.showStick && props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            color="primary"
            class=" q-mr-md"
            :label="$t('ReportStickDone')"
            @click="reset()"
        />
        <q-btn
            v-if="props.viewConfig.showStick && !props.viewConfig.stickDone"
            icon="bookmarks"
            size="small"
            outline
            color="primary"
            class=" q-mr-md"
            @click="stickFilter()"
            :label="$t('ReportStickData')"
        />
    </div>
    <div class="q-pt-sm">
        <q-tabs v-model="tab" align="left" active-color="primary" dense>
            <q-tab v-for="category in categories" :key="category.code" :label="category.title" :name="category.code">
            </q-tab>
        </q-tabs>
        <q-tab-panels v-model="tab">
            <q-tab-panel v-for="category in categories" :key="category.code" :name="category.code">
                <PathogenTable
                    :data="category"
                    :view-config="viewConfig"
                    :task="props.task"
                    :category="props.category"
                    :subCategory="tab"
                    @tableStickChange="tableStickChange(category.code, $event)"
                    :stepData="tabsStickData[category.code]"
                />
            </q-tab-panel>
        </q-tab-panels>

        <q-dialog v-model="dlgVisible">
            <q-card style="width: 75%; max-width: 2000px">
                <q-bar class="bg-primary text-white">{{ introTitle }}</q-bar>
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
import { computed, ref, toRef, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from "vue-i18n"
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'
import PathogenTable from './components/PathogenTable.vue'
import { errorMessage } from "src/utils/notify"


const store = globalStore()
const { langCode } = storeToRefs(store)
const { t } = useI18n()
const route = useRoute()
const dlgVisible = ref(false)
const emit = defineEmits(['stickDone', 'reset'])
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
const viewConfig = toRef(props, 'viewConfig')
const stepData = toRef(props, 'stepData')
const tab = ref('mycobacterium')
const categories = computed(() => {
    const suffix = langCode.value === 'cn' ? 'CN' : 'EN'
    return [
        {
            code: 'mycobacterium',
            title: t('Mycobacterium'),
            file: `SpecificPathogen/SpecificPathogen-mycobacterium_${suffix}.txt`
        }, {
            code: 'nomycobacterium',
            title: t('Nomycobacterium'),
            file: `SpecificPathogen/SpecificPathogen-nomycobacterium_${suffix}.txt`
        }, {
            code: 'mycoplasma',
            title: t('Mycoplasma'),
            file: `SpecificPathogen/SpecificPathogen-mycoplasma_${suffix}.txt`
        }
    ]
})

const introTitle = computed(() => {
    const i18nKey = {
        bacteria: 'Bacteria',
        fungus: 'Fungus',
        virus: `Virus`,
        parasite: `Parasite`,
        specificPathogen: `SpecificPathogen`,
    }[props.category]
    return t(i18nKey)
})
const tabsStickDataOrigin = {
    mycobacterium: {
        searchParams: "",
        selectedRows: [],
        filtered: false,
        selected: false,
    },
    nomycobacterium: {
        searchParams: "",
        selectedRows: [],
        filtered: false,
        selected: false,
    },
    mycoplasma: {
        searchParams: "",
        selectedRows: [],
        filtered: false,
        selected: false,
    }
}
const tabsStickData = ref({
    mycobacterium: {
        searchParams: "",
        selectedRows: [],
        filtered: false,
        selected: false,
    },
    nomycobacterium: {
        searchParams: "",
        selectedRows: [],
        filtered: false,
        selected: false,
    },
    mycoplasma: {
        searchParams: "",
        selectedRows: [],
        filtered: false,
        selected: false,
    }
})
onMounted(() => {
    if (stepData.value) {
        tabsStickData.value = stepData.value
    }
})
const tableStickChange = (category, data) => {
    console.log(category)
    console.log(data)
    tabsStickData.value[category] = data
}
const stickFilter = () => {
    if (!tabsStickData.value.mycobacterium.searchParams.genusName && !!tabsStickData.value.mycobacterium.searchParams.speciesName && tabsStickData.value.mycobacterium.selectedRows.length === 0) {
        errorMessage(t('Mycobacterium') + ": " + t('DefineReportUnlockMessage'))
        return null
    }
    if (!tabsStickData.value.nomycobacterium.searchParams.genusName && !!tabsStickData.value.nomycobacterium.searchParams.speciesName && tabsStickData.value.nomycobacterium.selectedRows.length === 0) {
        errorMessage(t('Nomycobacterium') + ": " + t('DefineReportUnlockMessage'))
        return null
    }
    if (!tabsStickData.value.nomycobacterium.searchParams.genusName && !!tabsStickData.value.nomycobacterium.searchParams.speciesName && tabsStickData.value.mycoplasma.selectedRows.length === 0) {
        errorMessage(t('Mycoplasma') + ": " + t('DefineReportUnlockMessage'))
        return null
    }
    emit('stickDone', tabsStickData.value)
}
const reset = () => {
    emit('reset', null)
    tabsStickData.value = tabsStickDataOrigin
}
</script>

<style lang="scss" scoped></style>

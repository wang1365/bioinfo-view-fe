<template>
    <div>
        <q-tabs
            v-model="tab"
            active-color="primary"
            active-bg-color="grey-4"
            align="left" dense
            class="bg-grey-1"
            :breakpoint="0"
        >
            <q-tab name="突变信息" label="突变信息" />
            <q-tab name="药物关联信息" label="药物关联信息" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="突变信息">
                <div class="row q-gutter-xs">
                    <div class="col" style="border-right:solid 1px black; padding-left: 5px">
                        <div>{{`VCF filter: `}}<span class="text-purple">{{isGermline ? props.row.col147 : props.row.col151}}</span></div>
                    </div>
                    <div class="col" style="border-right:solid 1px black; padding-left: 5px">
                        <div>{{`Gene: `}}<span class="text-purple">{{col146.gene}}</span></div>
                        <div>{{`Transcript: `}}<span class="text-purple">{{col146.transcript}}</span></div>
                        <div>{{`Exon: `}}<span class="text-purple">{{col146.exon}}</span></div>
                        <div>{{`cDNA: `}}<span class="text-purple">{{col146.cDna}}</span></div>
                        <div>{{`Ref/Alt: `}}<span class="text-purple">{{col146.ref}}</span></div>
                        <div>{{`Protein: `}}<span class="text-purple">{{col146.protein}}</span></div>
                    </div>
                    <div class="col" style="padding-left: 5px">
                        <div>
                            <span>{{'RS: '}}</span>
                            <a :href="'https://www.ncbi.nlm.nih.gov/snp/' + rs" target="_blank">{{rs}}</a>
                        </div>
                        <div>{{`ClinVar Allele ID: `}}<span class="text-purple">{{clinVar}}</span></div>
                        <div>
                            <span>{{'OMIM: '}}</span>
                            <a :href="'https://omim.org/entry/' + omim" target="_blank">{{omim}}</a>
                        </div>
                    </div>
                </div>
                <q-separator class="q-my-sm"/>
                <div class="q-mt-sm">
                    <RadarChartVue :data="props.row"/>
                </div>
            </q-tab-panel>

            <q-tab-panel name="药物关联信息">
                <div>功能尚未开放</div>
                <div class="bio-data-table q-py-sm">
                    <table>

                    </table>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup>
import { ref, onMounted, toRefs, computed } from 'vue'
import RadarChartVue from './SomaticColumnCharts/RadarChart'

const tab = ref('突变信息')

const props = defineProps({
    row: {
        type: Object,
        required: true,
        default: () => {}
    },
    isGermline: {
        type: Boolean,
        required: false,
        default: () => true
    }
})

const { row, isGermline } = toRefs(props)

const col146 = computed(() => {
    const result = {
        ref: `${row.value.col4} > ${row.value.col5}`
    }
    const col = isGermline.value ? row.value.col146 : row.value.col150
    const items = col.split(':')
    if (items.length < 5) {
        console.log('Invalid col', col, row.value)
        return result
    }
    const [gene, transcript, exon, cDna,  protein] = items
    return {
        gene, transcript, exon, cDna, protein,
        ...result
    }
})

const rs = computed(() => {
    return isGermline.value ? props.row.col34 : props.row.col25
})

const clinVar = computed(() => {
    return isGermline.value ? props.row.col17 : props.row.col21
})

const omim = computed(() => {
    return isGermline.value ? props.row.col144 : props.row.col148
})

onMounted(() => {
    console.log('=========', props.row)
})


</script>

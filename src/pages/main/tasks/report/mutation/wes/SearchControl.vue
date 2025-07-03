<template>
    <div
        :class="['column', 'q-gutter-y-xs', 'q-pr-sm', {dimmed: showSticky && stickDone}]"
        style="width:100%;overflow-y:scroll;"
    >
        <div style="border-bottom: 1px solid lightgrey" class="q-p-xs">
            <q-option-group
                v-model="innerSearchParams.diseaseCategories"
                type="checkbox"
                dense
                color="primary"
                class="text-primary"
                :options="[{label: 'A (Disease Related: IA,IIA,IIIA)', value: 'A'},{label: 'B (Disease Related: IB,IIB,IIIB)', value: 'B'},{label: 'C (Others: IV,V)', value: 'C'}]"
            />
        </div>

        <q-select
            v-model="innerSearchParams.phenoType"
            clearable
            multiple
            dense
            outlined
            hide-dropdown-icon
            use-input
            @filter="optionFilters.phenoType"
            :options="props.options.phenoType"
            label="Phenotype"
            stack-label
            label-color="primary"
            class="full-width"
        />

        <q-select
            v-model="innerSearchParams.diseases"
            clearable
            multiple
            dense
            outlined
            hide-dropdown-icon
            use-input
            @filter="optionFilters.diseases"
            :options="props.options.diseases"
            label="Disease"
            stack-label
            label-color="primary"
            class="full-width"
        />

        <q-select
            v-model="innerSearchParams.diseaseInheritanceModes"
            clearable
            multiple
            dense
            outlined
            hide-dropdown-icon
            use-input
            @filter="optionFilters.diseaseInheritanceModes"
            :options="props.options.diseaseInheritanceModes"
            label="Disease Inheritance Modes"
            stack-label
            label-color="primary"
            class="full-width"
        />
        <q-input
            v-model="innerSearchParams.geneSet"
            label="Geneset"
            clearable
            dense
            outlined
            stack-label
            class="full-width"
            label-color="primary"
        >
            <template v-slot:append>
                <q-btn padding="xs" size="sm" icon="add" @click="genesetData.visible = true" />
                <!--                            <q-btn padding="xs" size="sm" icon="menu" />-->
            </template>
        </q-input>
        <q-checkbox v-model="innerSearchParams.excludeGensets" keep-color dense size="sm" color="primary">
            <template v-slot:default>
                <span class="text-primary">Exclude selected Genesets</span>
            </template>
        </q-checkbox>

        <q-select
            v-model="innerSearchParams.gene"
            clearable
            multiple
            dense
            outlined
            use-input
            @filter="optionFilters.gene"
            hide-dropdown-icon
            :options="props.options.gene"
            :label="$t('genes')"
            stack-label
            label-color="primary"
            class="full-width"
        />

        <q-select
            v-model="innerSearchParams.prioritizationTier"
            clearable
            multiple
            dense
            outlined
            hide-dropdown-icon
            :options="props.options.prioritizationTier"
            label="Prioritization Tier"
            stack-label
            label-color="primary"
            class="full-width"
        />

        <div class="row">
            <q-select
                v-model="innerSearchParams.acmgPathogenicity"
                clearable
                multiple
                dense
                outlined
                hide-dropdown-icon
                :options="props.options.acmgPathogenicity"
                label="ACMG Pathogenicity"
                stack-label
                label-color="primary"
                class="col full-width"
            />

            <q-select
                v-model="innerSearchParams.clinvarPathogenicity"
                clearable
                multiple
                dense
                outlined
                hide-dropdown-icon
                :options="props.options.clinvarPathogenicity"
                label="Clinvar Pathogenicity"
                stack-label
                label-color="primary"
                class="col full-width"
            />
        </div>

        <q-select
            v-model="innerSearchParams.userPathogenicity"
            clearable
            multiple
            dense
            outlined
            hide-dropdown-icon
            :options="verdictOptions"
            label="User's Pathogenicity"
            stack-label
            label-color="primary"
            class="col full-width"
            emit-value
        />

        <div class="row justify-between">
            <q-select
                v-model="innerSearchParams.populationAlleleFrequency"
                outlined
                hide-dropdown-icon
                :options="props.options.populationAlleleFrequency"
                label="Population Allele Frequency"
                stack-label
                multiple
                dense
                clearable
                class="col-7"
                label-color="primary"
            >
            </q-select>
            <q-select
                v-model="innerSearchParams.pafComp"
                :options="comparatorOptions"
                stack-label
                dense
                hide-dropdown-icon
                class="col-1"
                emit-value
            />
            <q-input
                v-model.number="innerSearchParams.pafValue"
                :options="props.options.pafValue"
                stack-label
                dense
                outlined
                type="number"
                class="col-4"
                label-color="primary"
            >
                <template v-slot:after><span class="text-subtitle1 text-primary">%</span></template>
            </q-input>
        </div>

        <div class="row justify-between">
            <q-select
                v-model="innerSearchParams.genoType"
                clearable
                outlined
                hide-dropdown-icon
                :options="props.options.genoType"
                label="Genotype"
                stack-label
                dense
                label-color="primary"
                class="col-6"
            />
            <q-select
                v-model="innerSearchParams.seqQuality"
                clearable
                outlined
                dense
                hide-dropdown-icon
                :options="props.options.seqQuality"
                label="SEQ Quality"
                stack-label
                label-color="primary"
                class="col-6"
            />
        </div>

        <div class="row justify-between">
            <div class="text-primary col-5 content-center" style="font-size: 12px">Genotype Quality</div>
            <q-select
                v-model="innerSearchParams.genoTypeComp"
                :options="comparatorOptions"
                stack-label
                dense
                hide-dropdown-icon
                emit-value
                class="col-1"
            />
            <q-input
                v-model.number="innerSearchParams.genoTypeValue"
                stack-label
                dense
                outlined
                type="number"
                class="col-5"
                label-color="primary"
            >
            </q-input>
        </div>

        <div class="row justify-between">
            <div class="text-primary col-5 content-center" style="font-size: 12px">Variant Quality</div>
            <q-select
                v-model="innerSearchParams.variantQualityComp"
                :options="comparatorOptions"
                stack-label
                dense
                emit-value
                hide-dropdown-icon
                class="col-1"
            />
            <q-input
                v-model.number="innerSearchParams.variantQualityValue"
                stack-label
                dense
                outlined
                type="number"
                class="col-5"
                label-color="primary"
            >
            </q-input>
        </div>

        <div class="row justify-between">
            <div class="text-primary col-5 content-center" style="font-size: 12px">Depth</div>
            <q-select
                v-model="innerSearchParams.seqDepthComp"
                :options="comparatorOptions"
                stack-label
                dense
                emit-value
                hide-dropdown-icon
                class="col-1"
            />
            <q-input
                v-model.number="innerSearchParams.seqDepthValue"
                stack-label
                dense
                outlined
                type="number"
                class="col-5"
                label-color="primary"
            >
            </q-input>
        </div>

        <div class="row">
            <q-input
                v-model.number="innerSearchParams.minAlleleFraction"
                stack-label
                dense
                outlined
                type="number"
                class="col-6"
                label-color="primary"
                label="Min Allele Fraction"
            >
                <template v-slot:append><span class="text-subtitle2">%</span></template>
                <!--                            <template v-slot:after><span class="text-subtitle2">~</span></template>-->
            </q-input>
            <q-input
                v-model.number="innerSearchParams.maxAlleleFraction"
                stack-label
                dense
                outlined
                type="number"
                class="col-6"
                label-color="primary"
                label="Max Allele Fraction"
            >
                <template v-slot:append><span class="text-subtitle2">%</span></template>
            </q-input>
        </div>

        <div class="row justify-between">
            <q-select
                v-model="innerSearchParams.chromosome"
                hide-dropdown-icon
                :options="props.options.chromosome"
                :label="$t('Chromosome')"
                stack-label
                dense
                outlined
                label-color="primary"
                class="col-3"
            />
            <q-input
                v-model.number="innerSearchParams.chromosomeStart"
                stack-label
                dense
                outlined
                class="col-4"
                label-color="primary"
                :label="$t('Start')"
            />
            <span>~</span>
            <q-input
                v-model.number="innerSearchParams.chromosomeEnd"
                stack-label
                dense
                outlined
                class="col-4"
                label-color="primary"
                :label="$t('End')"
            >
            </q-input>
        </div>
        <geneset-dialog
            v-model:visible="genesetData.visible"
            v-model:gene="innerSearchParams.geneSet"
            :base-genes="props.options.gene"
        />
    </div>
</template>

<script setup>

import { useComparatorOptions } from 'src/utils/comparator'
import { verdictOptions } from './wes.js'
import GenesetDialog from 'pages/main/tasks/report/common-module/GenesetDialog.vue'
import { ref } from 'vue'

const props = defineProps({
    showSticky: {
        type: Boolean,
        required: false,
        default: () => false,
    },
    stickDone: {
        type: Boolean,
        required: false,
        default: () => false,
    },
    options: {
        type: Object,
        required: false,
        default() {
            return {
                mutationPosition: [],
                mutationMeaning: [],
                mutationRisk: [],
                chromosome: [],
                gene: [],
                phenoType: [],
                diseases: [],
                diseaseInheritanceModes: [],
            }
        },
    },
})

const innerSearchParams = defineModel('searchParams', {})

const { options: comparatorOptions, compare } = useComparatorOptions()

const genesetData = ref({
    visible: false,
    genset: [],
})

function makeOptionFilter (val, update, optionName) {
    const p = props.options
    const optionInitName = `${optionName}Init`
    if (val === '') {
        update(() => {
            p[optionName] = p[optionInitName]
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        p[optionName] = p[optionInitName].filter(v => {
            if (v === undefined || v === null) {
                return false
            }
            return v.toLowerCase().indexOf(needle) > -1
        })
    })
}


const optionFilters = {
    gene: (v, u) => makeOptionFilter(v, u, 'gene'),
    phenoType: (v, u) => makeOptionFilter(v, u, 'phenoType'),
    diseases: (v, u) => makeOptionFilter(v, u, 'diseases'),
    diseaseInheritanceModes: (v, u) => makeOptionFilter(v, u, 'diseaseInheritanceModes'),
}
</script>

<style scoped lang="scss"></style>

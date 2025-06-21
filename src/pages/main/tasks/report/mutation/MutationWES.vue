<template>
    <div>
        <q-splitter v-model="splitterModel" unit="px" style="height: 680px" before-class="">
            <template v-slot:before>
                <div
                    :class="['column', 'q-gutter-y-xs', 'q-pr-sm', {dimmed: showSticky && stickDone}]"
                    style="width:100%"
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
                            <q-btn padding="xs" size="sm" icon="add" />
                            <q-btn padding="xs" size="sm" icon="menu" />
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
                        class="full-width"
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
                        class="full-width"
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

                    <div class="row">
                        <q-select
                            v-model="innerSearchParams.chromosome"
                            hide-dropdown-icon
                            :options="props.options.chromosome"
                            :label="$t('Chromosome')"
                            stack-label
                            dense
                            outlined
                            label-color="primary"
                            class="col-5"
                        />
                        <q-input
                            v-model="innerSearchParams.chromosomeStart"
                            stack-label
                            dense
                            outlined
                            class="col-3"
                            label-color="primary"
                            :label="$t('Start')"
                        />
                        <span>~</span>
                        <q-input
                            v-model="innerSearchParams.chromosomeEnd"
                            stack-label
                            dense
                            outlined
                            class="col-3"
                            label-color="primary"
                            :label="$t('End')"
                        >
                        </q-input>
                    </div>
                    <!--                    :class="['column', 'q-gutter-y-xs', {dimmed: showSticky && stickDone}]"-->
                    <div>
                        <div class="row q-gutter-x-sm">
                            <q-btn
                                color="primary"
                                :label="$t('Confirm')"
                                size="md"
                                dense
                                padding="sm"
                                icon="search"
                                @click="search"
                            />
                            <q-btn
                                color="primary"
                                :label="$t('Reset')"
                                size="md"
                                dense
                                padding="sm"
                                icon="settings_backup_restore"
                                @click="reset"
                            />
                            <q-btn
                                :href="tableFile"
                                :download="tableFileName"
                                :label="$t('Download')"
                                padding="sm"
                                dense
                                icon="south"
                                color="primary"
                                target="_blank"
                                size="md"
                            />
                        </div>
                    </div>
                </div>
            </template>

            <template v-slot:after>
                <div style="position:relative">
                    <q-icon
                        v-if="isDefineReport"
                        color="accent"
                        name="question_mark"
                        size="xs"
                        style="position:absolute;z-index:100;left:0px;top:0px"
                    >
                        <q-tooltip>{{$t('OnlySelectAllThisPageFilterResult')}}</q-tooltip>
                    </q-icon>
                    <a-table
                        style="z-index:1"
                        :loading="loading"
                        :data-source="filteredRows"
                        :columns="columns"
                        :scroll="{ x: scrollX, y: 550 }"
                        :custom-row="customRow"
                        :sticky="true"
                        rowKey="lineNumber"
                        :row-selection="rowSelection"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.dataIndex === 'geneInfo'">
                                <div class="row">
                                    <template v-if="record.expanded">
                                        <div class="col-2 column justify-between">
                                            <div
                                                class="col-2 text-weight-bolder text-green-5 q-pl-sm justify-between"
                                                style="font-size: 14px"
                                            >
                                                {{record.Class}}
                                            </div>
                                            <q-btn
                                                class="col-10 q-mr-md"
                                                :icon="record.expanded ? 'unfold_less' : 'unfold_more'"
                                                color="primary"
                                                flat
                                                padding="0"
                                                left
                                                size="md"
                                                @click="record.expanded = !record.expanded"
                                            />
                                        </div>
                                        <div class="col-10 text-left">
                                            <div class="text-primary" style="font-size: 16px">
                                                {{record['Gene.refGene']}}
                                            </div>
                                            <div>{{record['ExonicFunc.refGene']}}</div>
                                            <div>
                                                {{record['Chr'] + ':' + record.Start + ' ' + record.Ref + '>' + record.Alt}}
                                            </div>
                                            <div>{{record.NUChange}}</div>
                                            <div>{{record.AAChange}}</div>
                                            <div>{{record['GeneDetail.refGene'] + ' ' + record.exon}}</div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="col-2 column justify-between">
                                            <div
                                                class="col-6 text-weight-bolder text-green-5 q-pl-sm"
                                                style="font-size: 16px"
                                            >
                                                {{record.Class}}
                                            </div>
                                            <q-btn
                                                class="col-6 q-mr-md"
                                                :icon="record.expanded ? 'unfold_less' : 'unfold_more'"
                                                color="primary"
                                                flat
                                                padding="0"
                                                left
                                                @click="record.expanded = !record.expanded"
                                            />
                                        </div>
                                        <div class="col-10 row justify-between">
                                            <div class="text-primary col-4 content-center" style="font-size: 16px">
                                                {{record['Gene.refGene']}}
                                            </div>
                                            <div class="col-7 row text-blue-grey-6">
                                                <div>{{record['ExonicFunc.refGene']}}</div>
                                                <div>{{record.NUChange}}</div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </template>
                            <template v-if="column.dataIndex === 'genoTypeQuality'">
                                <template v-if="record.expanded">
                                    <div class="row q-gutter-x-sm">
                                        <div class="col">
                                            <div class="text-grey">Genotype Quality</div>
                                            <div>{{record.Genotype_Quality || '-'}}</div>

                                            <div class="text-grey">Variant Quality</div>
                                            <div>{{record.Variant_Quality || '-'}}</div>

                                            <div class="text-grey">Depth Quality</div>
                                            <div>{{record.Depth_Quality}}</div>
                                        </div>
                                        <div class="col">
                                            <div class="text-grey">Allele Fraction</div>
                                            <div>{{(record.Mutation_Rate_*100).toFixed(2) || '-'}}%</div>

                                            <div class="text-grey">Depth</div>
                                            <div>{{record.Seq_Depths_ || '-'}}</div>

                                            <div class="text-grey">Genotype</div>
                                            <div>{{record.Genotype}}</div>
                                        </div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="row q-gutter-x-sm">
                                        <div>{{record.Depth_Quality}}(DP:{{record.Seq_Depths_}})</div>
                                        <div>AF: {{(record.Mutation_Rate_*100).toFixed(2) || '-'}}%</div>
                                    </div>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'Gene_Related_Diseases'">
                                <template v-if="record.expanded">
                                    <template v-for="grd in record.Gene_Related_Diseases" :key="grd">
                                        <a-tooltip :title="grd"
                                            ><div>{{grd}}</div></a-tooltip
                                        >
                                    </template>
                                </template>
                                <template v-else>
                                    <a-tooltip :title="record.Gene_Related_Diseases[0]"
                                        ><div>{{record.Gene_Related_Diseases[0]}}</div></a-tooltip
                                    >
                                    <div v-if="record.Gene_Related_Diseases.length > 1" class="row justify-between">
                                        <a-tooltip :title="record.Gene_Related_Diseases[1]"
                                            ><div class="col-10">{{record.Gene_Related_Diseases[1]}}</div></a-tooltip
                                        >
                                    </div>
                                    <div
                                        v-if="record.Gene_Related_Diseases.length > 2"
                                        class="col-1 text-primary cursor-pointer"
                                        @click="record.expanded = !record.expanded"
                                    >
                                        +{{record.Gene_Related_Diseases.length-2}}
                                    </div>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'userVerdict'">
                                <div class="row">
                                    <template v-for="v in record.userVerdict" :key="v">
                                        <q-btn
                                            :label="v"
                                            color="primary"
                                            size="sm"
                                            outline
                                            padding="3px"
                                            class="q-ma-xs"
                                        />
                                    </template>
                                    <q-btn
                                        flat
                                        icon="settings"
                                        size="sm"
                                        color="grey"
                                        padding="3px"
                                        @click="showVerdictDlg(record)"
                                    />
                                </div>
                            </template>

                            <template v-if="column.dataIndex === 'ACMG_result'">
                                <div class="text-purple">{{record.ACMG_result}}</div>
                                <template v-if="record.expanded">
                                    <template v-for="acmg in record.ACMG" :key="acmg">
                                        <q-chip
                                            color="orange"
                                            outline
                                            square
                                            v-if='acmg !== "."'
                                            dense
                                            >{{acmg}}</q-chip
                                        >
                                    </template>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'Clinvar'">
                                <div class="text-purple">{{record.Clinvar}}</div>
                                <q-rating
                                    v-if="record.expanded"
                                    :model-value="record.Clinvar_ReviewStatus"
                                    color="orange"
                                    icon="star_border"
                                    icon-selected="star"
                                    readonly
                                />
                            </template>

                            <template v-if="column.dataIndex === 'Frequencies'">
                                <div
                                    @click="frequenciesDrawerVisible = true; drawerRecord = record"
                                    class="cursor-pointer"
                                >
                                    <template v-if="record.expanded">
                                        <div class="text-purple">
                                            <div v-if='record.gnomAD_genome_ALL !== "."'>
                                                {{record.gnomAD_genome_ALL}}
                                            </div>
                                            <div v-if='record.gnomAD_exome_ALL !== "."'>
                                                {{record.gnomAD_exome_ALL}}
                                            </div>
                                            <div v-if='record.ExAC_ALL !== "."'>
                                                {{record.ExAC_ALL}}
                                            </div>
                                            <div v-if='record["1000g2015aug_all"] !== "."'>
                                                {{record['1000g2015aug_all']}}
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <template v-if="getValidFrequencies(record).length > 0">
                                            <div class="text-purple">
                                                {{getValidFrequencies(record)[0].value}}
                                            </div>
                                            <div v-if="getValidFrequencies(record).length > 1" class="row">
                                                <div class="col-9 text-purple">
                                                    {{getValidFrequencies(record)[1].value}}
                                                </div>
                                                <div
                                                    class="col-2 text-primary cursor-pointer"
                                                    v-if="getValidFrequencies(record).length > 2"
                                                    @click="record.expanded = !record.expanded"
                                                >
                                                    +{{getValidFrequencies(record).length - 2}}
                                                </div>
                                            </div>
                                        </template>
                                    </template>
                                </div>
                            </template>

                            <template v-if="column.dataIndex === 'HPO'">
                                <template v-if="record.expanded">
                                    <template v-for="hpo in record.HPO" :key="hpo">
                                        <a-tooltip :title="record.HPO[1]"
                                            ><div>{{hpo}}</div></a-tooltip
                                        >
                                    </template>
                                </template>
                                <template v-else>
                                    <a-tooltip :title="record.HPO[0]">{{record.HPO[0]}}</a-tooltip>
                                    <div v-if="record.HPO.length > 1">
                                        <a-tooltip :title="record.HPO[1]"
                                            ><div class="col-9">{{record.HPO[1]}}</div></a-tooltip
                                        >
                                        <div
                                            class="col-2 text-primary cursor-pointer"
                                            v-if="record.HPO.length > 2"
                                            @click="record.expanded = !record.expanded"
                                        >
                                            +{{record.HPO.length - 2}}
                                        </div>
                                    </div>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'Software_Prediction_result'">
                                <q-linear-progress :value="Number(record.Software_Prediction_result)" size="10px" />
                                {{record.Software_Prediction_result}}
                                <template v-if="record.expanded">
                                    <div>
                                        <wes-radar :record="record" />
                                    </div>
                                </template>
                            </template>

                            <template v-if="column.dataIndex === 'operation'">
                                <q-btn
                                    :label="$t('View')"
                                    color="primary"
                                    size="md"
                                    flat
                                    padding="xs"
                                    @click="clickIgv(record)"
                                />
                            </template>
                            <!--                            <template v-else>-->
                            <!--                                <a-tooltip v-if="column.ellipsis" color="#3b4146" :title="record[column.dataIndex]">-->
                            <!--                                    <div>{{ record[column.dataIndex] }}</div>-->
                            <!--                                </a-tooltip>-->
                            <!--                            </template>-->
                        </template>
                    </a-table>
                </div>
            </template>
        </q-splitter>
    </div>

    <q-dialog class="q-py-sm" v-model="dialogVisible">
        <q-card style="max-width: 70vw;max-height: 90vh">
            <q-card-section>
                <MutationInfo
                    :row="currentRow"
                    :task="props.task"
                    :samples="props.samples"
                    :headers="props.header"
                ></MutationInfo>
            </q-card-section>
            <q-card-actions align="center" vertical>
                <q-btn :label="$t('Close')" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="igvVisible">
        <q-card class="full-width" style="width:90vw;height: 90vh;max-width: 99vw;max-height: 99vh">
            <Igv :taskId="props.task.id" :file="igvFile" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="verdictData.visible">
        <q-card class="q-pa-sm" style="width:50vw;height: 55vh;">
            <q-card-section>
                <div class="text-primary">{{verdictData.record.geneIdentifier}}</div>
            </q-card-section>
            <q-card-section>
                <q-option-group v-model="verdictData.verdict" type="checkbox" :options="verdictData.options" />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn :label='$t("Confirm")' @click="onVerdictConfirm()" color="primary" />
                <q-btn :label='$t("Cancel")' color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
    <a-drawer
        :get-container="false"
        title="Frequencies"
        placement="bottom"
        :closable="true"
        @close="frequenciesDrawerVisible = false"
        :visible="frequenciesDrawerVisible"
        v-if="frequenciesDrawerVisible"
    >
        <div class="row">
            <template v-for="p in Object.getOwnPropertyNames(populations)" :key="p">
                <div class="col-4">
                    <span class="text-primary">{{p}} :</span> {{drawerRecord[populations[p]]}}
                </div>
            </template>
        </div>
    </a-drawer>
</template>
<script setup>
import { ref, onMounted, toRef, toRefs, watch, computed, onUnmounted } from 'vue'
import MutationInfo from './MutationInfo'
import { useComparatorOptions } from 'src/utils/comparator'
import Igv from './Igv'
import Cmp from './Comparator.vue'
import { readTaskFile, readTaskMuFile } from 'src/api/task'
import { getCsvHeader, getCsvData } from 'src/utils/csv'
import { useRoute } from 'vue-router'
import { errorMessage, infoMessage } from 'src/utils/notify'
import { getDualIdentifiers } from "src/utils/samples"
import { useI18n } from 'vue-i18n'
import {populations, useCustomCell, WES_PARAMS} from './index'
import WesRadar from './components/WesRadar.vue'
import { setVerdictResult } from 'src/api/verdict'
import { getCurrentUsername } from 'src/utils/user'

const { t } = useI18n()
const { options: comparatorOptions, compare } = useComparatorOptions()
const splitterModel = ref(300)
const emit = defineEmits(['filterChange'])


const props = defineProps({
    samples: {
        type: Array,
        required: false,
        default: () => [],
    },
    task: {
        type: Object,
        required: false,
    },
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
    rows: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    header: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    options: {
        type: Object,
        required: false,
        default() {
            return {
                mutationPosition: [],
                mutationMeaning: [],
                mutationRisk: [],
            }
        },
    },
    searchParams: {
        type: Object,
        required: false,
        default() { return {...WES_PARAMS }}
    },
    drugRows: {
        type: Array,
        required: false,
        default() {
            return []
        },
    },
    selectedRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    selectedDefaultRows: {
        type: Array,
        required: false,
        default: () => [],
    },
    defaultReportRows: {
        type: Array,
        required: false,
        default: () => [],
    },
})
const route = useRoute()
const igvVisible = ref(false)
const verdictData = ref({
    visible: false,
    record: null,
    verdict: [],
    options: [
        {
            label: 'Pathogenic',
            value: 'pathogenic',
        },
        {
            label: 'Likely pathogenic',
            value: 'likely_pathogenic',
        },
        {
            label: 'VUS++',
            value: 'vus++',
        },
        {
            label: 'VUS+',
            value: 'vus+',
        },
        {
            label: 'VUS',
            value: 'vus',
        },
        {
            label: 'Likely benign',
            value: 'likely_benign',
        },
        {
            label: 'Benign',
            value: 'benign',
        }
    ]
})
const verdictRecord = ref(null)
const igvFile = ref(null)
const dialogVisible = ref(false)
const innerSearchParams = ref({...WES_PARAMS})
const frequenciesDrawerVisible = ref(false)
const drawerRecord = ref(null)


const showDrawer = ref(false)

const loading = ref(false)
const { rows, drugRows, header } = toRefs(props)
const propSelectedRows = toRef(props, 'selectedRows')
const propSelectedDefaultRows = toRef(props, 'selectedDefaultRows')
const showSticky = toRef(props, 'showSticky')
const stickDone = toRef(props, 'stickDone')
const filteredRows = ref([])

const currentRow = ref({})


const isDefineReport = computed(() => useRoute().name === 'defineReport')
const rowSelection = computed(() => {
        if (!isDefineReport.value) {
            return null
        }
        return {
            selectedRowKeys: selectedRows,
            onChange: onSelectChange,
            columnWidth: 35,
            getCheckboxProps: getCheckboxProps
        }
    }
)


const scrollX = computed(() => {
    return 2000
})


const atOptionGroupChange = () => {
    console.log('atOptionGroupChange', selectedExpandColIdx)
}

const columns = computed(() => {
    return [
        { title: 'Gene Info', dataIndex: `geneInfo`, width: 180, align: 'center', ellipsis: true     },
        { title: 'Genotype & Quality', dataIndex: `genoTypeQuality`, width: 170, ellipsis: true     },
        { title: 'Gene Related Diseases', dataIndex: `Gene_Related_Diseases`, width: 100, ellipsis: true     },
        { title: 'User Verdict', dataIndex: `userVerdict`, width: 100, ellipsis: true     },
        { title: 'ACMG', dataIndex: `ACMG_result`, width: 110, ellipsis: true     },

        { title: 'Clinvar', dataIndex: `Clinvar`, width: 80, ellipsis: true     },
        { title: 'Frequencies', dataIndex: `Frequencies`, width: 80, ellipsis: true     },
        { title: 'Related HPOs', dataIndex: `HPO`, width: 130, ellipsis: true     },
        { title: 'Software Prediction', dataIndex: `Software_Prediction_result`, width: 220, ellipsis: true     },
        { title: 'IGV', dataIndex: `operation`, width: 80, ellipsis: true     },
    ]

})

function showVerdictDlg(record) {
    verdictData.value.visible = true
    verdictData.value.record = record
    verdictData.value.verdict = record.userVerdict || []
}

function onVerdictConfirm() {
    const username = getCurrentUsername()
    setVerdictResult(username, verdictData.value.record.geneIdentifier, verdictData.value.verdict)

    verdictData.value.record.userVerdict = verdictData.value.verdict
    verdictData.value.visible = false
}

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


function clickIgv (record) {
    currentRow.value = record
    igvFile.value = `Mut_WES/igv/${record.Chr}_${record.Start}_${record.End}.igv`
    igvVisible.value = true
}

const customRow = (record, index) => {
    return {
        // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
        style: {
            // 'background-color': record.expanded  ? '#e3e9f5' : 'white',
            // 字体颜色
            // 'color': record.id === physicalSurveyCurrRowId.value ? 'orange' : 'rgba(0, 0, 0, 0.65)',
            // 行背景色
            // 'background-color': record.col250 === 'Y'  ? '#FFFF99' : 'white',
            // 'background-color': record.col250 === 'Y'  ? '#1976d2' : 'white',
            // 'border-color': 'red',
            // 'border-style': 'solid',
            // 'border-width': '5px',
            // // 字体类型
            // 'font-family': 'Microsoft YaHei',
            // // 下划线
            // 'text-decoration': 'underline',
            // // 字体样式-斜体
            // 'font-style': 'italic',
            // // 字体样式-斜体
            // 'font-weight': record.id === clickedRow.value  ? 'bolder' : 'none'
        },
        // 鼠标单击行
        // onClick: event => {
        //     // 记录当前点击的行标识
        //     if (currentRow.value.id === record.id) {
        //         currentRow.value = {}
        //     } else {
        //         currentRow.value = record
        //     }
        // }
    }
}

const reset = () => {
    innerSearchParams.value = { ...WES_PARAMS }
    search()
}


// 根据过滤条件筛选数据
const searchFilterRows = (searchParams) => {
    filteredRows.value = rows.value.filter((line, i) => {
        let param = searchParams.diseaseCategories
        if (param && param.length > 0) {
            let matched = false
            if (param.includes('A') && ['IA', 'IIA', 'IIIA'].includes(line.Class)) {
                matched = true
            }
            if (param.includes('B') && ['IB', 'IIB', 'IIIB'].includes(line.Class)) {
                matched = true
            }
            if (param.includes('C') && ['Others', 'IV', 'V'].includes(line.Class)) {
                matched = true
            }
            if (!matched) {
                return false
            }
        }

        let phenoTypes = searchParams.phenoType
        if (phenoTypes && phenoTypes.length > 0 ) {
            if (phenoTypes.every(pt => !line.HPO.includes(pt))) {
                return false
            }
        }

        let diseases = searchParams.diseases
        if (diseases && diseases.length > 0 ) {
            if (diseases.every(pt => line.Gene_Related_Diseases.every(grd => !grd.includes(pt)))) {
                return false
            }
        }

        let modes = searchParams.diseaseInheritanceModes
        if (modes && modes.length > 0 ) {
            if (modes.every(m => line.Gene_Related_Diseases.every(grd => !grd.includes(m)))) {
                return false
            }
        }

        let genes = searchParams.gene
        if (genes && genes.length > 0  && genes.every(gene => gene !== line['Gene.refGene'])) {
            return false
        }

        let tiers = searchParams.prioritizationTier
        if (tiers && tiers.length > 0  && tiers.every(tier => tier !== line.Class)) {
            return false
        }

        let acmgs = searchParams.acmgPathogenicity
        if (acmgs && acmgs.length > 0  && acmgs.every(acmg => acmg !== line.ACMG_result)) {
            return false
        }

        let clinvars = searchParams.clinvarPathogenicity
        if (clinvars && clinvars.length > 0  && clinvars.every(clinvar => clinvar !== line.Clinvar)) {
            return false
        }

        let frequencies = searchParams.populationAlleleFrequency
        const pafComp = searchParams.pafComp
        let pafValue = searchParams.pafValue
        if (frequencies && frequencies.length > 0 && pafValue) {
            const matched = frequencies.every(fq => {
                const col = populations[fq]
                const colValue = line[col]
                return compare(pafComp, colValue, pafValue/100)
            })

            if (!matched) {
                return false
            }
        }

        let genoType = searchParams.genoType
        if (genoType  && genoType !== line.Genotype) {
            return false
        }

        let seqQuality = searchParams.seqQuality
        if (seqQuality  && seqQuality !== line.Depth_Quality) {
            return false
        }

        let genoTypeComp = searchParams.genoTypeComp
        let genoTypeValue = searchParams.genoTypeValue
        if (genoTypeComp  && genoTypeValue !== null) {
            const v = line.Genotype_Quality
            if (v === '-') {
                return false
            }
            if (!compare(genoTypeComp, Number(v), genoTypeValue)) {
                return false
            }
        }

        let variantQualityComp = searchParams.variantQualityComp
        let variantQualityValue = searchParams.variantQualityValue
        if (variantQualityComp && variantQualityValue !== null) {
            const v = line.Variant_Quality
            if (v === '-') {
                return false
            }
            if (!compare(variantQualityComp, Number(v), variantQualityValue)) {
                return false
            }
        }

        let seqDepthComp = searchParams.seqDepthComp
        let seqDepthValue = searchParams.seqDepthValue
        if (seqDepthComp && seqDepthValue !== null) {
            const v = line.Seq_Depths_
            if (v === '-') {
                return false
            }
            if (!compare(seqDepthComp, Number(v), seqDepthValue)) {
                return false
            }
        }

        let minAlleleFraction = searchParams.minAlleleFraction
        if (minAlleleFraction  && minAlleleFraction/100 > Number(line.Mutation_Rate_)) {
            return false
        }

        let maxAlleleFraction = searchParams.maxAlleleFraction
        if (maxAlleleFraction  && maxAlleleFraction/100 < Number(line.Mutation_Rate_)) {
            return false
        }

        return true
    })
}
const search = () => {
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    searchFilterRows(innerSearchParams.value)
    selectedRows.value = selectedDefaultRows.value
    // filterChange()
    console.log(selectedRows.value)
    if(showSticky.value){
        if(propSelectedDefaultRows.value.length>0 ){
            if(selectedRows.value.length>0){
                infoMessage(`${selectedRows.value.length} ${t('DefineReportSelectAlertMessage')}`)
            }else if(filteredRows.value.length > 0 && filteredRows.value.length !== rows.value.length){
                infoMessage(`${filteredRows.value.length} ${t('DefineReportSelectAlertMessage')}`)
            }
        }else if(filteredRows.value.length > 0 && filteredRows.value.length !== rows.value.length){
            infoMessage(`${filteredRows.value.length} ${t('DefineReportSelectAlertMessage')}`)
        }
    }

}

watch(rows, (rows) => {
    loadTable()
})

const tableFile = computed(() => {
    const ret = getDualIdentifiers(props.samples)
    return `igv${props.task.result_dir}/Mut_WES/${ret.qt}.Mut_WES.txt`
})

const tableFileName = computed(() => {
    const ret = getDualIdentifiers(props.samples)
    return `${ret.qt}.Mut_WES.txt`
})

onMounted(() => {
    loadTable()
})

const propSearchParams = toRef(props, 'searchParams')
const actionTitle = computed(() => t('Operate'))

// 加载表格数据
const loadTable = () => {
    rows.value.forEach(row => { row.expanded = false })
    filteredRows.value = rows.value
    loading.value = false
    console.log('====> wes rows', filteredRows.value)
    // columns.value.forEach((col) => (col.title = header.value[col.i - 1]))
    // const actionColumn = columns.value[columns.value.length - 1]
    // actionColumn.title = actionTitle
    // actionColumn.width = 105
    //
    // innerSearchParams.value = Object.assign(innerSearchParams.value, propSearchParams.value)
    // searchFilterRows(propSearchParams.value)
    // selectedRows.value = []
    // selectedDefaultRows.value = []
    //
    // for (let item of filteredRows.value) {
    //     let finded = false
    //     for (let lineNumber of propSelectedRows.value) {
    //         if (lineNumber === item.lineNumber) {
    //             finded = true
    //             break
    //         }
    //     }
    //     if (finded) {
    //         selectedRows.value.push(item.lineNumber)
    //     }
    // }
    // for (let item of filteredRows.value) {
    //     let finded = false
    //     for (let lineNumber of propSelectedDefaultRows.value) {
    //         if (lineNumber === item.lineNumber) {
    //             finded = true
    //             break
    //         }
    //     }
    //     if (finded) {
    //         selectedRows.value.push(item.lineNumber)
    //         selectedDefaultRows.value.push(item.lineNumber)
    //     }
    // }

    // filterChange()
}
const selectedRows = ref([])
const selectedDefaultRows = ref([])

const getValidFrequencies = (record) => {
    const frequencies = [
        { name: 'gnomAD_genome_ALL', value: record.gnomAD_genome_ALL },
        { name: 'gnomAD_exome_ALL', value: record.gnomAD_exome_ALL },
        { name: 'ExAC_ALL', value: record.ExAC_ALL },
        { name: '1000g2015aug_all', value: record['1000g2015aug_all'] }
    ];
    return frequencies.filter(freq => freq.value !== '.');
}

const onSelectChange = (selectedRowKeys) => {
    if (showSticky.value && stickDone.value) {
        errorMessage(t('DefineReportUnlockReuired'))
        return false
    }
    selectedRows.value = selectedRowKeys
    selectedDefaultRows.value=[]
    for(let item of selectedRowKeys){
        let finded = false
        for (let lineNumber of propSelectedDefaultRows.value) {
            if (lineNumber === item) {
                finded = true
                break
            }
        }
        if (finded) {
            selectedDefaultRows.value.push(item)
        }
    }
    console.log(selectedDefaultRows)
    // filterChange()
}
const getCheckboxProps = (record) => {
    return {
        disabled: showSticky.value && stickDone.value, // Column configuration not to be checked
        name: String(record.lineNumber),
    }
}

onUnmounted(() => {
    filterChange()
})


const getChangedData = () => {
    let filtered = true
    if (filteredRows.value.length === rows.value.length) {
        filtered = false
    }
    let selected = true
    if (selectedRows.value.length === 0) {
        selected = false
    }
    return {
        searchParams: innerSearchParams.value,
        selectedRows: selectedRows.value,
        selectedDefaultRows: selectedDefaultRows.value,
        filtered: filtered,
        selected: selected,
    }
}
const filterChange = () => {
    emit('filterChange', getChangedData())
}
defineExpose({ getChangedData, })
</script>

<style lang="scss" scoped>
/*//点击行的样式*/
.clickRowStyl {
    background-color: #bbbbff !important;
    font-size: 20px;
}

/*//偶数行的样式*/
.evenRowStyl {
    background-color: #aad4fd46 !important;
}

.ant-table-tbody>tr:hover:not(.ant-table-expanded-row)>td {
    background: #ffefbb;
}

/*//鼠标移入样式*/
.ant-table-tbody>tr:hover>td {
    background: #ffefbb !important;
}

.ant-table-selection-column #select-info {
    position: absolute;
    top: 5px;
    right: -55px;
    width: 150px;
    display: none;
    z-index: 99999;
}

.ant-table-selection-column:hover #select-info {
    display: block;
}

.q-tab-panel {
    padding: 0 !important;
}
</style>

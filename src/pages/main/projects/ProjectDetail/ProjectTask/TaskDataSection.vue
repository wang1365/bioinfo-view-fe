<template>
    <div>
        <div v-if="sampleType === 'single'">
            <div
                class="row q-mb-sm q-px-sm shadow-1 items-center"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <div class="col-auto" v-if="!file.sampleFirst?.id">
                    <q-btn icon="add" color="primary" dense outline round @click="$emit('select-single', fileIndex)" />
                </div>
                <div class="col-auto" v-if="file.sampleFirst?.id">
                    <q-btn icon="delete" color="red" dense outline round @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col">
                    <q-chip
                        v-if="file.sampleFirst?.identifier"
                        class="glossy"
                        outline
                        dense
                        color="primary"
                        text-color="white"
                    >
                        {{ file.sampleFirst?.identifier }}
                    </q-chip>
                    <div v-if="file.sampleFirst?.fastq1_path" class="q-ml-xs text-grey-7">
                        {{ file.sampleFirst.fastq1_path }}
                    </div>
                    <div v-if="file.sampleFirst?.fastq2_path" class="q-ml-xs text-grey-7">
                        {{ file.sampleFirst.fastq2_path }}
                    </div>
                    <span
                        v-if="file.sampleFirstError"
                        class="text-red text-bold"
                        >{{ `${$t('Data')} ${$t('Required')}` }}</span
                    >
                </div>
            </div>
        </div>

        <div v-if="sampleType === 'double'">
            <div
                class="row q-my-sm q-pa-sm shadow-1 items-center"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <div class="col-auto" v-if="!file.sampleFirst?.id">
                    <q-btn icon="add" color="primary" dense outline round @click="$emit('select-first', fileIndex)" />
                </div>
                <div class="col-auto" v-if="!file.sampleSecond?.id">
                    <q-btn icon="add" color="secondary" dense outline @click="$emit('select-second', fileIndex)" />
                </div>
                <div class="col-auto" v-if="file.sampleFirst?.id || file.sampleSecond?.id">
                    <q-btn icon="delete" color="red" dense round @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col">
                    <q-chip
                        v-if="file.sampleFirst?.identifier"
                        class="glossy q-mr-sm"
                        outline
                        dense
                        color="primary"
                        text-color="white"
                    >
                        {{ file.sampleFirst?.identifier }}
                    </q-chip>
                    <div v-if="file.sampleFirst?.fastq1_path" class="q-ml-xs text-grey-7">
                        {{ file.sampleFirst.fastq1_path }}
                    </div>
                    <div v-if="file.sampleFirst?.fastq2_path" class="q-ml-xs text-grey-7">
                        {{ file.sampleFirst.fastq2_path }}
                    </div>
                    <q-chip
                        v-if="file.sampleSecond?.identifier "
                        class="glossy q-ml-sm"
                        color="secondary"
                        text-color="white"
                    >
                        {{ file.sampleSecond?.identifier}}
                    </q-chip>
                    <div v-if="file.sampleSecond?.fastq1_path" class="q-ml-xs text-grey-7">
                        {{ file.sampleSecond.fastq1_path }}
                    </div>
                    <div v-if="file.sampleSecond?.fastq2_path" class="q-ml-xs text-grey-7">
                        {{ file.sampleSecond.fastq2_path }}
                    </div>
                    <span
                        v-if="file.sampleFirstError || file.sampleSecondError"
                        class="text-red text-bold"
                        >{{ `${$t('Data')} ${$t('Required')}` }}</span
                    >
                </div>
            </div>
        </div>

        <div v-if="sampleType === 'multiple'">
            <div
                class="row q-my-sm q-pa-sm shadow-1 items-start"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <div class="col-auto" v-if="!file.samples || file.samples.length === 0">
                    <q-btn icon="add" color="primary" dense outline round @click="$emit('select-multi', fileIndex)" />
                </div>
                <div class="col-auto" v-if="file.samples && file.samples.length > 0">
                    <q-btn icon="delete" color="red" dense outline round @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col">
                    <template v-for="(sample, i) in file.samples" :key="sample.id">
                        <div class="row q-gutter-sm content-center q-mb-sm">
                            <div class="col-auto">
                                <q-chip class="glossy" outline dense color="primary" text-color="white">
                                    {{ sample.identifier }}
                                </q-chip>
                                <div v-if="sample.fastq1_path" class="q-ml-xs text-grey-7">
                                    {{ sample.fastq1_path }}
                                </div>
                                <div v-if="sample.fastq2_path" class="q-ml-xs text-grey-7">
                                    {{ sample.fastq2_path }}
                                </div>
                            </div>
                            <q-input
                                class="col-3"
                                stack-label
                                :label="$t('SampleName')"
                                label-color="purple"
                                dense
                                filled
                                v-model="file.sampleDetails[i].customName"
                            />
                            <q-input
                                class="col-3"
                                stack-label
                                :label="$t('SampleRatio')"
                                label-color="purple"
                                dense
                                filled
                                v-model.number="file.sampleDetails[i].sampleRatio"
                                v-if="supportSampleRatio"
                            />
                        </div>
                    </template>
                    <span
                        v-if="file.samplesError"
                        class="text-red text-bold"
                        >{{ `${$t('Data')} ${$t('Required')}` }}</span
                    >
                </div>
            </div>
        </div>

        <div v-if="sampleType === 'double_multiple'">
            <div
                class="row q-my-sm q-pa-sm shadow-1 items-center"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <div class="col-auto" v-if="!file.samplesFirst || file.samplesFirst.length === 0">
                    <q-btn icon="add" color="primary" dense round @click="$emit('select-first-multi', fileIndex)" />
                </div>
                <div class="col-auto" v-if="!file.samplesSecond || file.samplesSecond.length === 0">
                    <q-btn icon="add" color="secondary" dense round @click="$emit('select-second-multi', fileIndex)" />
                </div>
                <div
                    class="col-auto"
                    v-if="(file.samplesFirst && file.samplesFirst.length > 0) || (file.samplesSecond && file.samplesSecond.length > 0)"
                >
                    <q-btn icon="delete" color="red" dense round @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col-6">
                            <template v-for="sample in file.samplesFirst" :key="sample.id">
                                <q-chip class="glossy q-mr-sm" color="primary" text-color="white">
                                    {{ sample.identifier || sample.sample_identifier }}
                                </q-chip>
                                <div v-if="sample.fastq1_path" class="q-ml-xs text-grey-7">
                                    {{ sample.fastq1_path }}
                                </div>
                                <div v-if="sample.fastq2_path" class="q-ml-xs text-grey-7">
                                    {{ sample.fastq2_path }}
                                </div>
                            </template>
                        </div>
                        <div class="col-6">
                            <template v-for="sample in file.samplesSecond" :key="sample.id">
                                <q-chip class="glossy q-mr-sm" color="secondary" text-color="white">
                                    {{ sample.identifier || sample.sample_identifier }}
                                </q-chip>
                                <div v-if="sample.fastq1_path" class="q-ml-xs text-grey-7">
                                    {{ sample.fastq1_path }}
                                </div>
                                <div v-if="sample.fastq2_path" class="q-ml-xs text-grey-7">
                                    {{ sample.fastq2_path }}
                                </div>
                            </template>
                        </div>
                    </div>
                    <span
                        v-if="file.samplesFirstError || file.samplesSecondError"
                        class="text-red text-bold"
                        >{{ `${$t('Data')} ${$t('Required')}` }}</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  files: { type: Array, required: true },
  sampleType: { type: String, required: true },
  supportSampleRatio: { type: Boolean, default: false }
})

defineEmits([
  'select-single',
  'select-first',
  'select-second',
  'select-multi',
  'select-first-multi',
  'select-second-multi',
  'delete-file',
  'add-file'
])

useI18n()
</script>

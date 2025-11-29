<template>
    <div>
        <div v-if="sampleType === 'single'">
            <div
                class="row q-my-sm q-pa-sm shadow-1 items-center relative-position"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge
                    class="absolute-top-right q-mr-sm q-mt-xs"
                    color="primary"
                    text-color="white"
                    rounded
                    :label="fileIndex + 1"
                />
                <div class="col-auto" v-if="!file.sampleFirst?.id">
                    <q-btn icon="add" color="primary" dense outline round @click="$emit('select-single', fileIndex)" />
                </div>
                <div class="col-auto" v-if="file.sampleFirst?.id">
                    <q-btn icon="delete" color="red" dense outline round @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col row q-gutter-xs">
                    <div class="col row bg-grey-3">
                        <q-chip
                            v-if="file.sampleFirst?.identifier"
                            class="col-2 glossy q-mr-sm"
                            outline
                            flat
                            dense
                            color="primary"
                            text-color="white"
                        >
                            {{ file.sampleFirst?.identifier }}
                        </q-chip>
                        <div class="col q-ml-xs">
                            <div v-if="file.sampleFirst?.fastq1_path" class="text-grey-7">
                                {{ file.sampleFirst.fastq1_path }}
                            </div>
                            <div v-if="file.sampleFirst?.fastq2_path" class="text-grey-7">
                                {{ file.sampleFirst.fastq2_path }}
                            </div>
                        </div>
                        <span
                            v-if="file.sampleFirstError"
                            class="text-red text-bold"
                            >{{ `${$t('Data')} ${$t('Required')}` }}</span
                        >
                    </div>
                </div>
            </div>
        </div>

        <div v-if="sampleType === 'double'">
            <div
                class="row q-my-sm q-pa-sm shadow-1 items-center relative-position"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge
                    class="absolute-top-right q-mr-sm q-mt-xs"
                    color="primary"
                    text-color="white"
                    rounded
                    :label="fileIndex + 1"
                />
                <div class="col-auto" v-if="!file.sampleFirst?.id">
                    <q-btn icon="add" color="primary" dense outline round @click="$emit('select-first', fileIndex)" />
                </div>

                <div class="col-auto" v-if="file.sampleFirst?.id || file.sampleSecond?.id">
                    <q-btn icon="delete" color="red" dense round @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col row q-gutter-xs">
                    <div class="col row bg-grey-3">
                        <q-chip
                            v-if="file.sampleFirst?.identifier"
                            class="col-2 glossy q-mr-sm"
                            outline
                            flat
                            dense
                            color="primary"
                            text-color="white"
                        >
                            {{ file.sampleFirst?.identifier }}
                        </q-chip>
                        <div class="col q-ml-xs">
                            <div v-if="file.sampleFirst?.fastq1_path" class="text-grey-7">
                                {{ file.sampleFirst.fastq1_path }}
                            </div>
                            <div v-if="file.sampleFirst?.fastq2_path" class="text-grey-7">
                                {{ file.sampleFirst.fastq2_path }}
                            </div>
                        </div>
                    </div>
                    <div class="col row q-pl-xs bg-grey-3">
                        <div class="col-1" v-if="!file.sampleSecond?.id">
                            <q-btn
                                icon="add"
                                color="secondary"
                                dense
                                outline
                                @click="$emit('select-second', fileIndex)"
                            />
                        </div>
                        <q-chip
                            v-if="file.sampleSecond?.identifier "
                            class="glossy q-ml-sm"
                            flat
                            outline
                            color="secondary"
                            text-color="white"
                        >
                            {{ file.sampleSecond?.identifier}}
                        </q-chip>
                        <div class="col q-ml-xs">
                            <div v-if="file.sampleSecond?.fastq1_path" class="q-ml-xs text-grey-7">
                                {{ file.sampleSecond.fastq1_path }}
                            </div>
                            <div v-if="file.sampleSecond?.fastq2_path" class="q-ml-xs text-grey-7">
                                {{ file.sampleSecond.fastq2_path }}
                            </div>
                        </div>
                        <span
                            v-if="file.sampleFirstError || file.sampleSecondError"
                            class="text-red text-bold"
                            >{{ `${$t('Data')} ${$t('Required')}` }}</span
                        >
                    </div>
                </div>
            </div>
        </div>

        <div v-if="sampleType === 'multiple'">
            <div
                class="row q-my-sm q-pa-sm shadow-1 items-center relative-position"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge
                    class="absolute-top-right q-mr-sm q-mt-xs"
                    color="primary"
                    text-color="white"
                    rounded
                    :label="fileIndex + 1"
                />
                <div class="col-auto" v-if="!file.samples || file.samples.length === 0">
                    <q-btn icon="add" color="primary" dense outline round @click="$emit('select-multi', fileIndex)" />
                </div>
                <div class="col-auto" v-if="file.samples && file.samples.length > 0">
                    <q-btn icon="delete" color="red" dense outline round @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col">
                    <template v-for="(sample, i) in file.samples" :key="sample.id">
                        <div class="row q-gutter-sm items-center q-mb-sm">
                            <div class="col row bg-grey-3">
                                <q-chip
                                    class="col-2 glossy q-mr-sm"
                                    outline
                                    flat
                                    dense
                                    color="primary"
                                    text-color="white"
                                >
                                    {{ sample.identifier || sample.sample_identifier }}
                                </q-chip>
                                <div class="col q-ml-xs">
                                    <div v-if="sample.fastq1_path" class="text-grey-7">
                                        {{ sample.fastq1_path }}
                                    </div>
                                    <div v-if="sample.fastq2_path" class="text-grey-7">
                                        {{ sample.fastq2_path }}
                                    </div>
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
                class="row q-my-sm q-pa-sm shadow-1 items-center relative-position"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge
                    class="absolute-top-right q-mr-sm q-mt-xs"
                    color="primary"
                    text-color="white"
                    rounded
                    :label="fileIndex + 1"
                />
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

<template>
    <div class="q-mb-xs">
        <div v-if="sampleType === 'single'">
            <div
                class="row q-my-sm items-center relative-position bg-grey-3"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge class="absolute-top-right" color="primary" text-color="white" rounded :label="fileIndex + 1" />
                <div class="col-auto" v-if="!file.sampleFirst?.id">
                    <q-btn icon="add" color="primary" dense outline flat @click="$emit('select-single', fileIndex)" />
                </div>
                <div class="col-auto" v-if="file.sampleFirst?.id">
                    <q-btn icon="delete" color="red" dense outline flat @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col row q-gutter-xs">
                    <div class="col row bg-grey-3">
                        <q-chip
                            v-if="file.sampleFirst?.identifier"
                            class="col-2 glossy q-mr-sm"
                            outline
                            flat
                            dense
                            :color="file.sampleFirst?.notFound ? 'red' : 'primary'"
                            :text-color="file.sampleFirst?.notFound ? 'white' : 'white'"
                        >
                            {{ file.sampleFirst?.identifier }}
                        </q-chip>
                        <span
                            v-if="file.sampleFirst?.notFound"
                            class="text-red text-bold"
                            >{{ $t('DataIdentifierNotFound') }}</span
                        >
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
                class="row q-my-sm items-center relative-position bg-grey-3"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge class="absolute-top-right" color="primary" text-color="white" rounded :label="fileIndex + 1" />
                <div class="col-auto">
                    <q-btn icon="add" color="primary" dense outline flat @click="$emit('select-first', fileIndex)" />
                    <q-btn icon="delete" color="red" dense outline flat @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col row q-gutter-xs">
                    <div class="col row bg-grey-3">
                        <q-chip
                            v-if="file.sampleFirst?.identifier"
                            class="col-2 glossy q-mr-sm"
                            outline
                            flat
                            dense
                            :color="file.sampleFirst?.notFound ? 'red' : 'primary'"
                            :text-color="file.sampleFirst?.notFound ? 'white' : 'white'"
                        >
                            {{ file.sampleFirst?.identifier }}
                        </q-chip>
                        <span
                            v-if="file.sampleFirst?.notFound"
                            class="text-red text-bold"
                            >{{ $t('DataIdentifierNotFound') }}</span
                        >
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
                        <div class="col-1">
                            <q-btn icon="add" color="primary" dense flat @click="$emit('select-second', fileIndex)" />
                        </div>
                        <q-chip
                            v-if="file.sampleSecond?.identifier "
                            flat
                            outline
                            :color="file.sampleSecond?.notFound ? 'red' : 'secondary'"
                            :text-color="file.sampleSecond?.notFound ? 'white' : 'white'"
                        >
                            {{ file.sampleSecond?.identifier}}
                        </q-chip>
                        <span
                            v-if="file.sampleSecond?.notFound"
                            class="text-red text-bold"
                            >{{ $t('DataIdentifierNotFound') }}</span
                        >
                        <div class="col q-ml-xs  text-grey-7">
                            <div v-if="file.sampleSecond?.fastq1_path">
                                {{ file.sampleSecond.fastq1_path }}
                            </div>
                            <div v-if="file.sampleSecond?.fastq2_path">
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
                class="row q-my-sm items-center relative-position bg-grey-3"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge class="absolute-top-right" color="primary" text-color="white" rounded :label="fileIndex + 1" />
                <div class="col-auto">
                    <q-btn icon="add" color="primary" dense flat @click="$emit('select-multi', fileIndex)" />
                    <q-btn icon="delete" color="red" dense flat @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col">
                    <template v-for="(sample, i) in file.samples" :key="sample.id">
                        <div class="row q-gutter-xs items-center">
                            <div class="col row bg-grey-3">
                                <q-chip
                                    class="col-2"
                                    outline
                                    flat
                                    dense
                                    :color="sample.notFound ? 'red' : 'primary'"
                                    :text-color="sample.notFound ? 'white' : 'white'"
                                >
                                    {{ sample.identifier || sample.sample_identifier }}
                                </q-chip>
                                <span
                                    v-if="sample.notFound"
                                    class="text-red text-bold"
                                    >{{ $t('DataIdentifierNotFound') }}</span
                                >
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
                class="row q-my-sm shadow-1 items-center bg-grey-3 relative-position"
                v-for="(file, fileIndex) in files"
                :key="fileIndex"
                :id="`${fileIndex}`"
            >
                <q-badge class="absolute-top-right" color="primary" text-color="white" rounded :label="fileIndex + 1" />
                <div class="col-auto" v-if="!file.samplesFirst || file.samplesFirst.length === 0">
                    <q-btn
                        icon="add"
                        color="primary"
                        dense
                        outline
                        flat
                        @click="$emit('select-first-multi', fileIndex)"
                    />
                </div>
                <div class="col-auto" v-if="!file.samplesSecond || file.samplesSecond.length === 0">
                    <q-btn
                        icon="add"
                        color="secondary"
                        dense
                        outline
                        flat
                        @click="$emit('select-second-multi', fileIndex)"
                    />
                </div>
                <div
                    class="col-auto"
                    v-if="(file.samplesFirst && file.samplesFirst.length > 0) || (file.samplesSecond && file.samplesSecond.length > 0)"
                >
                    <q-btn icon="delete" color="red" dense outline flat @click="$emit('delete-file', fileIndex)" />
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col-6">
                            <template v-for="sample in file.samplesFirst" :key="sample.id">
                                <q-chip
                                    class="glossy q-mr-sm"
                                    :color="sample.notFound ? 'red' : 'primary'"
                                    :text-color="sample.notFound ? 'white' : 'white'"
                                >
                                    {{ sample.identifier || sample.sample_identifier }}
                                </q-chip>
                                <span
                                    v-if="sample.notFound"
                                    class="text-red text-bold"
                                    >{{ $t('DataIdentifierNotFound') }}</span
                                >
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
                                <q-chip
                                    class="glossy q-mr-sm"
                                    :color="sample.notFound ? 'red' : 'secondary'"
                                    :text-color="sample.notFound ? 'white' : 'white'"
                                >
                                    {{ sample.identifier || sample.sample_identifier }}
                                </q-chip>
                                <span
                                    v-if="sample.notFound"
                                    class="text-red text-bold"
                                    >{{ $t('DataIdentifierNotFound') }}</span
                                >
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
import { defineProps, defineEmits, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  files: { type: Array, required: true },
  sampleType: { type: String, required: true },
  supportSampleRatio: { type: Boolean, default: false }
})

const emit = defineEmits([
  'select-single',
  'select-first',
  'select-second',
  'select-multi',
  'select-first-multi',
  'select-second-multi',
  'delete-file',
  'add-file',
  'bulk-import'
])

const { t } = useI18n()
</script>

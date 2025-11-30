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
                            class="text-red text-bold self-center"
                            >{{ $t('DataIdentifierNotFound') }}</span
                        >
                        <div class="col q-ml-xs column items-start">
                            <span
                                v-if="file.sampleFirst?.fastq1_path"
                                class="fastq-text"
                                :class="fastqTextClass(file.sampleFirst?.fastq1_warn, file.sampleFirst?.fastq1_ok)"
                            >
                                <q-icon
                                    v-if="file.sampleFirst?.fastq1_warn"
                                    name="warning"
                                    color="orange"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                <q-icon
                                    v-else-if="file.sampleFirst?.fastq1_ok"
                                    name="check_circle"
                                    color="green-8"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                {{ file.sampleFirst.fastq1_path }}
                                <FastqTooltip
                                    :info="file.sampleFirst?.fastq1_info"
                                    :warn="file.sampleFirst?.fastq1_warn"
                                />
                            </span>
                            <span
                                v-if="file.sampleFirst?.fastq2_path"
                                class="fastq-text q-mt-xs"
                                :class="fastqTextClass(file.sampleFirst?.fastq2_warn, file.sampleFirst?.fastq2_ok)"
                            >
                                <q-icon
                                    v-if="file.sampleFirst?.fastq2_warn"
                                    name="warning"
                                    color="orange"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                <q-icon
                                    v-else-if="file.sampleFirst?.fastq2_ok"
                                    name="check_circle"
                                    color="green-8"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                {{ file.sampleFirst.fastq2_path }}
                                <FastqTooltip
                                    :info="file.sampleFirst?.fastq2_info"
                                    :warn="file.sampleFirst?.fastq2_warn"
                                />
                            </span>
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
                            class="q-mr-sm self-center"
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
                            class="text-red text-bold self-center q-pl-sm"
                            >{{ $t('DataIdentifierNotFound') }}</span
                        >
                        <div class="col q-ml-xs column items-start">
                            <span
                                v-if="file.sampleFirst?.fastq1_path"
                                class="fastq-text"
                                :class="fastqTextClass(file.sampleFirst?.fastq1_warn, file.sampleFirst?.fastq1_ok)"
                            >
                                <q-icon
                                    v-if="file.sampleFirst?.fastq1_warn"
                                    name="warning"
                                    color="orange"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                <q-icon
                                    v-else-if="file.sampleFirst?.fastq1_ok"
                                    name="check_circle"
                                    color="green-8"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                {{ file.sampleFirst.fastq1_path }}
                                <FastqTooltip
                                    :info="file.sampleFirst?.fastq1_info"
                                    :warn="file.sampleFirst?.fastq1_warn"
                                />
                            </span>
                            <span
                                v-if="file.sampleFirst?.fastq2_path"
                                class="fastq-text q-mt-xs"
                                :class="fastqTextClass(file.sampleFirst?.fastq2_warn, file.sampleFirst?.fastq2_ok)"
                            >
                                <q-icon
                                    v-if="file.sampleFirst?.fastq2_warn"
                                    name="warning"
                                    color="orange"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                <q-icon
                                    v-else-if="file.sampleFirst?.fastq2_ok"
                                    name="check_circle"
                                    color="green-8"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                {{ file.sampleFirst.fastq2_path }}
                                <FastqTooltip
                                    :info="file.sampleFirst?.fastq2_info"
                                    :warn="file.sampleFirst?.fastq2_warn"
                                />
                            </span>
                        </div>
                    </div>
                    <q-separator vertical class="q-my-xs" />
                    <div class="col row bg-grey-3">
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
                            class="text-red text-bold self-center q-pl-sm"
                            >{{ $t('DataIdentifierNotFound') }}</span
                        >
                        <div class="col q-ml-xs column items-start">
                            <span
                                v-if="file.sampleSecond?.fastq1_path"
                                class="fastq-text"
                                :class="fastqTextClass(file.sampleSecond?.fastq1_warn, file.sampleSecond?.fastq1_ok)"
                            >
                                <q-icon
                                    v-if="file.sampleSecond?.fastq1_warn"
                                    name="warning"
                                    color="orange"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                <q-icon
                                    v-else-if="file.sampleSecond?.fastq1_ok"
                                    name="check_circle"
                                    color="green-8"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                {{ file.sampleSecond.fastq1_path }}
                                <FastqTooltip
                                    :info="file.sampleSecond?.fastq1_info"
                                    :warn="file.sampleSecond?.fastq1_warn"
                                />
                            </span>
                            <span
                                v-if="file.sampleSecond?.fastq2_path"
                                class="fastq-text q-mt-xs"
                                :class="fastqTextClass(file.sampleSecond?.fastq2_warn, file.sampleSecond?.fastq2_ok)"
                            >
                                <q-icon
                                    v-if="file.sampleSecond?.fastq2_warn"
                                    name="warning"
                                    color="orange"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                <q-icon
                                    v-else-if="file.sampleSecond?.fastq2_ok"
                                    name="check_circle"
                                    color="green-8"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                {{ file.sampleSecond.fastq2_path }}
                                <FastqTooltip
                                    :info="file.sampleSecond?.fastq2_info"
                                    :warn="file.sampleSecond?.fastq2_warn"
                                />
                            </span>
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
                class="row q-my-sm items-center relative-position bg-blue-grey-2"
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
                        <div class="row q-gutter-xs items-center bg-blue-grey-1 q-mt-xs">
                            <div class="col row">
                                <q-chip
                                    class="col-1"
                                    outline
                                    flat
                                    dense
                                    padding="1px"
                                    :color="sample.notFound ? 'red' : 'primary'"
                                    :text-color="sample.notFound ? 'white' : 'white'"
                                >
                                    {{ sample.identifier || sample.sample_identifier }}
                                </q-chip>
                                <q-input
                                    class="col-1"
                                    stack-label
                                    :label="$t('SampleName')"
                                    label-color="purple"
                                    dense
                                    filled
                                    padding="1px"
                                    v-model="file.sampleDetails[i].customName"
                                />
                                <q-input
                                    class="col-1"
                                    stack-label
                                    :label="$t('SampleRatio')"
                                    label-color="purple"
                                    dense
                                    filled
                                    v-model.number="file.sampleDetails[i].sampleRatio"
                                    v-if="supportSampleRatio"
                                />
                                <span
                                    v-if="sample.notFound"
                                    class="text-red text-bold self-center"
                                    >{{ $t('DataIdentifierNotFound') }}</span
                                >
                                <div class="col q-ml-xs column items-start">
                                    <span
                                        v-if="sample.fastq1_path"
                                        class="fastq-text"
                                        :class="fastqTextClass(sample.fastq1_warn, sample.fastq1_ok)"
                                    >
                                        <q-icon
                                            v-if="sample.fastq1_warn"
                                            name="warning"
                                            color="orange"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <q-icon
                                            v-else-if="sample.fastq1_ok"
                                            name="check_circle"
                                            color="green-8"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        {{ sample.fastq1_path }}
                                        <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                                    </span>
                                    <span
                                        v-if="sample.fastq2_path"
                                        class="fastq-text q-mt-xs"
                                        :class="fastqTextClass(sample.fastq2_warn, sample.fastq2_ok)"
                                    >
                                        <q-icon
                                            v-if="sample.fastq2_warn"
                                            name="warning"
                                            color="orange"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <q-icon
                                            v-else-if="sample.fastq2_ok"
                                            name="check_circle"
                                            color="green-8"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        {{ sample.fastq2_path }}
                                        <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                                    </span>
                                </div>
                            </div>
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
                                    class="text-red text-bold self-center"
                                    >{{ $t('DataIdentifierNotFound') }}</span
                                >
                                <div class="col q-ml-xs column items-start">
                                    <q-btn
                                        v-if="sample.fastq1_path"
                                        dense
                                        flat
                                        outline
                                        size="xs"
                                        :label="sample.fastq1_path"
                                        :text-color="sample.fastq1_ok ? 'black' : undefined"
                                        :color="sample.fastq1_warn ? 'orange' : (sample.fastq1_ok ? 'green-8' : 'grey-7')"
                                        :icon="sample.fastq1_warn ? 'warning' : (sample.fastq1_ok ? 'check_circle' : '')"
                                    >
                                        <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                                    </q-btn>
                                    <q-btn
                                        v-if="sample.fastq2_path"
                                        dense
                                        flat
                                        outline
                                        size="xs"
                                        :label="sample.fastq2_path"
                                        :text-color="sample.fastq2_ok ? 'black' : undefined"
                                        :color="sample.fastq2_warn ? 'orange' : (sample.fastq2_ok ? 'green-8' : 'grey-7')"
                                        :icon="sample.fastq2_warn ? 'warning' : (sample.fastq2_ok ? 'check_circle' : '')"
                                    >
                                        <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                                    </q-btn>
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
                                <div class="col q-ml-xs column items-start">
                                    <span
                                        v-if="sample.fastq1_path"
                                        class="fastq-text"
                                        :class="fastqTextClass(sample.fastq1_warn, sample.fastq1_ok)"
                                    >
                                        <q-icon
                                            v-if="sample.fastq1_warn"
                                            name="warning"
                                            color="orange"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <q-icon
                                            v-else-if="sample.fastq1_ok"
                                            name="check_circle"
                                            color="green-8"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        {{ sample.fastq1_path }}
                                        <FastqTooltip :info="sample.fastq1_info" :warn="sample.fastq1_warn" />
                                    </span>
                                    <span
                                        v-if="sample.fastq2_path"
                                        class="fastq-text q-mt-xs"
                                        :class="fastqTextClass(sample.fastq2_warn, sample.fastq2_ok)"
                                    >
                                        <q-icon
                                            v-if="sample.fastq2_warn"
                                            name="warning"
                                            color="orange"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        <q-icon
                                            v-else-if="sample.fastq2_ok"
                                            name="check_circle"
                                            color="green-8"
                                            size="14px"
                                            class="q-mr-xs"
                                        />
                                        {{ sample.fastq2_path }}
                                        <FastqTooltip :info="sample.fastq2_info" :warn="sample.fastq2_warn" />
                                    </span>
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
import FastqTooltip from './FastqTooltip.vue'

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
const fastqTextClass = (warn, ok) => {
  if (warn) return 'text-orange'
  if (ok) return 'text-black'
  return 'text-grey-7'
}
</script>

<style scoped>
.fastq-text {
  font-size: 12px;
}
</style>

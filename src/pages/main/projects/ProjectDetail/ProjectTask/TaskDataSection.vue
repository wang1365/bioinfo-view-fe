<template>
  <div>
    <div class="text-subtitle2">{{ $t('Data') + ':' }}</div>

    <div v-if="sampleType === 'single'">
      <div
        class="row q-mb-sm q-px-sm shadow-1"
        v-for="(file, fileIndex) in files"
        :key="fileIndex"
        :id="`${fileIndex}`"
      >
        <div class="col-5">
          <q-btn
            :label="`${$t('Select')}${$t('Data')}-1: ` + (file.sampleFirst?.identifier || '')"
            color="primary"
            style="width: 100%"
            dense
            @click="$emit('select-single', fileIndex)"
          />
        </div>
        <div class="col-2">
          <q-btn icon="delete" color="red" dense @click="$emit('delete-file', fileIndex)" />
        </div>
        <div class="col-5" v-if="file.sampleFirstError">
          <span class="text-red text-bold">{{ `${$t('Data')} ${$t('Required')}` }}</span>
        </div>
      </div>
    </div>

    <div v-if="sampleType === 'double'">
      <div
        class="row q-my-sm q-pa-sm shadow-1"
        v-for="(file, fileIndex) in files"
        :key="fileIndex"
        :id="`${fileIndex}`"
      >
        <div class="col-5">
          <q-btn
            :label="`${$t('Select')}${$t('Data')}-1: ` + (file.sampleFirst?.identifier || '')"
            color="primary"
            style="width: 99%"
            dense
            @click="$emit('select-first', fileIndex)"
          />
        </div>
        <div class="col-5">
          <q-btn
            :label="`${$t('Select')}${$t('Data')}-2: ` + (file.sampleSecond?.identifier || '')"
            color="secondary"
            style="width: 99%"
            dense
            @click="$emit('select-second', fileIndex)"
          />
        </div>
        <div class="col-2">
          <q-btn icon="delete" color="red" dense @click="$emit('delete-file', fileIndex)" />
        </div>
        <div class="col-6">
          <span v-if="file.sampleFirstError" class="text-red text-bold">{{ `${$t('Data')} ${$t('Required')}` }}</span>
        </div>
        <div class="col-6">
          <span v-if="file.sampleSecondError" class="text-red text-bold">{{ `${$t('Data')} ${$t('Required')}` }}</span>
        </div>
      </div>
    </div>

    <div v-if="sampleType === 'multiple'">
      <div
        class="row q-my-sm q-pa-sm shadow-1"
        v-for="(file, fileIndex) in files"
        :key="fileIndex"
        :id="`${fileIndex}`"
      >
        <div class="col-5">
          <q-btn
            :label="$t('Select') + $t('Data')"
            color="primary"
            dense
            style="width: 100%"
            @click="$emit('select-multi', fileIndex)"
          />
        </div>
        <div class="col-2">
          <q-btn icon="delete" color="red" dense @click="$emit('delete-file', fileIndex)" />
        </div>
        <div class="col-5" v-if="file.samplesError">
          <span class="text-red text-bold">{{ `${$t('Data')} ${$t('Required')}` }}</span>
        </div>

        <div class="col-12">
          <template v-for="(sample, i) in file.samples" :key="sample.id">
            <div class="row q-gutter-sm content-center q-mb-sm">
              <div class="col-2 content-center">
                <q-input
                  class="col-2"
                  stack-label
                  :label="$t('DataIdentifier')"
                  dense
                  readonly
                  outlined
                  v-model="file.identifier"
                  :model-value="sample.identifier"
                />
              </div>
              <q-input
                class="col-2"
                stack-label
                :label="$t('SampleName')"
                label-color="purple"
                dense
                filled
                v-model="file.sampleDetails[i].customName"
              />
              <q-input
                class="col-2"
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
        </div>
      </div>
    </div>

    <div v-if="sampleType === 'double_multiple'">
      <div
        class="row q-my-sm q-pa-sm shadow-1"
        v-for="(file, fileIndex) in files"
        :key="fileIndex"
        :id="`${fileIndex}`"
      >
        <div class="col-5">
          <q-btn
            :label="$t('Select') + $t('Data')"
            color="primary"
            dense
            style="width: 100%"
            @click="$emit('select-first-multi', fileIndex)"
          />
        </div>
        <div class="col-5">
          <q-btn
            :label="$t('Select') + $t('Data')"
            color="secondary"
            dense
            style="width: 100%"
            @click="$emit('select-second-multi', fileIndex)"
          />
        </div>
        <div class="col-2">
          <q-btn icon="delete" color="red" dense @click="$emit('delete-file', fileIndex)" />
        </div>
        <div class="col-5">
          <span v-if="file.samplesFirstError" class="text-red text-bold">{{ `${$t('Data')} ${$t('Required')}` }}</span>
        </div>
        <div class="col-5">
          <span v-if="file.samplesSecondError" class="text-red text-bold">{{ `${$t('Data')} ${$t('Required')}` }}</span>
        </div>
        <div class="col-5">
          <q-chip v-for="sample in file.samplesFirst" :key="sample.id" class="glossy" color="primary" text-color="white">
            {{ sample.identifier }}
          </q-chip>
        </div>
        <div class="col-5">
          <q-chip v-for="sample in file.samplesSecond" :key="sample.id" class="glossy" color="secondary" text-color="white">
            {{ sample.identifier }}
          </q-chip>
        </div>
      </div>
    </div>

    <div class="q-my-sm">
      <q-btn icon="add" color="primary" style="width: 100%" @click="$emit('add-file')">{{ $t('Add') }} {{ $t('Data') }}</q-btn>
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


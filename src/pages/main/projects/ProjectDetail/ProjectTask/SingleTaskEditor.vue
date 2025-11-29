<template>
    <div class="q-pa-sm">
        <div class="text-subtitle2">{{ $t('CustomParameters') }}:</div>
        <div class="row q-my-md">
            <q-input
                class="col-5"
                v-model="localItem.name"
                stack-label
                label-color="purple"
                filled
                :label="$t('Task')"
                :error="item.nameError"
                :error-message="$t('Required')"
            />
        </div>

        <div class="row">
            <template v-for="param in paramsDefine" :key="param.key">
                <div class="col-6 q-pr-sm" v-if="param.type === 'file'">
                    <q-file
                        :error="localItem.params[param.key].isError"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        stack-label
                        label-color="purple"
                        filled
                        :label="param.key"
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-file>
                </div>
                <div class="col-6 q-pr-sm" v-if="param.type === 'string'">
                    <q-input
                        :error="localItem.params[param.key].isError"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        stack-label
                        label-color="purple"
                        filled
                        :label="param.key"
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-input>
                </div>
                <div class="col-6 q-pr-sm" v-if="param.type === 'number'">
                    <q-input
                        :error="localItem.params[param.key].isError"
                        :error-message="param.error"
                        type="number"
                        stack-label
                        label-color="purple"
                        filled
                        v-model="localItem.params[param.key].value"
                        :label="param.key"
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-input>
                </div>
                <div class="col-6 q-pr-sm" v-if="param.type === 'select'">
                    <q-select
                        :error="localItem.params[param.key].isError"
                        use-input
                        @focus="focusSelect(param.key, param)"
                        @filter="filterFn"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        :options="param.choices"
                        :label="param.key"
                        stack-label
                        label-color="purple"
                        filled
                        :option-label="langConfig.lang === 'cn' ? 'cnLabel' : 'enLabel'"
                        :placeholder="param.description"
                        option-value="'value'"
                    />
                </div>
                <div class="col-6 q-pr-sm" v-if="param.type === 'multiSelect'">
                    <div class="row">
                        <div class="col-10">
                            <q-select
                                :error="localItem.params[param.key].isError"
                                use-input
                                @focus="focusSelect(param.key, param)"
                                @filter="filterFn"
                                :error-message="param.error"
                                v-model="localItem.params[param.key].value"
                                :options="param.choices"
                                :label="param.key"
                                stack-label
                                label-color="purple"
                                filled
                                option-value="value"
                                :option-label="(opt) => langConfig.lang === 'cn' ? opt.cnLabel : opt.enLabel"
                                multiple
                                use-chips
                            >
                                <q-tooltip>{{ param.description }}</q-tooltip>
                                <template v-slot:option="scope">
                                    <q-item v-bind="scope.itemProps">
                                        <span
                                            >{{ langConfig.lang === 'cn' ? scope.opt.cnLabel : scope.opt.enLabel }}</span
                                        >
                                        <span class="q-ml-sm text-grey-6">{{ scope.opt.value }}</span>
                                    </q-item>
                                </template>
                            </q-select>
                        </div>
                        <div class="col-2 q-pl-xs">
                            <q-btn
                                icon="list_alt"
                                color="primary"
                                size="md"
                                dense
                                @click="openBatchSelectDialog(param.key, param)"
                                :title="$t('BatchSelect')"
                            />
                        </div>
                    </div>
                </div>
                <div class="col-6 q-pr-sm" v-if="param.type === 'select-from-csv'">
                    <q-select
                        :error="localItem.params[param.key].isError"
                        @focus="focusSelect(param.key, param)"
                        @filter="filterFn"
                        :error-message="param.error"
                        v-model="localItem.params[param.key].value"
                        :options="csvOptions[param.key]"
                        :label="param.key"
                        stack-label
                        label-color="purple"
                        filled
                        :option-label="langConfig.lang === 'cn' ? 'cnLabel' : 'enLabel'"
                        option-value="'value'"
                        use-chips
                    >
                        <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-select>
                </div>
            </template>
        </div>

        <TaskDataSection
            :files="localItem.files"
            :sampleType="sampleType"
            :supportSampleRatio="supportSampleRatio"
            @select-single="selectSingle"
            @select-first="selectFirst"
            @select-second="selectSecond"
            @select-multi="selectMulti"
            @select-first-multi="selectFirstMulti"
            @select-second-multi="selectSecondMulti"
            @delete-file="$emit('delete-file', $event)"
            @add-file="$emit('add-file')"
        />

        <q-dialog persistent v-model="openDataSelectorSingle">
            <TaskDataSelectSingle :projectDetail="projectDetail" @refresh="singleSelected($event)" />
        </q-dialog>
        <q-dialog persistent v-model="openDataSelectorMulti">
            <TaskDataSelectMulti :projectDetail="projectDetail" @refresh="multiSelected($event)" />
        </q-dialog>
    </div>
</template>

<script setup>
import TaskDataSection from './TaskDataSection.vue'
import TaskDataSelectSingle from './TaskDataSelectSingle.vue'
import TaskDataSelectMulti from './TaskDataSelectMulti.vue'
import { useI18n } from 'vue-i18n'
import { defineProps, defineEmits, ref } from 'vue'

useI18n()

const props = defineProps({
  item: { type: Object, required: true },
  paramsDefine: { type: Array, required: true },
  csvOptions: { type: Object, required: true },
  langConfig: { type: Object, required: true },
  sampleType: { type: String, required: true },
  supportSampleRatio: { type: Boolean, default: false },
  focusSelect: { type: Function, required: true },
  filterFn: { type: Function, required: true },
  openBatchSelectDialog: { type: Function, required: true },
  projectDetail: { type: Object, required: true }
})

const localItem = ref(props.item)

const openDataSelectorSingle = ref(false)
const openDataSelectorMulti = ref(false)
const activeParamFileIndex = ref(0)
const currentSample = ref('first')
const samples = ref([])

const selectSingle = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'first'
  openDataSelectorSingle.value = true
}
const selectFirst = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'first'
  openDataSelectorSingle.value = true
}
const selectSecond = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'second'
  openDataSelectorSingle.value = true
}
const selectMulti = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'multi'
  openDataSelectorMulti.value = true
}
const selectFirstMulti = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'first-multi'
  openDataSelectorMulti.value = true
}
const selectSecondMulti = (index) => {
  activeParamFileIndex.value = index
  currentSample.value = 'second-multi'
  openDataSelectorMulti.value = true
}

const singleSelected = (event) => {
  openDataSelectorSingle.value = false
  const file = localItem.value.files[activeParamFileIndex.value]
  if (currentSample.value === 'first') {
    file.sampleFirst = event
    file.sampleDetails[0] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  } else {
    file.sampleSecond = event
    file.sampleDetails[1] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  }
}

const multiSelected = (event) => {
  openDataSelectorMulti.value = false
  const file = localItem.value.files[activeParamFileIndex.value]
  if (currentSample.value === 'multi') {
    file.samples = event
    file.sampleDetails = event.map(sample => ({ customName: sample.sample_identifier, sampleRatio: null, id: sample.id }))
  } else if (currentSample.value === 'first-multi') {
    file.samplesFirst = event
    file.sampleDetails[0] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  } else {
    file.samplesSecond = event
    file.sampleDetails[1] = { customName: event.sample_identifier, sampleRatio: null, id: event.id }
  }
  samples.value = event
}

defineEmits([
  'delete-file',
  'add-file'
])
</script>

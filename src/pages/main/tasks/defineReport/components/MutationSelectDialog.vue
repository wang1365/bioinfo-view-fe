<template>
    <q-dialog v-model="visible" maximized>
        <q-card class="dialog-card">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">{{ $t('MutationAnalysis') }}</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="dialog-content">
                <MutationVue
                    :key="mutationKey"
                    ref="mutationRef"
                    :viewConfig="innerViewConfig"
                    :intro="intro"
                    :samples="samples"
                    :task="task"
                    :stepData="stepData"
                    @stickDone="onStickDone"
                    @reset="onReset"
                />
            </q-card-section>
            <q-separator />
            <q-card-actions align="center" class="dialog-actions">
                <q-btn flat :label="$t('Cancel')" v-close-popup />
                <q-btn color="primary" :label="$t('Confirm')" @click="confirmByRef" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import MutationVue from '../../report/mutation/index.vue'

const visible = defineModel('visible', { type: Boolean, default: false })
const emit = defineEmits(['confirm','reset'])
const props = defineProps({
  samples: { type: Array, default: () => [] },
  task: { type: Object, default: () => ({}) },
  stepData: { type: Object, default: () => ({}) },
  intro: { type: String, default: '' },
  showMutGermline: { type: Boolean, default: true },
  showMutSomatic: { type: Boolean, default: true },
})

const innerViewConfig = computed(() => ({
  showMutGermline: props.showMutGermline,
  showMutSomatic: props.showMutSomatic,
  showMutWES: false,
  showSticky: false,
  stickDone: false,
}))

const onStickDone = (data) => {
  emit('confirm', data)
  visible.value = false
}
const onReset = () => {
  emit('reset', null)
}

const mutationRef = ref(null)
const mutationKey = ref(0)
watch(visible, (v) => {
  if (v) {
    mutationKey.value++
  }
})
const confirmByRef = () => {
  if (mutationRef.value && mutationRef.value.getChangedData) {
    const data = mutationRef.value.getChangedData()
    emit('confirm', data)
    visible.value = false
  }
}
</script>
<style scoped>
.dialog-card {
  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
}
.dialog-content {
  flex: 1;
  overflow: auto;
}
.dialog-actions {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
}
</style>

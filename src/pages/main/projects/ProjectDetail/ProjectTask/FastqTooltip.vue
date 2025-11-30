<template>
    <q-tooltip v-if="info" class="text-body2">
        <div v-if="warn" class="text-orange">{{ warn }}</div>
        <div>{{ $t('Size') }}: {{ formatSizeM(info.size) }}</div>
        <div>{{ $t('Exists') }}: {{ info.exists ? $t('Yes') : $t('No') }}</div>
        <div>{{ $t('Ready') }}: {{ info.ready ? $t('Yes') : $t('No') }}</div>
        <div>{{ $t('CreateTime') }}: {{ info.create_time || '-' }}</div>
        <div>{{ $t('ModifyTime') }}: {{ info.last_modify_time || '-' }}</div>
        <div>{{ $t('CheckTime') }}: {{ info.check_time || '-' }}</div>
        <div>{{ $t('Path') }}: {{ info.path || '-' }}</div>
    </q-tooltip>
</template>

<script setup>
const props = defineProps({
  info: { type: Object, default: null },
  warn: { type: String, default: '' }
})

const formatSizeM = (size) => {
  if (!size || size <= 0) return '0M'
  return (size / (1024 * 1024)).toFixed(2) + 'M'
}
</script>

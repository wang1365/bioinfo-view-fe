<template>
    <q-tooltip v-if="info" class="text-body2">
        <div v-if="warn" class="text-orange">{{ warn }}</div>
        <div>大小：{{ formatSizeM(info.size) }}</div>
        <div>存在：{{ info.exists ? '是' : '否' }}</div>
        <div>就绪：{{ info.ready ? '是' : '否' }}</div>
        <div>创建时间：{{ info.create_time || '-' }}</div>
        <div>修改时间：{{ info.last_modify_time || '-' }}</div>
        <div>检查时间：{{ info.check_time || '-' }}</div>
        <div>路径：{{ info.path || '-' }}</div>
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

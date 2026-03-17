<template>
    <q-card flat bordered>
        <q-card-section class="q-pb-sm">
            <div class="text-subtitle2">{{ title }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
            <div v-if="!src" class="text-grey">{{ t('Rp2ImageNotFound') }}</div>
            <img v-else :src="src" class="full-width image" @error="onError" v-show="!broken" />
            <div v-if="broken" class="text-grey">{{ t('Rp2ImageNotFound') }}</div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    src: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    }
})

const { t } = useI18n()
const broken = ref(false)

const onError = () => {
    broken.value = true
}

watch(
    () => props.src,
    () => {
        broken.value = false
    },
    { immediate: true }
)
</script>

<style scoped>
.image {
    max-height: 360px;
    object-fit: contain;
}
</style>

<template>
    <q-card flat bordered>
        <q-card-section class="q-pb-sm">
            <div class="text-subtitle2">{{ title }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
            <div v-if="!src" class="text-grey">{{ t('Rp2ImageNotFound') }}</div>
            <img
                v-else
                :src="src"
                class="full-width image clickable-image"
                @error="onError"
                @load="onLoad"
                @click="openPreview"
                v-show="!broken"
            />
            <div v-if="broken" class="text-grey">{{ t('Rp2ImageNotFound') }}</div>
        </q-card-section>
    </q-card>

    <q-dialog v-model="previewVisible">
        <q-card class="preview-card">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-subtitle1">{{ title || t('Rp2ImagePreview') }}</div>
                <q-space />
                <q-btn dense flat icon="remove" @click="zoomOut" :label="t('Rp2ZoomOut')" />
                <q-btn dense flat icon="add" @click="zoomIn" :label="t('Rp2ZoomIn')" />
                <q-btn dense flat icon="restart_alt" @click="resetZoom" :label="t('Rp2ZoomReset')" />
                <q-btn dense flat round icon="close" v-close-popup />
            </q-card-section>
            <q-card-section
                class="preview-body"
                :class="{ dragging: isDragging }"
                @wheel.prevent="onWheel"
                @mousedown="startDrag"
                @mousemove="onDrag"
                @mouseup="stopDrag"
                @mouseleave="stopDrag"
            >
                <img :src="src" class="preview-image" :style="previewStyle" />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
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
const previewVisible = ref(false)
const zoom = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

const onError = () => {
    console.error('[RP2 Image] load failed', {
        title: props.title,
        src: props.src
    })
    broken.value = true
}

const onLoad = () => {
    console.log('[RP2 Image] load success', {
        title: props.title,
        src: props.src
    })
}

const openPreview = () => {
    if (broken.value || !props.src) {
        return
    }
    resetZoom()
    previewVisible.value = true
}

const previewStyle = computed(() => ({
    transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${zoom.value})`,
    transformOrigin: 'center center'
}))

const zoomIn = () => {
    zoom.value = Math.min(zoom.value + 0.2, 4)
}

const zoomOut = () => {
    zoom.value = Math.max(zoom.value - 0.2, 0.2)
}

const resetZoom = () => {
    zoom.value = 1
    offsetX.value = 0
    offsetY.value = 0
    isDragging.value = false
}

const onWheel = (event) => {
    if (event.deltaY < 0) {
        zoomIn()
    } else {
        zoomOut()
    }
}

const startDrag = (event) => {
    if (zoom.value <= 1) {
        return
    }
    isDragging.value = true
    dragStartX.value = event.clientX - offsetX.value
    dragStartY.value = event.clientY - offsetY.value
}

const onDrag = (event) => {
    if (!isDragging.value) {
        return
    }
    offsetX.value = event.clientX - dragStartX.value
    offsetY.value = event.clientY - dragStartY.value
}

const stopDrag = () => {
    isDragging.value = false
}

watch(
    () => props.src,
    (newSrc) => {
        console.log('[RP2 Image] render src', {
            title: props.title,
            src: newSrc
        })
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

.clickable-image {
    cursor: zoom-in;
}

.preview-card {
    width: min(80vw, calc(80vh * 16 / 9));
    max-width: 80vw;
    max-height: 80vh;
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
}

.preview-body {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: grab;
}

.preview-body.dragging {
    cursor: grabbing;
}

.preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
}
</style>

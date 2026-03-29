<template>
    <q-card :class="['popup-selector', { fullscreen: props.fullscreen }]">
        <div class="popup-content">
            <div class="popup-content-header">
                <q-toolbar>
                    <q-toolbar-title>{{ props.title }}</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </div>
            <q-separator color="primary"></q-separator>
            <div class="bio-data-table popup-content-table-container">
                <slot name="contentBody"></slot>
            </div>

            <q-separator color="primary"></q-separator>
            <div>
                <q-card-actions align="right" class="bg-white text-teal">
                    <q-list>
                        <q-item>
                            <q-card-section class="q-gutter-x-sm">
                                <slot name="contentFooter">
                                    <AppActionButton class="q-mr-md" label="取消" v-close-popup />
                                    <AppActionButton variant="primary" label="确认" />
                                </slot>
                            </q-card-section>
                        </q-item>
                    </q-list>
                </q-card-actions>
            </div>
        </div>
    </q-card>
</template>
<script setup>
import AppActionButton from 'src/components/button/AppActionButton.vue'

const props = defineProps({
    title: { require: true, type: String },
    fullscreen: { type: Boolean, default: false },
});
</script>

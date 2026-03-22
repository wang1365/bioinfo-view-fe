<template>
    <q-expansion-item
        class="sidebar-group"
        :class="{ 'sidebar-group--nested': isNested }"
        :content-inset-level="0"
        :style="groupStyle"
        :group="addRoutesItem.name"
        v-model="itemOpen"
        :header-inset-level="initLevel"
        header-class="sidebar-group__header"
    >
        <template v-slot:header>
            <q-item-section avatar class="sidebar-group__icon">
                <q-icon :name="addRoutesItem.icon" />
            </q-item-section>
            <q-item-section class="sidebar-group__label">{{ $t(addRoutesItem.label) }}</q-item-section>
        </template>
        <slot></slot>
    </q-expansion-item>
</template>

<script setup>
import { watch, onMounted, ref, toRefs, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const props = defineProps({
    addRoutesItem: {
        default: function () {
            return null;
        },
        type: Object,
    },
    initLevel: {
        type: Number,
        default: 0,
    },
});
const { addRoutesItem, initLevel } = toRefs(props);
const isNested = computed(() => Number(initLevel.value || 0) > 0);
const groupStyle = computed(() => ({
    paddingLeft: `${Math.round(Number(initLevel.value || 0) * 18)}px`,
}));
watch(route, () => {
    changeOpen();
});
onMounted(() => {
    changeOpen();
});
const itemOpen = ref(false);
const changeOpen = () => {
    for (let item of addRoutesItem.value.children) {
        if (item.path === route.path || item.parent_code === route.name) {
            itemOpen.value = true;
            return;
        }
    }
    itemOpen.value = false;
};
</script>

<style lang="scss" scoped>
.sidebar-group {
    margin: 2px 0;
    color: rgba(226, 232, 240, 0.82);
}

.sidebar-group :deep(.sidebar-group__header) {
    min-height: 42px;
    padding: 0 12px;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    transition:
        background-color 0.18s ease,
        color 0.18s ease;
}

.sidebar-group :deep(.sidebar-group__header:hover) {
    background: rgba(255, 255, 255, 0.04);
    color: #ffffff;
}

.sidebar-group :deep(.q-expansion-item--expanded > .q-expansion-item__container > .sidebar-group__header) {
    background: rgba(255, 255, 255, 0.045);
    color: #f8fbff;
}

.sidebar-group--nested :deep(.sidebar-group__header) {
    min-height: 38px;
    border-radius: 8px;
    margin-left: 12px;
    padding-left: 8px !important;
    background: transparent;
}

.sidebar-group__icon {
    min-width: 30px;
    color: rgba(226, 232, 240, 0.66);
}

.sidebar-group__icon :deep(.q-icon) {
    font-size: 18px;
}

.sidebar-group__label {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.05px;
    white-space: nowrap;
}

.sidebar-group--nested .sidebar-group__label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.74);
}

.sidebar-group--nested .sidebar-group__icon {
    color: rgba(148, 163, 184, 0.42);
}

.sidebar-group :deep(.q-expansion-item__toggle-icon) {
    color: rgba(226, 232, 240, 0.42);
    font-size: 16px;
}

.sidebar-group--nested :deep(.q-expansion-item__toggle-icon) {
    color: rgba(148, 163, 184, 0.42);
    font-size: 14px;
}

.sidebar-group :deep(.q-expansion-item__content) {
    margin-top: 2px;
    padding-top: 1px;
    position: relative;
}

.sidebar-group :deep(.q-expansion-item__content::before) {
    content: '';
    position: absolute;
    left: 18px;
    top: 6px;
    bottom: 6px;
    width: 1px;
    background: rgba(148, 163, 184, 0.14);
}
</style>

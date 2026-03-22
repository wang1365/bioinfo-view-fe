<template>
    <q-item
        v-if="isExternal"
        class="sidebar-item"
        :class="{ 'sidebar-item--nested': isNested }"
        :style="itemStyle"
        clickable
        exact
        tag="a"
        :href="addRoutesItem.path"
        target="_blank"
        rel="noopener noreferrer"
        :inset-level="initLevel"
    >
        <q-item-section avatar class="sidebar-item__icon">
            <q-icon :name="addRoutesItem.icon" />
        </q-item-section>
        <q-item-section class="sidebar-item__label">{{ $t(addRoutesItem.label) }}</q-item-section>
    </q-item>
    <q-item
        v-else
        class="sidebar-item"
        :class="{ 'sidebar-item--nested': isNested }"
        :style="itemStyle"
        clickable
        exact
        :to="addRoutesItem.path"
        :inset-level="initLevel"
        :active="checkActive"
        active-class="sidebar-item--active"
    >
        <q-item-section avatar class="sidebar-item__icon">
            <q-icon :name="addRoutesItem.icon" />
        </q-item-section>
        <q-item-section class="sidebar-item__label">{{ $t(addRoutesItem.label) }}</q-item-section>
    </q-item>
</template>

<script setup>
import { computed, toRefs } from "vue";
import { useRoute } from "vue-router";
// import useDarkTheme from 'src/composables/useDarkTheme';
//
// const { darkThemeSelect } = useDarkTheme()
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
const isExternal = computed(() => addRoutesItem.value?.is_link === "yes");
const isNested = computed(() => Number(initLevel.value || 0) > 0);
const itemStyle = computed(() => ({
    paddingLeft: `${12 + Math.round(Number(initLevel.value || 0) * 18)}px`,
}));

const checkActive = computed(() => {
    if (route.path === addRoutesItem.value.path) {
        return true;
    } else {
        return false;
    }
});
</script>

<style lang="scss" scoped>
.sidebar-item {
    min-height: 42px;
    margin: 2px 0;
    padding: 0 12px;
    border-radius: 10px;
    color: rgba(226, 232, 240, 0.82);
    transition:
        background-color 0.18s ease,
        color 0.18s ease,
        box-shadow 0.18s ease;
}

.sidebar-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
}

.sidebar-item--active {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.08) 100%);
    color: #f8fbff;
    box-shadow: inset 3px 0 0 #4ea1ff;
}

.sidebar-item--nested {
    min-height: 38px;
    border-radius: 8px;
    margin-left: 12px;
    padding-left: 8px !important;
    background: transparent;
}

.sidebar-item__icon {
    min-width: 30px;
    color: rgba(226, 232, 240, 0.66);
}

.sidebar-item__icon :deep(.q-icon) {
    font-size: 18px;
}

.sidebar-item__label {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.05px;
    white-space: nowrap;
}

.sidebar-item--nested .sidebar-item__label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.74);
}

.sidebar-item--nested .sidebar-item__icon {
    color: rgba(148, 163, 184, 0.42);
}

.sidebar-item--nested:hover {
    background: rgba(255, 255, 255, 0.025);
}

.sidebar-item--nested.sidebar-item--active {
    background: rgba(59, 130, 246, 0.08);
    box-shadow:
        inset 2px 0 0 rgba(78, 161, 255, 0.72),
        inset 0 0 0 1px rgba(78, 161, 255, 0.08);
}

.sidebar-item--nested.sidebar-item--active .sidebar-item__label {
    color: rgba(248, 251, 255, 0.92);
    font-weight: 600;
}

.sidebar-item--nested.sidebar-item--active .sidebar-item__icon {
    color: rgba(186, 230, 253, 0.8);
}

.sidebar-item--active .sidebar-item__icon,
.sidebar-item--active .sidebar-item__label {
    color: #f8fbff;
}
</style>

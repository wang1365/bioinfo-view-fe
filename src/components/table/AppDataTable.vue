<template>
    <a-table
        v-bind="tableAttrs"
        :class="tableClass"
    >
        <template
            v-for="(_, slotName) in slots"
            #[slotName]="slotProps"
            :key="slotName"
        >
            <slot :name="slotName" v-bind="slotProps || {}" />
        </template>
    </a-table>
</template>

<script setup>
import { computed, getCurrentInstance, useAttrs, useSlots } from 'vue'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    variant: {
        type: String,
        default: 'plain',
    },
    showInnerVerticalBorders: {
        type: Boolean,
        default: true,
    },
    showOuterVerticalBorders: {
        type: Boolean,
        default: true,
    },
    showOuterHorizontalBorders: {
        type: Boolean,
        default: true,
    },
})

const attrs = useAttrs()
const slots = useSlots()
const instance = getCurrentInstance()

const hasExplicitProp = (camelName, kebabName) => {
    const vnodeProps = instance?.vnode?.props || {}
    return Object.prototype.hasOwnProperty.call(vnodeProps, camelName)
        || Object.prototype.hasOwnProperty.call(vnodeProps, kebabName)
}

const tableAttrs = computed(() => {
    const { class: _className, ...rest } = attrs
    return rest
})

const tableClass = computed(() => {
    const className = String(attrs.class || '')
    const useGridVariant = props.variant === 'grid' || className.includes('page-grid-table')
    const showInnerVerticalBorders = hasExplicitProp('showInnerVerticalBorders', 'show-inner-vertical-borders')
        ? props.showInnerVerticalBorders
        : true
    const showOuterVerticalBorders = hasExplicitProp('showOuterVerticalBorders', 'show-outer-vertical-borders')
        ? props.showOuterVerticalBorders
        : true
    const showOuterHorizontalBorders = hasExplicitProp('showOuterHorizontalBorders', 'show-outer-horizontal-borders')
        ? props.showOuterHorizontalBorders
        : true

    return [
        'app-data-table',
        useGridVariant ? 'app-data-table--grid' : 'app-data-table--plain',
        showInnerVerticalBorders
            ? 'app-data-table--inner-vertical-borders'
            : 'app-data-table--no-inner-vertical-borders',
        showOuterVerticalBorders
            ? 'app-data-table--outer-vertical-borders'
            : 'app-data-table--no-outer-vertical-borders',
        showOuterHorizontalBorders
            ? 'app-data-table--outer-horizontal-borders'
            : 'app-data-table--no-outer-horizontal-borders',
        attrs.class,
    ]
})
</script>

<style lang="scss">
.app-data-table--grid .ant-table,
.app-data-table--grid .ant-table-container {
    border: 1px solid #6f8098 !important;
}

.app-data-table--grid .ant-table-container {
    border-color: #6f8098 !important;
}

.app-data-table--grid .ant-table-content table,
.app-data-table--grid .ant-table-header table,
.app-data-table--grid .ant-table-body table {
    table-layout: fixed;
}

.app-data-table--grid .ant-table-thead > tr > th {
    border-bottom: 1px solid #c7cfdb !important;
    border-right: 1px solid #cfd7e3 !important;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    line-height: 1.2 !important;
    box-sizing: border-box;
}

.app-data-table--grid .ant-table-thead > tr > th::before {
    display: none !important;
}

.app-data-table--grid .ant-table-tbody > tr > td {
    border-bottom: 1px solid #d4dbe6 !important;
    border-right: 1px solid #d9e0ea !important;
    box-sizing: border-box;
}

.app-data-table--grid .ant-table-thead > tr > th:last-child,
.app-data-table--grid .ant-table-tbody > tr > td:last-child {
    border-right: 0 !important;
}

.app-data-table--grid .ant-table-thead > tr > th.ant-table-cell-scrollbar {
    border-right: 0 !important;
    box-shadow: none !important;
}

.app-data-table--grid.app-data-table--no-inner-vertical-borders .ant-table-thead > tr > th,
.app-data-table--grid.app-data-table--no-inner-vertical-borders .ant-table-tbody > tr > td {
    border-right: 0 !important;
}

.app-data-table--grid.app-data-table--no-outer-vertical-borders .ant-table,
.app-data-table--grid.app-data-table--no-outer-vertical-borders .ant-table-container {
    border-left: 0 !important;
    border-right: 0 !important;
}

.app-data-table--grid.app-data-table--no-outer-horizontal-borders .ant-table,
.app-data-table--grid.app-data-table--no-outer-horizontal-borders .ant-table-container {
    border-top: 0 !important;
    border-bottom: 0 !important;
}
</style>

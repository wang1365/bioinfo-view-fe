<template>
    <q-item
        v-if="isExternal"
        clickable
        exact
        tag="a"
        :href="addRoutesItem.path"
        target="_blank"
        rel="noopener noreferrer"
        :inset-level="initLevel"
    >
        <q-item-section avatar>
            <q-icon :name="addRoutesItem.icon" />
        </q-item-section>
        <q-item-section>{{ $t(addRoutesItem.label) }}</q-item-section>
    </q-item>
    <q-item
        v-else
        clickable
        exact
        :to="addRoutesItem.path"
        :inset-level="initLevel"
        :active="checkActive"
    >
        <!--        :active-class="darkThemeSelect">-->
        <q-item-section avatar>
            <q-icon :name="addRoutesItem.icon" />
        </q-item-section>
        <q-item-section>{{ $t(addRoutesItem.label) }}</q-item-section>
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

const checkActive = computed(() => {
    if (route.path === addRoutesItem.value.path) {
        return true;
    } else {
        return false;
    }
});
</script>

<style lang="scss" scoped>
.item-active-class {
    color: $primary;
    background: $primary;
    // background: lighten($color: $primary, $amount: 30%);
    // background: scale-color($primary, $lightness: 5%);
}
</style>

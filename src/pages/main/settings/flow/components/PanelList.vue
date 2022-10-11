<template>
    <q-select
        :options="filteredPanels"
        option-value="id"
        option-label="name"
        map-options
        stack-label
        emit-value
        use-input
        input-debounce="0"
        @filter="filterFn"
    />
</template>

<script setup>
import { getPanels } from "src/api/panel"
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const loading = ref(false)
const $q = useQuasar()
const panels = ref([])
const filteredPanels = ref([])


const props = defineProps({
    selection: {
        required: false,
        type: String,
        default: 'multiple',
    },
    columns: {
        required: false,
        type: Array,
        default: null
    }
})

onMounted(() => {
    refresh()
})

const refresh = () => {
    getPanels()
        .then((data) => {
            panels.value = data
        })
}

const filterFn = (val, update) => {
    if (val === '') {
        update(() => {
            filteredPanels.value = panels.value
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        filteredPanels.value = panels.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
    })
}
</script>

<style lang="scss" scoped></style>

<template>
    <div class="panel-tab-root">
        <q-splitter v-model="splitterModel" class="panel-splitter">
            <template #before>
                <q-scroll-area class="panel-list-scroll" :thumb-style="thumbStyle">
                    <div class="panel-list-wrap">
                        <q-input
                            v-model="panelKeyword"
                            dense
                            filled
                            clearable
                            class="panel-search"
                            placeholder="检索 Panel"
                        >
                            <template #prepend>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                        <div class="panel-list">
                            <button
                                v-for="(item, index) in filteredRows"
                                :key="item.id"
                                type="button"
                                class="panel-list-item"
                                :class="{ 'panel-list-item--active': tab === item.name }"
                                @click="tab = item.name"
                            >
                                <span class="panel-list-item__index">{{ index + 1 }}.</span>
                                <span class="panel-list-item__label">{{ item.name }}</span>
                            </button>
                        </div>
                    </div>
                </q-scroll-area>
            </template>
            <template #after>
                <q-tab-panels v-model="tab" animated class="panel-detail-panels">
                    <q-tab-panel
                        v-for="item in filteredRows"
                        :key="item.id"
                        :name="item.name"
                        class="panel-detail-panel"
                        transition-prev="jump-up"
                        transition-next="jump-up"
                    >
                        <div class="panel-detail-scroll">
                            <PanelDetail :id="item.id" />
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </template>
        </q-splitter>
    </div>
</template>

<script setup>
import { getPanels } from 'src/api/panel'
import { ref, onMounted, watch, toRefs, computed } from 'vue'
import PanelDetail from 'pages/main/panel-flows/PanelDetail'

const rows = ref([])
const tab = ref('')
const panelKeyword = ref('')
const splitterModel = ref(16)

const thumbStyle = {
    right: '2px',
    borderRadius: '5px',
    backgroundColor: '#027be3',
    width: '6px',
    opacity: 0.5,
}

const props = defineProps({
    panelGroupId: {
        required: false,
        type: Number,
    },
})

const { panelGroupId } = toRefs(props)

const filteredRows = computed(() => {
    const keyword = panelKeyword.value?.trim()?.toLowerCase()
    if (!keyword) {
        return rows.value
    }
    return rows.value.filter(item => (item.name || '').toLowerCase().includes(keyword))
})

watch(filteredRows, list => {
    if (!list.length) {
        tab.value = ''
        return
    }
    if (!list.some(item => item.name === tab.value)) {
        tab.value = list[0].name
    }
})

const refreshRows = () => {
    const params = {
        simple: 1,
    }

    if (props.panelGroupId) {
        params.panel_group_id = props.panelGroupId
    }

    getPanels(params).then(res => {
        rows.value = res
        if (res.length > 0) {
            tab.value = res[0].name
        } else {
            tab.value = ''
        }
    })
}

onMounted(() => {
    refreshRows()
})

watch(panelGroupId, () => {
    refreshRows()
})
</script>

<style lang="scss" scoped>
.panel-tab-root {
    height: 100%;
    min-height: 0;
}

.panel-splitter {
    height: 100%;
    min-height: 0;
    border: 1px solid #d7deea;
    border-radius: 10px;
    background: #fff;
}

.panel-list-scroll {
    height: 100%;
}

.panel-list-wrap {
    padding: 8px 8px 6px;
}

.panel-search {
    margin-bottom: 6px;
}

.panel-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.panel-list-item {
    width: 100%;
    min-height: 36px;
    border: 1px solid #d8e1ed;
    border-radius: 8px;
    background: #fff;
    color: #3a4758;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all .16s ease;
}

.panel-list-item:hover {
    border-color: #9fbce0;
    background: #f6faff;
}

.panel-list-item--active {
    border-color: #2f7dd8;
    background: #eaf3ff;
    color: #1f4f82;
    box-shadow: inset 0 0 0 1px rgba(47, 125, 216, .2);
}

.panel-list-item__index {
    flex: 0 0 auto;
    color: #5e6f86;
    font-weight: 600;
}

.panel-list-item__label {
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.panel-detail-panels {
    height: 100%;
    min-height: 0;
}

.panel-detail-panel {
    height: 100%;
    min-height: 0;
    padding: 8px 10px 8px 6px;
}

.panel-detail-scroll {
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
}
</style>

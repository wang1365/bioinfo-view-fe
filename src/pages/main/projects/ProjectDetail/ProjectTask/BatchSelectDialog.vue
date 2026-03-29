<template>
    <!-- 批量选择对话框 -->
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 80vw; max-width: 80vw; height: 70vh">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">{{ $t('BatchSelect') }}</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section
                class="q-pt-none"
                style="height: calc(100% - 120px); display: flex; flex-direction: column;"
            >
                <div class="row q-gutter-md" style="height: 100%; flex: 1;">
                    <!-- 左侧输入框 -->
                    <div class="col" style="display: flex; flex-direction: column; height: 100%;">
                        <div class="text-subtitle2 q-mb-sm">{{ $t('InputItems') }}:</div>
                        <div style="flex: 1; display: flex;">
                            <q-input
                                v-model="inputText"
                                type="textarea"
                                filled
                                :placeholder="$t('InputItemsPlaceholder')"
                                style="width: 100%;"
                                input-style="height: 100%; min-height: 350px; resize: none;"
                            />
                        </div>
                    </div>

                    <!-- 中间匹配按钮 -->
                    <div class="col-auto" style="display: flex; align-items: center; justify-content: center; padding: 0 16px;">
                        <AppActionButton
                            :label="$t('Match')" 
                            variant="primary"
                            @click="performMatch"
                            icon="arrow_forward"
                            style="min-width: 100px;"
                        />
                    </div>

                    <!-- 右侧匹配结果 -->
                    <div class="col" style="display: flex; flex-direction: column; height: 100%;">
                        <div class="text-subtitle2 q-mb-sm">{{ $t('MatchResults') }}:</div>
                        <div style="flex: 1; display: flex;">
                            <q-input
                                v-model="matchResults"
                                type="textarea"
                                filled
                                readonly
                                style="width: 100%;"
                                input-style="height: 100%; min-height: 350px; resize: none;"
                            />
                        </div>
                    </div>
                </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
                <AppActionButton :label="$t('Cancel')" v-close-popup />
                <AppActionButton :label="$t('Confirm')" variant="primary" @click="confirmSelect" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { globalStore } from 'src/stores/global';
import AppActionButton from 'src/components/button/AppActionButton.vue'

const { t } = useI18n();
const { langConfig } = globalStore();

// Props定义
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array,
        default: () => []
    },
    currentValue: {
        type: Array,
        default: () => []
    }
});

// Emits定义
const emit = defineEmits(['update:modelValue', 'confirm']);

// 响应式变量
const inputText = ref('');
const matchResults = ref('');
const matchedItems = ref([]);

// 计算属性
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

// 监听对话框打开，重置状态
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        resetDialog();
    }
});

// 方法
const resetDialog = () => {
    inputText.value = '';
    matchResults.value = '';
    matchedItems.value = [];
};

const performMatch = () => {
    if (!inputText.value.trim()) {
        matchResults.value = '';
        matchedItems.value = [];
        return;
    }

    const inputItems = inputText.value.split(',').map(item => item.trim()).filter(item => item);
    const options = props.options || [];
    const matchedItemsArray = [];
    const resultLines = [];

    inputItems.forEach(inputItem => {
        const matches = options.filter(option => {
            const value = option.value || '';
            const cnLabel = option.cnLabel || '';
            const enLabel = option.enLabel || '';

            return value.toLowerCase().includes(inputItem.toLowerCase()) ||
                   cnLabel.toLowerCase().includes(inputItem.toLowerCase()) ||
                   enLabel.toLowerCase().includes(inputItem.toLowerCase());
        });

        if (matches.length > 0) {
            matches.forEach(match => {
                const displayLabel = langConfig.lang === 'cn' ? match.cnLabel : match.enLabel;
                const resultLine = `${displayLabel} (${match.value})`;
                resultLines.push(resultLine);
                matchedItemsArray.push(match);
            });
        }
    });

    matchResults.value = resultLines.join('\n');
    matchedItems.value = matchedItemsArray;
};

const confirmSelect = () => {
    if (matchedItems.value.length > 0) {
        // 获取当前选中的值
        const currentValue = props.currentValue || [];

        // 合并新选择的项目，避免重复
        const existingValues = new Set(currentValue.map(item => item.value));
        const newItems = matchedItems.value.filter(item => !existingValues.has(item.value));

        // 发送确认事件
        emit('confirm', {
            selectedItems: matchedItems.value,
            newItems: newItems,
            allItems: [...currentValue, ...newItems]
        });
    }

    dialogVisible.value = false;
};
</script>

<style scoped>
/* 可以添加组件特定的样式 */
</style>

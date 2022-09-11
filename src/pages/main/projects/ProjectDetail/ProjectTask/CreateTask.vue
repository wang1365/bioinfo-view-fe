<template>
    <q-card style="width: 80vw; max-width: 80vw">
        <PopupContentScroll title="创建任务">
            <template v-slot:contentBody></template>
            <template v-slot:contentFooter>
                <q-btn label="取消" v-close-popup />
                <q-btn color="primary" label="确定" @click="clickConfirm"
            /></template>
        </PopupContentScroll>
    </q-card>
</template>

<script setup>
import { defineProps, ref, toRefs, defineEmits } from "vue";
import PopupContentScroll from "src/components/popup-content-scroll/PopupContentScroll.vue";

const emit = defineEmits(["taskCreated"]);
const props = defineProps({
    flowDetail: { type: Object, required: true },
    projectId: { type: Number, required: true },
});

const { flowId } = toRefs(props);

const confirmTaskCreated = () => {
    emit("taskCreated");
};
</script>

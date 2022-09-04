<template>
    <q-select
        dense
        @update:model-value="pageSizeChange($event)"
        v-model="pageSize"
        :options="pageSizeOption"
    />
    <q-btn flat :label="currentItems" />
    <q-btn icon="chevron_left" flat size="sm" @click="prePage()" />
    <q-btn icon="chevron_right" flat size="sm" @click="nextPage()" />
    <!-- {{ (currentPage - 1) * pageSize }}~{{ currentPage * pageSize }} -->
</template>

<script>
export default {
    data() {
        return {
            post: {
                id: 1,
                title: "My Journey with Vue",
            },
            pageSize: 10,
            currentPage: 1,
        };
    },
    computed: {
        currentItems() {
            return (
                (this.currentPage - 1) * this.pageSize +
                " - " +
                this.currentPage * this.pageSize +
                " of " +
                this.total
            );
        },
    },

    props: {
        pageSizeOption: {
            type: Array,
            default: () => {
                return [10, 15, 30, 50, 100];
            },
        },
        total: {
            type: Number,
            default: 100,
        },
    },
    emits: ["pageChange"],
    methods: {
        pageSizeChange(event) {
            this.pageSize = event;
            this.currentPage = 1;
            this.pageChange();
        },
        pageChange() {
            console.log(this.pageSize);
            this.$emit("pageChange", {
                pageSize: this.pageSize,
                currentPage: this.currentPage,
            });
        },
        nextPage() {
            if (this.currentPage * this.pageSize >= this.total) {
                return;
            } else {
                this.currentPage += 1;
                this.pageChange();
            }
        },
        prePage() {
            if (this.currentPage <= 1) {
                return;
            } else {
                this.currentPage -= 1;
                this.pageChange();
            }
        },
    },
};
// import { ref } from "vue";
//
// const pageSize = ref(10);
// const props = defineProps({
// currentPage: {
//     type: Number,
//     detault: 1,
// },
// pageSizeOption: {
//     type: Array,
//     default: () => {
//         return [10, 15, 30, 50];
//     },
// },
// });
</script>

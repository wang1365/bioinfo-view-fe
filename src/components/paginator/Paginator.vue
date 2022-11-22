<template>
    <q-select dense @update:model-value="pageSizeChange($event)" v-model="pageSize" :options="pageSizeOption" />
    <q-btn disable flat :label="currentItems" />
    <q-btn icon="chevron_left" flat size="sm" @click="prePage()" />
    <q-btn icon="chevron_right" flat size="sm" @click="nextPage()" />
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
            page: this.currentPage,
        };
    },
    computed: {
        currentItems() {
            return (
                (this.currentPage - 1) * this.pageSize +
                1 +
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
            default: 0,
        },
        currentPage: {
            type: Number,
            default: 1,
        },
    },
    emits: ["pageChange"],
    methods: {
        pageSizeChange(event) {
            this.pageSize = event;
            this.pageChange(1, this.pageSize);
        },
        pageChange(page, pageSize) {
            this.$emit("pageChange", {
                pageSize: pageSize,
                currentPage: page,
            });
        },
        nextPage() {
            if (this.currentPage * this.pageSize >= this.total) {
                return;
            } else {
                this.pageChange(this.currentPage + 1, this.pageSize);
            }
        },
        prePage() {
            if (this.currentPage <= 1) {
                return;
            } else {
                this.pageChange(this.currentPage - 1, this.pageSize);
            }
        },
    },
};
</script>

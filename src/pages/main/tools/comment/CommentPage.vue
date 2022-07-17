<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="数据库标注" />
        <div class="row">
            <div class="col-2">
                <q-select
                    v-model="database"
                    :options="options"
                    stack-label
                    :display-value="`数据库: ${database ? database : '*none*'}`"
                >
                </q-select>
            </div>
            <div class="col-10">
                <q-input v-model="text" label="输入文本: 回车查询">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref } from "vue";
const options = ref(["Google", "Facebook", "Twitter", "Apple", "Oracle"]);
const database = ref("Google");
</script>

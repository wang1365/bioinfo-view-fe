<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle title="基因组浏览器" />
        <q-expansion-item
            expand-separator
            icon="settings_suggest"
            label="参数设置"
            class="shadow-1"
        >
            <q-card>
                <q-card-section>
                    <span class="q-mr-md">基因组:</span>
                    <q-radio
                        v-model="shape"
                        val="hg19"
                        label="hg19"
                        size="xs"
                    />
                    <q-radio
                        v-model="shape"
                        val="hg18"
                        label="hg18"
                        size="xs"
                    />
                </q-card-section>
                <q-card-section>
                    <span class="q-mr-md">捕获 panel:</span>
                    <q-radio
                        v-model="shape"
                        val="hg19"
                        label="hg19"
                        size="xs"
                    />
                    <q-radio
                        v-model="shape"
                        val="hg18"
                        label="hg18"
                        size="xs"
                    />
                </q-card-section>
                <q-card-section>
                    <span class="q-mr-md">数据选择:</span>
                    <q-icon name="folder" color="info" size="sm"></q-icon>
                </q-card-section>
            </q-card>
            <div class="row justify-around">
                <q-btn label="提交" color="primary"></q-btn>
            </div>
            <div class="q-py-sm"></div>
        </q-expansion-item>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { ref } from "vue";
const options = ref(["Google", "Facebook", "Twitter", "Apple", "Oracle"]);
const database = ref("Google");
const shape = ref("hg19");
</script>

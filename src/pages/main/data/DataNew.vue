<template>
    <q-card style="width: 700px; max-width: 80vw">
        <q-toolbar>
            <q-toolbar-title>新建样本</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
            <q-list>
                <q-item>
                    <q-section class="full-width">
                        <q-input v-model="text" label="样本名称"
                    /></q-section>
                </q-item>
                <q-item>
                    <div class="row full-width justify-between">
                        <div class="col q-pr-sm">
                            <q-btn
                                label="R1文件"
                                outline
                                color="primary"
                                class="full-width"
                            />
                        </div>
                        <div class="col q-pf-sm">
                            <q-btn
                                label="R2文件"
                                outline
                                color="secondary"
                                class="full-width"
                            />
                        </div>
                    </div>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="患者信息"
                            v-model="hasPatientInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasPatientInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="临床信息"
                            v-model="hasClinicalInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasClinicalInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="样本信息"
                            v-model="hasSampleInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasSampleInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="文库信息"
                            v-model="hasLibraryInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasLibraryInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
                <q-item>
                    <q-section>
                        <q-toggle
                            left-label
                            label="其他信息"
                            v-model="hasOtherInfo"
                        />
                    </q-section>
                    <q-space></q-space>
                    <q-section v-if="hasOtherInfo" class="q-gutter-x-sm">
                        <q-btn label="填写" unelevated color="primary" />
                        <label for="">或</label>
                        <q-btn label="上传" unelevated color="secondary" />
                        <q-icon
                            name="file_download"
                            class="cursor-pointer"
                            size="sm"
                        >
                            <q-tooltip>下载模板文件 </q-tooltip>
                        </q-icon>
                    </q-section>
                </q-item>
            </q-list>
            <div class="q-pa-md q-gutter-y-sm content-start"></div>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-list>
                <q-item>
                    <q-section class="q-gutter-x-sm">
                        <q-btn label="取消" v-close-popup />
                        <q-btn color="primary" label="确认" />
                    </q-section>
                </q-item>
            </q-list>
        </q-card-actions>
    </q-card>
</template>
<script setup>
import { ref } from "vue";
const hasPatientInfo = ref(false);
const hasClinicalInfo = ref(false);
const hasSampleInfo = ref(false);
const hasLibraryInfo = ref(false);
const hasOtherInfo = ref(false);
</script>

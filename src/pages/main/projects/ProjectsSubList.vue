<template>
    <q-card>
        <q-section>
            <q-toolbar class="q-gutter-x-sm">
                <q-icon size="md" color="primary" name="folder" />
                <q-toolbar-title class="text-h6"> 项目 </q-toolbar-title>
                <q-btn
                    color="primary"
                    label="新建项目"
                    icon="folder"
                    @click="newFolder = true"
                />
                <!-- <q-btn
                        color="positive"
                        label="批量上传患者信息"
                        icon="file_upload"
                    /> -->
            </q-toolbar>
        </q-section>
        <q-section>
            <!-- <q-toolbar class="q-gutter-x-sm">
                    <q-input dense v-model="text" label="输入文本: 回车查询">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                    <q-space />
                </q-toolbar> -->
            <div class="q-pa-md">
                <table>
                    <thead>
                        <tr class="text-body1 text-weight-bold">
                            <td>项目名称</td>
                            <td>创建人</td>
                            <td>创建时间</td>
                            <td>样本数量</td>
                            <td class="text-right">操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="i in 6" :key="i">
                            <td>项目名称{{ i }}</td>
                            <td>创建人</td>
                            <td>创建时间</td>
                            <td>样本数量</td>
                            <td class="q-gutter-x-sm text-right">
                                <q-btn
                                    color="primary"
                                    label="上传数据"
                                    icon="cloud_upload"
                                    @click="uploadData = true"
                                    size="sm"
                                />
                                <q-btn
                                    color="red"
                                    label="删除"
                                    icon="delete"
                                    @click="confirm()"
                                    size="sm"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="row q-mt-md">
                    <q-space></q-space>
                    <q-pagination
                        :model-value="current"
                        :max="10"
                        :max-pages="6"
                        boundary-numbers
                    />
                </div>
            </div>
        </q-section>
        <q-section class="q-pd-md"> </q-section>
    </q-card>
    <q-dialog v-model="newFolder" persistent>
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>新建项目</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-section class="full-width">
                            <q-input v-model="text" label="项目名称"
                        /></q-section>
                    </q-item>
                </q-list>
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
    </q-dialog>

    <q-dialog v-model="uploadData">
        <q-card style="width: 700px; max-width: 80vw">
            <q-toolbar>
                <q-toolbar-title>上传数据</q-toolbar-title>
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
    </q-dialog>
</template>
<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import { useQuasar } from "quasar";
import { ref } from "vue";
const hasPatientInfo = ref(false);
const hasClinicalInfo = ref(false);
const hasSampleInfo = ref(false);
const hasLibraryInfo = ref(false);
const hasOtherInfo = ref(false);
const uploadData = ref(false);
const newFolder = ref(false);
const current = ref(5);
const selected = ref([]);

const $q = useQuasar();

const confirm = () => {
    $q.dialog({
        title: "确认删除吗?",
        cancel: true,
        persistent: true,
    })
        .onOk(() => {
            // console.log('>>>> OK')
        })
        .onOk(() => {
            // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
            // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
            // console.log('I am triggered on both OK and Cancel')
        });
};
</script>

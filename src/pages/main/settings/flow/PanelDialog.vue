<template>
    <q-dialog persistent transition-show="fade" transition-hide="fade" v-model="dlgVisible" :title="title">
        <q-card class="my-card">
            <q-card-section>
                <q-form>
                    <div class="row justify-between">
                        <q-input
                            class="col-6"
                            v-model="form.name"
                            label="Panel名称"
                            dense
                            clearable
                            stack-label
                            :rules="[(val) => (val !== null && val.length >= 3) || '名称至少为3个字符']"
                        />
                        <q-select
                            class="col-5"
                            label="Panel分组"
                            v-model="form.panel_group"
                            emit-value
                            :options="panelGroups"
                            map-options
                            dense
                            stack-label
                        />
                    </div>
                    <q-input v-model="form.desp" label="描述" dense type="textarea" clearable stack-label counter />
                    <q-editor
                        v-model="form.detail"
                        :dense="$q.screen.lt.md"
                        toolbar-text-color="white"
                        toolbar-bg="primary"
                        :toolbar="[
                            [
                              {
                                label: $q.lang.editor.align,
                                icon: $q.iconSet.editor.align,
                                fixedLabel: true,
                                options: ['left', 'center', 'right', 'justify']
                              }
                            ],
                            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
                            ['token', 'hr', 'link', 'custom_btn'],
                            ['print', 'fullscreen'],
                            [
                              {
                                label: $q.lang.editor.formatting,
                                icon: $q.iconSet.editor.formatting,
                                list: 'no-icons',
                                options: ['p', 'h1', 'h2', 'h3',  'h4', 'h5', 'h6', 'code' ]
                              },
                              {
                                label: $q.lang.editor.fontSize,
                                icon: $q.iconSet.editor.fontSize,
                                fixedLabel: true,
                                fixedIcon: true,
                                list: 'no-icons',
                                options: ['size-1','size-2','size-3','size-4','size-5','size-6','size-7']
                              },
                              {
                                label: $q.lang.editor.defaultFont,
                                icon: $q.iconSet.editor.font,
                                fixedIcon: true,
                                list: 'no-icons',
                                options: [
                                  'default_font',
                                  'arial',
                                  'arial_black',
                                  'comic_sans',
                                  'courier_new',
                                  'impact',
                                  'lucida_grande',
                                  'times_new_roman',
                                  'verdana'
                                ]
                              },
                              'removeFormat'
                            ],
                            ['quote', 'unordered', 'ordered', 'outdent', 'indent'],  ['undo', 'redo'], ['viewsource']
                          ]"
                        :fonts="{
                    arial: 'Arial',
                    arial_black: 'Arial Black',
                    comic_sans: 'Comic Sans MS',
                    courier_new: 'Courier New',
                    impact: 'Impact',
                    lucida_grande: 'Lucida Grande',
                    times_new_roman: 'Times New Roman',
                    verdana: 'Verdana'
                  }"
                    />
                </q-form>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn color="primary" label="确定" @click="clickSubmit" />
                <q-btn label="取消" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import {ref, defineProps, defineExpose, defineEmits, onMounted} from 'vue'
import {createPanel, updatePanel} from 'src/api/panel'
import {useQuasar} from 'quasar'
import {getPanelGroups} from "src/api/panelGroup";

const $q = useQuasar()
const dlgVisible = ref(false)
const panelGroups = ref([])
const richText = ref('')

const props = defineProps({
    mode: {
        validator: (value) => {
            return ['edit', 'create', 'info'].indexOf(value) !== -1
        },
        default: 'info',
    },
    id: {
        type: Number,
        default: -1,
    },
})

const form = ref({ detail: '' })

onMounted(() => {
    getPanelGroups().then(res => {
        panelGroups.value = res.map(t => {
            return {
                label: t.name,
                value: t.id
            }
        })
    })
})

const setData = (data) => {
    form.value = data
}
const reset = () => {
    // this.$refs.params.resetFields()
    // this.$refs.builtinParams.resetFields()
    // this.$refs.form.resetFields()
}

const close = () => {
    dlgVisible.value = false
}

const show = () => {
    dlgVisible.value = true
}
defineExpose({setData, reset, show})
const emit = defineEmits(['success'])

const clickSubmit = () => {
    if (props.mode === 'create') {
        createPanel(form.value).then(() => {
            $q.notify({message: '创建成功', type: 'positive'})
            emit('success')
            close()
        })
    }

    if (props.mode === 'edit') {
        updatePanel(form.value).then(() => {
            $q.notify({message: '更新成功', type: 'positive'})
            emit('success')
            close()
        })
    }

}
</script>

<style lang="scss" scoped>
.my-card {
    width: 80%;
    min-width: 1000px;
}
</style>

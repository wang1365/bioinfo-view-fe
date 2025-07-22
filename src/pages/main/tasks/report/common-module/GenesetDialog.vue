<template>
    <q-dialog v-model="visible">
        <q-card style="min-width:500px;">
            <q-toolbar>
                <q-space />
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <div class="q-pa-md">
                <q-stepper v-model="geneSetStep" vertical color="primary" animated>
                    <q-step :name="1" :title="$t('InputGene')" icon="create_new_folder" :done="step > 1">
                        <div>Example: Gene1,Gene2,Gene3</div>
                        <div>
                            <q-input v-model="geneSetInput" label="" type="textarea" filled />
                        </div>
                        <q-stepper-navigation>
                            <q-btn @click="checkGeneSetInput" color="primary" label="Continue" />
                        </q-stepper-navigation>
                    </q-step>

                    <q-step :name="2" :title="$t('Verify')" icon="settings" :done="step > 2">
                        {{ geneSetMessage }}

                        <q-stepper-navigation>
                            <q-btn @click="geneSetStep = 1" color="primary" label="Back" />
                            <q-btn flat @click="confirmGeneSetInput" color="primary" label="Confirm" class="q-ml-sm" />
                        </q-stepper-navigation>
                    </q-step>
                </q-stepper>
            </div>
        </q-card>
    </q-dialog>
</template>

<script setup>

import { ref } from 'vue'

const genesetEdit = ref(false)
const geneSetStep = ref(1)
const geneSetMessage = ref("Ok")
const geneSetOkValue = ref([])
const geneSetErrValue = ref([])
const step = ref(1)
const gene = defineModel('gene')
const visible = defineModel('visible')
const geneSetInput = ref(gene.value)


const props = defineProps({
    baseGenes: {
        type: Array,
        required: false,
        default: () => [],
    }
})

const confirmGeneSetInput = () => {
    // innerSearchParams.value.geneSet = [...geneSetOkValue.value, ...geneSetErrValue.value].join(",")
    geneSetStep.value = 1;
    genesetEdit.value = false
    gene.value = geneSetInput.value
    visible.value = false
}

const checkGeneSetInput = () => {
    geneSetStep.value = 2
    let okValues = new Set()
    let errValues = new Set()

    for (const element of geneSetInput.value.split(",")) {
        let gene = element.trim()
        if (props.baseGenes.indexOf(gene) > 0) {
            okValues.add(gene)
        } else if (gene.length > 0) {
            errValues.add(gene)
        }
    }
    geneSetOkValue.value = [...okValues]
    geneSetErrValue.value = [...errValues]
    if (geneSetErrValue.value.length == 0 && geneSetOkValue.value.length == 0) {
        geneSetMessage.value = t("NoValidData")
    } else if (geneSetErrValue.value.length != 0) {
        geneSetMessage.value = geneSetErrValue.value.join(",") + " " + t("NotInGeneList")
    } else {
        geneSetMessage.value = "OK"
    }
}
</script>

<style scoped lang="scss"></style>

<template>
    <q-page padding style="overflow-x: hidden">
        <PageTitle :title="$t('SystemSetting')" />
        <div class="q-py-md">
            <q-list bordered class="rounded-borders">
                <q-expansion-item
                    expand-separator
                    default-opened
                    dense
                    icon="auto_mode"
                    :label="$t('ServerResourceSetting')"
                    header-class="bg-primary text-white"
                >
                    <q-card>
                        <q-card-section>
                            <q-form ref="form" class="row" @submit="submit">
                                <q-item class="col-4">
                                    <q-input
                                        type="number"
                                        stack-label
                                        filled
                                        label-color="primary"
                                        :label="$t('ParallelTaskLimit')"
                                        v-model.number="max_task.value"
                                        :rules="[(val) => (val !== null && val > 0 && val%1 === 0) || $t('InvalidValue')]"
                                    >
                                        <template v-slot:after>
                                            <q-icon name="help_outline">
                                                <q-tooltip>{{ $t('TaskSettingTip') }}</q-tooltip>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                </q-item>
                                <q-item class="col-4">
                                    <q-input
                                        type="number"
                                        stack-label
                                        filled
                                        label-color="primary"
                                        :label="$t('MemoryUsageLimit')"
                                        v-model.number="memory_rate.value"
                                        :rules="[(val) => (val !== null && val > 0 && val <=1) || $t('InvalidValue')]"
                                    >
                                        <template v-slot:after>
                                            <q-icon name="help_outline">
                                                <q-tooltip>{{ $t('MemorySettingTip') }}</q-tooltip>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                </q-item>
                                <q-item class="col-4">
                                    <q-input
                                        type="number"
                                        stack-label
                                        filled
                                        label-color="primary"
                                        :label="$t('DiskUsageLimit')"
                                        v-model.number="disk.value"
                                        :rules="[(val) => (val !== null && val > 0) || $t('InvalidValue')]"
                                    >
                                        <template v-slot:after>
                                            <q-icon name="help_outline">
                                                <q-tooltip>{{ $t('DiskSettingTip') }}</q-tooltip>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                </q-item>
                                <q-item v-if="amISuper()" class="col-4">
                                    <q-input
                                        type="number"
                                        stack-label
                                        filled
                                        label-color="primary"
                                        :label="$t('AllowedRunningTime')"
                                        v-model.number="allowedRunningDays.value"
                                        :rules="[(val) => (val !== null && val > 0) || $t('InvalidValue')]"
                                    >
                                        <template v-slot:after>
                                            <span class="q-ml-sm text-grey" style="font-size: 14px"
                                                >{{$t('AlreadyRun')}}:
                                                {{allowedRunningDays.used + $t('Days')}}
                                            </span>
                                        </template>
                                    </q-input>
                                </q-item>
                                <q-item v-if="amISuper()" class="col-4">
                                    <q-input
                                        type="number"
                                        stack-label
                                        filled
                                        label-color="primary"
                                        :label="$t('ParallelManagerUser')"
                                        v-model.number="max_manager_user.value"
                                        :rules="[(val) => (val !== null && val > 0 && val%1 === 0) || $t('InvalidValue')]"
                                    />
                                </q-item>
                                <q-item v-if="amISuper()" class="col-4">
                                    <q-input
                                        type="number"
                                        stack-label
                                        filled
                                        label-color="primary"
                                        :label="$t('ParallelNormalUser')"
                                        v-model.number="max_normal_user.value"
                                        :rules="[(val) => (val !== null && val > 0 && val%1 === 0) || $t('InvalidValue')]"
                                    />
                                </q-item>
                            </q-form>
                        </q-card-section>
                        <q-card-actions align="right">
                            <q-btn
                                class="q-mr-lg"
                                color="primary"
                                type="submit"
                                icon="save_as"
                                :label="$t('Save')"
                                @click="submit"
                            />
                        </q-card-actions>
                    </q-card>
                </q-expansion-item>
                <q-expansion-item
                    expand-separator
                    default-opened
                    dense
                    icon="auto_mode"
                    label="自建参考基因组配置"
                    class="q-mt-md"
                    header-class="bg-primary text-white"
                >
                    <q-card>
                        <q-form @submit="submitRefGenome">
                            <div class="row q-pa-lg">
                                <q-input
                                    stack-label
                                    filled
                                    label-color="primary"
                                    :label="$t('DockerImageName')"
                                    v-model="refGenomeDockerImage.data"
                                    :rules="[(val) => val !== null && val !== '' || 'Please type your age'|| $t('Required')]"
                                />
                            </div>
                            <q-card-actions align="right">
                                <q-btn
                                    class="q-mr-lg"
                                    color="primary"
                                    type="submit"
                                    icon="save_as"
                                    :label="$t('Save')"
                                />
                            </q-card-actions>
                        </q-form>
                    </q-card>
                </q-expansion-item>
            </q-list>
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import {ref, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import {createConfig, listConfig, updateConfig} from 'src/api/config'
import { amISuper } from 'src/utils/user'

const form = ref(null)
const max_task = ref({})
const max_manager_user = ref({
    id:0,
    name:"max_manager_user",
    value: 1,
    used:1,
})
const max_normal_user = ref({
    id:0,
    name:"max_normal_user",
    value: 10,
    used:10,
})
const memory_rate = ref({})
const disk = ref({})
const allowedRunningDays = ref({})
const refGenomeDockerImage = ref({
    id: null,
    name: 'ref_genome_docker_image',
    data: '',
})

const $q = useQuasar()

onMounted(() => {
    refresh()
})

const submit = () => {
    updateConfig(max_task.value)
    updateConfig(memory_rate.value)
    updateConfig(max_manager_user.value)
    updateConfig(max_normal_user.value)
    if (amISuper()) {
        updateConfig(allowedRunningDays.value)
    }
    updateConfig(disk.value).then(res => {
        $q.notify({
            message: t('Success'),
            type: 'positive'
        })
    })
}

const submitRefGenome = () => {
    if (!refGenomeDockerImage.value.id) {
        createConfig(refGenomeDockerImage.value)
    } else {
        updateConfig(refGenomeDockerImage.value)
    }
}

const refresh = () => {
    listConfig().then(res => {
        for (let cfg of res.results) {
            if (cfg.name === 'max_task') {
                max_task.value = cfg
            }
            if (cfg.name === 'memory_rate') {
                memory_rate.value = cfg
            }
            if (cfg.name === 'disk') {
                disk.value = cfg
            }
            if (cfg.name === 'max_manager_user') {
                max_manager_user.value = cfg
            }
            if (cfg.name === 'max_normal_user') {
                max_normal_user.value = cfg
            }
            if (cfg.name === 'allowed_running_days') {
                allowedRunningDays.value = cfg
            }
            if (cfg.name === 'ref_genome_docker_image') {
                refGenomeDockerImage.value = cfg
            }
        }
    })
}
</script>

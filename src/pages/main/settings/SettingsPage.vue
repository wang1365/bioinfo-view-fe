<template>
    <q-page padding class="settings-page" style="overflow-x: hidden">
        <PageTitle :title="$t('SystemSetting')" />

        <!-- 系统版本信息 -->
        <div class="q-mb-sm">
            <q-card class="bg-grey-1">
                <q-card-section class="row items-center q-pa-md">
                    <q-icon name="info" color="primary" size="md" class="q-mr-md" />
                    <div>
                        <div class="text-h6 text-primary">系统版本信息</div>
                        <div class="text-body2 text-grey-7 q-mt-xs">
                            当前分支: <span class="text-weight-bold text-primary">{{ gitBranch }}</span>
                            <span class="q-mx-sm">|</span>
                            提交版本: <span class="text-caption text-grey-6">{{ gitCommit.substring(0, 8) }}</span>
                            <span class="q-mx-sm">|</span>
                            提交时间: <span class="text-caption text-grey-6">{{ formatDateTime(gitCommitDate) }}</span>
                            <span class="q-mx-sm">|</span>
                            构建时间: <span class="text-caption text-grey-6">{{ formatDateTime(buildTime) }}</span>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>

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
import {ref, onMounted, computed} from 'vue'
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

// Git版本信息
const gitBranch = computed(() => {
    return typeof __GIT_BRANCH__ !== 'undefined' ? __GIT_BRANCH__ : 'unknown'
})

const gitCommit = computed(() => {
    return typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'unknown'
})

const gitVersion = computed(() => {
    return typeof __GIT_VERSION__ !== 'undefined' ? __GIT_VERSION__ : 'unknown'
})

const gitCommitDate = computed(() => {
    return typeof __GIT_COMMIT_DATE__ !== 'undefined' ? __GIT_COMMIT_DATE__ : '未知时间'
})

const buildTime = computed(() => {
    return typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '未知时间'
})

// 时间格式化函数
const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === '未知时间') {
        return '未知时间'
    }
    try {
        const date = new Date(dateTimeStr)
        if (isNaN(date.getTime())) {
            return dateTimeStr
        }
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } catch (error) {
        return dateTimeStr
    }
}

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
            message: 'Success',
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

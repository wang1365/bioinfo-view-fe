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

        <div class="q-py-sm">
            <q-list bordered class="rounded-borders">
                <q-expansion-item
                    expand-separator
                    default-opened
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
                            <AppActionButton
                                class="q-mr-lg"
                                variant="primary"
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
                    icon="auto_mode"
                    label="自建参考基因组配置"
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
                                <AppActionButton
                                    class="q-mr-lg"
                                    variant="primary"
                                    type="submit"
                                    icon="save_as"
                                    :label="$t('Save')"
                                />
                            </q-card-actions>
                        </q-form>
                    </q-card>
                </q-expansion-item>

                <!-- PageAgent AI 助手配置 -->
                <q-expansion-item
                    expand-separator
                    default-opened
                    icon="smart_toy"
                    label="AI 助手配置"
                    header-class="bg-primary text-white"
                >
                    <q-card>
                        <q-card-section>
                            <q-toggle
                                v-model="agentForm.enabled"
                                label="启用 PageAgent AI 助手"
                                color="primary"
                            />

                            <template v-if="agentForm.enabled">
                                <div class="row q-col-gutter-md">
                                    <q-select
                                        class="col-4"
                                        v-model="agentForm.model"
                                        :options="agentModelOptions"
                                        label="LLM 模型"
                                        outlined
                                        dense
                                        emit-value
                                        map-options
                                    />

                                    <q-input
                                        class="col-4"
                                        v-model="agentForm.baseURL"
                                        label="API Base URL"
                                        outlined
                                        dense
                                        hint="兼容 OpenAI 接口格式的 API 地址"
                                    />

                                    <q-input
                                        class="col-4"
                                        v-model="agentForm.apiKey"
                                        label="API Key"
                                        outlined
                                        dense
                                        :type="agentShowKey ? 'text' : 'password'"
                                        hint="LLM 服务的 API Key，存储在系统后端"
                                    >
                                        <template v-slot:append>
                                            <q-icon
                                                :name="agentShowKey ? 'visibility_off' : 'visibility'"
                                                class="cursor-pointer"
                                                @click="agentShowKey = !agentShowKey"
                                            />
                                        </template>
                                    </q-input>
                                </div>

                                <div class="row q-col-gutter-md">
                                    <q-select
                                        class="col-4"
                                        v-model="agentForm.language"
                                        :options="agentLanguageOptions"
                                        label="语言"
                                        outlined
                                        dense
                                        emit-value
                                        map-options
                                    />
                                </div>

                                <q-banner class="bg-blue-1 text-blue-9" rounded>
                                    <template v-slot:avatar>
                                        <q-icon name="info" />
                                    </template>
                                    <div class="text-body2">
                                        <strong>安全提示：</strong>API Key 与模型配置一起存储在系统后端，请确保后端服务访问权限受控。API Key 不会存储在浏览器本地。
                                    </div>
                                </q-banner>

                                <q-banner v-if="agentStore.isConfigured && agentStore.initialized" class="bg-green-1 text-green-9" rounded>
                                    <template v-slot:avatar>
                                        <q-icon name="check_circle" />
                                    </template>
                                    PageAgent 已初始化并正常运行
                                </q-banner>

                                <q-banner v-if="agentStore.isConfigured && !agentStore.initialized" class="bg-orange-1 text-orange-9" rounded>
                                    <template v-slot:avatar>
                                        <q-icon name="warning" />
                                    </template>
                                    PageAgent 已配置但未初始化，保存后将重新初始化
                                </q-banner>
                            </template>
                        </q-card-section>
                        <q-card-actions align="right">
                            <q-btn flat label="重置" color="grey" @click="agentResetForm" />
                            <AppActionButton
                                class="q-mr-lg"
                                variant="primary"
                                icon="save_as"
                                label="保存"
                                @click="agentSave"
                            />
                        </q-card-actions>
                    </q-card>
                </q-expansion-item>
            </q-list>
        </div>
    </q-page>
</template>

<script setup>
import PageTitle from "components/page-title/PageTitle.vue";
import AppActionButton from 'src/components/button/AppActionButton.vue'
import {ref, reactive, onMounted, computed} from 'vue'
import {useQuasar} from 'quasar'
import {createConfig, listConfig, updateConfig} from 'src/api/config'
import { amISuper } from 'src/utils/user'
import { usePageAgentStore } from 'src/stores/pageAgent'

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
    agentRefresh()
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

// ========== PageAgent AI 助手配置 ==========
const agentStore = usePageAgentStore()
const agentShowKey = ref(false)
const agentBackendId = ref(null) // 后端配置记录 id

const agentModelOptions = [
    { label: 'Qwen3.5 Plus (推荐)', value: 'qwen3.5-plus' },
    { label: 'Qwen3 Plus', value: 'qwen3-plus' },
    { label: 'Qwen3 235B A22B', value: 'qwen3-235b-a22b' },
    { label: 'Qwen Max', value: 'qwen-max' },
    { label: 'Qwen Plus', value: 'qwen-plus' },
    { label: 'Qwen Turbo', value: 'qwen-turbo' },
    { label: 'DeepSeek Chat', value: 'deepseek-chat' },
    { label: 'DeepSeek Reasoner', value: 'deepseek-reasoner' },
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
    { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
]

const agentLanguageOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
]

const defaults = agentStore.defaults

const agentForm = reactive({
    enabled: agentStore.enabled,
    apiKey: agentStore.apiKey,
    model: agentStore.model || defaults.model,
    baseURL: agentStore.baseURL || defaults.baseURL,
    language: agentStore.language || defaults.language,
})

// 从后端加载 AI 助手配置
function agentRefresh() {
    listConfig().then(res => {
        const cfg = (res.results || []).find(c => c.name === 'page_agent_config')
        if (cfg && cfg.data) {
            agentBackendId.value = cfg.id
            const data = typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data
            // 后端配置覆盖表单
            if (data.apiKey !== undefined) agentForm.apiKey = data.apiKey
            if (data.model !== undefined) agentForm.model = data.model
            if (data.baseURL !== undefined) agentForm.baseURL = data.baseURL
            if (data.language !== undefined) agentForm.language = data.language
            if (data.enabled !== undefined) agentForm.enabled = data.enabled
        } else {
            // 后端无配置，使用前端兜底默认值（apiKey 无默认值）
            agentBackendId.value = null
            agentForm.apiKey = ''
            agentForm.model = defaults.model
            agentForm.baseURL = defaults.baseURL
            agentForm.language = defaults.language
            agentForm.enabled = defaults.enabled
        }
    }).catch(() => {
        // 接口失败，保持本地默认值
    })
}

function agentResetForm() {
    agentForm.enabled = defaults.enabled
    agentForm.apiKey = ''
    agentForm.model = defaults.model
    agentForm.baseURL = defaults.baseURL
    agentForm.language = defaults.language
}

async function agentSave() {
    // 1. 保存全部配置到后端
    const backendData = JSON.stringify({
        apiKey: agentForm.apiKey,
        model: agentForm.model,
        baseURL: agentForm.baseURL,
        language: agentForm.language,
        enabled: agentForm.enabled,
    })

    try {
        if (agentBackendId.value) {
            await updateConfig({
                id: agentBackendId.value,
                name: 'page_agent_config',
                data: backendData,
            })
        } else {
            const res = await createConfig({
                name: 'page_agent_config',
                data: backendData,
            })
            agentBackendId.value = res.id
        }
    } catch (e) {
        console.warn('[PageAgent] 保存后端配置失败:', e)
    }

    // 2. 同步到本地 store（apiKey 仅存本地）
    agentStore.updateConfig({
        apiKey: agentForm.apiKey,
        model: agentForm.model,
        baseURL: agentForm.baseURL,
        language: agentForm.language,
    })
    agentStore.setEnabled(agentForm.enabled)

    // 3. 通知 boot 重新初始化
    if (typeof window.__initPageAgent === 'function') {
        window.__initPageAgent()
    }

    $q.notify({
        message: 'AI 助手配置已保存',
        type: 'positive',
    })
}
</script>

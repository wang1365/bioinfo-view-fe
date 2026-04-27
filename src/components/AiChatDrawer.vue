<template>
    <q-drawer
        v-model="visible"
        side="right"
        :width="drawerWidth"
        :breakpoint="800"
        bordered
        class="ai-chat-drawer"
        @hide="onHide"
    >
        <!-- 左侧拖拽手柄 -->
        <div
            class="ai-chat-resize-handle"
            @mousedown.prevent="startResize"
        >
            <div class="ai-chat-resize-handle__line"></div>
        </div>

        <!-- 头部 -->
        <div class="ai-chat-header">
            <div class="ai-chat-header__title">
                <q-icon name="biotech" size="20px" class="q-mr-xs" />
                AI 生信助手
            </div>
            <div class="ai-chat-header__actions row items-center no-wrap">
                <div class="ai-chat-reasoning-toggle">
                    <span class="ai-chat-reasoning-toggle__label">推理</span>
                    <q-toggle
                        v-model="reasoningEnabled"
                        dense
                        color="primary"
                        size="xs"
                        keep-color
                    >
                        <q-tooltip>开启后模型会展示推理过程</q-tooltip>
                    </q-toggle>
                </div>
                <q-separator vertical inset class="q-mx-sm" />
                <q-btn dense flat round color="white" icon="delete_sweep" size="sm" @click="clearMessages">
                    <q-tooltip>清空对话</q-tooltip>
                </q-btn>
                <q-btn dense flat round color="white" icon="close" size="sm" @click="visible = false" />
            </div>
        </div>

        <!-- 消息列表 -->
        <div class="ai-chat-messages" ref="messagesContainer">
            <div v-if="messages.length === 0" class="ai-chat-empty">
                <!-- 装饰性背景圆 -->
                <div class="ai-chat-empty__glow"></div>
                <div class="ai-chat-empty__ring ai-chat-empty__ring--1"></div>
                <div class="ai-chat-empty__ring ai-chat-empty__ring--2"></div>
                <!-- 图标区域 -->
                <div class="ai-chat-empty__icon-wrap">
                    <svg class="ai-chat-empty__dna" viewBox="0 0 80 80" fill="none">
                        <path d="M20 10c6 8 12 16 20 16s14-8 20-16M20 70c6-8 12-16 20-16s14 8 20 16" stroke="url(#dnaGrad)" stroke-width="2.5" stroke-linecap="round"/>
                        <path d="M20 28c5-4 11 2 20 2s15-6 20-2M20 52c5 4 11-2 20-2s15 6 20 2" stroke="url(#dnaGrad)" stroke-width="2" stroke-linecap="round" opacity=".7"/>
                        <path d="M28 13v54M52 13v54" stroke="url(#dnaGrad)" stroke-width="1.5" stroke-dasharray="3 3" opacity=".35"/>
                        <defs>
                            <linearGradient id="dnaGrad" x1="20" y1="10" x2="60" y2="70">
                                <stop offset="0%" stop-color="#39b6ff" />
                                <stop offset="100%" stop-color="#bd45fb" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div class="ai-chat-empty__title  text-primary">AI 生信专家</div>
                <div class="ai-chat-empty__desc text-primary">基因变异 · NGS分析 · 临床解读</div>
                <div class="ai-chat-quick-actions q-mt-lg">
                    <button
                        v-for="(hint, i) in quickHints"
                        :key="hint"
                        @click="sendMessage(hint)"
                    >
                        <span class="ai-chat-hint-btn__dot">{{ i + 1 }}</span>
                        {{ hint }}
                    </button>
                </div>
            </div>

            <template v-for="(msg, idx) in messages" :key="idx">
                <div :class="['ai-chat-bubble-row', msg.role === 'user' ? 'is-user' : 'is-assistant']">
                    <div v-if="msg.role === 'assistant'" class="ai-chat-avatar">
                        <q-icon name="biotech" size="16px" color="white" />
                    </div>
                    <div :class="['ai-chat-bubble', `ai-chat-bubble--${msg.role}`]">
                        <!-- 推理过程（可折叠） -->
                        <div v-if="msg.thinking" class="ai-chat-thinking">
                            <div class="ai-chat-thinking__header" @click="toggleThinking(idx)">
                                <q-icon
                                    :name="msg.thinkingExpanded ? 'expand_less' : 'expand_more'"
                                    size="16px"
                                    class="q-mr-xs"
                                />
                                <span class="ai-chat-thinking__title">
                                    {{ msg.thinkingExpanded ? '收起推理过程' : '查看推理过程' }}
                                </span>
                                <span v-if="!msg.thinkingExpanded" class="ai-chat-thinking__badge">
                                    {{ msg.thinking.length }} 字
                                </span>
                            </div>
                            <div v-if="msg.thinkingExpanded" class="ai-chat-thinking__body">
                                {{ msg.thinking }}
                            </div>
                        </div>
                        <!-- 正文 -->
                        <div class="ai-chat-bubble__content" v-html="renderMarkdown(msg.content)"></div>
                        <div v-if="msg.role === 'assistant' && msg.loading && !msg.content && !msg.thinking" class="ai-chat-cursor">
                            <span class="ai-chat-cursor__dot"></span>
                        </div>
                    </div>
                </div>
            </template>

            <div v-if="error" class="ai-chat-error">
                <q-icon name="error_outline" size="16px" class="q-mr-xs" />
                {{ error }}
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="ai-chat-input-area">
            <div class="ai-chat-input-wrap">
                <q-input
                    v-model="inputText"
                    dense
                    borderless
                    placeholder="输入生信问题..."
                    class="ai-chat-input"
                    @keydown.enter.exact.prevent="handleSend"
                    :disable="loading"
                />
                <q-btn
                    dense
                    flat
                    round
                    :icon="loading ? 'stop' : 'send'"
                    :color="loading ? 'negative' : 'primary'"
                    :disable="!loading && !inputText.trim()"
                    @click="handleSend"
                >
                    <q-tooltip>{{ loading ? '停止生成' : '发送' }}</q-tooltip>
                </q-btn>
            </div>
        </div>
    </q-drawer>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { streamChat } from 'src/api/chat'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })

const messagesContainer = ref(null)
const inputText = ref('')
const loading = ref(false)
const error = ref('')
const messages = ref([])
const reasoningEnabled = ref(false)
const drawerWidth = ref(420)

let abortController = null
let isResizing = false

// ---- 打字机匀速输出队列 ----
// 解决 qwen3 等高速模型在 <300ms 内全量返回导致无流式效果的问题
let contentQueue = []      // 待显示的内容片段队列
let thinkingQueue = []
let contentTimer = null    // 内容打字机定时器（独立）
let thinkingTimer = null   // 推理打字机定时器（独立）

/** 打字机帧间隔（ms），越小越快 */
const TYPEWRITER_INTERVAL = 18

/** 启动内容打字机 */
function startContentTypewriter() {
    if (contentTimer) return // 已在运行
    contentTimer = setInterval(() => {
        if (contentQueue.length === 0) {
            clearInterval(contentTimer)
            contentTimer = null
            return
        }
        const chunk = contentQueue.shift()
        assistantMsg.content += chunk
        scrollToBottom()
    }, TYPEWRITER_INTERVAL)
}

/** 启动推理打字机 */
function startThinkingTypewriter() {
    if (thinkingTimer) return
    thinkingTimer = setInterval(() => {
        if (thinkingQueue.length === 0) {
            clearInterval(thinkingTimer)
            thinkingTimer = null
            return
        }
        const chunk = thinkingQueue.shift()
        assistantMsg.thinking += chunk
        if (!assistantMsg.thinkingExpanded) {
            assistantMsg.thinkingExpanded = true
        }
        scrollToBottom()
    }, TYPEWRITER_INTERVAL)
}

/** 入队内容片段 */
function enqueueContent(chunk) {
    contentQueue.push(chunk)
    if (!contentTimer) startContentTypewriter()
}

/** 入队推理片段 */
function enqueueThinking(chunk) {
    thinkingQueue.push(chunk)
    if (!thinkingTimer) startThinkingTypewriter()
}

/** 停止所有打字机，立即刷新剩余内容 */
function flushTypewriter() {
    if (contentTimer) { clearInterval(contentTimer); contentTimer = null; }
    if (thinkingTimer) { clearInterval(thinkingTimer); thinkingTimer = null; }
    while (contentQueue.length > 0) { assistantMsg.content += contentQueue.shift(); }
    while (thinkingQueue.length > 0) { assistantMsg.thinking += thinkingQueue.shift(); }
}

// 当前正在生成的助手消息引用（供闭包使用）
let assistantMsg = null

// ---- 抽屉拖拽调整宽度 ----
function startResize() {
    isResizing = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev) => {
        if (!isResizing) return
        const newWidth = window.innerWidth - ev.clientX
        drawerWidth.value = Math.max(320, Math.min(newWidth, 800))
    }

    const onUp = () => {
        isResizing = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
}

const quickHints = [
    '什么是TMB？',
    '如何解读致病性变异？',
    '推荐肺癌检测流程',
]

function scrollToBottom() {
    nextTick(() => {
        const el = messagesContainer.value
        if (el) el.scrollTop = el.scrollHeight
    })
}

function toggleThinking(idx) {
    const msg = messages.value[idx]
    if (msg) msg.thinkingExpanded = !msg.thinkingExpanded
}

async function sendMessage(text) {
    if (!text.trim() || loading.value) return
    error.value = ''

    // 重置打字机队列
    flushTypewriter()
    contentQueue = []
    thinkingQueue = []

    // 添加用户消息
    messages.value.push({ role: 'user', content: text.trim() })
    inputText.value = ''
    scrollToBottom()

    // 添加助手占位消息
    assistantMsg = {
        role: 'assistant',
        content: '',
        thinking: '',
        thinkingExpanded: false,
        loading: true,
    }
    messages.value.push(assistantMsg)
    scrollToBottom()

    loading.value = true
    abortController = new AbortController()

    try {
        // 已完成的对话历史（排除当前正在生成的占位消息和用户最新问题）
        const history = messages.value
            .slice(0, -2)  // 去掉最后两条：用户当前问题 + 助手占位
            .filter((m) => m.content)
            .map((m) => ({ role: m.role, content: m.content }))

        const currentQuestion = text.trim()

        await streamChat(
            currentQuestion,
            history,
            {
                onContent: (chunk) => { enqueueContent(chunk) },
                onThinking: (chunk) => { enqueueThinking(chunk) },
            },
            reasoningEnabled.value,
            abortController.signal,
        )

        // 流结束 — 停止打字机定时器，将队列中剩余内容一次性写入
        // 注意：不使用 result 覆盖 content，因为打字机已经逐步写入了
        flushTypewriter()
        assistantMsg.loading = false
        if (assistantMsg.thinking) {
            assistantMsg.thinkingExpanded = false
        }
    } catch (e) {
        // 出错/中止 — 也需刷新队列
        flushTypewriter()
        if (e.name === 'AbortError') {
            assistantMsg.loading = false
            if (!assistantMsg.content && !assistantMsg.thinking) {
                assistantMsg.content = '（已停止生成）'
            }
        } else {
            error.value = e.message || '请求失败，请检查 API 配置'
            const last = messages.value[messages.value.length - 1]
            if (last === assistantMsg && !last.content && !last.thinking) {
                messages.value.pop()
            }
        }
        assistantMsg.loading = false
    } finally {
        loading.value = false
        abortController = null
        scrollToBottom()
    }
}

function handleSend() {
    if (loading.value) {
        abortController?.abort()
        return
    }
    sendMessage(inputText.value)
}

function clearMessages() {
    messages.value = []
    error.value = ''
}

function onHide() {
    if (loading.value) {
        abortController?.abort()
    }
}

/**
 * 简易 Markdown 渲染：代码块、加粗、换行
 */
function renderMarkdown(text) {
    if (!text) return ''
    let html = escapeHtml(text)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="ai-chat-code-block"><code>$2</code></pre>')
    html = html.replace(/`([^`]+)`/g, '<code class="ai-chat-code-inline">$1</code>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\n/g, '<br/>')
    return html
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}
</script>

<style lang="scss" scoped>
/* ===== 抽屉根容器 ===== */
.ai-chat-drawer {
    display: flex;
    flex-direction: column;
    position: relative;
    background:
        radial-gradient(ellipse 60% 50% at 70% 10%, rgba(57, 182, 255, 0.06), transparent),
        radial-gradient(ellipse 40% 40% at 30% 90%, rgba(189, 69, 251, 0.04), transparent),
        linear-gradient(180deg, #0c1222 0%, #111827 40%, #0c1222 100%);
    box-shadow: -6px 0 32px rgba(0, 0, 0, 0.3);
}

/* ===== 拖拽手柄 ===== */
.ai-chat-resize-handle {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 8px; z-index: 10; cursor: col-resize;

    &::before {
        content: ''; position: absolute; left: 3px; top: 12%; bottom: 12%;
        width: 2px; border-radius: 1px;
        background: linear-gradient(180deg,
            transparent 5%,
            rgba(57,182,255,.25) 20%,
            rgba(57,182,255,.4) 50%,
            rgba(189,69,251,.25) 80%,
            transparent 95%
        );
        opacity: 0; transition: opacity .35s ease;
    }
    &:hover::before { opacity: 1; }
    &__line { display: none; }
}

/* ===== 头部 ===== */
.ai-chat-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    background: linear-gradient(180deg, rgba(15,23,42,.98), rgba(17,24,39,.85));
    border-bottom: 1px solid rgba(57, 182, 255, 0.08);
    backdrop-filter: blur(10px);

    &__title {
        display: flex; align-items: center; gap: 8px;
        font-size: 0.92rem; font-weight: 700;
        letter-spacing: 0.3px;
        color: #f1f5f9;

        :deep(.q-icon) {
            background: linear-gradient(135deg, #39b6ff, #a78bfa);
            -webkit-background-clip: text; background-clip: text;
            filter: drop-shadow(0 0 6px rgba(57,182,255,.35));
        }
    }

    &__actions {
        gap: 4px; align-items: center;

        :deep(.q-btn) { color: #94a3b8; }

        :deep(.q-btn:hover) { color: #e2e8f0; }
    }
}

.ai-chat-reasoning-toggle {
    display: flex; align-items: center; gap: 5px;
    padding: 2px 8px 2px 4px;
    border-radius: 16px;
    background: rgba(57,182,255,.06);
    border: 1px solid rgba(57,182,255,.08);

    &__label {
        font-size: 0.72rem; font-weight: 500;
        color: #7dd3fc; white-space: nowrap;
        letter-spacing: 0.5px;
    }
}

/* ===== 消息列表（滚动区域）===== */
.ai-chat-messages {
    flex: 1; overflow-y: auto;
    padding: 24px 18px 12px;
    scroll-behavior: smooth;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb {
        background: rgba(148,163,184,.15); border-radius: 4px;
        &:hover { background: rgba(148,163,184,.28); }
    }
}

/* ===== 空状态 ===== */
.ai-chat-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center;
    height: 100%; min-height: 280px;
    position: relative;

    /* 背景装饰 */
    &__glow {
        position: absolute;
        width: 200px; height: 200px;
        top: 50%; left: 50%;
        transform: translate(-50%, -55%);
        background: radial-gradient(circle, rgba(57,182,255,.08) 0%, transparent 70%);
        pointer-events: none;
    }

    /* 旋转光环 */
    &__ring {
        position: absolute; border-radius: 50%; pointer-events: none;

        &--1 {
            width: 160px; height: 160px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(57,182,255,.08);
            animation: emptyRingRotate 12s linear infinite;
        }

        &--2 {
            width: 200px; height: 200px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            border: 1px dashed rgba(189,69,251,.06);
            animation: emptyRingRotate 18s linear infinite reverse;
        }
    }

    /* DNA 图标 */
    &__icon-wrap {
        position: relative;
        z-index: 1;
        margin-bottom: 18px;
    }

    &__dna {
        width: 68px; height: 68px;
        animation: dnaFloat 4s ease-in-out infinite;
        filter: drop-shadow(0 0 12px rgba(57,182,255,.2));
    }

    &__title {
        position: relative; z-index: 1;
        font-size: 1.05rem; font-weight: 700;
        letter-spacing: 1px;
        background: linear-gradient(135deg, #e2e8f0, #94a3b8);
        -webkit-background-clip: text; background-clip: text;
        color: transparent;
        margin-bottom: 6px;
    }

    &__desc {
        position: relative; z-index: 1;
        font-size: 0.78rem;
        color: #475569;
        letter-spacing: 2px;
    }
}

@keyframes emptyRingRotate {
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes dnaFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-6px) scale(1.03); }
}

/* ===== 快捷提问按钮 ===== */
.ai-chat-quick-actions {
    display: flex; flex-wrap: wrap; gap: 8px;
    justify-content: center;
    max-width: 320px;
    position: relative; z-index: 1;
}

.ai-chat-hint-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 0.82rem;
    color: #94a3b8;
    background: rgba(51,65,85,.45);
    border: 1px solid rgba(71,85,105,.35);
    cursor: pointer;
    transition: all .25s cubic-bezier(.4, 0, .2, 1);
    white-space: nowrap;
    user-select: none;

    &:hover {
        color: #e2e8f0;
        background: rgba(57,182,255,.1);
        border-color: rgba(57,182,255,.3);
        box-shadow: 0 2px 12px rgba(57,182,255,.1);
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0) scale(.97);
    }

    &__dot {
        display: inline-flex; align-items: center; justify-content: center;
        width: 18px; height: 18px; min-width: 18px;
        border-radius: 50%;
        font-size: 0.68rem; font-weight: 700;
        background: linear-gradient(135deg, #39b6ff, #bd45fb);
        color: #fff;
    }
}

/* ===== 消息气泡行 ===== */
.ai-chat-bubble-row {
    display: flex; align-items: flex-start;
    margin-bottom: 16px; gap: 9px;

    &.is-user { flex-direction: row-reverse; }
}

.ai-chat-avatar {
    width: 30px; height: 30px; min-width: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #39b6ff 0%, #8b5cf6 60%, #bd45fb 100%);
    display: flex; align-items: center; justify-content: center;
    margin-top: 3px;
    box-shadow: 0 2px 10px rgba(57,182,255,.25);
}

/* ===== 气泡 ===== */
.ai-chat-bubble {
    max-width: 84%;
    padding: 11px 15px;
    border-radius: 16px;
    font-size: 0.88rem;
    line-height: 1.7;
    word-break: break-word;

    &--user {
        background: linear-gradient(135deg, #1e49b7, #1652a8);
        color: #fff;
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 14px rgba(22,82,168,.22);
    }

    &--assistant {
        background: rgba(30,41,59,.75);
        color: #cbd5e1;
        border: 1px solid rgba(57,182,255,.07);
        border-bottom-left-radius: 4px;
        backdrop-filter: blur(10px);
    }
}

/* ===== 气泡内容 / 代码块 ===== */
.ai-chat-bubble__content {
    :deep(pre.ai-chat-code-block) {
        background: rgba(0,0,0,.45);
        color: #e2e8f0; border-radius: 8px;
        padding: 11px 13px; margin: 8px 0;
        overflow-x: auto;
        font-size: 0.81rem; line-height: 1.55;
        border: 1px solid rgba(57,182,255,.06);
    }

    :deep(code.ai-chat-code-inline) {
        background: rgba(57,182,255,.12);
        color: #7dd3fc; padding: 2px 6px;
        border-radius: 4px; font-size: 0.83rem;
    }

    :deep(strong) { color: #f1f5f9; }
}

/* ===== 推理过程 ===== */
.ai-chat-thinking {
    margin-bottom: 8px;
    border: 1px solid rgba(139,92,246,.15);
    border-radius: 10px; overflow: hidden;
    background: rgba(30,27,58,.55);

    &__header {
        display: flex; align-items: center;
        padding: 7px 11px;
        cursor: pointer; user-select: none;
        font-size: 0.76rem; color: #a78bfa;
        transition: background .2s;

        &:hover { background: rgba(139,92,246,.08); }
    }

    &__title { flex: 1; font-weight: 600; }

    &__badge {
        font-size: 0.68rem; font-weight: 600;
        color: #7c3aed;
        background: rgba(124,58,237,.12);
        padding: 1px 7px; border-radius: 10px; margin-left: 6px;
    }

    &__body {
        padding: 9px 11px;
        font-size: 0.79rem; line-height: 1.65;
        color: #a1a1aa;
        white-space: pre-wrap;
        word-break: break-word;
        border-top: 1px solid rgba(139,92,246,.08);
        background: rgba(15,12,36,.5);
        max-height: 260px; overflow-y: auto;
    }
}

/* ===== 打字光标 ===== */
.ai-chat-cursor {
    display: inline-flex; align-items: center;
    height: 18px; margin-left: 3px;
}
.ai-chat-cursor__dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #39b6ff;
    box-shadow: 0 0 8px rgba(57,182,255,.6);
    animation: cursorBlink 1s step-end infinite;
}

@keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0; }
}

/* ===== 错误提示 ===== */
.ai-chat-error {
    display: flex; align-items: center;
    padding: 9px 13px; margin-bottom: 14px;
    border-radius: 10px;
    background: rgba(185,28,28,.1);
    color: #fca5a5;
    font-size: 0.82rem;
    border: 1px solid rgba(220,38,38,.15);
}

/* ===== 输入区 ===== */
.ai-chat-input-area {
    padding: 16px 18px 20px;
    background: linear-gradient(180deg, rgba(15,23,42,.92), rgba(12,18,34,.98));
    border-top: 1px solid rgba(57,182,255,.1);
    position: relative;

    /* 顶部微光分割线 */
    &::before {
        content: '';
        position: absolute;
        top: -1px; left: 24px; right: 24px;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(57,182,255,.25), transparent);
    }
}

.ai-chat-input-wrap {
    display: flex; align-items: center; gap: 8px;
    border: 1.5px solid rgba(71,85,105,.45);
    border-radius: 26px;
    padding: 6px 8px 6px 20px;
    transition: all .3s cubic-bezier(.4,0,.2,1);
    background: linear-gradient(135deg, rgba(30,41,59,.7), rgba(41,55,78,.5));
    box-shadow:
        0 2px 12px rgba(0,0,0,.2),
        inset 0 1px 0 rgba(255,255,255,.03);

    &:focus-within {
        border-color: rgba(57,182,255,.6);
        box-shadow:
            0 0 0 3px rgba(57,182,255,.12),
            0 0 28px rgba(57,182,255,.08),
            0 4px 16px rgba(0,0,0,.25),
            inset 0 1px 0 rgba(255,255,255,.05);
        background: linear-gradient(135deg, rgba(30,41,59,.82), rgba(41,55,78,.62));
    }

    &:hover:not(:focus-within) {
        border-color: rgba(100,116,139,.5);
        background: linear-gradient(135deg, rgba(30,41,59,.75), rgba(41,55,78,.55));
    }
}

.ai-chat-input {
    flex: 1;

    :deep(.q-field__control) {
        height: 40px;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
    }

    :deep(.q-field__native) {
        font-size: 0.9rem; color: #f1f5f9;

        &::placeholder { color: #64748b; }
    }

    :deep(.q-field--float .q-field__label),
    :deep(.q-field__marginal + .q-field__control .q-field__native::placeholder) {
        color: #64748b;
    }

    /* 发送按钮增强 */
    + .q-btn {
        &.text-primary :deep(.q-icon) { color: #39b6ff !important; }
        &:hover { background: rgba(57,182,255,.12) !important; }
    }
}
</style>

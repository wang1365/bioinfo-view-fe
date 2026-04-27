import { boot } from 'quasar/wrappers'
import { PageAgent } from 'page-agent'
import { usePageAgentStore } from 'src/stores/pageAgent'
import { listConfig } from 'src/api/config'
import { bioAgentTools } from 'src/boot/agentTools'
import { SYSTEM_INSTRUCTION, getPageInstruction, getPageContext } from 'src/boot/agentInstructions'

const CONFIG_NAME = 'page_agent_config'

let pageAgentInstance = null
let panelVisible = false
let fabButton = null

/**
 * 获取 PageAgent 全局实例
 * 可在任意组件中通过 $pageAgent 或 import 使用
 */
export function getPageAgent() {
    return pageAgentInstance
}

/**
 * 从 localStorage 恢复 FAB 按钮位置
 */
function getFabPosition() {
    try {
        const saved = localStorage.getItem('page-agent-fab-pos')
        if (saved) return JSON.parse(saved)
    } catch (e) { /* ignore */ }
    return null
}

/**
 * 保存 FAB 按钮位置到 localStorage
 */
function saveFabPosition(x, y) {
    try {
        localStorage.setItem('page-agent-fab-pos', JSON.stringify({ x, y }))
    } catch (e) { /* ignore */ }
}

/**
 * 创建浮动 AI 图标按钮（支持拖动）
 */
function createFabButton() {
    if (fabButton) return

    const btn = document.createElement('div')
    btn.id = 'page-agent-fab'
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`
    Object.assign(btn.style, {
        position: 'fixed',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #39b6ff, #bd45fb)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        zIndex: '2147483640',
        boxShadow: '0 4px 12px rgba(57, 182, 255, 0.4), 0 2px 6px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        userSelect: 'none',
        touchAction: 'none',
    })

    // 恢复上次位置或使用默认位置
    const savedPos = getFabPosition()
    if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
        btn.style.left = savedPos.x + 'px'
        btn.style.top = savedPos.y + 'px'
    } else {
        btn.style.right = '24px'
        btn.style.bottom = '24px'
    }

    // --- 拖动逻辑 ---
    let isDragging = false
    let hasMoved = false
    let startX = 0
    let startY = 0
    let startLeft = 0
    let startTop = 0
    const MOVE_THRESHOLD = 5 // 超过此像素才视为拖动

    function onPointerDown(e) {
        if (e.button === 2) return // 忽略右键
        isDragging = true
        hasMoved = false
        // 读取当前实际位置
        const rect = btn.getBoundingClientRect()
        startLeft = rect.left
        startTop = rect.top
        startX = e.clientX
        startY = e.clientY
        btn.style.cursor = 'grabbing'
        btn.style.transition = 'box-shadow 0.2s ease'
        e.preventDefault()
        document.addEventListener('pointermove', onPointerMove)
        document.addEventListener('pointerup', onPointerUp)
    }

    function onPointerMove(e) {
        if (!isDragging) return
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (!hasMoved && (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)) {
            hasMoved = true
        }
        if (!hasMoved) return

        let newLeft = startLeft + dx
        let newTop = startTop + dy
        // 边界约束
        const maxLeft = window.innerWidth - 48
        const maxTop = window.innerHeight - 48
        newLeft = Math.max(0, Math.min(newLeft, maxLeft))
        newTop = Math.max(0, Math.min(newTop, maxTop))

        btn.style.left = newLeft + 'px'
        btn.style.top = newTop + 'px'
        btn.style.right = 'auto'
        btn.style.bottom = 'auto'
    }

    function onPointerUp(e) {
        if (!isDragging) return
        isDragging = false
        btn.style.cursor = 'grab'
        btn.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)

        if (hasMoved) {
            // 拖动结束，保存位置
            const rect = btn.getBoundingClientRect()
            saveFabPosition(rect.left, rect.top)
        }
    }

    btn.addEventListener('pointerdown', onPointerDown)

    // --- hover 效果 ---
    btn.addEventListener('mouseenter', () => {
        if (!isDragging) {
            btn.style.transform = 'scale(1.1)'
            btn.style.boxShadow = '0 6px 20px rgba(57, 182, 255, 0.6), 0 4px 10px rgba(0,0,0,0.3)'
        }
    })
    btn.addEventListener('mouseleave', () => {
        if (!isDragging) {
            btn.style.transform = 'scale(1)'
            btn.style.boxShadow = '0 4px 12px rgba(57, 182, 255, 0.4), 0 2px 6px rgba(0,0,0,0.2)'
        }
    })

    // --- 点击（非拖动时触发） ---
    btn.addEventListener('click', (e) => {
        if (hasMoved) return // 拖动过则不触发点击
        togglePanel()
    })

    document.body.appendChild(btn)
    fabButton = btn
}

/**
 * 移除浮动 AI 图标按钮
 */
function removeFabButton() {
    if (fabButton) {
        fabButton.remove()
        fabButton = null
    }
}

/**
 * 切换 Panel 显示/隐藏
 */
function togglePanel() {
    if (!pageAgentInstance?.panel) return
    if (panelVisible) {
        pageAgentInstance.panel.hide()
        panelVisible = false
    } else {
        pageAgentInstance.panel.show()
        pageAgentInstance.panel.expand()
        panelVisible = true
    }
}

/**
 * 显示 Panel
 */
function showPanel() {
    if (!pageAgentInstance?.panel) return
    pageAgentInstance.panel.show()
    panelVisible = true
}

/**
 * 隐藏 Panel（仅隐藏，不销毁）
 */
function hidePanel() {
    if (!pageAgentInstance?.panel) return
    pageAgentInstance.panel.hide()
    panelVisible = false
}

/**
 * 拦截 Panel 的关闭行为
 * Panel 原生的 X 按钮会 dispose agent，这里拦截让它只隐藏不销毁
 */
function interceptPanelClose() {
    if (!pageAgentInstance?.panel?.wrapper) return

    const wrapper = pageAgentInstance.panel.wrapper
    // 拦截 dispose 事件：当 Panel 的 stopButton 被点击且 agent 非运行状态时，
    // Panel 会调用 agent.dispose()，这会触发 'dispose' 事件
    // 我们在 Panel 层面拦截：找到 stopButton，替换其点击行为
    const stopBtn = wrapper.querySelector('[class*="stopButton"]')
    if (stopBtn) {
        const newBtn = stopBtn.cloneNode(true)
        stopBtn.parentNode.replaceChild(newBtn, stopBtn)
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            if (pageAgentInstance?.status === 'running') {
                pageAgentInstance.stop()
            } else {
                // 只隐藏 Panel，不销毁 agent
                hidePanel()
            }
        })
    }
}

export default boot(({ app }) => {
    const store = usePageAgentStore()

    // 挂载到 Vue 全局属性
    app.config.globalProperties.$pageAgent = null

    /**
     * 初始化或重新初始化 PageAgent
     * 当用户更新 API Key 等配置后可调用此方法
     */
    async function initPageAgent() {
        // 如果已存在实例，先销毁
        if (pageAgentInstance) {
            try {
                if (typeof pageAgentInstance.dispose === 'function') {
                    pageAgentInstance.dispose()
                }
            } catch (e) {
                console.warn('[PageAgent] dispose error:', e)
            }
            pageAgentInstance = null
            panelVisible = false
        }

        // 移除旧的浮动按钮
        removeFabButton()

        // 从后端加载配置（含 apiKey）
        try {
            const res = await listConfig()
            const cfg = (res.results || []).find(c => c.name === CONFIG_NAME)
            if (cfg && cfg.data) {
                const backendData = typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data
                store.syncFromBackend(backendData)
                // 保存后端配置记录的 id，供设置页面更新用
                store._backendId = cfg.id
            }
        } catch (e) {
            console.warn('[PageAgent] 从后端加载配置失败，使用本地默认值:', e.message)
        }

        if (!store.enabled) {
            console.log('[PageAgent] 已禁用，跳过初始化')
            store.setInitialized(false)
            app.config.globalProperties.$pageAgent = null
            return
        }

        if (!store.isConfigured) {
            console.warn('[PageAgent] 未配置 API Key，请先在设置中填写 API Key')
            store.setInitialized(false)
            app.config.globalProperties.$pageAgent = null
            return
        }

        try {
            pageAgentInstance = new PageAgent({
                model: store.model,
                baseURL: store.baseURL,
                apiKey: store.apiKey,
                language: store.language,
                // 生信领域自定义工具集
                customTools: bioAgentTools,
                // 领域指令系统
                instructions: {
                    system: SYSTEM_INSTRUCTION,
                    getPageInstructions: (url) => {
                        const pageInstruction = getPageInstruction(url)
                        const pageContext = getPageContext()
                        const parts = []
                        if (pageInstruction) parts.push(pageInstruction)
                        if (pageContext) parts.push(`当前页面上下文:\n${pageContext}`)
                        return parts.length > 0 ? parts.join('\n\n') : undefined
                    },
                },
            })
            app.config.globalProperties.$pageAgent = pageAgentInstance
            window.__pageAgentInstance = pageAgentInstance
            store.setInitialized(true)

            // 拦截 Panel 关闭行为，使其只隐藏不销毁
            interceptPanelClose()

            // 不再创建浮动 FAB 按钮，统一通过工具栏 AI 问答按钮唤起

            // 默认隐藏 Panel
            panelVisible = false

            console.log('[PageAgent] 初始化成功，点击工具栏 AI 问答按钮开始使用')
        } catch (e) {
            console.error('[PageAgent] 初始化失败:', e)
            store.setInitialized(false)
            app.config.globalProperties.$pageAgent = null
        }
    }

    // 挂载初始化方法和控制方法到全局
    app.config.globalProperties.$initPageAgent = initPageAgent
    app.config.globalProperties.$togglePageAgentPanel = togglePanel
    app.config.globalProperties.$showPageAgentPanel = showPanel
    app.config.globalProperties.$hidePageAgentPanel = hidePanel
    window.__initPageAgent = initPageAgent

    // 应用启动时自动初始化（如果已配置）
    initPageAgent()
})

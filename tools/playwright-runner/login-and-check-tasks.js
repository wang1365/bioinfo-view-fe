const { chromium } = require('playwright')
const path = require('path')

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8081'
const username = process.env.BIO_USERNAME || 'super'
const password = process.env.BIO_PASSWORD || '1234qwer'
const headless = process.env.HEADLESS === 'true'
const screenshotPath =
    process.env.SCREENSHOT_PATH || path.join(__dirname, 'task-page.png')

function printSection(name, value) {
    console.log(`${name}=${typeof value === 'string' ? value : JSON.stringify(value)}`)
}

;(async () => {
    const browser = await chromium.launch({ headless })
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const responses = []

    page.on('response', (res) => {
        const url = res.url()
        if (url.includes('/api/')) {
            responses.push({ url, status: res.status() })
        }
    })
    page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))
    page.on('pageerror', (err) => console.log('[pageerror]', err.message))

    await page.goto(`${baseUrl}/#/login`, {
        waitUntil: 'networkidle',
        timeout: 120000,
    })
    await page.locator('input[type="text"]').first().fill(username)
    await page.locator('input[type="password"]').first().fill(password)
    await page.locator('button, .q-btn').filter({ hasText: /登录/ }).first().click()

    await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {})
    await page.waitForTimeout(3000)
    printSection('AFTER_LOGIN_URL', page.url())

    if (!page.url().includes('/main')) {
        printSection('LOGIN_PAGE_TEXT', (await page.locator('body').innerText()).slice(0, 1200))
        throw new Error('Login did not redirect into the main application')
    }

    await page.goto(`${baseUrl}/#/main/tasks`, {
        waitUntil: 'networkidle',
        timeout: 120000,
    })
    await page.waitForTimeout(5000)
    printSection('TASK_URL', page.url())

    const bodyText = await page.locator('body').innerText()
    printSection('TASK_BODY', bodyText.slice(0, 2000))

    const tableInfo = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table')).map((table, idx) => ({
            idx,
            rows: table.querySelectorAll('tr').length,
            text: (table.innerText || '').slice(0, 500),
        }))
        const rows = document.querySelectorAll('tbody tr').length
        const loading = Array.from(document.querySelectorAll('*')).some((el) =>
            /加载|loading/i.test(el.textContent || '')
        )
        const empty = Array.from(document.querySelectorAll('*')).some((el) =>
            /暂无|空|No data|无数据/i.test(el.textContent || '')
        )
        return { tables, rows, loading, empty }
    })

    printSection('TABLE_INFO', tableInfo)
    printSection('API_RESPONSES', responses.slice(-20))

    if (tableInfo.rows === 0 && tableInfo.empty === false) {
        throw new Error('Task page loaded without table rows or empty-state text')
    }

    await page.screenshot({ path: screenshotPath, fullPage: true })
    printSection('SCREENSHOT', screenshotPath)

    await browser.close()
})().catch((err) => {
    console.error(err)
    process.exit(1)
})

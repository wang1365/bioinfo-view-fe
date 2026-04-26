# Codex Playwright Runner

This folder contains a reusable Playwright smoke check for the bio frontend.

## Install

```bash
cd D:\private\bio\code\bio2023\bioinfo-view-fe\tools\playwright-runner
npm install
```

## Run

```bash
cd D:\private\bio\code\bio2023\bioinfo-view-fe\tools\playwright-runner
npm run check:tasks
```

By default this script runs in headed mode and shows the browser window.
To switch back to headless mode temporarily:

```bash
set HEADLESS=true
npm run check:tasks
```

## Optional Environment Variables

```bash
BASE_URL=http://127.0.0.1:8081
BIO_USERNAME=super
BIO_PASSWORD=1234qwer
HEADLESS=false
SCREENSHOT_PATH=D:\private\bio\code\bio2023\bioinfo-view-fe\tools\playwright-runner\task-page.png
```

## What It Checks

- Opens the login page
- Logs in with the supplied account
- Opens `#/main/tasks`
- Confirms the task table has rows or a visible empty state
- Saves a full-page screenshot

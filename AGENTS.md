# FRONTEND KNOWLEDGE BASE (Vue + Quasar)

## OVERVIEW
Single-page frontend built with Vue 3 + Quasar.
Focus: project/task/report workflows, dashboard, and bioinformatics result visualization.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| App pages | `src/pages/` | Route-level UI |
| Shared components | `src/components/` | Reused across pages |
| API wrappers | `src/api/` | Use existing request helpers |
| Bootstrapping | `src/boot/` | Axios/i18n/directives init |
| Global state | `src/stores/` | Pinia stores |
| Router | `src/router/` | Route + guards |

## COMMANDS
```bash
npm run dev
npm run build
npm run lint
npm run format
npm run test   # placeholder, no real FE suite yet
```

## CONVENTIONS
- Prefer Composition API + `<script setup>` for new components.
- Import order: external libs first, then `src/...` internal aliases.
- Naming:
  - components: PascalCase file/component names
  - APIs/stores/functions: camelCase
- Formatting baseline:
  - line width: 120
  - indent: 4 spaces
  - quotes: single
  - semicolon: none

## RUNTIME PATTERNS
- HTTP stack initialized in `src/boot/axios.js`; auth/HTTP error handling centralized there.
- i18n initialized in `src/boot/i18n.js`; text keys in `src/i18n/`.
- Permission control via custom directive and current-user permission set.
- Pinia persistence is enabled; avoid bypassing store contracts in new code.

## ANTI-PATTERNS
- `quasar.config.js` roboto font options are mutually exclusive.
  - Keep either `roboto-font` or `roboto-font-latin-ext`, **never both**.
- Do not edit `src/index.template.html` scaffold marker blocks unless task requires it.
- Do not treat `npm run test` as a real test gate (it is a placeholder script).

## NOTES
- This directory has its own git repo metadata; root workspace does not.
- Ignore `node_modules/`, `.quasar/`, build outputs in reasoning and edits.

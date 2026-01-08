# Agent Guidelines for Bioinformatics Analysis System

Essential information for agentic coding assistants working on this Vue 3 + Quasar bioinformatics platform.

## Essential Commands

```bash
npm run dev          # Start dev server with hot-reload
quasar dev          # Alternative
npm run build       # Build for production
quasar build        # Alternative
npm run lint        # Run ESLint on .js and .vue files
npm run format      # Format code with Prettier
npm run test        # Currently no tests configured
```

When adding tests: Check package.json for test scripts, run single tests with `npm run test -- <file>`

## Tech Stack

-   **Framework**: Vue 3 + Quasar Framework
-   **UI Library**: Ant Design Vue
-   **State Management**: Pinia with persistence
-   **HTTP Client**: Axios with interceptors
-   **Visualization**: ECharts, IGV (genome browser)

## Code Style Guidelines

### Formatting (Prettier)

-   **Line width**: 120 characters max
-   **Indentation**: 4 spaces, no tabs
-   **Quotes**: Single quotes, no semicolons
-   **Trailing commas**: ES5 compatible
-   **Line endings**: LF
-   **Arrow functions**: Always include parentheses

### Naming Conventions

-   **Component files**: kebab-case (`PageTitle.vue`)
-   **Component names**: PascalCase (`PageTitle`)
-   **Stores**: camelCase with `Store` suffix (`globalStore`)
-   **API functions**: camelCase (`listUser`, `createUser`)
-   **Component directories**: kebab-case folder with kebab-case file

### Import Patterns

```javascript
// External libraries first
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'

// Then internal modules with src/ alias
import { globalStore } from 'src/stores/global'
import { apiGet, apiPost } from 'src/api/apiBase'
import PageTitle from 'src/components/page-title/PageTitle.vue'
```

### Component Structure

**Simple components** - Options API:

```javascript
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'ComponentName',
    props: { ... },
    setup() { ... }
})
```

**New components** - Composition API with `<script setup>` (preferred):

```javascript
<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    title: String,
    dataItems: Array
})

const emit = defineEmits(['update', 'change'])
const data = ref([])
const isLoading = ref(false)

onMounted(() => { init() })
</script>
```

### State Management (Pinia)

```javascript
import { defineStore } from 'pinia'

export const storeName = defineStore('storeId', {
    state: () => ({ data: null, loading: false }),
    getters: { computedValue: (state) => state.data?.length || 0 },
    actions: { async fetchData() { this.loading = true } },
    persist: true
})
```

### Using Stores

```javascript
import { globalStore } from 'src/stores/global'
import { storeToRefs } from 'pinia'

const store = globalStore()
const { langCode, currentUser } = storeToRefs(store)
store.langConfig.lang = 'en'  // Direct mutation OK
```

### API Patterns

All API functions in `src/api/`. Use `useApi()` composable:

```javascript
import { useApi } from 'src/api/apiBase'

const { apiGet, apiPost, apiPut, apiDelete, apiPatch } = useApi()

apiGet('/api/endpoint', onSuccessCallback, config, onErrorCallback, onHttpErrorCallback, onFinalCallback)
apiPost('/api/endpoint', onSuccessCallback, data, config, onErrorCallback, onHttpErrorCallback, onFinalCallback)
```

### Error Handling

Axios interceptors in `src/boot/axios.js` handle HTTP errors:

-   401/403: Redirect to login, clear token
-   404: Show "RouteNotFound" error
-   400: Show parameter error
-   500+: Show server error with details

Use `Notify.create()` for errors:

```javascript
Notify.create({ type: 'negative', message: 'Error message here' })
```

### Internationalization

Use `$t('Key')` in templates, `t('Key')` in script setup:

```javascript
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const message = t('Key')
```

### Directives

Use `v-permission` for access control:

```html
<q-btn v-permission="'edit_user'">Edit User</q-btn>
```

### Component Props & Events

```javascript
const props = defineProps({
    title: { type: String, required: true },
    data: { type: Array, default: () => [] },
    callback: Function
})

const emit = defineEmits(['update:modelValue', 'change'])
emit('change', newValue)
```

## Important Notes

-   **No tests configured**: Update package.json and AGENTS.md when adding tests
-   **Token handling**: Stored in cookies, use `getTokenCookie()` from `src/boot/axios.js`
-   **Language support**: Default via `navigator.language`, stored in globalStore
-   **Model queries**: Use `buildModelQuery()` from `src/api/modelQueryBuilder.js`
-   **User permissions**: Check via `v-permission` or `globalStore().currentUser.permissions`

## Common Patterns

### Loading State

```javascript
const loading = ref(false)
const fetchData = async () => {
    loading.value = true
    try { /* API call */ }
    finally { loading.value = false }
}
```

### ECharts Integration

```javascript
import { markRaw } from 'vue'
const chart = ref(null)
const chartContainer = ref(null)

onMounted(() => {
    chart.value = markRaw(echarts.init(chartContainer.value))
})
```

### Watchers

```javascript
import { watch } from 'vue'

watch(() => props.someData, (newVal, oldVal) => {
    // Handle change
}, { deep: true })
```

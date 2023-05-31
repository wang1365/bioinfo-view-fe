
import { useRoute } from 'vue-router'

export const isDebug = () => {
    const route = useRoute()
    console.log('==========>', route.query, route.params)
    return true
}

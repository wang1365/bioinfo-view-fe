// src/directives/permission.js
import { globalStore } from 'stores/global'
import { amISuper } from 'src/utils/user'

export default {
    mounted(el, binding) {
        const store = globalStore()
        if (amISuper()) {
            return
        }
        const userPermissions = store.currentUser?.permissions || {}
        const requiredPermission = binding.value

        if (!userPermissions[requiredPermission]) {
            el.disabled = true // 禁用控件
            el.style.display = 'none' // 隐藏控件
        }
    },
}

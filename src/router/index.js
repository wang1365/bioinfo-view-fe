import { route } from 'quasar/wrappers'
import { globalStore } from 'src/stores/global'
// const store = globalStore()

import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
    const createHistory = process.env.SERVER
        ? createMemoryHistory
        : process.env.VUE_ROUTER_MODE === 'history'
        ? createWebHistory
        : createWebHashHistory

    const Router = createRouter({
        scrollBehavior: () => ({ left: 0, top: 0 }),
        routes,

        // Leave this as is and make changes in quasar.conf.js instead!
        // quasar.conf.js -> build -> vueRouterMode
        // quasar.conf.js -> build -> publicPath
        history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),
    })
    Router.beforeEach((to, from) => {
        // ...
        // 返回 false 以取消导航
        //        console.log(to);
        // 检查用户是否已登录 & 避免无限重定向
        if (!isAuthenticated() && to.name !== 'Login') {
            // 将用户重定向到登录页面
            return { name: 'Login' }
        }
    })
    return Router
})

function isAuthenticated() {
    const store = globalStore()
    console.log('检查用户是否登录', store.currentUser)
    return store.currentUser
}

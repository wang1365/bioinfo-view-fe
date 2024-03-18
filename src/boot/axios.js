import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'
import { Cookies } from 'quasar'
import { globalStore } from 'src/stores/global'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
export function getTokenCookie() {
    let cookies = document.cookie.split('; ')
    for (const cookie of cookies) {
        let datas = cookie.split('=')
        if (datas[0] === 'token') {
            return datas[1]
        }
    }
    return null
}
const api = axios.create({
    baseURL: '/api',
    // headers: {
    //     Authorization: getTokenCookie(),
    // },
    withCredentials: true,

    transformResponse: [
        function (data) {
            // 对 data 进行任意转换处理
            return JSON.parse(data)
        },
    ],
})

export default boot(({ app, router, store }) => {
    // for use inside Vue files (Options API) through this.$axios and this.$api

    app.config.globalProperties.$axios = axios
    // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
    //       so you won't necessarily have to import axios in each vue file

    app.config.globalProperties.$api = api
    // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
    //       so you can easily perform requests against your app's API

    api.interceptors.request.use((config) => {
        // 请求拦截器通过Header增加国际化语言参数给后端， 例如 Language：zh-CN
        const { langConfig } = globalStore()
        console.log('===> add header:', langConfig)
        config.headers.Language = langConfig.lang
        return config
    })

    // 响应拦截
    api.interceptors.response.use(
        (response) => {
            const responseData = response.data
            const { code } = responseData
            if (code === undefined) {
                // 非标准结构的响应，直接返回数据
                return response.data
            }
            if (code === 0) {
                // 业务处理成功，只返回数据
                return responseData.data
            } else {
                let message = `Server Error:${responseData.msg}`
                if (responseData.data) {
                    message += ', ' + JSON.stringify(responseData.data)
                }
                Notify.create({
                    type: 'negative',
                    message,
                })
            }
        },
        (error) => {
            if (error.response.status === 401) {
                Notify.create({
                    type: 'negative',
                    message: '未登录',
                })
                Cookies.remove('token')
                router.push('/login')
            }
            if (error.response.status === 404) {
                const error = '请求地址不存在 [' + error.response.request.responseURL + ']'
                console.log(error)
                Notify.create({
                    type: 'negative',
                    message: error,
                })
            }
            return Promise.reject(error)
        }
    )
})

export function UserApi() {
    const router = UseRouter()
}

export { api }

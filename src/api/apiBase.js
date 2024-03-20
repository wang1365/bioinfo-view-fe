import { useRouter } from 'vue-router'
import { Notify, useQuasar } from 'quasar'
import axios from 'axios'
import { errorMessage } from 'src/utils/notify'
import { LoadingBar } from 'quasar'
import { Cookies } from 'quasar'
import { buildModelQuery } from './modelQueryBuilder'
import { globalStore } from 'src/stores/global'

LoadingBar.setDefaults({
    color: 'purple',
    size: '15px',
    position: 'bottom',
})
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
    return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2NjMyMjM5MjQsInN1YiI6ImFjY2VzcyJ9.Y6c5dcTZppCiNjW6Nq8LDxjF5wqDAL3bEOnU54Sapa4'
}
const api = axios.create({
    baseURL: '/api',
    // withCredentials: true,
    // onUploadProgress: function (progressEvent) {
    //     console.log("----->", progressEvent);
    // },
    // onDownloadProgress: function (progressEvent) {
    //     console.log("<-----", progressEvent);
    // },
})
api.interceptors.request.use((config) => {
    // 请求拦截器通过Header增加国际化语言参数给后端， 例如 Language：zh-CN
    const { langConfig } = globalStore()
    config.headers.Language = langConfig.lang
    config.headers.X_LANGUAGE = langConfig.lang
    return config
})
export function defaultErrorHandler(data) {
    Notify.create({
        type: 'negative',
        message: `Sever Error::${data.msg}`,
    })
}
export function defaultHttpErrorHandler(error, onError, router) {
    console.log(error)
    let status = error.response.status
    const data = error.response.data
    let errorData = (data ? data.msg : data) || data
    if (status === 401) {
        Notify.create({
            type: 'negative',
            message: `Login Required: ${status}:`,
        })
        Cookies.remove('token')
        router.push('/login')
    } else if (status === 403) {
        Notify.create({
            type: 'negative',
            message: `PermissionDenied: ${status}`,
        })
        Cookies.remove('token')
        router.push('/login')
    } else if (status === 404) {
        Notify.create({
            type: 'negative',
            message: `RouteNotFound`,
        })
        console.log(errorData)
    } else if (status >= 500) {
        let blob = new Blob([errorData])
        let url = window.URL.createObjectURL(blob)
        Notify.create({
            type: 'negative',
            message: `Sever Error: ${status}`,
            html: true,
            timeout: 10000,
        })
        console.log(errorData)
    } else if (status === 400) {
        if (!onError) {
            Notify.create({
                type: 'negative',
                message: `ParamsError ${status}：${errorData}`,
            })
        } else {
            onError(error.response)
        }
        console.log(errorData)
    }
}
export function defaultHandler(router, resp, onSuccess, onError) {
    const res = resp.data
    const code = resp.data.code
    // const statusCode = res.status_code
    if (code === 0 || code === 200 || code === 204 || code === 201) {
        onSuccess(res)
    } else if (code === 1) {
        if (resp.data.status_code === 500) {
            Notify.create({
                type: 'negative',
                message: `Sever Error: : ${res.msg}`,
            })
            return
        }
        if (onError) {
            onError(res)
        } else {
            defaultErrorHandler(res)
        }
    } else if (statusCode === 401) {
        Notify.create({
            type: 'negative',
            message: `Login Required:`,
        })
        Cookies.remove('token')
        router.push('/login')
    } else if (statusCode === 403) {
        Notify.create({
            type: 'negative',
            message: `PermissionDenied:`,
        })
        router.push('/login')
    } else if (statusCode === 400 || code === 1) {
        if (onError) {
            onError(res)
        } else {
            defaultErrorHandler(res)
        }
    } else if (statusCode === 404) {
        Notify.create({
            type: 'negative',
            message: `RouteNotFound`,
        })
        console.log(resp.data.data)
    } else {
        Notify.create({
            type: 'negative',
            message: `Sever Error: : ${res.msg}`,
        })
    }
}

export function useApi() {
    const router = useRouter()
    const $q = useQuasar()
    $q.loadingBar.setDefaults({
        color: 'purple',
        size: '5px',
        position: 'top',
    })
    function apiGet(url, onSuccess, config = {}, onError = null, onHttpError = null) {
        $q.loadingBar.start()
        api.get(url, config)
            .then((resp) => {
                $q.loadingBar.stop()
                defaultHandler(router, resp, onSuccess, onError)
            })
            .catch((error) => {
                $q.loadingBar.stop()
                if (onHttpError) {
                    onHttpError(error)
                } else {
                    defaultHttpErrorHandler(error, onError, router)
                }
            })
    }
    function apiPost(url, onSuccess, data = {}, config = {}, onError = null, onHttpError = null) {
        api.post(url, data, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError)
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error)
                } else {
                    defaultHttpErrorHandler(error, onError, router)
                }
            })
    }
    function apiPut(url, onSuccess, data = {}, config = {}, onError = null, onHttpError = null) {
        api.put(url, data, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError)
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error)
                } else {
                    defaultHttpErrorHandler(error, onError, router)
                }
            })
    }
    function apiPatch(url, onSuccess, data = {}, config = {}, onError = null, onHttpError = null) {
        api.patch(url, data, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError)
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error)
                } else {
                    defaultHttpErrorHandler(error, onError, router)
                }
            })
    }
    function apiDelete(url, onSuccess, data = {}, config = {}, onError = null, onHttpError = null) {
        if (data) {
            config.data = data
        }
        api.delete(url, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError)
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error)
                } else {
                    defaultHttpErrorHandler(error, onError, router)
                }
            })
    }
    function downloadData(url, config = {}) {
        if (!config) {
            config = { responseType: 'blob' }
        }
        config.responseType = 'blob'
        api.get(url, config)
            .then((resp) => {
                let contentDiposition = resp.headers['content-disposition']
                if (contentDiposition) {
                    let items = contentDiposition.split('; ')
                    let filename = 'Template'
                    for (const item of items) {
                        if (item.indexOf('filename') >= 0) {
                            filename = item.split('=')[1]
                            break
                        }
                    }
                    var a = document.createElement('a')
                    a.href = window.URL.createObjectURL(resp.data)
                    a.download = filename
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                } else {
                    var a = document.createElement('a')
                    a.href = window.URL.createObjectURL(resp.data)
                    a.download = 'download'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                }
            })
            .catch((error) => {
                console.log(error)
                defaultHttpErrorHandler(error, onError)
            })
    }
    function apiGetById(model, modelId, onSuccess, config = {}, onError = null, onHttpError = null) {
        let query = buildModelQuery([], { id: modelId })
        api.post(`/model_query/${model}`, query, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError)
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error)
                } else {
                    defaultHttpErrorHandler(error, onError, router)
                }
            })
    }
    function apiGetByIds(model, modelIds, onSuccess, config = {}, onError = null, onHttpError = null) {
        let query = buildModelQuery([], { id__in: modelIds })
        api.post(`/model_query/${model}`, query, config)
            .then((resp) => {
                defaultHandler(router, resp, onSuccess, onError)
            })
            .catch((error) => {
                if (onHttpError) {
                    onHttpError(error)
                } else {
                    defaultHttpErrorHandler(error, onError, router)
                }
            })
    }
    return { apiGet, apiPost, apiPut, apiDelete, apiPatch, downloadData, apiGetById, apiGetByIds }
}

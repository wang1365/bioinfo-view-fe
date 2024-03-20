import { defineStore } from 'pinia'

export const globalStore = defineStore('global', {
    state: () => ({
        logo: '/icons/favicon-128x128.png',
        pageTitle: '',
        // logo: "/icons/nanodi.svg",
        currentUserToken: '',
        currentUser: null,
        ui: {
            title: '可视化解读系统',
            image: '~assets/nanodi.svg',
        },
        langConfig: {
            lang: navigator.language === 'en-US' ? 'en' : 'cn',
            defaultLang: navigator.language === 'en-US' ? 'en' : 'cn',
            langSwitch: true,
        },
    }),
    getters: {
        doubleCount: (state) => state.counter * 2,
        langCode: (state) => state?.langConfig.lang,
    },
    actions: {
        increment() {
            this.counter++
        },
    },
    persist: true,
})

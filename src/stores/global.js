import { defineStore } from 'pinia'

export const globalStore = defineStore('global', {
    state: () => ({
        logo: '/icons/favicon-128x128.png',
        pageTitle: '',
        // logo: "/icons/nanodi.svg",
        currentUserToken: '',
        currentUser: null,
        ui: {
            title: '纳昂达可视化解读系统',
            image: '~assets/nanodi.svg',
        },
        lang: navigator.language || 'en-US'
    }),
    getters: {
        doubleCount: (state) => state.counter * 2,
    },
    actions: {
        setLang(lang) {
            this.lang = lang
        },
        increment() {
            this.counter++
        },
    },
    persist: true,
})

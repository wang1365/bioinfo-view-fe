import { boot } from 'quasar/wrappers'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

export default boot(async ({ app, router, store, Vue }) => {
    console.log('==> 加载Ant Design', Antd)
    app.use(Antd)
})

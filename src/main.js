import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/global.css'
import './assets/font/iconfont.css'
import SocketService from './utils/socket_service'
import { createPinia } from 'pinia'

// 创建 SocketService 实例并连接到服务器
const socketService = SocketService.Instance
socketService.connect()

const app = createApp(App)
// 挂载到全局属性
app.config.globalProperties.$socket = socketService

// pinia
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')

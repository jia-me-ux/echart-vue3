import { reactive } from 'vue'

class SocketService {
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 使用 reactive 管理响应式状态
  state = reactive({
    ws: null,
    connected: false,
    sendRetryCount: 0,
    connectRetryCount: 0,
    callBackMapping: {},
  })

  // 连接服务器的方法
  connect() {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }

    this.state.ws = new WebSocket('ws://localhost:9998')

    this.state.ws.onopen = () => {
      console.log('连接服务端成功了')
      this.state.connected = true
      this.state.connectRetryCount = 0
    }

    this.state.ws.onclose = () => {
      console.log('连接服务端失败')
      this.state.connected = false
      this.state.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, 500 * this.state.connectRetryCount)
    }

    this.state.ws.onmessage = (msg) => {
      console.log('从服务端获取到了数据')
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      if (this.state.callBackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          const realData = JSON.parse(recvData.data)
          this.state.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') {
          this.state.callBackMapping[socketType].call(this, recvData)
        } else if (action === 'themeChange') {
          this.state.callBackMapping[socketType].call(this, recvData)
        }
      }
    }
  }

  // 回调函数注册
  registerCallBack(socketType, callBack) {
    this.state.callBackMapping[socketType] = callBack
  }

  // 取消回调函数
  unRegisterCallBack(socketType) {
    this.state.callBackMapping[socketType] = null
  }

  // 发送数据
  send(data) {
    if (this.state.connected) {
      this.state.sendRetryCount = 0
      this.state.ws.send(JSON.stringify(data))
    } else {
      this.state.sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, this.state.sendRetryCount * 500)
    }
  }

  // 获取连接状态（响应式）
  getConnectionState() {
    return this.state.connected
  }
}

export default SocketService

import { defineStore } from 'pinia'
import { ref } from 'vue'

// 第一个参数是应用程序中 store 的唯一 id
export const useThemeStore = defineStore('style', () => {
  // 其它配置项
  const styleTheme = ref('chalk')

  const changeStyleTheme = () => {
    styleTheme.value = styleTheme.value === 'chalk' ? 'vintage' : 'chalk'
  }

  return {
    styleTheme,
    changeStyleTheme,
  }
})

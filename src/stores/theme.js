// src/stores/theme.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 1. STATE: 定义主题状态，并从 localStorage 初始化
  const theme = ref(localStorage.getItem('theme') || 'light')

  // 2. ACTIONS: 定义切换主题的方法
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // 3. EFFECT: 监听 theme 变化，并应用到 <html> 和 localStorage
  watch(theme, (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }, {
    // 立即执行一次，确保页面加载时主题正确
    immediate: true
  })

  return { theme, toggleTheme }
})

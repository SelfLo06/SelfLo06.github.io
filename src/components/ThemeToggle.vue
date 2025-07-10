<!-- src/components/ThemeToggle.vue -->
<template>
  <button @click="themeStore.toggleTheme" class="theme-toggle-btn" aria-label="切换主题">
    <!-- 使用 Transition 和 key 来实现图标切换的淡入淡出效果 -->
    <Transition name="icon-fade" mode="out-in">
      <i v-if="themeStore.theme === 'light'" key="sun" class="fa-solid fa-sun"></i>
      <i v-else key="moon" class="fa-solid fa-moon"></i>
    </Transition>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';

// 获取我们的主题 store 实例
const themeStore = useThemeStore();
</script>


<style scoped>
.theme-toggle-btn {
  /* ======================================================= */
  /* 1. 复制 .social-icon 的核心样式，以统一尺寸和外观    */
  /* ======================================================= */
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem; /* 统一图标大小 */

  /* ======================================================= */
  /* 2. 应用 CSS 变量，使其能响应主题变化                 */
  /* ======================================================= */
  background-color: rgba(128, 128, 128, 0.1);
  color: var(--text-color-secondary);
  border: none;
  cursor: pointer;

  /* ======================================================= */
  /* 3. 添加与其他图标一致的过渡和动画                    */
  /* ======================================================= */
  transition: all 0.3s ease;
}

/* ======================================================= */
/* 4. 定义全新的、响应主题的悬停效果                      */
/* ======================================================= */
.theme-toggle-btn:hover {
  /* 应用我们新定义的悬停背景色变量 */
  background-color: var(--toggle-hover-bg);
  /* 在有色背景下，白色文字效果最好 */
  color: white;

  /* 添加与其他图标一致的悬停动画 */
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 图标切换的淡入淡出动画  */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}
</style>

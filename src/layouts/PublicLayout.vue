<!-- /src/layouts/PublicLayout.vue (V3.0 - 三栏布局) -->
<template>
  <div class="main-container">
    <!-- 1. 左侧边栏 -->
    <aside class="sidebar-left">
      <!--
        用我们刚创建的 LeftSidebar 组件替换掉占位符
      -->
      <LeftSidebar />
    </aside>

    <!-- 2. 主内容区 -->
    <main class="main-content">
      <!--
        RouterView 现在位于主内容区，
        HomeView 和 ArticleDetailView 将在这里渲染。
      -->
      <RouterView />
    </main>

    <Transition name="fade">
      <!-- v-if 控制按钮的显示和隐藏 -->
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="back-to-top-btn"
        aria-label="回到顶部"
      >
        <!-- 使用 Font Awesome 的向上箭头图标 -->
        <i class="fa-solid fa-chevron-up"></i>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LeftSidebar from '@/components/LeftSidebar.vue';

// 1. 创建一个 ref 来控制按钮的显示状态
const showBackToTop = ref(false);

// 2. 定义一个滚动处理函数
const handleScroll = () => {
  // 当页面向下滚动超过 300px 时，显示按钮，否则隐藏
  if (window.scrollY > 300) {
    showBackToTop.value = true;
  } else {
    showBackToTop.value = false;
  }
};

// 3. 定义点击按钮后，平滑滚动到顶部的函数
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 使用平滑滚动效果
  });
};

// 4. 在组件挂载时，添加滚动事件监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

// 5. 在组件卸载时，移除事件监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: center; /* 水平居中对齐所有栏 */
  gap: 1.5rem; /* 定义栏与栏之间的间距 */
  max-width: 1300px; /* 整个三栏布局的最大宽度 */
  margin: 2rem auto; /* 上下边距，左右自动居中 */
  padding: 0 1.5rem; /* 在小屏幕上留出一些边距 */
}

/* 侧边栏样式 */
.sidebar-left{
  width: 260px; /* 固定宽度 */
  flex-shrink: 0; /* 防止在空间不足时被压缩 */

  /* 1. 声明为粘性定位 */
  position: sticky;
  /* 2. 当它滚动到距离视口顶部 2rem 的位置时，就固定住 */
  top: 2rem;
  /* 3. 为了让 sticky 生效，需要设置一个高度 */
  /* vh 是视口高度单位，100vh - 4rem 表示视口高度减去上下2rem的margin */
  height: calc(100vh - 4rem);
  /* 4. 如果内容过长，允许内部滚动 */
  overflow-y: auto;
}




/* 主内容区样式 */
.main-content {
  flex-grow: 1; /* 占据所有剩余的可用空间 */
  min-width: 0; /* 防止内容过长时撑开布局，非常重要 */
}




/* 调整媒体查询断点并添加中等屏幕的处理 */
@media (max-width: 1024px) {
  .sidebar-left {
    /* 在中等屏幕上取消 sticky 定位 */
    position: static;
    height: auto;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-left {
    width: 100%;
    position: static;
    height: auto;
  }
}

/* 更精确的媒体查询 - 针对容器宽度不足的情况 */
@media (max-width: 900px) {
  .main-container {
    max-width: 100%;
    gap: 1rem;
  }

  .sidebar-left {
    position: static;
    height: auto;
  }
}

.back-to-top-btn {
  position: fixed; /* 固定在视口右下角 */
  bottom: 2rem;
  right: 2rem;

  width: 45px;
  height: 45px;
  border-radius: 50%; /* 圆形 */

  background-color: rgba(255, 255, 255, 0.9); /* 半透明白色 */
  color: #333;
  border: none;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000; /* 确保它在最上层 */

  transition: all 0.3s ease;
}

.back-to-top-btn:hover {
  background-color: white;
  transform: scale(1.1); /* 鼠标悬停时放大一点 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* "fade" 是我们在 <Transition name="fade"> 中定义的名字 */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease; /* 过渡效果只针对透明度，持续0.3秒 */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0; /* 动画的开始和结束状态都是完全透明 */
}

</style>

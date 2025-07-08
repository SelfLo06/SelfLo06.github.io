<!-- /src/layouts/PublicLayout.vue (V2.0 - 圣杯布局最终版) -->
<template>
  <div class="public-layout">

    <!-- 1. 页头条带 (永远100%宽度) -->
    <header class="app-header">
      <!-- 页头的内容容器 (限制宽度并居中) -->
      <div class="content-wrapper">
        <RouterLink to="/" class="blog-title">selflo's Blog</RouterLink>
        <nav class="navigation">
          <!-- <RouterLink to="/categories">分类</RouterLink> -->
        </nav>
      </div>
    </header>

    <!-- 2. 主内容区域 (它本身不设置背景，只是一个占位) -->
    <main class="main-content-area">
      <!--
        RouterView 现在被包裹在内容容器中。
        这意味着所有被渲染的页面 (HomeView, ArticleDetailView)
        都会自动被限制宽度并居中。
      -->
      <div class="content-wrapper">
        <RouterView />
      </div>
    </main>

    <!-- 3. 页脚条带 (永远100%宽度) -->
    <footer class="app-footer">
      <!-- 页脚的内容容器 (限制宽度并居中) -->
      <div class="content-wrapper">
        <p>© 2025 {{ new Date().getFullYear() > 2025 ? `- ${new Date().getFullYear()}` : '' }} selflo. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<style scoped>
/* ---------------------------------- */
/* 1. 基础与布局容器 */
/* ---------------------------------- */
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f5f7; /* 将背景色移到这里，作为默认背景 */
}

.main-content-area {
  flex: 1; /* 核心：让主内容区域自动伸展，将页脚推到底部 */
}

/* ---------------------------------- */
/* 2. 可复用的“内容容器” (圣杯的核心) */
/* ---------------------------------- */
.content-wrapper {
  max-width: 960px; /* 定义内容的最大宽度 */
  width: 100%;       /* 在小屏幕上，宽度为100% */
  margin-left: auto;   /* 神奇的居中魔法 */
  margin-right: auto;  /* 神奇的居中魔法 */
  padding-left: 2rem;  /* 内部留白，防止移动端内容贴边 */
  padding-right: 2rem; /* 内部留白 */
  box-sizing: border-box;
}

/* ---------------------------------- */
/* 3. 条带层样式 (Header / Footer) */
/* ---------------------------------- */
.app-header {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
/* 我们甚至可以给 header 内部的 wrapper 一些特定样式 */
.app-header .content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.app-footer {
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
}
.app-footer .content-wrapper {
  text-align: center;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  color: #888;
  font-size: 0.9em;
}

/* ---------------------------------- */
/* 4. 具体元素样式 */
/* ---------------------------------- */
.blog-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
}
</style>

<template>
  <div class="admin-layout-beautified">

    <aside class="admin-sidebar">
      <div class="logo-widget widget">
        <div class="logo-link">
          <i class="fa-solid fa-feather-pointed"></i>
          <span>MyBlog Admin</span>
        </div>
      </div>

      <div class="menu-widget widget">
        <el-menu
          :default-active="$route.path"
          class="admin-menu"
          text-color="var(--text-color)"
          active-text-color="var(--primary-color)"
          router
        >
          <el-menu-item index="/admin/articles">
            <i class="fa-solid fa-newspaper"></i>
            <span>文章管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <i class="fa-solid fa-folder-tree"></i>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/tags">
            <i class="fa-solid fa-tags"></i>
            <span>标签管理</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="action-widget widget">
        <a href="/" target="_blank" class="action-btn">
          <i class="fa-solid fa-house"></i>
          <span>返回前台</span>
        </a>
        <button @click="handleLogout" class="action-btn logout-btn">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>退出登录</span>
        </button>
      </div>

    </aside>

    <main class="admin-main-content">
      <div class="content-card">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  // 1. 清除本地存储的 Token
  localStorage.removeItem('Authorization');

  // 2. 给出提示
  alert('您已成功退出登录。');

  // 3. 跳转到登录页面
  router.push({ name: 'login' });
};
</script>

<style scoped>
/* ========== 1. 全局背景和布局 ========== */
.admin-layout-beautified {
  display: flex;
  height: 100vh;
  padding: 20px;
  gap: 20px;
  position: relative;
  z-index: 1;
  box-sizing: border-box; /* 确保 padding 不会撑大容器 */
}

/* 统一的毛玻璃背景 */
.admin-layout-beautified::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  /* 你可以根据喜好调整背景图和模糊度 */
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)),
    url('https://cdn.jsdelivr.net/gh/SelfLo06/MyImages@main/background.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(8px);
}

/* ========== 2. 左侧边栏 ========== */
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget {
  background-color: var(--card-bg-color);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  padding: 15px;
}

/* Logo */
.logo-widget { padding: 0; }
.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: var(--text-color);
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: none;
  gap: 10px;
}
.logo-link i { color: var(--primary-color); }

/* 菜单 */
.menu-widget {
  padding: 10px 5px;
  flex-grow: 1;
}
.admin-menu {
  border-right: none;
  background-color: transparent;
}
.el-menu-item {
  border-radius: 8px;
  font-weight: 500;
}
.el-menu-item.is-active {
  background-color: var(--primary-color);
  color: #fff !important;
}
.el-menu-item i {
  margin-right: 12px;
  width: 1em;
}

/* 操作按钮 */
.action-widget {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px; /* 按钮之间的间距 */
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  width: 100%;
  color: var(--text-color);
  background: none;
  border: 1px solid transparent;
  text-decoration: none;
  border-radius: var(--border-radius-main);
  transition: all 0.2s;
  gap: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
}
.action-btn:hover {
  background-color: var(--hover-bg-color);
  border-color: var(--border-color);
}
.action-btn i {
  font-size: 1.1em;
}

/* 为退出登录按钮特别指定颜色 */
.logout-btn {
  color: #f56c6c; /* Element Plus 的危险红色 */
}
.logout-btn:hover {
  background-color: #fef0f0;
  border-color: #fbc4c4;
}

/* ========== 3. 右侧主内容区 ========== */
.admin-main-content {
  flex-grow: 1;
  min-width: 0; /* 防止被挤压 */
  height: 100%;
  overflow: hidden;
}

.content-card {
  background-color: var(--card-bg-color);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  height: 100%;
  padding: 20px 30px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>

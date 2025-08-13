<!-- src/components/LeftSidebar.vue -->
<template>
  <div class="left-sidebar">
    <!-- 1. 个人信息卡片 -->
    <div class="card profile-card">
      <div class="avatar-container">
        <img src="https://images.selflo06.xyz//profile.jpg" alt="User Avatar" class="avatar-img">
      </div>
      <h2 class="nickname">selflo</h2>
      <p class="motto">Stay hungry, stay foolish.</p>

      <div class="site-stats">

        <!-- 文章统计 -> 点击跳转到首页 -->
        <div class="stat-item" @click="navigateTo('/')">
          <span class="stat-count">{{ stats.articleCount }}</span>
          <span class="stat-label">文章</span>
        </div>

        <!-- 分类统计 -> 点击跳转到分类列表页 -->
        <div class="stat-item" @click="navigateTo('/categories')">
          <span class="stat-count">{{ stats.categoryCount }}</span>
          <span class="stat-label">分类</span>
        </div>

        <!-- 标签统计 -> 点击跳转到我们即将创建的标签搜索页 -->
        <div class="stat-item" @click="navigateTo('/tags/search')">
          <span class="stat-count">{{ stats.tagCount }}</span>
          <span class="stat-label">标签</span>
        </div>

      </div>
    </div>

    <div class="widget search-widget">
      <!--
        我们使用 @submit.prevent 来监听表单的提交事件 (通常是按回车)
        .prevent 会阻止表单提交导致页面刷新的默认行为
      -->
      <form @submit.prevent="performSearch" class="search-form">
        <input
          type="search"
          class="search-input"
          placeholder="搜索文章..."
          v-model.trim="searchKeyword"
        />
        <!-- 搜索按钮（图标） -->
        <button type="submit" class="search-button" aria-label="搜索">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      </form>
    </div>

    <!-- 2. 导航菜单卡片 -->
    <div class="card nav-card">
      <nav class="main-nav">
        <!-- v-for 循环渲染我们的静态导航菜单 -->
        <RouterLink v-for="item in navMenu" :key="item.name" :to="item.path" class="nav-item">
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>
    </div>

    <!-- 3. 社交链接卡片 -->
    <div class="card social-card">
      <div class="social-links">
        <a v-for="social in socialLinks"
           :key="social.name"
           :href="social.url"
           target="_blank"
           :class="['social-icon', social.className]"
           @click="social.isQQ ? handleQQClick($event) : (social.isBilibili ? handleBilibiliClick($event) : null)">
          <i :class="social.icon"></i>
        </a>
        <ThemeToggle />
      </div>
    </div>
    <!-- QQ弹窗 -->
    <div v-if="showQQPopup" class="popup-overlay" @click="showQQPopup = false">
      <div class="popup-container" @click.stop>
        <div class="popup-content">不让加 <(▰˘◡˘▰)></div>
        <button class="popup-close" @click="showQQPopup = false">关闭</button>
      </div>
    </div>

    <!-- B站弹窗 -->
    <div v-if="showBilibiliPopup" class="popup-overlay" @click="showBilibiliPopup = false">
      <div class="popup-container" @click.stop>
        <div class="popup-content">不让看 <(▰˘◡˘▰)></div>
        <button class="popup-close" @click="showBilibiliPopup = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref ,onMounted} from 'vue';
import { RouterLink, useRouter } from 'vue-router'
import { getSiteStats } from '@/api/public';
import ThemeToggle from './ThemeToggle.vue';

// --- 使用静态数据来驱动组件 ---

// 导航菜单数据
const navMenu = ref([
  { name: '回到首页', path: '/', icon: 'fa-solid fa-house' },
  { name: '文章分类', path: '/categories', icon: 'fa-solid fa-folder-open' },
  { name: '关于本人', path: '/about', icon: 'fa-solid fa-user' },
 // { name: '我的朋友', path: '/friends', icon: 'fa-solid fa-users' }
]);

// 社交链接数据
const socialLinks = ref([
  { name: 'QQ', url: 'javascript:void(0)', icon: 'fa-brands fa-qq', className: 'social-qq', isQQ: true },
  { name: '哔哩哔哩', url: 'javascript:void(0)', icon: 'fa-brands fa-bilibili', className: 'social-bilibili', isBilibili: true },
  { name: 'GitHub', url: 'https://github.com/SelfLo06/', icon: 'fa-brands fa-github', className: 'social-github' }
]);

// 控制QQ弹窗的显示
const showQQPopup = ref(false);
// 控制B站弹窗的显示
const showBilibiliPopup = ref(false);

// QQ点击处理函数
const handleQQClick = (event) => {
  event.preventDefault(); // 阻止默认链接行为
  showQQPopup.value = true;
};

// B站点击处理函数
const handleBilibiliClick = (event) => {
  event.preventDefault(); // 阻止默认链接行为
  showBilibiliPopup.value = true;
};

// 为统计数据创建一个新的响应式变量，并提供初始值
const stats = ref({
  articleCount: 0,
  categoryCount: 0,
  tagCount: 0
});

// ------
// 1. 获取 router 实例，我们将用它来进行程序化导航
const router = useRouter();

const navigateTo = (path) => {
  router.push(path);
};

// 2. 创建一个 ref 来双向绑定搜索框的输入内容
// .trim 修饰符会自动去除输入内容前后的空格
const searchKeyword = ref('');

// 3. 定义执行搜索的方法
const performSearch = () => {
  // 检查关键词是否为空，如果为空则不执行搜索
  if (!searchKeyword.value) {
    // 你可以在这里用 Element Plus 的 ElMessage 提示用户
    // ElMessage.warning('请输入搜索关键词！');
    console.warn('搜索关键词不能为空');
    return;
  }

  // 使用 router.push() 进行程序化导航
  // 我们将跳转到一个新的 "search" 路由，并通过 query 参数传递关键词
  router.push({
    name: 'search', // 我们稍后会在 router/index.js 中定义这个命名的路由
    query: {
      keyword: searchKeyword.value
    }
  });
};

// 使用 onMounted 生命周期钩子来获取真实数据
onMounted(async () => {
  try {
    const res = await getSiteStats();
    if (res.code === 0 && res.data) {
      stats.value = {
        ...stats.value, // 首先，保留所有现有的默认值 (如 tagCount: 0)
        ...res.data      // 然后，用API返回的数据覆盖它们
      }
    }
  } catch (error) {
    console.error('获取网站统计数据失败:', error);
  }
});
</script>

<style scoped>
/* ======================================================= */
/* 1. 顶层容器与通用卡片样式 (已适配暗黑模式)           */
/* ======================================================= */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.9rem; /* 卡片之间的间距 */
}

/* 通用的卡片样式 */
.card {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  text-align: center;
  /* 为颜色和边框的变化添加平滑过渡 */
  transition: background-color 0.3s, border-color 0.3s;
}


/* ======================================================= */
/* 2. 个人信息卡片 (Profile Card)                         */
/* ======================================================= */
.profile-card .avatar-container {
  border: 1px solid var(--border-color);
  padding: 4.8px;
  border-radius: 50%;
  display: inline-block;
  margin-bottom: 1rem;
}

.profile-card .avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: block;
}

.profile-card .nickname {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.profile-card .motto {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}


/* ======================================================= */
/* 3. 搜索小部件 (Search Widget)                          */
/* ======================================================= */
.search-widget {
  padding: 0;
}

.search-form {
  position: relative;
  display: flex;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 40px 0 15px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--card-bg-color);
  font-size: 0.9rem;
  color: var(--text-color);
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
  background-color: var(--card-bg-color);
  box-shadow: 0 0 0 3px rgba(49, 174, 255, 0.2);
}

.search-button {
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  height: 100%;
  border: none;
  background-color: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.search-input:focus + .search-button {
  color: var(--primary-color);
}


/* ======================================================= */
/* 4. 网站统计 (Site Stats)                               */
/* ======================================================= */
.site-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 1rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.stat-item:hover {
  /* 使用半透明颜色作为悬停背景，能同时适应亮暗模式 */
  background-color: rgba(128, 128, 128, 0.1);
}

.stat-count {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}


/* ======================================================= */
/* 5. 导航菜单 (Nav Card)                                 */
/* ======================================================= */
.main-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-color);
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 500;
}

.nav-item:hover, .router-link-exact-active {
  background-color: var(--primary-color);
  color: white;
}


/* ======================================================= */
/* 6. 社交链接与主题切换 (Social Card)                   */
/* ======================================================= */
.social-card {
  padding: 0.8rem;
}

.social-links {
  display: flex;
  justify-content: center;
  align-items: center; /* 确保所有图标垂直对齐 */
  gap: 1.2rem;
}

.social-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  font-size: 1.3rem;
  /* 默认图标颜色和背景，适配主题 */
  background-color: rgba(128, 128, 128, 0.1);
  color: var(--text-color-secondary);
  transition: all 0.3s ease;
}

/* 统一的悬停上浮和阴影效果 */
.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 为不同图标在悬停时应用各自的品牌色  */
.social-qq:hover {
  background-color: #12B7F5;
  color: white;
}
.social-bilibili:hover {
  background-color: #FB7299;
  color: white;
}
.social-github:hover {
  background-color: #24292E;
  color: white;
}

/* 弹窗样式 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-container {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  padding: 2rem;
  box-shadow: var(--card-shadow);
  max-width: 300px;
  width: 100%;
  text-align: center;
  animation: popup-fade 0.3s ease;
}

.popup-content {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-weight: bold;
}

.popup-close {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.popup-close:hover {
  opacity: 0.9;
}
</style>

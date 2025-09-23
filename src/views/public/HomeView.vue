<!-- /src/views/public/HomeView.vue (V3.0 - 连接真实API) -->
<template>
  <!-- 使用 v-loading 指令，在加载时显示Element Plus的加载动画 -->
  <div v-loading="loading">
    <!-- 当文章列表不为空时，显示文章网格 -->
    <div v-if="articleList.length > 0" class="article-grid">
      <div v-for="article in articleList" :key="article.id" class="article-card">
        <RouterLink :to="{ name: 'articleDetail', params: { id: article.id } }" class="card-link">
          <!-- 1. 封面图区域 -->
          <div class="card-cover">
            <!--
              - 使用 v-if 判断文章是否有封面图
              - 绑定真实的 article.coverImage
              - 提供一个优雅的“无封面”占位符
            -->
            <img
              v-if="article.coverImage"
              :src="article.coverImage"
              :alt="article.title"
              loading="lazy"
            />
            <div v-else class="cover-placeholder">
              <span>{{ article.title.charAt(0) }}</span>
            </div>
          </div>

          <!-- 2. 文字内容区域 -->
          <div class="card-body">
            <h2 class="card-title">{{ article.title }}</h2>

            <p class="card-summary">{{ article.summary || '暂无摘要...' }}</p>

            <div class="card-meta">
              <span
                ><i class="fa-regular fa-calendar-days"></i>
                {{ formatDate(article.createTime) }}</span
              >
              <span v-if="article.categoryName"
                ><i class="fa-regular fa-folder"></i> {{ article.categoryName }}</span
              >
              <span v-if="article.wordCount"
                ><i class="fa-regular fa-file-word"></i> 约 {{ article.wordCount }} 字</span
              >
            </div>
            <div v-if="article.tags && article.tags.length" class="meta-tags-list">
              <span v-for="tag in article.tags" :key="tag.id" class="card-tag">
                # {{ tag.name }}
              </span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- 当加载完成且没有文章时，显示自定义空状态组件 -->
    <div
      v-else-if="!loading"
      class="empty-container"
      :class="{ 'dark-theme': themeStore.theme === 'dark' }"
    >
      <div class="empty-state">
        <div class="magnifier">
          <div class="magnifier-glass"></div>
          <div class="magnifier-handle"></div>
        </div>
        <div class="empty-text">
          <p>博主很懒，还没有发布任何文章~</p>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <div v-if="pagination.total > 0" class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="pagination.total"
        v-model:current-page="pagination.pageNum"
        :page-size="pagination.pageSize"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getPublishedArticles } from '@/api/public';
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// ========== 【【【 2. 接收 categoryId 作为 Prop 】】】 ==========
// 因为在 router/index.js 中为该路由配置了 props: true
// 所以 Vue Router 会自动将 URL 中的 :categoryId 作为 prop 传递给这个组件
const props = defineProps({
  categoryId: {
    type: String,
    required: false
  },
  tagId: {
    type: String,
    required: false
  }
});
// ==========================================================

const articleList = ref([]);
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
const loading = ref(true);

// ========== 【【【 3. 升级数据获取逻辑 】】】 ==========
const fetchArticles = async () => {
  loading.value = true;
  try {
    // 构造请求参数
    const params = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    };

    // 如果 props.categoryId 存在，就将其添加到请求参数中
    if (props.categoryId) {
      params.categoryId = props.categoryId;
    }

    // 如果 props.tagId 存在，也将其添加到请求参数中
    if (props.tagId) {
      params.tagId = props.tagId;
    }

    // 调用API，传入我们构造好的参数
    const res = await getPublishedArticles(params);

    if (res.code === 0 && res.data && Array.isArray(res.data.records)) {
      articleList.value = res.data.records;
      pagination.value.total = res.data.total || 0;
    } else {
      articleList.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('请求文章列表时发生错误:', error);
    articleList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};
// =====================================================

const handleCurrentChange = (newPage) => {
  pagination.value.pageNum = newPage;
  fetchArticles();
  window.scrollTo(0, 0);
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

// ========== 【【【 4. 添加侦听器以响应路由变化 】】】 ==========
// 当用户从一个分类文章列表页，跳转到另一个分类文章列表页时
// HomeView 组件实例会被复用，onMounted 不会重新触发
// 我们需要 watch props.categoryId 的变化来重新加载数据
// ========== 【【【 4. 添加侦听器以响应路由变化 】】】 ==========
watch(
  () => [props.categoryId, props.tagId],
  ([newCategoryId, newTagId], [oldCategoryId, oldTagId]) => {
    // 仅当 categoryId 或 tagId 确实发生变化时才重置并重新加载
    if (newCategoryId !== oldCategoryId || newTagId !== oldTagId) {
      // 重置到第一页
      pagination.value.pageNum = 1;
      // 重新获取文章
      fetchArticles();
    // 滚动到顶部
    window.scrollTo(0, 0);
  }
);
// ========================================================

// 组件首次挂载时，获取文章数据
onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.article-grid {
  display: grid;
  /* 使用 grid 布局，让卡片自动填充并保持最小宽度 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.article-card {
  /* 使用全局变量 */
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-5px);
  /* 在悬停时使用一个更深的阴影，增强立体感 */
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保链接填满整个卡片 */
}

.card-cover {
  height: 200px;
  width: 100%;
  /* 占位符的基础背景色 */
  background-color: var(--border-color);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 5rem;
  font-weight: bold;
  color: var(--primary-color);
  /* 占位符的背景，亮色模式下与卡片背景一致 */
  background: var(--card-bg-color);
}
/* 为暗黑模式下的占位符提供一个不同的背景，增加对比度 */
:global(html.dark) .cover-placeholder {
  background-color: var(--border-color);
}

.card-body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  /* 使用主文本颜色 */
  color: var(--text-color);
}

.card-summary {
  font-size: 0.95rem;
  /* 使用次要文本颜色 */
  color: var(--text-color-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin-bottom: 1rem;
}

.card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左对齐 */
  gap: 0.8rem;
  font-size: 0.85rem;
  /* 使用次要文本颜色 */
  color: var(--text-color-secondary);
  /* 使用边框颜色 */
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: auto; /* 确保它始终在卡片底部 */
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.meta-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.card-tag {
  /* 使用半透明背景，自动适应明暗模式 */
  background-color: rgba(128, 128, 128, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  /* 使用次要文本颜色 */
  color: var(--text-color-secondary);
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* 自定义空状态容器 */
.empty-container {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  padding: 3rem 2rem;
  margin: 2rem 0;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

/* 暗黑模式下的空状态容器 */
.empty-container.dark-theme {
  background-color: var(--card-bg-color);
  border-color: var(--border-color);
}

/* 空状态内容 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

/* 放大镜图标容器 */
.magnifier {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
}

/* 放大镜玻璃部分 */
.magnifier-glass {
  position: absolute;
  top: 20px;
  left: 30px;
  width: 60px;
  height: 60px;
  border: 5px solid var(--text-color-secondary);
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* 放大镜手柄部分 */
.magnifier-handle {
  position: absolute;
  bottom: 20px;
  right: 30px;
  width: 5px;
  height: 40px;
  background-color: var(--text-color-secondary);
  transform: rotate(-45deg);
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* 放大镜悬停效果 */
.empty-state:hover .magnifier-glass {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.empty-state:hover .magnifier-handle {
  background-color: var(--primary-color);
  transform: rotate(-45deg) scale(1.05);
}

/* 空状态文字 */
.empty-text {
  max-width: 300px;
}

.empty-text p {
  font-size: 1.1rem;
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin: 0;
  transition: color 0.3s ease;
}
</style>

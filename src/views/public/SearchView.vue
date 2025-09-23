 <!-- 使用 v-loading 指令，在加载时显示Element Plus的加载动画 -->
 <template>
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
              <span><i class="fa-regular fa-calendar-days"></i> {{ formatDate(article.createTime) }}</span>
              <span v-if="article.categoryName"><i class="fa-regular fa-folder"></i> {{ article.categoryName }}</span>
              <span v-if="article.wordCount"><i class="fa-regular fa-file-word"></i> 约 {{ article.wordCount }} 字</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- 当加载完成且没有文章时，显示自定义空状态组件 -->
    <div v-else class="empty-container" :class="{ 'dark-theme': themeStore.theme === 'dark' }">
      <div class="empty-state">
        <div class="magnifier">
          <div class="magnifier-glass"></div>
          <div class="magnifier-handle"></div>
        </div>
        <div class="empty-text">
          <p>没有找到相关的文章，换个关键词试试吧~</p>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <div v-if="pagination.total > 0" class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="pagination.total"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>

import { ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { searchArticles as searchArticlesApi } from '@/api/public';
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const route = useRoute();

const articleList = ref([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
});
const loading = ref(true);
const currentKeyword = ref('');


const fetchSearchResults = async () => {
  // 从当前的路由 query 中获取关键词
  const keyword = route.query.keyword;
  if (!keyword) {
    // 如果没有关键词，直接清空列表，不发送请求
    articleList.value = [];
    pagination.value.total = 0;
    return;
  }

  // 更新当前关键词，可以在模板中显示，例如 "关于 'xxx' 的搜索结果"
  currentKeyword.value = keyword;
  loading.value = true;

  try {
    const params = {
      keyword: keyword,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    };

    const res = await searchArticlesApi(params);

    if (res.code === 0 && res.data && Array.isArray(res.data.records)) {
      articleList.value = res.data.records;
      pagination.value.total = res.data.total || 0;
    } else {
      articleList.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('搜索文章时发生错误:', error);
    articleList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// --- 分页处理函数保持不变，但要调用新函数 ---
const handleCurrentChange = (newPage) => {
  pagination.value.page = newPage;
  fetchSearchResults(); // 调用新函数
  window.scrollTo(0, 0);
};

// --- 日期格式化函数保持不变 ---
const formatDate = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

// 当用户在搜索页的搜索框进行一次新的搜索时，URL的query会变
watch(
  () => route.query.keyword,
  (newKeyword, oldKeyword) => {
    if (newKeyword && newKeyword !== oldKeyword) {
      pagination.value.page = 1; // 重置到第一页
      fetchSearchResults();
    }
  },
  { immediate: true } // immediate: true 保证组件首次加载时也会执行一次，替代 onMounted
);
</script>

 <style scoped>

 .article-card {
   background-color: var(--card-bg-color);
   border-radius: var(--border-radius-main);
   box-shadow: var(--card-shadow);
   overflow: hidden;
   transition: transform 0.3s ease, box-shadow 0.3s ease;
   display: flex;
   flex-direction: column;
   margin-bottom: 1.5rem; /* 保持原有的间距 */
 }

 .article-card:hover {
   transform: translateY(-5px);
   /* 与 HomeView 保持一致的悬浮阴影 */
   box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
 }

 .card-link {
   text-decoration: none;
   color: inherit; /* 继承 .article-card 的颜色 */
 }

 .card-cover {
   height: 200px;
   width: 100%;
   /* 使用变量作为占位背景 */
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
   /* 采纳 HomeView 的核心技巧：默认背景为卡片背景 */
   background-color: var(--card-bg-color);
   transition: background-color 0.3s ease;
 }
 /* 为暗黑模式下的占位符提供不同背景 */
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
   color: var(--text-color);
 }

 .card-summary {
   font-size: 0.95rem;
   line-height: 1.6;
   display: -webkit-box;
   -webkit-box-orient: vertical;
   -webkit-line-clamp: 2;
   overflow: hidden;
   text-overflow: ellipsis;
   flex-grow: 1;
   margin-bottom: 1rem;
   color: var(--text-color-secondary);
 }

 .card-meta {
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: 1rem;
   font-size: 0.85rem;
   padding-top: 1rem;
   margin-top: auto;
   color: var(--text-color-secondary);
   border-top: 1px solid var(--border-color);
 }

 .card-meta span {
   display: flex;
   align-items: center;
   gap: 0.4rem;
 }


 :global(html.dark) .el-empty :deep(.el-empty__description p) {
   /* 直接使用我们定义的文字颜色变量 */
   color: var(--text-color-secondary);
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

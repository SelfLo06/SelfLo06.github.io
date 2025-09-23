<template>
  <div class="tag-search-view">
    <!-- 1. 页面头部和搜索区域 -->
    <div class="search-header-card">
      <h1 class="page-title">标签检索</h1>
      <p class="page-subtitle">选择一个或多个标签，寻找它们的交集与灵感</p>

      <!-- 标签选择器/搜索框 -->
      <el-select
        v-model="selectedTagObjects"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="输入关键词搜索并添加标签"
        :remote-method="searchTags"
        :loading="tagSearchLoading"
        @change="handleSelectionChange"
        class="tag-selector"
        value-key="id"
      >
        <el-option
          v-for="item in tagOptions"
          :key="item.id"
          :label="item.name"
          :value="item"
        />
      </el-select>

      <!-- 在这里植入标签云  -->
      <!-- 1. 新增一个"视口"容器，它负责创建滚动的窗口 -->
      <div v-if="allTagsList.length > 0" class="tag-cloud-viewport">
        <!-- 2. 原有的容器现在变成了滚动的"轨道" -->
        <div class="tag-cloud-track">
          <!--
            【关键】我们复制了一份完全相同的标签列表
             这可以让滚动看起来是无缝衔接的
          -->
          <span v-for="tag in allTagsList" :key="tag.id + '-a'" class="tag-cloud-item" @click="addTagToSearch(tag)">
            {{ tag.name }} <span class="tag-count">({{ tag.articleCount }})</span>
          </span>
          <span v-for="tag in allTagsList" :key="tag.id + '-b'" class="tag-cloud-item" @click="addTagToSearch(tag)">
            {{ tag.name }} <span class="tag-count">({{ tag.articleCount }})</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 2. 搜索结果区域 -->
    <div class="search-results">
      <!-- 复用 HomeView 的文章卡片和布局 -->
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 加载完成 -->
      <div v-else>
        <!-- 有文章则显示列表 -->
        <div v-if="articleList.length > 0">
          <div class="article-grid">
            <div v-for="article in articleList" :key="article.id" class="article-card">
              <RouterLink :to="{ name: 'articleDetail', params: { id: article.id } }" class="card-link">
                <div class="card-cover">
                  <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" loading="lazy" />
                  <div v-else class="cover-placeholder"><span>{{ article.title.charAt(0) }}</span></div>
                </div>
                <div class="card-body">
                  <h2 class="card-title">{{ article.title }}</h2>
                  <p class="card-summary">{{ article.summary || '暂无摘要...' }}</p>
                  <div class="card-meta">
                    <div class="meta-basic-info">
                      <span><i class="fa-regular fa-calendar-days"></i> {{ formatDate(article.createTime) }}</span>
                      <span v-if="article.categoryName"><i class="fa-regular fa-folder"></i> {{ article.categoryName }}</span>
                    </div>
                    <div v-if="article.tags && article.tags.length" class="meta-tags-list">
                      <span v-for="tag in article.tags" :key="tag.id" class="card-tag"># {{ tag.name }}</span>
                    </div>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>
          <!-- 分页 -->
          <div v-if="pagination.total > 0" class="pagination-container">
            <el-pagination background layout="prev, pager, next" :total="pagination.total" v-model:current-page="pagination.page" @current-change="handleCurrentChange" />
          </div>
        </div>

        <!-- 当加载完成且没有搜索结果时，显示自定义空状态组件 -->
        <div v-else class="empty-container" :class="{ 'dark-theme': themeStore.theme === 'dark' }">
          <div class="empty-state">
            <div class="magnifier">
              <div class="magnifier-glass"></div>
              <div class="magnifier-handle"></div>
            </div>
            <div class="empty-text">
              <p>没有找到相关的标签，换个关键词试试吧~</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { getAllTags, getPublishedArticles } from '@/api/public';
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const route = useRoute();
const router = useRouter();

// --- 状态定义 ---
const allTagsList = ref([]); // 存储从API获取的所有标签
const tagOptions = ref([]); // 动态提供给 el-select 的选项
const selectedTagObjects = ref([]);  // 【核心】存储用户选中的标签对象数组
const tagSearchLoading = ref(false);

// 文章列表相关
const articleList = ref([]);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const loading = ref(true);

// --- 方法定义 ---

// 1. 获取所有标签，用于搜索备选
const fetchAllTags = async () => {
  try {
    const res = await getAllTags();
    if (res.code === 0) {
      allTagsList.value = res.data;
    }
  } catch (error) {
    console.error("获取所有标签失败:", error);
  }
};

// 2. el-select 的远程搜索方法
const searchTags = (query) => {
  if (query) {
    tagSearchLoading.value = true;
    setTimeout(() => {
      tagSearchLoading.value = false;
      tagOptions.value = allTagsList.value.filter(item => {
        return item.name.toLowerCase().includes(query.toLowerCase());
      });
    }, 200);
  } else {
    tagOptions.value = [];
  }
};

const addTagToSearch = (tag) => {
  // 检查这个标签是否已经被选中了
  const isAlreadySelected = selectedTagObjects.value.some(selected => selected.id === tag.id);

  // 如果没有被选中，就将它添加到选中的数组里
  if (!isAlreadySelected) {
    selectedTagObjects.value.push(tag);
    // 【关键】手动触发一次 handleSelectionChange，来更新URL和文章列表
    handleSelectionChange();
  }
};

// 3. 获取文章列表的核心方法
const fetchArticlesByTags = async (page = 1) => {
  const selectedIds = selectedTagObjects.value.map(tag => tag.id);

  if (selectedIds.length === 0) {
    articleList.value = [];
    pagination.value.total = 0;
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const params = {
      page: page,
      pageSize: pagination.value.pageSize,
      tagIds: selectedIds.join(',')
    };
    const res = await getPublishedArticles(params);
    if (res.code === 0 && res.data) {
      articleList.value = res.data.records;
      pagination.value.total = res.data.total;
      pagination.value.page = res.data.current;
    }
  } catch (error) {
    console.error(`获取多标签文章列表失败:`, error);
  } finally {
    loading.value = false;
  }
};

// 4. 当选中的标签发生变化时，更新URL并重新获取文章
const handleSelectionChange = () => {
  const selectedIds = selectedTagObjects.value.map(tag => tag.id);
  router.replace({ query: { tagIds: selectedIds.join(',') || undefined } });
  fetchArticlesByTags(1);
};

// 5. 【关键修正】初始化选中的标签
const initializeSelectedTags = () => {
  const initialIdsStr = route.query.tagIds || '';
  if (initialIdsStr && allTagsList.value.length > 0) {
    const initialIds = initialIdsStr.split(',').map(id => parseInt(id, 10));
    const initialTags = allTagsList.value.filter(tag => initialIds.includes(tag.id));

    // 设置选中的标签对象
    selectedTagObjects.value = initialTags;

    // 【关键】设置下拉选项，确保选中的标签在选项中显示
    tagOptions.value = [...initialTags];

    // 触发文章搜索
    fetchArticlesByTags();
  } else {
    loading.value = false;
  }
};

// 分页处理
const handleCurrentChange = (newPage) => {
  fetchArticlesByTags(newPage);
  window.scrollTo(0, 0);
};

// 格式化日期
const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';

// --- 生命周期和监听 ---
onMounted(async () => {
  await fetchAllTags();
  initializeSelectedTags();
});

// 【关键】监听路由查询参数变化，处理从文章详情页跳转过来的情况
watch(() => route.query.tagIds, (newTagIds) => {
  if (newTagIds && allTagsList.value.length > 0) {
    initializeSelectedTags();
  }
}, { immediate: false });
</script>


<style scoped>
.tag-search-view {
  --text-on-primary: white;
}

:global(html.dark) .tag-search-view {
  --text-on-primary: white;
}

/* 搜索头部卡片 */
.search-header-card {
  background-color: var(--card-bg-color);
  padding: 2rem 2.5rem;
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  margin-bottom: 2rem;
  text-align: center;
}
.page-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}
.page-subtitle {
  color: var(--text-color-secondary);
  margin-bottom: 1.5rem;
}
.tag-selector {
  width: 100%;
  max-width: 600px;
}

/* 标签云滚动动画 */
@keyframes scroll-left {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

/* 标签云视口 - 修复渐变语法 */
.tag-cloud-viewport {
  width: 100%;
  overflow: hidden;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
}

/* 标签云轨道 */
.tag-cloud-track {
  display: flex;
  width: max-content;
  animation: scroll-left 40s linear infinite;
}
.tag-cloud-track:hover {
  animation-play-state: paused;
}

/* 标签云单个标签 */
.tag-cloud-item {
  padding: 6px 14px;
  margin: 0 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  white-space: nowrap;
  background-color: rgba(128, 128, 128, 0.1);
  color: var(--text-color-secondary);
}

.tag-cloud-item:hover {
  background-color: var(--primary-color);
  color: var(--text-on-primary, white);
  transform: scale(1.1);
}

.tag-count {
  margin-left: 6px;
  font-size: 0.8em;
  opacity: 0.7;
}

/* --- 搜索结果区域 --- */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.article-card {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}
.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}
.card-link {
  text-decoration: none;
  color: inherit;
}
.card-cover {
  height: 200px;
  width: 100%;
  background-color: var(--border-color);
}
.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  background-color: var(--card-bg-color);
}
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
  color: var(--text-color);
}
.card-summary {
  font-size: 0.95rem;
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
  align-items: flex-start;
  gap: 0.8rem;
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: auto;
}
.meta-basic-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.meta-basic-info span {
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
  background-color: rgba(128, 128, 128, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* Element Plus 选择器的主题适配样式 */
.tag-selector :deep(.el-select__wrapper) {
  background-color: var(--card-bg-color) !important;
  border-color: var(--border-color) !important;
  color: var(--text-color) !important;
}

.tag-selector :deep(.el-select__wrapper:hover) {
  border-color: var(--primary-color) !important;
}

.tag-selector :deep(.el-select__wrapper.is-focused) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 1px var(--primary-color) inset !important;
}

.tag-selector :deep(.el-select__placeholder) {
  color: var(--text-color-secondary) !important;
}

.tag-selector :deep(.el-select__input) {
  color: var(--text-color) !important;
}

.tag-selector :deep(.el-tag) {
  background-color: var(--primary-color) !important;
  color: white !important;
  border-color: var(--primary-color) !important;
}

.tag-selector :deep(.el-tag .el-tag__close) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.tag-selector :deep(.el-tag .el-tag__close:hover) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

/* 下拉选项的主题适配 */
:deep(.el-select-dropdown) {
  background-color: var(--card-bg-color) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  color: var(--text-color) !important;
  background-color: transparent !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background-color: rgba(128, 128, 128, 0.1) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.is-selected) {
  background-color: var(--primary-color) !important;
  color: white !important;
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

/* 确保动画效果在切换主题时平滑 */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
</style>

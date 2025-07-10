<!-- src/views/public/CategoryView.vue (V2.0 - 卡片式布局) -->
<template>
  <div class="category-view">
    <div class="page-header">
      <h1 class="page-title">文章分类</h1>
      <p class="page-subtitle">探索不同主题下的精彩内容</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 分类列表 -->
    <div v-else class="category-card-list">
      <!-- 循环渲染分类卡片 -->
      <div v-for="category in categoryList" :key="category.id" class="category-card">
        <!-- 卡片背景图 -->
        <div class="card-image">
          <img v-if="category.coverImage" :src="category.coverImage" :alt="category.name" />
          <div v-else class="cover-placeholder">
            <span>{{ category.name.charAt(0) }}</span>
          </div>
        </div>
        <!-- 卡片内容 -->
        <div class="card-content">
          <h2 class="card-title">{{ category.name }}</h2>
          <p class="card-description">{{ category.description || '暂无描述' }}</p>
          <div class="card-footer">
            <span class="article-count">共 {{ category.articleCount }} 篇文章</span>
            <RouterLink
              :to="{ name: 'category-articles', params: { categoryId: category.id } }"
              class="view-button"
            >
              前往查看 →
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCategoryDetails } from '@/api/public';

const categoryList = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await getCategoryDetails();
    if (res.code === 0) {
      categoryList.value = res.data;
    }
  } catch (error) {
    console.error("获取分类详情失败:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.category-view {
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 1rem;
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
}
.page-title {
  font-size: 2rem;
  margin: 0;
  color: var(--text-color);
}
.page-subtitle {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}

.category-card-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-card {
  display: flex;
  height: 200px;
  border-radius: var(--border-radius-main);
  background-color: var(--card-bg-color);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 35%;
  flex-shrink: 0;
  background-color: var(--border-color);
}

.card-image img {
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
  background-color: var(--card-bg-color);
  user-select: none;
  transition: background-color 0.3s ease; /* 添加过渡效果 */
}
:global(html.dark) .cover-placeholder {
  background-color: var(--border-color);
}


.card-content {
  flex-grow: 1;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin: 0;
  font-size: 1.6rem;
  color: var(--text-color);
}

.card-description {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-color-secondary);
  line-height: 1.6;
  flex-grow: 1;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  color: var(--text-color-secondary);
}

.article-count {
  font-size: 0.9rem;
  font-weight: 500;
}

.view-button {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s ease;
}
.view-button:hover {
  background-color: var(--primary-color);
  color: var(--text-on-primary, white);
}
</style>

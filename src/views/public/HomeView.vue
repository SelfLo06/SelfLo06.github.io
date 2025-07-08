<!-- /src/views/public/HomeView.vue -->
<template>
  <div class="home-view" v-loading="loading">
    <ul v-if="articleList.length > 0" class="article-list">
      <li v-for="article in articleList" :key="article.id" class="article-item">
        <h2 class="article-title">
          <!-- 点击标题跳转到详情页 -->
          <RouterLink :to="{ name: 'articleDetail', params: { id: article.id } }">
            {{ article.title }}
          </RouterLink>
        </h2>
        <p class="article-meta">
          <span>发布于 {{ formatDate(article.createTime) }}</span>
          <span v-if="article.categoryName"> • 归类于 {{ article.categoryName }}</span>
        </p>
      </li>
    </ul>

    <el-empty v-else-if="!loading" description="博主很懒，还没有发布任何文章~"></el-empty>

    <div v-if="pagination.total > 0" class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="pagination.total"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getPublishedArticles } from '@/api/public'; // 引入我们新的API函数

// 响应式状态
const articleList = ref([]);
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
const loading = ref(true);

// 获取文章列表的函数
const fetchArticles = async () => {
  loading.value = true;
  try {
    const res = await getPublishedArticles({
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    });

    if (res.code === 0 && res.data) {
      // 从 res.data.records 读取文章列表，而不是 res.data.list
      articleList.value = Array.isArray(res.data.records) ? res.data.records : [];

      pagination.value.total = res.data.total || 0;
    } else {
      articleList.value = [];
      pagination.value.total = 0;
      console.error('获取文章列表失败:', res.message || '返回数据格式不正确');
    }

  } catch (error) {
    console.error('请求文章列表时发生网络错误:', error);
    articleList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化的函数
const handleCurrentChange = (newPage) => {
  pagination.value.pageNum = newPage;
  fetchArticles();
  // 切换分页后，滚动到页面顶部
  window.scrollTo(0, 0);
};

// 格式化日期 (简易版)
const formatDate = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

// 组件挂载后，获取第一页数据
onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.home-view {
  min-height: 300px; /* 防止加载时页面抖动 */
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  background-color: #fff;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: box-shadow 0.3s ease;
}

.article-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.article-title a {
  color: #333;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: #409EFF; /* Element Plus 主题色 */
}

.article-meta {
  color: #888;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import request from '@/utils/request.js';

// --- 数据模型 ---
const articleList = ref([]);
const categoryList = ref([]); // 分类列表，用于下拉框
const loading = ref(true);

// 【新增】用于绑定筛选表单的响应式变量
const searchParams = ref({
  categoryId: '', // 分类ID
  status: '',     // 发布状态 (1:草稿, 0:已发布)
  page: 1,        // 当前页码
  pageSize: 10    // 每页条数
});

// 【新增】用于存储分页信息
const pagination = ref({
  current: 1,
  pages: 0,
  size: 10,
  total: 0,
});


// --- 【核心修改】重构 API 调用函数 ---
// 原来的 fetchArticlesAndCategories 函数现在只负责获取分类
const fetchCategories = async () => {
  try {
    const response = await request.get('/category');
    categoryList.value = response.data;
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 新增一个专门用于获取文章列表的函数，它会使用 searchParams
const fetchArticles = async () => {
  loading.value = true;
  try {
    const response = await request.get('/article', {
      params: searchParams.value // 【关键】将搜索条件作为查询参数发送
    });

    // 更新文章列表和分页信息
    articleList.value = response.data.records;
    pagination.value.current = response.data.current;
    pagination.value.pages = response.data.pages;
    pagination.value.total = response.data.total;

  } catch (error) {
    console.error('获取文章列表失败:', error);
    alert(error.message || '获取文章列表失败');
  } finally {
    loading.value = false;
  }
};

// 【新增】处理搜索的函数
const handleSearch = () => {
  // 每次搜索时，都应该从第1页开始
  searchParams.value.page = 1;
  fetchArticles();
};

// --- 重置搜索条件的函数 ---
const resetSearch = () => {
  searchParams.value.categoryId = '';
  searchParams.value.status = '';
  searchParams.value.page = 1;
  fetchArticles();
};


// --- 数据转换/计算 (不变) ---
const categoryMap = computed(() => {
  const map = {};
  categoryList.value.forEach(category => {
    map[category.id] = category.name;
  });
  return map;
});

// ============================================
// 处理分页变化的函数
// ============================================
const handlePageChange = (currentPage) => {
  // 当页码改变时，更新我们的搜索参数
  searchParams.value.page = currentPage;
  // 然后重新获取文章列表
  fetchArticles();
};

// ============================================
// 【新增代码】处理文章删除的函数
// ============================================
const handleDeleteArticle = async (articleId) => {
  // 1. 弹出二次确认对话框
  if (confirm(`您真的要删除 ID 为 ${articleId} 的文章吗？这个操作将无法撤销！`)) {
    try {
      // 2. 调用后端的 DELETE API
      // 根据你的API文档，URL是 /article/{id}
      await request.delete(`/article/${articleId}`);

      // 3. 给出成功提示
      alert('文章删除成功！');

      // 4. 【关键】重新获取当前页的文章列表以刷新视图
      // 注意：这里不应该重置所有搜索条件，而是应该在“当前筛选和分页条件”下刷新
      // 比如，用户在第3页删除了文章，刷新后应该还停留在第3页（如果第3页还有数据的话）
      await fetchArticles();

    } catch (error) {
      console.error('删除文章失败:', error);
      alert(error.message || '删除文章失败');
    }
  }
};

// --- 生命周期钩子 ---
onMounted(() => {
  // 页面加载时，既要获取文章，也要获取分类
  fetchArticles();
  fetchCategories();
});
</script>

<template>
  <div class="article-manage-container">
    <div class="header">
      <h1>文章管理</h1>
      <router-link :to="{ name: 'article-publish' }" class="add-btn-link">
        发布新文章
      </router-link>
    </div>

    <!-- 筛选表单区域 -->
    <div class="filters">
      <div class="filter-item">
        <label>文章分类:</label>
        <!-- v-model 绑定 searchParams.categoryId -->
        <select v-model="searchParams.categoryId">
          <option value="">全部</option>
          <!-- 循环 categoryList 来生成下拉选项 -->
          <option v-for="category in categoryList" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <label>发布状态:</label>
        <select v-model="searchParams.status">
          <option value="">全部</option>
          <option value="0">已发布</option>
          <option value="1">草稿</option>
        </select>
      </div>
      <div class="filter-item">
        <button class="search-btn" @click="handleSearch">查 询</button>
        <button class="reset-btn" @click="resetSearch">重 置</button>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="loading" class="loading-text">正在加载文章列表...</div>

    <!-- 表格 -->
    <table v-else-if="articleList.length > 0" class="article-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>标题</th>
        <th>状态</th>
        <th>分类</th>
        <th>更新时间</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="article in articleList" :key="article.id">
        <td>{{ article.id }}</td>
        <td>{{ article.title }}</td>
        <td>{{ article.status === 0 ? '已发布' : '草稿' }}</td>
        <!-- 使用 categoryMap 显示分类名 -->
        <td>{{ categoryMap[article.categoryId] || '未分类' }}</td>
        <td>{{ article.updateTime }}</td>
        <td>
          <router-link
            :to="{ name: 'article-edit', params: { id: article.id } }"
            class="action-link edit-btn-color">
            编辑
          </router-link>
          <button
            @click="handleDeleteArticle(article.id)"
            class="action-link delete-btn-color">
            删除
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 空状态提示 -->
    <div v-else class="empty-text">一篇文章都还没有，快去发布吧！</div>

    <!-- 分页区域 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="pagination.total"
        :page-size="searchParams.pageSize"
        :current-page="searchParams.page"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
/* 为了快速开始，我们直接复用大部分分类管理的样式 */
/* 你可以将这些通用样式提取到一个公共的 CSS 文件中，以后再做优化 */
.article-manage-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.add-btn-link {
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none; /* 去掉下划线 */
  font-family: sans-serif;
}
.article-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.article-table th, .article-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.article-table th {
  background-color: #f2f2f2;
}
/* 【重构】创建一个统一的基础样式类，用于所有操作区域的按钮/链接 */
.action-link {
  display: inline-block; /* 让 a 标签可以设置宽高和内外边距 */
  padding: 6px 10px;     /* 稍微增大一点内边距，让按钮更大方 */
  margin-right: 8px;     /* 增大间距 */
  border-radius: 4px;
  color: white;
  text-decoration: none; /* 去掉链接的下划线 */
  font-size: 14px;
  font-family: sans-serif;
  text-align: center;
  border: none;          /* 明确移除边框 */
  outline: none;         /* 移除点击时的轮廓线 */
  cursor: pointer;       /* 保持手型光标 */
  transition: opacity 0.2s; /* 添加一个简单的过渡效果 */
}
/* 当鼠标悬浮时，按钮稍微变透明一点，增加交互感 */
.action-link:hover {
  opacity: 0.85;
}

/* 专门用于控制颜色的类 */
.edit-btn-color { background-color: #28a745; }
.delete-btn-color { background-color: #dc3545; }
.loading-text, .empty-text {
  text-align: center;
  margin-top: 50px;
  color: #888;
}
.filters, .pagination {
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
}
.filters {
  display: flex;
  align-items: center;
  gap: 20px; /* 元素之间的间距 */
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-weight: bold;
}

.filter-item select, .filter-item input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-btn, .reset-btn {
  padding: 5px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}
.search-btn { background-color: #007bff; }
.reset-btn { background-color: #6c757d; }

.pagination {
  display: flex;
  justify-content: center; /* 水平居中 */
  margin-top: 20px;
}
</style>

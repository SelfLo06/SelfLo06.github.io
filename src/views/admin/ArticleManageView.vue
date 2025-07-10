<!-- src/views/admin/ArticleManageView.vue (✨✨ 全新的、Element-Plus重构版 ✨✨) -->
<template>
  <div class="article-manage-view">
    <!-- 1. 页面头部：标题和操作按钮 -->
    <div class="table-header">
      <h1>文章管理</h1>
      <el-button type="primary" @click="navigateToPublish">
        <i class="fa-solid fa-plus" style="margin-right: 8px;"></i>
        发布新文章
      </el-button>
    </div>

    <!-- 2. 【升级】筛选与搜索区域 -->
    <div class="table-filters">
      <!-- 【新增】关键词搜索框 -->
      <el-input
        v-model="filters.keyword"
        placeholder="请输入标题关键词"
        @keyup.enter="handleSearch"
        clearable
        style="width: 240px;"
      />
      <!-- 分类筛选下拉框 -->
      <el-select
        v-model="filters.categoryId"
        placeholder="按分类筛选"
        clearable
        style="width: 180px;"
      >
        <el-option
          v-for="item in categoryOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <!-- 状态筛选下拉框 -->
      <el-select
        v-model="filters.status"
        placeholder="按状态筛选"
        clearable
        style="width: 120px;"
      >
        <el-option label="已发布" :value="0" />
        <el-option label="草稿" :value="1" />
      </el-select>

      <!-- 操作按钮 -->
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 3. 【升级】文章数据表格 -->
    <el-table :data="articleList" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="文章标题" show-overflow-tooltip />

      <!-- 【新增】标签列 -->
      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <div v-if="row.tags && row.tags.length">
            <el-tag
              v-for="tag in row.tags"
              :key="tag.id"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ tag.name }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'info'">
            {{ formatStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="180" />

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 4. 【升级】分页组件 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
// 【重要】我们假设你有一个统一的后台搜索API
import { deleteArticleById, getAllCategories, getAdminArticles } from '@/api/admin'

const router = useRouter();

// --- 数据状态 ---
const articleList = ref([]);
const loading = ref(true);
const pagination = ref({ pageNum: 1, pageSize: 10, total: 0 });
const categoryOptions = ref([]);

// 【升级】使用 reactive 来统一管理所有筛选条件
const filters = reactive({
  keyword: '', // 【新增】关键词
  categoryId: '',
  status: ''
});

// --- API 调用 ---
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      // 【修正】确保分页参数名与后端匹配
      page: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      // 【修正】确保筛选参数名与后端匹配 (title, categoryId, status)
      title: filters.keyword, // 将前端的 keyword 映射为后端的 title
      categoryId: filters.categoryId,
      status: filters.status
    };

    // 【修正】统一调用 getAdminArticles
    const res = await getAdminArticles(params);

    articleList.value = res.data.records;
    pagination.value.total = res.data.total;
    // 【修正】更新分页数据时，也使用后端返回的字段名
    pagination.value.pageNum = res.data.current;
  } catch (error) {
    console.error("获取文章列表失败:", error);
    ElMessage.error('数据加载失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const res = await getAllCategories();
    categoryOptions.value = res.data;
  } catch (error) {
    console.error("获取分类选项失败:", error);
  }
}

onMounted(() => {
  fetchData();
  fetchCategories();
});

// --- 事件处理 ---
const navigateToPublish = () => {
  router.push({ name: 'article-publish' });
};

const handleEdit = (id) => {
  router.push({ name: 'article-edit', params: { id } });
};

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可逆！', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteArticleById(id);
    ElMessage.success('删除成功');
    fetchData(); // 重新加载数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 【升级】搜索和重置逻辑现在更简单
const handleSearch = () => {
  pagination.value.pageNum = 1; // 搜索时回到第一页
  fetchData();
};

const handleReset = () => {
  filters.keyword = '';
  filters.categoryId = '';
  filters.status = '';
  pagination.value.pageNum = 1;
  fetchData();
};

// 分页事件处理
const handleSizeChange = (size) => {
  pagination.value.pageSize = size;
  fetchData();
};
const handleCurrentChange = (page) => {
  pagination.value.pageNum = page;
  fetchData();
};

// 格式化函数
const formatStatus = (status) => {
  return status === 0 ? '已发布' : '草稿';
};
</script>

<style scoped>
/*
  这些样式与我之前提供的“升级版”代码完全一致，
  它们能很好地适应新的 Element Plus 组件。
*/
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.table-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

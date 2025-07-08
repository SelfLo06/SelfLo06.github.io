<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request.js';

// --- 数据模型 ---
// ref([]) 创建一个响应式的空数组，用来存储从后端获取的分类列表
const categoryList = ref([]);
const loading = ref(true); // 一个加载状态，用于提升用户体验

// --- 核心函数：获取分类列表 ---
const fetchCategoryList = async () => {
  loading.value = true;
  try {
    // 使用我们封装的 request 工具发送请求
    // 这里的 '/category' 对应你的 API: GET /category
    const response = await request.get('/category');
    // 响应拦截器已经处理了外层，response 就是 { code, message, data }
    // 我们在拦截器里约定了，code为0时，直接返回 .data 部分
    categoryList.value = response.data; // 将获取到的数据赋值给响应式数组
  } catch (error) {
    console.error('获取分类列表失败:', error);
    // 这里可以添加用户提示，比如使用一个弹窗库
    alert(error.message || '获取分类列表失败');
  } finally {
    // 无论成功或失败，最后都设置加载状态为 false
    loading.value = false;
  }
};

// ============================================
// 处理新增分类的函数
// ============================================
const handleAddCategory = async () => {
  // 使用浏览器的 prompt 弹窗获取用户输入
  const newCategoryName = prompt("请输入新的分类名称：");

  // 如果用户输入了内容 (并且没有点取消)
  if (newCategoryName && newCategoryName.trim()) {
    try {
      // 调用新增分类的 API (对应你的 POST /category)
      await request.post('/category', {
        name: newCategoryName.trim() // trim() 去掉首尾空格
      });

      // 新增成功后，给用户一个提示
      alert('新增成功！');

      // 【关键】重新获取一次列表，这样页面就会自动更新
      await fetchCategoryList();

    } catch (error) {
      console.error('新增分类失败:', error);
      alert(error.message || '新增分类失败');
    }
  }
};

// ============================================
// 处理删除分类的函数
// ============================================
// 它需要接收一个参数：要删除的分类的 ID
const handleDeleteCategory = async (categoryId) => {
  // 使用 confirm 弹窗进行二次确认，这是一个非常好的习惯
  if (confirm(`您确定要删除 ID 为 ${categoryId} 的分类吗？此操作不可逆！`)) {
    try {
      // 调用删除 API (对应你的 DELETE /category/{id})
      await request.delete(`/category/${categoryId}`);

      alert('删除成功！');

      // 同样，成功后重新获取列表来更新视图
      await fetchCategoryList();

    } catch (error) {
      console.error('删除分类失败:', error);
      // 这里要特别注意，你后端需要实现“分类删除保护”逻辑
      // 如果该分类下有文章，后端应该返回 code!=0 和错误信息
      alert(error.message || '删除分类失败');
    }
  }
};

// ============================================
// 【新增代码】处理更新分类的函数
// ============================================
const handleUpdateCategory = async (category) => {
  // 弹出一个 prompt，并将分类当前的名字作为默认值显示
  const newName = prompt("请输入新的分类名称：", category.name);

  // 如果用户输入了新名字，并且和旧名字不一样
  if (newName && newName.trim() && newName.trim() !== category.name) {
    try {
      // 调用更新 API (对应你的 PUT /category)
      // 请求体需要包含 id 和新的 name
      await request.put('/category', {
        id: category.id,
        name: newName.trim()
      });

      alert('更新成功！');
      await fetchCategoryList();

    } catch (error) {
      console.error('更新分类失败:', error);
      alert(error.message || '更新分类失败');
    }
  }
};

// --- Vue 的生命周期钩子 ---
// onMounted() 会在组件第一次被挂载到页面上之后执行
// 这是发起初始数据请求的最佳位置
onMounted(() => {
  fetchCategoryList();
});
</script>

<template>
  <div class="category-manage-container">
    <div class="header">
      <h1>分类管理</h1>
      <button class="add-btn" @click="handleAddCategory">新增分类</button>
    </div>

    <!-- 加载状态的友好提示 -->
    <div v-if="loading" class="loading-text">正在加载...</div>

    <!-- 数据表格 -->
    <table v-else-if="categoryList.length > 0" class="category-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>分类名称</th>
        <th>创建时间</th>
        <th>更新时间</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <!-- v-for 指令，用于循环渲染列表 -->
      <!-- :key="category.id" 是必须的，用于Vue的性能优化 -->
      <tr v-for="category in categoryList" :key="category.id">
        <td>{{ category.id }}</td>
        <td>{{ category.name }}</td>
        <td>{{ category.createTime }}</td>
        <td>{{ category.updateTime }}</td>
        <td>
          <button class="action-btn edit-btn" @click="handleUpdateCategory(category)">编辑</button>
          <button class="action-btn delete-btn" @click="handleDeleteCategory(category.id)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 列表为空时的提示 -->
    <div v-else class="empty-text">暂无分类，请先新增。</div>
  </div>
</template>

<style scoped>
.category-manage-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.category-table {
  width: 100%;
  border-collapse: collapse; /* 让表格边框合并 */
}

.category-table th, .category-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.category-table th {
  background-color: #f2f2f2;
}

.action-btn {
  margin-right: 5px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}
.edit-btn { background-color: #28a745; }
.delete-btn { background-color: #dc3545; }

.loading-text, .empty-text {
  text-align: center;
  margin-top: 50px;
  color: #888;
}
</style>

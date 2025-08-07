<template>
  <div class="article-edit-container">
    <!-- 根据模式显示不同的标题 -->
    <h1>{{ isEditMode ? '编辑文章' : '发布新文章' }}</h1>

    <form @submit.prevent="handleSubmit" class="article-form">
      <div class="form-item">
        <label for="title">文章标题</label>
        <input type="text" id="title" v-model="articleForm.title" placeholder="请输入文章标题">
      </div>

      <div class="form-item">
        <label for="coverImage">封面图 URL</label>
        <input
          type="text"
          id="coverImage"
          v-model="articleForm.coverImage"
          placeholder="请输入图片的网络地址 (可选)"
        >
      </div>

      <div class="form-item">
        <label for="category">文章分类</label>
        <select id="category" v-model="articleForm.categoryId">
          <option disabled value="">请选择分类</option>
          <option v-for="category in categoryList" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- ========== 【【【 文章标签选择UI 】】】 ========== -->
      <div class="form-item">
        <label for="tags">文章标签</label>
        <multiselect
          id="tags"
          v-model="articleForm.tags"
          :options="allTags"
          :multiple="true"
          :close-on-select="false"
          placeholder="搜索或选择标签"
          label="name"
          track-by="id"
        ></multiselect>
      </div>
      <div class="form-item">
        <label for="summary">文章摘要</label>
        <textarea
          id="summary"
          v-model="articleForm.summary"
          rows="3"
          placeholder="请输入文章摘要 (可选)"
        ></textarea>
      </div>
      <!-- ======================================================== -->

      <div class="form-item">
        <label>文章内容 (Markdown)</label>
        <!-- ref="vditorRef" 将这个 DOM 元素与 script 中的 vditorRef 变量关联起来 -->
        <div ref="vditorRef" class="vditor-container"></div>
      </div>

      <div class="form-item">
        <button type="submit" class="submit-btn">
          {{ isEditMode ? '更新文章' : '立即发布' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
// --- 1. 导入所有需要的模块 ---
import { ref, onMounted, onUnmounted } from 'vue';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import { useRouter } from 'vue-router';
import request from '@/utils/request.js';
import { getAllTagsAdmin } from '@/api/admin';

// 导入 vue-multiselect
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css'; // 引入它的样式

// --- 2. 接收路由参数 ---
const props = defineProps({
  id: {
    type: String,
    required: false
  }
});

// --- 3. 定义所有响应式数据 ---
const articleForm = ref({
  id: null,
  title: '',
  coverImage: '',
  contentMd: '',
  categoryId: '',
  tags: [] // 直接存储标签对象数组 {id, name}
});

const categoryList = ref([]); // 分类列表
const allTags = ref([]); // 所有可选标签的列表
const isEditMode = ref(false); // 是否为编辑模式
const vditor = ref(null); // Vditor 实例
const vditorRef = ref(null); // Vditor 的 DOM 引用
const router = useRouter(); // 路由实例

// --- 4. Vditor 编辑器初始化逻辑 ---
const initVditor = () => {
  if (!vditorRef.value) return;

  const vditorOptions = {
    height: 500,
    placeholder: '从这里开始你的创作吧...',
    input: (value) => {
      articleForm.value.contentMd = value;
    },
    cache: {
      enable: true,
      id: props.id ? `vditor-article-${props.id}` : 'vditor-new-article',
    },
    after: () => {
      if (isEditMode.value && articleForm.value.contentMd) {
        vditor.value.setValue(articleForm.value.contentMd);
      }
    }
  };
  vditor.value = new Vditor(vditorRef.value, vditorOptions);
};

// --- 5. 生命周期钩子：组件挂载时获取数据 ---
onMounted(async () => {
  // 并行获取分类和标签，提升速度
  try {
    const [categoryRes, tagsRes] = await Promise.all([
      request.get('/category'),
      getAllTagsAdmin()
    ]);
    categoryList.value = categoryRes.data;
    allTags.value = tagsRes.data;
  } catch (error) {
    console.error("获取分类或标签列表失败", error);
  }

  // 判断模式并获取文章详情
  if (props.id) {
    isEditMode.value = true;
    try {
      const response = await request.get(`/article/${props.id}`);
      // 直接将后端返回的整个文章对象赋给 articleForm
      // 假设后端返回的对象中 tags 字段是 [{id, name}, ...]
      articleForm.value = response.data;
    } catch (error) {
      console.error("获取文章详情失败", error);
      alert('加载文章数据失败！');
    }
  }

  // 最后初始化编辑器
  initVditor();
});

// --- 6. 生命周期钩子：组件卸载时销毁编辑器 ---
onUnmounted(() => {
  if (vditor.value) {
    vditor.value.destroy();
  }
});

// --- 7. 表单提交逻辑 ---
const handleSubmit = async () => {
  // 前端数据校验
  if (!articleForm.value.title) {
    alert('文章标题不能为空！');
    return;
  }
  if (!articleForm.value.categoryId) {
    alert('请选择文章分类！');
    return;
  }
  if (!articleForm.value.contentMd) {
    alert('文章内容不能为空！');
    return;
  }

  // 在提交前，处理标签数据
  const submissionData = {
    ...articleForm.value,
    // 从 articleForm.tags (对象数组) 中提取出 ID 数组
    tagIds: articleForm.value.tags.map(tag => tag.id)
  };
  // 从提交数据中删除原始的 tags 数组，避免后端混淆
  delete submissionData.tags;

  try {
    if (isEditMode.value) {
      // 更新逻辑
      await request.put('/article', submissionData);
      alert('文章更新成功！');
      router.push({ name: 'admin-articles' });
    } else {
      // 发布逻辑
      await request.post('/article', submissionData);
      alert('文章发布成功！');
      router.push({ name: 'admin-articles' });
    }
  } catch (error) {
    console.error('操作失败:', error);
    alert(error.response?.data?.message || '操作失败，请稍后再试');
  }
};
</script>

<style scoped>
/* 原有样式，保持不变 */
.article-edit-container {
  padding: 20px;
}
.article-form {
  margin-top: 20px;
}
.form-item {
  margin-bottom: 20px;
}
.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
.form-item input, .form-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fff;
}
.vditor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit-btn {
  background-color: var(--primary-color, #007bff);
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.submit-btn:hover {
  opacity: 0.9;
}

.form-item input,
.form-item select,
.form-item textarea { /* 【核心修改：添加 .form-item textarea】 */
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fff;
}

/*
  为 vue-multiselect 添加一些样式调整，使其与现有表单风格更协调
  我们使用 :deep() 来穿透组件的 scoped 样式
*/
:deep(.multiselect__tags) {
  border-radius: 4px;
  border-color: #ccc;
  min-height: 42px; /* 与原生 select 高度对齐 */
  display: flex;
  align-items: center;
}
:deep(.multiselect__input) {
  background: none;
}
:deep(.multiselect__tag) {
  background: var(--primary-color, #007bff);
}
:deep(.multiselect__tag-icon):hover {
  background: #c72e41;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted} from 'vue'; // 从 'vue' 和 'vditor' 导入必要的模块
import Vditor from 'vditor';
import 'vditor/dist/index.css'; // 引入 Vditor 的样式
import { useRouter } from 'vue-router'; // 引入 useRoute 来获取当前路由信息
import request from '@/utils/request.js';


// --- 接收路由参数 ---
// 因为我们在路由中设置了 props: true, 所以 id 会作为 prop 传入
const props = defineProps({
  id: {
    type: String,
    required: false // 不是必须的，因为发布新文章时没有 id
  }
});

// --- 数据模型 ---
// 使用一个对象来统一管理表单数据
const articleForm = ref({
  id: null,
  title: '',
  contentMd: '', // 用于绑定 Markdown 编辑器
  categoryId: ''
});

const categoryList = ref([]); // 存储分类下拉框的数据
const isEditMode = ref(false); // 标记当前是编辑模式还是发布模式

// ============================================
// 【新增】Vditor 相关逻辑
// ============================================
const vditor = ref(null); // 用于存放 Vditor 实例
const vditorRef = ref(null); // 用于关联模板中的 DOM 元素

const router = useRouter(); // 获取 router 实例

const initVditor = () => {
  // 确保 DOM 元素存在
  if (!vditorRef.value) {
    return;
  }

  // 为 Vditor 添加 cache 配置
  const vditorOptions = {
    height: 500,
    placeholder: '从这里开始你的创作吧...',
    input: (value) => {
      articleForm.value.contentMd = value;
    },
    // 缓存配置
    cache: {
      enable: true, // 开启缓存
      // 使用三元运算符动态设置缓存ID
      // 如果是编辑模式，就用文章ID；如果是新建模式，就用一个固定的字符串
      id: props.id ? `vditor-article-${props.id}` : 'vditor-new-article',
    },
    after: () => {
      // 在 Vditor 完全渲染后执行的回调
      // 检查是否需要填充旧内容
      if (isEditMode.value && articleForm.value.contentMd) {
        vditor.value.setValue(articleForm.value.contentMd);
      }
    }
  };

  // 初始化 Vditor
  vditor.value = new Vditor(vditorRef.value, vditorOptions);
};


// --- 生命周期钩子 ---
onMounted(async () => {
  // 1. 获取所有分类，用于下拉框
  try {
    const response = await request.get('/category');
    categoryList.value = response.data;
  } catch (error) {
    console.error("获取分类失败", error);
  }

  // 2. 判断是编辑还是新建
  if (props.id) {
    isEditMode.value = true;
    // 如果是编辑模式，需要根据 id 从后端获取文章的原始数据
    try {
      const response = await request.get(`/article/${props.id}`);
      // 将获取到的数据填充到表单中
      articleForm.value = response.data;
    } catch (error) {
      console.error("获取文章详情失败", error);
      alert('加载文章数据失败！');
    }
  }

  // 3. 【顺序调整】最后再初始化 Vditor
  // 这样可以确保在 initVditor 时，我们已经知道是编辑还是新建模式 (isEditMode.value)
  initVditor();
});

// 在组件卸载时，销毁 Vditor 实例，防止内存泄漏
onUnmounted(() => {
  if (vditor.value) {
    vditor.value.destroy();
  }
});

// --- 表单提交逻辑 (暂时留空) ---
const handleSubmit = async () => {
  // 在函数执行的入口，直接、显式地重新导入一次 request 模块！
  const api = (await import('@/utils/request.js')).default;

  // 用这个新导入的、绝对可靠的 api 实例来执行所有操作
  //console.log("准备发送API请求，检查 api 对象:", api);
  //console.log("api 对象是否是我们的自定义实例?", api.isCustomInstance);

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

  try {
    if (isEditMode.value) {
      // --- 更新逻辑 ---
      // 调用更新文章的 API (对应你的 PUT /article)
      await request.put('/article', articleForm.value);
      alert('文章更新成功！');

      // 更新成功后，可以跳转回文章列表页，或者停留在当前页
      router.push({ name: 'admin-articles' });

    } else {
      // --- 发布逻辑 ---
      // 调用发布文章的 API (对应你的 POST /article)
      // 注意：后端会根据 Token 自动设置 authorId，前端无需传递
      await request.post('/article', articleForm.value);
      alert('文章发布成功！');

      // 发布成功后，跳转到文章列表页
      router.push({ name: 'admin-articles' });
    }
  } catch (error) {
    console.error('操作失败:', error);
    alert(error.message || '操作失败，请稍后再试');
  }
};
</script>

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
        <label for="category">文章分类</label>
        <select id="category" v-model="articleForm.categoryId">
          <option disabled value="">请选择分类</option>
          <option v-for="category in categoryList" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

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

<style scoped>
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
}
/* 为 Vditor 容器添加样式 */
.vditor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
</style>

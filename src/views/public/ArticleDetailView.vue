<!-- /src/views/public/ArticleDetailView.vue -->
<template>
  <div class="article-detail-view" v-loading="loading">
    <div v-if="article" class="article-container">
      <!-- 文章标题 -->
      <h1 class="title">{{ article.title }}</h1>

      <!-- 文章元信息：发布日期、分类 -->
      <div class="meta">
        <span>发布于 {{ formatDate(article.createTime) }}</span>
        <span v-if="article.categoryName"> • 归类于 {{ article.categoryName }}</span>
      </div>

      <!-- 渲染后的 Markdown 内容 -->
      <!--
        【安全提示】
        我们使用 v-html 是因为内容源于我们自己可信的后台。
        永远不要用 v-html 渲染来自用户输入的、未经严格审查的内容，以防 XSS 攻击。
      -->
      <div class="article-content" v-html="renderedContent"></div>

    </div>
    <el-empty v-else-if="!loading" description="文章不存在或已被删除"></el-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getArticleDetailById } from '@/api/public';

// 【关键】引入 markdown 渲染和代码高亮库
import { marked } from 'marked';
import hljs from 'highlight.js';
// 【样式】引入你喜欢的高亮主题，这里用 github-dark
import 'highlight.js/styles/github-dark.css';

// 从路由中获取 props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const route = useRoute(); // 仍然需要 route 来监听变化
const article = ref(null);
const loading = ref(true);

// 配置 marked 渲染器
marked.setOptions({
  renderer: new marked.Renderer(),
  // 开启 GFM (GitHub Flavored Markdown)
  gfm: true,
  // 优化换行符处理
  breaks: true,
  // 【核心】代码高亮配置
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-', // 高亮代码块的 class 前缀
});

// 计算属性，将 markdown 文本转换为 html
const renderedContent = computed(() => {
  if (article.value && article.value.contentMd) {
    return marked.parse(article.value.contentMd);
  }
  return '';
});

// 获取文章详情的函数
const fetchArticleDetail = async (articleId) => {
  loading.value = true;
  article.value = null; // 重置文章数据
  try {
    const res = await getArticleDetailById(articleId);
    // 【后端逻辑适配】如果后端对草稿文章做了访问控制，这里可能会返回失败
    if (res.code === 0 && res.data) {
      // 【关键逻辑】只展示已发布的文章
      if (res.data.status === 0) {
        article.value = res.data;
      } else {
        console.warn('尝试访问一篇草稿文章，已阻止渲染。');
        // article.value 保持为 null，页面将显示 "文章不存在"
      }
    } else {
      console.error('获取文章详情失败:', res.message);
    }
  } catch (error) {
    console.error('请求文章详情时发生网络错误:', error);
  } finally {
    loading.value = false;
  }
};

// 格式化日期 (简易版)
const formatDate = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

// 组件挂载时，获取文章数据
onMounted(() => {
  fetchArticleDetail(props.id);
});

// 【健壮性】监听路由参数变化。
// 当用户在文章A详情页，点击一个链接跳转到文章B详情页时，
// 组件实例会被复用，但 onMounted 不会重新执行。
// 我们需要 watch 路由参数的变化来重新获取数据。
watch(() => props.id, (newId) => {
  if (newId) {
    fetchArticleDetail(newId);
  }
});

</script>

<style scoped>
.article-detail-view {
  background-color: #fff;
  padding: 2rem 2.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.meta {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

/*
  【关键】使用 :deep() 或 >>> 来穿透 scoped 样式，
  为 v-html 渲染出的内容设置样式。
*/
.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5) {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 600;
}
.article-content :deep(h1) { font-size: 1.8em; }
.article-content :deep(h2) { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: .3em;}
.article-content :deep(h3) { font-size: 1.25em; }

.article-content :deep(p) {
  line-height: 1.8;
  margin-bottom: 1.2em;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 1.5em;
  line-height: 1.8;
}

.article-content :deep(blockquote) {
  margin: 1.5em 0;
  padding: 0.5em 1.2em;
  border-left: 4px solid #409EFF;
  background-color: #f8f8f8;
  color: #666;
}

.article-content :deep(code) {
  font-family: 'Courier New', Courier, monospace;
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 4px;
  color: #d63200;
}

.article-content :deep(pre) {
  margin: 1.5em 0 !important;
  border-radius: 6px;
  overflow: auto;
}

.article-content :deep(pre code) {
  /* pre > code 的样式重置，因为它要应用 highlight.js 的主题 */
  background-color: transparent;
  padding: 0;
  color: inherit;
}
.article-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}
</style>

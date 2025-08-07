<!-- /src/views/public/ArticleDetailView.vue -->
<template>
  <!-- 1. 唯一的、永久的根元素 -->
  <div class="article-detail-wrapper">

    <!-- 2. 加载状态：如果正在加载，显示骨架屏 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 3. 加载完成后的状态 -->
    <div v-else>

      <!-- 3.1 如果成功获取到文章数据 (article.id 存在) -->
      <div v-if="article && article.id" class="article-detail-card">
        <!-- 使用 PageHeader 组件 -->
        <PageHeader
          v-if="article.coverImage"
          :title="article.title"
          :cover-image="article.coverImage"
        />

        <!-- 文章主体内容容器 -->
        <div class="article-body">
          <!-- 如果没有封面图，就在这里显示标题 -->
          <h1 v-if="!article.coverImage" class="title-without-cover">{{ article.title }}</h1>

          <!-- 元信息标签 (Meta Pills) -->
          <div class="meta-tags">
            <span class="meta-tag tag-date">
              <i class="fa-regular fa-calendar-days"></i> {{ formatDate(article.createTime) }}
            </span>
            <span class="meta-tag tag-words">
              <i class="fa-solid fa-pencil"></i> 约 {{ article.wordCount }} 字
            </span>
            <span v-if="article.categoryName" class="meta-tag tag-category">
              <i class="fa-regular fa-folder"></i> {{ article.categoryName }}
            </span>

            <template v-if="article.tags && article.tags.length > 0">
              <RouterLink
                v-for="tag in article.tags"
                :key="tag.id"
                :to="{ name: 'tag-search', query: { tagIds: tag.id } }"
                class="meta-tag tag-item"
              >
                <i class="fa-solid fa-tag"></i> {{ tag.name }}
              </RouterLink>
            </template>

          </div>

          <!-- 渲染Markdown文章正文 -->
          <div class="markdown-content" v-html="renderedContent"></div>
        </div>
      </div>

      <!-- 3.2 如果文章不存在或加载失败 (article.id 不存在) -->
      <el-empty v-else description="文章不存在或已被删除"></el-empty>

    </div>

    <!-- 只在加载完成且有文章时，才显示评论区 -->
    <div v-if="shouldShowComments" class="comment-section">
      <!-- 分割线 -->
      <div class="divider"></div>
      <!-- Giscus 评论区容器 -->
      <div id="giscus-container" class="giscus-wrapper"></div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { getArticleDetailById } from '@/api/public';
import { useThemeStore } from '@/stores/theme';


import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import markedKatex from "marked-katex-extension"; // 引入 KaTeX 扩展
import 'katex/dist/katex.min.css'; // 引入 KaTeX 的 CSS 样式

import PageHeader from '@/components/PageHeader.vue';

// 从路由中获取 props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const themeStore = useThemeStore();
const article = ref(null);
const loading = ref(true);

const shouldShowComments = computed(() => {
  return !loading.value && article.value && article.value.id;
});

// =======================================================
// 【核心修改】配置 marked，使其同时支持代码高亮和 LaTeX
// =======================================================

// 1. 使用 KaTeX 扩展
// 这必须在 setOptions 之前调用
marked.use(markedKatex({
  throwOnError: false // `false` 会在解析失败时显示原始的 TeX 代码，而不是抛出错误
}));

// 2. 配置 marked 的其他选项
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  breaks: true,
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
});


// 计算属性，用于将 Markdown + LaTeX 文本转换为 HTML
const renderedContent = computed(() => {
  if (article.value && article.value.contentMd) {
    // marked.parse 现在会自动处理 Markdown 和 LaTeX 公式
    return marked.parse(article.value.contentMd);
  }
  return '';
});

// 一个函数，用于在渲染后添加复制按钮
const addCopyButtons = () => {
  nextTick(() => {
    const codeBlocks = document.querySelectorAll('.markdown-content pre');
    codeBlocks.forEach((block) => {
      if (block.querySelector('.copy-code-btn')) return;
      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.innerHTML = '<i class="fa-regular fa-copy"></i> 复制';
      button.addEventListener('click', () => {
        const codeToCopy = block.querySelector('code').innerText;
        const textarea = document.createElement('textarea');
        textarea.value = codeToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        let success = false;
        try {
          success = document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textarea);
        if (success) {
          button.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
          setTimeout(() => {
            button.innerHTML = '<i class="fa-regular fa-copy"></i> 复制';
          }, 2000);
        } else {
          button.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> 复制失败';
          setTimeout(() => {
            button.innerHTML = '<i class="fa-regular fa-copy"></i> 复制';
          }, 2000);
        }
      });
      block.appendChild(button);
    });
  });
};

/**
 * 加载/重新加载 Giscus 的函数
 */
const loadGiscus = () => {
  const container = document.getElementById('giscus-container');
  if (!container) return;
  container.innerHTML = '';
  const giscusTheme = themeStore.theme === 'light' ? 'light' : 'dark';
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-theme', giscusTheme);
  script.setAttribute('data-repo', 'SelfLo06/blog-comments');
  script.setAttribute('data-repo-id', 'R_kgDOPJ9FjQ');
  script.setAttribute('data-category', 'Blog Comments');
  script.setAttribute('data-category-id', 'DIC_kwDOPJ9Fjc4Csv-9');
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-lang', 'zh-CN');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;
  container.appendChild(script);
};

// 获取文章详情的函数
const fetchArticleDetail = async (articleId) => {
  loading.value = true;
  article.value = null;
  try {
    const res = await getArticleDetailById(articleId);
    if (res.code === 0 && res.data) {
      if (res.data.status === 0) {
        article.value = res.data;
        document.title = `${article.value.title} - selflo's Blog`;
      } else {
        console.warn('尝试访问一篇草稿文章，已阻止渲染。');
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

// 格式化日期
const formatDate = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

// 组件挂载时，获取文章数据
onMounted(() => {
  fetchArticleDetail(props.id);
});

// 监听路由参数的变化来重新获取数据
watch(() => props.id, (newId) => {
  if (newId) {
    fetchArticleDetail(newId);
  }
});

// 【核心修正】当渲染内容变化时，才去添加复制按钮
watch(renderedContent, (newContent) => {
  if (newContent) {
    addCopyButtons();
  }
});

// 监听评论区容器是否出现，如果出现则加载 Giscus
watch(shouldShowComments, (newValue) => {
  if (newValue) {
    nextTick(() => {
      loadGiscus();
    });
  }
});

// 监听全局主题变化，实时通知 Giscus 切换主题
watch(() => themeStore.theme, (newTheme) => {
  const giscusFrame = document.querySelector('iframe.giscus-frame');
  if (!giscusFrame) return;
  const newGiscusTheme = newTheme === 'light' ? 'light' : 'dark';
  giscusFrame.contentWindow.postMessage(
    { giscus: { setConfig: { theme: newGiscusTheme } } },
    'https://giscus.app'
  );
});
</script>

<style scoped>
.article-detail-card {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  margin-bottom: 2rem;
  overflow: hidden;
}

.article-body {
  padding: 1.5rem 2.5rem 2.5rem;
}

.title-without-cover {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.meta-tag i {
  font-size: 0.9em;
}

.tag-date { background-color: #e6f7ff; color: #1890ff; }
.tag-date:hover { background-color: #bae7ff; }
.tag-words { background-color: #ffeef2; color: #fb7299; }
.tag-words:hover { background-color: #ffccd5; }
.tag-category { background-color: #fffbe6; color: #faad14; }
.tag-category:hover { background-color: #fff1b8; }

.tag-item {
  background-color: rgba(128, 128, 128, 0.1);
  color: var(--text-color-secondary);
}
.tag-item:hover {
  background-color: rgba(128, 128, 128, 0.2);
  color: var(--text-color);
}

/* ======================================================= */
/* Markdown 内容样式                                     */
/* ======================================================= */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5) {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 600;
  color: var(--text-color);
}
.markdown-content :deep(h2) {
  border-bottom: 1px solid var(--border-color);
}

.markdown-content :deep(p),
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  line-height: 1.8;
  color: var(--text-color);
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--primary-color);
  padding: 0.1em 1em;
  color: var(--text-color-secondary);
  background-color: rgba(73, 177, 245, 0.05);
}

.markdown-content :deep(:not(pre) > code) {
  background-color: rgba(128, 128, 128, 0.15);
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  border-radius: 6px;
  color: var(--text-color);
}

.markdown-content :deep(table) {
  border-collapse: collapse;
}
.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: .6em 1em;
  color: var(--text-color);
}
.markdown-content :deep(th) {
  background-color: rgba(128, 128, 128, 0.1);
}
.markdown-content :deep(tr:nth-child(2n)) {
  background-color: rgba(128, 128, 128, 0.05);
}

.markdown-content :deep(pre) {
  position: relative;
  background: #2d3748;
  border-radius: 16px;
  margin: 2em 0;
  padding: 1.5em 1.5em 1.5em 4.5em;
  overflow-x: auto;
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(pre::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3em;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  z-index: 1;
}

.markdown-content :deep(pre::after) {
  content: '';
  position: absolute;
  left: 3em;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 2;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: #e2e8f0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  position: relative;
  z-index: 3;
}

.markdown-content :deep(.copy-code-btn) {
  position: absolute;
  top: 12px;
  right: 16px;
  background: rgba(45, 55, 72, 0.9);
  color: #a0aec0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  backdrop-filter: blur(4px);
}

.markdown-content :deep(.copy-code-btn:hover) {
  background: rgba(45, 55, 72, 1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.markdown-content :deep(.hljs-comment) { color: #718096; font-style: italic; }
.markdown-content :deep(.hljs-keyword) { color: #9f7aea; }
.markdown-content :deep(.hljs-string) { color: #68d391; }
.markdown-content :deep(.hljs-function) { color: #63b3ed; }
.markdown-content :deep(.hljs-number) { color: #fbb6ce; }
.markdown-content :deep(.hljs-variable) { color: #fc8181; }

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

/* ======================================================= */
/* 【新增】KaTeX 样式适配，确保公式颜色跟随主题          */
/* ======================================================= */
.markdown-content :deep(.katex) {
  font-size: 1.1em; /* 可以微调公式的默认大小 */
  color: var(--text-color); /* 让公式颜色跟随主题的文字颜色 */
}

/* /src/views/public/ArticleDetailView.vue -> <style scoped> */

/* ======================================================= */
/* 【新增】折叠元素 <details> 和 <summary> 样式适配       */
/* ======================================================= */

/* 为整个折叠块添加边框和背景，使其看起来像一个独立的组件 */
.markdown-content :deep(details) {
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background-color: rgba(128, 128, 128, 0.05); /* 使用一个与表格、引用块相似的半透明背景 */
  border: 1px solid var(--border-color); /* 使用主题的边框颜色 */
  border-radius: var(--border-radius-main); /* 使用主题的圆角 */
}

/* 确保折叠块内部的段落等也继承正确的颜色和行高 */
.markdown-content :deep(details > p) {
  color: var(--text-color);
  line-height: 1.8;
}

/* 设置折叠标题的样式 */
.markdown-content :deep(summary) {
  font-weight: 600; /* 加粗字体，使其看起来像个标题 */
  cursor: pointer; /* 鼠标悬停时显示为可点击的手指图标 */
  color: var(--text-color); /* 【核心修复】明确设置标题的颜色，这也会影响默认的三角箭头颜色 */
  transition: color 0.2s ease;
  margin-bottom: 0.5em; /* 如果展开了，给标题和内容之间增加一点间距 */
}

/* 鼠标悬停在标题上时，改变颜色以提供视觉反馈 */
.markdown-content :deep(summary:hover) {
  color: var(--primary-color); /* 悬停时使用主题的主色调，更醒目 */
}


/* 分割线和Giscus容器 */
.divider {
  margin: 40px 0;
  border-bottom: 1px solid var(--border-color);
}
.comment-section {
  background-color: var(--card-bg-color);
  backdrop-filter: blur(2px);
  border-radius: var(--border-radius-main);
  padding: 1.5rem;
  margin-top: 2rem;
}
.giscus-wrapper {
  margin-top: 20px;
}
</style>

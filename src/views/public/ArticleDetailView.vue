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

// 【全新】引入 markdown-it 及其插件
import MarkdownIt from 'markdown-it';
import mdMark from 'markdown-it-mark';
import mdKatex from 'markdown-it-katex';

// 代码高亮库和样式
import 'highlight.js/styles/atom-one-dark.css';

// KaTeX 的 CSS 样式 (markdown-it-katex 需要它)
import 'katex/dist/katex.min.css';

import PageHeader from '@/components/PageHeader.vue';

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
// 【全新】配置 markdown-it
// =======================================================

// 恢复highlight.js导入
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// 恢复markdown-it的highlight配置
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  // highlight: function (str, lang) {
  //   if (lang && hljs.getLanguage(lang)) {
  //     try {
  //       return '<pre class="hljs"><code>' +
  //         hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
  //         '</code></pre>';
  //     } catch (__) {}
  //   }
  //   return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  // }
  // 修复highlight函数的catch块
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>';
      } catch (error) {
        console.warn('代码高亮失败:', error);
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// 3. 使用插件
md.use(mdMark);   // 启用 ==高亮== 语法
md.use(mdKatex); // 启用 LaTeX 公式语法


// 计算属性，将 Markdown 文本转换为 HTML
const renderedContent = computed(() => {
  if (article.value && article.value.contentMd) {
    // 使用 markdown-it 进行渲染
    return md.render(article.value.contentMd);
  }
  return '';
});

// 一个函数，用于在渲染后添加复制按钮
const addCopyButtons = () => {
  nextTick(() => {
    // 【修改】选择器稍微调整以匹配 markdown-it 的输出
    const codeBlocks = document.querySelectorAll('.markdown-content pre.hljs');
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
      // 【修改】pre 标签现在是按钮的直接父级
      block.style.position = 'relative';
      block.appendChild(button);
    });
  });
};

// 加载/重新加载 Giscus 的函数
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

// --- 生命周期钩子和侦听器 ---

onMounted(() => {
  fetchArticleDetail(props.id);
});

watch(() => props.id, (newId) => {
  if (newId) {
    fetchArticleDetail(newId);
  }
});

watch(renderedContent, (newContent) => {
  if (newContent) {
    addCopyButtons();
  }
});

watch(shouldShowComments, (newValue) => {
  if (newValue) {
    nextTick(() => {
      loadGiscus();
    });
  }
});

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
/* 基本布局和卡片样式 */
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

/* 标题和元信息 */
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
.meta-tag i { font-size: 0.9em; }
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
/* Markdown 内容通用样式                                   */
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
.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

/*
.markdown-content :deep(pre.hljs) {
  position: relative;
  background: #2d3748;
  border-radius: 16px;
  margin: 2em 0;
  padding: 1.5em;
  overflow-x: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(pre.hljs code) {
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: transparent;
  padding: 0;
  border-radius: 0;
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
*/

/* 修复代码块样式以适配主题 */
.markdown-content :deep(pre.hljs) {
  position: relative;
  background: var(--el-bg-color-page);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  margin: 2em 0;
  padding: 1.5em;
  overflow-x: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(pre.hljs code) {
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: var(--text-color);
}

.markdown-content :deep(.copy-code-btn) {
  position: absolute;
  top: 12px;
  right: 16px;
  background: var(--el-bg-color);
  color: var(--text-color-secondary);
  border: 1px solid var(--border-color);
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
  background: var(--el-bg-color-overlay);
  color: var(--text-color);
  transform: translateY(-1px);
}

/* ======================================================= */
/* 扩展语法样式 (高亮、公式、折叠块)                    */
/* ======================================================= */
/* 为 <mark> 高亮标签适配主题样式 */
.markdown-content :deep(mark) {
  background-color: rgba(73, 177, 245, 0.2);
  color: inherit;
  padding: 0.1em 0.3em;
  border-radius: 4px;
}

/* 修复KaTeX样式，确保下标正常显示 */
.markdown-content :deep(.katex) {
  font-size: 1.1em !important;
  color: var(--text-color) !important;
}

.markdown-content :deep(.katex-display) {
  margin: 1em 0 !important;
  text-align: center !important;
}

/* 确保KaTeX的上标下标正常显示 */
.markdown-content :deep(.katex .vlist-t) {
  display: inline-table !important;
}

.markdown-content :deep(.katex .vlist-r) {
  display: table-row !important;
}

.markdown-content :deep(.katex .vlist) {
  display: table-cell !important;
  vertical-align: baseline !important;
}

.markdown-content :deep(.katex .msupsub) {
  text-align: left !important;
}

/* 修复表格样式 */
.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  background-color: transparent;
}

.markdown-content :deep(thead) {
  background-color: var(--el-fill-color-light);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.6em 1em;
  color: var(--text-color);
  text-align: left;
  vertical-align: middle;
}

.markdown-content :deep(th) {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
}

.markdown-content :deep(tbody tr:nth-child(odd)) {
  background-color: transparent;
}

.markdown-content :deep(tbody tr:nth-child(even)) {
  background-color: var(--el-fill-color-lighter);
}

.markdown-content :deep(tbody tr:hover) {
  background-color: var(--el-fill-color-light);
}
/* 折叠元素 <details> 和 <summary> 样式适配 */
.markdown-content :deep(details) {
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background-color: rgba(128, 128, 128, 0.05);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-main);
}
.markdown-content :deep(summary) {
  font-weight: 600;
  cursor: pointer;
  color: var(--text-color);
  transition: color 0.2s ease;
  margin-bottom: 0.5em;
}
.markdown-content :deep(summary:hover) {
  color: var(--primary-color);
}
.markdown-content :deep(details > *) {
  color: var(--text-color);
}

/* ======================================================= */
/* 评论区样式                                            */
/* ======================================================= */
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

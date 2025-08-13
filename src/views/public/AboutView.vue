<!-- /src/views/public/AboutView.vue -->
<template>
  <PageHeader
    title="关于我"
    cover-image="https://images.selflo06.xyz/background-old.jpg"
  />
  <div class="about-view card">
    <!-- 添加动态类名绑定 -->
    <div
      class="content"
      :class="{ 'dark-theme': themeStore.theme === 'dark' }"
      v-html="aboutContentHtml"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

import MarkdownIt from 'markdown-it'
import mdMark from 'markdown-it-mark'
import mdKatex from 'markdown-it-katex'
import 'katex/dist/katex.min.css'

// 添加代码高亮库和样式
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// 修改 MarkdownIt 配置，添加代码高亮功能
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
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


// 使用插件
md.use(mdMark);
md.use(mdKatex);

const aboutContentMd = ref(`
Hiii, 我是 selflo，一名来自**南京大学智能软件**的学生！ (^▽^)

这个博客诞生于我的大一暑假（2025.7.3 - 2025.7.8），是我给自己布置的一份复习和巩固知识的暑期作业，也是一个**从零开始，完全手写**(存疑)的项目。

在UI设计上，很大程度上参考了优秀的 Hexo 主题，并在此基础上进行了简化和二次创作。

说实话，建立这个博客的过程，大概是 90% 的 \`Ctrl+C\` + \`Ctrl+V\`，加上 10% 的灵感……而这 10% 的灵感，几乎全部来自于我强大的开发伙伴——**伟大的 Gemini**！在它的辅助下，整个开发过程充满了探索的乐趣。

我也不知道这个博客能更新多久~（笑，明明刚创建就说这种话）~，但真心希望它能记录下我的成长轨迹。

==总之，非常感谢你愿意点开我的博客来看！== ヾ(o´▽\`o)ﾉ
`)

const aboutContentHtml = computed(() => {
  return md.render(aboutContentMd.value)
})
</script>

<style scoped>
.page-title {
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
}

.about-view.card {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-main);
  padding: 2.5rem;
  box-shadow: var(--card-shadow);
  text-align: left;
  color: var(--text-color);
}

.content :deep(p) {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-color);
  margin-bottom: 1.2rem;
}

.content :deep(strong) {
  color: var(--primary-color);
  font-weight: 600;
}

/* 确保 <mark> 标签样式也在这里生效 */
.content :deep(mark) {
  background-color: rgba(73, 177, 245, 0.2);
  color: inherit;
  padding: 0.1em 0.3em;
  border-radius: 4px;
}

.content :deep(code) {
  background-color: var(--code-bg-color);
  color: var(--code-text-color);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95em;
}

/* 亮色主题下的表格样式 */
.content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  background-color: transparent;
}

.content :deep(thead) {
  background-color: var(--el-fill-color-light);
}

.content :deep(th),
.content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.6em 1em;
  color: var(--text-color);
  text-align: left;
  vertical-align: middle;
}

.content :deep(th) {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
}

.content :deep(tbody tr:nth-child(odd)) {
  background-color: transparent;
}

.content :deep(tbody tr:nth-child(even)) {
  background-color: var(--el-fill-color-lighter);
}

.content :deep(tbody tr:hover) {
  background-color: var(--el-fill-color-light);
}

/* 使用动态类名方式设置暗色主题下的表格样式 */
.content.dark-theme :deep(table) {
  background-color: transparent;
  border-color: #444;
}

.content.dark-theme :deep(thead) {
  background-color: #2d2d2d;
}

.content.dark-theme :deep(th) {
  background-color: #2d2d2d;
  color: #e1e4e8;
  border-color: #444;
}

.content.dark-theme :deep(td) {
  color: #e1e4e8;
  border-color: #444;
  background-color: transparent;
}

.content.dark-theme :deep(tbody tr:nth-child(even)) {
  background-color: #2a2a2a;
}

.content.dark-theme :deep(tbody tr:nth-child(odd)) {
  background-color: #202020;
}

.content.dark-theme :deep(tbody tr:hover) {
  background-color: #303030;
}

/* 代码块样式 - 修改白天模式的背景色 */
.content :deep(pre.hljs) {
  position: relative;
  background: #ebedef;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  margin: 2em 0;
  padding: 1.5em;
  overflow-x: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.content :deep(pre.hljs code) {
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: #24292f; /* 白天模式下使用深色文字 */
}

/* 暗色主题下的代码块样式保持不变 */
.content.dark-theme :deep(pre.hljs) {
  background: #1e1e1e;
  border-color: #3a3a3a;
}

.content.dark-theme :deep(pre.hljs code) {
  color: #e1e4e8;
}
</style>

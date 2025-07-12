<template>
  <PageHeader
    title="关于我"
    cover-image="https://cdn.jsdelivr.net/gh/SelfLo06/MyImages@main/background.jpg"
  />
  <div class="about-view card">
    <div class="content" v-html="aboutContentHtml"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// 引入 marked 库
import { marked } from 'marked';
import PageHeader from '@/components/PageHeader.vue';

const aboutContentMd = ref(`
Hiii, 我是 selflo，一名来自**南京大学智能软件**的学生！ (^▽^)

这个博客诞生于我的大一暑假（2025.7.3 - 2025.7.8），是我给自己布置的一份复习和巩固知识的暑期作业，也是一个**从零开始，完全手写**~(存疑)~的项目。

在UI设计上，很大程度上参考了优秀的 Hexo 主题，并在此基础上进行了简化和二次创作。

说实话，建立这个博客的过程，大概是 90% 的 \`Ctrl+C\` + \`Ctrl+V\`，加上 10% 的灵感……而这 10% 的灵感，几乎全部来自于我强大的开发伙伴——**伟大的 Gemini**！在它的辅助下，整个开发过程充满了探索的乐趣。

我也不知道这个博客能更新多久~（笑，明明刚创建就说这种话）~，但真心希望它能记录下我的成长轨迹。

总之，非常感谢你愿意点开我的博客来看！ ヾ(o´▽\`o)ﾉ
`);

// 创建一个计算属性，它会自动将上面的 Markdown 字符串解析为 HTML
const aboutContentHtml = computed(() => {
  return marked(aboutContentMd.value);
});
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
  /* 为卡片内的文本颜色设置一个基础值 */
  color: var(--text-color);
}

/*
  使用 :deep() 为 v-html 渲染的内容设置样式
*/
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

.content :deep(code) {
  background-color: var(--code-bg-color);
  color: var(--code-text-color);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95em;
}
</style>

<!-- src/components/PageHeader.vue -->
<template>
  <div class="page-header-banner">
    <!-- 背景图片 -->
    <img v-if="coverImage" :src="coverImage" :alt="title" class="banner-image">
    <!-- 黑色渐变蒙层，确保标题文字清晰可读 -->
    <div class="banner-overlay"></div>
    <!-- 标题 -->
    <h1 class="banner-title">{{ title }}</h1>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    // 改为非必需，这样没有封面的页面（如关于页）也可以复用
    required: false,
    default: '' // 提供一个默认值
  }
});
</script>

<style scoped>
.page-header-banner {
  position: relative; /* 为内部绝对定位的元素提供参考 */
  height: 45vh; /* 横幅高度为视口的45%，可以按需调整 */
  min-height: 280px; /* 最小高度 */
  border-radius: var(--border-radius-main) var(--border-radius-main) 0 0; /* 只给左上和右上角设置圆角 */
  overflow: hidden; /* 隐藏超出圆角的部分 */
  color: white;
  background-color: #444; /* 当图片未加载时的备用背景色 */
}

.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片不变形地填满容器 */
  z-index: 1;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 从上到下，由透明过渡到半透明的黑色，压暗底部，突出标题 */
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
  z-index: 2;
}

.banner-title {
  position: absolute;
  bottom: 2.5rem; /* 标题距离底部的位置 */
  left: 3rem;   /* 标题距离左侧的位置 */
  font-size: 2.8rem;
  font-weight: 700;
  /* 文字阴影，进一步提升可读性 */
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.7);
  z-index: 3;
  margin: 0;
}
</style>

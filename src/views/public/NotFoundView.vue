<!-- src/views/public/NotFoundView.vue -->
<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <h1 class="error-code">404</h1>
      <p class="error-message">哎呀！你访问的页面好像迷路了...</p>
      <p class="error-suggestion">不如，先回到我们的起点看看？</p>

      <!-- 返回首页的按钮 -->
      <RouterLink to="/" class="back-home-button">
        <i class="fa-solid fa-house"></i>
        <span>返回首页</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
// 这个页面不需要任何JS逻辑
</script>

<style scoped>
.not-found-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 1rem;
}

.not-found-card {
  max-width: 500px;
  width: 100%;
  background-color: var(--card-bg-color, white);
  border-radius: var(--border-radius-main);
  box-shadow: var(--card-shadow);
  padding: 3rem 2rem;
  text-align: center;
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

.error-message {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-color);
  margin: 1.5rem 0 0.5rem;
}

.error-suggestion {
  font-size: 1rem;
  color: #888;
  margin-bottom: 2.5rem;
}

.back-home-button {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1.8rem;

  background-color: var(--primary-color);
  color: white;

  border-radius: 50px; /* 胶囊形状 */
  border: none;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;

  cursor: pointer;
  transition: all 0.3s ease;
}

.back-home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(49, 174, 255, 0.3);
}
</style>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/utils/request.js';

// --- 数据绑定 ---
const username = ref('');
const password = ref('');
// 用于绑定站点密码的 ref
const secretKey = ref('');
const errorMessage = ref('');
const router = useRouter();

// 从环境变量中获取站点密码
const correctSecretKey = import.meta.env.VITE_APP_ADMIN_SECRET_KEY;

const handleLogin = async () => {
  errorMessage.value = '';

  // --- 前端校验 ---
  if (!username.value || !password.value || !secretKey.value) {
    errorMessage.value = '用户名、密码和站点密码都不能为空';
    return;
  }

  // --- 站点密码校验 ---
  if (secretKey.value !== correctSecretKey) {
    errorMessage.value = '站点密码错误！';
    return;
  }

  // --- 后端 API 请求 ---
  try {
    const response = await request.post('/user/login', {
      username: username.value,
      password: password.value
    });

    // 假设后端成功返回 code: 0 和 data: "token_string"
    if (response.code === 0 && response.data) {
      const token = response.data;
      // 将 Token 存入 localStorage
      localStorage.setItem('Authorization', token);
      alert('登录成功！');
      // 跳转到后台文章管理页
      router.push({ name: 'admin-articles' });
    } else {
      // 处理后端返回的业务错误
      errorMessage.value = response.message || '用户名或密码不正确';
    }

  } catch (error) {
    // 处理网络或服务器级别的错误
    errorMessage.value = error.message || '服务连接失败，请稍后再试。';
    console.error("登录失败:", error);
  }
};
</script>

<template>
  <div class="login-container">
    <h1>博客后台登录</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="username" placeholder="请输入用户名">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码">
      </div>
      <div class="form-group">
        <label for="secretKey">站点密码</label>
        <input type="password" id="secretKey" v-model="secretKey" placeholder="请输入站点密码">
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <button type="submit">登 录</button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  width: 350px;
  margin: 100px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
}
h1 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #0056b3;
}
.error-message {
  color: #d93025;
  margin-bottom: 15px;
  text-align: center;
  min-height: 20px;
}
</style>

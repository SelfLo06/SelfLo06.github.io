<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/utils/request.js';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  if (!username.value || !password.value) {
    errorMessage.value = '用户名和密码都不能为空';
    return;
  }

  try {
    const response = await request.post('/user/login', {
      username: username.value,
      password: password.value
    });

    const token = response.data;
    localStorage.setItem('Authorization', token);
    alert('登录成功！');
    router.push({ name: 'admin-dashboard' });

  } catch (error) {
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

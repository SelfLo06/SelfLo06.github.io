<!-- /src/App.vue (修正版) -->
<template>
  <!--
    这个组件是整个应用的“路由器出口”。
    它会根据当前URL，显示路由表中匹配的组件。
    对于'/'，它会显示 PublicLayout，然后 PublicLayout 内部的 RouterView 会显示 HomeView。
  -->
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>

<style>
/*
  在这里可以放一些全局的CSS样式，
  例如重置默认的 margin 和 padding，让所有浏览器表现一致。
  我们暂时保持为空。
*/
</style>

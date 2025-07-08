import { createRouter, createWebHistory } from 'vue-router';
// 【第一步】引入我们即将创建的公共布局组件
import PublicLayout from '../layouts/PublicLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ===============================================
    // 1. 前台展示路由 (应用了公共布局)
    // ===============================================
    {
      path: '/',
      // 【第二步】将根路由的组件设置为公共布局组件
      component: PublicLayout,
      // 【第三步】将所有前台页面作为它的子路由
      children: [
        {
          path: '', // 当访问'/'时，默认渲染这个组件
          name: 'home',
          // 指向我们为前台专门创建的 HomeView
          component: () => import('../views/public/HomeView.vue')
        },
        {
          path: 'article/:id', // 文章详情页路由
          name: 'articleDetail',
          // 指向我们为前台专门创建的 ArticleDetailView
          component: () => import('../views/public/ArticleDetailView.vue'),
          props: true // 同样建议开启 props，方便组件获取 id
        }
        // 未来还可以添加分类列表页、关于页面等...
        // {
        //   path: 'categories',
        //   name: 'categories',
        //   component: () => import('../views/public/CategoryListView.vue')
        // }
      ]
    },

    // ===============================================
    // 2. 后台管理路由
    // ===============================================
    {
      path: '/login',
      name: 'login',
      // 注意这里的路径，因为我们移动了文件
      component: () => import('../views/admin/LoginView.vue')
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      // 访问 /admin 时，自动跳转到文章管理页
      redirect: { name: 'admin-articles' },
      // 【关键】用 meta 字段标记这一组路由都需要登录
      meta: { requiresAuth: true },
      children: [
        {
          path: 'articles',
          name: 'admin-articles',
          component: () => import('../views/admin/ArticleManageView.vue')
        },
        // 发布文章的路由
        {
          path: 'article/publish',
          name: 'article-publish',
          component: () => import('../views/admin/ArticleEditView.vue')
        },
        // 编辑文章的路由
        // :id 是一个动态参数，可以匹配 /admin/article/edit/1, /admin/article/edit/23 等
        {
          path: 'article/edit/:id',
          name: 'article-edit',
          component: () => import('../views/admin/ArticleEditView.vue'),
          props: true // 【关键】将路由参数 :id 作为 props 传递给组件
        },
        {
          path: 'categories',
          name: 'admin-categories',
          // 指向我们新的分类管理组件
          component: () => import('../views/admin/CategoryManageView.vue')
        }
      ]
    }
  ]
});

// ===============================================
// 3. 全局路由守卫 (Navigation Guard)
// ===============================================
// to: 即将要进入的目标路由对象
// from: 当前导航正要离开的路由对象
// next: 一个必须执行的函数，决定了导航的行为
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('Authorization'); // 检查本地存储中是否有Token

  // 检查目标路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果此路由需要认证
    if (!isLoggedIn) {
      // 没有 token，滚去登录
      // 但用户未登录，则重定向到登录页面
      next({ name: 'login' });
    } else {
      // 有 token，放行
      // 用户已登录，放行
      next();
    }
  } else {
    // 如果此路由不需要认证，直接放行
    next();
  }
});

export default router;

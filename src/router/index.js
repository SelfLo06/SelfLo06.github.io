import { createRouter, createWebHistory } from 'vue-router';
// 【第一步】引入我们即将创建的公共布局组件
import PublicLayout from '../layouts/PublicLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue'

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
        },
        // 【【【 新增的路由规则 】】】
        {
          path: 'categories', // 访问 /categories 时匹配
          name: 'categories',
          // 渲染一个新的 CategoryView.vue 组件
          component: () => import('../views/public/CategoryView.vue')
        },
        {
          // 路径中包含一个动态参数 categoryId
          path: 'category/:categoryId/articles',
          name: 'category-articles',
          // 【核心】复用 HomeView 组件来展示文章列表
          component: () => import('../views/public/HomeView.vue'),
          // 【推荐】开启 props，这样 Vue Router 会自动将 categoryId 作为 prop 传递给 HomeView
          props: true
        },
        {
          path: 'about', // 当访问 /about 时匹配
          name: 'about',
          // 渲染我们刚刚创建的 AboutView.vue 组件
          component: () => import('../views/public/AboutView.vue')
        },
        {
          path: 'search', // 路径为 /search
          name: 'search',   // 路由命名为 'search'，与 LeftSidebar 中的 router.push 对应
          component: () => import('../views/public/SearchView.vue')
        },
        {
          // 路径中包含一个动态参数 tagId
          path: 'tags/:tagId/articles',
          name: 'tag-articles', // 【关键】这个名字必须和 RouterLink 中的 to.name 完全一致
          component: () => import('../views/public/HomeView.vue'),
          // 【推荐】开启 props，这样 Vue Router 会自动将 tagId 作为 prop 传递给 HomeView
          props: true
        },
        {
          // 我们为它定义一个清晰的路径
          path: 'tags/search',
          name: 'tag-search', // 命名，方便其他地方通过名字跳转
          // 指向我们新建的核心功能页面
          component: () => import('../views/public/TagSearchView.vue'),
          // 【注意】这里我们不开启 props: true，因为我们约定了使用 query 参数来传递
        }
      ]
    },

    // ===============================================
    // 2. 后台管理路由
    // ===============================================
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/admin/LoginView.vue')
    },
    // 【核心修改】
    // 我们将原有的 /admin 路由对象，修改为使用 AdminLayout 的布局路由
    {
      path: '/admin',
      component: AdminLayout,
      // 将 redirect 从这里移到路由守卫中处理更灵活
      meta: { requiresAuth: true },
      children: [
        // 一个默认的后台首页路由，方便重定向
        {
          path: '', // 当访问 /admin 时，默认渲染这个
          name: 'admin-dashboard',
          redirect: { name: 'admin-articles' } // 重定向到文章管理
        },
        {
          path: 'articles',
          name: 'admin-articles',
          component: () => import('../views/admin/ArticleManageView.vue')
        },
        {
          path: 'article/publish',
          name: 'article-publish',
          component: () => import('../views/admin/ArticleEditView.vue')
        },
        {
          path: 'article/edit/:id',
          name: 'article-edit',
          component: () => import('../views/admin/ArticleEditView.vue'),
          props: true
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('../views/admin/CategoryManageView.vue')
        },
        {
          path: 'tags',
          name: 'admin-tags',
          component: () => import('../views/admin/TagManageView.vue')
        }
      ]
    },
    {
      // :pathMatch(.*)* 是一个特殊的参数，它会匹配所有未被前面规则捕获的路径
      path: '/:pathMatch(.*)*',
      // 让它也使用公共布局，这样404页面也会有侧边栏和背景
      component: PublicLayout,
      children: [
        {
          path: '', // 默认渲染 NotFoundView
          name: 'NotFound',
          component: () => import('../views/public/NotFoundView.vue')
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
  const isLoggedIn = !!localStorage.getItem('Authorization');

  // 检查目标路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isLoggedIn) {
    // Case 1: 访问需要权限的页面，但未登录 -> 强制跳转到登录页
    next({ name: 'login' });
  } else if (to.name === 'login' && isLoggedIn) {
    // Case 2: 【体验优化】已登录用户访问登录页 -> 强制跳转到后台首页
    next({ name: 'admin-dashboard' });
  } else {
    // Case 3: 其他所有情况 (访问公共页、或已登录访问权限页) -> 直接放行
    next();
  }
});

export default router;

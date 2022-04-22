import Vue from 'vue'
import VueRouter from 'vue-router'
//import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect:'/login'
  },
  {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Login/index.vue')
  },
  {
    path: '/home',
    name: 'home',
    redirect:'/welcome',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Home/index.vue'),
    children:[
      {
        path: '/welcome',
        name: 'welcome',
        component: () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Welcome/index.vue')
      },
      {
        path: '/users',
        name: 'users',
        component: () => import(/* webpackChunkName: "users_roles_rights" */ '../views/User/index.vue')
      },
      {
        path: '/roles',
        name: 'roles',
        component: () => import(/* webpackChunkName: "users_roles_rights" */ '../views/Power/roles.vue')
      },
      {
        path: '/rights',
        name: 'rights',
        component: () => import(/* webpackChunkName: "users_roles_rights" */ '../views/Power/rights.vue')
      },
      {
        path: '/goods',
        name: 'goods',
        component: () => import(/* webpackChunkName: "goods_add" */ '../views/Goods/List/index.vue')
      },
      {
        path: '/goods/add',
        name:'goodsAdd',
        component:() => import(/* webpackChunkName: "goods_add" */ '../views/Goods/List/Children/index.vue')
      },
      {
        path: '/categories',
        name: 'categories',
        component: () => import(/* webpackChunkName: "categories_params" */ '../views/Goods/Cate/index.vue')
      },
      {
        path: '/params',
        name: 'params',
        component: () => import(/* webpackChunkName: "categories_params" */ '../views/Goods/Params/index.vue')
      },
      {
        path: '/orders',
        name: 'orders',
        component: () => import(/* webpackChunkName: "orders_reports" */ '../views/Order/index.vue')
      },
      {
        path: '/reports',
        name: 'reports',
        component: () => import(/* webpackChunkName: "orders_reports" */ '../views/Report/index.vue')
      },
      
    ]
  },

]

const router = new VueRouter({
  routes
})

router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next();
  const tokenStr = sessionStorage.getItem('token')
  if(!tokenStr){ 
     return next('/login')
  }
  next()
})


export default router

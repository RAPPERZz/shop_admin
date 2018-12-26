import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Users from '@/components/users/Users'
import Rights from '@/components/rights/Rights'
import Role from '@/components/rights/Role'
import Category from '@/components/product/Category'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      children: [
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Role
        },
        {
          path: '/categories',
          component: Category
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // console.log(to, from, next)

  if (to.path === '/login') {
    next()
    return
  }

  let toKen = localStorage.getItem('token')
  if (toKen) {
    next()
  } else {
    next('/login')
  }
})

export default router

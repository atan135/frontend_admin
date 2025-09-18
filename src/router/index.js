import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { title: 'Dashboard', icon: 'DashboardOutlined' }
            },
            {
                path: '/users',
                name: 'UserManagement',
                component: () => import('@/views/UserManagement.vue'),
                meta: { title: 'User Management', icon: 'UserOutlined' }
            },
            {
                path: '/profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue'),
                meta: { title: 'Profile', icon: 'ProfileOutlined' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    logger.info('Navigation', { from: from.path, to: to.path })

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        logger.warn('Unauthorized access attempt', { path: to.path })
        next('/login')
    } else if (to.path === '/login' && authStore.isLoggedIn) {
        logger.info('Redirecting logged in user to dashboard')
        next('/')
    } else {
        next()
    }
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import PhotoEditorView from '../views/PhotoEditorView.vue'
import TagsView from '../views/TagsView.vue'

import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile/:username',
        name: 'UserProfile',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/editor/:id',
        name: 'PhotoEditor',
        component: PhotoEditorView,
        meta: { requiresAuth: true }
    },
    {
        path: '/tags',
        name: 'Tags',
        component: TagsView,
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    // sprawdzanie czy trzeba btc zalogowanym
    if (to.meta.requiresAuth && !authStore.user) {
        next({ name: 'Login' })
    } else if ((to.name === 'Login' || to.name === 'Register') && authStore.user) {
        next({ name: 'Home' });
    } else {
        next()
    }
})

export default router

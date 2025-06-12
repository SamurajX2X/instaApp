import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api'

export const useAuthStore = defineStore('auth', () => {
    // Initialize with dummy user for testing
    const user = ref({
        id: '1',
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com'
    })
    const token = ref(localStorage.getItem('token') || 'dummy-token-for-testing')

    const isLoggedIn = computed(() => !!token.value)
    const isAuthenticated = computed(() => !!token.value)

    // Login 
    async function login(email, password) {
        try {
            const response = await apiService.auth.login(email, password)

            if (response.success && response.data) {
                token.value = response.data.token
                user.value = response.data.user
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                return { success: true }
            } else {
                return { success: false, error: response.error || 'Login failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    // Register 
    async function register(userData) {
        try {
            const response = await apiService.auth.register(userData)

            if (response.success && response.data) {
                token.value = response.data.token
                user.value = response.data.user
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                return { success: true }
            } else {
                return { success: false, error: response.error || 'Registration failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    // Logout 
    function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        apiService.auth.logout()
    }

    //  authen
    async function checkAuth() {
        if (!token.value) {
            const savedUser = localStorage.getItem('user')
            const savedToken = localStorage.getItem('token')

            if (savedUser && savedToken) {
                try {
                    user.value = JSON.parse(savedUser)
                    token.value = savedToken
                    return true
                } catch (error) {
                    logout()
                    return false
                }
            }
            return false
        }

        try {
            const response = await apiService.auth.getCurrentUser()
            if (response.success && response.data) {
                user.value = response.data
                return true
            } else {
                logout()
                return false
            }
        } catch (error) {
            logout()
            return false
        }
    }

    return {
        user,
        token,
        isLoggedIn,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth
    }
})

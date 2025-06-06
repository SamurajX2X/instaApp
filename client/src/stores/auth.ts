import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'

interface User {
    id: string
    name: string
    lastname: string
    email: string
    avatar?: string
}

interface AuthResponse {
    user: User
    token: string
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(localStorage.getItem('token'))

    const isLoggedIn = computed(() => !!token.value);

    // Logowanie użytkownika
    async function login(email: string, password: string) {
        try {
            const response = await apiService.auth.login(email, password)

            if (response.success && response.data) {
                const authData = response.data as AuthResponse
                token.value = authData.token
                user.value = authData.user
                localStorage.setItem('token', authData.token)
                localStorage.setItem('user', JSON.stringify(authData.user))
                return { success: true }
            } else {
                return { success: false, error: response.error || 'Login failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    // Rejestracja użytkownika
    async function register(userData: { name: string; lastname: string; email: string; password: string }) {
        try {
            const response = await apiService.auth.register(userData)

            if (response.success && response.data) {
                const authData = response.data as AuthResponse
                token.value = authData.token
                user.value = authData.user
                localStorage.setItem('token', authData.token)
                localStorage.setItem('user', JSON.stringify(authData.user))
                return { success: true }
            } else {
                return { success: false, error: response.error || 'Registration failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    // Wylogowanie użytkownika
    function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        apiService.auth.logout()
    }

    // Sprawdzenie autoryzacji
    async function checkAuth() {
        if (!token.value) {
            // Spróbuj przywrócić z localStorage
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
            // Walidacja tokenu z serwerem
            const response = await apiService.auth.getCurrentUser()
            if (response.success && response.data) {
                user.value = response.data as User
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
        login,
        register,
        logout,
        checkAuth
    }
})

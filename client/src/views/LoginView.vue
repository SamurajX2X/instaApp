<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-main via-white to-gray-50 px-4 py-8">
    <div class="max-w-md w-full bg-white rounded-lg shadow-card p-8">      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange bg-clip-text text-transparent mb-2">Sign in to InstaApp</h1>
        <p class="text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-primary hover:text-primary-600 font-medium">Create one here</router-link>
        </p>
      </div>
      
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="block text-sm font-medium text-dark mb-2">Email</label>          <input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            required
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-instagram-pink focus:ring-2 focus:ring-instagram-pink/10 transition-all duration-200 hover:border-gray-300"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-dark mb-2">Password</label>          <input
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            required
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-instagram-pink focus:ring-2 focus:ring-instagram-pink/10 transition-all duration-200 hover:border-gray-300"
            placeholder="Enter your password"
          />
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {{ error }}
        </div>        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-instagram-pink/25 hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 flex items-center justify-center"
        >
          <AppLoader v-if="loading" size="small" />
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLoader from '../components/AppLoader.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.value.email, form.value.password)
    
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.error || 'Login failed'
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

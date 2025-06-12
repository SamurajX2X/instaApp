<template>
  <div class="register-container">
    <div class="register-form">
      <h1>Create Account</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">First Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required 
            placeholder="Enter your first name"
          />
        </div>
        
        <div class="form-group">
          <label for="lastname">Last Name</label>
          <input 
            type="text" 
            id="lastname" 
            v-model="lastname" 
            required 
            placeholder="Enter your last name"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Enter your email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Create a password"
          />
        </div>
        
        <button type="submit" class="register-button">
          <template v-if="!loading">Register</template>
          <template v-if="loading">
            Registering...
            <span class="loader"></span>
          </template>
        </button>
        
        <div class="login-link">
          Already have an account? <router-link to="/login">Login here</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const name = ref('')
    const lastname = ref('')
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const errorMessage = ref('')
    
    const handleRegister = async () => {
      loading.value = true
      errorMessage.value = ''
      
      // Basic form validation
      if (password.value.length < 6) {
        errorMessage.value = 'Password must be at least 6 characters long'
        loading.value = false
        return
      }
      
      try {
        const userData = {
          name: name.value,
          lastname: lastname.value,
          email: email.value,
          password: password.value
        }
        
        const result = await authStore.register(userData)
        
        if (result.success) {
          router.push('/')
        } else {
          errorMessage.value = result.error || 'Registration failed. Please try again.'
        }
      } catch (error) {
        errorMessage.value = 'An unexpected error occurred. Please try again.'
        console.error('Registration error:', error)
      } finally {
        loading.value = false
      }
    }
    
    return {
      name,
      lastname,
      email,
      password,
      loading,
      errorMessage,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fafafa;
}

.register-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  color: #262626;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #262626;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #0095f6;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
}

.register-button:hover {
  background-color: #0086e0;
}

.login-link {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}

.login-link a {
  color: #0095f6;
  text-decoration: none;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 8px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

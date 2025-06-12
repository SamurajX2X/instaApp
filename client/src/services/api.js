import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000
})

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response || error.message || error)
        return Promise.reject(error)
    }
)

const get = async (endpoint) => {
    try {
        const response = await apiClient.get(endpoint)
        return response.data
    } catch (error) {
        throw error
    }
}

const post = async (endpoint, data) => {
    try {
        const response = await apiClient.post(endpoint, data)
        return response.data
    } catch (error) {
        throw error
    }
}

const del = async (endpoint) => {
    try {
        const response = await apiClient.delete(endpoint)
        return response.data
    } catch (error) {
        throw error
    }
}

const patch = async (endpoint, data) => {
    try {
        const response = await apiClient.patch(endpoint, data)
        return response.data
    } catch (error) {
        throw error
    }
}

const file = async (endpoint, formData) => {
    try {
        const response = await apiClient.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const api = {
    auth: {
        login: (email, password) => post('/users/login', { email, password }),
        register: (userData) => post('/users/register', userData),
        logout: () => { localStorage.removeItem('token') }
    },

    photos: {
        getAll: async () => {
            try {
                const data = await get('/photos')
                return { success: true, data }
            } catch (error) {
                return { success: false, error: error.message, data: [] }
            }
        },
        getById: async (id) => {
            try {
                const data = await get(`/photos/${id}`)
                return { success: true, data }
            } catch (error) {
                return { success: false, error: error.message, data: null }
            }
        },
        upload: async (formData) => {
            try {
                const data = await file('/photos', formData)
                return { success: true, data }
            } catch (error) {
                return { success: false, error: error.message, data: null }
            }
        },
        delete: async (id) => {
            try {
                const data = await del(`/photos/${id}`)
                return { success: true, data }
            } catch (error) {
                return { success: false, error: error.message, data: null }
            }
        },
        addTags: async (id, tags) => {
            try {
                const data = await patch(`/photos/${id}`, { tags })
                return { success: true, data }
            } catch (error) {
                return { success: false, error: error.message, data: null }
            }
        },
        applyFilter: async (id, filter) => {
            try {
                const data = await patch(`/photos/${id}`, { filter })
                return { success: true, data }
            } catch (error) {
                return { success: false, error: error.message, data: null }
            }
        }
    },

    tags: {
        getAll: async () => {
            try {
                const data = await get('/tags')
                return { success: true, data }
            } catch (error) {
                return { success: false, error: error.message, data: [] }
            }
        }
    }
}

export default api

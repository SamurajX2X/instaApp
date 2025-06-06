// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'

// API Response Interface
interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

// HTTP Methods
interface RequestOptions extends RequestInit {
    timeout?: number
}

class ApiService {
    private timeout: number = 10000

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token')
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const { timeout = this.timeout, ...requestOptions } = options

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                signal: controller.signal,
                headers: {
                    ...this.getAuthHeaders(),
                    ...requestOptions.headers,
                },
                ...requestOptions,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return {
                success: true,
                data,
                message: data.message || 'Success'
            }
        } catch (error) {
            clearTimeout(timeoutId)
            console.error('API Error:', error)

            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request timeout'
                }
            }

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Authentication API
    auth = {
        login: (email: string, password: string) =>
            this.request('/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),

        register: (userData: any) =>
            this.request('/users/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            }),

        logout: () => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            return Promise.resolve({ success: true })
        },

        getCurrentUser: () =>
            this.request('/users/me'),
    }

    // Photos API
    photos = {
        getAll: () =>
            this.request('/photos'),

        getById: (id: string) =>
            this.request(`/photos/${id}`),

        upload: (formData: FormData) => {
            const token = localStorage.getItem('token')
            return this.request('/photos', {
                method: 'POST',
                body: formData,
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                },
            })
        },

        delete: (id: string) =>
            this.request(`/photos/${id}`, {
                method: 'DELETE',
            }),

        like: (id: string) =>
            this.request(`/photos/${id}/like`, {
                method: 'POST',
            }),

        unlike: (id: string) =>
            this.request(`/photos/${id}/unlike`, {
                method: 'POST',
            }),
    }    // Tags API
    tags = {
        getAll: () =>
            this.request('/tags'),

        create: (name: string) =>
            this.request('/tags', {
                method: 'POST',
                body: JSON.stringify({ name }),
            }),

        addToPhoto: (photoId: string, tagId: string) =>
            this.request(`/photos/${photoId}/tags`, {
                method: 'POST',
                body: JSON.stringify({ tagId }),
            }),

        removeFromPhoto: (photoId: string, tagId: string) =>
            this.request(`/photos/${photoId}/tags/${tagId}`, {
                method: 'DELETE',
            }),
    }

    // Profile API
    profile = {
        get: (username: string) =>
            this.request(`/profile/${username}`),

        update: (profileData: any) =>
            this.request('/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData),
            }),

        getByUser: (userId: string) =>
            this.request(`/profile/user/${userId}`),
    }

    // Filters API
    filters = {
        getAll: () =>
            this.request('/filters'),

        apply: (photoId: string, filterName: string) =>
            this.request('/filters/apply', {
                method: 'POST',
                body: JSON.stringify({ photoId, filterName }),
            }),
    }

    // Image URL Helpers
    images = {
        getUrl: (photoId: string, filterName?: string): string => {
            if (filterName) {
                return `${API_BASE_URL}/getimage/${photoId}/filter/${filterName}`
            }
            return `${API_BASE_URL}/getimage/${photoId}`
        },

        getProfileUrl: (userEmail: string, imageName: string): string => {
            return `${API_BASE_URL}/getimage/profile/${userEmail}/${imageName}`
        },

        getAvatarUrl: (userId: string): string => {
            return `${API_BASE_URL}/getimage/avatar/${userId}`
        },
    }

    // Health Check
    health = {
        check: () =>
            this.request('/health'),
    }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService

// Export types
export type { ApiResponse }

const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Photo endpoints
    async getPhotos() {
        return this.request('/photos');
    }

    async uploadPhoto(formData: FormData) {
        return this.request('/photos', {
            method: 'POST',
            body: formData,
            headers: {}, // Let browser set Content-Type for FormData
        });
    }

    async getPhoto(id: string) {
        return this.request(`/photos/${id}`);
    }

    async deletePhoto(id: string) {
        return this.request(`/photos/${id}`, {
            method: 'DELETE',
        });
    }

    // Tags endpoints
    async getTags() {
        return this.request('/tags');
    }

    async createTag(name: string) {
        return this.request('/tags', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    async addTagToPhoto(photoId: string, tagId: string) {
        return this.request(`/photos/${photoId}/tags`, {
            method: 'POST',
            body: JSON.stringify({ tagId }),
        });
    }

    // Profile endpoints
    async getProfile(username: string) {
        return this.request(`/profile/${username}`);
    }

    async updateProfile(profileData: any) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Auth endpoints (if you add authentication)
    async login(username: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    async register(userData: any) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Filters endpoints
    async getFilters() {
        return this.request('/filters');
    }

    async applyFilter(photoId: string, filterName: string) {
        return this.request('/filters/apply', {
            method: 'POST',
            body: JSON.stringify({ photoId, filterName }),
        });
    }
}

export const apiService = new ApiService();
export default apiService;

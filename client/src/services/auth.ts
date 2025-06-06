import { reactive, computed } from 'vue';
import apiService from './api';

interface User {
    id: string;
    name: string;
    lastname: string;
    email: string;
    confirmed: boolean;
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    websiteUrl?: string;
    profilePhoto?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const state = reactive<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
});

// Initialize auth state from localStorage
const initializeAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
    }
};

export const useAuth = () => {
    // Logowanie użytkownika
    const login = async (credentials: { email: string; password: string }) => {
        state.isLoading = true;
        try {
            const response = await apiService.auth.login(credentials.email, credentials.password);
            // Assuming response.data is of type AuthResponse from the store
            if (response.success && response.data) {
                state.user = response.data.user as User;
                state.token = response.data.token;
                state.isAuthenticated = true;
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            state.isLoading = false;
        }
    };

    const register = async (userData: { name: string; lastname: string; email: string; password: string }) => {
        state.isLoading = true;
        try {
            const response = await (apiService as any).register(userData);
            return response;
        } catch (error) {
            throw error;
        } finally {
            state.isLoading = false;
        }
    };

    // Wylogowanie użytkownika
    const logout = async () => {
        try {
            await apiService.auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    };

    // Aktualizacja profilu użytkownika
    const updateProfile = async (profileData: any) => {
        try {
            const response = await apiService.profile.update(profileData);
            if (response.success && response.data) {
                const updatedUser = response.data as User;
                state.user = { ...state.user, ...updatedUser } as User;
                localStorage.setItem('user', JSON.stringify(state.user));
                return updatedUser;
            }
            // Handle error or unsuccessful response
            throw new Error(response.error || 'Failed to update profile');
        } catch (error) {
            throw error;
        }
    };

    // Przesyłanie zdjęcia profilowego
    const uploadProfilePhoto = async (formData: FormData) => {
        try {
            // Assuming apiService.profile has an 'uploadAvatar' method
            // and it returns a response with an 'avatar' property in 'data'
            const response = await apiService.profile.uploadAvatar(formData);
            if (state.user && response.success && response.data && response.data.avatar) {
                state.user.profilePhoto = response.data.avatar;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    return {
        // State
        user: computed(() => state.user),
        token: computed(() => state.token),
        isAuthenticated: computed(() => state.isAuthenticated),
        isLoading: computed(() => state.isLoading),

        // Actions
        login,
        register,
        logout,
        updateProfile,
        uploadProfilePhoto,
        initializeAuth,
    };
};

// Initialize auth on module load
initializeAuth();

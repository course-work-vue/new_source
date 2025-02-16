import { defineStore } from 'pinia';
import jwt_decode from 'jwt-decode';
import AuthService from '../services/auth.service';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        noAccess: false,
    }),

    getters: {
        isLoggedIn: (state) => !!state.user,
    },

    actions: {
        async login(userData) {
            try {
                const user = await AuthService.login(userData);
                this.user = user;
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            } catch (error) {
                throw error;
            }
        },

        logout() {
            AuthService.logout();
            this.user = null;
            localStorage.removeItem('user');
        },

        async register(userData) {
            try {
                const response = await AuthService.register(userData);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        checkTokenExpiration() {
            const token = this.user ? this.user.accessToken : null;
            if (token) {
                try {
                    const decodedToken = jwt_decode(token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        this.logout(); // Если токен истек, разлогиниваем пользователя
                    }
                } catch (error) {
                    console.error('Ошибка при декодировании токена:', error);
                }
            }
        }
    }
});

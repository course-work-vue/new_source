import api from '@/api/api';
import User from '@/model/admin-group/User'; // Ensure this is the correct path to your User model
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useUserStore = defineStore('user', {
    state: () => ({
        userList: [],
    }),
    getters: {
        userMap(state) {
            return state.userList.reduce((map, user) => {
                map[user.id] = user;
                return map;
            }, {});
        },
        activeSortedUsers(state) {
            return state.userList.sort((a, b) => a.username.localeCompare(b.username));
        },
    },
    actions: {
        async getUserList() {
            const responseData = await api.getUserList();
            this.userList = responseData.map((user) => {
                return new User(user);
            });
        },

        async getUser(id) {
            const response = await api.getUser(id);
            return new User(response);
        },

        async postUser(user) {
            try {
                const response = await api.postUser(user);

                if (response) {
                    await this.getUserList();
                    ToastService.showSuccess('Пользователь успешно добавлен');
                    return response;
                } else {
                    ToastService.showError('Не удалось добавить пользователя');
                }
            } catch (error) {
                ToastService.showError('Ошибка при добавлении пользователя');
                throw error;
            }
        },

        async putUser(user) {
            try {
                const response = await api.putUser(user.id, user);
                if (response) {
                    await this.getUserList();
                    ToastService.showSuccess('Информация о пользователе успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить информацию о пользователе');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении информации о пользователе');
                throw error;
            }
        },

        async deleteUser(user) {
            try {
                const response = await api.deleteUser(user);
                if (response) {
                    await this.getUserList();
                    ToastService.showSuccess('Пользователь успешно удален');
                } else {
                    ToastService.showError('Не удалось удалить пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении пользователя');
                throw error;
            }
        },

        async deauthUser(user) {
            try {
                const response = await api.deauthUser({ id: user });
                if (response) {
                    ToastService.showSuccess('Пользователь успешно деактивирован');
                } else {
                    ToastService.showError('Не удалось деактивировать пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при деактивации пользователя');
                throw error;
            }
        },
    },
});

import api from '@/api/api';
import UserRole from '@/model/admin-group/UserRole'; // Убедитесь, что это правильный путь к модели UserRole
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useUserRoleStore = defineStore('userRole', {
    state: () => ({
        userRoleList: [],
    }),
    getters: {
        userRoleMap(state) {
            return state.userRoleList.reduce((map, userRole) => {
                map[userRole.userroleid] = userRole;
                return map;
            }, {});
        },

    },
    actions: {
        async getUserRoleList() {
            const responseData = await api.getUserRoleList();
            this.userRoleList = responseData.map((userRole) => {
                return new UserRole(userRole);
            });
        },

        async getUserRole(userroleid) {
            const response = await api.getUserRole(userroleid);
            return new UserRole(response);
        },

        async postUserRole(userRole) {
            try {
                const response = await api.postUserRole(userRole);
                if (response && response.success) {
                    ToastService.showSuccess('Роль пользователя успешно добавлена');
                    await this.getUserRoleList();
                } else {
                    ToastService.showError('Не удалось добавить роль пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении роли пользователя');
                throw error;
            }
        },

        async putUserRole(userRole) {
            try {
                const response = await api.putUserRole(userRole.userroleid, userRole);
                if (response.success === true) {
                    const index = this.userRoleList.findIndex(ur => ur.userroleid === userRole.userroleid);
                    if (index !== -1) {
                        this.userRoleList.splice(index, 1, new UserRole(userRole));
                    }
                    ToastService.showSuccess('Роль пользователя успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить роль пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении роли пользователя');
                throw error;
            }
        },

        async deleteUserRoleByUserId(userRole) {
            try {
                const response = await api.deleteUserRole(userRole);
                if (response.success === true) {
                    await this.getUserRoleList();
                    ToastService.showSuccess('Роль пользователя успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить роль пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении роли пользователя');
                throw error;
            }
        },
    },
});

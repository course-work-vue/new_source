import api from '@/api/api';
import UserRole from '@/model/admin-group/UserRole'; // Убедитесь, что это правильный путь к модели UserRole
import { defineStore } from 'pinia';

export const useUserRoleStore = defineStore('userRole', {
    state: () => ({
        userRoleList: [],
    }),
    getters: {
        userRoleMap(state) {
            return state.userRoleList.reduce((map, userRole) => {
                map[userRole.userRoleId] = userRole;
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

        async getUserRole(userRoleId) {
            const response = await api.getUserRole(userRoleId);
            return new UserRole(response);
        },

        async postUserRole(userRole) {
            const response = await api.postUserRole(userRole);

            if (response.success === true) {
                await this.getUserRoleList();
            }
        },

        async putUserRole(userRole) {
            const response = await api.putUserRole(userRole.userRoleId, userRole);
            if (response.success === true) {
                const index = this.userRoleList.findIndex(ur => ur.userRoleId === userRole.userRoleId);
                if (index !== -1) {
                    this.userRoleList.splice(index, 1, new UserRole(userRole));
                }
            }
        },

        async deleteUserRole(userRole) {
            const response = await api.deleteUserRole(userRole);
            if (response.success === true) {
                const index = this.userRoleList.findIndex(ur => ur.userRoleId === userRole.userRoleId);
                if (index !== -1) {
                    this.userRoleList.splice(index, 1); // Удаляем элемент из списка
                }
            }
        },
    },
});

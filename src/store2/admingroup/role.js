import api from '@/api/api';
import Role from '@/model/admin-group/Role'; // Ensure this is the correct path to your Role model
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useRoleStore = defineStore('role', {
    state: () => ({
        roleList: [],
    }),
    getters: {
        roleMap(state) {
            return state.roleList.reduce((map, role) => {
                map[role.roleid] = role;
                return map;
            }, {});
        },
        sortedRoles(state) {
            return state.roleList.sort((a, b) => a.rolename.localeCompare(b.rolename));
        },
    },
    actions: {
        async getRoleList() {
            const responseData = await api.getRoleList();
            this.roleList = responseData.map((role) => {
                return new Role(role);
            });
        },

        async getRole(id) {
            const response = await api.getRole(id);
            return new Role(response);
        },

        async postRole(role) {
            try {
                const response = await api.postRole(role);

                if (response) {
                    await this.getRoleList();
                    ToastService.showSuccess('Роль успешно добавлена');
                } else {
                    ToastService.showError('Не удалось добавить роль');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении роли');
                throw error;
            }
        },

        async putRole(role) {
            try {
                const response = await api.putRole(role.roleid, role);
                if (response.success === true) {
                    const index = this.roleList.findIndex(r => r.roleid === role.roleid);
                    if (index !== -1) {
                        this.roleList.splice(index, 1, new Role(role));
                    }
                    ToastService.showSuccess('Информация о роли успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить информацию о роли');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении информации о роли');
                throw error;
            }
        },

        async deleteRole(role) {
            try {
                const response = await api.deleteRole(role);
                if (response.success === true) {
                    await this.getRoleList();
                    ToastService.showSuccess('Роль успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить роль');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении роли');
                throw error;
            }
        },
    },
});

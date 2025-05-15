import api from '@/api/api';
import GlobalPermission from '@/model/admin-group/GlobalPermission'; // Импорт модели
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useGlobalPermissionStore = defineStore('globalPermission', {
    state: () => ({
        globalPermissionList: [],
    }),
    getters: {
        globalPermissionMap(state) {
            return state.globalPermissionList.reduce((map, permission) => {
                map[permission.roleid] = permission;
                return map;
            }, {});
        },

    },
    actions: {
        async getGlobalPermissionList() {
            const responseData = await api.getGlobalPermissionList();
            this.globalPermissionList = responseData.map((permission) => {
                return new GlobalPermission(permission);
            });
        },

        async getGlobalPermission(permissionId) {
            const response = await api.getGlobalPermission(permissionId);
            return new GlobalPermission(response);
        },

        async postGlobalPermission(permission) {
            try {
                const response = await api.postGlobalPermission(permission);
                if (response.success === true) {
                    await this.getGlobalPermissionList();
                    ToastService.showSuccess('Глобальное разрешение успешно добавлено');
                } else {
                    ToastService.showError('Не удалось добавить глобальное разрешение');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении глобального разрешения');
                throw error;
            }
        },

        async putGlobalPermission(permission) {
            try {
                const response = await api.putGlobalPermission(permission.permissionid, permission);
                if (response.success === true) {
                    const index = this.globalPermissionList.findIndex(p => p.permissionid === permission.permissionid);
                    if (index !== -1) {
                        this.globalPermissionList.splice(index, 1, new GlobalPermission(permission));
                    }
                    ToastService.showSuccess('Глобальное разрешение успешно обновлено');
                } else {
                    ToastService.showError('Не удалось обновить глобальное разрешение');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении глобального разрешения');
                throw error;
            }
        },

        async deleteGlobalPermission(permission) {
            try {
                const response = await api.deleteGlobalPermission(permission);
                if (response.success === true) {
                    const index = this.globalPermissionList.findIndex(p => p.permissionid === permission.permissionid);
                    if (index !== -1) {
                        this.globalPermissionList.splice(index, 1);  // Удалить элемент из списка
                    }
                    ToastService.showSuccess('Глобальное разрешение успешно удалено');
                } else {
                    ToastService.showError('Не удалось удалить глобальное разрешение');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении глобального разрешения');
                throw error;
            }
        },
    },
});

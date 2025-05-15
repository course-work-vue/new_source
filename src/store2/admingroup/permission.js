import api from '@/api/api';
import Permission from '@/model/admin-group/Permission'; // Импорт модели
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const usePermissionStore = defineStore('permission', {
    state: () => ({
        permissionList: [],
    }),
    getters: {


    },
    actions: {
        async getPermissionList() {
            const responseData = await api.getPermissionList();
            this.permissionList = responseData.map((permission) => {
                return new Permission(permission);
            });
        },

        async getPermission(permissionId) {
            const response = await api.getPermission(permissionId);
            return new Permission(response);
        },

        async postPermission(permission) {
            try {
                const response = await api.postPermission(permission);
                if (response) {
                    await this.getPermissionList();
                    ToastService.showSuccess('Разрешение успешно добавлено');
                } else {
                    ToastService.showError('Не удалось добавить разрешение');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении разрешения');
                throw error;
            }
        },

        async putPermission(permission) {
            try {
                const response = await api.putPermission(permission.permissionid, permission);
                if (response.success === true) {
                    const index = this.permissionList.findIndex(p => p.permissionid === permission.permissionid);
                    if (index !== -1) {
                        this.permissionList.splice(index, 1, new Permission(permission));
                    }
                    ToastService.showSuccess('Разрешение успешно обновлено');
                } else {
                    ToastService.showError('Не удалось обновить разрешение');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении разрешения');
                throw error;
            }
        },

        async deletePermission(permission) {
            try {
                const response = await api.deletePermission(permission);
                if (response) {
                    await this.getPermissionList();
                    ToastService.showSuccess('Разрешение успешно удалено');
                } else {
                    ToastService.showError('Не удалось удалить разрешение');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении разрешения');
                throw error;
            }
        },
    },
});

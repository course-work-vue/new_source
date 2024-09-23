import api from '@/api/api';
import Permission from '@/model/admin-group/Permission'; // Импорт модели
import { defineStore } from 'pinia';

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
            const response = await api.postPermission(permission);
            if (response) {
                await this.getPermissionList();
            }
        },

        async putPermission(permission) {
            const response = await api.putPermission(permission.permissionid, permission);
            if (response.success === true) {
                const index = this.permissionList.findIndex(p => p.permissionid === permission.permissionid);
                if (index !== -1) {
                    this.permissionList.splice(index, 1, new Permission(permission));
                }
            }
        },

        async deletePermission(permission) {
            const response = await api.deletePermission(permission);
            if (response) {
                await this.getPermissionList();
            }
        },
    },
});

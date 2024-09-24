import api from '@/api/api';
import GlobalPermission from '@/model/admin-group/GlobalPermission'; // Импорт модели
import { defineStore } from 'pinia';

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
            const response = await api.postGlobalPermission(permission);
            if (response.success === true) {
                await this.getGlobalPermissionList();
            }
        },

        async putGlobalPermission(permission) {
            const response = await api.putGlobalPermission(permission.permissionid, permission);
            if (response.success === true) {
                const index = this.globalPermissionList.findIndex(p => p.permissionid === permission.permissionid);
                if (index !== -1) {
                    this.globalPermissionList.splice(index, 1, new GlobalPermission(permission));
                }
            }
        },

        async deleteGlobalPermission(permission) {
            const response = await api.deleteGlobalPermission(permission);
            if (response.success === true) {
                const index = this.globalPermissionList.findIndex(p => p.permissionid === permissionId);
                if (index !== -1) {
                    this.globalPermissionList.splice(index, 1);  // Удалить элемент из списка
                }
            }
        },
    },
});

import api from '@/api/api';
import Role from '@/model/admin-group/Role'; // Ensure this is the correct path to your Role model
import { defineStore } from 'pinia';

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
            const response = await api.postRole(role);

            if (response) {
                await this.getRoleList();
            }
            return response;
        },

        async putRole(role) {
            const response = await api.putRole(role.roleid, role);
            if (response.success === true) {
                const index = this.roleList.findIndex(r => r.roleid === role.roleid);
                if (index !== -1) {
                    this.roleList.splice(index, 1, new Role(role));
                }
            }
        },

        async deleteRole(role) {
            const response = await api.deleteRole(role);
            if (response.success === true) {
                if (response.success === true) {
                    await this.getRoleList();
                }
            }
        },



    },
});

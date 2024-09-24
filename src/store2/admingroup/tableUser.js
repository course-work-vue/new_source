import api from '@/api/api';
import TableUser from '@/model/admin-group/TableUser'; // Убедитесь, что это правильный путь к модели TableUser
import { defineStore } from 'pinia';

export const useTableUserStore = defineStore('tableUser', {
    state: () => ({
        tableUserList: [],
    }),
    getters: {
        tableUserMap(state) {
            return state.tableUserList.reduce((map, tableUser) => {
                map[tableUser.id] = tableUser;
                return map;
            }, {});
        },
        sortedTableUsers(state) {
            return state.tableUserList.sort((a, b) => a.tableName.localeCompare(b.tableName));
        },

    },
    actions: {
        async getTableUserList() {
            const responseData = await api.getTableUserList();
            this.tableUserList = responseData.map((tableUser) => {
                return new TableUser(tableUser);
            });
        },

        async getTableUser(id) {
            const response = await api.getTableUser(id);
            return new TableUser(response);
        },

        async postTableUser(tableUser) {
            const response = await api.postTableUser(tableUser);

            if (response) {
                await this.getTableUserList();
            }
        },

        async putTableUser(tableUser) {
            const response = await api.putTableUser(tableUser.id, tableUser);
            if (response) {

                await this.getTableUserList();
            }
        },

        async deleteTableUser(tableUser) {
            const response = await api.deleteTableUser(tableUser);
            if (response.success === true) {
                await this.getTableUserList();
            }
        },
    },
});

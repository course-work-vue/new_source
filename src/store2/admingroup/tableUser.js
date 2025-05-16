import api from '@/api/api';
import TableUser from '@/model/admin-group/TableUser'; // Убедитесь, что это правильный путь к модели TableUser
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

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
            try {
                const response = await api.postTableUser(tableUser);

                if (response) {
                    await this.getTableUserList();
                    ToastService.showSuccess('Таблица пользователя успешно добавлена');
                } else {
                    ToastService.showError('Не удалось добавить таблицу пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении таблицы пользователя');
                throw error;
            }
        },

        async putTableUser(tableUser) {
            try {
                const response = await api.putTableUser(tableUser.id, tableUser);
                if (response) {
                    await this.getTableUserList();
                    ToastService.showSuccess('Таблица пользователя успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить таблицу пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении таблицы пользователя');
                throw error;
            }
        },

        async deleteTableUser(tableUser) {
            try {
                const response = await api.deleteTableUser(tableUser);
                if (response.success === true) {
                    await this.getTableUserList();
                    ToastService.showSuccess('Таблица пользователя успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить таблицу пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении таблицы пользователя');
                throw error;
            }
        },
    },
});

import api from '@/api/api';
import FunctionUser from '@/model/admin-group/FunctionUser'; // Убедитесь, что это правильный путь к модели FunctionUser
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useFunctionUserStore = defineStore('functionUser', {
    state: () => ({
        functionUserList: [],
    }),
    getters: {
        functionUserMap(state) {
            return state.functionUserList.reduce((map, functionUser) => {
                map[functionUser.id] = functionUser;
                return map;
            }, {});
        },

        getFunctionsByUserId: (state) => (userid) => {
            return state.functionUserList.filter(functionUser => functionUser.userid === userid);
        },
    },
    actions: {
        async getFunctionUserList() {
            const responseData = await api.getFunctionUserList();
            this.functionUserList = responseData.map((functionUser) => {
                return new FunctionUser(functionUser);
            });
        },

        async getFunctionUser(id) {
            const response = await api.getFunctionUser(id);
            return new FunctionUser(response);
        },

        async postFunctionUser(functionUser) {
            try {
                const response = await api.postFunctionUser(functionUser);

                if (response) {
                    await this.getFunctionUserList();
                    ToastService.showSuccess('Функция пользователя успешно добавлена');
                } else {
                    ToastService.showError('Не удалось добавить функцию пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении функции пользователя');
                throw error;
            }
        },

        async putFunctionUser(functionUser) {
            try {
                const response = await api.putFunctionUser(functionUser.id, functionUser);
                if (response) {
                    await this.getFunctionUserList();
                    ToastService.showSuccess('Функция пользователя успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить функцию пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении функции пользователя');
                throw error;
            }
        },

        async deleteFunctionUser(functionUser) {
            try {
                const response = await api.deleteFunctionUser(functionUser);
                if (response.success === true) {


                    await this.getFunctionUserList();
                    ToastService.showSuccess('Функция пользователя успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить функцию пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении функции пользователя');
                throw error;
            }
        },
    },
});

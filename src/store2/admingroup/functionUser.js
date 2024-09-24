import api from '@/api/api';
import FunctionUser from '@/model/admin-group/FunctionUser'; // Убедитесь, что это правильный путь к модели FunctionUser
import { defineStore } from 'pinia';

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
            const response = await api.postFunctionUser(functionUser);

            if (response) {
                await this.getFunctionUserList();
            }
        },

        async putFunctionUser(functionUser) {
            const response = await api.putFunctionUser(functionUser.id, functionUser);
            if (response) {
                await this.getFunctionUserList();
            }
        },

        async deleteFunctionUser(functionUser) {
            const response = await api.deleteFunctionUser(functionUser);
            if (response.success === true) {
                const index = this.functionUserList.findIndex(fu => fu.id === functionUser.id);
                if (index !== -1) {
                    this.functionUserList.splice(index, 1); // Удаляем запись
                }
            }
        },
    },
});

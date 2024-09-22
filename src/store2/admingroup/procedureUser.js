import api from '@/api/api';
import ProcedureUser from '@/model/admin-group/ProcedureUser'; // Убедитесь, что это правильный путь к модели ProcedureUser
import { defineStore } from 'pinia';

export const useProcedureUserStore = defineStore('procedureUser', {
    state: () => ({
        procedureUserList: [],
    }),
    getters: {
        procedureUserMap(state) {
            return state.procedureUserList.reduce((map, procedureUser) => {
                map[procedureUser.id] = procedureUser;
                return map;
            }, {});
        },
        sortedProcedureUsers(state) {
            return state.procedureUserList.sort((a, b) => a.procedureName.localeCompare(b.procedureName));
        },

    },
    actions: {
        async getProcedureUserList() {
            const responseData = await api.getProcedureUserList();
            this.procedureUserList = responseData.map((procedureUser) => {
                return new ProcedureUser(procedureUser);
            });
        },

        async getProcedureUser(id) {
            const response = await api.getProcedureUser(id);
            return new ProcedureUser(response);
        },

        async postProcedureUser(procedureUser) {
            const response = await api.postProcedureUser(procedureUser);

            if (response) {
                await this.getProcedureUserList();
            }
        },

        async putProcedureUser(procedureUser) {
            const response = await api.putProcedureUser(procedureUser.id, procedureUser);
            if (response) {

                await this.getProcedureUserList();
            }
        },

        async deleteProcedureUser(procedureUser) {
            const response = await api.deleteProcedureUser(procedureUser);
            if (response.success === true) {
                await this.getProcedureUserList();
            }
        },
    },
});

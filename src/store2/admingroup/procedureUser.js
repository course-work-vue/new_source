import api from '@/api/api';
import ProcedureUser from '@/model/admin-group/ProcedureUser'; // Убедитесь, что это правильный путь к модели ProcedureUser
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

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
            try {
                const response = await api.postProcedureUser(procedureUser);

                if (response) {
                    await this.getProcedureUserList();
                    ToastService.showSuccess('Процедура пользователя успешно добавлена');
                } else {
                    ToastService.showError('Не удалось добавить процедуру пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении процедуры пользователя');
                throw error;
            }
        },

        async putProcedureUser(procedureUser) {
            try {
                const response = await api.putProcedureUser(procedureUser.id, procedureUser);
                if (response) {
                    await this.getProcedureUserList();
                    ToastService.showSuccess('Процедура пользователя успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить процедуру пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении процедуры пользователя');
                throw error;
            }
        },

        async deleteProcedureUser(procedureUser) {
            try {
                const response = await api.deleteProcedureUser(procedureUser);
                if (response.success === true) {
                    await this.getProcedureUserList();
                    ToastService.showSuccess('Процедура пользователя успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить процедуру пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении процедуры пользователя');
                throw error;
            }
        },
    },
});

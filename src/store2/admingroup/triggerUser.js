import api from '@/api/api';
import TriggerUser from '@/model/admin-group/TriggerUser'; // Убедитесь, что это правильный путь к модели TriggerUser
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useTriggerUserStore = defineStore('triggerUser', {
    state: () => ({
        triggerUserList: [],
    }),
    getters: {
        triggerUserMap(state) {
            return state.triggerUserList.reduce((map, triggerUser) => {
                map[triggerUser.id] = triggerUser;
                return map;
            }, {});
        },
        sortedTriggerUsers(state) {
            return state.triggerUserList.sort((a, b) => a.triggerName.localeCompare(b.triggerName));
        },

    },
    actions: {
        async getTriggerUserList() {
            const responseData = await api.getTriggerUserList();
            this.triggerUserList = responseData.map((triggerUser) => {
                return new TriggerUser(triggerUser);
            });
        },

        async getTriggerUser(id) {
            const response = await api.getTriggerUser(id);
            return new TriggerUser(response);
        },

        async postTriggerUser(triggerUser) {
            try {
                const response = await api.postTriggerUser(triggerUser);

                if (response) {
                    await this.getTriggerUserList();
                    ToastService.showSuccess('Триггер пользователя успешно добавлен');
                } else {
                    ToastService.showError('Не удалось добавить триггер пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении триггера пользователя');
                throw error;
            }
        },

        async putTriggerUser(triggerUser) {
            try {
                const response = await api.putTriggerUser(triggerUser.id, triggerUser);
                if (response) {
                    await this.getTriggerUserList();
                    ToastService.showSuccess('Триггер пользователя успешно обновлен');
                } else {
                    ToastService.showError('Не удалось обновить триггер пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении триггера пользователя');
                throw error;
            }
        },

        async deleteTriggerUser(triggerUser) {
            try {
                const response = await api.deleteTriggerUser(triggerUser);
                if (response.success === true) {
                    await this.getTriggerUserList();
                    ToastService.showSuccess('Триггер пользователя успешно удален');
                } else {
                    ToastService.showError('Не удалось удалить триггер пользователя');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении триггера пользователя');
                throw error;
            }
        },
    },
});

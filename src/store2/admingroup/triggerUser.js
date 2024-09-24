import api from '@/api/api';
import TriggerUser from '@/model/admin-group/TriggerUser'; // Убедитесь, что это правильный путь к модели TriggerUser
import { defineStore } from 'pinia';

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
            const response = await api.postTriggerUser(triggerUser);

            if (response) {
                await this.getTriggerUserList();
            }
        },

        async putTriggerUser(triggerUser) {
            const response = await api.putTriggerUser(triggerUser.id, triggerUser);
            if (response) {

                await this.getTriggerUserList();
            }
        },

        async deleteTriggerUser(triggerUser) {
            const response = await api.deleteTriggerUser(triggerUser);
            if (response.success === true) {
                await this.getTriggerUserList();
            }
        },
    },
});

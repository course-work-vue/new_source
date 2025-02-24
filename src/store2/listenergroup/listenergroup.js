import api from '@/api/api';
import Listenergroup from '@/model/listener-group/Listenergroup';
import { defineStore } from 'pinia';

export const useListenergroupStore = defineStore('listenergroup', {
    state: () => ({
        listenergroupList: [],
    }),
    getters: {
        listenergroupMap(state) {
            return state.listenergroupList.reduce((map, listenergroup) => {
                map[listenergroup.id] = listenergroup;
                return map;
            }, {});
        },
    },
    actions: {
        async getListenergroupList() {
            const responseData = await api.getListenergroupList();
            this.listenergroupList = responseData.map((listenergroup) => {
                return new Listenergroup(listenergroup);
            });
        },

        async getListenergroup(code) {
            await api.getListenergroup(code);
        },

        async postListenergroup(listenergroup) {
            
            const response = await api.postListenergroup(listenergroup);
            console.log(response)
            if (response.success === true) {

                await this.getListenergroupList();
            }
        },

        async putListenergroup(listenergroup) {
            const response = await api.putListenergroup(listenergroup.id, listenergroup);
            console.log(response)
            if (response.success === true) {
                const index = this.listenergroupList.findIndex(s => s.id === listenergroup.id);
                if (index !== -1) {
                    this.listenergroupList.splice(index, 1, new Listenergroup(listenergroup));
                }
            }
        },

        async deleteListenergroup(listenergroup) {
            const response = await api.deleteListenergroup(listenergroup);
            if (response.success === true) {
                const index = this.listenergroupList.findIndex(s => s.id === listenergroup.id);
                if (index !== -1) {
                    this.listenergroupList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

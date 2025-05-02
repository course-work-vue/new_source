import api from '@/api/api';
import Listener from '@/model/listener-group/Listener';
import { defineStore } from 'pinia';

export const useListenerStore = defineStore('listener', {
    state: () => ({
        listenerList: [],
        ready_listenerList: [],
    }),
    getters: {
        listenerMap(state) {
            return state.listenerList.reduce((map, listener) => {
                map[listener.id] = listener;
                return map;
            }, {});
        },
    },
    actions: {
        async getListenerList() {
            const responseData = await api.getListenerList();
            this.listenerList = responseData.map((listener) => {
                return new Listener(listener);
            });
        },

        async getReady_ListenerList() {
            const responseData = await api.getReady_ListenerList();
            //console.log(responseData);
            this.ready_listenerList = responseData.map((ready_listener) => {
                return new Listener(ready_listener);
            });
        },

        async getListener(code) {
            await api.getListener(code);
        },

        async postListener(listener) {

            const response = await api.postListener(listener);
            console.log(response)
            if (response.success === true) {

                await this.getListenerList();
            }
        },

        async putListener(listener) {
            const response = await api.putListener(listener.id, listener);
            console.log(response)
            if (response.success === true) {
                const index = this.listenerList.findIndex(s => s.id === listener.id);
                if (index !== -1) {
                    this.listenerList.splice(index, 1, new Listener(listener));
                }
            }
        },

        async deleteListener(listener) {
            const response = await api.deleteListener(listener);
            if (response.success === true) {
                const index = this.listenerList.findIndex(s => s.id === listener.id);
                if (index !== -1) {
                    this.listenerList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

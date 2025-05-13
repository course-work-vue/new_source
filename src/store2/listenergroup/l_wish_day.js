import api from '@/api/api';
import L_Wish_Day from '@/model/listener-group/L_Wish_Day';
import { defineStore } from 'pinia';

export const useL_Wish_DayStore = defineStore('l_wish_day', {
    state: () => ({
        l_wish_dayList: [],
    }),
    getters: {
        l_wish_dayMap(state) {
            return state.l_wish_dayList.reduce((map, l_wish_day) => {
                map[l_wish_day.id] = l_wish_day;
                return map;
            }, {});
        },
    },
    actions: {
        async getL_Wish_DayList() {
            const responseData = await api.getL_Wish_DayList();
            console.log(responseData);
            this.l_wish_dayList = responseData.map((l_wish_day) => {
                return new L_Wish_Day(l_wish_day);
            });
        },

        async getL_Wish_Day(code) {
            await api.getL_Wish_Day(code);
        },

        async postL_Wish_Day(l_wish_day) {
            const response = await api.postL_Wish_Day(l_wish_day);
            if (response.success === true) {

                await this.getL_Wish_DayList();
            }
        },

        async putListener_Wish(listener_wish) {
            const response = await api.putListener_Wish(listener_wish.id, listener_wish);
            if (response.success === true) {
                const index = this.listener_wishList.findIndex(s => s.id === listener_wish.id);
                if (index !== -1) {
                    this.listener_wishList.splice(index, 1, new Listener_Wish(listener_wish));
                }
            }
        },

        async syncWishDays(listenerId, current) {

            const existing = this.l_wish_dayList.filter(d => d.listener_id === listenerId && !d.deleted_at);

            const toCreate = current.filter(d => !d.l_wish_day_id);
            const toUpdate = current.filter(d => d.l_wish_day_id);
            const toDelete = existing.filter(e => !current.find(d => d.l_wish_day_id === e.l_wish_day_id));
          
            for (const day of toCreate) {
              await this.postL_Wish_Day(day);
            }
            for (const day of toUpdate) {
              //await this.putL_Wish_Day(day);
            }
            for (const day of toDelete) {
              await this.deleteL_Wish_Day(day);
            }
        
          },

        async deleteL_Wish_Day(l_wish_day) {
            const response = await api.deleteL_Wish_Day(l_wish_day);
            console.log(response);
            if (response.success === true) {
                const index = this.l_wish_dayList.findIndex(s => s.id === l_wish_day.id);
                if (index !== -1) {
                    this.l_wish_dayList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

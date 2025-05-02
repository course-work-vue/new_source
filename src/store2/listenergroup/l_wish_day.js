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
            console.log(response)
            if (response.success === true) {

                await this.getL_Wish_DayList();
            }
        },

        async putL_Wish_Day(l_wish_day) {
            const response = await api.putL_Wish_Day(l_wish_day.id, l_wish_day);
            console.log(response)
            if (response.success === true) {
                const index = this.l_wish_dayList.findIndex(s => s.id === l_wish_day.id);
                if (index !== -1) {
                    this.l_wish_dayList.splice(index, 1, new L_Wish_Day(l_wish_day));
                }
            }
        },

        async deleteL_Wish_Day(l_wish_day) {
            const response = await api.deleteL_Wish_Day(l_wish_day);
            if (response.success === true) {
                const index = this.l_wish_dayList.findIndex(s => s.id === l_wish_day.id);
                if (index !== -1) {
                    this.l_wish_dayList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

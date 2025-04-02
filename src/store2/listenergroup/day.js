import api from '@/api/api';
import Day from '@/model/listener-group/Day';
import { defineStore } from 'pinia';

export const useDayStore = defineStore('day', {
    state: () => ({
        dayList: [],
    }),
    getters: {
        dayMap(state) {
            return state.dayList.reduce((map, day) => {
                map[day.id] = day;
                return map;
            }, {});
        },
    },
    actions: {
        async getDayList() {
            const responseData = await api.getDayList();
            this.dayList = responseData.map((day) => {
                return new Day(day);
            });
        },

        async getDay(code) {
            await api.getDay(code);
        },
    },
});

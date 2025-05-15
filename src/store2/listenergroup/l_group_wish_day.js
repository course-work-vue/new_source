import api from '@/api/api';
import L_Group_Wish_Day from '@/model/listener-group/L_Group_Wish_Day';
import { defineStore } from 'pinia';

export const useL_Group_Wish_DayStore = defineStore('l_group_wish_day', {
  state: () => ({
    l_group_wish_dayList: [],
  }),
  getters: {
    l_group_wish_dayMap(state) {
      return state.l_group_wish_dayList.reduce((map, item) => {
        map[item.id] = item;
        return map;
      }, {});
    },
  },
  actions: {
    async getL_Group_Wish_DayList() {
      const responseData = await api.getL_Group_Wish_DayList();
      this.l_group_wish_dayList = responseData.map((item) => {
        return new L_Group_Wish_Day(item);
      });
    },

    async getL_Group_Wish_Day(code) {
      await api.getL_Group_Wish_Day(code);
    },

    async postL_Group_Wish_Day(item) {
      const response = await api.postL_Group_Wish_Day(item);
      if (response.success === true) {
        await this.getL_Group_Wish_DayList();
      }
    },

    async putL_Group_Wish_Day(item) {
      const response = await api.putL_Group_Wish_Day(item.id, item);
      console.log(response);
      if (response.success === true) {
        const index = this.l_group_wish_dayList.findIndex(s => s.id === item.id);
        if (index !== -1) {
          this.l_group_wish_dayList[index].deleted_at = new Date().toISOString();
        }
      }
    },

    async deleteL_Group_Wish_Day(item) {
      const response = await api.deleteL_Group_Wish_Day(item);
      console.log(response);
      if (response.success === true) {
        const index = this.l_group_wish_dayList.findIndex(s => s.id === item.id);
        if (index !== -1) {
          this.l_group_wish_dayList[index].deleted_at = new Date().toISOString();
        }
      }
    },

    async syncGroupWishDays(groupId, current) {
      const existing = this.l_group_wish_dayList.filter(d => d.l_group_id === groupId && !d.deleted_at);

      const toCreate = current.filter(d => !d.l_group_wish_day_id);
      const toUpdate = current.filter(d => d.l_group_wish_day_id);
      const toDelete = existing.filter(e => !current.find(d => d.l_group_wish_day_id === e.l_group_wish_day_id));

      for (const day of toCreate) {
        await this.postL_Group_Wish_Day(day);
      }
      for (const day of toUpdate) {
        console.log("Найдено для обновления");
        await this.putL_Group_Wish_Day(day);
      }
      for (const day of toDelete) {
        await this.deleteL_Group_Wish_Day(day);
      }
    },
  },
});

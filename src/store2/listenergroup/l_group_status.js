import api from '@/api/api';
import L_Group_Status from '@/model/listener-group/L_Group_Status';
import { defineStore } from 'pinia';

export const useL_Group_StatusStore = defineStore('l_group_status', {
    state: () => ({
        l_group_statusList: [],
    }),
    getters: {
        l_group_statusMap(state) {
            return state.l_group_statusList.reduce((map, l_group_status) => {
                map[l_group_status.id] = l_group_status;
                return map;
            }, {});
        },
    },
    actions: {
        async getL_Group_StatusList() {
            const responseData = await api.getL_Group_StatusList();
            this.l_group_statusList = responseData.map((l_group_status) => {
                return new L_Group_Status(l_group_status);
            });
        },

        async getL_Group_Status(code) {
            await api.getL_Group_Status(code);
        },
    },
});

import api from '@/api/api';
import L_Ready_Group from '@/model/listener-group/L_Ready_Group';
import { defineStore } from 'pinia';

export const useL_Ready_GroupStore = defineStore('l_ready_group', {
    state: () => ({
        l_ready_groupList: [],
    }),
    getters: {
        l_ready_groupMap(state) {
            return state.l_ready_groupList.reduce((map, l_ready_group) => {
                map[l_ready_group.id] = l_ready_group;
                return map;
            }, {});
        },
    },
    actions: {
        async getL_Ready_GroupList() {
            const responseData = await api.getL_Ready_GroupList();
            this.l_ready_groupList = responseData.map((l_ready_group) => {
                return new L_Ready_Group(l_ready_group);
            });
        },

        async getL_Ready_Group(code) {
            await api.getL_Ready_Group(code);
        },
    },
});

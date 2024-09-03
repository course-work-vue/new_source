import api from '@/api/api';
import Group from '@/model/student-group/Group'; // Путь к модели Group
import { defineStore } from 'pinia';

export const useGroupStore = defineStore('group', {
    state: () => ({
        groupList: [],
    }),
    getters: {
        groupMap(state) {
            return state.groupList.reduce((map, group) => {
                map[group.group_id] = group;
                return map;
            }, {});
        },
    },
    actions: {
        async getGroupList() {
            const responseData = await api.getGroupList();
            this.groupList = responseData.map((group) => {
                return new Group(group);
            });
        },

        async getGroup(group_id) {
            const groupData = await api.getGroup(group_id);
            return new Group(groupData);
        },

        async postGroup(group) {
            const response = await api.postGroup(group);

            if (response.success === true) {
                await this.getGroupList();
            }
        },

        async putGroup(group) {
            const response = await api.putGroup(group.group_id, group);
            if (response.success === true) {
                const index = this.groupList.findIndex(g => g.group_id === group.group_id);
                if (index !== -1) {
                    this.groupList.splice(index, 1, new Group(group));
                }
            }
        },

        async deleteGroup(group) {
            const response = await api.deleteGroup(group);
            if (response.success === true) {
                const index = this.groupList.findIndex(g => g.group_id === group.group_id);
                if (index !== -1) {
                    this.groupList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

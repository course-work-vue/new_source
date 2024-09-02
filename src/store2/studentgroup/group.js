import api from '@/api/api'; // Assuming API methods for groups are defined here
import Group from '@/model/student-group/Group'; // Import the Group model
import { defineStore } from 'pinia';

export const useGroupStore = defineStore('group', {
    state: () => ({
        groupList: [], // Holds the list of groups
    }),
    getters: {
        groupMap(state) {
            return state.groupList.reduce((map, group) => {
                map[group.group_id] = group; // Using group_id as the key for the map
                return map;
            }, {});
        },
    },
    actions: {
        async getGroupList() {
            const responseData = await api.getGroupList(); // Assuming this method fetches the list of groups
            this.groupList = responseData.map((group) => {
                return new Group(group); // Create new Group instances
            });
        },

        async getGroup(groupId) {
            const groupData = await api.getGroup(groupId); // Fetch a single group by ID
            return new Group(groupData); // Return as a Group instance
        },

        async postGroup(group) {
            await api.postGroup(group); // Send a new group to the server
        },

        async putGroup(group) {
            await api.putGroup(group.group_id, group); // Update an existing group by ID
        },

        async deleteGroup(groupId) {
            await api.deleteGroup(groupId); // Delete a group by ID
        },
    },
});

import api from '@/api/api';
import User from '@/model/admin-group/User'; // Ensure this is the correct path to your User model
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        userList: [],
    }),
    getters: {
        userMap(state) {
            return state.userList.reduce((map, user) => {
                map[user.id] = user;
                return map;
            }, {});
        },
        activeSortedUsers(state) {
            return state.userList.sort((a, b) => a.username.localeCompare(b.username));
        },
    },
    actions: {
        async getUserList() {
            const responseData = await api.getUserList();
            this.userList = responseData.map((user) => {
                return new User(user);
            });
        },

        async getUser(id) {
            const response = await api.getUser(id);
            return new User(response);
        },

        async postUser(user) {
            const response = await api.postUser(user);

            if (response) {
                await this.getUserList();
            }
        },

        async putUser(user) {
            const response = await api.putUser(user.id, user);
            if (response) {
                await this.getUserList();
            }
        },

        async deleteUser(user) {
            const response = await api.deleteUser(user);
            if (response) {
                await this.getUserList();
            }
        },


    },
});

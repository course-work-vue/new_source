import api from '@/api/api';
import Listener_Wish from '@/model/listener-group/Listener_Wish';
import { defineStore } from 'pinia';

export const useListener_WishStore = defineStore('listener_wish', {
    state: () => ({
        listener_wishList: [],
    }),
    getters: {
        listener_wishMap(state) {
            return state.listener_wishList.reduce((map, listener_wish) => {
                map[listener_wish.id] = listener_wish;
                return map;
            }, {});
        },
    },
    actions: {
        async getListener_WishList() {
            const responseData = await api.getListener_WishList();
            this.listener_wishList = responseData.map((listener_wish) => {
                return new Listener_Wish(listener_wish);
            });
        },

        async getListener_Wish(code) {
            await api.getListener_Wish(code);
        },

        async postListener_Wish(listener_wish) {

            const response = await api.postListener_Wish(listener_wish);
            console.log(response)
            if (response.success === true) {

                await this.getListener_WishList();
            }
        },

        async putListener_Wish(listener_wish) {
            const response = await api.putListener_Wish(listener_wish.id, listener_wish);
            console.log(response)
            if (response.success === true) {
                const index = this.listener_wishList.findIndex(s => s.id === listener_wish.id);
                if (index !== -1) {
                    this.listener_wishList.splice(index, 1, new Listener_Wish(listener_wish));
                }
            }
        },

        async deleteListener_Wish(listener_wish) {
            const response = await api.deleteListener_Wish(listener_wish);
            if (response.success === true) {
                const index = this.listener_wishList.findIndex(s => s.id === listener_wish.id);
                if (index !== -1) {
                    this.listener_wishList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

import api from '@/api/api';
import Payer from '@/model/listener-group/Payer';
import { defineStore } from 'pinia';

export const usePayerStore = defineStore('payer', {
    state: () => ({
        payerList: [],
    }),
    getters: {
        payerMap(state) {
            return state.payerList.reduce((map, payer) => {
                map[payer.id] = payer;
                return map;
            }, {});
        },
    },
    actions: {
        async getPayerList() {
            const responseData = await api.getPayerList();
            this.payerList = responseData.map((payer) => {
                return new Payer(payer);
            });
        },

        async getPayer(code) {
            await api.getPayer(code);
        },

        async postPayer(payer) {
            const response = await api.postPayer(payer);
            console.log(response);

            if (response.success === true) {

                await this.getPayerList();
            }
        },

        async putPayer(payer) {
            const response = await api.putPayer(payer.id, payer);
            if (response.success === true) {
                const index = this.payerList.findIndex(s => s.id === payer.id);
                if (index !== -1) {
                    this.payerList.splice(index, 1, new Payer(payer));
                }
            }
        },

        async deletePayer(payer) {
            const response = await api.deletePayer(payer);
            if (response.success === true) {
                const index = this.payerList.findIndex(s => s.id === payer.id);
                if (index !== -1) {
                    this.payerList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

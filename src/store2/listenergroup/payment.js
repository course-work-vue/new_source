import api from '@/api/api';
import Payment from '@/model/listener-group/Payment';
import { defineStore } from 'pinia';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        paymentList: [],
    }),
    getters: {
        paymentMap(state) {
            return state.paymentList.reduce((map, payment) => {
                map[payment.id] = payment;
                return map;
            }, {});
        },
    },
    actions: {
        async getPaymentList() {
            console.log("Я в платежах")
            const responseData = await api.getPaymentList();
            this.paymentList = responseData.map((payment) => {
                return new Payment(payment);
            });
        },

        async getPayment(code) {
            await api.getPayment(code);
        },

        async postPayment(payment) {
            const response = await api.postPayment(payment);

            if (response.success === true) {

                await this.getPaymentList();
            }
        },

        async putPayment(payment) {
            const response = await api.putPayment(payment.id, payment);
            if (response.success === true) {
                const index = this.paymentList.findIndex(s => s.id === payment.id);
                if (index !== -1) {
                    this.paymentList.splice(index, 1, new Payment(payment));
                }
            }
        },

        async deletePayment(payment) {
            const response = await api.deletePayment(payment);
            if (response.success === true) {
                const index = this.paymentList.findIndex(s => s.id === payment.id);
                if (index !== -1) {
                    this.paymentList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

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
        try { 
            const responseData = await api.getPaymentList();

            if (Array.isArray(responseData)) {
                this.paymentList = responseData.map((payment) => {
                    return new Payment(payment);
                });
            } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
                this.paymentList = responseData.data.map((payment) => {
                    return new Payment(payment);
                });
            } else if (responseData && typeof responseData === 'object' && responseData !== null) {
                console.warn('api.getPaymentList() returned a single object. Wrapping it in an array.');
                this.paymentList = [new Payment(responseData)];
            }
            else {
                console.error('api.getPaymentList() did not return an array or a recognized object structure. Setting paymentList to empty array.');
                this.paymentList = []; 
            }
        } catch (error) {
            console.error('Error in getPaymentList action:', error);
            this.paymentList = []; 
        }
    },

        async getPayment(code) {
            await api.getPayment(code);
        },

        async postPayment(payment) {
            const response = await api.postPayment(payment);
            console.log(response);
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

import api from '@/api/api';
import Contract from '@/model/listener-group/Contract';
import { defineStore } from 'pinia';

export const useContractStore = defineStore('contract', {
    state: () => ({
        contractList: [],
    }),
    getters: {
        contractMap(state) {
            return state.contractList.reduce((map, contract) => {
                map[contract.id] = contract;
                return map;
            }, {});
        },
    },
    actions: {
        async getContractList() {
            console.log("Я в договорах")
            const responseData = await api.getContractList();
            this.contractList = responseData.map((contract) => {
                return new Contract(contract);
            });
        },

        async getContract(code) {
            await api.getContract(code);
        },

        async postContract(contract) {
            const response = await api.postContract(contract);

            if (response.success === true) {

                await this.getContractList();
            }
        },

        async putContract(contract) {
            const response = await api.putContract(contract.id, contract);
            if (response.success === true) {
                const index = this.contractList.findIndex(s => s.id === contract.id);
                if (index !== -1) {
                    this.contractList.splice(index, 1, new Contract(contract));
                }
            }
        },

        async deleteContract(contract) {
            const response = await api.deleteContract(contract);
            if (response.success === true) {
                const index = this.contractList.findIndex(s => s.id === contract.id);
                if (index !== -1) {
                    this.contractList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

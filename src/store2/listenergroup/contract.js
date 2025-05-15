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
            console.log(response);
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

        async uploadStudentFile(file) {
            try {
                const response = await api.uploadFile(file);
                if (response.success) {
                    console.log('File uploaded successfully');
                } else {
                    console.error('File upload failed');
                }
   
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        },
        
        async uploadGeneratedFile(fileBlob, fileName) {
            try {
                const formData = new FormData();
                formData.append('file', fileBlob, fileName); 

                const response = await api.uploadFile(formData); 
                return response.fileName;
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    },
});

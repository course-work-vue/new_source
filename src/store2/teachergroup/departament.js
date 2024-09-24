import api from '@/api/api';
import Departament from '@/model/teacher-group/Departament';
import { defineStore } from 'pinia';

export const useDepartamentStore = defineStore('departament', {
    state: () => ({
        departamentList: [],
    }),
    getters: {
        departamentMap(state) {
            return state.departamentList.reduce((map, departament) => {
                map[departament.dep_id] = departament;
                return map;
            }, {});
        },
    },
    actions: {
        async getDepartamentList() {
            const responseData = await api.getDepartamentList();
            this.departamentList = responseData.map((departament) => {
                return new Departament(departament);
            });
        },

        async getDepartament(dep_id) {
            await api.getDepartament(dep_id);
        },

        async postDepartament(departament) {
            const response = await api.postDepartament(departament);

            if (response.success === true) {
                await this.getDepartamentList();
            }
        },

        async putDepartament(departament) {
            const response = await api.putDepartament(departament.dep_id, departament);
            if (response.success === true) {
                const index = this.departamentList.findIndex(d => d.dep_id === departament.dep_id);
                if (index !== -1) {
                    this.departamentList.splice(index, 1, new Departament(departament));
                }
            }
        },

        async deleteDepartament(departament) {
            const response = await api.deleteDepartament(departament);
            if (response.success === true) {
                const index = this.departamentList.findIndex(d => d.dep_id === departament.dep_id);
                if (index !== -1) {
                    this.departamentList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

import api from '@/api/api';
import Import_Disciple from '@/model/import-group/Import_Disciple';
import { defineStore } from 'pinia';

export const useImport_DiscipleStore = defineStore('import_disciple', {
    state: () => ({
        import_discipleList: [],
    }),
    getters: {
        import_discipleMap(state) {
            return state.import_discipleList.reduce((map, import_disciple) => {
                map[import_disciple.direction_code] = import_disciple;
                return map;
            }, {});
        },
    },
    actions: {
        async getImport_DiscipleList() {
            const responseData = await api.getImport_DiscipleList();
            this.import_discipleList = responseData.map((import_disciple) => {
                return new Import_Disciple(import_disciple);
            });
        },

        async getImport_Disciple(code) {
            await api.getImport_Disciple(code);
        },

        async postImport_Disciple(import_disciple) {
            console.log(import_disciple);
            const response = await api.postImport_Disciple(import_disciple);
            console.log(response);
            if (response.success !== true) {
                throw new Error('Ошибка при загрузке файла на сервер');
            }
        },

        async putImport_Disciple(import_disciple) {
            const response = await api.putImport_Disciple(import_disciple.direction_code, import_disciple);
            if (response.success === true) {
                const index = this.import_discipleList.findIndex(s => s.direction_code === import_disciple.direction_code);
                if (index !== -1) {
                    this.import_discipleList.splice(index, 1, new Import_Disciple(import_disciple));
                }
            }
        },

        async deleteImport_Disciple(import_disciple) {
            const response = await api.deleteImport_Disciple(import_disciple);
            console.log(response)
            if (response.success === true) {
                const index = this.import_discipleList.findIndex(s => s.id === import_disciple.id);
                if (index !== -1) {
                    this.import_discipleList[index].deleted_at = new Date().toISOString();
                }
            }
        },
        
    },
});

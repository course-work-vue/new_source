import api from '@/api/api';
import Import_Disciple from '@/model/import-group/Import_Disciple';
import { defineStore } from 'pinia';
import Import_Disciple_Department from "../../model/import-group/Import_Disciple_Department";
import Import_Disciple_Semester from "../../model/import-group/Import_Disciple_Semestr";

export const useImport_DiscipleStore = defineStore('import_disciple', {
    state: () => ({
        import_discipleList: [],
        import_disciple_semestresList:[],
        import_disciple_departmentsList:[],
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

        async getImport_DiscipleSemestresList() {
                    const responseData = await api.getImport_DiscipleSemestresList();
                    this.import_disciple_semestresList = responseData.map((import_disciple_semestres) => {
                        return new Import_Disciple_Semester(import_disciple_semestres);
                    });
                },
        
                async getImport_DiscipleDepartmentsList() {
                    const responseData = await api.getImport_DiscipleDepartmentsList();
                    this.import_disciple_departmentsList = responseData.map((import_disciple_departments) => {
                        return new Import_Disciple_Department(import_disciple_departments);
                    });
                },

        async getImport_Disciple(code) {
            await api.getImport_Disciple(code);
        },

        async postImport_Disciple(import_disciple) {
            const response = await api.postImport_Disciple(import_disciple);
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
            if (response.success === true) {
                const index = this.import_discipleList.findIndex(s => s.id === import_disciple.id);
                if (index !== -1) {
                    this.import_discipleList[index].deleted_at = new Date().toISOString();
                }
            }
        },
        
    },
});

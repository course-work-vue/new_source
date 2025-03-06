import api from '@/api/api';
import Import_Program from '@/model/import-group/Import_Program';
import { defineStore } from 'pinia';

export const useImport_ProgramStore = defineStore('import_program', {
    state: () => ({
        import_programList: [],
    }),
    getters: {
        import_programMap(state) {
            return state.import_programList.reduce((map, import_program) => {
                map[import_program.direction_code] = import_program;
                return map;
            }, {});
        },
    },
    actions: {
        async getImport_ProgramList() {
            console.log("IP!")
            const responseData = await api.getImport_ProgramList();
            console.log(responseData);
            this.import_programList = responseData.map((import_program) => {
                return new Import_Program(import_program);
            });
        },

        async getImport_Program(code) {
            await api.getImport_Program(code);
        },

        async postImport_Program(import_program) {
            const response = await api.postImport_Program(import_program);
            console.log(response);
            if (response.success !== true) {
                throw new Error('Ошибка при загрузке файла на сервер');
            }
        },

        async putImport_Program(import_program) {
            const response = await api.putImport_Program(import_program.direction_code, import_program);
            if (response.success === true) {
                const index = this.import_programList.findIndex(s => s.direction_code === import_program.direction_code);
                if (index !== -1) {
                    this.import_programList.splice(index, 1, new Import_Program(import_program));
                }
            }
        },

        async deleteImport_Program(import_program) {
            const response = await api.deleteImport_Program(import_program);
            console.log(response)
            if (response.success === true) {
                const index = this.import_programList.findIndex(s => s.id === import_program.id);
                if (index !== -1) {
                    this.import_programList[index].deleted_at = new Date().toISOString();
                }
            }
        },
        
    },
});

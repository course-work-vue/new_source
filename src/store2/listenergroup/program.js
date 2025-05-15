import api from '@/api/api';
import Program from '@/model/listener-group/Program';
import { defineStore } from 'pinia';

export const useProgramStore = defineStore('program', {
    state: () => ({
        programList: [],
    }),
    getters: {
        programMap(state) {
            return state.programList.reduce((map, program) => {
                map[program.id] = program;
                return map;
            }, {});
        },
    },
    actions: {
        async getProgramList() {
            const responseData = await api.getProgramList();
            this.programList = responseData.map((program) => {
                return new Program(program);
            });
        },

        async getProgram(code) {
            await api.getProgram(code);
        },

        async postProgram(program) {
            const response = await api.postProgram(program);
            console.log(response);
            if (response.success === true) {

                await this.getProgramList();
            }
        },

        async putProgram(program) {
            console.log(program)
            const response = await api.putProgram(program.id, program);
            console.log(response);
            if (response.success === true) {
                const index = this.programList.findIndex(s => s.id === program.id);
                if (index !== -1) {
                    this.programList.splice(index, 1, new Program(program));
                }
            }
        },

        async deleteProgram(program) {
            const response = await api.deleteProgram(program);
            if (response.success === true) {
                const index = this.programList.findIndex(s => s.id === program.id);
                if (index !== -1) {
                    this.programList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

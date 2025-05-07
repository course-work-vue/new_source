import api from '@/api/api';
import Schema from '@/model/admin-group/Schema';
import { defineStore } from 'pinia';

export const useSchemaStore = defineStore('schema', {
    state: () => ({
        schemaList: [],
    }),
    getters: {

    },
    actions: {
        async getSchemaList() {
            const responseData = await api.getSchemaList();
            this.schemaList = responseData.map((schema) => {
                return new Schema(schema);
            });
        },

        async postSchema(schema) {
            const responseData = await api.postSchema(schema);

        },

        async deleteSchema(schema) {
            const response = await api.deleteSchema(schema);
            if (response.success === true) {
                const index = this.schemaList.findIndex(sc => sc.schemaname === schema.schemaname);
                if (index !== -1) {
                    this.schemaList.splice(index, 1);
                }
            }
        },
    },
});

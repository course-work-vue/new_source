import api from '@/api/api';
import Schema from '@/model/admin-group/Schema';
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

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
            try {
                const responseData = await api.postSchema(schema);
                if (responseData && responseData.success) {
                    ToastService.showSuccess('Схема успешно добавлена');
                    await this.getSchemaList();
                } else {
                    ToastService.showError('Не удалось добавить схему');
                }
                return responseData;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении схемы');
                throw error;
            }
        },

        async deleteSchema(schema) {
            try {
                const response = await api.deleteSchema(schema);
                if (response && response.success === true) {
                    const index = this.schemaList.findIndex(sc => sc.schemaname === schema.schemaname);
                    if (index !== -1) {
                        this.schemaList.splice(index, 1);
                    }
                    ToastService.showSuccess('Схема успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить схему');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении схемы');
                throw error;
            }
        },
    },
});

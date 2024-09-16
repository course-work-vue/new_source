import api from '@/api/api';
import Uploaded_File from '@/model/uploaded_file-group/Uploaded_File';
import { defineStore } from 'pinia';

export const useUploaded_FileStore = defineStore('uploaded_file', {
    state: () => ({
        uploaded_fileList: [],
    }),
    getters: {
        uploaded_fileMap(state) {
            return state.uploaded_fileList.reduce((map, uploaded_file) => {
                map[uploaded_file.id] = uploaded_file;
                return map;
            }, {});
        },
    },
    actions: {
        async getUploaded_FileList() {
            const responseData = await api.getUploaded_FileList();
            this.uploaded_fileList = responseData.map((uploaded_file) => {
                return new Uploaded_File(uploaded_file);
            });
        },

        async getUploaded_File(code) {
            await api.getUploaded_File(code);
        },

        async postUploaded_File(uploaded_file) {
            const response = await api.postUploaded_File(uploaded_file);

            if (response.success === true) {

                await this.getUploaded_FileList();
            }
        },

        async putUploaded_File(uploaded_file) {
            const response = await api.putUploaded_File(uploaded_file.id, uploaded_file);
            if (response.success === true) {
                const index = this.uploaded_fileList.findIndex(s => s.id === uploaded_file.id);
                if (index !== -1) {
                    this.uploaded_fileList.splice(index, 1, new Uploaded_File(uploaded_file));
                }
            }
        },

        async deleteUploaded_File(uploaded_file) {
            const response = await api.deleteUploaded_File(uploaded_file);
            if (response.success === true) {
                const index = this.uploaded_fileList.findIndex(s => s.id === uploaded_file.id);
                if (index !== -1) {
                    this.uploaded_fileList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

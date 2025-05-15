import api from '@/api/api';
import Student from '@/model/student-group/Student';
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useStudentStore = defineStore('student', {
    state: () => ({
        studentList: [],
    }),
    getters: {
        studentMap(state) {
            return state.studentList.reduce((map, student) => {
                map[student.student_id] = student;
                return map;
            }, {});
        },
        activeSortedStudents(state) {
            return state.studentList
                .filter((student) => student.deleted_at === null)
                .sort((a, b) => a.full_name.localeCompare(b.full_name));
        },
    },
    actions: {
        async getStudentList() {
            const responseData = await api.getStudentList();
            this.studentList = responseData.map((student) => {
                return new Student(student);
            });
        },
        async getCont() {
            return await api.getStudentCont();
        },
        async getStudent(code) {
            await api.getStudent(code);
        },

        async postStudent(student) {
            try {
                const response = await api.postStudent(student);

                if (response.success === true) {
                    await this.getStudentList();
                    ToastService.showSuccess('Студент успешно добавлен');
                } else {
                    ToastService.showError('Не удалось добавить студента');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении студента');
                throw error;
            }
        },

        async putStudent(student) {
            try {
                const response = await api.putStudent(student.student_id, student);

                if (response.success === true) {
                    const index = this.studentList.findIndex(s => s.student_id === student.student_id);

                    if (index !== -1) {
                        this.studentList.splice(index, 1, new Student(student));
                    }
                    ToastService.showSuccess('Информация о студенте успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить информацию о студенте');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении информации о студенте');
                throw error;
            }
        },

        async deleteStudent(student) {
            try {
                const response = await api.deleteStudent(student);
                if (response.success === true) {
                    const index = this.studentList.findIndex(s => s.student_id === student.student_id);
                    if (index !== -1) {
                        this.studentList[index].deleted_at = new Date().toISOString();
                    }
                    ToastService.showSuccess('Студент успешно удален');
                } else {
                    ToastService.showError('Не удалось удалить студента');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении студента');
                throw error;
            }
        },
        async uploadStudentFile(file) {
            try {
                const response = await api.uploadFile(file);
                if (response.success) {
                    console.log('File uploaded successfully');
                    ToastService.showSuccess('Файл успешно загружен');
                } else {
                    console.error('File upload failed');
                    ToastService.showError('Не удалось загрузить файл');
                }
                return response;
            } catch (error) {
                console.error('Error uploading file:', error);
                ToastService.showError('Ошибка при загрузке файла');
                throw error;
            }
        },
        // In studentStore
        async uploadGeneratedFile(fileBlob, fileName) {
            try {
                const formData = new FormData();
                formData.append('file', fileBlob, fileName); // Append the file with key 'file'

                const response = await api.uploadFile(formData); // Use the API method to upload the file
                if (response.success) {
                    ToastService.showSuccess('Файл успешно загружен');
                }
                return response.fileName;
            } catch (error) {
                console.error('Error uploading file:', error);
                ToastService.showError('Ошибка при загрузке файла');
                throw error;
            }
        }
    },
});

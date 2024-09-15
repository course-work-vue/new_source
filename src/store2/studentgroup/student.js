import api from '@/api/api';
import Student from '@/model/student-group/Student';
import { defineStore } from 'pinia';

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

        async getStudent(code) {
            await api.getStudent(code);
        },

        async postStudent(student) {
            const response = await api.postStudent(student);

            if (response.success === true) {

                await this.getStudentList();
            }
        },

        async putStudent(student) {
            const response = await api.putStudent(student.student_id, student);
            if (response.success === true) {
                const index = this.studentList.findIndex(s => s.id === student.student_id);
                if (index !== -1) {
                    this.studentList.splice(index, 1, new Student(student));
                }
            }
        },

        async deleteStudent(student) {
            const response = await api.deleteStudent(student);
            if (response.success === true) {
                const index = this.studentList.findIndex(s => s.student_id === student.student_id);
                if (index !== -1) {
                    this.studentList[index].deleted_at = new Date().toISOString();
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
        // In studentStore
        async uploadGeneratedFile(fileBlob, fileName) {
            try {
                const formData = new FormData();
                formData.append('file', fileBlob, fileName); // Append the file with key 'file'

                const response = await api.uploadFile(formData); // Use the API method to upload the file
                return response.filePath;
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }



    },
});

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
                map[student.id] = student;
                return map;
            }, {});
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
            await api.postStudent(student);
        },

        async putStudent(student) {
            await api.putStudent(student.student_id, student);
        },

        async deleteStudent(student) {
            await api.deleteStudent(student);
        },
    },
});

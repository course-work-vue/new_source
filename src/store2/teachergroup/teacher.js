import api from '@/api/api';
import Teacher from '@/model/teacher-group/Teacher';
import { defineStore } from 'pinia';

export const useTeacherStore = defineStore('teacher', {
    state: () => ({
        teacherList: [],
    }),
    getters: {
        teacherMap(state) {
            return state.teacherList.reduce((map, teacher) => {
                map[teacher.teacher_id] = teacher;
                return map;
            }, {});
        },
    },
    actions: {
        async getTeacherList() {
            const responseData = await api.getTeacherList();
            this.teacherList = responseData.map((teacher) => {
                return new Teacher(teacher);
            });
        },

        async getTeacher(teacher_id) {
            await api.getTeacher(teacher_id);
        },

        async postTeacher(teacher) {
            const response = await api.postTeacher(teacher);

            if (response.success === true) {
                await this.getTeacherList();
            }
        },

        async putTeacher(teacher) {
            const response = await api.putTeacher(teacher.teacher_id, teacher);
            if (response.success === true) {
                const index = this.teacherList.findIndex(t => t.teacher_id === teacher.teacher_id);
                if (index !== -1) {
                    this.teacherList.splice(index, 1, new Teacher(teacher));
                }
            }
        },

        async deleteTeacher(teacher) {
            const response = await api.deleteTeacher(teacher);
            if (response.success === true) {
                const index = this.teacherList.findIndex(t => t.teacher_id === teacher.teacher_id);
                if (index !== -1) {
                    this.teacherList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

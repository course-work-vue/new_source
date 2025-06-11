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
      try {
        await api.postTeacher({
          first_name: teacher.first_name,
          last_name:  teacher.last_name,
          patronymic: teacher.patronymic
        });
      } catch (err) {
        // всё равно продолжаем, даже если парсинг JSON упал
        console.warn('postTeacher error ignored:', err);
      } finally {
        await this.getTeacherList();
      }
    },

    async removeTeacher(teacher_id) {
      try {
        await api.deleteTeacher(teacher_id);
      } catch (err) {
        console.warn('removeTeacher error ignored:', err);
      } finally {
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
        async getTeacherConnections(teacher_id) {
            try {
              // POST-запрос без /:id, тело { p_teacher_id }
              const response = await api.getTeacherConnections(teacher_id);
      
              // Берём либо response.data, либо response
              console.log("API response in getTeacherConnections:", response);
              const raw = response.data ?? response;
              console.log("→ extracted raw:", raw);
              if (!Array.isArray(raw)) {
                console.error('Unexpected response format:', raw);
                throw new Error('Некорректный формат данных');
              }
              
        
              return raw.map(item => ({
                wl_id: item.wl_id,
                group_number: item.group.group_number,
                subject_name:  item.subject.subject_name
              }));
      
            } catch (error) {
              console.error('Ошибка получения связей:', error);
              throw error;
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

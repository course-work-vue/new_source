import api from '@/api/api';
import CourseWork from '@/model/student-group/CourseWork'; // Adjust the path to your course work model
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useCourseWorkStore = defineStore('courseWork', {
    state: () => ({
        courseWorkList: [],
    }),
    getters: {
        courseWorkMap(state) {
            return state.courseWorkList.reduce((map, courseWork) => {
                map[courseWork.course_work_id] = courseWork;
                return map;
            }, {});
        },
    },
    actions: {
        async getCourseWorkList() {
            const responseData = await api.getCourseWorkList();
            this.courseWorkList = responseData.map((courseWork) => {
                return new CourseWork(courseWork);
            });
        },

        async getCourseWork(id) {
            const response = await api.getCourseWork(id);
            return new CourseWork(response.data);
        },

        async postCourseWork(courseWork) {
            try {
                const response = await api.postCourseWork(courseWork);

                if (response.success === true) {
                    await this.getCourseWorkList();
                    ToastService.showSuccess('Курсовая работа успешно добавлена');
                } else {
                    ToastService.showError('Не удалось добавить курсовую работу');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении курсовой работы');
                throw error;
            }
        },

        async putCourseWork(courseWork) {
            try {
                const response = await api.putCourseWork(courseWork.course_work_id, courseWork);
                if (response.success === true) {
                    const index = this.courseWorkList.findIndex(c => c.course_work_id === courseWork.course_work_id);
                    if (index !== -1) {
                        this.courseWorkList.splice(index, 1, new CourseWork(courseWork));
                    }
                    ToastService.showSuccess('Информация о курсовой работе успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить информацию о курсовой работе');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении информации о курсовой работе');
                throw error;
            }
        },

        async deleteCourseWork(courseWork) {
            try {
                const response = await api.deleteCourseWork(courseWork);
                if (response.success === true) {
                    const index = this.courseWorkList.findIndex(c => c.course_work_id === courseWork.course_work_id);
                    if (index !== -1) {
                        // Soft-delete by setting the deleted_at property
                        this.courseWorkList[index].deleted_at = new Date().toISOString();
                    }
                    ToastService.showSuccess('Курсовая работа успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить курсовую работу');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении курсовой работы');
                throw error;
            }
        },

        async restoreCourseWork(courseWork) {
            try {
                // Implement restoration logic here if needed
                const response = await api.restoreCourseWork(courseWork.course_work_id);
                if (response.success === true) {
                    const index = this.courseWorkList.findIndex(c => c.course_work_id === courseWork.course_work_id);
                    if (index !== -1) {
                        this.courseWorkList[index].deleted_at = null; // Remove soft delete
                    }
                    ToastService.showSuccess('Курсовая работа успешно восстановлена');
                } else {
                    ToastService.showError('Не удалось восстановить курсовую работу');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при восстановлении курсовой работы');
                throw error;
            }
        },
        
        async uploadGeneratedFile(fileBlob, fileName) {
            try {
                const formData = new FormData();
                formData.append('file', fileBlob, fileName);

                const response = await api.uploadFile(formData);
                if (response.success) {
                    ToastService.showSuccess('Файл успешно загружен');
                } else {
                    ToastService.showError('Не удалось загрузить файл');
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

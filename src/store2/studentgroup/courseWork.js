import api from '@/api/api';
import CourseWork from '@/model/student-group/CourseWork'; // Adjust the path to your course work model
import { defineStore } from 'pinia';

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
            const response = await api.postCourseWork(courseWork);

            if (response.success === true) {
                await this.getCourseWorkList();
            }
        },

        async putCourseWork(courseWork) {
            const response = await api.putCourseWork(courseWork.course_work_id, courseWork);
            if (response.success === true) {
                const index = this.courseWorkList.findIndex(c => c.course_work_id === courseWork.course_work_id);
                if (index !== -1) {
                    this.courseWorkList.splice(index, 1, new CourseWork(courseWork));
                }
            }
        },

        async deleteCourseWork(courseWork) {
            const response = await api.deleteCourseWork(courseWork);
            if (response.success === true) {
                const index = this.courseWorkList.findIndex(c => c.course_work_id === courseWork.course_work_id);
                if (index !== -1) {
                    // Soft-delete by setting the deleted_at property
                    this.courseWorkList[index].deleted_at = new Date().toISOString();
                }
            }
        },

        async restoreCourseWork(courseWork) {
            // Implement restoration logic here if needed
            const response = await api.restoreCourseWork(courseWork.course_work_id);
            if (response.success === true) {
                const index = this.courseWorkList.findIndex(c => c.course_work_id === courseWork.course_work_id);
                if (index !== -1) {
                    this.courseWorkList[index].deleted_at = null; // Remove soft delete
                }
            }
        },
        async uploadGeneratedFile(fileBlob, fileName) {
            try {
                const formData = new FormData();
                formData.append('file', fileBlob, fileName);

                const response = await api.uploadFile(formData);
                return response.filePath;
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

    },
});

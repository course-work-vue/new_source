import api from '@/api/api';
import Group from '@/model/student-group/Group'; // Путь к модели Group
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useGroupStore = defineStore('group', {
    state: () => ({
        groupList: [],
    }),
    getters: {
        groupMap(state) {
            return state.groupList.reduce((map, group) => {
                map[group.group_id] = group;
                return map;
            }, {});
        },
    },
    actions: {
        async getGroupList() {
            const responseData = await api.getGroupList();
            this.groupList = responseData.map((group) => {
                return new Group(group);
            });
        },

        async getGroup(group_id) {
            const groupData = await api.getGroup(group_id);
            return new Group(groupData);
        },

        async postGroup(group) {
            try {
                const response = await api.postGroup(group);

                if (response.success === true) {
                    await this.getGroupList();
                    ToastService.showSuccess('Группа успешно добавлена');
                } else {
                    ToastService.showError('Не удалось добавить группу');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении группы');
                throw error;
            }
        },

        async putGroup(group) {
            try {
                const response = await api.putGroup(group.group_id, group);
                if (response.success === true) {
                    const index = this.groupList.findIndex(g => g.group_id === group.group_id);
                    if (index !== -1) {
                        this.groupList.splice(index, 1, new Group(group));
                    }
                    ToastService.showSuccess('Информация о группе успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить информацию о группе');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении информации о группе');
                throw error;
            }
        },

        async deleteGroup(group) {
            try {
                const response = await api.deleteGroup(group);
                if (response.success === true) {
                    const index = this.groupList.findIndex(g => g.group_id === group.group_id);
                    if (index !== -1) {
                        this.groupList[index].deleted_at = new Date().toISOString();
                    }
                    ToastService.showSuccess('Группа успешно удалена');
                } else {
                    ToastService.showError('Не удалось удалить группу');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении группы');
                throw error;
            }
        },
    },
});

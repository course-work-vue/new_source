import api from '@/api/api';
import Profile from '@/model/student-group/Profile'; // Предполагаем, что модель Profile находится в этой директории
import { defineStore } from 'pinia';
import ToastService from '@/services/ToastService';

export const useProfileStore = defineStore('profile', {
    state: () => ({
        profileList: [],
    }),
    getters: {
        profileMap(state) {
            return state.profileList.reduce((map, profile) => {
                map[profile.prof_id] = profile;
                return map;
            }, {});
        },
    },
    actions: {
        async getProfileList() {
            const responseData = await api.getProfileList();
            this.profileList = responseData.map((profile) => {
                return new Profile(profile);
            });
        },

        async getProfile(prof_id) {
            const profileData = await api.getProfile(prof_id);
            return new Profile(profileData);
        },

        async postProfile(profile) {
            try {
                const response = await api.postProfile(profile);

                if (response.success === true) {
                    await this.getProfileList();
                    ToastService.showSuccess('Профиль успешно добавлен');
                } else {
                    ToastService.showError('Не удалось добавить профиль');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при добавлении профиля');
                throw error;
            }
        },

        async putProfile(profile) {
            try {
                const response = await api.putProfile(profile.prof_id, profile);
                if (response.success === true) {
                    const index = this.profileList.findIndex(p => p.prof_id === profile.prof_id);
                    if (index !== -1) {
                        this.profileList.splice(index, 1, new Profile(profile));
                    }
                    ToastService.showSuccess('Информация о профиле успешно обновлена');
                } else {
                    ToastService.showError('Не удалось обновить информацию о профиле');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при обновлении информации о профиле');
                throw error;
            }
        },

        async deleteProfile(profile) {
            try {
                const response = await api.deleteProfile(profile);
                if (response.success === true) {
                    const index = this.profileList.findIndex(p => p.prof_id === profile.prof_id);
                    if (index !== -1) {
                        this.profileList[index].deleted_at = new Date().toISOString();
                    }
                    ToastService.showSuccess('Профиль успешно удален');
                } else {
                    ToastService.showError('Не удалось удалить профиль');
                }
                return response;
            } catch (error) {
                ToastService.showError('Ошибка при удалении профиля');
                throw error;
            }
        },
    },
});

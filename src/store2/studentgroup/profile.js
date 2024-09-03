import api from '@/api/api';
import Profile from '@/model/student-group/Profile'; // Предполагаем, что модель Profile находится в этой директории
import { defineStore } from 'pinia';

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
            const response = await api.postProfile(profile);

            if (response.success === true) {
                await this.getProfileList();
            }
        },

        async putProfile(profile) {
            const response = await api.putProfile(profile.prof_id, profile);
            if (response.success === true) {
                const index = this.profileList.findIndex(p => p.prof_id === profile.prof_id);
                if (index !== -1) {
                    this.profileList.splice(index, 1, new Profile(profile));
                }
            }
        },

        async deleteProfile(profile) {
            const response = await api.deleteProfile(profile);
            if (response.success === true) {
                const index = this.profileList.findIndex(p => p.prof_id === profile.prof_id);
                if (index !== -1) {
                    this.profileList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

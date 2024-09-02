import api from '@/api/api';
import Direction from '@/model/student-group/Direction'; // Assuming the Direction model is placed here
import { defineStore } from 'pinia';

export const useDirectionStore = defineStore('direction', {
    state: () => ({
        directionList: [],
    }),
    getters: {
        directionMap(state) {
            return state.directionList.reduce((map, direction) => {
                map[direction.dir_id] = direction;
                return map;
            }, {});
        },
    },
    actions: {
        async getDirectionList() {
            const responseData = await api.getDirectionList();
            this.directionList = responseData.map((direction) => {
                return new Direction(direction);
            });
        },

        async getDirection(dir_id) {
            const directionData = await api.getDirection(dir_id);
            if (directionData) {
                // Assuming you want to replace the entry if it already exists
                const index = this.directionList.findIndex(d => d.dir_id === dir_id);
                if (index !== -1) {
                    this.directionList.splice(index, 1, new Direction(directionData));
                } else {
                    this.directionList.push(new Direction(directionData));
                }
            }
        },

        async postDirection(direction) {
            const response = await api.postDirection(direction);
            if (response.success === true) {
                await this.getDirectionList();
            }
        },

        async putDirection(direction) {
            const response = await api.putDirection(direction.dir_id, direction);
            if (response.success === true) {
                const index = this.directionList.findIndex(d => d.dir_id === direction.dir_id);
                if (index !== -1) {
                    this.directionList.splice(index, 1, new Direction(direction));
                }
            }
        },

        async deleteDirection(direction) {
            const response = await api.deleteDirection(direction);
            if (response.success === true) {
                const index = this.directionList.findIndex(d => d.dir_id === direction.dir_id);
                if (index !== -1) {
                    this.directionList[index].deleted_at = new Date().toISOString();
                }
            }
        },
    },
});

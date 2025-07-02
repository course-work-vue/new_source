import { defineStore } from 'pinia';
import axios from 'axios'; // Ваш настроенный экземпляр axios

export const useCompetencyStore = defineStore('competency', {
  state: () => ({
    zones: [],
    competencies: [],
    indicators: [],
    planCompetencies: [], // Компетенции текущего открытого плана
    isLoading: false,
    error: null,
  }),

  actions: {
    // --- Действия для загрузки справочников ---
    async fetchAllReferences() {
      this.isLoading = true;
      try {
        const [zonesRes, competenciesRes, indicatorsRes] = await Promise.all([
          axios.get('/api/v1/competency-zones'),
          axios.get('/api/v1/competencies'),
          axios.get('/api/v1/indicators'),
        ]);
        this.zones = zonesRes.data;
        this.competencies = competenciesRes.data;
        this.indicators = indicatorsRes.data;
      } catch (e) {
        this.error = 'Ошибка загрузки справочников компетенций.';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    // --- Действия для работы с компетенциями конкретного плана ---
    async fetchCompetenciesForPlan(planId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`/api/v1/plans/${planId}/competencies`);
        this.planCompetencies = response.data;
      } catch (e) {
        this.error = `Ошибка загрузки компетенций для плана ${planId}.`;
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    async addCompetenceToPlan(planId, competenceData) {
      // competenceData = { competence_id: number, indicator_ids: number[] }
      try {
        const response = await axios.post(`/api/v1/plans/${planId}/competencies`, competenceData);
        this.planCompetencies.push(response.data); // Добавляем новую связь в локальное состояние
      } catch (e) {
        // ... обработка ошибок
      }
    },
    
    async updateCompetenceInPlan(planId, competenceId, updatedData) {
        // ...
    },

    async removeCompetenceFromPlan(planId, competenceId) {
        // ...
    }
  },

  getters: {
    // Геттеры для удобной фильтрации
    getCompetenciesByZone: (state) => (zoneId) => {
      return state.competencies.filter(c => c.zone_id === zoneId);
    },
    getIndicatorsByCompetence: (state) => (competenceId) => {
      return state.indicators.filter(i => i.competence_id === competenceId);
    },
  },
});
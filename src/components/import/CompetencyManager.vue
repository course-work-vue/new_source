<!-- CompetencyManager.vue -->
<template>
  <div>
    <!-- Секция добавления новой компетенции -->
    <div class="card p-3 mb-4">
      <h5 class="mb-3">Добавить компетенцию в план</h5>
      <div class="row g-3 align-items-end">
        
        <!-- 1. Выбор Зоны -->
        <div class="col-md-4">
          <label for="zone-select" class="form-label">Зона компетенций</label>
          <select id="zone-select" class="form-select" v-model="selectedZoneId">
            <option :value="null" disabled>-- Выберите зону --</option>
            <option v-for="zone in competencyStore.zones" :key="zone.id" :value="zone.id">
              {{ zone.name }}
            </option>
          </select>
        </div>

        <!-- 2. Выбор Компетенции (зависит от Зоны) -->
        <div class="col-md-8">
          <label for="competence-select" class="form-label">Компетенция</label>
          <select id="competence-select" class="form-select" v-model="selectedCompetenceId" :disabled="!selectedZoneId">
             <option :value="null" disabled>-- Выберите компетенцию --</option>
             <option v-for="comp in availableCompetencies" :key="comp.id" :value="comp.id">
              {{ comp.code }} - {{ comp.description }}
            </option>
          </select>
        </div>
      </div>

      <!-- 3. Выбор Индикаторов (зависит от Компетенции) -->
      <div v-if="selectedCompetenceId" class="mt-4">
        <h6>Индикаторы для выбранной компетенции</h6>
        <div class="indicator-list p-2 border rounded">
          <div v-for="indicator in availableIndicators" :key="indicator.id" class="form-check">
            <input class="form-check-input" type="checkbox" :value="indicator.id" :id="`indicator-${indicator.id}`" v-model="selectedIndicatorIds">
            <label class="form-check-label" :for="`indicator-${indicator.id}`">
              <strong>{{ indicator.code }}</strong>: {{ indicator.description }}
            </label>
          </div>
          <div v-if="availableIndicators.length === 0" class="text-muted">
            Для этой компетенции нет индикаторов.
          </div>
        </div>
      </div>

      <!-- 4. Кнопка "Добавить" -->
      <div class="mt-3">
        <button @click="addCompetence" class="btn btn-success" :disabled="!isFormValid">
            <i class="material-icons-outlined me-1" style="font-size: 18px;">add_circle_outline</i>
            Добавить в план
        </button>
      </div>
    </div>

    <!-- Секция отображения уже добавленных компетенций -->
    <div class="card p-3">
       <h5 class="mb-3">Компетенции в учебном плане</h5>
       <!-- Здесь будет список/таблица добавленных компетенций с возможностью редактирования/удаления -->
       <!-- ... -->
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useCompetencyStore } from '@/store2/importgroup/competencyStore'; // Путь к вашему стору

const props = defineProps({
  planId: {
    type: Number,
    required: true
  }
});

const competencyStore = useCompetencyStore();

// --- Локальное состояние формы ---
const selectedZoneId = ref(null);
const selectedCompetenceId = ref(null);
const selectedIndicatorIds = ref([]);

// --- Загрузка данных при монтировании ---
onMounted(() => {
  // Загружаем справочники, если их еще нет
  if (competencyStore.zones.length === 0) {
    competencyStore.fetchAllReferences();
  }
  // Загружаем компетенции для текущего плана
  competencyStore.fetchCompetenciesForPlan(props.planId);
});

// --- Вычисляемые свойства для каскадных списков ---
const availableCompetencies = computed(() => {
  if (!selectedZoneId.value) return [];
  // Фильтруем компетенции, которые еще не добавлены в план
  const addedCompetenceIds = competencyStore.planCompetencies.map(pc => pc.competence_id);
  return competencyStore.getCompetenciesByZone(selectedZoneId.value)
    .filter(c => !addedCompetenceIds.includes(c.id));
});

const availableIndicators = computed(() => {
  if (!selectedCompetenceId.value) return [];
  return competencyStore.getIndicatorsByCompetence(selectedCompetenceId.value);
});

// --- Логика формы ---
const isFormValid = computed(() => {
  return selectedCompetenceId.value && selectedIndicatorIds.value.length > 0;
});

const addCompetence = () => {
    if (!isFormValid.value) return;

    const data = {
        competence_id: selectedCompetenceId.value,
        indicator_ids: selectedIndicatorIds.value,
    };
    competencyStore.addCompetenceToPlan(props.planId, data);

    // Сброс формы для следующего добавления
    resetForm();
};

const resetForm = () => {
    // Не сбрасываем зону, чтобы было удобно добавлять несколько компетенций из одной зоны
    selectedCompetenceId.value = null;
    selectedIndicatorIds.value = [];
};

// --- Watchers для сброса зависимых полей ---
watch(selectedZoneId, () => {
  selectedCompetenceId.value = null;
  selectedIndicatorIds.value = [];
});

watch(selectedCompetenceId, () => {
  selectedIndicatorIds.value = [];
});
</script>

<style scoped>
.indicator-list {
    max-height: 250px;
    overflow-y: auto;
}
</style>
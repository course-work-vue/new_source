<template>
  <div class="ps-header">
    <span class="ps-label">{{ params.label }}</span>

    <!-- Плюсик: только для колонки П/С -->
    <button
      v-if="!params.gradeTypeId && params.onOpenManageTypes"
      class="btn-icon"
      @click.stop="openManageTypes"
      title="Управление типами оценок"
    >＋</button>

    <!-- Крестик удаления: только для столбцов оценок -->
    <button
      v-if="params.gradeTypeId && params.onDeleteGradeType"
      class="btn-icon-delete-header"
      @click.stop="deleteType(params.gradeTypeId)"
      title="Удалить колонку оценки"
    >✕</button>
  </div>
</template>

<script>
export default {
  name: 'PsHeader',
  props: {
    params: { type: Object, required: true }
  },
  methods: {
    openManageTypes() {
      this.params.onOpenManageTypes?.(this.params.dateId);
    },
    deleteType(gradeTypeId) {
      this.params.onDeleteGradeType?.(this.params.dateId, gradeTypeId);
    }
  }
};
</script>

<style scoped>
.ps-header {
  display: flex;
  flex-direction: column;   /* размещаем элементы вертикально */
  align-items: flex-start;  /* выравнивание по левому краю */
  padding: 4px;
  gap: 4px;                 /* отступ между лейблом и кнопками */
}
.ps-label {
  font-weight: 500;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 2px 4px;
}
.btn-icon-delete-header {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #d00;
  padding: 2px 4px;
}
.btn-icon-delete-header:hover {
  background: rgba(255,0,0,0.1);
  border-radius: 4px;
}
</style>

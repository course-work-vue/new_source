<template>
  <div class="date-header">
    <div class="date-text">{{ formattedDate }}</div>
    <div class="date-controls">
      <button class="btn-icon" @click.stop="onComment" title="Комментарий">💬</button>
      <button
        class="btn-icon"
        v-if="params.onDeleteDate"
        @click.stop="params.onDeleteDate()"
        title="Удалить дату"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateHeader',
  props: {
    params: { type: Object, required: true }
  },
  computed: {
    day() {
      // возвращаем день с ведущим нулём
      const d = this.params.date?.slice(8, 10) || '';
      return d.padStart(2, '0');
    },
    month() {
      const m = this.params.date?.slice(5, 7) || '';
      return m.padStart(2, '0');
    },
    year() {
      return this.params.date?.slice(2, 4) || '';
    },
    formattedDate() {
      // Собираем вид "07.05.25"
      return [this.day, this.month, this.year].filter(Boolean).join('.');
    }
  },
  methods: {
    onComment() {
      if (typeof this.params.onComment === 'function') {
        this.params.onComment(
          this.params.dateId,
          this.params.date,
          this.params.comment
        );
      }
    }
  }
};
</script>

<style scoped>
.date-header {
  position: relative;
  display: flex;              /* растягиваем на всю ширину и центрируем */
  width: 100%;
  align-items: center;
  justify-content: center;    /* вот что центрирует дату по горизонтали */
  padding: 4px;
}

.date-text {
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}

.date-controls {
  position: absolute;
  bottom: -1rem;    /* иконки на 0.5rem выше */
  left: 50%;
  transform: translateX(-50%);          /* уже подобрали, как вам нравится */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.date-header:hover .date-controls {
  opacity: 1;
}
.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px;
  line-height: 1;
}
.btn-icon:hover {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}
</style>
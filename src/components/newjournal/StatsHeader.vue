<template>
    <div class="ag-header-group-cell-label flex items-center justify-between">
      <span class="ag-header-group-text font-semibold">Статистика</span>
      <button @click.stop="toggle" class="px-2 py-1 text-xs bg-gray-200 rounded">
        {{ isOpened ? '' : '' }}
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: ['params'],
    data() {
      return {
        isOpened: true
      };
    },
    methods: {
      toggle() {
        // новое состояние группы
        const newState = !this.isOpened;
        // сворачиваем/разворачиваем группу целиком
        this.params.columnApi.setColumnGroupOpened(this.params.columnGroup, newState);
        // перерисовываем header, чтобы обновился наш компонент
        this.params.api.refreshHeader();
        // обновляем флаг, чтобы кнопка поменяла текст
        this.isOpened = newState;
      }
    }
  };
  </script>
  
  <style scoped>
  button {
    border: none;
    background: #e2e8f0;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  </style>
  
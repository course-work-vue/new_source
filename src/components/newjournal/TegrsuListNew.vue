<template>
    <div class="tegrsu-list-container">
      <h1 class="department-title">Преподаватель: {{ teacherFullName }}</h1>
  
      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-success" role="status"></div>
      </div>
  
      <div v-else class="grid-container">
        <ag-grid-vue
          class="ag-theme-alpine"
          :columnDefs="columnDefs"
          :rowData="connections"
          :defaultColDef="defaultColDef"
          :localeText="localeText"
          :pagination="true"
          style="width: 100%; height: 100%;"
          @grid-ready="onGridReady"
        />
      </div>
  
      <div v-if="error" class="error-state alert alert-danger">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script>
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-alpine.css";
  
  import { AgGridVue } from 'ag-grid-vue3';
  import { mapState, mapActions } from 'pinia';
  import { useTeacherStore } from '@/store2/teachergroup/teacher';
  import { AG_GRID_LOCALE_RU } from '@/ag-grid-russian.js';
  import TegrsuHrefCellRenderer from '@/components/newjournal/TegrsuHrefCellRendererNew.vue';
  export default {
    name: 'TegrsuListNew',
    components: { AgGridVue,TegrsuHrefCellRenderer },
    props: {
      teacher_id: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        frameworkComponents: {TegrsuHrefCellRenderer},
        columnDefs: [
        { headerName: 'связь', field: 'wl_id', filter: true, sortable: true, resizable: true,hide:true },
          { headerName: 'Группа', field: 'group_number', filter: true, sortable: true, resizable: true, cellRenderer: 'TegrsuHrefCellRenderer',
             },
          { headerName: 'Дисциплина', field: 'subject_name', filter: true, sortable: true, resizable: true }
        ],
        defaultColDef: { flex: 1, minWidth: 150 },
        
        localeText: AG_GRID_LOCALE_RU,
        loading: false,
        error: null,
        connections: []
      };
    },
    computed: {
      ...mapState(useTeacherStore, ['teacherList']),
      ...mapState(useTeacherStore, ['teacherList']),
  teacherFullName() {
    // 1) Приводим пропс к числу
    const id = Number(this.teacher_id);
    // 2) Ищем по числовому значению
    const teacher = this.teacherList.find(t => t.teacher_id === id);
    if (!teacher) {
      return 'Преподаватель не найден';
    }
    // 3) Собираем ФИО из полей snake_case
    return [teacher.last_name, teacher.first_name, teacher.patronymic]
      .filter(Boolean)
      .join(' ');
  }
    },
    methods: {
      ...mapActions(useTeacherStore, ['getTeacherConnections', 'getTeacherList']),
  
      async loadData() {
        this.loading = true;
        this.error = null;
        try {
          // Ensure teacher list is loaded to compute name
          if (!this.teacherList || this.teacherList.length === 0) {
            await this.getTeacherList();
          }
          
          const rawData = await this.getTeacherConnections(this.teacher_id);
          console.log('teacherList из стора:', this.teacherList);
          if (!Array.isArray(rawData)) {
            throw new Error('Некорректный формат данных');
          }
          this.connections = rawData;
          console.log('teacherList[0]:', JSON.parse(JSON.stringify(this.teacherList[0])));
          if (this.connections.length === 0) {
            this.error = 'Нет связей для отображения';
          }
        } catch (err) {
          this.error = err.message || 'Ошибка загрузки данных';
          console.error('Ошибка загрузки связей преподавателя:', err);
        } finally {
          this.loading = false;
        }
      },
      onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
      }
    },
    async mounted() {
      await this.loadData();
      console.log('Загружены связи для ID:', this.teacher_id);
    }
  };
  </script>
  
  <style scoped lang="scss">
  .loading-state {
    color: #666;
    text-align: center;
    padding: 20px;
  }
  
  .tegrsu-list-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .department-title {
    font-size: 1.8rem;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .grid-container {
    width: 100%;
    height: 70vh;
  }
  
  .error-state {
    margin-top: 20px;
    text-align: center;
  }
  </style>
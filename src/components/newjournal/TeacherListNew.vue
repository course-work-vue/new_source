<template>
    <div class="teacher-list-container">
      <h1 class="department-title">Список всех преподавателей ФКТИПМ</h1>
  
      <div class="search-container">
        <input
          class="search-input"
          type="text"
          v-model="quickFilterValue"
          @input="onFilterTextBoxChanged"
          placeholder="Поиск преподавателя..."
        />
      </div>
  
      <div v-if="loading" class="loading-indicator">
        Загрузка данных...
      </div>
  
      <div v-else class="grid-container">
        <ag-grid-vue
          class="ag-theme-alpine full-width-grid"
          :columnDefs="columnDefs"
          :rowData="processedTeachers"
          :defaultColDef="defaultColDef"
          :frameworkComponents="frameworkComponents"
          :localeText="localeText"
          :pagination="true"
          :paginationPageSize="paginationPageSize"
          @grid-ready="onGridReady"
          style="width: 100%; height: 100%;"
        />
      </div>
    </div>
  </template>
  
  <script>
  // Import AG Grid styles globally
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-alpine.css";
  
  import { AgGridVue } from 'ag-grid-vue3';
  import { mapState, mapActions } from 'pinia';
  import { useTeacherStore } from '@/store2/teachergroup/teacher';
  import TeacherHrefNew from '@/components/newjournal/TeacherHrefCellRendererNew.vue';
  import { AG_GRID_LOCALE_RU } from '@/ag-grid-russian.js';
  
  export default {
    name: 'TeachersListNew',
    components: { AgGridVue, TeacherHrefNew },
    data() {
      return {
        quickFilterValue: '',
        loading: false,
        gridApi: null,
        localeText: AG_GRID_LOCALE_RU,
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          flex: 1
        },
        frameworkComponents: { TeacherHrefNew },
        columnDefs: [
          { field: 'teacher_id', hide: true },
          {
            headerName: 'ФИО преподавателя',
            field: 'text',
            cellRenderer: 'TeacherHrefNew',
            cellRendererParams: {
              routeName: 'TeacherGroupsSubjects',
              idField: 'teacher_id'
            }
          }
        ],
        paginationPageSize: 20
      };
    },
    computed: {
      ...mapState(useTeacherStore, ['teacherList']),
      processedTeachers() {
        return this.teacherList.map(teacher => ({
          teacher_id: teacher.teacher_id,
          text: `${teacher.last_name} ${teacher.first_name} ${teacher.patronymic}`,
          ...teacher
        }));
      }
    },
    methods: {
      ...mapActions(useTeacherStore, ['getTeacherList']),
      onGridReady(params) {
        this.gridApi = params.api;
      },
      onFilterTextBoxChanged() {
        if (this.gridApi) this.gridApi.setQuickFilter(this.quickFilterValue);
      }
    },
    async mounted() {
      this.loading = true;
      try {
        await this.getTeacherList();
      } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
      } finally {
        this.loading = false;
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .loading-indicator {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
  }
  
  .teacher-list-container {
    padding: 20px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .department-title {
    font-size: 2rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .search-container {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
    max-width: 500px;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .grid-container {
    width: 100%;
    height: 70vh;
  }
  
  .full-width-grid {
    width: 100%;
    height: 100%;
    font-size: 14px;
    ::v-deep .ag-header-cell {
      padding-top: 8px;
      padding-bottom: 8px;
    }
    ::v-deep .ag-cell {
      padding-top: 8px;
      padding-bottom: 8px;
      line-height: 1.5;
    }
  }
  </style>
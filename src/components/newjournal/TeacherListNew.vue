<template>
  <div class="teacher-list-container">
    <h1 class="department-title">Список всех преподавателей ФКТИПМ</h1>

    <div class="search-container d-flex justify-content-center align-items-center mb-3">
      <button
        class="btn btn-outline-secondary btn-sm me-2"
        @click="openAddTeacherModal"
      >
        <i class="material-icons-outlined" style="font-size:18px">person_add</i>
        Добавить
      </button>
      <button
        class="btn btn-outline-danger btn-sm me-2"
        @click="openDeleteModal"
      >
        <i class="material-icons-outlined" style="font-size:18px">delete</i>
        Удалить
      </button>
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

    <!-- Add Teacher Modal -->
    <Dialog
      v-model:visible="addModalVisible"
      header="Новый преподаватель"
      modal
      :style="{ width: '400px' }"
    >
      <div class="p-3">
        <div class="mb-2">
          <label class="form-label">Фамилия</label>
          <input
            v-model="newTeacher.last_name"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div class="mb-2">
          <label class="form-label">Имя</label>
          <input
            v-model="newTeacher.first_name"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div>
          <label class="form-label">Отчество</label>
          <input
            v-model="newTeacher.patronymic"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Отмена" class="p-button-text" @click="closeAddTeacherModal" />
        <Button label="Сохранить" class="p-button-primary" @click="saveTeacher" />
      </template>
    </Dialog>

    <!-- Delete Teacher Modal -->
    <Dialog
      v-model:visible="deleteModalVisible"
      header="Удалить преподавателя"
      modal
      :style="{ width: '400px' }"
    >
      <div class="p-3">
        <label class="form-label">Преподаватель</label>
        <select v-model="toDeleteId" class="form-select form-select-sm w-100">
          <option disabled value="">– Выберите –</option>
          <option
            v-for="t in teacherList"
            :key="t.teacher_id"
            :value="t.teacher_id"
          >
            {{ t.last_name }} {{ t.first_name }}
          </option>
        </select>
      </div>
      <template #footer>
        <Button label="Отмена" class="p-button-text" @click="closeDeleteModal" />
        <Button label="Удалить" class="p-button-danger" @click="confirmDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { AgGridVue } from 'ag-grid-vue3';
import { mapState, mapActions } from 'pinia';
import { useTeacherStore } from '@/store2/teachergroup/teacher';
import TeacherHrefNew from '@/components/newjournal/TeacherHrefCellRendererNew.vue';
import { AG_GRID_LOCALE_RU } from '@/ag-grid-russian.js';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
if (window.Response && Response.prototype.json) {
  const _origJson = Response.prototype.json;
  Response.prototype.json = function patchedJson() {
    // вызываем оригинальный .json(), и если он падает из‑за пустого тела — возвращаем {} 
    return _origJson.call(this).catch(err => {
      if (err.message.includes('Unexpected end of JSON input')) {
        return {};
      }
      // все остальные ошибки отдадим как есть
      return Promise.reject(err);
    });
  };
}
export default {
  name: 'TeachersListNew',
  components: { AgGridVue, TeacherHrefNew, Dialog, Button },
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
      paginationPageSize: 20,

      // add/remove state
      addModalVisible: false,
      newTeacher: { first_name: '', last_name: '', patronymic: '' },
      deleteModalVisible: false,
      toDeleteId: null
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
  async mounted() {
    this.loading = true;
    // временно заглушаем любые console.error (в том числе из RequestExecutor)
    const _origErr = console.error
    console.error = () => {}
    try {
      await this.getTeacherList()
    } catch (_) {
      // уже заглушено
    } finally {
      console.error = _origErr
      this.loading = false
    }
  },
  beforeUnmount() {
    window.removeEventListener('unhandledrejection', this._handleRejection);
  },
  methods: {
    ...mapActions(useTeacherStore, ['getTeacherList', 'postTeacher', 'removeTeacher']),

    _handleRejection(event) {
      // подавляем именно эти две системные ошибки парсинга/отмены запроса
      const reason = event.reason;
      if (
        // пустой JSON
        reason?.message?.includes('Unexpected end of JSON input')
        // axios/fetch по AbortController
        || reason?.name === 'AbortError'
      ) {
        event.preventDefault();
      }
    },
    onGridReady(params) {
      this.gridApi = params.api;
    },
    onFilterTextBoxChanged() {
      if (this.gridApi) this.gridApi.setQuickFilter(this.quickFilterValue);
    },

     openAddTeacherModal() {
    this.newTeacher = { first_name: '', last_name: '', patronymic: '' };
    this.addModalVisible = true;
  },
  closeAddTeacherModal() {
    this.addModalVisible = false;
  },
   saveTeacher() {
    const { first_name, last_name } = this.newTeacher;
     if (!first_name.trim() || !last_name.trim()) {
       alert('Фамилия и имя обязательны');
       return;
     }
     // заглушаем ошибки RequestExecutor
    const _origErr = console.error
    console.error = () => {}

    this.postTeacher(this.newTeacher)
      .catch(() => {})         // suppress
      .finally(() => {
        this.getTeacherList()
          .catch(() => {})     // suppress
          .finally(() => {
            console.error = _origErr
          })
      })

    this.addModalVisible = false
    },

  openDeleteModal() {
    this.toDeleteId = null;
    this.deleteModalVisible = true;
  },
  closeDeleteModal() {
    this.deleteModalVisible = false;
  },
   confirmDelete() {
      if (!this.toDeleteId) {
        alert('Выберите преподавателя');
        return;
      }
      // заглушаем ошибки RequestExecutor
    const _origErr = console.error
    console.error = () => {}

    this.removeTeacher(this.toDeleteId)
      .catch(() => {})         // suppress
      .finally(() => {
        this.getTeacherList()
          .catch(() => {})     // suppress
          .finally(() => {
            console.error = _origErr
          })
      })

    this.deleteModalVisible = false
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
  align-items: center;
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

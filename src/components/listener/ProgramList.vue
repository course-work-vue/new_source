<template>
  <div class="col col-xs-9 col-lg-12 mt-4 list">
    <!-- Шапка: кнопка добавления и фильтры -->
    <div class="col col-12">
      <div class="mb-3 col col-12">
        <div class="col col-6 float-start d-inline-flex align-items-center mb-2">
          <button
            @click="openSidebar"
            class="btn btn-primary float-start"
            type="button"
          >
            <i class="material-icons-outlined">add</i>Добавить программу
          </button>
        </div>
        <div class="col col-6 float-end d-inline-flex align-items-center mb-2">
          <button 
            @click="clearFilters" 
            :disabled="!filters" 
            class="btn btn-sm btn-primary text-nowrap mx-2" 
            type="button"
          >
            <i class="material-icons-outlined">close</i>Очистить фильтры
          </button>
          <input 
            class="form-control" 
            type="text" 
            v-model="quickFilterValue" 
            id="filter-text-box" 
            @input="onFilterTextBoxChanged()" 
            placeholder="Поиск..."
          > 
        </div>
      </div>
    </div>

    <!-- Таблица с программами -->
    <div style="height: 50vh">
      <div class="h-100 pt-5">
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 100%;"
          :columnDefs="columnDefs.value"
          :rowData="rowData.value"
          :defaultColDef="defaultColDef"
          rowSelection="multiple"
          animateRows="true"
          @cell-clicked="cellWasClicked"
          @grid-ready="onGridReady"
          @firstDataRendered="onFirstDataRendered"
          @filter-changed="onFilterChanged"
          :pagination="true"            
          :paginationPageSize="paginationPageSize"  
        >
        </ag-grid-vue>
      </div>
    </div>
  </div>

  <!-- Окно редактирования/добавления программы -->
  <Sidebar
    v-model:visible="showSidebar"
    position="bottom"
    modal
    header="Данные программы"
    class="custom-sidebar h-auto"
    :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
  >
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form
          v-model="program"
          v-model:errors="errors"
          :scheme="scheme"
          class="custom-form"
        >
        </auto-form>
      </div>
    </div>
    <div class="form-footer">
      <Button class="btn btn-primary float-start" @click="submit">
        Сохранить
      </Button>
      <Button 
        class="btn btn-primary float-end" 
        v-if="program.id" 
        @click="deleteProgram"
      >
        Удалить
      </Button>
    </div>
  </Sidebar>
</template>

<script>
import { reactive, onMounted, ref, getCurrentInstance } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import ProgramHref from "@/components/ProgramHrefCellRenderer.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRoute, useRouter } from "vue-router";
import UserService from "@/services/user.service";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import { requiredRule } from "@/model/form/validation/rules";
import { TextInput } from "@/model/form/inputs/TextInput";
import { DateInput } from "@/model/form/inputs/DateInput";

const Program = function () {
  this.id = null;
  this.required_amount = "";
  this.program_name = "";
  this.hours = "";
  this.start_date = "";
  this.end_date = "";
};

export default {
  name: "ProgramList",
  components: {
    AgGridVue,
    ButtonCell,
    ProgramHref,
    AutoForm,
  },
  setup() {
    const gridApi = ref(null);
    const gridColumnApi = ref(null);
    const paginationPageSize = 60;
    const rowData = reactive({ value: [] });
    const quickFilterValue = ref("");
    const filters = ref(false);
    const route = useRoute();
    const router = useRouter();

    // Получаем доступ к экземпляру компонента
    const { proxy } = getCurrentInstance();

    // Функция для редактирования программы (вызывается при клике по кнопке в таблице)
    const navigateToProgram = (params) => {
      // Используем proxy для вызова метода edit из options API
      proxy.edit(params.data);
    };

    const columnDefs = reactive({
      value: [
        {
          sortable: false,
          filter: false,
          headerName: "Действия",
          headerClass: "text-center",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            onClick: navigateToProgram,
            label: "View Details",
          },
          maxWidth: 120,
          resizable: false,
        },
        { field: "required_amount", headerName: "Цена обучения", hide: true },
        {
          field: "program_name",
          headerName: "Название программы",
          cellRenderer: "ProgramHref",
        },
        { field: "hours", headerName: "Часы" },
        { field: "start_date", headerName: "Начало обучения", hide: true },
        { field: "end_date", headerName: "Конец обучения", hide: true },
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 300,
    };

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const onFilterTextBoxChanged = () => {
      gridApi.value.setQuickFilter(
        document.getElementById("filter-text-box").value
      );
    };

    const onFirstDataRendered = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
      const filterModelQuery = route.query.filterModel;
      if (filterModelQuery) {
        const filterModel = JSON.parse(filterModelQuery);
        gridApi.value.setFilterModel(filterModel);
        filters.value = true;
      }
      const quickFilterQuery = route.query.quickFilter;
      if (quickFilterQuery) {
        const quickFilter = JSON.parse(quickFilterQuery);
        gridApi.value.setQuickFilter(quickFilter);
        quickFilterValue.value = quickFilter;
        filters.value = true;
      }
    };

    const onFilterChanged = () => {
      filters.value = false;
      const savedQuickFilter = gridApi.value.getQuickFilter();
      const savedFilterModel = gridApi.value.getFilterModel();
      const queryParams = {};
      if (savedQuickFilter) {
        queryParams.quickFilter = JSON.stringify(savedQuickFilter);
        filters.value = true;
      }
      if (savedFilterModel && Object.keys(savedFilterModel).length > 0) {
        queryParams.filterModel = JSON.stringify(savedFilterModel);
        filters.value = true;
      }
      router.push({ query: queryParams });
    };

    const clearFilters = () => {
      gridApi.value.setFilterModel(null);
      gridApi.value.setQuickFilter(null);
      quickFilterValue.value = "";
      filters.value = false;
    };

    return {
      gridApi,
      gridColumnApi,
      paginationPageSize,
      rowData,
      columnDefs,
      defaultColDef,
      quickFilterValue,
      filters,
      onGridReady,
      onFilterTextBoxChanged,
      onFirstDataRendered,
      onFilterChanged,
      clearFilters,
    };
  },
  data() {
    return {
      showSidebar: false,
      program: new Program(),
      errors: {},
      scheme: null,
    };
  },
  async mounted() {
    try {
      await this.loadProgramsData();
    } catch (error) {
      console.error("Ошибка при загрузке данных программ:", error);
    }
    this.scheme = new FormScheme([
      new TextInput({
        key: "required_amount",
        label: "Стоимость обучения",
        placeholder: "Стоимость обучения",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "program_name",
        label: "Название программы",
        placeholder: "Название программы",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "hours",
        label: "Часы",
        placeholder: "Часы",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "start_date",
        label: "Начало обучения",
        dateFormat: "dd/mm/yy",
        size: "sm",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "end_date",
        label: "Конец обучения",
        dateFormat: "dd/mm/yy",
        size: "sm",
        validation: [requiredRule],
      }),
    ]);
  },
  methods: {
    async loadProgramsData() {
      try {
        const response = await UserService.getAllPrograms();
        if (Array.isArray(response.data)) {
          this.rowData.value = response.data;
        } else if (response.data && response.data.deleted_at === null) {
          this.rowData.value = [response.data];
        } else {
          this.rowData.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных программ:", error);
        this.rowData.value = [];
      }
    },
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    resetProgram() {
      this.program = new Program();
    },
    edit(event) {
      this.resetProgram();
      this.program = event.data;
      console.log(this.program);
      this.showSidebar = true;
    },
    async submit() {
      let program = { ...this.program };
      try {
        if (program.id) {
          await UserService.updateProgramById(
            program.id,
            program.required_amount,
            program.program_name,
            program.hours,
            program.start_date,
            program.end_date
          );
        } else {
          await UserService.addProgram(
            program.required_amount,
            program.program_name,
            program.hours,
            program.start_date,
            program.end_date
          );
        }
      } catch (error) {
        console.error("Ошибка при сохранении программы:", error);
      }
      this.showSidebar = false;
      this.resetProgram();
      this.loadProgramsData();
    },
    async deleteProgram() {
      let program = { ...this.program };
      try {
        await UserService.deleteProgramById(program.id);
      } catch (error) {
        console.error("Ошибка удаления программы:", error);
      }
      this.showSidebar = false;
      this.resetProgram();
      this.loadProgramsData();
    },
    openSidebar() {
      this.resetProgram();
      this.showSidebar = true;
    },
    closeSidebar() {
      this.showSidebar = false;
    },
  },
};
</script>


<style lang="scss" scoped>
.bigger {
  font-size: 30px;
  white-space: nowrap;
}
.ag-row .ag-cell {
  display: flex;
  justify-content: center; /* выравнивание по горизонтали */
  align-items: center;
}

.skeleton {
  width: 100%;
  height: 1.2em;
  background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 3.5s infinite linear;
  border-radius: 4px;
  margin: 0.2em 0;
}

.text-center * {
  justify-content: center;
  display: flex;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes skeletonFade {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 769px) {
  .list {
    padding-left: 100px;
    font-size: 10px;
    max-width: 1100px;
  }
}

@media (max-width: 1023px) {
  .list {
    padding-left: 100px;
    font-size: 13px;
  }
}

@media (min-width: 1023px) {
  .list {
    padding-left: 100px;
    padding-right: 5px;
  }
}

.nmbr {
  height: 44px;
}

.btn-primary {
  --bs-btn-bg: rgb(68,99,52);
  border: none;
  --bs-btn-hover-bg: rgb(6,215,29);
  --bs-btn-hover-border-color: rgb(6,215,29);
  --bs-btn-active-bg: rgb(68,99,52);
  --bs-btn-disabled-bg: rgb(68,99,52);
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-control:focus {
  border-color: rgba(1,20,8,0.815);
  box-shadow: inset 0 1px 1px rgba(6,215,29,0.075), 0 0 8px rgba(6,215,29,0.6);
}

.form-select:focus {
  border-color: rgba(1,20,8,0.815);
  box-shadow: inset 0 1px 1px rgba(6,215,29,0.075), 0 0 8px rgba(6,215,29,0.6);
}

.page-link {
  height: 40px;
  width: 40px;
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.active .page-link {
  background-color: rgb(68,99,52);
  border: none;
}
  
.card {
  &__form {
    margin-right: 30px;
  }
  &__image {
    margin-left: auto;
  }
}

.form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 10px;
  &__item {
    padding: 5px;
    margin-right: 10px;
  }
  &__item:nth-child(2n) {
    margin-right: 0;
    border-right: none;
  }
}

.wide-input {
  width: 500px; /* Задайте желаемую ширину */
}
</style>

<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех программ</span>
      </div>
    </div>

    <div class="row g-2 mb-2">
      <div class="col ps-0 py-0 pe-3"> 
        <input
          class="form-control"
          type="text"
          v-model="quickFilterValue"
          id="filter-text-box"
          @input="onFilterTextBoxChanged()"
          placeholder="Поиск..."
        />
      </div>
      <div class="col-auto p-0"> 
        <button
          @click="clearFilters"
          :disabled="!filters"
          class="btn btn-primary clear-filters-btn" 
          type="button"
        >
          <i class="material-icons-outlined me-1">close</i>Очистить фильтры
        </button>
      </div>
    </div>

    <div class="row g-2 mb-2">
      <div class="col-4 p-0"> 
        <button
          @click="openSidebar"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить программу
        </button>
      </div>
    </div>

    <div class="row g-2 flex-1"> 
      <div class="col-12 p-0 h-100">
        <div class="grid-container"> 
          <ag-grid-vue
            class="ag-theme-alpine"
            :columnDefs="columnDefs.value"
            :rowData="rowData.value"
            :defaultColDef="defaultColDef"
            :localeText="localeText"
            rowSelection="multiple"
            animateRows="true"
            :rowHeight="40"
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

    <Sidebar
      v-model:visible="showSidebar"
      position="bottom"
      modal
      header="Данные программы"
      class="custom-sidebar h-auto"
      :style="mainSidebarStyle"
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
      <div class="form-footer mt-3"> 
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

  </div> 
</template>

<script>
import { reactive, onMounted, ref, getCurrentInstance, computed } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import ProgramHref from "@/components/ProgramHrefCellRenderer.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRoute, useRouter } from "vue-router";
import { useProgramStore } from "@/store2/listenergroup/program";

import Program from "@/model/listener-group/program";

import { mapActions, mapState } from "pinia";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import { requiredRule } from "@/model/form/validation/rules";
import { TextInput } from "@/model/form/inputs/TextInput";
import { DateInput } from "@/model/form/inputs/DateInput";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

export default {
  name: "ProgramList",
  components: {
    AgGridVue,
    ButtonCell,
    ProgramHref,
    AutoForm,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;

    const gridApi = ref(null);
    const gridColumnApi = ref(null);
    const paginationPageSize = 60;
    const rowData = reactive({ value: [] });
    const quickFilterValue = ref("");
    const filters = ref(false);
    const route = useRoute();
    const router = useRouter();

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
          headerName: "",
          headerClass: "text-center",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            onClick: navigateToProgram,
            label: "View Details",
          },
          maxWidth: 50,
          resizable: false,
        },
        { field: "required_amount", headerName: "Цена обучения", hide: true },
        {
          field: "program_name",
          headerName: "Название программы",
        },
        { field: "hours", headerName: "Часы" },
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
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
      localeText,
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

      mainSidebarStyle: {},
      isSmallScreen: false 
    };
  },
  async mounted() {
    try {
      await this.getProgramList(),
      this.loadProgramsData();

      this.updateSidebarStyles();
      window.addEventListener('resize', this.updateSidebarStyles);
    } catch (error) {
      console.error("Ошибка при загрузке данных программ:", error);
    }
    this.scheme = new FormScheme([
      
      new TextInput({
        key: "program_name",
        label: "\nНазвание программы",
        placeholder: "Название программы",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "required_amount",
        label: "\nСтоимость обучения",
        placeholder: "Стоимость обучения",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "hours",
        label: "\nЧасы",
        placeholder: "Часы",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "start_date",
        label: "Начало обучения",
      }),
      new DateInput({
        key: "end_date",
        label: "Окончание обучения",
      }),
    ]);
  },
  beforeUnmount() {
  window.removeEventListener('resize', this.updateSidebarStyles);
},
  methods: {
    ...mapActions(useProgramStore, [
      "getProgramList",
      "postProgram",
      "putProgram",
      "deleteProgram",
    ]),
    async loadProgramsData() {
      try {
        if (Array.isArray(this.programList)) {
          this.rowData.value = this.programList
            .filter((program) => program.deleted_at === null)
        } else {
          this.rowData.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных программ:", error);
        this.rowData.value = [];
      }
    },
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
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
          await this.putProgram(program)
        } else {
          await this.postProgram(program);
        }
      } catch (error) {
        console.error("Ошибка при сохранении программы:", error);
      }
      this.showSidebar = false;
      this.resetProgram();
      await this.getProgramList(),
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

    updateSidebarStyles() {
    const minWidthValue = 820;
    const screenWidth = window.innerWidth;

    const isScreenWideEnough = screenWidth >= minWidthValue;

    this.mainSidebarStyle = {
      width: isScreenWideEnough ? '820px' : '100%', 
      minWidth: isScreenWideEnough ? `${minWidthValue}px` : 'auto', 
      maxHeight: '700px',
      height: 'auto',
      margin: isScreenWideEnough ? 'auto' : '0' 
    };
  },
  },
  computed: {
    ...mapState(useProgramStore, ["programList"]),
  },
};
</script>


<style lang="scss" scoped>

.ag-theme-alpine {
  flex: 1; 
}

.title-container {
  min-height: 25px;
  font-size: 18px;
  display: flex;
  margin-bottom: 5px;
}
.grid-container {
  height: 100%;
  width: 100%;
  display: flex;
}

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

.btn-primary,
.form-control,
.form-select {
  height: 28px;
  line-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 14px;
}

.form-control,
.form-select {
  padding-top: 0;
  padding-bottom: 0;
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

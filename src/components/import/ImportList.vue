<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <!-- Title Row -->
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Импорт учебных планов</span>
      </div>
    </div>

    <div class="row g-2 mb-2 align-items-center">
      <div class="col ps-0 py-0 pe-3">
        <input
          class="form-control"
          type="text"
          v-model="quickFilterValue"
          id="filter-text-box"
          v-on:input="onFilterTextBoxChanged()"
          placeholder="Поиск..."
        />
      </div>
      <div class="col-auto p-0">
        <button
          @click="clearFilters"
          :disabled="!filters"
          class="btn btn-primary clear-filters-btn d-flex align-items-center"
          type="button"
        >
          <i class="material-icons-outlined me-1">close</i>Очистить фильтры
        </button>
      </div>
    </div>

    <div class="row g-2 mb-2">
      <div class="col-auto p-0">
        <label class="btn btn-primary d-flex align-items-center">
          <i class="material-icons-outlined me-1">upload_file</i> Загрузить файл(ы)
          <input type="file" @change="onFileChange" multiple accept=".xlsx, .xls, .plx" class="d-none">
        </label>
      </div>
      <div class="col"></div> 
      <div class="col-auto p-0 d-flex align-items-center gap-2">
         <button @click="selectedCount === 0 ? deleteAllActiveProgramsConfirmed() : deleteSelected()" type="button"
            class="btn btn-danger btn-sm d-flex align-items-center">
            <i class="material-icons-outlined me-1">delete_sweep</i> 
            {{ selectedCount === 0 ? 'Очистить все' : 'Удалить выбранное' }} 
          </button>

          <button @click="openCompareForm" :disabled="selectedCount < 2" type="button" class="btn btn-warning btn-sm d-flex align-items-center">
            <i class="material-icons-outlined me-1">compare_arrows</i>Пересечение
          </button>

          <button @click="openDisciplinesForm" type="button" class="btn btn-info btn-sm d-flex align-items-center text-white"> <!-- Added text-white for better contrast on btn-info -->
            <i class="material-icons-outlined me-1">menu_book</i>Дисциплины
          </button>

          <button @click="openWorkloadForm" type="button" class="btn btn-success btn-sm d-flex align-items-center text-white">
            <i class="material-icons-outlined me-1">work</i>Нагрузка
          </button>

          <button @click="openArchiveForm" type="button" class="btn btn-primary btn-sm d-flex align-items-center">
            <i class="material-icons-outlined me-1">archive</i>Архив 
          </button>
      </div>
    </div>

    <div class="row g-2 mb-2" v-if="successMessage || errorMessage">
       <div class="col-12 p-0">
         <p v-if="successMessage" class="alert alert-success p-2 mb-0">{{ successMessage }}</p>
         <p v-if="errorMessage" class="alert alert-danger p-2 mb-0">{{ errorMessage }}</p>
       </div>
     </div>

    <div class="row g-2 flex-1">
      <div class="col-12 p-0 h-100">
        <div class="grid-container">
          <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 100%;"
            :columnDefs="columnDefs.value"
            :rowData="rowData.value"
            :rowHeight="40"
            :defaultColDef="defaultColDef"
            :localeText="localeText"
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
  </div>

  <!-- Sidebars remain outside the main container -->
  <Sidebar v-model:visible="showCompare" position="bottom" modal header="Пересечение учебных планов"
    class="custom-sidebar h-auto" :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }">

  <div class="row g-2 mb-2 align-items-center">
      <div class="col ps-0 py-0 pe-3">
        <input
          class="form-control"
          type="text"
          v-model="quickFilterValue"
          id="filter-text-box"
          v-on:input="onFilterTextBoxChanged()"
          placeholder="Поиск..."
        />
      </div>
      <div class="col-auto p-0">
        <button
          @click="clearFilters"
          :disabled="!filters"
          class="btn btn-primary clear-filters-btn d-flex align-items-center"
          type="button"
        >
          <i class="material-icons-outlined me-1">close</i>Очистить фильтры
        </button>
      </div>
    </div>

    <div style="height: 50vh"> <!-- Keep height for sidebar content -->
      <div class="h-100"> <!-- Removed pt-5 -->
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 100%;"
          :columnDefs="dynamicColumnDefs"
          :rowData="rowDataForComparison"
          :defaultColDef="defaultColDef"
          :localeText="localeText"
          rowSelection="multiple"
          animateRows="true"
          :rowHeight="40"
          @cell-clicked="cellWasClicked"
          @grid-ready="onGridReady"
          @firstDataRendered="onFirstDataRendered"
          :pagination="true"
          :paginationPageSize="paginationPageSize">
        </ag-grid-vue>
      </div>
    </div>
  </Sidebar>

  <Sidebar
  v-model:visible="showDisciple"
  @hide="resetDiscipleFilters"
  position="bottom"
  modal
  header="Все Дисциплины"
  class="custom-sidebar h-auto"
  :style="{ width: '80%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
>
  <div class="d-flex flex-column mb-3">
        <div class="search-container d-flex align-items-center mb-2">
            <div class="search-input-wrapper position-relative flex-grow-1">
                <i class="material-icons-outlined search-icon">search</i>
                <input class="form-control search-input" type="text"
                        v-model="detailQuickFilterValue"
                        id="detail-filter-text-box"
                        v-on:input="onDetailFilterTextBoxChanged()"
                        placeholder="Поиск"
                        style="width: 100%; padding-left: 35px;" />
            </div>
            <button @click="clearDetailFilters" :disabled="!detailFiltersActive"
                    class="btn btn-outline-secondary clear-filter-btn d-flex align-items-center ms-2" type="button">
                <i class="material-icons-outlined" style="font-size: 18px;">close</i>
                <span class="ms-1">Очистить</span>
            </button>
        </div>
        
    </div>

  
  <div class="row g-2 mb-2">
    <!-- Фильтр по семестру -->
    <div class="col-4 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="group_id">Семестр:</label>
        <select
          id="group_id"
          class="form-select"
          v-model="myValue"
          @change="handleSelectChange(myValue)"
        >
          <option value="">Нет</option>
          <option
            v-for="group in filteredGroups"
            :key="group.group_number"
            :value="group.group_number"
          >
            {{ group.group_number }}
          </option>
        </select>
      </div>
    </div>

    <!-- Фильтр по кафедре -->
    <div class="col-4 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="subgroup_id">Кафедра:</label>
        <select
          id="subgroup_id"
          class="form-select"
          v-model="myValue4"
          @change="handleSelectChange2(myValue4)"
        >
          <option value="">Нет</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>
    </div>

    <div class="col-4 p-0">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="third_filter">Направление:</label>
        <select
          id="third_filter"
          class="form-select"
          v-model="myValue2"
          @change="handleSelectChange3(myValue2)"
        >
          <option value="">Нет</option>
          <option
            v-for="program in filteredPrograms"
            :key="program.id"
            :value="program.id"
          >
            {{ program.name }}
          </option>
        </select>
      </div>
    </div>
  </div>

  <!-- остальной контент -->
  <div style="height: 50vh">
    <div class="h-100">
      <ag-grid-vue
        class="ag-theme-alpine grid-compact"
        style="width: 100%; height: 100%;"
        :columnDefs="detailColumnDefs.value"
        :rowData="filteredDiscipleDataForAllPrograms"
        :defaultColDef="defaultColDef"
        :localeText="localeText"
        rowSelection="multiple"
        animateRows="true"
        :rowHeight="35"
        @cell-clicked="cellWasClicked"
        @grid-ready="onGridReadyDetails"
        @firstDataRendered="onFirstDataRendered"
        @filter-changed="onDetailFilterChanged"
        :pagination="true"
        :paginationPageSize="paginationPageSize"
      />
    </div>
  </div>
</Sidebar>

  <Sidebar v-model:visible="showArchive" @hide="resetArchiveFilters" position="bottom" modal header="Архив" class="custom-sidebar h-auto"
    :style="{ width: '80%', maxHeight: '750px', height: 'auto', margin: 'auto' }">

    <div class="d-flex flex-column mb-3">
        <div class="search-container d-flex align-items-center mb-2">
            <div class="search-input-wrapper position-relative flex-grow-1">
                <i class="material-icons-outlined search-icon">search</i>
                <input class="form-control search-input" type="text"
                        v-model="detailQuickFilterValue"
                        id="detail-filter-text-box"
                        v-on:input="onDetailFilterTextBoxChanged()"
                        placeholder="Поиск"
                        style="width: 100%; padding-left: 35px;" />
            </div>
            <button @click="clearDetailFilters" :disabled="!detailFiltersActive"
                    class="btn btn-outline-secondary clear-filter-btn d-flex align-items-center ms-2" type="button">
                <i class="material-icons-outlined" style="font-size: 18px;">close</i>
                <span class="ms-1">Очистить</span>
            </button>
        </div>
        
    </div>

    <div class="row g-2 mb-2">

      <div class="col-4 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="group_id">Направление:</label>
        <select
          id="group_id"
          class="form-select"
          v-model="myValue"
          @change="handleSelectChange(myValue)"
        >
          <option value="">Нет</option>
          <option
            v-for="group in filteredGroups"
            :key="group.group_number"
            :value="group.group_number"
          >
            {{ group.group_number }}
          </option>
        </select>
      </div>
    </div>

    <!-- Фильтр по кафедре -->
    <div class="col-4 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="subgroup_id">Учебный год:</label>
        <select
          id="subgroup_id"
          class="form-select"
          v-model="myValue4"
          @change="handleSelectChange2(myValue4)"
        >
          <option value="">Нет</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>
    </div>

    <!-- Новый третий фильтр -->
    <div class="col-4 p-0">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="third_filter">Год актуализации:</label>
        <select
          id="third_filter"
          class="form-select"
          v-model="myValue2"
          @change="handleSelectChange3(myValue2)"
        >
          <option value="">Нет</option>
          <option
            v-for="program in filteredPrograms"
            :key="program.id"
            :value="program.id"
          >
            {{ program.name }}
          </option>
        </select>
      </div>
    </div>
    </div>

    <div style="height: 50vh"> <!-- Keep height for sidebar content -->
      <div class="h-100"> <!-- Removed pt-5 -->
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 100%;"
          :columnDefs="archiveColumnDefs.value"
          :rowData="filteredRowDataArchive"
          :defaultColDef="defaultColDef"
          :localeText="localeText"
          rowSelection="multiple"
          animateRows="true"
          :rowHeight="40"
          @cell-clicked="cellWasClicked"
          @grid-ready="onGridReady"
          @firstDataRendered="onFirstDataRendered"
          :pagination="true"
          :paginationPageSize="paginationPageSize">
        </ag-grid-vue>
      </div>
    </div>
  </Sidebar>

  <Sidebar v-model:visible="showDetails" @hide="" position="bottom" modal :header="`Направление ${selectedDisciplineCodeForTemplate}`"
    class="custom-sidebar h-auto" :style="{ width: '80%', maxHeight: '80vh', height: 'auto', margin: 'auto' }">

    <div class="d-flex flex-column mb-3">
        <div class="search-container d-flex align-items-center mb-2">
            <div class="search-input-wrapper position-relative flex-grow-1">
                <i class="material-icons-outlined search-icon">search</i>
                <input class="form-control search-input" type="text"
                        v-model="detailQuickFilterValue"
                        id="detail-filter-text-box"
                        v-on:input="onDetailFilterTextBoxChanged()"
                        placeholder="Поиск по дисциплинам..."
                        style="width: 100%; padding-left: 35px;" />
            </div>
            <button @click="clearDetailFilters" :disabled="!detailFiltersActive"
                    class="btn btn-outline-secondary clear-filter-btn d-flex align-items-center ms-2" type="button">
                <i class="material-icons-outlined" style="font-size: 18px;">close</i>
                <span class="ms-1">Очистить</span>
            </button>
        </div>
        
    </div>

    <div class="row g-2 mb-2">
      <div class="col-6 p-0 pe-3">
        <div class="form-group d-flex align-items-center">
          <label class="form-label me-3" for="group_id"
            >Семестр:</label
          >
          <select
            class="form-select"
            id="group_id"
            v-model="myValue"
            @change="handleSelectChange(myValue)"
          >
            <option selected="selected" value="">Нет</option>
            <option
              v-for="group in filteredGroups"
              :key="group.group_number"
              :value="group.group_number"
            >
              {{ group.group_number }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-6 p-0">
        <div class="form-group d-flex align-items-center">
          <label class="form-label ms-3 me-3" for="subgroup_id"
            >Кафедра:</label
          >
          <select
            class="form-select"
            id="subgroup_id"
            v-model="myValue4"
            @change="handleSelectChange2(myValue4)"
          >
            <option selected="selected" value="">Нет</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
      </div>
    </div>

    <div style="height: 50vh">
      <div class="h-100">
        <ag-grid-vue
          class="ag-theme-alpine grid-compact"
          style="width: 100%; height: 100%;"
          :columnDefs="detailColumnDefs.value"
          :rowData="detailRowData"
          :defaultColDef="defaultColDef"
          :localeText="localeText"
          rowSelection="multiple"
          animateRows="true"
          :rowHeight="35"
          @cell-clicked="cellWasClicked"
          @grid-ready="onGridReadyDetails"
          @firstDataRendered="onFirstDataRendered"
          @filter-changed="onDetailFilterChanged"
          :pagination="true"
          :paginationPageSize="paginationPageSize">
        </ag-grid-vue>
      </div>
    </div>
  </Sidebar>

  <Sidebar v-model:visible="showWorkload" position="bottom" modal header="Нагрузка" class="custom-sidebar h-auto"
    :style="{ width: '80%', maxHeight: '750px', height: 'auto', margin: 'auto' }">

    <div class="d-flex flex-column mb-3">
        <div class="search-container d-flex align-items-center mb-2">
            <div class="search-input-wrapper position-relative flex-grow-1">
                <i class="material-icons-outlined search-icon">search</i>
                <input class="form-control search-input" type="text"
                        v-model="detailQuickFilterValue"
                        id="detail-filter-text-box"
                        v-on:input="onDetailFilterTextBoxChanged()"
                        placeholder="Поиск"
                        style="width: 100%; padding-left: 35px;" />
            </div>
            <button @click="clearDetailFilters" :disabled="!detailFiltersActive"
                    class="btn btn-outline-secondary clear-filter-btn d-flex align-items-center ms-2" type="button">
                <i class="material-icons-outlined" style="font-size: 18px;">close</i>
                <span class="ms-1">Очистить</span>
            </button>
        </div>
        
    </div>

    <div class="row g-2 mb-2">
    <!-- Фильтр по семестру -->
    <div class="col-6 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="group_id">Направление:</label>
        <select
          id="group_id"
          class="form-select"
          v-model="myValue"
          @change="handleSelectChange(myValue)"
        >
          <option value="">Нет</option>
          <option
            v-for="group in filteredGroups"
            :key="group.group_number"
            :value="group.group_number"
          >
            {{ group.group_number }}
          </option>
        </select>
      </div>
    </div>

    <!-- Фильтр по кафедре -->
    <div class="col-6 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="subgroup_id">Кафедра:</label>
        <select
          id="subgroup_id"
          class="form-select"
          v-model="myValue4"
          @change="handleSelectChange2(myValue4)"
        >
          <option value="">Нет</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>
    </div>

    <!-- Новый третий фильтр -->
    <div class="col-6 p-0">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="third_filter">Год:</label>
        <select
          id="third_filter"
          class="form-select"
          v-model="myValue2"
          @change="handleSelectChange3(myValue2)"
        >
          <option value="">Нет</option>
          <option
            v-for="program in filteredPrograms"
            :key="program.id"
            :value="program.id"
          >
            {{ program.name }}
          </option>
        </select>
      </div>
    </div>
    <!-- Новый третий фильтр -->
    <div class="col-6 p-0">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="third_filter">Семестр:</label>
        <select
          id="third_filter"
          class="form-select"
          v-model="myValue2"
          @change="handleSelectChange3(myValue2)"
        >
          <option value="">Нет</option>
          <option
            v-for="program in filteredPrograms"
            :key="program.id"
            :value="program.id"
          >
            {{ program.name }}
          </option>
        </select>
      </div>
    </div>
  </div>

    <div style="height: 50vh">
      <div class="h-100">
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 100%;"
          :columnDefs="workloadColumnDefs.value"
          :rowData="filteredWorkloadData"
          :defaultColDef="defaultColDef"
          :localeText="localeText"
          rowSelection="multiple"
          animateRows="true"
          :rowHeight="40"
          @cell-clicked="cellWasClicked"
          @grid-ready="onGridReady"
          @firstDataRendered="onFirstDataRendered"
          :pagination="true"
          :paginationPageSize="paginationPageSize">
        </ag-grid-vue>
      </div>
    </div>
  </Sidebar>

</template>

<script>

import { AgGridVue } from "ag-grid-vue3";
import { computed, reactive, onMounted, ref, watch, getCurrentInstance } from "vue";
import ButtonCell from "@/components/import/ImportButtonCell.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { useRoute } from "vue-router";
import { mapState, mapActions, storeToRefs } from "pinia";
import { useUploaded_FileStore } from "@/store2/uploadedfilegroup/uploaded_file";
import { useImport_ProgramStore } from "@/store2/importgroup/import_program";
import { useImport_DiscipleStore } from "@/store2/importgroup/import_disciple";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";

import { TextInput } from "@/model/form/inputs/TextInput";
import { ComboboxInput } from "@/model/form/inputs/ComboboxInput";
import Uploaded_File from "@/model/uploaded_file-group/Uploaded_File";
import Import_Program from "@/model/import-group/Import_Program";

import Import_Disciple from "@/model/import-group/Import_Disciple";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

import * as XLSX from 'xlsx';
import Import_Program_Year from "../../model/import-group/Import_Program_Year";
import Import_Program_Code from "../../model/import-group/Import_Program_Code";
import Import_Disciple_Department from "../../model/import-group/Import_Disciple_Department";
import Import_Disciple_Semester from "../../model/import-group/Import_Disciple_Semestr";

import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8080';


function transformDisciples(discipleList) {
  const grouped = {};

  discipleList.forEach((item) => {
    const { disciple_name, program_id, hours } = item;
    if (!grouped[disciple_name]) {
      grouped[disciple_name] = {
        disciple_name,
        hoursByProgram: {}
      };
    }
    grouped[disciple_name].hoursByProgram[program_id] = hours;
  });

  // Превращаем объект grouped в массив
  return Object.values(grouped);
}

export default {
  name: 'import',
  components: {
    AgGridVue,
    ButtonCell,
    AutoForm,
  },
  setup() {

    const instance = getCurrentInstance();
    const localeText = AG_GRID_LOCALE_RU;

    const gridApi = ref(null);
    const quickFilterValue = ref('');
    const filters = ref(false); 
    const rowData = reactive({ value: []});

    const gridApiDetails = ref(null); 
    const detailQuickFilterValue = ref(''); 
    const detailFiltersActive = ref(false); 
    const detailRowData = ref({});
    const gridApiCompare = ref(null);
    const compareQuickFilterValue = ref('');

    const onGridReadyCompare = (params) => {
      console.log("Compare Grid is ready");
      gridApiCompare.value = params.api;
      // gridColumnApiCompare.value = params.columnApi; // Если необходимо
    };

    const onCompareFilterTextBoxChanged = () => {
      if (gridApiCompare.value) {
        gridApiCompare.value.setQuickFilter(compareQuickFilterValue.value);
      }
    };

    const compareFiltersActive = computed(() => {
      let agGridFiltersActive = false;
      if (gridApiCompare.value) {
        const quick = gridApiCompare.value.getQuickFilter();
        const model = gridApiCompare.value.getFilterModel();
        agGridFiltersActive = !!quick || (!!model && Object.keys(model).length > 0);
      }
      // Доступ к formValues из data() через instance.proxy
      const formFiltersActive = instance?.proxy?.formValues?.codes || instance?.proxy?.formValues?.years;
      return agGridFiltersActive || formFiltersActive || !!compareQuickFilterValue.value;
    });

    const clearCompareFilters = () => {
      if (gridApiCompare.value) {
        gridApiCompare.value.setFilterModel(null);
        gridApiCompare.value.setQuickFilter(null);
      }
      compareQuickFilterValue.value = "";
      if (instance?.proxy?.formValues) {
        instance.proxy.formValues.codes = null; // или ""
        instance.proxy.formValues.years = null; // или ""
      }
    };

    const onCompareGridFilterChangedInternal = () => {
      // Эта функция вызывается при изменении внутренних фильтров AG Grid.
      // compareFiltersActive (computed) автоматически обновит состояние кнопки.
      console.log("Compare grid AG-Grid filters changed.");
    };

    const gridColumnApi = ref();
    const gridColumnApiDetails = ref();

    const dataFromApi = ref(null);
    const dataLoaded = ref(false);

    const route = useRoute();

    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const clearFilters = () => {
      if (!gridApi.value) {
        console.warn("API основной таблицы недоступно для очистки фильтров.");
        return; 
      }

      gridApi.value.setFilterModel(null);
      gridApi.value.setQuickFilter(null);

      quickFilterValue.value = "";
      filters.value = false;
};

const onFilterChanged = () => {
  if (!gridApi.value) return; 

  const savedQuickFilter = gridApi.value.getQuickFilter();
  const savedFilterModel = gridApi.value.getFilterModel();

  filters.value = !!savedQuickFilter || (!!savedFilterModel && Object.keys(savedFilterModel).length > 0);

};

const onGridReadyDetails = (params) => {
  gridApiDetails.value = params.api;
  gridColumnApiDetails.value = params.columnApi;
};

const selectedCount = computed(() => {
      if (!Array.isArray(rowData.value)) {
        return 0;
      }
      const count = rowData.value.filter(item => item.selected === true).length;
      return count;
    });

    const lastId = computed(() => {

      const allPrograms = importProgramStore.import_programList;

      if (!allPrograms || allPrograms.length === 0) {
        return 1; 
      }

      const maxId = allPrograms.reduce((max, program) => {
         const currentId = Number(program.id) || 0;
         return currentId > max ? currentId : max;
      }, 0); 

      return maxId + 1;
    });

    
    const compareRowData = ref([]);
    const codes = reactive([]);
    const years = reactive([]);

    const selectedDisciplineCodeForTemplate = computed(() => {
        return instance?.data.selectedDisciplineCode ?? null;
    });

    const columnDefs = reactive({
      value: [
        {
          sortable: false,
          filter: false,
          headerName: '',
          headerClass: "text-center",
          cellRenderer: 'ButtonCell',
          cellRendererParams: {
            label: 'View Details',
          },
          maxWidth: 50,
          resizable: false
        },
        {
          field: "code",
          headerName: 'Код направления',
          flex: 1,
        },
        {
          field: "qualification",
          headerName: 'Квалификация',
          flex: 1,
        },
        {
          field: "profile",
          headerName: 'Профиль',
          flex: 3,
        },
        {
          field: "current_course",
          headerName: 'Курс',
          flex: 1,
        },
        {
          field: "years",
          headerName: 'Учебный год',
          flex: 1,
        },
        {
          headerName: '',
          field: "selected",
          flex: 0.5,
          cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
          cellRenderer: (params) => {
            const isSelected = params.value || false;

            const container = document.createElement('div');
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.style.cursor = 'pointer';
            container.style.fontSize = '20px'; 
            container.style.color = isSelected ? 'green' : 'gray';

            container.innerHTML = isSelected ? '✔' : '';

            container.addEventListener('click', () => {
              const newValue = !isSelected; 
              params.node.setDataValue('selected', newValue);

              container.innerHTML = newValue ? '✔' : '';
              container.style.color = newValue ? 'green' : 'gray';

            });

            return container;
          },
        }
      ],
    });

    const archiveColumnDefs = reactive({
      value: [
        {
          sortable: false,
          filter: false,
          headerName: '',
          headerClass: "text-center",
          cellRenderer: 'ButtonCell',
          cellRendererParams: {
            label: 'View Details',
          },
          maxWidth: 50,
          resizable: false
        },
        {
          field: "code",
          headerName: 'Код направления',
          maxWidth: 180,
        },
        {
          field: "profile",
          headerName: 'Профиль',
          minWidth: 400,
        },
        {
          field: "years",
          headerName: 'Учебный год',
          maxWidth: 150,
        },
        {
          field: "start_year",
          headerName: 'Год начала обучения',
          maxWidth: 150,
        },
        {
          field: "actualization_year",
          headerName: 'Год актуализации',
          maxWidth: 150,
        },
    
      ],
    });

    const detailColumnDefs = reactive({
      value: [
        {
          field: "disciple_name",
          headerName: 'Наименование',
          flex: 3,
          minWidth: 250,
        },
                {
          field: "semester",
          headerName: 'Семестр',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 80,
          flex: 1,
        },
        {
          field: "hours",
          headerName: 'Всего',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 90, 
          flex: 1, 
        },
        {
          field: "contact_hours",
          headerName: 'Контакт.',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 80, // Предпочтительная ширина
          flex: 1,
        },
        {
          field: "lecture_hours",
          headerName: 'Лек',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 60, // Меньшая ширина
          flex: 0.8, // Меньший flex
        },
        {
          field: "lab_hours",
          headerName: 'Лаб',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 60,
          flex: 0.8,
        },
        {
          field: "practice_hours",
          headerName: 'Пр',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 60,
          flex: 0.8,
        },
        {
          field: "ksr_hours",
          headerName: 'КСР',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 60,
          flex: 0.8,
        },
        {
          field: "ikr_hours",
          headerName: 'ИКР',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 60,
          flex: 0.8,
        },
        {
          field: "independent_study_hours",
          headerName: 'СР',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 60,
          flex: 0.8,
        },
        {
          field: "control_hours",
          headerName: 'Контроль',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 80,
          flex: 1,
        },
      ],
    });

    const compareColumnDefs = reactive({
      value: [
        {
          field: "index_code",
          headerName: 'Индекс',
          maxWidth: 200
        },
        {
          field: "disciple_name",
          headerName: 'Наименование',
          minWidth: 500,
        },
        {
          field: "hours",
          headerName: 'Всего часов',
          maxWidth: 200,
        },
        {
          field: "contact_hours",
          headerName: 'Кон Такт.',
        },
        {
          field: "lecture_hours",
          headerName: 'Лек',
        },
        {
          field: "lab_hours",
          headerName: 'Лаб',
        },
        {
          field: "practice_hours",
          headerName: 'Пр',
        },
        {
          field: "ksr_hours",
          headerName: 'КСР',
        },
        {
          field: "ikr_hours",
          headerName: 'ИКР',
        },
        {
          field: "sr_hours",
          headerName: 'СР',
        },
        {
          field: "control_type",
          headerName: 'Контроль',
        },
        {
          field: "z_e",
          headerName: 'з.е',
        },
        {
          field: "weeks",
          headerName: 'Недель',
        },
      ],
    });

    const columnDefs2 = reactive({
      value: [
        {
          field: "index_code",
          headerName: 'Год',
          maxWidth: 200
        },
        {
          field: "direction_name",
          headerName: 'Лекции',
          minWidth: 500,
        },
        {
          field: "qualification",
          headerName: 'Бюджет',
          maxWidth: 200,
        },
        {
          field: "academic_year",
          headerName: 'Учебный год',
        },
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      headerClass: 'wrap-header-text',
      cellStyle: {
        'white-space': 'nowrap',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
      }
    };

    const importProgramStore = useImport_ProgramStore();
    const importDiscipleStore = useImport_DiscipleStore();

    const { import_programList } = storeToRefs(importProgramStore);
    const { import_discipleList } = storeToRefs(importDiscipleStore);

    const rowDataForComparison = computed(() => {
  console.log("[Computed] Пересчет rowDataForComparison");

  const selectedProgramIds = (rowData.value || []) 
                              .filter(program => program.selected === true)
                              .map(program => program.id); 

  console.log(`[Computed] rowDataForComparison: ID выбранных программ:`, selectedProgramIds);

  if (selectedProgramIds.length < 2) {
      console.log("[Computed] rowDataForComparison: Менее 2 программ выбрано, возвращаем пустой массив.");
      return [];
  }

  const allDisciples = importDiscipleStore.import_discipleList || [];
  console.log(`[Computed] rowDataForComparison: Всего дисциплин в store: ${allDisciples.length}`);

  const relevantDisciples = allDisciples.filter(disciple =>
    disciple.program_id !== undefined && selectedProgramIds.includes(disciple.program_id)
  );
  console.log(`[Computed] rowDataForComparison: Дисциплин, относящихся к выбранным программам: ${relevantDisciples.length}`);

  const transformedData = transformDisciples(relevantDisciples);
  console.log("[Computed] rowDataForComparison: Трансформированные данные для таблицы:", transformedData);

  return transformedData;
});

    onMounted(async () => {
    });

    const programsOptions = computed(() => {
      return importProgramStore.import_program_codesList.map(item => {
        return {
          label: item.codes,
          value: item.codes
        };
      });
    });
    const yearsOptions = computed(() => {
      return importProgramStore.import_program_yearsList.map(item => {
        return {
          label: item.years,
          value: item.years 
        };
      });
    });

    const timeYearsOptions = [
  { label: 2020, value: 2020 },
  { label: 2021, value: 2021 },
  { label: 2022, value: 2022 },
  { label: 2023, value: 2023 },
  { label: 2024, value: 2024 },
  { label: 2025, value: 2025 }
];


    const semestresOptions = computed(() => {
       console.log('[LOG] Calculating semestresOptions. Source:', importDiscipleStore.import_disciple_semestresList);
       const options = importDiscipleStore.import_disciple_semestresList.map(item => {
         return {
           label: item.semester,
           value: item.semester
         };
       });
       console.log('[LOG] Generated semestresOptions:', options);
       return [{ label: "Не выбрано", value: null }, ...options];
     });
    const departmentsOptions = computed(() => {
      console.log('[LOG] Calculating departments. Source:', importDiscipleStore.import_disciple_departmentsList);
      return importDiscipleStore.import_disciple_departmentsList.map(item => {
        return {
          label: item.department,
          value: item.department
        };
      });
    });

    const onFilterTextBoxChanged = () => {
      console.log('MAIN filter input changed:', quickFilterValue.value);
      if (!gridApi.value) {
         console.warn("API основной таблицы не готово для фильтрации.");
         return;
      }
      gridApi.value.setQuickFilter(quickFilterValue.value);

      filters.value = !!quickFilterValue.value;
      console.log('Filters state set by input:', filters.value);
    };

    const onDetailFilterTextBoxChanged = () => {
  console.log('DETAIL filter input changed:', detailQuickFilterValue.value);
  if (!gridApiDetails.value) {
     console.warn("API таблицы деталей не готово для фильтрации (onDetailFilterTextBoxChanged).");
     return;
  }
  gridApiDetails.value.setQuickFilter(detailQuickFilterValue.value);
  // Немедленное обновление состояния кнопки
  detailFiltersActive.value = !!detailQuickFilterValue.value;
  console.log('DETAIL Filters state set by input:', detailFiltersActive.value);
};

const clearDetailFilters = () => {
  console.log('DETAIL clearDetailFilters called');
  if (!gridApiDetails.value) {
     console.warn("API таблицы деталей не готово для очистки фильтра (clearDetailFilters).");
     return;
  }
  gridApiDetails.value.setQuickFilter(null);
  detailQuickFilterValue.value = ''; 
  detailFiltersActive.value = false;
};

 const onDetailFilterChanged = () => {
    console.log('DETAIL grid filter changed event');
    if (!gridApiDetails.value) return; 

    const savedQuickFilter = gridApiDetails.value.getQuickFilter();
    const savedFilterModel = gridApiDetails.value.getFilterModel(); 

    detailFiltersActive.value = !!savedQuickFilter || (!!savedFilterModel && Object.keys(savedFilterModel).length > 0);
    console.log('DETAIL filters active state (event):', detailFiltersActive.value);
 };

    const dynamicColumnDefs = computed(() => {
      const columns = [
    {
      headerName: 'Дисциплина',
      field: 'disciple_name',
      pinned: 'left', // Закрепляем слева
      lockPinned: true,
      width: 300,     // Можно сделать пошире
      resizable: true,
      sortable: true,
      filter: true,   // Добавим фильтр по названию
    }
  ];

  const selectedPrograms = (rowData.value || []) // Используем rowData.value
                            .filter(program => program.selected === true);

  console.log(`[Computed] dynamicColumnDefs: Найдено выбранных программ: ${selectedPrograms.length}`);


      selectedPrograms.forEach(program => {
    if (program && program.id !== undefined && program.code !== undefined) {
        columns.push({
          headerName: `${program.code} (${program.profile ? program.profile.substring(0,15)+'...' : 'Профиль N/A'})`,
          colId: `program_${program.id}`,
          valueGetter: (params) => {

            return params.data?.hoursByProgram?.[program.id] ?? 0; 
          },
          width: 120,              
          type: 'numericColumn',   
          filter: 'agNumberColumnFilter', 
          resizable: true,
          sortable: true,          
        });
    } else {
        console.warn("[Computed] dynamicColumnDefs: Пропуск программы из-за отсутствия id/code:", program);
    }
      });

      console.log("[Computed] dynamicColumnDefs: Итоговое количество колонок:", columns.length);
      return columns;
    });

    const isLoading = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');

    const archiveFormValues = reactive({
    codes: null,
    academic_year: null, 
    start_year: null,   
    actualization_year: null //
    });
    const discipleFormValues = reactive({
        codes: null,
        semestres: null,
        departments: null,
    });

    const selectedDisciplineCode = ref(null); // Для заголовка
    const selectedProgramId = ref(null);      // ID для фильтрации деталей <--- ВАЖНО!


     const editFunction = (event) => {
      if (instance.proxy.resetUpd) { // Check if method exists on proxy
          instance.proxy.resetUpd();
      }
      // selectedDisciplineCode is in data(), access via instance.data or instance.proxy
      instance.data.selectedDisciplineCode = event.data.code;
      selectedProgramId.value = event.data.id; // This is already a ref
      console.log(`Установлен selectedProgramId (from setup): ${selectedProgramId.value}`);
      if (instance.proxy.openDetailsForm) {
          instance.proxy.openDetailsForm();
      }
    };

    const cellWasClicked = (event) => {
      // Check if the click was on the button cell (empty headerName)
      if (event.colDef && event.colDef.headerName === "") {
        editFunction(event);
      }
    };

    const onFirstDataRendered = (params) => {
      // The gridApi from onGridReady should be the one for the main grid.
      // This function is bound to multiple grids.
      // If this logic is only for the main grid, we might need a condition.
      // For now, let's assume it could apply to any grid that has these query params.

      const currentGridApi = params.api; // Use the API of the grid that triggered the event

      const filterModelQuery = route.query.filterModel;
      if (filterModelQuery) {
        try {
          const filterModel = JSON.parse(filterModelQuery);
          currentGridApi.setFilterModel(filterModel);
          // If this is the main grid, update its specific filters state
          if (currentGridApi === gridApi.value) {
            filters.value = true;
          }
        } catch (e) {
          console.error("Error parsing filterModel from query:", e);
        }
      }

      const quickFilterQuery = route.query.quickFilter;
      if (quickFilterQuery) {
        try {
          // The quickFilter is usually a string, not JSON, but your code had JSON.parse
          // If it's just a string: const quickFilter = quickFilterQuery;
          const quickFilter = JSON.parse(quickFilterQuery); // Assuming it's a JSON string
          currentGridApi.setQuickFilter(quickFilter);
          // If this is the main grid, update its specific quickFilterValue
          if (currentGridApi === gridApi.value) {
            quickFilterValue.value = quickFilter;
            filters.value = true;
          }
        } catch (e) {
          console.error("Error parsing quickFilter from query:", e);
           // Fallback if it's not JSON
          // currentGridApi.setQuickFilter(quickFilterQuery);
          // if (currentGridApi === gridApi.value) {
          //   quickFilterValue.value = quickFilterQuery;
          //   filters.value = true;
          // }
        }
      }
    };

const filteredRowDataArchive = computed(() => {
  const programs = import_programList.value || []; // Используем .value
  const filters = archiveFormValues; // Используем новые значения формы

  // Проверяем, есть ли хоть один активный фильтр
  if (!filters.codes && !filters.academic_year && !filters.start_year && !filters.actualization_year) {
      return programs; // Нет фильтров - возвращаем все программы
  }

  return programs.filter(program => {
    // Условия фильтрации, использующие КЛЮЧИ из archiveFormValues
    const codeMatch = !filters.codes || String(program.code) === String(filters.codes);
    const academicYearMatch = !filters.academic_year || String(program.years) === String(filters.academic_year); // Предполагаем, что 'years' - поле в program
    const startYearMatch = !filters.start_year || String(program.start_year) === String(filters.start_year); // Поле Год начала
    const actualizationYearMatch = !filters.actualization_year || String(program.actualization_year) === String(filters.actualization_year); // Поле Год актуализации

    return codeMatch && academicYearMatch && startYearMatch && actualizationYearMatch;
  });
});

const filteredDiscipleDataForAllPrograms = computed(() => {
  const disciples = import_discipleList.value || []; // Используем .value
  const programs = import_programList.value || [];   // Нужны для поиска ID по коду
  const filters = discipleFormValues; // Используем фильтры этого сайдбара

  // Ищем ID программы по выбранному коду (если выбран)
  let targetProgramId = null;
  if (filters.codes) {
      const selectedProgram = programs.find(p => String(p.code) === String(filters.codes));
      if (selectedProgram) {
          targetProgramId = selectedProgram.id;
      } else {
          return []; // Код выбран, но программа не найдена -> пусто
      }
  }

  if (!targetProgramId && !filters.semestres && !filters.departments) {
      return disciples; // Возвращаем все дисциплины
  }

  return disciples.filter(disciple => {
      // Проверяем совпадение по ID программы (если код был выбран), семестру и кафедре
      const programMatch = !targetProgramId || disciple.program_id === targetProgramId;
      const semesterMatch = !filters.semestres || String(disciple.semester) === String(filters.semestres);
      const departmentMatch = !filters.departments || String(disciple.department) === String(filters.departments);

      return programMatch && semesterMatch && departmentMatch;
  });
});

const resetArchiveFilters = () => {
    Object.keys(archiveFormValues).forEach(key => archiveFormValues[key] = null);
    console.log("Archive filters reset");
};
const resetDiscipleFilters = () => {
    Object.keys(discipleFormValues).forEach(key => discipleFormValues[key] = null);
     console.log("Disciple filters reset");
};

const workloadFormValues = reactive({
  codes: null,
  academic_year: null,
  department: null,
});

watch(
  () => workloadFormValues.department,
  (newValue, oldValue) => {
    console.log("[ИЗМЕНЕНИЕ ФИЛЬТРА] Кафедра изменена:");
    console.log("  Новое значение workloadFormValues.department:", newValue);
    console.log("  Старое значение:", oldValue);
    // console.log("  Текущее filteredWorkloadData:", filteredWorkloadData.value);
  },
  { deep: true } // Можно использовать deep, если workloadFormValues - сложный объект,
                 // но для простого свойства department это не обязательно.
);

const workloadColumnDefs = reactive({
  value: [
    {
      field: "disciple_name",
      headerName: 'Дисциплина',
      flex: 3,
      minWidth: 250,
    },
    {
      headerName: 'Код направления',
      // field: "department", // Incorrect, department is a property of disciple
      valueGetter: (params) => {
        if (!params.data || params.data.program_id === undefined) return null;
        // Assuming import_programList is accessible in this scope (e.g., from Pinia store)
        // and has been fetched.
        const program = import_programList.value.find(p => p.id === params.data.program_id);
        return program ? program.code : 'N/A';
      },
      flex: 2,
      minWidth: 150,
    },
    {
          field: "semester",
          headerName: 'Семестр',
          type: 'numericColumn',
          filter: 'agNumberColumnFilter',
          width: 80,
          flex: 1,
        },
    {
      field: "lecture_hours",
      headerName: 'Лекции',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 100,
      flex: 1,
    },
    {
      field: "practice_hours",
      headerName: 'Практики',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 100,
      flex: 1,
    },
    {
      field: "lab_hours",
      headerName: 'Лабораторные',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 120,
      flex: 1,
    },
    {
      field: "hours", // This usually means total hours for the discipline itself
      headerName: 'Всего часов', // Clarified header
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 120,
      flex: 1,
    },
    // If you need a sum of lecture, practice, lab for workload, that would be a valueGetter
    // Example:
    // {
    //   headerName: 'Всего аудиторных',
    //   valueGetter: (params) => {
    //     if (!params.data) return 0;
    //     return (params.data.lecture_hours || 0) + 
    //            (params.data.practice_hours || 0) + 
    //            (params.data.lab_hours || 0);
    //   },
    //   type: 'numericColumn',
    //   width: 130,
    //   flex: 1,
    // }
  ],
});

const filteredWorkloadData = computed(() => {
  const disciples = import_discipleList.value || []; // Все дисциплины из стора
  const filters = workloadFormValues; // Текущие значения фильтров, включая filters.department

  // console.log('[WORKLOAD] Current filters:', filters);
  // console.log('[WORKLOAD] Selected department:', filters.department);
  // console.log('[WORKLOAD] Total disciples before filtering:', disciples.length);

  // Если ни один фильтр не активен (включая department), показываем все
  if (!filters.codes && !filters.academic_year && !filters.department) {
    // console.log('[WORKLOAD] No filters applied, returning all disciples');
    return disciples;
  }

  const filtered = disciples.filter(disciple => {
    const program = import_programList.value?.find(p => p.id === disciple.program_id);
    const codeMatch = !filters.codes || (program && program.code === filters.codes);

    // Фильтр по учебному году (если есть)
    const yearMatch = !filters.academic_year || (program && program.years === filters.academic_year);

    // ФИЛЬТР ПО КАФЕДРЕ
    const departmentMatch = !filters.department || disciple.department === filters.department;
    // ^^^^ ЭТА СТРОКА КЛЮЧЕВАЯ ^^^^
    // Если filters.department не задан (null), то !filters.department будет true,
    // и условие departmentMatch будет истинным для любой дисциплины.
    // Если filters.department задан, то будет проверяться точное совпадение
    // disciple.department с выбранным значением.

    // ... (логи для отладки, если нужны) ...

    // Дисциплина проходит, если все активные фильтры совпали
    return codeMatch && yearMatch && departmentMatch;
  });

  // console.log('[WORKLOAD] Filtered disciples count:', filtered.length);
  return filtered;
});

    return {

      onGridReady,
      columnDefs,
      archiveColumnDefs,
      detailColumnDefs,
      compareColumnDefs,
      columnDefs2,
      rowData,
      selectedCount,
      lastId,
      detailRowData,
      compareRowData,
      rowDataForComparison,
      dynamicColumnDefs,
      years,
      codes,
      yearsOptions,
      timeYearsOptions,
      programsOptions,
      semestresOptions,
      departmentsOptions,
      defaultColDef,
      localeText,

      deselectRows: () => {
        gridApi.value.deselectAll()
      },

      quickFilterValue,      
      onFilterTextBoxChanged,
      clearFilters,          
      filters,               
      onFilterChanged, 
      onFilterTextBoxChanged,

      onGridReadyDetails, 
      detailRowData, 
      archiveColumnDefs,
      detailColumnDefs,
      detailQuickFilterValue,     
      detailFiltersActive,         
      onDetailFilterTextBoxChanged,
      clearDetailFilters,          
      onDetailFilterChanged,            

      compareQuickFilterValue,
      compareFiltersActive,
      onGridReadyCompare,
      onCompareFilterTextBoxChanged,
      clearCompareFilters,
      onCompareGridFilterChangedInternal,
      
      formValues: instance?.proxy?.formValues,

      programsOptions, 
      yearsOptions,    
      localeText,
      defaultColDef,
      dynamicColumnDefs,
      rowDataForComparison,
      cellWasClicked, 
      onFirstDataRendered, 
      paginationPageSize,

      selectedDisciplineCodeForTemplate,
      paginationPageSize,
      dataFromApi,
      dataLoaded,
      isLoading,
      successMessage,
      errorMessage,

      archiveFormValues,
      discipleFormValues ,
      filteredRowDataArchive,
      filteredDiscipleDataForAllPrograms,
      resetArchiveFilters,
      resetDiscipleFilters,
      workloadFormValues,
      workloadColumnDefs,
      filteredWorkloadData,
    };

  },

  data() {
    return {
      showCompare: false,
      showArchive: false,
      showDisciple: false,
      showDetails: false,
      showWorkload: false,
      selectedYear: null,
      selectedDisciplineCode: null,
      firstScheme: null,
      archiveScheme: null,
      discipleScheme: null,
      workloadScheme: null,
      uploaded_file: new Uploaded_File(),
      import_program: new Import_Program(),
      import_program_year: new Import_Program_Year(),
      import_disciple_department: new Import_Disciple_Department(),
      import_disciple_semester: new Import_Disciple_Semester(),
      import_program_code: new Import_Program_Code(),
      import_disciple: new Import_Disciple(),
      errors: {},

      selectedCourse: '',
      selectedProgramFilter: null,
      filteredRowData1: [],

      formValues: {
        codes: null, 
        years: null, 
      },

      detailFilter: {
      semestres: null,
      departments: null,
      },
      detailErrors: {},      // если AutoForm возвращает ошибки
      gridApiDetails: null,  // API грида деталей

      isLoading: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  async mounted() {
    try {
      await this.fetchInitialData()

      this.loadImportPrograms();
      this.loadImportDisciples();

      this.workloadScheme = new FormScheme([
        new ComboboxInput({
          key: "department",
          label: "Кафедра",
          placeholder: "Выберите кафедру",
          options: this.departmentsOptions,
        }),
        new ComboboxInput({
          key: "codes",
          label: "Направление",
          placeholder: "Выберите программу",
          options: this.programsOptions,
        }),
        new ComboboxInput({
          key: "codes",
          label: "Семестр",
          placeholder: "Выберите программу",
          options: this.programsOptions,
        }),
        new ComboboxInput({
          key: "academic_year",
          label: "Учебный год",
          placeholder: "Выберите год",
          options: this.yearsOptions,
        }),
        
      ]);

    } catch (error) {
      console.error("Ошибка при загрузке данных слушателей:", error);
    }

    this.firstScheme = new FormScheme([
      new TextInput({
        key: "direction_code",
        label: "Фамилия",
        placeholder: "Фамилия",
        disabled: true,  // Поле будет неактивным для редактирования
      }),
    ])

    

    this.archiveScheme = new FormScheme([
  new ComboboxInput({
    key: "codes", // Оставляем как есть
    label: "Программа",
    placeholder: "Выберите программу",
    options: this.programsOptions,
  }),
  new ComboboxInput({
    key: "academic_year", // <-- Уникальный ключ для учебного года
    label: "Учебный год",
    placeholder: "Выберите год",
    options: this.yearsOptions,
  }),
  new ComboboxInput({
    key: "actualization_year", // <-- Уникальный ключ для года актуализации
    label: "Год актуализации",
    placeholder: "Выберите год",
    options: this.timeYearsOptions, // Используем общие опции годов
  }),
]);

this.compareFormScheme = new FormScheme([
  new ComboboxInput({
    key: "codes",
    label: "Программа (Код)",
    placeholder: "Выберите код программы",
    options: this.programsOptions,
  }),
  new ComboboxInput({
    key: "years",
    label: "Учебный год",
    placeholder: "Выберите учебный год",
    options: this.yearsOptions,
  }),
]);

      this.discipleScheme = new FormScheme([
      new ComboboxInput({
        key: "codes",
        label: "Программа",
        placeholder: "Выберите программу",
        options: this.programsOptions,
      }),
      new ComboboxInput({
        key: "semestres",
        label: "Семестр",
        placeholder: "Выберите семестр",
        options: this.semestresOptions,
      }),
      new ComboboxInput({
        key: "departments",
        label: "Кафедра",
        placeholder: "Выберите кафедру",
        options: this.departmentsOptions,
      }),

    ])
  },

  methods: {
    ...mapActions(useUploaded_FileStore, [
      "putUploaded_File",
      "deleteUploaded_File",
    ]),
    ...mapActions(useImport_ProgramStore, [
      "getImport_ProgramList",
      "getImport_ProgramYearsList",
      "getImport_ProgramCodesList",
      "postImport_Program",
      "putImport_Program",
      "deleteImport_Program",
    ]),
    ...mapActions(useImport_DiscipleStore, [
      "getImport_DiscipleList",
      "getImport_DiscipleDepartmentsList",
      "getImport_DiscipleSemestresList",
      "postImport_Disciple",
      "putImport_Disciple",
      "deleteImport_Disciple",
    ]),
    
    resetUpd() {
      this.uploaded_file = new Uploaded_File();
    },
    edit(event) {
      this.resetUpd();
      this.selectedDisciplineCode = event.data.code;
  this.selectedProgramId = event.data.id;       
  console.log(`Установлен selectedProgramId: ${this.selectedProgramId}`); 
  this.openDetailsForm();
    },

async onFileChange2(event) {

  const successMessage = ref('')
  const errorMessage   = ref('')
  const isLoading      = ref(false)

  console.log("MEOW!");
  
  const files = Array.from(event.target.files)
  if (!files.length) return

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value   = ''

  for (const file of files) {
    try {
      const { data } = await axios.get('/api/upload/pre-signed', {
        params: { fileName: file.name }
      })
      console.log('PRE-SIGNED response:', data)

      const uploadUrl = data.url

      // 2️⃣ PUT-файл в Yandex S3
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': 'application/octet-stream' }
      })

      console.log(`✔ ${file.name} загружен`)
      // 3️⃣ Сбор статистики
      successMessage.value += `${file.name} `;
      
      // 4️⃣ (опц.) сообщить бэкенду, что можно парсить
      // await axios.post('/api/upload/trigger-processing', { fileUrl: uploadUrl })

    } catch (err) {
      console.error(`❌ Ошибка загрузки ${file.name}:`, err)
      errorMessage.value += `${file.name} `
    }
  }

  isLoading.value = false
},


    async onFileChange(event) {
      const files = event.target.files;
      const programsData = [];

      const readFile = (file) => {
        console.log(`Прочитали файл: ${file.name}`);
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: "array" });

              const sheetName = "Титул";
              const sheet = workbook.Sheets[sheetName];
              if (!sheet) {
                throw new Error(`Лист "${sheetName}" не найден`);
              }

              let extractedData = {
                program_name: "Не найден",
                code: "Не найден",
                profile: "Не найден",
                years: "Не найден",
                qualification:"Не найден",
                start_year:"Не найден",
                current_course:"Не найден",
              };

              const rawProgramName = sheet["D29"] ? sheet["D29"].v : null;
              extractedData.program_name = rawProgramName
                ? rawProgramName
                    .replace(/[\r\n]+/g, " ")                      
                    .replace(/^Направление подготовки\s*\d+\.\d+\.\d+\s*/i, "") 
                    .trim()
                : null;
              extractedData.code = sheet["D27"] ? sheet["D27"].v : null;
              extractedData.profile = sheet["D30"] ? sheet["D30"].v : null;
              
              const rawQualification = sheet["C40"] ? sheet["C40"].v : null;
              extractedData.qualification = rawQualification
              ? rawQualification
                  .replace(/[\r\n]+/g, " ")
                  .replace(/^Квалификация:?\s*/i, "") 
                  .trim()
              : null;

              extractedData.years = sheet["W41"] ? sheet["W41"].v : null;
              extractedData.start_year = sheet["W40"] ? sheet["W40"].v : null;

              if (extractedData.start_year && extractedData.years) {
                  const startYear = parseInt(extractedData.start_year, 10);
                  const yearStartStr = extractedData.years.split("-")[0];
                  const yearStart = parseInt(yearStartStr, 10);

                  const course = yearStart - startYear + 1;
                  extractedData.current_course = course > 0 ? course : null;
              } else {
                  extractedData.current_course = null;
              }

              console.log(extractedData);
              await this.postImport_Program(extractedData);
              await this.getImport_ProgramList(); 

              const courseSheets = ["Курс 4"];
              const allDisciplePromises = [];

              for (const courseSheetName of courseSheets) {
                const courseSheet = workbook.Sheets[courseSheetName];
                if (courseSheet) {

                  const getCellValue = (sheet, address) => {
                    const cell = sheet[address];

                    return cell?.v ?? null;
                  };

                  const getCellNumber = (sheet, address) => {
                    const cell = sheet[address];
                    const value = cell?.v;
                    if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
                      return parseInt(Number(value), 10);
                    }
                    return null;
                  };

                  const getCellString = (sheet, address) => {
                    const cell = sheet[address];
                    const value = cell?.w ?? cell?.v;
                    if (value !== null && value !== undefined) {
                      return String(value).trim();
                    }
                    return null;
                  };

                  for (let row = 17; row <= 105; row++) {

                    const discipleName = getCellString(courseSheet, `E${row}`);
                    const departmentValue = getCellString(courseSheet, `AS${row}`);

                    const rawSemester = getCellNumber(courseSheet, `AT${row}`);
                    let validatedSemester = null;
                    if (typeof rawSemester === 'number' && Number.isInteger(rawSemester) && rawSemester >= 0 && rawSemester <= 9) {
                      validatedSemester = rawSemester;
                    }

                    if (discipleName && departmentValue && validatedSemester) {
                      const import_disciple = {
                        program_id: this.lastId-1,
                        disciple_name: discipleName,

                        hours: getCellNumber(courseSheet, `AG${row}`) ?? 0,
                        contact_hours: getCellNumber(courseSheet, `AH${row}`) ?? 0,
                        lecture_hours: getCellNumber(courseSheet, `AI${row}`) ?? 0,
                        lab_hours: getCellNumber(courseSheet, `AJ${row}`) ?? 0,
                        practice_hours: getCellNumber(courseSheet, `AK${row}`) ?? 0,
                        ksr_hours: getCellNumber(courseSheet, `AL${row}`) ?? 0,
                        ikr_hours: getCellNumber(courseSheet, `AM${row}`) ?? 0,
                        independent_study_hours: getCellNumber(courseSheet, `AN${row}`) ?? 0,
                        control_hours: getCellNumber(courseSheet, `AO${row}`) ?? 0,

                        department: departmentValue,
                        semester: validatedSemester
                      };

                      //allDisciplePromises.push(this.postImport_Disciple(import_disciple));
                    }
                  }
                } else {
                  console.warn(`Лист ${courseSheetName} не найден.`);
                }
              }

              if (allDisciplePromises.length > 0) {
            console.log(`Запускаем параллельное добавление ${allDisciplePromises.length} дисциплин...`);

            await Promise.all(allDisciplePromises);

            console.log("Все дисциплины успешно добавлены.");
        } else {
            console.log("Дисциплины для добавления не найдены.");
        }

        this.loadImportPrograms();
        this.loadImportDisciples();

        resolve(extractedData); 


            } catch (error) {
              console.error(`Ошибка при обработке файла ${file.name}:`, error);
              reject(error);
            }
          };
          reader.onerror = (error) => {
            console.error(`Ошибка при чтении файла ${file.name}:`, error);
            reject(error);
          };
          reader.readAsArrayBuffer(file);
        });
      };

      const readPLXFile = (file) => {
        console.log(`Обрабатываем .plx файл: ${file.name}`);
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const textContent = e.target.result;

              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(textContent, "text/xml");

              let extractedData = {
                program_name: "Не найден",
                code: "Не найден",
                profile: "Не найден",
                years: "Не найден",
                qualification:"Не найден",
                start_year:"Не найден",
                current_course:"Не найден",
              };

              const allElements = xmlDoc.getElementsByTagName("*");
              let profileValues = [];

              for (let i = 0; i < allElements.length; i++) {
                let element = allElements[i];

                if (extractedData.code === "Не найден" && element.hasAttribute("Шифр")) {
                  extractedData.code = element.getAttribute("Шифр");
                }
                if (element.hasAttribute("Название")) {
                  profileValues.push(element.getAttribute("Название"));
                }
                if (element.hasAttribute("УчебныйГод")) {
                  extractedData.years = element.getAttribute("УчебныйГод");
                }
                if (
                  extractedData.code !== "Не найден" &&
                  profileValues.length > 1 &&
                  extractedData.years !== "Не найден"
                ) {
                  break;
                }
              }

              if (profileValues.length > 1) {
                extractedData.profile = profileValues[1];
              }

              console.log(extractedData);
              //await this.postImport_Program(extractedData);
              await this.getImport_ProgramList();
              this.loadImportPrograms();

              const planRows = xmlDoc.getElementsByTagName("ПланыСтроки");
              const disciplines = [];

              for (let i = 0; i < planRows.length; i++) {
                const disciplineName = planRows[i].getAttribute("Дисциплина");
                if (disciplineName) {
                  const import_disciple = {
                    program_id: this.lastId,
                    disciple_name: disciplineName,
                    //hours: hoursCell.v,        // Значение ячейки E
                  };

                  //await this.postImport_Disciple(import_disciple);
                }
              }

              console.log("Список дисциплин:", disciplines);

              

              resolve(extractedData);
            } catch (error) {
              console.error(`Ошибка при обработке .plx файла ${file.name}:`, error);
              reject(error);
            }
          };

          reader.onerror = (error) => {
            console.error(`Ошибка при чтении .plx файла ${file.name}:`, error);
            reject(error);
          };

          reader.readAsText(file, "UTF-16");
        });
      };

      try {
        for (const file of files) {
          let programData;
          if (file.name.endsWith(".plx")) {
            programData = await readPLXFile(file);
          } else {
            programData = await readFile(file);
          }
          programsData.push(programData);
        }

        console.log(programsData);

        // После фикса сервера
        //await this.postImport_Program(programsData);
        //await this.getImport_ProgramList();
        //this.loadImportPrograms();

      } catch (error) {
        console.error("Ошибка при загрузке файлов:", error);
      }
    },


    // КОНЕЦ ПАРСИНГА 

    async loadImportPrograms() {
      try {
        if (Array.isArray(this.import_programList)) {

          const allFiles = this.import_programList.filter(import_program => import_program.deleted_at === null);

          this.rowData.value = allFiles;

        } else if (this.import_programList && this.import_programList.deleted_at === null) {
          this.rowData.value = [this.import_programList];
        } else {
          this.rowData.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных файлов:", error);
        this.rowData.value = [];
      }
    },

    async loadImportDisciples() {
      try {
        if (Array.isArray(this.import_discipleList)) {

          const allFiles = this.import_discipleList.filter(import_disciple => import_disciple.deleted_at === null);

          this.detailRowData = allFiles;

        } else if (this.import_discipleList && this.import_discipleList.deleted_at === null) {
          this.detailRowData = [this.import_discipleList];
        } else {
          this.detailRowData = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных файлов:", error);
        this.detailRowData = [];
      }
    },

    resetList() {
      this.uploaded_file = new Uploaded_File();
    },

    openCompareForm() {
      console.log("Filtered data:", this.filteredRowDataCompare);
      this.showCompare = true;
    },
    openArchiveForm() {
      this.showArchive = true;
    },
    openDisciplinesForm() {
      this.showDisciple = true;
    },
    openDetailsForm() {
      this.showDetails = true;
    },

    openWorkloadForm() {
      this.showWorkload = true;
    },

    openCreatingForm() {
      this.resetList();
      this.formVisible = true;
    },

    onFirstDataRendered(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      const filterModelQuery = this.$route.query.filterModel;
      if (filterModelQuery) {
        const filterModel = JSON.parse(filterModelQuery);
        this.gridApi.setFilterModel(filterModel);
        this.filters = true;
      }

      const quickFilterQuery = this.$route.query.quickFilter;
      if (quickFilterQuery) {
        const quickFilter = JSON.parse(quickFilterQuery);
        this.gridApi.setQuickFilter(quickFilter);
        this.quickFilterValue = quickFilter;
        this.filters = true;
      }
    },

    async deleteAllActiveProgramsApiCall() {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      const deleteAllUrl = '/api/v1/import-programs/all-active'; // Или ваш полный URL API

      try {
        const response = await axios.delete(deleteAllUrl);

        if (response.status === 204) {
          this.successMessage = 'Все активные программы и связанные дисциплины успешно помечены как удаленные.';
          // !!! ВАЖНО: Обновите данные в таблице после удаления !!!
          await this.loadImportPrograms(); // Вызовите метод, который перезагружает данные для основной таблицы
          // Возможно, потребуется также очистить или обновить связанные данные, если они отображаются
          // await this.loadImportDisciples(); // Если нужно обновить и дисциплины
        } else {
          this.errorMessage = `Операция завершена, но получен неожиданный статус: ${response.status}`;
        }
      } catch (error) {
        console.error("Ошибка при удалении всех программ:", error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = `Ошибка сервера: ${error.response.data.message}`;
        } else if (error.response) {
          this.errorMessage = `Ошибка сервера: Статус ${error.response.status}`;
        } else if (error.request) {
          this.errorMessage = 'Не удалось связаться с сервером. Проверьте соединение или настройки CORS.';
        } else {
          this.errorMessage = `Произошла ошибка: ${error.message}`;
        }
      } finally {
        this.isLoading = false;
      }
    },

    deleteAllActiveProgramsConfirmed() {
      this.successMessage = '';
      this.errorMessage = '';

      if (window.confirm('Вы уверены, что хотите удалить все активные программы и связанные с ними дисциплины?')) {
        this.deleteAllActiveProgramsApiCall();
      } else {
        console.log('Удаление всех программ отменено пользователем.');
      }
    },

    async deleteSelected() {
    },

    async saveData() {
      console.log(this.uploaded_fileList);
      try {
        if (this.uploaded_fileList && this.uploaded_fileList.length > 0) {
          this.showLoading = true;

          const deletePromises = this.uploaded_fileList
            .filter(file => !file.deleted_at)
            .map(file => this.deleteUploaded_File(file));

          await Promise.all(deletePromises);

          //await this.loadImportPrograms();
          this.showLoading = false;
        } else {
          console.log('Нет файлов для удаления');
        }
      } catch (error) {
        this.showLoading = false;
        console.error("Ошибка при удалении файлов:", error);
      }
    },

      async fetchInitialData() {
   try {
       await Promise.all([
           this.getImport_ProgramList(),
           this.getImport_ProgramYearsList(),
           this.getImport_ProgramCodesList(),
           this.getImport_DiscipleDepartmentsList(),
           this.getImport_DiscipleSemestresList(),
           this.getImport_DiscipleList()
       ]);
       console.log("Initial data fetched successfully.");

   } catch (error) {
       console.error("Ошибка при первичной загрузке данных:", error);
   }
},
  },

  computed: {

    ...mapState(useUploaded_FileStore, ["uploaded_fileList"]),
    ...mapState(useImport_ProgramStore, ["import_programList"]),
    ...mapState(useImport_DiscipleStore, ["import_discipleList"]),

    currentUser() {
      return this.$store.state.auth.user;
    },
    currentColumnDefs2() {
      return this.columnDefs2Options[this.selectedOption4];
    },

    filteredRowDataCompare() {

      const selectedRows = (this.rowData.value || []).filter(row => row.selected === true);
      console.log("Выбранные строки:", selectedRows);
      console.log("С чем сравниваем:", this.compareRowData);
      if (!selectedRows.length) return [];

      const frequency = {};
      selectedRows.forEach(row => {
        const name = row.disciple_name;
        if (name) {
          frequency[name] = (frequency[name] || 0) + 1;
        }
      });
      console.log("Частота discipline name в выбранных строках:", frequency);

      const filteredData = (this.compareRowData || []).filter(compareRow => {
        return selectedRows.some(mainRow => {

          const isEqual =
            mainRow.direction_code === compareRow.direction_code &&
            mainRow.direction_name === compareRow.direction_name &&
            mainRow.qualification === compareRow.qualification &&
            mainRow.academic_year === compareRow.academic_year;

          const sameDisciple = mainRow.disciple_name === compareRow.disciple_name;
          const isCommon = sameDisciple && (frequency[compareRow.disciple_name] || 0) >= 2;
          console.log("Сравниваем:");
          console.log(" mainRow:", mainRow);
          console.log(" compareRow:", compareRow);
          console.log(" Результат сравнения:", isEqual, "и общая дисциплина:", isCommon);
          return isEqual && isCommon;
        });
      });
      console.log("Отфильтрованные данные:", filteredData);
      return filteredData;
    },

    programFilterOptions() {
    const programStore = useProgramStore();
    return Object.values(programStore.programMap || {})
      .map(item => ({
        value: item.program_name,  // фильтровать будем по именно этому полю
        label: item.program_name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  },

    filteredRowData() {
      return this.rowDataAll[this.selectedOption4] || [];
    },
    availableSemesters() {
      const semesters = this.selectedCourse === 1
        ? [1, 2]
        : this.selectedCourse === 2
          ? [3, 4]
          : this.selectedCourse === 3
            ? [5, 6]
            : this.selectedCourse === 4
              ? [7, 8]
              : [];
      console.log("Available semesters for course", this.selectedCourse, ":", semesters);  // Логируем
      return semesters;
    },
  }
}
</script>

<style scoped>

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

.ag-row .ag-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}



.year-selector-container {
  display: flex;
  gap: 34px;
  justify-content: flex-end;
  align-items: center;
  padding: 5px;
}

.header-content-wrapper {
  display: flex;
  gap: 10px;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.my-selectbox {
  margin: 0;
  padding: 5px;
}

.btn-danger {
  background-color: #ff4d4d;
  border-color: #ff4d4d;
}

.btn-danger:hover {
  background-color: #ff1a1a;
  border-color: #ff1a1a;
}

.btn-lg {
  font-size: 1.25rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.3rem;
}

.material-icons-outlined {
  font-size: 1.5rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.gap-2 {
  gap: 0.5rem;
}

@media (min-width: 1023px) {

  .list {
    padding-left: 90px;
    padding-right: 5px;

  }
}

.year-selector-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px;
}

.year-selector-container label {
  margin-right: 5px;
  font-size: 14px;
  white-space: nowrap;
}

.year-selector-container select {
  width: 150px;
  height: 30px;
  font-size: 14px;
  padding: 2px 5px;
}

.btn-primary,
.btn-outline-secondary,
.form-control,
.form-select {
  height: 28px;
  line-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-control,
.form-select {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  justify-content: flex-start; 
}

.form-select {
   padding-right: 2.25rem;
}

.page-link {
  height: 40px;
  width: 40px;
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-container {
    padding: 8px;
    border-radius: 6px;
    flex-grow: 1;
}

.search-input-wrapper {
    position: relative;
    flex-grow: 1;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 18px;
    pointer-events: none;
}

.search-input {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.search-input:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.clear-filter-btn {
    border: 1px solid #dee2e6;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.clear-filter-btn:hover:not(:disabled) {
    background-color: #e9ecef;
    border-color: #dee2e6;
}

.clear-filter-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.filters-container {
    padding-top: 8px; /* Добавляем немного отступа сверху */
    padding-bottom: 8px; /* И снизу */
    width: 100%;
}

</style>
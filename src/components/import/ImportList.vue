<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
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

  <Sidebar v-model:visible="showCompare" position="bottom" modal header="Пересечение учебных планов"
    class="custom-sidebar h-auto" :style="{ width: '80%', maxHeight: '750px', height: 'auto', margin: 'auto' }">

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
          <div class="form-check form-switch d-flex align-items-center">
              <input 
                  class="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="intersectionSwitch"
                  v-model="showOnlyIntersection">
              <label class="form-check-label ms-2" for="intersectionSwitch">
                  Только пересечения
              </label>
          </div>
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

    <div v-if="matchPercentage > 0" class="alert alert-info p-2 mb-2">
      <strong>Планы совпадают по набору дисциплин на: {{ matchPercentage }}%</strong>
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


  <Sidebar v-model:visible="showArchive" @hide="resetArchiveFilters" position="bottom" modal header="Архив" class="custom-sidebar h-auto"
    :style="{ width: '80%', maxHeight: '750px', height: 'auto', margin: 'auto' }">

    <div class="d-flex flex-column mb-3">
        <div class="search-container d-flex align-items-center mb-2">
            <div class="search-input-wrapper position-relative flex-grow-1">
                <i class="material-icons-outlined search-icon">search</i>
                <input class="form-control search-input" type="text"
                        v-model="archiveQuickFilterValue"
                        id="detail-filter-text-box"
                        v-on:input="onArchiveFilterTextBoxChanged()"
                        placeholder="Поиск"
                        style="width: 100%; padding-left: 35px;" />
            </div>
            <button @click="clearArchiveFilters" :disabled="!detailFiltersActive"
                    class="btn btn-outline-secondary clear-filter-btn d-flex align-items-center ms-2" type="button">
                <i class="material-icons-outlined" style="font-size: 18px;">close</i>
                <span class="ms-1">Очистить</span>
            </button>
        </div>
        
    </div>

    <div class="row g-2 mb-2">

      <div class="col-4 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label me-2" for="archive_program_filter">Направление:</label>
        <select
          id="archive_program_filter"
          class="form-select"
          v-model="archiveFormValues.codes"
        >
          <option :value="null">Не выбрано</option>
          <option
            v-for="programOption in programsOptions"
            :key="programOption.value"
            :value="programOption.value"
          >
            {{ programOption.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="col-4 p-0 pe-3">
      <div class="form-group d-flex align-items-center">
        <label class="form-label ms-2 me-2" 
        for="archive_academic_year_filter">Учебный год:</label>
        <select
      id="archive_academic_year_filter"
      class="form-select"
      v-model="archiveFormValues.academic_year"
    >
      <!-- Пусто. v-for теперь сам сгенерирует все нужные опции -->
      <option
        v-for="yearOption in yearsOptions"
        :key="yearOption.value"
        :value="yearOption.value"
      >
        {{ yearOption.label }}
      </option>
    </select>
      </div>
    </div>

    <div class="col-4 p-0">
      <div class="form-group d-flex align-items-center">
        <label class="form-label ms-2 me-2" for="archive_actualization_year_filter">Год актуализации:</label>
        <select
          id="archive_actualization_year_filter"
          class="form-select"
          v-model="archiveFormValues.actualization_year"
        >
          <option :value="null">Не выбрано</option>
          <option
            v-for="yearOption in timeYearsOptions" 
            :key="yearOption.value"
            :value="yearOption.value"
          >
            {{ yearOption.label }}
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
          @grid-ready="onGridReadyArchive"
          @firstDataRendered="onFirstDataRendered"
          :pagination="true"
          :paginationPageSize="paginationPageSize">
        </ag-grid-vue>
      </div>
    </div>
  </Sidebar>

  <Sidebar v-model:visible="showDetails" @hide="clearDetailFilters" position="bottom" modal :header="`Направление ${selectedDisciplineCodeForTemplate}`"
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
          <label class="form-label me-3" for="details_semester_filter" 
            >Семестр:</label
          >
          <MultiSelect
  v-model="detailFilter.semestres"
  :options="semestresOptionsForMultiSelect"
  optionLabel="label"
  optionValue="value"
  placeholder="Выберите семестры"
  class="w-full"
  inputId="details_semester_filter"
  :showToggleAll="false"
>
  <template #header>
    <div class="p-multiselect-header d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
      <div class="d-flex align-items-center">
        <Checkbox v-model="allSemestersSelected" :binary="true" class="me-2" />
        <label @click="allSemestersSelected = !allSemestersSelected" style="cursor: pointer;">
            {{ allSemestersSelected ? 'Снять выделение' : 'Выбрать все' }}
        </label>
      </div>
    </div>
  </template>
</MultiSelect>
        </div>
      </div>
      <div class="col-6 p-0">
      <div class="form-group d-flex align-items-center">
        <label class="form-label ms-3 me-3" for="details_department_filter">Кафедра:</label>
        <!-- Вот этот MultiSelect должен быть здесь -->
        <MultiSelect
          v-model="detailFilter.departments"
          :options="departmentsOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Выберите кафедры"
          class="w-full"
          inputId="details_department_filter"
          :showToggleAll="false"
        >
          <template #header>
            <div class="p-multiselect-header d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
              <div class="d-flex align-items-center">
                <Checkbox v-model="allDepartmentsSelected" :binary="true" class="me-2" />
                <label @click="allDepartmentsSelected = !allDepartmentsSelected" style="cursor: pointer;">
                  {{ allDepartmentsSelected ? 'Снять выделение' : 'Выбрать все' }}
                </label>
              </div>
            </div>
          </template>
        </MultiSelect>
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

  <Sidebar v-model:visible="showWorkload" position="bottom" modal class="custom-sidebar h-auto"
    :style="{ width: '80%', maxHeight: '750px', height: 'auto', margin: 'auto' }">

    <template #header>
    <div class="d-flex align-items-center w-100 gap-3">
        <span class="p-sidebar-title">Нагрузка на</span>
        <div class="header-year-selector d-flex align-items-center">
            <label class="form-label me-2 mb-0" for="workload_academic_year_filter_header"></label>
            <select
                id="workload_academic_year_filter_header"
                class="form-select form-select-sm"
                v-model="workloadFormValues.academic_year"
                @click.stop
            >
                <!-- Пусто. v-for теперь сам сгенерирует все нужные опции -->
                <option
                v-for="yearOption in yearsOptions"
                :key="yearOption.value"
                :value="yearOption.value"
                >
                {{ yearOption.label }}
                </option>
            </select>
        </div>
    </div>
</template>

    <div class="d-flex flex-column mb-3">
        <div class="search-container d-flex align-items-center mb-2">
            <div class="search-input-wrapper position-relative flex-grow-1">
                <i class="material-icons-outlined search-icon">search</i>
                <input class="form-control search-input" type="text"
                        v-model="workloadQuickFilterValue"
                        id="workload-filter-text-box"
                        v-on:input="onWorkloadFilterTextBoxChanged()"
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

      <div class="col-12 p-0">
        <div class="form-group d-flex align-items-center">
          <label class="form-label me-2" for="workload_program_filter">Направление:</label>
          <select
            id="workload_program_filter"
            class="form-select"
            v-model="workloadFormValues.codes"
          >
            <option :value="null">Не выбрано</option>
            <option
              v-for="programOption in programsOptions"
              :key="programOption.value"
              :value="programOption.value"
            >
              {{ programOption.label }}
            </option>
          </select>
          
        </div>
      </div>
      
      <div class="col-6 p-0 pe-3 mt-2">
  <div class="form-group d-flex align-items-center">
    <label class="form-label me-2" for="workload_semester_filter">Семестр:</label>
    <MultiSelect
      v-model="workloadFormValues.semesters"
      :options="semestresOptionsForMultiSelect"
      optionLabel="label"
      optionValue="value"
      placeholder="Выберите семестры"
      class="w-full"
      inputId="workload_semester_filter"
      :showToggleAll="false"
    >
      <template #header>
        <div class="p-multiselect-header d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <div class="d-flex align-items-center">
            <Checkbox v-model="allWorkloadSemestersSelected" :binary="true" class="me-2" />
            <label @click="allWorkloadSemestersSelected = !allWorkloadSemestersSelected" style="cursor: pointer;">
                {{ allWorkloadSemestersSelected ? 'Снять выделение' : 'Выбрать все' }}
            </label>
          </div>
        </div>
      </template>
    </MultiSelect>
  </div>
</div>
      <div class="col-6 p-0 mt-2">
        <div class="form-group d-flex align-items-center">
          <label class="form-label ms-2 me-2" for="workload_department_filter">Кафедра:</label>
          <MultiSelect
            v-model="workloadFormValues.departments"
            :options="departmentsOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Выберите кафедры"
            class="w-full" 
            inputId="details_department_filter"
            :showToggleAll="false"
          >
            <!-- ... (содержимое MultiSelect остается) ... -->
          </MultiSelect>
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
          @grid-ready="onGridReadyWorkload"
          @firstDataRendered="onFirstDataRendered"
          :pagination="true"
          :paginationPageSize="paginationPageSize">
        </ag-grid-vue>
      </div>
    </div>
  </Sidebar>

<Sidebar v-model:visible="showSchedule" position="bottom" modal :header="`Календарный график для ${selectedProgramName}`"
    class="custom-sidebar h-auto" :style="{ width: '85%', maxHeight: '80vh', height: 'auto', margin: 'auto' }">

  <div v-if="isLoadingSchedule" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка данных графика...</p>
    </div>

    <!-- ИЗМЕНЕНИЕ: Добавляем v-else -->
    <div v-else-if="currentScheduleData && currentScheduleData.length > 0" class="schedule-display-container p-3"></div>

    <div v-if="currentScheduleData && currentScheduleData.length > 0" class="schedule-display-container p-3">
        <!-- Легенда (остается без изменений) -->
        <div class="schedule-legend d-flex flex-wrap align-items-center gap-3 mb-4">
            <div v-for="item in scheduleLegend" :key="item.symbol" class="legend-item d-flex align-items-center">
                <span class="legend-color-box me-2" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
            </div>
        </div>

        <!-- Контейнер для всех курсов -->
        <div class="courses-wrapper">
            <!-- Здесь v-for перебирает курсы -->
            <div v-for="courseNumber in [1, 2, 3, 4]" :key="courseNumber" class="course-schedule-row mb-4">
                
                <!-- Отображаем блок курса, только если для него есть данные -->
                <div v-if="getPeriodsForCourse(courseNumber).length > 0">

                    <div class="course-label fw-bold mb-2">Курс {{ courseNumber }}</div>

                    <!-- Это контейнер для ОДНОГО полного таймлайна (месяцы + дорожка) -->
                    <div class="timeline-container">
                        
                        <!-- 1. ШАПКА С МЕСЯЦАМИ -->
                        <!-- Этот div должен стать grid-контейнером -->
                        <div class="timeline-header">
                            <!-- Этот v-for создает дочерние grid-элементы (месяцы) -->
                            <div v-for="month in months" :key="month.name" class="month-label" :style="{ 'grid-column-start': month.start, 'grid-column-end': `span ${month.span}` }">
                                {{ month.name }}
                            </div>
                        </div>
                        
                        <div class="timeline-track">
                        <div v-for="period in getPeriodsForCourse(courseNumber)" :key="period.startWeek"
                            class="timeline-period"
                            :style="{ 
                                'grid-column': `${period.startWeek} / ${period.endWeek + 1}`,
                                'background-color': getActivityColor(period.symbol)
                            }"
                            
                            :title="getPeriodDateTitle(period)"> 

                            <span class="timeline-period-symbol">{{ period.symbol }}</span>
                        </div>
                    </div>

                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="text-center p-5">
        <p>Данные по календарному графику для этой программы отсутствуют.</p>
        <p class="text-muted small">Убедитесь, что в загружаемом файле есть лист "График" или проверьте консоль на наличие ошибок при загрузке.</p>
    </div>
</Sidebar>

</template>

<script>

import { AgGridVue } from "ag-grid-vue3";
import { computed, reactive, onMounted, ref, watch, getCurrentInstance } from "vue";
import ButtonCell from "@/components/import/ImportButtonCell.vue";
import CompetencyManager from '@/components/import/CompetencyManager.vue';
import CompetencyButtonCell from '@/components/import/CompetencyButtonCell.vue';
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
axios.defaults.baseURL = 'http://195.93.252.168:8081';

import MultiSelect from 'primevue/multiselect';
import Checkbox from 'primevue/checkbox';


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

function columnToNumber(column) {
  let num = 0;
  for (let i = 0; i < column.length; i++) {
    num = num * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return num;
}

function numberToColumn(num) {
  let column = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    column = String.fromCharCode('A'.charCodeAt(0) + remainder) + column;
    num = Math.floor((num - 1) / 26);
  }
  return column;
}

export default {
  name: 'import',
  components: {
    AgGridVue,
    ButtonCell,
    AutoForm,
    MultiSelect,
    CompetencyButtonCell,
    Checkbox,
    CompetencyManager,
  },
  setup() {

    const showCompetencies = ref(false);

    // Функция для открытия сайдбара
    const openCompetencyManager = (event) => {
        selectedProgramId.value = event.data.id;
        showCompetencies.value = true;
    };

    const instance = getCurrentInstance();
    const localeText = AG_GRID_LOCALE_RU;

    const gridApi = ref(null);
    const quickFilterValue = ref('');
    const filters = ref(false); 
    const rowData = reactive({ value: []});

    const gridApiDetails = ref(null); 
    const detailQuickFilterValue = ref(''); 
    const detailFiltersActive = ref(false); 
    const gridApiCompare = ref(null);
    const compareQuickFilterValue = ref('');
    const gridApiArchive = ref(null); 
    const archiveQuickFilterValue = ref('');

    const workloadQuickFilterValue = ref('');
const gridApiWorkload = ref(null);

// 2. Создаем отдельную функцию для grid-ready таблицы "Нагрузка"
const onGridReadyWorkload = (params) => {
  console.log("Workload Grid is ready");
  gridApiWorkload.value = params.api;
};

// 3. Создаем отдельный обработчик для поля поиска в "Нагрузке"
const onWorkloadFilterTextBoxChanged = () => {
  if (gridApiWorkload.value) {
    gridApiWorkload.value.setQuickFilter(workloadQuickFilterValue.value);
  } else {
    console.warn("API таблицы 'Нагрузка' не готово для фильтрации.");
  }
};

    const onGridReadyCompare = (params) => {
      console.log("Compare Grid is ready");
      gridApiCompare.value = params.api;
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

const onGridReadyArchive = (params) => {
  gridApiArchive.value = params.api;
  console.log("Archive Grid is ready");
};

const onArchiveFilterTextBoxChanged = () => {
  if (gridApiArchive.value) {
    gridApiArchive.value.setQuickFilter(archiveQuickFilterValue.value);
  } else {
    console.warn("API таблицы архива не готово для фильтрации.");
  }
};

const clearArchiveFilters = () => {
    if (gridApiArchive.value) {
        gridApiArchive.value.setQuickFilter(null);
    }
    archiveQuickFilterValue.value = '';
    Object.keys(archiveFormValues).forEach(key => archiveFormValues[key] = null);
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
          field: 'detailsAction',
          headerClass: "text-center",
          cellRenderer: 'ButtonCell',
          cellRendererParams: {
            label: 'View Details',
          },
          maxWidth: 50,
          resizable: false
        },
                {
          sortable: false,
          filter: false,
          headerName: "",
          field: 'scheduleAction',
          headerClass: "text-center",
          cellRenderer: () => {
            return '<button type="button" class="btn btn-primary btn-sm d-flex align-items-center" title="Посмотреть календарный график">' +
                     '<i class="material-icons-outlined">timeline</i>' +
                   '</button>';
          },
          cellStyle: { 'display': 'flex', 'align-items': 'center', 'justify-content': 'center' },
          maxWidth: 75,
          resizable: false,
        },
        
        {
          field: "code",
          headerName: 'Код направления',
          flex: 1.1,
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
          field: "years",
          headerName: 'Учебный год',
          flex: 1,
        },
        {
          field: "actualization_year",
          headerName: 'Год актуализации',
          flex: 1.1,
        },

        {
          headerName: 'Выбрать',
          field: "selected",
          flex: 0.7,
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
          field: 'detailsAction',
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
          minWidth: 350,
        },
        {
          field: "years",
          headerName: 'Учебный год',
          maxWidth: 150,
        },
        {
          field: "start_year",
          headerName: 'Год начала',
          maxWidth: 190,
        },
        {
          field: "actualization_year",
          headerName: 'Год актуализации',
          maxWidth: 190,
        }
      ],
    });

    const detailColumnDefs = reactive({
  value: [
    {
      field: "disciple_name",
      headerName: 'Наименование',
      flex: 3,
      minWidth: 450,
      pinned: 'left', // Закрепим, чтобы было удобно скроллить
    },
    {
      field: "semester",
      headerName: 'Семестр', // Сократим для компактности
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 75,
      flex: 0.9,
    },
    {
      field: "hours",
      headerName: 'з.е.', // ИЗМЕНЕНО: Более точный заголовок
      tooltipValueGetter: (p) => 'Зачетные единицы', // Добавим всплывающую подсказку
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "contact_hours",
      headerName: 'Конт.',
      tooltipValueGetter: (p) => 'Контактные часы (сумма)',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 80,
      flex: 1,
    },
    {
      field: "lecture_hours",
      headerName: 'Лек',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "lab_hours",
      headerName: 'Лаб',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "practice_hours",
      headerName: 'Пр',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "ksr_hours",
      headerName: 'КСР',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "ikr_hours",
      headerName: 'ИКР',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "independent_study_hours",
      headerName: 'СР',
      tooltipValueGetter: (p) => 'Самостоятельная работа',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "control_hours",
      headerName: 'Контроль',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 100, // Сделаем немного шире
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


    const showOnlyIntersection = ref(true);

const unionData = computed(() => {
  const selectedProgramIds = (rowData.value || [])
                              .filter(program => program.selected === true)
                              .map(program => program.id);

  if (selectedProgramIds.length < 2) {
    return [];
  }

  const allDisciples = importDiscipleStore.import_discipleList || [];
  const relevantDisciples = allDisciples.filter(disciple =>
    disciple.program_id !== undefined && selectedProgramIds.includes(disciple.program_id)
  );

  return transformDisciples(relevantDisciples);
});

// ИЗМЕНЕНО: Вычисляемое свойство для ПЕРЕСЕЧЕНИЯ (теперь на основе unionData)
const intersectionData = computed(() => {
  const selectedProgramIds = (rowData.value || [])
                                .filter(program => program.selected === true)
                                .map(program => program.id);
  
  const requiredCount = selectedProgramIds.length;
  if (requiredCount < 2) {
      return [];
  }

  // Фильтруем данные из объединения
  return unionData.value.filter(disciple => {
    const actualCount = Object.keys(disciple.hoursByProgram).length;
    return actualCount === requiredCount;
  });
});

const rowDataForComparison = computed(() => {
  if (showOnlyIntersection.value) {
    // Если чекбокс "Только пересечение" активен, возвращаем intersectionData
    return intersectionData.value;
  } else {
    // Иначе возвращаем все уникальные дисциплины
    return unionData.value;
  }
});

// НОВОЕ: Вычисляем процент совпадения
const matchPercentage = computed(() => {
  const unionCount = unionData.value.length;
  const intersectionCount = intersectionData.value.length;
  
  // Защита от деления на ноль, если нет данных
  if (unionCount === 0) {
    return 0;
  }
  
  const percentage = (intersectionCount / unionCount) * 100;
  
  // Возвращаем значение, округленное до одного знака после запятой
  return percentage.toFixed(1);
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
  // Получаем список годов из стора
  const years = importProgramStore.import_program_yearsList;
  if (!years) return [{ label: 'Не выбрано', value: null }]; // Защита, если данных еще нет

  // 1. Преобразуем в нужный формат и сортируем в обратном порядке
  const sortedOptions = years
    .map(item => ({
      label: String(item.years), // Убедимся, что это строка для сортировки
      value: item.years
    }))
    .sort((a, b) => {
        // Сравниваем b с a для обратного порядка (например, "2024-2025" будет выше "2023-2024")
        if (a.label && b.label) {
            return b.label.localeCompare(a.label);
        }
        return 0;
    });

  // 2. Добавляем опцию "Не выбрано" в конец отсортированного списка
  return [...sortedOptions, { label: 'Не выбрано', value: null }];
});

    const timeYearsOptions = computed(() => {
  if (!import_programList.value || import_programList.value.length === 0) {
    return [];
  }
  
  const uniqueYears = [
    ...new Set(
      import_programList.value
        .map(program => program.actualization_year) // Берем только поле 'actualization_year'
        .filter(year => year != null) // Убираем пустые значения
    )
  ];
  
  uniqueYears.sort((a, b) => b - a);
  
  return uniqueYears.map(year => ({
    label: year,
    value: year
  }));
});


    const semestresOptions = computed(() => {
   const options = importDiscipleStore.import_disciple_semestresList
    .filter(item => item.semester !== null && item.semester !== undefined)
    .map(item => {
     return {
       label: String(item.semester),
       value: item.semester 
     };
   });
   return [{ label: "Не выбрано", value: null }, ...options];
 });

const departmentsOptions = computed(() => {
  const options = importDiscipleStore.import_disciple_departmentsList
    .filter(item => item.department !== null && item.department !== undefined)
    .map(item => {
    return {
      label: String(item.department),
      value: item.department
    };
  });
  return [...options];
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
  if (instance && instance.proxy) {
      instance.proxy.detailFilter.semestres = [];
      instance.proxy.detailFilter.departments = null;
  }
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
          headerName: `${program.code} (${program.profile ? program.profile : 'Профиль N/A'})`,
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
    actualization_year: null 
    });
    const discipleFormValues = reactive({
        codes: null,
        semestres: null,
        departments: null,
    });

    const selectedDisciplineCode = ref(null); 
    const selectedProgramId = ref(null);      
    const selectedProgramName = ref('');

    const semestresOptionsForMultiSelect = computed(() => {
      const uniqueSemesters = new Set();
      return importDiscipleStore.import_disciple_semestresList
        .filter(item => item.semester !== null && item.semester !== undefined && String(item.semester).trim() !== '')
        .map(item => ({
          label: String(item.semester),
          value: Number(item.semester) // Гарантируем, что значение - число
        }))
        .filter(option => { // Удаление дубликатов, если они есть
          if (uniqueSemesters.has(option.value)) {
            return false;
          }
          uniqueSemesters.add(option.value);
          return true;
        })
        .sort((a, b) => a.value - b.value); // Сортировка по числовому значению
    });

    const detailRowData = computed(() => {

      if (!selectedProgramId.value) { 
        return [];
      }
      const allDisciplesFromStore = import_discipleList.value || [];
      let filteredDisciples = allDisciplesFromStore.filter(disciple =>
        disciple.program_id === selectedProgramId.value
      );

      const detailFilterValues = instance?.proxy?.detailFilter;

      if (detailFilterValues) {
        if (detailFilterValues.semestres && detailFilterValues.semestres.length > 0) {
          // detailFilter.semestres будет массивом чисел (выбранных семестров)
          // disciple.semester также ожидается числом
          const selectedSemesters = detailFilterValues.semestres; // Это массив чисел
          filteredDisciples = filteredDisciples.filter(d =>
            d.semester !== null && d.semester !== undefined && selectedSemesters.includes(Number(d.semester))
          );
        }

        if (detailFilterValues.departments && detailFilterValues.departments.length > 0) {
      // Теперь detailFilterValues.departments - это массив ['Кафедра1', 'Кафедра2']
      const selectedDepartments = detailFilterValues.departments;
      filteredDisciples = filteredDisciples.filter(d =>
        // Проверяем, что кафедра дисциплины (`d.department`) присутствует в массиве выбранных
        d.department && selectedDepartments.includes(d.department)
      );
    }
  }
      return filteredDisciples;
    });

    const allSemestersSelected = computed({
        get: () => {
            // Проверяем, что есть опции и что количество выбранных совпадает с количеством доступных
            return semestresOptionsForMultiSelect.value.length > 0 &&
                   instance.proxy.detailFilter.semestres.length === semestresOptionsForMultiSelect.value.length;
        },
        set: (value) => {
            let selected = [];
            if (value) {
                // Если чекбокс устанавливается в "true", выбираем все
                selected = semestresOptionsForMultiSelect.value.map(s => s.value);
            }
            // Обновляем модель
            instance.proxy.detailFilter.semestres = selected;
        }
    });

    const allDepartmentsSelected = computed({
      get: () => {
        // Получаем список только реальных кафедр (без "Не выбрано")
        const validDepartments = departmentsOptions.value.filter(opt => opt.value !== null);
        // Проверяем, что выбраны все реальные кафедры
        return validDepartments.length > 0 &&
               instance.proxy.detailFilter.departments.length === validDepartments.length;
      },
      set: (value) => {
        let selected = [];
        if (value) {
          // Выбираем значения всех опций, кроме "Не выбрано" (null)
          selected = departmentsOptions.value
            .filter(opt => opt.value !== null)
            .map(d => d.value);
        }
        // Обновляем модель
        instance.proxy.detailFilter.departments = selected;
      }
    });

    const editFunction = (event) => {
      if (instance.proxy.resetUpd) { 
          instance.proxy.resetUpd();
      }
      instance.data.selectedDisciplineCode = event.data.code;
      selectedProgramId.value = event.data.id; // Обновляем ref selectedProgramId
      console.log(`Установлен selectedProgramId (from setup): ${selectedProgramId.value}`);
      if (instance.proxy.openDetailsForm) {
          instance.proxy.openDetailsForm();
      }
    };

   const cellWasClicked = (event) => {
  const field = event.colDef.field; // Получаем уникальное поле колонки
  const programData = event.data;   // Получаем данные всей строки

  if (!programData) return; // Защита от случайных кликов

  // ЕДИНЫЙ ЛОГИЧЕСКИЙ БЛОК
  if (field === 'detailsAction') {
    
    // --- Логика для открытия Дисциплин ---
    console.log("Открываем дисциплины для:", programData.code);
    
    // Этот код был разбросан по разным местам, теперь он здесь
    selectedProgramId.value = programData.id;
    if (instance && instance.proxy) {
        instance.proxy.selectedDisciplineCode = programData.code; // Для заголовка
        instance.proxy.openDetailsForm(); // Вызываем метод для открытия сайдбара с деталями
    } else {
        console.error("Не удалось получить доступ к proxy компонента.");
    }

  } else if (field === 'scheduleAction') {
    
    console.log("Открываем график для:", programData.code);
    instance.proxy.openScheduleViewer(event.data);
  } else if (field === 'downloadAction') {
    console.log("Запрос на скачивание файла для программы:", programData);
    // TODO: Здесь должна быть реализована логика для получения ссылки на файл и его скачивания.
    // Например, если бы в `programData` хранилось имя файла, можно было бы вызвать метод:
    // instance.proxy.downloadFile(programData.sourceFileName);
    alert('Функция скачивания находится в разработке.');
  }
};

    const onFirstDataRendered = (params) => {

      const currentGridApi = params.api; 

      const filterModelQuery = route.query.filterModel;
      if (filterModelQuery) {
        try {
          const filterModel = JSON.parse(filterModelQuery);
          currentGridApi.setFilterModel(filterModel);
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
          const quickFilter = JSON.parse(quickFilterQuery); 
          currentGridApi.setQuickFilter(quickFilter);
          if (currentGridApi === gridApi.value) {
            quickFilterValue.value = quickFilter;
            filters.value = true;
          }
        } catch (e) {
          console.error("Error parsing quickFilter from query:", e);
        }
      }
    };

const filteredRowDataArchive = computed(() => {
  const programs = import_programList.value || []; 
  const filters = archiveFormValues; 

  if (!filters.codes && !filters.academic_year && !filters.start_year && !filters.actualization_year) {
      return programs;
  }

  return programs.filter(program => {
    const codeMatch = !filters.codes || String(program.code) === String(filters.codes);
    const academicYearMatch = !filters.academic_year || String(program.years) === String(filters.academic_year); 
    const startYearMatch = !filters.start_year || String(program.start_year) === String(filters.start_year);
    const actualizationYearMatch = !filters.actualization_year || String(program.actualization_year) === String(filters.actualization_year); 

    return codeMatch && academicYearMatch && startYearMatch && actualizationYearMatch;
  });
});

const filteredDiscipleDataForAllPrograms = computed(() => {
  const disciples = import_discipleList.value || [];
  const programs = import_programList.value || [];
  const filters = discipleFormValues;

  let targetProgramId = null;
  if (filters.codes) {
      const selectedProgram = programs.find(p => String(p.code) === String(filters.codes));
      if (selectedProgram) {
          targetProgramId = selectedProgram.id;
      } else {
          return []; 
      }
  }

  if (!targetProgramId && filters.semestres === null && filters.departments === null) {
      return disciples;
  }

  return disciples.filter(disciple => {
      const programMatch = !targetProgramId || disciple.program_id === targetProgramId;
      const semesterMatch = filters.semestres === null || String(disciple.semester) === String(filters.semestres);
      const departmentMatch = filters.departments === null || String(disciple.department) === String(filters.departments);

      return programMatch && semesterMatch && departmentMatch;
  });
});

const resetArchiveFilters = () => {
    Object.keys(archiveFormValues).forEach(key => archiveFormValues[key] = null);
    
    archiveQuickFilterValue.value = '';
    
    if (gridApiArchive.value) {
        gridApiArchive.value.setQuickFilter(null);
    }
    console.log("Фильтры и поиск в архиве сброшены при закрытии.");
};
const resetDiscipleFilters = () => {
    Object.keys(discipleFormValues).forEach(key => discipleFormValues[key] = null);
     console.log("Disciple filters reset");
};

const workloadFormValues = reactive({
  codes: null,
  academic_year: null,
  departments: [],
  semesters: [],
});

watch(
  () => workloadFormValues.department,
  (newValue, oldValue) => {
    console.log("[ИЗМЕНЕНИЕ ФИЛЬТРА] Кафедра изменена:");
    console.log("  Новое значение workloadFormValues.department:", newValue);
    console.log("  Старое значение:", oldValue);
  },
  { deep: true } 
);

const workloadColumnDefs = reactive({
  value: [
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
      flex: 1.9,
      minWidth: 130,
    }
        ,

    {
      field: "disciple_name",
      headerName: 'Дисциплина',
      flex: 3,
      minWidth: 400,
      pinned: 'left', // Закрепим, чтобы было удобно скроллить
    },
    {
      field: "semester",
      headerName: 'Семестр', // Сократим для компактности
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      flex: 1.2,
    },
    {
      field: "hours",
      headerName: 'з.е.', // ИЗМЕНЕНО: Более точный заголовок
      tooltipValueGetter: (p) => 'Зачетные единицы', // Добавим всплывающую подсказку
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "contact_hours",
      headerName: 'Конт.',
      tooltipValueGetter: (p) => 'Контактные часы (сумма)',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 80,
      flex: 1,
    },
    {
      field: "lecture_hours",
      headerName: 'Лек',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "lab_hours",
      headerName: 'Лаб',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.9,
    },
    {
      field: "practice_hours",
      headerName: 'Пр',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "ksr_hours",
      headerName: 'КСР',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 80,
      flex: 0.9,
    },
    {
      field: "ikr_hours",
      headerName: 'ИКР',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 80,
      flex: 0.9,
    },
    {
      field: "independent_study_hours",
      headerName: 'СР',
      tooltipValueGetter: (p) => 'Самостоятельная работа',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 70,
      flex: 0.8,
    },
    {
      field: "control_hours",
      headerName: 'Контр.',
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      width: 120, // Сделаем немного шире
      flex: 1.2,
    }
  ],
});

const allWorkloadSemestersSelected = computed({
    get: () => {
        // Проверяем, что есть опции и что количество выбранных совпадает с количеством доступных
        const options = semestresOptionsForMultiSelect.value;
        return options.length > 0 && workloadFormValues.semesters.length === options.length;
    },
    set: (value) => {
        if (value) {
            // Если чекбокс устанавливается в "true", выбираем все доступные семестры
            workloadFormValues.semesters = semestresOptionsForMultiSelect.value.map(s => s.value);
        } else {
            // Иначе очищаем массив
            workloadFormValues.semesters = [];
        }
    }
});

const filteredWorkloadData = computed(() => {
  const disciples = import_discipleList.value || [];
  const filters = workloadFormValues;

  // Проверка, если ни один фильтр не активен
  if (
    !filters.codes &&
    !filters.academic_year &&
    (!filters.departments || filters.departments.length === 0) && // <-- Защита и проверка массива
    (!filters.semesters || filters.semesters.length === 0) // <-- Защита и проверка массива
  ) {
    return disciples;
  }

  return disciples.filter(disciple => {
    // Безопасная проверка: если свойство не массив, считаем, что фильтр не применен
    if (!Array.isArray(filters.departments) || !Array.isArray(filters.semesters)) {
        return false; // Или true, в зависимости от желаемого поведения при ошибке
    }
  
    const program = import_programList.value?.find(p => p.id === disciple.program_id);

    const codeMatch = !filters.codes || (program && String(program.code) === String(filters.codes));
    const yearMatch = !filters.academic_year || (program && String(program.years) === String(filters.academic_year));

    // ИСПРАВЛЕННАЯ ЛОГИКА для кафедр (работает с массивом)
    const departmentMatch = filters.departments.length === 0 || filters.departments.includes(disciple.department);
    
    // ИСПРАВЛЕННАЯ ЛОГИКА для семестров (работает с массивом)
    const semesterMatch = filters.semesters.length === 0 || filters.semesters.includes(disciple.semester);
    
    return codeMatch && yearMatch && departmentMatch && semesterMatch;
  });
});

    return {

      workloadQuickFilterValue,
  onGridReadyWorkload,
  onWorkloadFilterTextBoxChanged,

      onGridReady,
      columnDefs,
      archiveColumnDefs,
      semestresOptionsForMultiSelect,
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
      allSemestersSelected,
      allDepartmentsSelected,

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

      gridApiArchive,
      archiveQuickFilterValue,
      onGridReadyArchive,
      onArchiveFilterTextBoxChanged,
      clearArchiveFilters,
      
      formValues: instance?.proxy?.formValues,

      programsOptions, 
      yearsOptions,    
      localeText,
      defaultColDef,
      dynamicColumnDefs,
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
      matchPercentage,
      showOnlyIntersection,

      showCompetencies, 
      selectedProgramId,
      selectedProgramName,
      CompetencyManager,
      allWorkloadSemestersSelected,
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
      semestres: [],
      departments: [],
      },
      detailErrors: {},     
      gridApiDetails: null,  

      isLoading: false,
      successMessage: '',
      errorMessage: '',

      parsedSchedules: {}, 
      showSchedule: false,
      currentScheduleData: [],
      selectedProgramName: '',

      academicYearWeeks: [],
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

async onFileChange(event) {
      // Устанавливаем состояние загрузки и очищаем сообщения
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const files = Array.from(event.target.files);
      if (!files.length) {
        this.isLoading = false;
        return;
      }
      
      const programsData = [];

      const readFile = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          let programNameForErrorHandling = null; // Переменная для хранения имени программы

          reader.onload = async (e) => {
            try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: "array" });
              
              const sheetName = "Титул";
              const sheet = workbook.Sheets[sheetName];
              if (!sheet) {
                // Это критическая ошибка, имя программы извлечь невозможно.
                throw new Error(`Лист "${sheetName}" не найден в файле ${file.name}`);
              }

              // --- Шаг 1: Извлекаем данные и имя программы ---
              const rawProgramName = sheet["D29"] ? sheet["D29"].v : null;
              programNameForErrorHandling = rawProgramName
                ? rawProgramName.replace(/[\r\n]+/g, " ").replace(/^Направление подготовки\s*\d+\.\d+\.\d+\s*/i, "").trim()
                : null;

              if (!programNameForErrorHandling) {
                 // Если имя не найдено, это тоже критическая ошибка
                 throw new Error(`Не удалось извлечь название программы из ячейки D29 в файле ${file.name}`);
              }

              let extractedData = {
                program_name: programNameForErrorHandling,
                code: sheet["D27"] ? sheet["D27"].v : null,
                profile: sheet["D30"] ? sheet["D30"].v : null,
                qualification: (sheet["C40"] ? String(sheet["C40"].v).replace(/[\r\n]+/g, " ").replace(/^Квалификация:?\s*/i, "").trim() : null),
                years: sheet["W41"] ? sheet["W41"].v : null,
                start_year: sheet["W40"] ? sheet["W40"].v : null,
                actualization_year: new Date().getFullYear(),
                current_course: null,
              };

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
          extractedData.actualization_year = new Date().getFullYear();

          if (extractedData.start_year && extractedData.years) {
              const startYear = parseInt(extractedData.start_year, 10);
              const yearStartStr = extractedData.years.split("-")[0];
              const yearStart = parseInt(yearStartStr, 10);

              const course = yearStart - startYear + 1;
              extractedData.current_course = course > 0 ? course : null;
          } else {
              extractedData.current_course = null;
          }

          const allPrograms = this.import_programList || [];
              const existingProgram = allPrograms.find(p =>
                p.code === extractedData.code &&
                p.qualification === extractedData.qualification &&
                p.profile === extractedData.profile &&
                p.years === extractedData.years &&
                p.actualization_year == extractedData.actualization_year
              );

              if (existingProgram) {
                console.log(`Найден существующий план (ID: ${existingProgram.id}). Удаление...`);
                // Ошибка здесь будет поймана блоком catch
                await axios.delete(`/api/v1/import-programs/${existingProgram.id}`);
                console.log(`Старый план (ID: ${existingProgram.id}) успешно удален.`);
                await this.getImport_ProgramList();
              }
              
              // Ошибка здесь тоже будет поймана
              await this.postImport_Program(extractedData);
              await this.getImport_ProgramList();
              this.loadImportPrograms();

              const newProgramId = this.lastId - 1;


          const sheetNameP = "План";
          const allDisciplePromises = [];
          
          const sheetP = workbook.Sheets[sheetNameP];

          if (sheetP) {

             const range = XLSX.utils.decode_range(sheetP['!ref']);
    
              const startRow = 1; 
              const endRow = range.e.r;

            const getCellValue = (sheetP, address) => {
              const cell = sheetP[address];
              return cell?.v ?? null;
            };

            const getCellNumber = (sheetP, address) => {
              const cell = sheetP[address];
              const value = cell?.v;
              if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
                return parseInt(Number(value), 10);
              }
              return null;
            };

            const getCellString = (sheetP, address) => {
              const cell = sheetP[address];
              const value = cell?.w ?? cell?.v;
              if (value !== null && value !== undefined) {
                return String(value).trim();
              }
              return null;
            };

            for (let row = startRow; row <= endRow + 1; row++) {
 
              const sign = getCellString(sheetP, `B${row}`);

              if (sign==="+") {

                const discipleName = getCellString(sheetP, `D${row}`);
                const departmentValue = getCellString(sheetP, `CF${row}`);


              if (discipleName && departmentValue) {

                let MAX_SEMESTERS = 8; // По умолчанию для бакалавров/специалистов
            if (extractedData.qualification && extractedData.qualification.toLowerCase().includes('магистр')) {
                MAX_SEMESTERS = 2; // Устанавливаем 2 семестра для магистров
                console.log(`Обнаружен план магистра. Количество семестров для парсинга: ${MAX_SEMESTERS}`);
            }

                const START_COLUMN_SEMESTER_1 = 'S'; 
                const COLUMNS_PER_SEMESTER = 8; 

                const startColumnNum = columnToNumber(START_COLUMN_SEMESTER_1);

                for (let semester = 1; semester <= MAX_SEMESTERS; semester++) {
                  const semesterOffset = (semester - 1) * COLUMNS_PER_SEMESTER;
                  const currentStartColumnNum = startColumnNum + semesterOffset;

                  const totalHoursColumn = numberToColumn(currentStartColumnNum);
      const totalHours = getCellNumber(sheetP, `${totalHoursColumn}${row}`);

      // Создаем запись только если в этом семестре есть часы
      if (totalHours && totalHours > 0) {

        // ИЗМЕНЕНО: Обновляем получение данных согласно новой структуре
        const lecture_hours = getCellNumber(sheetP, `${numberToColumn(currentStartColumnNum + 1)}${row}`) ?? 0;
        const lab_hours = getCellNumber(sheetP, `${numberToColumn(currentStartColumnNum + 2)}${row}`) ?? 0;
        const practice_hours = getCellNumber(sheetP, `${numberToColumn(currentStartColumnNum + 3)}${row}`) ?? 0;
        const ksr_hours = getCellNumber(sheetP, `${numberToColumn(currentStartColumnNum + 4)}${row}`) ?? 0;
        const ikr_hours = getCellNumber(sheetP, `${numberToColumn(currentStartColumnNum + 5)}${row}`) ?? 0;

        const import_disciple = {
          program_id: this.lastId - 1,
          disciple_name: discipleName,
          department: departmentValue,
          semester: semester,

          // Порядок соответствует новому формату
          hours: totalHours, // з.е. (смещение +0)
          lecture_hours: lecture_hours, // Лек (смещение +1)
          lab_hours: lab_hours, // Лаб (смещение +2)
          practice_hours: practice_hours, // Пр (смещение +3)
          ksr_hours: ksr_hours, // КСР (смещение +4)
          ikr_hours: ikr_hours, // ИКР (смещение +5)
          independent_study_hours: getCellNumber(sheetP, `${numberToColumn(currentStartColumnNum + 6)}${row}`) ?? 0, // СР (смещение +6)
          control_hours: getCellNumber(sheetP, `${numberToColumn(currentStartColumnNum + 7)}${row}`) ?? 0, // Контроль (смещение +7)
          
          // Контактные часы вычисляем как сумму, т.к. отдельного столбца нет
          contact_hours: lecture_hours + lab_hours + practice_hours + ksr_hours + ikr_hours,
        };

        allDisciplePromises.push(this.postImport_Disciple(import_disciple));
      }
                }


              }

              }
            }
          } else {
            console.warn(`Лист "${sheetNameP}" не найден.`);
          }

          const scheduleSheet = workbook.Sheets["График"];
              if (scheduleSheet) {
                  console.log(`Найден лист "График" в файле ${file.name}. Начинаю парсинг.`);
                  const periods = await this.parseScheduleFromSheet(scheduleSheet);
          
          // --- НАЧАЛО ИЗМЕНЕНИЙ ---
          if (periods.length > 0) {
              // Преобразуем данные в формат DTO для отправки на бэкенд
              const scheduleDtos = periods.map(p => ({
                  courseNumber: p.course,
                  activitySymbol: p.symbol,
                  startWeek: p.startWeek,
                  endWeek: p.endWeek
                  // importProgramId будет добавлен в URL, а не в тело
              }));

              try {
                  // Отправляем данные на новый эндпоинт
                  await axios.post(`/api/v1/schedules/program/${newProgramId}`, scheduleDtos);
                  console.log(`График для программы ID ${newProgramId} успешно сохранен в БД.`);
              } catch (scheduleError) {
                  console.error(`Ошибка при сохранении графика для программы ID ${newProgramId} в БД:`, scheduleError);
                  // Можно добавить сообщение об ошибке пользователю, если нужно
                  this.errorMessage += ` Не удалось сохранить календарный график для файла ${file.name}.`;
              }
          } else {
              console.warn(`Данные на листе "График" не найдены или структура некорректна.`);
          }
              } else {
                  console.warn(`Лист "График" не найден в файле ${file.name}.`);
              }

          if (allDisciplePromises.length > 0) {
        console.log(`Запускаем параллельное добавление ${allDisciplePromises.length} дисциплин...`);

        await Promise.all(allDisciplePromises);
        
        console.log("Запрашиваем обновленные списки с сервера...");
        await this.getImport_ProgramList();
        await this.getImport_DiscipleList(); 
        
        this.loadImportPrograms(); 
        this.loadImportDisciples(); 
        
        console.log(`Файл ${file.name} полностью обработан.`);
    } else {
        console.log("Дисциплины для добавления не найдены.");
    }

    resolve(extractedData); 

        } catch (error) {
          if (programNameForErrorHandling) {
                // Если имя программы было извлечено, но потом произошла ошибка
                console.error(`Ошибка при обработке программы "${programNameForErrorHandling}" из файла ${file.name}. Программа не будет добавлена.`, error);
                
                // Отправляем запрос на инкремент счётчика
                axios.post('/api/counters/failed_import_attempts/increment')
                  .then(() => console.log("Счётчик 'failed_import_attempts' успешно инкрементирован."))
                  .catch(counterError => console.error("Не удалось инкрементировать счётчик ошибок:", counterError));

                // Завершаем промис успешно, чтобы не показывать ошибку пользователю и перейти к следующему файлу
                resolve({ status: 'failed_but_handled', fileName: file.name });
              } else {
                // Если ошибка произошла до извлечения имени, это критическая ошибка парсинга
                console.error(`Критическая ошибка при чтении файла ${file.name}, имя программы не извлечено.`, error);
                // Пробрасываем ошибку дальше
                reject(error);
              }
            }
          };

          reader.onerror = (error) => {
            console.error(`Ошибка на уровне FileReader для файла ${file.name}:`, error);
            reject(error); // Эта ошибка будет поймана внешним try/catch
          };

          reader.readAsArrayBuffer(file);
        });
      };


///XML!!!


      const QUALIFICATION_MAP = {
        '2': 'Бакалавр',
      }

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

              const planMetaElement = xmlDoc.querySelector("Планы"); 
          if (planMetaElement && planMetaElement.hasAttribute("УчебныйГод")) {
            extractedData.years = planMetaElement.getAttribute("УчебныйГод"); 
            
            if (planMetaElement.hasAttribute("ГодНачалаПодготовки")) {
                extractedData.start_year = planMetaElement.getAttribute("ГодНачалаПодготовки"); // -> "2021"
            } else {
                extractedData.start_year = extractedData.years.split('-')[0];
            }
          }

          const mainOOPElement = xmlDoc.querySelector("dsMMISDB > ООП");
          
          if (mainOOPElement) {
              if (mainOOPElement.hasAttribute("Название")) {
                  extractedData.program_name = mainOOPElement.getAttribute("Название");
              }
              if (mainOOPElement.hasAttribute("Шифр")) {
                  extractedData.code = mainOOPElement.getAttribute("Шифр");
              }
              if (mainOOPElement.hasAttribute("Квалификация")) {
                const qualificationCode = mainOOPElement.getAttribute("Квалификация");
                extractedData.qualification = QUALIFICATION_MAP[qualificationCode] || `Неизвестный код квалификации: ${qualificationCode}`;
              }
          }

          const profileElement = xmlDoc.querySelector("ООП > ООП");
          if (profileElement && profileElement.hasAttribute("Название")) {
            extractedData.profile = profileElement.getAttribute("Название");
          }

          if (extractedData.start_year && extractedData.years) {
              const startYear = parseInt(extractedData.start_year, 10);
              const yearStartStr = extractedData.years.split("-")[0];
              const yearStart = parseInt(yearStartStr, 10);

              const course = yearStart - startYear + 1;
              extractedData.current_course = course > 0 ? course : null;
          } else {
              extractedData.current_course = null;
          }
          
          console.log("Извлеченные данные:", extractedData);


              await this.postImport_Program(extractedData);
              await this.getImport_ProgramList();
              this.loadImportPrograms();

              const planRows = xmlDoc.getElementsByTagName("ПланыСтроки");
              const disciplines = [];

              for (let i = 0; i < planRows.length; i++) {
                const disciplineName = planRows[i].getAttribute("Дисциплина");
                if (disciplineName) {

                  const import_disciple = {
                  program_id: this.lastId - 1,
                  disciple_name: disciplineName,

                  //hours: getCellNumber(sheetP, `AG${row}`) ?? 0,
                  //contact_hours: getCellNumber(sheetP, `AH${row}`) ?? 0,
                  //lecture_hours: getCellNumber(sheetP, `AI${row}`) ?? 0,
                  //lab_hours: getCellNumber(sheetP, `AJ${row}`) ?? 0,
                  //practice_hours: getCellNumber(sheetP, `AK${row}`) ?? 0,
                  //ksr_hours: getCellNumber(sheetP, `AL${row}`) ?? 0,
                  //ikr_hours: getCellNumber(sheetP, `AM${row}`) ?? 0,
                  //independent_study_hours: getCellNumber(sheetP, `AN${row}`) ?? 0,
                  //control_hours: getCellNumber(sheetP, `AO${row}`) ?? 0,

                  department: departmentValue,
                  semester: validatedSemester
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
          console.log(`Загрузка ${file.name} в хранилище...`);
          const { data } = await axios.get('/api/upload/pre-signed', { params: { fileName: file.name } });
          await axios.put(data.url, file, { headers: { 'Content-Type': 'application/octet-stream' } });
          console.log(`✔ Файл ${file.name} успешно загружен в хранилище.`);

          let programData;
          if (file.name.toLowerCase().endsWith(".plx")) {
            programData = await readPLXFile(file);
          } else {
            programData = await readFile(file);
          }
          // Добавляем в результат только успешно обработанные данные
          if (programData && programData.status !== 'failed_but_handled') {
              programsData.push(programData);
          }
        }
        
        // Показываем сообщение об успехе только если были успешно загруженные файлы
        if (programsData.length > 0) {
            this.successMessage = `Успешно обработано: ${programsData.map(p => p.program_name).join(', ')}.`;
        }
        if (programsData.length === 0 && files.length > 0 && !this.errorMessage) {
            // Если ни один файл не был успешно обработан (но и ошибок не было), возможно, все они попали в "тихий" catch
            this.successMessage = `Обработка файлов завершена. Некоторые файлы могли быть пропущены из-за ошибок в данных.`;
        }
        console.log("Итоговые данные успешно добавленных программ:", programsData);

      } catch (error) {
        // Сюда попадут только критические ошибки (не удалось прочитать файл, не найден лист "Титул" и т.д.)
        console.error("Критическая ошибка при обработке файлов:", error);
        if (!this.errorMessage) {
          this.errorMessage = `Произошла критическая ошибка: ${error.message || 'Неизвестная ошибка'}.`;
        }
      } finally {
        this.isLoading = false;
        event.target.value = '';
      }
},

    async parseScheduleFromSheet(sheet) {
    if (!sheet) return [];

    const activityMap = {
        'Т': 'Теоретическое обучение', 'Э': 'Экзаменационная сессия',
        'У': 'Учебная практика', 'Н': 'Научно-исслед. работа',
        'П': 'Производственная практика', 'Пд': 'Преддипломная практика',
        'Д': 'Защита ВКР', 'Г': 'Гос. экзамены', 'К': 'Каникулы',
        '*': 'Теоретическое обучение'
    };
    const romanMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };

    // 1. Создаем "холст" и СРАЗУ ЗАПОЛНЯЕМ его символом теории 'Т' по умолчанию.
    const scheduleGrid = {
        1: Array(52).fill('Т'),
        2: Array(52).fill('Т'),
        3: Array(52).fill('Т'),
        4: Array(52).fill('Т'),
    };
    
    // 2. Проходимся по всем строкам Excel-файла
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
        const courseCell = sheet[XLSX.utils.encode_cell({c: 0, r: r})];
        if (!courseCell || !courseCell.v) continue;

        const roman = String(courseCell.v).trim().toUpperCase();
        const courseNum = romanMap[roman];

        if (courseNum) {
            // 3. "Вырезаем" из теории конкретные события
            for (let c = 1; c <= 52; c++) {
                const weekCell = sheet[XLSX.utils.encode_cell({c: c, r: r})];
                const symbol = weekCell ? String(weekCell.v).trim() : null;

                // Если в ячейке есть символ, он "перезаписывает" нашу теорию по умолчанию.
                // Символы '*' и 'Т' игнорируем, т.к. теория уже установлена.
                if (symbol && symbol !== '*' && symbol !== 'Т') {
                    scheduleGrid[courseNum][c - 1] = symbol;
                }
            }
        }
    }

    const finalPeriods = [];
    // 4. Группируем периоды для каждого курса на основе готового "холста"
    // (Эта часть остается без изменений, она сработает правильно на заполненном холсте)
    for (const courseNum of [1, 2, 3, 4]) {
        const weekActivities = scheduleGrid[courseNum];
        if (weekActivities.every(cell => cell === null)) continue;

        let currentSymbol = weekActivities[0];
        let startWeek = 1;

        for (let i = 1; i <= weekActivities.length; i++) {
            const nextSymbol = (i < weekActivities.length) ? weekActivities[i] : 'END_OF_LINE';
            if (nextSymbol !== currentSymbol) {
                if (currentSymbol) {
                    finalPeriods.push({
                        course: Number(courseNum),
                        activity: activityMap[currentSymbol] || `Неизвестно (${currentSymbol})`,
                        startWeek: startWeek,
                        endWeek: i,
                        symbol: currentSymbol
                    });
                }
                currentSymbol = nextSymbol;
                startWeek = i + 1;
            }
        }
    }
    
    return finalPeriods;
},

    async openScheduleViewer(program) {
        this.selectedProgramName = `${program.code} ${program.profile || ''}`.trim();
        this.currentScheduleData = []; // Очищаем старые данные
        this.showSchedule = true;
        this.isLoadingSchedule = true; // Показываем индикатор загрузки (нужно добавить в template)

        if (program.years) {
            this.academicYearWeeks = this.calculateAcademicYearWeeks(program.years);
        } else {
            this.academicYearWeeks = [];
            console.warn("Учебный год не указан для программы. Даты не будут отображаться.");
        }

        try {
            const response = await axios.get(`/api/v1/schedules/program/${program.id}`);
            const schedulesFromDb = response.data;

            // Преобразуем полученные DTO в формат, который ожидает ваш компонент
            const activityMap = {
                'Т': 'Теоретическое обучение', 'Э': 'Экзаменационная сессия', 'У': 'Учебная практика',
                'Н': 'Научно-исслед. работа', 'П': 'Производственная практика', 'Пд': 'Преддипломная практика',
                'Д': 'Защита ВКР', 'Г': 'Гос. экзамены', 'К': 'Каникулы', '*': 'Теоретическое обучение'
            };

            this.currentScheduleData = schedulesFromDb.map(dto => ({
                course: dto.courseNumber,
                symbol: dto.activitySymbol,
                activity: activityMap[dto.activitySymbol] || `Неизвестно (${dto.activitySymbol})`,
                startWeek: dto.startWeek,
                endWeek: dto.endWeek
            }));

            console.log(`График для программы ID ${program.id} успешно загружен из БД.`);

        } catch (error) {
            console.error(`Ошибка при загрузке графика для программы ID ${program.id}:`, error);
            // Показываем сообщение об ошибке пользователю
            this.currentScheduleData = []; // Оставляем пустым
        } finally {
            this.isLoadingSchedule = false; // Скрываем индикатор загрузки
        }
    },

    calculateAcademicYearWeeks(yearString) {
        // Извлекаем год начала, например, из "2022-2023" -> 2022
        const startYear = parseInt(yearString.split('-')[0], 10);
        if (isNaN(startYear)) return [];

        // Находим 1 сентября этого года
        let currentDate = new Date(startYear, 8, 1);
        
        // Находим первый понедельник сентября (1 = понедельник, 0 = воскресенье)
        while (currentDate.getDay() !== 1) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const weeks = [];
        for (let i = 0; i < 52; i++) {
            const weekStart = new Date(currentDate);
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6); // Неделя длится 7 дней (с пн по вс)

            weeks.push({
                week: i + 1,
                start: weekStart,
                end: weekEnd,
            });

            // Переходим к следующему понедельнику
            currentDate.setDate(currentDate.getDate() + 7);
        }
        return weeks;
    },

    // Новый метод для форматирования всплывающей подсказки
    getPeriodDateTitle(period) {
        if (!this.academicYearWeeks || this.academicYearWeeks.length === 0) {
            return `${period.activity} (Недели: ${period.startWeek}-${period.endWeek})`;
        }
        
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        
        // Находим дату начала и конца периода
        const startDate = this.academicYearWeeks[period.startWeek - 1]?.start.toLocaleDateString('ru-RU', options);
        const endDate = this.academicYearWeeks[period.endWeek - 1]?.end.toLocaleDateString('ru-RU', options);

        if (!startDate || !endDate) return period.activity;

        return `${period.activity} (${startDate} - ${endDate})`;
    },
    // END: ИЗМЕНЕННЫЙ КОД

    getPeriodsForCourse(courseNumber) {
        if (!this.currentScheduleData) return [];
        return this.currentScheduleData.filter(p => p.course === courseNumber);
    },

    getActivityColor(symbol) {
        const colors = {
            'Т': '#4CAF50', '*': '#4CAF50', 'Э': '#f44336', 'К': '#2196F3',
            'П': '#FF9800', 'Пд': '#E65100', 'У': '#FFC107', 'Д': '#9C27B0',
            'Г': '#673AB7', 'Н': '#795548'
        };
        return colors[symbol] || '#9E9E9E';
    },


    // КОНЕЦ ПАРСИНГА 

    async loadImportPrograms() {
      try {
        if (Array.isArray(this.import_programList)) {

          const allFiles = this.import_programList.filter(import_program => import_program.deleted_at === null);

          allFiles.sort((a, b) => a.id - b.id);

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
  // 1. Получаем уже отсортированный список из вычисляемого свойства.
  // Самый новый год всегда будет первым.
  if (this.yearsOptions && this.yearsOptions.length > 0) {
    
    // 2. Находим первую валидную опцию (у которой value не равно null).
    // Это гарантирует, что мы не выберем "Не выбрано", если эта опция вдруг окажется первой.
    const latestYearOption = this.yearsOptions.find(option => option.value !== null);

    if (latestYearOption) {
      // 3. Устанавливаем значение самого нового учебного года.
      this.workloadFormValues.academic_year = latestYearOption.value;
    } else {
      // Запасной вариант, если в списке только "Не выбрано"
      this.workloadFormValues.academic_year = null;
    }

  } else {
    // Если список годов пуст
    this.workloadFormValues.academic_year = null;
  }
  
  // 4. Открываем сайдбар.
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
  const deleteAllUrl = '/api/v1/import-programs/all'; 

  try {
    const response = await axios.delete(deleteAllUrl);

    if (response.status === 204) {
      this.successMessage = 'Все активные программы успешно удалены.';
      
      await this.getImport_ProgramList();
      await this.getImport_DiscipleList();
      
      this.loadImportPrograms(); 

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
      // 1. Найти все выбранные для удаления строки и собрать их ID
      const selectedRows = this.rowData.value.filter(row => row.selected === true);
      const idsToDelete = selectedRows.map(row => row.id).filter(id => id != null); // Убедимся, что ID не null

      // 2. Проверить, есть ли что удалять
      if (idsToDelete.length === 0) {
        this.errorMessage = 'Не выбраны программы для удаления.';
        // Очистить сообщение через несколько секунд для лучшего UX
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      // 3. Запросить подтверждение у пользователя
      const confirmationMessage = `Вы уверены, что хотите удалить ${idsToDelete.length} выбранных программ? Это действие также удалит все связанные с ними дисциплины.`;
      if (!window.confirm(confirmationMessage)) {
        console.log('Удаление отменено пользователем.');
        return;
      }

      // 4. Установить состояние загрузки и сбросить сообщения
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      // 5. Создать массив промисов для параллельного удаления
      const deletePromises = idsToDelete.map(id =>
        // Используем axios, который уже настроен в вашем проекте
        // и эндпоинт из предоставленного Java контроллера
        axios.delete(`/api/v1/import-programs/${id}`)
      );

      try {
        // Promise.allSettled дождется выполнения всех промисов, даже если некоторые из них завершатся с ошибкой
        const results = await Promise.allSettled(deletePromises);

        const successfulDeletes = [];
        const failedDeletes = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successfulDeletes.push(idsToDelete[index]);
          } else {
            console.error(`Ошибка при удалении программы с ID ${idsToDelete[index]}:`, result.reason);
            failedDeletes.push(idsToDelete[index]);
          }
        });

        // 6. Сформировать сообщения для пользователя
        if (successfulDeletes.length > 0) {
          this.successMessage = `Успешно удалено ${successfulDeletes.length} программ(ы).`;
        }

        if (failedDeletes.length > 0) {
          // Дополняем сообщение об ошибке, если уже есть сообщение об успехе
          this.errorMessage = `${this.errorMessage} Не удалось удалить ${failedDeletes.length} программ(ы). Подробности в консоли.`.trim();
        }

      } catch (error) {
        // Этот блок маловероятен с Promise.allSettled, но является хорошей практикой
        this.errorMessage = 'Произошла критическая ошибка в процессе удаления.';
        console.error("Critical error during batch deletion:", error);
      } finally {
        // 7. Обновить данные в UI независимо от результата, чтобы отразить успешные удаления
        // Вызываем существующие Pinia actions для обновления состояния
        await this.getImport_ProgramList();
        await this.getImport_DiscipleList(); // Также обновляем дисциплины, так как они тоже удаляются
        this.loadImportPrograms(); // Этот метод обновляет rowData.value

        this.isLoading = false;
      }
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

    scheduleLegend() {
      return [
        { symbol: 'Т/*', label: 'Теория', color: this.getActivityColor('Т') },
        { symbol: 'Э', label: 'Сессия', color: this.getActivityColor('Э') },
        { symbol: 'К', label: 'Каникулы', color: this.getActivityColor('К') },
        { symbol: 'У/П', label: 'Практика', color: this.getActivityColor('П') },
        { symbol: 'Д/Г', label: 'ГИА', color: this.getActivityColor('Д') },
        { symbol: 'Н', label: 'НИР', color: this.getActivityColor('Н') },
      ];
    },
    months() {
        if (!this.academicYearWeeks || this.academicYearWeeks.length === 0) {
             // Возвращаем статичный вариант, если дат нет
            return [
                { name: 'Сен', start: 1, span: 4 }, { name: 'Окт', start: 5, span: 4 },
                { name: 'Ноя', start: 9, span: 4 }, { name: 'Дек', start: 13, span: 5 },
                { name: 'Янв', start: 18, span: 4 }, { name: 'Фев', start: 22, span: 4 },
                { name: 'Мар', start: 26, span: 4 }, { name: 'Апр', start: 30, span: 4 },
                { name: 'Май', start: 34, span: 5 }, { name: 'Июн', start: 39, span: 4 },
                { name: 'Июл', start: 43, span: 5 }, { name: 'Авг', start: 48, span: 5 },
            ];
        }

        const monthList = [];
        let currentMonthData = null;

        this.academicYearWeeks.forEach(week => {
            const monthName = week.start.toLocaleString('ru-RU', { month: 'short' });
            const year = week.start.getFullYear();
            const fullMonthName = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} '${String(year).slice(-2)}`;
            
            if (!currentMonthData || currentMonthData.name !== fullMonthName) {
                if (currentMonthData) {
                    monthList.push(currentMonthData);
                }
                currentMonthData = {
                    name: fullMonthName,
                    start: week.week,
                    span: 1,
                };
            } else {
                currentMonthData.span++;
            }
        });

        if (currentMonthData) {
            monthList.push(currentMonthData);
        }

        return monthList;
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

.header-year-selector .form-select-sm {
  width: 150px; /* Можете подобрать ширину по своему вкусу */
  height: 2rem;
  padding-top: .25rem;
  padding-bottom: .25rem;
  padding-left: .5rem;
  font-size: .875rem;
}

/* СТИЛИ ТОЛЬКО ДЛЯ ГРАФИКА */
.schedule-display-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow-x: auto; /* Добавляем горизонтальный скролл на всякий случай */
}

.legend-item {
  font-size: 14px;
}

.legend-color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.1);
}

.timeline-container {
  width: 100%;
  position: relative;
  min-width: 800px; /* Минимальная ширина, чтобы месяцы не сжимались */
}

/* Ключевые стили для создания сетки */
.timeline-header, .timeline-track {
  display: grid;
  /* Создаем 52 колонки равной ширины для 52 недель */
  grid-template-columns: repeat(52, 1fr); 
  grid-gap: 2px; /* Небольшой отступ между неделями */
}

.timeline-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 4px;
  margin-bottom: 5px;
}

.month-label {
  /* Этот элемент будет размещен в сетке родителя .timeline-header */
  text-align: center;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  border-right: 1px dotted #ccc;
  padding: 2px 0;
}
.month-label:last-child {
  border-right: none;
}

.timeline-track {
  height: 35px; /* Немного увеличим высоту для лучшей читаемости */
  background-color: #f4f6f8;
  border-radius: 5px;
  padding: 2px;
}

.timeline-period {
  /* Этот элемент будет размещен в сетке родителя .timeline-track */
  grid-row: 1; /* Гарантирует, что все блоки будут на одной линии */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.timeline-period:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
  z-index: 10;
}

.timeline-period-symbol {
  text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
}

</style>
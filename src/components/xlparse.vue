<template>
   <div class="col col-xs-9 col-lg-12 mt-4 list">
    <div class="col col-12">
      <div class="mb-3 col col-12">

        <div class="col col-6 float-start d-inline-flex align-items-center mb-2 ">
          <input type="file" @change="onFileChange" multiple accept=".xlsx, .xls" >
        </div>

        <div v-if="loading" class="col col-6 float-end d-inline-flex align-items-center gap-2">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <span>Загрузка файлов...</span>
        </div>

        <div class="col col-6 float-end d-inline-flex align-items-center gap-2">
      <button @click="clearFilters" type="button" class="btn btn-danger btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">close</i>Очистить
      </button>

      <button @click="saveData" type="button" class="btn btn-success btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">save</i>Сохранить
      </button>

      <button @click="loadData" type="button" class="btn btn-primary btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">assignment</i>Нагрузка
      </button>
    </div>


      </div>
    </div>

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
  
</template>

<script>

import { AgGridVue } from "ag-grid-vue3"; 
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/ListenerButtonCell.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { useUploaded_FileStore } from "@/store2/uploadedfilegroup/uploaded_file";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";

import {
  emailRule,
  minLengthRule,
  phoneRule,
  requiredRule,
} from "@/model/form/validation/rules";
import { TextInput } from "@/model/form/inputs/TextInput";
import { MaskInput } from "@/model/form/inputs/MaskInput";
import { DateInput } from "@/model/form/inputs/DateInput";
import { CheckboxInput } from "@/model/form/inputs/CheckboxInput";
import { RadioInput } from "@/model/form/inputs/RadioInput";
import { ToggleInput } from "@/model/form/inputs/ToggleInput";
import { ComboboxInput } from "@/model/form/inputs/ComboboxInput";
import Uploaded_File from "@/model/uploaded_file-group/Uploaded_File";

import * as XLSX from 'xlsx';

export default {
  name: 'xlparse',
  components: {
    AgGridVue,
    ButtonCell,
    AutoForm,
  },
  setup() {

    const gridApi = ref(null);
    const gridColumnApi = ref();
    
    const dataFromApi = ref(null); // This will store the data from the API
    const dataLoaded = ref(false);

    const route = useRoute();

    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };
    const navigateToListener = () => {};

    const rowData = reactive({}); // Set rowData to Array of Objects, one Object per Row

    const columnDefs = reactive({
      value: [
      {
      sortable: false,
      filter: false,
      headerName: 'Действия',
      cellRenderer: 'ButtonCell',
      cellRendererParams: {
        label: 'View Details', // Button label
      },
      maxWidth: 120, 
      resizable: false
    },
   
           { 
            field: "direction_code", 
            headerName: 'Код направления', 
          }, 
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 300
    };

    onMounted(() => {});

    const onFilterTextBoxChanged = () => {
      gridApi.value.setQuickFilter(
        document.getElementById('filter-text-box').value
      );
    };

    return {
      onGridReady,
      columnDefs,
      rowData,
      defaultColDef,

      deselectRows: () =>{
        gridApi.value.deselectAll()
      },

      onFilterTextBoxChanged,
      paginationPageSize,
      navigateToListener,
      dataFromApi,
      dataLoaded,
    };

  },
  
  data() {
    return {
      loading: false,
      formVisible:false,
    quickFilterValue: '',
    filters:false,
    uploaded_file: new Uploaded_File()
    };
  },
  async mounted() {
    try {
    await this.getUploaded_FileList();
    this.loadListenersData();
  } catch (error) {
    console.error("Ошибка при загрузке данных слушателей:", error);
  }
  },


  
  methods: {
    ...mapActions(useUploaded_FileStore, [
      "getUploaded_FileList",
      "postUploaded_File",
      ,
      "putUploaded_File",
      "deleteUploaded_File",
    ]),

    onFileChange(event) {
      this.loading = true; // Устанавливаем флаг в true при начале загрузки

const files = event.target.files;
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const reader = new FileReader();
  reader.onload = (e) => {
    // Здесь загрузка данных, но мы не обрабатываем файл, создавая "вечную" загрузку
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Пример намеренного "зависания" — мы не вызываем findCell или другую обработку
    console.log('Загрузка файла началась, но мы её не завершаем.');
    
    // Намеренно не завершаем обработку данных
    // Загрузка останется в состоянии ожидания
  };
  reader.readAsArrayBuffer(file);
}

      //const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, {type: 'array'});
          this.findCell(workbook);
        };
        reader.readAsArrayBuffer(file);
      }
  },
  findCell(workbook) {
  const searchValue = 'Направление подготовки';
  const qualificationPrefix = 'Квалификация:';
  const academicYearLabel = 'Учебный год';

  // Получаем первый лист в рабочей книге
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) {
    console.log('Первый лист не найден');
    return;
  }

  let academicYearCellAddress = null;

  // Обрабатываем объединенные ячейки
  if (sheet['!merges']) {
    sheet['!merges'].forEach(merge => {
      const start = merge.s; // Начальная ячейка {c: Column, r: Row}
      const startAddress = XLSX.utils.encode_cell(start);
      const cell = sheet[startAddress];

      if (cell && cell.v) {
        const mergedCellValue = cell.v.toString();
        if (mergedCellValue.includes(academicYearLabel)) {
          // Если это объединение содержит "Учебный год"
          const end = merge.e;   // Конечная ячейка {c: Column, r: Row}
          academicYearCellAddress = XLSX.utils.encode_cell({c: end.c + 1, r: end.r});
        }
      }
    });
  }

  // Перебираем все ячейки первого листа
  for (const cell in sheet) {
    if (cell.startsWith('!')) continue;  // Пропускаем служебные ячейки

    if (sheet[cell] && sheet[cell].v) {
      const cellValue = sheet[cell].v.toString();
      if (cellValue.startsWith(searchValue)) {
        const info = cellValue.slice(searchValue.length).trim();
        const [directionCode, ...directionName] = info.split(' ');
        const name = directionName.join(' ');
        console.log(`Код направления: ${directionCode}, название: ${name}`);
      } else if (cellValue.startsWith(qualificationPrefix)) {
        const qualification = cellValue.slice(qualificationPrefix.length).trim();
        console.log(`Квалификация: ${qualification}`);
      } else if (!academicYearCellAddress && cellValue.includes(academicYearLabel)) {
        // Если ячейка не объединена и содержит "Учебный год"
        academicYearCellAddress = this.getNextCellAddress(cell);
      }
    }
  }

  // Получаем ячейку справа от "Учебный год"
  if (academicYearCellAddress && sheet[academicYearCellAddress]) {
    const nextCellValue = sheet[academicYearCellAddress].v ? sheet[academicYearCellAddress].v : 'Ячейка отсутствует';
    console.log(`Текст в ячейке справа от "Учебный год": ${nextCellValue}`);
  } else {
    console.log('Ячейка справа от "Учебный год" не найдена или пуста');
  }
},
// Функция для получения адреса следующей ячейки по горизонтали
getNextCellAddress(cellAddress) {
  const match = cellAddress.match(/([A-Z]+)(\d+)/);
  const col = match[1];
  const row = match[2];

  // Получаем следующую колонку в Excel формате
  let nextCol = String.fromCharCode(col.charCodeAt(0) + 1);
  return nextCol + row;
},

async loadListenersData() {
  try {
    if (Array.isArray(this.listenerList)) {
      this.rowData.value = this.listenerList.filter(listener => listener.deleted_at === null);
    } else if (this.listenerList && this.listenerList.deleted_at === null) {
      this.rowData.value = [this.listenerList];
    } else {
      this.rowData.value = [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных слушателей:", error);
    this.rowData.value = [];  // Очистка в случае ошибки
  }
},
resetList() {
      this.uploaded_file = new Uploaded_File();
    },
openCreatingForm() {
      this.resetList();
      this.formVisible = true;
    },
onFirstDataRendered(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      // Check if filterModel exists in the route query
      const filterModelQuery = this.$route.query.filterModel;
      if (filterModelQuery) {
        const filterModel = JSON.parse(filterModelQuery);
        this.gridApi.setFilterModel(filterModel);
        this.filters=true;
      }

      const quickFilterQuery = this.$route.query.quickFilter;
      if (quickFilterQuery) {
        const quickFilter = JSON.parse(quickFilterQuery);
        this.gridApi.setQuickFilter(quickFilter);
        this.quickFilterValue = quickFilter;
        this.filters=true;
      }
    },
    onFilterChanged() {
  // This function will be called whenever filters change.
  // You can perform your desired action here.
  // For example, you can get the current filter model:
  this.filters=false;
  const savedQuickFilter = this.gridApi.getQuickFilter();
  const savedFilterModel = this.gridApi.getFilterModel();

  // Initialize an empty object for queryParams
  const queryParams = {};

  // Check if savedQuickFilter is not empty, then add it to queryParams
  if (savedQuickFilter) {
    queryParams.quickFilter = JSON.stringify(savedQuickFilter);
    this.filters=true;
  }

  // Check if savedFilterModel is not empty, then add it to queryParams
  if (savedFilterModel && Object.keys(savedFilterModel).length > 0) {
    queryParams.filterModel = JSON.stringify(savedFilterModel);
    this.filters=true;
  }

  // Push the query parameters to the router
  this.$router.push({ query: queryParams });

  // Do something with the filterModel or trigger other actions as needed.
},

  clearFilters(){
    this.gridApi.setFilterModel();
    this.gridApi.setQuickFilter();
    this.quickFilterValue='';
    this.filters=false;
  }
},
  
computed: {
    ...mapState(useUploaded_FileStore, ["uploaded_file"]),
    currentUser() {
      return this.$store.state.auth.user;
    },
    
  }
}
</script>

<style scoped>
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
</style>
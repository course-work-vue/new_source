<template>
   <div class="col col-xs-9 col-lg-12 mt-4 list">
    <div class="col col-12">
      <div class="mb-3 col col-12">

        <div class="col col-6 float-start d-inline-flex align-items-center mb-2 ">
          <input type="file" @change="onFileChange" multiple accept=".xlsx, .xls" >
        </div>

        <div class="col col-6 float-end d-inline-flex align-items-center gap-2">
      <button @click="clearData" type="button" class="btn btn-danger btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">close</i>Очистить
      </button>

      <button @click="saveData" type="button" class="btn btn-success btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">save</i>Сохранить
      </button>

      <button @click="showGruz" type="button" class="btn btn-primary btn-sm d-flex align-items-center">
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
  
  <Sidebar
      v-model:visible="showSidebar1"
      position="bottom"
      modal
      :header="'Учебный план для ' + uploaded_file.direction_code + ': ' + uploaded_file.direction_name + ' на ' + uploaded_file.academic_year"
      class="custom-sidebar h-auto"
      :style="{ width: '70%', maxHeight: '700px', height: 'auto',margin: 'auto'}"
    >

    <div class="card flex flex-row">
  <div class="form card__form" style="display: flex; flex-wrap: wrap;">
    <div style="flex: 0 0 50%; padding: 10px;">
      <label>Профиль: </label>
      <span>{{ uploaded_file.specialization }}</span>
    </div>
    <div style="flex: 0 0 50%; padding: 10px;">
      <label>Квалификация: </label>
      <span>{{ uploaded_file.qualification }}</span>
    </div>
    <div style="flex: 0 0 50%; padding: 10px;">
      <span>{{ uploaded_file.faculty }}</span>
    </div>
    <div style="flex: 0 0 50%; padding: 10px;">
      <label>Кафедра: </label>
      <span>{{ uploaded_file.direction_name }}</span>
    </div>
    <div style="flex: 0 0 50%; padding: 10px;">
      <label>Год начала: </label>
      <span>{{ uploaded_file.start_year }}</span>
    </div>
    <div style="flex: 0 0 50%; padding: 10px;">
      <label>Срок обучения: </label>
      <span>{{ uploaded_file.duration_of_study + 'г' }}</span>
    </div>
  </div>
</div>

<div class="load-selector-container" style="display: flex; gap: 20px; padding-top: 20px;">
  <div class="load-selector">
    <label for="load-select-1" id="load-select-2" class="my-selectbox">Курс:</label>
    <select v-model.number="selectedCourse" @change="filterData">
      <option disabled value="">Выберите курс</option>
      <option v-for="option in [1, 2, 3, 4]" :key="option">{{ option }}</option>
    </select>
  </div>

  <div class="load-selector">
    <label for="load-select-2">Семестр:</label>
    <select v-model.number="selectedOption2" id="load-select-2" class="my-selectbox" @change="filterData">
      <option disabled value="">Выберите семестр</option>
      <option v-for="option in availableSemesters" :key="option">{{ option }}</option>
    </select>
  </div>
</div>

  <div style="height: 50vh">
      <div class="h-100 pt-5">
        <ag-grid-vue
    class="ag-theme-alpine"
    style="width: 100%; height: 100%;"
    :columnDefs="columnDefs1.value"
    :rowData="filteredRowData1"
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

</Sidebar>

    <Sidebar
      v-model:visible="showSidebar2"
      position="bottom"
      modal
      header="Нагрузка"
      class="custom-sidebar h-auto"
      :style="{ width: '70%', maxHeight: '700px', height: 'auto',margin: 'auto'}"
    >

    <template #header>
  <div class="header-content-wrapper">
    <div class="header-content">
      <span>Кафедра</span>
      <select v-model="selectedOption" id="load-select" class="my-selectbox">
        <option disabled value="">Выберите кафедру</option>
        <option v-for="option in uniqueDepartments" :key="option">{{ option }}</option>
      </select>
    </div>
    <div class="header-content">
    <span>Таблица</span>
    <select v-model="selectedOption4" id="load-select" class="my-selectbox">
      <option disabled value="">Выберите кафедру</option>
      <option v-for="option in ['Итого ВО']" :key="option">{{ option }}</option>
    </select>
  </div>
  </div>
</template>


<div style="height: 50vh">
    <div class="h-100 pt-5">
      <ag-grid-vue
        class="ag-theme-alpine"
        style="width: 100%; height: 100%;"
        :columnDefs="currentColumnDefs2"
        :rowData="filteredRowData"
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

    </Sidebar>


</template>

<script>

import { AgGridVue } from "ag-grid-vue3"; 
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
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
            maxWidth: 200
          }, 
          { 
            field: "direction_name", 
            headerName: 'Направление', 
            minWidth: 500, 
          }, 
          { 
            field: "qualification", 
            headerName: 'Квалификация', 
            maxWidth: 200, 
          }, 
          { 
            field: "academic_year", 
            headerName: 'Учебный год', 
          }, 
      ],
    });

    const columnDefs1 = reactive({
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
            field: "total_hours", 
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
      columnDefs1,
      columnDefs2,
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
      selectedOption4: 'Итого ВО',
      columnDefs2Options: {
        "Итого ВО": [
          { field: "index_code", headerName: "Год", maxWidth: 200 },
          { 
            field: "total_hours", 
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
        "Все дисциплины": [
          { field: "index_code", headerName: "Код дисциплины", maxWidth: 200 },
          { field: "discipline_name", headerName: "Название дисциплины", minWidth: 500 },
          { field: "credits", headerName: "Зачетные единицы", maxWidth: 150 },
          { field: "hours", headerName: "Часы", maxWidth: 150 },
        ]
      },


      showSidebar1: false,
      showSidebar2: false,
      firstScheme: null,
      quickFilterValue: '',
      filters:false,
      uploaded_file: new Uploaded_File(),
      errors: {},

      selectedCourse: '', 

      columnDefs2:[],
      rowDataAll: {
        'Итого ВО': [ /* Данные для опции "Итого ВО" */ ],
        'Все дисциплины': [ /* Данные для опции "Все дисциплины" */ ]
      },
      

    filteredRowData1: [],
    };
  },
  async mounted() {
    try {
    await this.getUploaded_FileList();
    this.loadUploadedFiles();
    this.filterData();
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
  },


  
  methods: {
    ...mapActions(useUploaded_FileStore, [
      "getUploaded_FileList",
      "postUploaded_File",
      ,
      "putUploaded_File",
      "deleteUploaded_File",
    ]),
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    resetUpd() {
      this.uploaded_file = new Uploaded_File();
    },
    edit(event) {
      this.resetUpd();
      this.uploaded_file = event.data;
      //console.log(this.listener);
      this.showSidebar1 = true;
    },

    filterData() {
  console.log('Selected course:', this.selectedCourse); 
  console.log('Selected semester:', this.selectedOption2); 
  console.log('Uploaded file list:', this.uploaded_fileList);

  if (this.selectedCourse || this.selectedOption2) {  
    this.filteredRowData1 = this.uploaded_fileList.filter((file) => {
      console.log('Processing file:', file);  
      let matchesCourse = true;
      let matchesSemester = true;

      if (this.selectedCourse) {
        matchesCourse = file.kurs === parseInt(this.selectedCourse, 10);
      }

      if (this.selectedOption2) {
        matchesSemester = file.semester === parseInt(this.selectedOption2, 10);
      }

      console.log('File.kurs:', file.kurs);  
      console.log('File.semester:', file.semester); 

      return matchesCourse && (!this.selectedOption2 || matchesSemester);
    });

    console.log('Filtered data:', this.filteredRowData1);
  } else {
    this.filteredRowData1 = this.uploaded_fileList;
  }

  console.log('Final filteredRowData:', this.filteredRowData1);
},


    async onFileChange(event) {
  const files = event.target.files;

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          this.findCell(workbook);

          await this.findAndPostKursData11(workbook);
          await this.findAndPostKursData12(workbook);
          await this.findAndPostKursData21(workbook);
          await this.findAndPostKursData22(workbook);
          await this.findAndPostKursData31(workbook);
          await this.findAndPostKursData32(workbook);
          await this.findAndPostKursData41(workbook);
          await this.findAndPostKursData42(workbook);

          resolve(); 
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

  try {
    const uploadPromises = Array.from(files).map(file => readFile(file));

    await Promise.all(uploadPromises);

    await this.getUploaded_FileList(); 
    await this.loadUploadedFiles(); 
  } catch (error) {
    console.error('Ошибка при загрузке файлов:', error);
  }
},

isUploadedFileValid(uploaded_file) {
  return uploaded_file.direction_code && 
         uploaded_file.direction_name && 
         uploaded_file.qualification && 
         uploaded_file.academic_year;
},


  findCell(workbook) {
  const searchValue = 'Направление подготовки';
  const qualificationPrefix = 'Квалификация:';
  const academicYearLabel = 'Учебный год';
  const educationTermPrefix = 'Срок получения образования: ';

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

        this.uploaded_file.direction_code = directionCode;
        this.uploaded_file.direction_name = name;

      } else if (cellValue.startsWith(qualificationPrefix)) {
        const qualification = cellValue.slice(qualificationPrefix.length).trim();

        this.uploaded_file.qualification = qualification;

      } else if (!academicYearCellAddress && cellValue.includes(academicYearLabel)) {
        // Если ячейка не объединена и содержит "Учебный год"
        academicYearCellAddress = this.getNextCellAddress(cell);
      } else if (cellValue.startsWith(educationTermPrefix)) {
        // блок для поиска "Срок получения образования"
        const educationTerm = cellValue.slice(educationTermPrefix.length).trim();
        const termValue = parseInt(educationTerm.match(/\d+/)[0]); // Извлечение числа
        this.uploaded_file.duration_of_study = termValue;
      }
    }
  }

  // Получаем ячейку справа от "Учебный год"
  if (academicYearCellAddress && sheet[academicYearCellAddress]) {
    const nextCellValue = sheet[academicYearCellAddress].v ? sheet[academicYearCellAddress].v : 'Ячейка отсутствует';
    this.uploaded_file.academic_year = nextCellValue;
  } else {
  }

  //Загружаю данные с титульника
  this.findAdjacentCells(sheet);
},

findAdjacentCells(sheet) {
  const keywords = {
    'Профиль': null,
    'Кафедра': null,
    'Факультет': null,
    'Год начала подготовки (по учебному плану)': null,
  };

  // Обрабатываем объединенные ячейки
  if (sheet['!merges']) {
    sheet['!merges'].forEach(merge => {
      const start = merge.s; // Начальная ячейка {c: Column, r: Row}
      const startAddress = XLSX.utils.encode_cell(start);
      const cell = sheet[startAddress];

      if (cell && cell.v) {
        const mergedCellValue = cell.v.toString();
        for (const key in keywords) {
          if (mergedCellValue.includes(key)) {
            const end = merge.e;   // Конечная ячейка {c: Column, r: Row}
            const nextCellAddress = XLSX.utils.encode_cell({ c: end.c + 1, r: end.r });
            keywords[key] = nextCellAddress;
          }
        }
      }
    });
  }

  // Перебираем все ячейки листа для поиска ключевых слов
  for (const cell in sheet) {
    if (cell.startsWith('!')) continue;

    if (sheet[cell] && sheet[cell].v) {
      const cellValue = sheet[cell].v.toString();

      for (const key in keywords) {
        if (!keywords[key] && cellValue.includes(key)) {
          keywords[key] = this.getNextCellAddress(cell);
        }
      }
    }
  }


//Запись полей титульника

  if (keywords['Кафедра'] && sheet[keywords['Кафедра']]) {
    const departmentValue = sheet[keywords['Кафедра']].v ? sheet[keywords['Кафедра']].v : 'Значение отсутствует';
    this.uploaded_file.department = 'Кафедра ' + departmentValue;
  }

  if (keywords['Факультет'] && sheet[keywords['Факультет']]) {
    const facultyValue = sheet[keywords['Факультет']].v ? sheet[keywords['Факультет']].v : 'Значение отсутствует';
    this.uploaded_file.faculty = 'Факультет ' + facultyValue;
  }

  if (keywords['Год начала подготовки (по учебному плану)'] && sheet[keywords['Год начала подготовки (по учебному плану)']]) {
    const startYearValue = sheet[keywords['Год начала подготовки (по учебному плану)']].v ? sheet[keywords['Год начала подготовки (по учебному плану)']].v : 'Значение отсутствует';
    this.uploaded_file.start_year = startYearValue;
  }

  if (keywords['Профиль'] && sheet[keywords['Профиль']]) {
    const profileValue = sheet[keywords['Профиль']].v ? sheet[keywords['Профиль']].v : 'Значение отсутствует';
    this.uploaded_file.specialization = profileValue;
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

async findAndPostKursData11(workbook) {
  const kursSheetName = "Курс 1";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `D${row}`;
      const discipleCellAddress = `E${row}`;
      const blockPartCellAddress = `G${row}`;
      const controlTypeCellAddress = `H${row}`;
      const totalHoursCellAddress = `I${row}`;
      const contactHoursCellAddress = `J${row}`;
      const lectureHoursCellAddress = `K${row}`;
      const labHoursCellAddress = `L${row}`;
      const practiceHoursCellAddress = `M${row}`;
      const ksrHoursCellAddress = `N${row}`;
      const ikrHoursCellAddress = `O${row}`;
      const srHoursCellAddress = `P${row}`;
      const controlFormCellAddress = `Q${row}`;
      const zECellAddress = `R${row}`;
      const weeksCellAddress = `S${row}`;
      const atCellAddress = `AT${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 1) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 1;
        kursData.semester = 1; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},

async findAndPostKursData12(workbook) {
  const kursSheetName = "Курс 1";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `D${row}`;
      const discipleCellAddress = `E${row}`;
      const blockPartCellAddress = `G${row}`;

      const controlTypeCellAddress = `T${row}`;
      const totalHoursCellAddress = `U${row}`;
      const contactHoursCellAddress = `V${row}`;
      const lectureHoursCellAddress = `W${row}`;
      const labHoursCellAddress = `X${row}`;
      const practiceHoursCellAddress = `Y${row}`;
      const ksrHoursCellAddress = `Z${row}`;
      const ikrHoursCellAddress = `AA${row}`;
      const srHoursCellAddress = `AB${row}`;
      const controlFormCellAddress = `AC${row}`;
      const zECellAddress = `AD${row}`;
      const weeksCellAddress = `AE${row}`;
      const atCellAddress = `AT${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 2) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 1;
        kursData.semester = 2; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},

async findAndPostKursData21(workbook) {
  const kursSheetName = "Курс 2";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `B${row}`;
      const discipleCellAddress = `C${row}`;
      const blockPartCellAddress = `E${row}`;

      const controlTypeCellAddress = `F${row}`;
      const totalHoursCellAddress = `G${row}`;
      const contactHoursCellAddress = `H${row}`;
      const lectureHoursCellAddress = `I${row}`;
      const labHoursCellAddress = `J${row}`;
      const practiceHoursCellAddress = `K${row}`;
      const ksrHoursCellAddress = `L${row}`;
      const ikrHoursCellAddress = `M${row}`;
      const srHoursCellAddress = `N${row}`;
      const controlFormCellAddress = `O${row}`;
      const zECellAddress = `P${row}`;
      const weeksCellAddress = `Q${row}`;
      const atCellAddress = `AR${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 3) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 2;
        kursData.semester = 3; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},

async findAndPostKursData22(workbook) {
  const kursSheetName = "Курс 2";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `B${row}`;
      const discipleCellAddress = `C${row}`;
      const blockPartCellAddress = `E${row}`;

      const controlTypeCellAddress = `R${row}`;
      const totalHoursCellAddress = `S${row}`;
      const contactHoursCellAddress = `T${row}`;
      const lectureHoursCellAddress = `U${row}`;
      const labHoursCellAddress = `V${row}`;
      const practiceHoursCellAddress = `W${row}`;
      const ksrHoursCellAddress = `X${row}`;
      const ikrHoursCellAddress = `Y${row}`;
      const srHoursCellAddress = `Z${row}`;
      const controlFormCellAddress = `AA${row}`;
      const zECellAddress = `AB${row}`;
      const weeksCellAddress = `AC${row}`;
      const atCellAddress = `AR${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 4) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 2;
        kursData.semester = 4; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},

async findAndPostKursData31(workbook) {
  const kursSheetName = "Курс 3";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `B${row}`;
      const discipleCellAddress = `C${row}`;
      const blockPartCellAddress = `E${row}`;

      const controlTypeCellAddress = `F${row}`;
      const totalHoursCellAddress = `G${row}`;
      const contactHoursCellAddress = `H${row}`;
      const lectureHoursCellAddress = `I${row}`;
      const labHoursCellAddress = `J${row}`;
      const practiceHoursCellAddress = `K${row}`;
      const ksrHoursCellAddress = `L${row}`;
      const ikrHoursCellAddress = `M${row}`;
      const srHoursCellAddress = `N${row}`;
      const controlFormCellAddress = `O${row}`;
      const zECellAddress = `P${row}`;
      const weeksCellAddress = `Q${row}`;
      const atCellAddress = `AR${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 5) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 3;
        kursData.semester = 5; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},

async findAndPostKursData32(workbook) {
  const kursSheetName = "Курс 3";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `B${row}`;
      const discipleCellAddress = `C${row}`;
      const blockPartCellAddress = `E${row}`;

      const controlTypeCellAddress = `R${row}`;
      const totalHoursCellAddress = `S${row}`;
      const contactHoursCellAddress = `T${row}`;
      const lectureHoursCellAddress = `U${row}`;
      const labHoursCellAddress = `V${row}`;
      const practiceHoursCellAddress = `W${row}`;
      const ksrHoursCellAddress = `X${row}`;
      const ikrHoursCellAddress = `Y${row}`;
      const srHoursCellAddress = `Z${row}`;
      const controlFormCellAddress = `AA${row}`;
      const zECellAddress = `AB${row}`;
      const weeksCellAddress = `AC${row}`;
      const atCellAddress = `AR${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 6) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 3;
        kursData.semester = 6; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},


async findAndPostKursData41(workbook) {
  const kursSheetName = "Курс 4";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `B${row}`;
      const discipleCellAddress = `C${row}`;
      const blockPartCellAddress = `E${row}`;

      const controlTypeCellAddress = `F${row}`;
      const totalHoursCellAddress = `G${row}`;
      const contactHoursCellAddress = `H${row}`;
      const lectureHoursCellAddress = `I${row}`;
      const labHoursCellAddress = `J${row}`;
      const practiceHoursCellAddress = `K${row}`;
      const ksrHoursCellAddress = `L${row}`;
      const ikrHoursCellAddress = `M${row}`;
      const srHoursCellAddress = `N${row}`;
      const controlFormCellAddress = `O${row}`;
      const zECellAddress = `P${row}`;
      const weeksCellAddress = `Q${row}`;
      const atCellAddress = `AR${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 7) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 4;
        kursData.semester = 7; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},

async findAndPostKursData42(workbook) {
  const kursSheetName = "Курс 4";
  const sheet = workbook.Sheets[kursSheetName];

  if (sheet) {
    console.log(`Лист "${kursSheetName}" найден.`);

    const uploadPromises = [];  // Массив для хранения промисов загрузки

    for (let row = 17; row <= 108; row++) {
      // Данные для семестра 1 (столбцы D-S)
      const indexCoreCellAddress = `B${row}`;
      const discipleCellAddress = `C${row}`;
      const blockPartCellAddress = `E${row}`;

      const controlTypeCellAddress = `R${row}`;
      const totalHoursCellAddress = `S${row}`;
      const contactHoursCellAddress = `T${row}`;
      const lectureHoursCellAddress = `U${row}`;
      const labHoursCellAddress = `V${row}`;
      const practiceHoursCellAddress = `W${row}`;
      const ksrHoursCellAddress = `X${row}`;
      const ikrHoursCellAddress = `Y${row}`;
      const srHoursCellAddress = `Z${row}`;
      const controlFormCellAddress = `AA${row}`;
      const zECellAddress = `AB${row}`;
      const weeksCellAddress = `AC${row}`;
      const atCellAddress = `AR${row}`; // Ячейка для проверки

      const indexCoreCell = sheet[indexCoreCellAddress];
      const discipleCell = sheet[discipleCellAddress];
      const blockPartCell = sheet[blockPartCellAddress];
      const controlTypeCell = sheet[controlTypeCellAddress];
      const totalHoursCell = sheet[totalHoursCellAddress];
      const contactHoursCell = sheet[contactHoursCellAddress];
      const lectureHoursCell = sheet[lectureHoursCellAddress];
      const labHoursCell = sheet[labHoursCellAddress];
      const practiceHoursCell = sheet[practiceHoursCellAddress];
      const ksrHoursCell = sheet[ksrHoursCellAddress];
      const ikrHoursCell = sheet[ikrHoursCellAddress];
      const srHoursCell = sheet[srHoursCellAddress];
      const controlFormCell = sheet[controlFormCellAddress];
      const zECell = sheet[zECellAddress];
      const weeksCell = sheet[weeksCellAddress];

      const atCell = sheet[atCellAddress];

      if (discipleCell && discipleCell.v && discipleCell.v.trim() && atCell && parseInt(atCell.v, 10) === 8) {
        const kursData = { ...this.uploaded_file };
        kursData.kurs = 4;
        kursData.semester = 8; // Семестр равен 1
        kursData.disciple_name = discipleCell.v.trim(); // Название дисциплины

        kursData.index_code = indexCoreCell?.v?.trim() ?? null;
        kursData.block_part = blockPartCell?.v?.trim() ?? null;
        kursData.control_type = controlTypeCell?.v ?? null;
        kursData.total_hours = totalHoursCell?.v ?? 0;
        kursData.contact_hours = contactHoursCell?.v ?? 0;
        kursData.lecture_hours = lectureHoursCell?.v ?? 0;
        kursData.lab_hours = labHoursCell?.v ?? 0;
        kursData.practice_hours = practiceHoursCell?.v ?? 0;
        kursData.ksr_hours = ksrHoursCell?.v ?? 0;
        kursData.ikr_hours = ikrHoursCell?.v ?? 0;
        kursData.sr_hours = srHoursCell?.v ?? 0;
        kursData.control_form = controlFormCell?.v ?? null;
        kursData.z_e = zECell?.v ?? null;
        kursData.weeks = typeof weeksCell?.v === 'string' ? weeksCell.v.trim() : weeksCell?.v ?? null;

        console.log('Данные для первого семестра перед отправкой:', kursData);

        if (this.isUploadedFileValid(kursData)) {
          uploadPromises.push(this.postUploaded_File(kursData));
        } else {
          console.warn(`Данные для дисциплины "${kursData.disciple_name}" не прошли валидацию.`);
        }
      }
    }

    try {
      this.showLoading = true; // Включаем индикатор загрузки
      await Promise.all(uploadPromises); // Ожидаем завершения всех запросов
      console.log('Все данные успешно отправлены.');
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    } finally {
      this.showLoading = false; // Отключаем индикатор загрузки после завершения
    }
  } else {
    console.warn(`Лист "${kursSheetName}" не найден.`);
  }
},

// КОНЕЦ ПАРСИНГА 
async deleteListeners() {
    try {
      // Проверяем, есть ли слушатели
      if (this.listenerList && this.listenerList.length > 0) {
        // Проходим по каждому слушателю и вызываем метод deleteListener
        for (let listener of this.listenerList) {
          if (!listener.deleted_at) {
            await this.deleteListener(listener);
          }
        }
        // После удаления всех слушателей обновляем данные
        this.loadListenersData();
        this.showSidebar1 = false; // Закрываем боковую панель, если была открыта
      } else {
        console.log('Нет слушателей для удаления');
      }
    } catch (error) {
      console.error("Ошибка при удалении всех слушателей:", error);
    }
  },
  async loadUploadedFiles() { 
  try {
    // Проверяем, загружен ли список файлов
    if (Array.isArray(this.uploaded_fileList)) {
      // Фильтруем удаленные файлы и убираем дубликаты по полям 'direction_code', 'direction_name', 'qualification', 'academic_year'
      const uniqueFiles = this.uploaded_fileList
        .filter(uploaded_file => uploaded_file.deleted_at === null)
        .reduce((acc, current) => {
          if (!acc.find(file => 
            file.direction_code === current.direction_code && 
            file.direction_name === current.direction_name && 
            file.qualification === current.qualification && 
            file.academic_year === current.academic_year)) {
            acc.push(current);
          }
          return acc;
        }, []);
      
      this.rowData.value = uniqueFiles;
    } else if (this.uploaded_fileList && this.uploaded_fileList.deleted_at === null) {
      this.rowData.value = [this.uploaded_fileList];
    } else {
      this.rowData.value = [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных файлов:", error);
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


    
    async submit() {
      let student = { ...this.student };

      if (student.student_id) {
        await this.putStudent(student);
      } else {
        await this.postStudent(student);
      }
      this.formVisible = false;
      this.resetStd();
      this.loadStudentsData();
    },

    async deleteStd() {
      let student = { ...this.student };
      console.log(student);
      await this.deleteStudent(student);
      this.formVisible = false;
      this.resetStd();
      this.loadStudentsData();
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

async clearData() { 
    console.log(this.uploaded_fileList);
    try {
      if (this.uploaded_fileList && this.uploaded_fileList.length > 0) {
        this.showLoading = true; 

        const deletePromises = this.uploaded_fileList
          .filter(file => !file.deleted_at) 
          .map(file => this.deleteUploaded_File(file));  

        await Promise.all(deletePromises);

        await this.loadUploadedFiles();
        this.showLoading = false;
      } else {
        console.log('Нет файлов для удаления');
      }
    } catch (error) {
      this.showLoading = false;
      console.error("Ошибка при удалении файлов:", error);
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

        await this.loadUploadedFiles();
        this.showLoading = false;
      } else {
        console.log('Нет файлов для удаления');
      }
    } catch (error) {
      this.showLoading = false;
      console.error("Ошибка при удалении файлов:", error);
    }
  },


  async showGruz() {

    console.log(this.uniqueDepartments)
    this.showSidebar2 = true;

  }
},
  
computed: {
    ...mapState(useUploaded_FileStore, ["uploaded_fileList"]),
    currentColumnDefs2() {
      return this.columnDefs2Options[this.selectedOption4];
    },
    uniqueDepartments() {
      // Собираем все департаменты из списка файлов
      const departments = this.uploaded_fileList.map((file) => file.department);
      // Возвращаем уникальные значения
      return [...new Set(departments.filter((dept) => dept))];
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
  }
  }
}
</script>

<style scoped>

.header-content-wrapper {
    display: flex;
    gap: 10px; /* Регулируйте значение для уменьшения/увеличения расстояния между элементами */
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

.list{
  padding-left: 100px;
  padding-right: 5px;

}
}
</style>
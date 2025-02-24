<template>

<div class="col col-6 float-end d-inline-flex align-items-center mb-2">
  <button
    @click="clearFilters"
    :disabled="!filters"
    class="btn btn-sm btn-primary text-nowrap mx-2 d-flex align-items-center"
    type="button"
  >
    <i class="material-icons-outlined" style="font-size: 18px; margin-right: 5px;">close</i>
    Очистить фильтры
  </button>

          <input
            class="form-control"
            type="text"
            v-model="quickFilterValue"
            id="filter-text-box"
            v-on:input="onFilterTextBoxChanged()"
            placeholder="Поиск..."
          />
        </div>

    <div class="col col-xs-9 col-lg-12 mt-4 list">
      
     <div class="col col-12">
      
       <div class="mb-3 col col-12">
 
         <div class="col col-6 float-start d-inline-flex align-items-center mb-2 ">
           <input type="file" @change="onFileChange" multiple accept=".xlsx, .xls, .plx" >
         </div>
 
         
         <div class="col col-6 float-end d-inline-flex align-items-center gap-2">
          <button @click="clearData" type="button" class="btn btn-danger btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">close</i>Удалить
    </button>

    <button @click="" type="button" class="btn btn-success btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">save</i>Сохранить
    </button>

    <button @click="openCompareForm" type="button" class="btn btn-warning btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">compare_arrows</i>Пересечение
    </button>

    <button @click="openArchiveForm" type="button" class="btn btn-primary btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">assignment</i>Архив
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

   <Sidebar
    v-model:visible="showCompare"
    position="bottom"
    modal
    header="Пересечение учебных планов"
    class="custom-sidebar h-auto"
    :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
  >

  <div style="height: 50vh">
       <div class="h-100 pt-5">
         <ag-grid-vue
     class="ag-theme-alpine"
     style="width: 100%; height: 100%;"
     :columnDefs="compareColumnDefs.value"
     :rowData="compareRowData"
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

  </Sidebar>

  <Sidebar
    v-model:visible="showArchive"
    position="bottom"
    modal
    header="Архив"
    class="custom-sidebar h-auto"
    :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
  >

  <div class="year-selector-container">
    <label for="yearSelect">Выберите год:</label>
    <select id="yearSelect" class="form-select" v-model="selectedYear">
      <option v-for="year in years" :key="year" :value="year">
        {{ year }}
      </option>
    </select>
  </div>

  <div style="height: 50vh">
       <div class="h-100 pt-5">
         <ag-grid-vue
     class="ag-theme-alpine"
     style="width: 100%; height: 100%;"
     :columnDefs="columnDefs.value"
     :rowData="filteredRowDataArchive"
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
  </Sidebar>

  <Sidebar
    v-model:visible="showDetails"
    position="bottom"
    modal
    header="Детали"
    class="custom-sidebar h-auto"
    :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
  >

  <div style="height: 50vh">
       <div class="h-100 pt-5">
         <ag-grid-vue
     class="ag-theme-alpine"
     style="width: 100%; height: 100%;"
     :columnDefs="detailColumnDefs.value"
     :rowData="detailRowData"
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

  </Sidebar>
 
 </template>
 
 <script>
 
 import { AgGridVue } from "ag-grid-vue3"; 
 import { reactive, onMounted, ref } from "vue";
 import ButtonCell from "@/components/import/ImportButtonCell.vue";
 import "ag-grid-community/styles/ag-grid.css"; 
 import "ag-grid-community/styles/ag-theme-alpine.css"; 
 
 import { useRoute } from "vue-router";
 import { mapState, mapActions } from "pinia";
 import { useUploaded_FileStore } from "@/store2/uploadedfilegroup/uploaded_file";
 import AutoForm from "@/components/form/AutoForm.vue";
 import { FormScheme } from "@/model/form/FormScheme";

 import { TextInput } from "@/model/form/inputs/TextInput";
 import Uploaded_File from "@/model/uploaded_file-group/Uploaded_File";
 import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";
 
 import * as XLSX from 'xlsx';
 
 export default {
   name: 'import',
   components: {
     AgGridVue,
     ButtonCell,
     AutoForm,
   },
   setup() {
 
    const localeText = AG_GRID_LOCALE_RU;
     const gridApi = ref(null);
     const gridColumnApi = ref();
     
     const dataFromApi = ref(null); 
     const dataLoaded = ref(false);
 
     const route = useRoute();
 
     const paginationPageSize = 60;
 
     const onGridReady = (params) => {
       gridApi.value = params.api;
       gridColumnApi.value = params.columnApi;
     };
     const navigateToListener = () => {};
 
     const rowData = reactive({}); 
     const detailRowData = ref({});
     const compareRowData = ref({});
     const years = reactive([]);
 
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
             maxWidth: 150, 
           }, 
           {
  headerName: 'Выбрать', 
  field: "selected", 
  cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  cellRenderer: (params) => {
    const isSelected = params.value || false;

    // Создаём div-контейнер для иконки
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.cursor = 'pointer';
    container.style.fontSize = '20px'; // Размер иконки
    container.style.color = isSelected ? 'green' : 'gray'; // Цвет активной галочки

    // Галочка или крестик
    container.innerHTML = isSelected ? '✔' : '';

    // Добавляем обработчик клика
    container.addEventListener('click', () => {
      const newValue = !isSelected; // Переключаем состояние
      params.node.setDataValue('selected', newValue);

      // Обновляем иконку и цвет
      container.innerHTML = newValue ? '✔' : '';
      container.style.color = newValue ? 'green' : 'gray';

      console.log(`Статус изменён: ${newValue ? 'Выбрано' : 'Снято'}`);
      console.log('Данные строки:', params.data);
    });

    return container;
  },
  maxWidth: 120 // Ограничиваем ширину
}
       ],
     });
 
     const detailColumnDefs = reactive({
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
       detailColumnDefs,
       compareColumnDefs,
       columnDefs2,
       rowData,
       detailRowData,
       compareRowData,
       years,
       defaultColDef,
       localeText,

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
      showCompare: false,
      showArchive: false,
      showDetails: false,
      selectedYear: null,
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
       this.openDetailsForm();
       console.log(this.uploaded_fileList)
       console.log(this.uploaded_file);
     },
 
     async onFileChange(event) {
  const files = event.target.files;

  const readFile = (file) => {
    console.log(`Прочитали файл: ${file.name}`);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

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
          code: "Не найден",
          direction: "Не найден",
          qualification: "Не найден",
          academicYear: "Не найден",
          faculty: "Не найден",
          duration_of_study: "Не найден"
        };

        // Получаем все теги в документе
        const allElements = xmlDoc.getElementsByTagName("*");

        for (let i = 0; i < allElements.length; i++) {
          let element = allElements[i];

          if (extractedData.code === "Не найден" && element.hasAttribute("Шифр")) {
            extractedData.code = element.getAttribute("Шифр");
          }
          if (extractedData.direction === "Не найден" && element.hasAttribute("Название")) {
            extractedData.direction = element.getAttribute("Название");
          }
          if (element.hasAttribute("Квалификация")) {
            extractedData.qualification = element.getAttribute("Квалификация");
          }
          if (element.hasAttribute("УчебныйГод")) {
            extractedData.academicYear = element.getAttribute("УчебныйГод");
          }
          if (extractedData.faculty === "Не найден" && element.hasAttribute("Факультет")) {
            extractedData.faculty = element.getAttribute("Факультет");
          }
          if (extractedData.duration_of_study === "Не найден" && element.hasAttribute("СрокОбучения")) {
            extractedData.duration_of_study = element.getAttribute("СрокОбучения");
          }
          if (
            extractedData.code !== "Не найден" &&
            extractedData.direction !== "Не найден" &&
            extractedData.qualification !== "Не найден" &&
            extractedData.academicYear !== "Не найден" &&
            extractedData.faculty !== "Не найден" &&
            extractedData.duration_of_study !== "Не найден"
          ) {
            break;
          }
        }

        console.log("Извлеченные данные из .plx:", extractedData);

        // Отправляем данные на дальнейшую обработку
        // await this.processPLXData(extractedData);

        resolve();
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
    const uploadPromises = Array.from(files).map((file) =>
      file.name.endsWith(".plx") ? readPLXFile(file) : readFile(file)
    );

    await Promise.all(uploadPromises);

    await this.getUploaded_FileList();
    await this.loadUploadedFiles();
  } catch (error) {
    console.error("Ошибка при загрузке файлов:", error);
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
         kursData.semester = 8; 
         kursData.disciple_name = discipleCell.v.trim();
 
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

 async loadUploadedFiles() { 
  try {
    if (Array.isArray(this.uploaded_fileList)) {
      // Фильтруем удаленные файлы
      const allFiles = this.uploaded_fileList.filter(uploaded_file => uploaded_file.deleted_at === null);

      this.detailRowData = allFiles;
      this.compareRowData = allFiles;

      const uniqueFiles = allFiles.reduce((acc, current) => {
        if (!acc.find(file => 
          file.direction_code === current.direction_code && 
          file.direction_name === current.direction_name && 
          file.qualification === current.qualification && 
          file.academic_year === current.academic_year)) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Сохраняем уникальные файлы в `rowData`
      this.rowData.value = uniqueFiles;

      // Создаем массив `years` с уникальными значениями `academic_year`
      this.years = [...new Set(uniqueFiles.map(file => file.academic_year))];

      // Выводим список уникальных лет в консоль
      console.log("Уникальные academic_years:", this.years);
      console.log("Все файлы (включая дубликаты):", this.detailRowData);
    } else if (this.uploaded_fileList && this.uploaded_fileList.deleted_at === null) {
      this.rowData.value = [this.uploaded_fileList];
      this.detailRowData = [this.uploaded_fileList];
    } else {
      this.rowData.value = [];
      this.detailRowData = [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных файлов:", error);
    this.rowData.value = [];  // Очистка в случае ошибки
    this.detailRowData = [];
  }
},
 
 resetList() {
    this.uploaded_file = new Uploaded_File();
  },

  openCompareForm() {
    this.showCompare = true;
  },
  openArchiveForm() {
    this.showArchive = true;
  },
  openDetailsForm() {
    this.showDetails = true;
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
  console.log("Файлы перед удалением:", this.uploaded_fileList);

  try {
    if (this.uploaded_fileList && this.uploaded_fileList.length > 0) {
      this.showLoading = true; 

      // 1. Находим ключевые поля у выбранных файлов
      const uniqueKeysToDelete = this.uploaded_fileList
        .filter(file => file.selected === true && !file.deleted_at)
        .map(file => ({
          direction_code: file.direction_code,
          direction_name: file.direction_name,
          qualification: file.qualification,
          academic_year: file.academic_year
        }));

      console.log("Ключи для удаления:", uniqueKeysToDelete);

      // 2. Находим все файлы, которые соответствуют найденным ключам
      const filesToDelete = this.uploaded_fileList.filter(file => 
        uniqueKeysToDelete.some(key => 
          key.direction_code === file.direction_code &&
          key.direction_name === file.direction_name &&
          key.qualification === file.qualification &&
          key.academic_year === file.academic_year
        )
      );

      // Выводим файлы, которые будут удалены
      if (filesToDelete.length > 0) {
        console.log("Файлы, которые будут удалены:", JSON.stringify(filesToDelete, null, 2));
      } else {
        console.log('Нет файлов для удаления');
      }

      // 3. Удаляем файлы по одному
      for (const file of filesToDelete) {
        await this.deleteUploaded_File(file);
      }

      // 4. Обновляем список файлов после удаления
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
     currentUser() {
       return this.$store.state.auth.user;
     },
     currentColumnDefs2() {
       return this.columnDefs2Options[this.selectedOption4];
     },
     filteredRowDataArchive() {
  const data = this.rowData.value || [];
  console.log(data)
  if (!this.selectedYear) return data;
  return data.filter(file => file.academic_year === this.selectedYear);
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
   },
   }
 }
 </script>
 
 <style scoped>
 
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
 
 .list{
   padding-left: 100px;
   padding-right: 5px;
 
 }
 }

.year-selector-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px; /* Уменьшаем отступ */
}

.year-selector-container label {
  margin-right: 5px; /* Уменьшаем отступ между текстом и селектором */
  font-size: 14px; /* Делаем текст меньше */
  white-space: nowrap; /* Предотвращаем перенос */
}

.year-selector-container select {
  width: 150px; /* Уменьшаем ширину селектора */
  height: 30px; /* Делаем его компактнее */
  font-size: 14px; /* Уменьшаем размер шрифта */
  padding: 2px 5px;
}

 </style>
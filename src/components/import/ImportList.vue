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
          <button
            @click="selectedCount === 0 ? clearData() : deleteSelected()"
            type="button"
            class="btn btn-danger btn-sm d-flex align-items-center"
          >
            <i class="material-icons-outlined me-2">close</i>
            {{ selectedCount === 0 ? 'Очистить' : 'Удалить выбранное' }}
          </button>
    
<!--
    <button @click="" type="button" class="btn btn-success btn-sm d-flex align-items-center">
        <i class="material-icons-outlined me-2">save</i>Сохранить
    </button>
-->
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
            :rowHeight="40"
            @cell-clicked="cellWasClicked"
            @grid-ready="onGridReady"
            @firstDataRendered="onFirstDataRendered"
            @filter-changed="onFilterChanged"
            domLayout="normal"
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
  @filter-changed="onFilterChanged"
  :pagination="true"            
  :paginationPageSize="paginationPageSize">
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
    
    <auto-form
            v-model="formValues"
            v-model:errors="errors"
            :scheme="archiveScheme"
            class="custom-form"
          >
          </auto-form>
    
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
  </Sidebar>

  <Sidebar
    v-model:visible="showDetails"
    position="bottom"
    modal
    :header="`Программа ${selectedDisciplineCode}`"
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

  </Sidebar>
 
 </template>
 
 <script>
 
 import { AgGridVue } from "ag-grid-vue3"; 
 import { computed, reactive, onMounted, ref } from "vue";
 import ButtonCell from "@/components/import/ImportButtonCell.vue";
 import "ag-grid-community/styles/ag-grid.css"; 
 import "ag-grid-community/styles/ag-theme-alpine.css"; 
 
 import { useRoute } from "vue-router";
 import { mapState, mapActions } from "pinia";
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

     const selectedCount = computed(() => {
      return Array.isArray(rowData.value)
        ? rowData.value.filter(item => item.selected === true).length
        : 0;
      });

      const lastId = computed(() => {
        return rowData.value?.length+1 ?? 0;
    });

     const detailRowData = ref({});
     const compareRowData = ref({});
     const codes = reactive([]);
     const years = reactive([]);
 
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
             maxWidth: 180
           }, 
           { 
             field: "profile", 
             headerName: 'Профиль', 
             minWidth: 880, 
           }, 
           { 
             field: "years", 
             headerName: 'Учебный год', 
             maxWidth: 150, 
           }, 
           {
  headerName: '', 
  field: "selected", 
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

      //console.log(`Статус изменён: ${newValue ? 'Выбрано' : 'Снято'}`);
      console.log('Данные строки:', params.data.code);
    });

    return container;
  },
  maxWidth: 120
}
       ],
     });
 
     const detailColumnDefs = reactive({
       value: [ 
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
       minWidth: 300
     };

     const importProgramStore = useImport_ProgramStore();
     const importDiscipleStore = useImport_DiscipleStore();

    const rowDataForComparison = computed(() => {
      // transformDisciples – функция, которая собирает данные в нужный вид
      return transformDisciples(importDiscipleStore.import_discipleList);
    });

    onMounted(async () => {
      await importProgramStore.getImport_ProgramCodesList(); 
  // или как у вас называется экшен/метод

  // Посмотрим, что там внутри
  console.log("Содержимое import_program_codesList:", importProgramStore.import_program_codesList);
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
      label: item.years, // то, что увидит пользователь
      value: item.years  // внутреннее значение (v-model)
    };
  });
});
     
     const onFilterTextBoxChanged = () => {
       gridApi.value.setQuickFilter(
         document.getElementById('filter-text-box').value
       );
     };

     const dynamicColumnDefs = computed(() => {
      const columns = [
        {
          headerName: 'Дисциплина',
          field: 'disciple_name',
          pinned: 'left',
          lockPinned: true,
          width: 200,
        }
      ];

      importProgramStore.import_programList.forEach(program => {
        columns.push({
          headerName: program.code,
          valueGetter: (params) => {
            return params.data.hoursByProgram?.[program.id] || 0;
          },
          width: 100,
        });
      });

      return columns;
    });
 
     return {
 
       onGridReady,
       columnDefs,
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
       programsOptions,
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
         "Все дисциплины": [
           { field: "index_code", headerName: "Код дисциплины", maxWidth: 200 },
           { field: "discipline_name", headerName: "Название дисциплины", minWidth: 500 },
           { field: "credits", headerName: "Зачетные единицы", maxWidth: 150 },
           { field: "hours", headerName: "Часы", maxWidth: 150 },
         ]
       },
 
       firstScheme: null,
       archiveScheme:null,
       quickFilterValue: '',
       filters:false,
       uploaded_file: new Uploaded_File(),
       import_program: new Import_Program(),
       import_program_year: new Import_Program_Year(),
       import_program_code: new Import_Program_Code(),
       import_disciple: new Import_Disciple(),
       errors: {},
 
       selectedCourse: '', 
       filteredRowData1: [],

        formValues: {
          codes: null, // выбранная программа
          years: null, // выбранный год
        },
     };
   },
   async mounted() {
     try {
     await this.getImport_ProgramList();
     await this.getImport_ProgramYearsList();
     await this.getImport_ProgramCodesList();

     await this.getImport_DiscipleList();
     this.loadImportPrograms();
     this.loadImportDisciples();
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
        key: "codes",
        label: "Программа",
        placeholder: "Выберите программу",
        options: this.programsOptions,
      }),
      new ComboboxInput({
        key: "years",
        label: "Год",
        placeholder: "Выберите Год",
        options: this.yearsOptions,
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
       "postImport_Disciple",
       "putImport_Disciple",
       "deleteImport_Disciple",
     ]),
     cellWasClicked(event) {
       if (event.colDef && event.colDef.headerName === "") {
         this.edit(event);
       }
     },
     resetUpd() {
       this.uploaded_file = new Uploaded_File();
     },
     edit(event) {
       this.resetUpd();
       this.selectedDisciplineCode = event.data.code;
       console.log(event.data);
       this.openDetailsForm();
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

        // Читаем данные с листа "Титул"
        const sheetName = "Титул";
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          throw new Error(`Лист "${sheetName}" не найден`);
        }

        let extractedData = {
          code: "Не найден",
          profile: "Не найден",
          years: "Не найден",
        };

        extractedData.code = "04.04.04";
        extractedData.profile = sheet["D30"] ? sheet["D30"].v : null;
        extractedData.years = sheet["W41"] ? sheet["W41"].v : null; 

        // Создаем программу
        await this.postImport_Program(extractedData);
        await this.getImport_ProgramList();
        
        // Предполагается, что после обновления this.lastId содержит ID новой программы

        // Обработка листа "Курс 1" - для каждого ряда читаем ячейку E и создаем дисциплину
        const courseSheets = ["Курс 1"];
        for (const courseSheetName of courseSheets) {
          const courseSheet = workbook.Sheets[courseSheetName];
          if (courseSheet) {
            // Проходим по рядам с 17 по 105
            for (let row = 17; row <= 105; row++) {

              const cellAddress = `E${row}`;
              const cell = courseSheet[cellAddress];

              const hoursCellAddress = `AG${row}`;
              const hoursCell = courseSheet[hoursCellAddress];

              console.log(this.lastId)
              if (cell && cell.v) {
                // Формируем объект дисциплины с нужными полями
                const import_disciple = {
                  program_id: this.lastId,      // Здесь используем последний ID программы
                  disciple_name: cell.v,  
                  hours: hoursCell.v,        
                  // можно добавить и другие поля, если необходимо
                };

                await this.postImport_Disciple(import_disciple);
              }
            }
          } else {
            console.warn(`Лист ${courseSheetName} не найден.`);
          }
        }

        this.loadImportPrograms();
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

              await this.postImport_Disciple(import_disciple);
            }
          }

          console.log("Список дисциплин:", disciplines);

          let extractedData = {
            code: "Не найден",
            profile: "Не найден",
            years: "Не найден",
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

          console.log(this.lastId);
          await this.postImport_Program(extractedData);
          await this.getImport_ProgramList();
          this.loadImportPrograms();
          console.log(this.lastId);
          
          
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

      console.log("ДЕТАЛИ");
      console.log(this.detailRowData);

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
   this.filters=false;
   const savedQuickFilter = this.gridApi.getQuickFilter();
   const savedFilterModel = this.gridApi.getFilterModel();
 
   const queryParams = {};
 
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

      if (filesToDelete.length > 0) {
        console.log("Файлы, которые будут удалены:", JSON.stringify(filesToDelete, null, 2));
      } else {
        console.log('Нет файлов для удаления');
      }

      for (const file of filesToDelete) {
        await this.deleteUploaded_File(file);
      }

      // 4. Обновляем список файлов после удаления
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
 
 
   async showGruz() {
 
     console.log(this.uniqueDepartments)
     this.showSidebar2 = true;
 
   }
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
     filteredRowDataArchive() {
    const data = this.rowData.value || [];

    return data.filter((file) => {
      const yearMatch = this.formValues.years
        ? file.years === this.formValues.years
        : true;

      const programMatch = this.formValues.codes
        ? file.code === this.formValues.codes
        : true;

      return yearMatch && programMatch;
    });
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

 .year-selector-container {
  display: flex;
  gap: 34px; /* расстояние между элементами */
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
 
 .list{
   padding-left: 90px;
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
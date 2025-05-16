<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех договоров</span>
      </div>
    </div>

    <div class="row g-2 mb-2">
      <div class="col ps-0 py-0 pe-3"> 
        <input
          class="form-control"
          type="text"
          v-model="quickFilterValue"
          id="filter-text-box"
          @input="onFilterTextBoxChanged"
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

    <!-- Строка кнопки Добавить -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0"> <!-- Вы можете настроить ширину колонки (col-4, col-auto и т.д.) -->
        <button
          @click="openSidebar"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить договор
        </button>
      </div>
    </div>

    <!-- Строка с AG Grid (занимает оставшееся место) -->
    <div class="row g-2 flex-1"> <!-- flex-1 для растягивания по высоте -->
      <div class="col-12 p-0 h-100">
        <div class="grid-container"> <!-- Обертка для стилизации grid -->
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
      header="Данные договора"
      class="custom-sidebar h-auto"
      :style="mainSidebarStyle"
    >
      <div class="card flex flex-row">
        <div class="form card__form">
          <auto-form
            v-model="contract"
            v-model:errors="errors"
            :scheme="scheme"
            class="custom-form"
          >
          </auto-form>
        </div>
      </div>
      <Button
        class="btn btn-primary float-start"
        @click="submit"
      >
        Сохранить
      </Button>
      <Button
        class="btn btn-primary float-end"
        v-if="contract.id"
        @click="handleDeleteContract"
      >
        Удалить
      </Button>
    </Sidebar>
  </div>


  <Dialog
    v-model:visible="docPreview"
    header="Предпросмотр"
    maximizable
    ref="maxDialog"
    @show="biggifyDialog"
    :header="documentTitle"
    class="w-full h-full"
    :style="{ width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh' }"
  >
    <OnlyDocumentEditor
      v-if="filePath"
      :documentUrl="filePath"
      :documentTitle="documentTitle"
      :objectType="objectType"
    />
  </Dialog>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3"; // AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRoute } from "vue-router";
import ReqExec from "@/services/RequestExecutor";

import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import ButtonCell2 from "@/components/listener/ContractButtonCell.vue";
import ContractHrefCellRenderer from "@/components/listener/ContractHrefCellRenderer.vue";
import ContractHrefCellRenderer2 from "@/components/listener/ContractHrefCellRenderer2.vue";
import ContractHrefCellRenderer3 from "@/components/listener/ContractHrefCellRenderer3.vue";
import ContractHrefCellRenderer4 from "@/components/listener/ContractHrefCellRenderer4.vue";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import { requiredRule } from "@/model/form/validation/rules";
import { TextInput } from "@/model/form/inputs/TextInput";
import { DateInput } from "@/model/form/inputs/DateInput";
import { ComboboxInput } from "@/model/form/inputs/ComboboxInput";
import Contract from "@/model/listener-group/Contract";

import { mapActions, mapState } from "pinia";
import { useContractStore } from "@/store2/listenergroup/contract";
import { useListenerStore } from "@/store2/listenergroup/listener";
import { usePayerStore } from "@/store2/listenergroup/payer";
import { useProgramStore } from "@/store2/listenergroup/program";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TabStopPosition,
  TabStopType, 
} from "docx";
import { saveAs } from "file-saver";
import OnlyDocumentEditor from "@/components/base/OnlyDocumentEditor.vue";

export default {
  name: "ContractList",
  components: {
    AgGridVue,
    ButtonCell,
    ButtonCell2,
    ContractHrefCellRenderer,
    ContractHrefCellRenderer2,
    ContractHrefCellRenderer3,
    ContractHrefCellRenderer4,
    AutoForm,
    OnlyDocumentEditor,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;

    const gridApi = ref(null);
    const gridColumnApi = ref(null);
    const dataFromApi = ref(null);
    const dataLoaded = ref(false);
    const route = useRoute();
    const paginationPageSize = 60;
    const maxDialog = ref();

    function biggifyDialog() {
      maxDialog.value.maximized = true;
    }

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const rowData = reactive({});
    const columnDefs = reactive({
      value: [
        {
          sortable: false,
          filter: false,
          headerName: "",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            label: "View Details",
          },
          maxWidth: 50,
          resizable: false,
        },
        {
          field: "contr_number",
          headerName: "Номер договора",
          maxWidth: 175,
        },
        {
          field: "full_name",
          headerName: "Слушатель",
        },
        {
          field: "payer_full_name",
          headerName: "Законный представитель",
        },
        
        {
          field: "program_name",
          headerName: "Программа",
        },
        {
          sortable: false,
          filter: false,
          headerName: "Договор",
          headerClass: "text-center",
          cellRenderer: "ButtonCell2",
          cellRendererParams: {
          },
          maxWidth: 120,
          resizable: false,
        },
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
    };

    onMounted(() => {
    });

    const onFilterTextBoxChanged = () => {
      gridApi.value.setQuickFilter(
        document.getElementById("filter-text-box").value
      );
    };

    return {
      onGridReady,
      columnDefs,
      rowData,
      defaultColDef,
      localeText,
      deselectRows: () => {
        gridApi.value.deselectAll();
      },
      onFilterTextBoxChanged,
      paginationPageSize,
      dataFromApi,
      dataLoaded,
      biggifyDialog,
      maxDialog,
    };

  },
  data() {
    return {
      gridApi: null,
      gridColumnApi: null,
      quickFilterValue: "",
      filters: false,
      paginationPageSize: 60,
      contract: new Contract({}),
      errors: {},
      showSidebar: false,
      scheme: null,

      mainSidebarStyle: {}, 
      isSmallScreen: false,

      docPreview: false,
      filePath: null,
      documentTitle: "",
      objectType: "",
    };
  },
  async mounted() {
    try {
      await this.fetchInitialData();
      
      this.updateSidebarStyles();
      window.addEventListener('resize', this.updateSidebarStyles);
      this.loadContractsData();
    } catch (error) {
      console.error("Ошибка при загрузке данных договоров:", error);
    }
    
    this.scheme = new FormScheme([
      new TextInput({
        key: "contr_number",
        label: "Номер договора",
        placeholder: "Номер договора",
        validation: [requiredRule],
      }),
      new ComboboxInput({
        key: "listener_id",
        label: "Слушатель",
        placeholder: "Выберите слушателя",
        options: this.listenerOptions,
      }),
      new ComboboxInput({
        key: "payer_id",
        label: "Законный представитель",
        placeholder: "Выберите представителя",
        options: this.payerOptions,
      }),
      new ComboboxInput({
        key: "program_id",
        label: "Программа",
        placeholder: "Выберите программу",
        options: this.programOptions,
      }),
      
      new DateInput({
        key: "date_enroll",
        label: "Дата зачисления",
        dateFormat: "dd/mm/yy",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "date_kick",
        label: "Дата отчисления",
        dateFormat: "dd/mm/yy",
      }),
      new DateInput({
        key: "cert_date",
        label: "Дата выдачи сертификата",
        dateFormat: "dd/mm/yy",
        validation: [requiredRule],
      }),
    ]);
  },

  beforeUnmount() {
  window.removeEventListener('resize', this.updateSidebarStyles);
},
  
  methods: {
    ...mapActions(useContractStore, [
      "getContractList",
      "postContract",
      "putContract",
      "deleteContract",
      "uploadGeneratedFile",
    ]),
    ...mapActions(useListenerStore, ["getListenerList"]),
    ...mapActions(usePayerStore, ["getPayerList"]),
    ...mapActions(useProgramStore, ["getProgramList"]),
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    onFilterTextBoxChanged() {
      if (this.gridApi) {
        this.gridApi.setQuickFilter(
          document.getElementById("filter-text-box").value
        );
      }
    },
    
    onFilterChanged() {
      this.filters = false;
      const savedQuickFilter = this.gridApi.getQuickFilter();
      const savedFilterModel = this.gridApi.getFilterModel();
      const queryParams = {};
      if (savedQuickFilter) {
        queryParams.quickFilter = JSON.stringify(savedQuickFilter);
        this.filters = true;
      }
      if (
        savedFilterModel &&
        Object.keys(savedFilterModel).length > 0
      ) {
        queryParams.filterModel = JSON.stringify(savedFilterModel);
        this.filters = true;
      }
      if (window.$router) {
        window.$router.push({ query: queryParams });
      }
    },
    clearFilters() {
      if (this.gridApi) {
        this.gridApi.setFilterModel(null);
        this.gridApi.setQuickFilter(null);
      }
      this.quickFilterValue = "";
      this.filters = false;
    },
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
        this.resetContract();
        this.contract = event.data;
        this.showSidebar = true;
      }
      else {
        if (event.colDef && event.colDef.headerName === "Договор") {
          this.previewContract(event.data);
        }
      }
    },
    resetContract() {
      this.contract = new Contract({});
      this.errors = {};
    },
    async previewContract(ContractForDocx) {
      console.log("PREVIEW")
      console.log(ContractForDocx)
      await this.createContractDocx(ContractForDocx);
      this.docPreview = true;
    },
    async submit() {
      const currentContract = { ...this.contract };

      // --- Начало проверки на уникальность номера договора ---
      const DIPLICATE_CONTRACT_NUMBER_ERROR_KEY = 'contr_number';
      const DIPLICATE_CONTRACT_NUMBER_ERROR_MESSAGE = 'Договор с таким номером уже существует';

      // 1. Очистим предыдущую ошибку уникальности для этого поля, если она была
      // Это важно, чтобы не показывать старую ошибку, если пользователь исправил номер
      // и чтобы не конфликтовать с другими возможными ошибками от AutoForm для этого поля (например, "обязательное поле")
      let currentErrors = { ...this.errors };
      if (currentErrors[DIPLICATE_CONTRACT_NUMBER_ERROR_KEY] === DIPLICATE_CONTRACT_NUMBER_ERROR_MESSAGE) {
        delete currentErrors[DIPLICATE_CONTRACT_NUMBER_ERROR_KEY];
        this.errors = currentErrors; // Обновляем реактивно
      }

      // 2. Выполняем проверку, если номер договора указан
      if (currentContract.contr_number && String(currentContract.contr_number).trim()) {
        const contractNumberToCheck = String(currentContract.contr_number).trim();
        
        // Убедимся, что this.contractList доступен и является массивом.
        // Если this.contractList не из computed, а напрямую из this.contractStore.contracts, используйте этот путь.
        const allContracts = Array.isArray(this.contractList) ? this.contractList : [];
        const activeContracts = allContracts.filter(c => c.deleted_at === null);
        
        let isDuplicate = false;

        if (currentContract.id) {
          // Это обновление существующего договора
          isDuplicate = activeContracts.some(
            c => String(c.contr_number).trim() === contractNumberToCheck && c.id !== currentContract.id
          );
        } else {
          // Это создание нового договора
          isDuplicate = activeContracts.some(
            c => String(c.contr_number).trim() === contractNumberToCheck
          );
        }

        if (isDuplicate) {
          // 3. Если дубликат найден, добавляем ошибку в this.errors
          this.errors = {
            ...this.errors, // Сохраняем другие ошибки (например, от AutoForm)
            [DIPLICATE_CONTRACT_NUMBER_ERROR_KEY]: DIPLICATE_CONTRACT_NUMBER_ERROR_MESSAGE
          };
          console.error("Ошибка валидации:", DIPLICATE_CONTRACT_NUMBER_ERROR_MESSAGE, "Номер:", contractNumberToCheck);
          // Остановка выполнения, т.к. найдена ошибка
          // return; // Не используем return здесь, проверка всех ошибок будет ниже
        }
      }
      // --- Конец проверки на уникальность номера договора ---

      // 4. Проверяем, есть ли какие-либо ошибки в форме (от AutoForm или наша кастомная)
      let formHasErrors = false;
      for (const key in this.errors) {
        if (Object.prototype.hasOwnProperty.call(this.errors, key) && this.errors[key]) {
          // Считаем ошибкой, если значение для ключа - непустая строка
          if (typeof this.errors[key] === 'string' && this.errors[key].length > 0) {
            formHasErrors = true;
            break;
          }
          // Если ошибки могут быть массивами строк, доработайте эту проверку
        }
      }

      if (formHasErrors) {
        console.log("Отправка отменена. Обнаружены ошибки в форме:", this.errors);
        return; // Прерываем отправку, если есть ошибки
      }

      try {
        if (currentContract.id) {
          await this.putContract(currentContract);
        } else {
          await this.postContract(currentContract);
        }
        this.showSidebar = false;
        this.resetContract();
        await this.loadContractsData();
      } catch (error) {
        console.error("Ошибка сохранения договора:", error);
      }
    },
    async handleDeleteContract() {
      try {
        const currentContract = { ...this.contract };
        await this.deleteContract(currentContract);
        this.showSidebar = false;
        this.resetContract();
        await this.loadContractsData();
      } catch (error) {
        console.error("Ошибка удаления договора:", error);
      }
    },

    async fetchInitialData() {
   console.log("Fetching initial data...");
   try {
       await Promise.all([
        this.getContractList(),
        this.getProgramList(),
        this.getListenerList(),
        this.getPayerList(),
       ]);
       console.log("Initial data fetched successfully.");
   } catch (error) {
       console.error("Ошибка при первичной загрузке данных:", error);
   }
},

    async loadContractsData() {
      try {
        if (Array.isArray(this.contractList)) {
          this.rowData.value = this.contractList.filter(
            (lgr) => lgr.deleted_at === null
          );
        } else if (
          this.contractList &&
          this.contractList.deleted_at === null
        ) {
          this.rowData.value = [this.contractList];
        } else {
          this.rowData.value = [];
        }
      } catch (error) {
        console.error("Ошибка загрузки данных договоров:", error);
        this.rowData = [];
      }
    },
    onFirstDataRendered(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      const filterModelQuery = window.$router?.currentRoute.value.query.filterModel;
      if (filterModelQuery) {
        const filterModel = JSON.parse(filterModelQuery);
        this.gridApi.setFilterModel(filterModel);
        this.filters = true;
      }
      const quickFilterQuery = window.$router?.currentRoute.value.query.quickFilter;
      if (quickFilterQuery) {
        this.gridApi.setQuickFilter(quickFilterQuery);
        this.quickFilterValue = quickFilterQuery;
        this.filters = true;
      }
    },
    openSidebar() {
      this.resetContract();
      this.showSidebar = true;
    },

    updateSidebarStyles() {
    const minWidthValue = 1100;
    const screenWidth = window.innerWidth;

    const isScreenWideEnough = screenWidth >= minWidthValue;

    this.mainSidebarStyle = {
      width: isScreenWideEnough ? '820px' : '100%', 
      minWidth: isScreenWideEnough ? `${minWidthValue}px` : 'auto', 
      maxHeight: '700px',
      height: 'auto',
      margin: isScreenWideEnough ? 'auto' : '0' 
    };

    this.wishesSidebarStyle = {
      width: isScreenWideEnough ? '840px' : '100%', 
      minWidth: isScreenWideEnough ? `${minWidthValue}px` : 'auto', 
      maxHeight: '750px',
      height: 'auto',
      margin: isScreenWideEnough ? 'auto' : '0' 
    };
  },

  async createContractDocx(ContractForDocx) {

    const contractNumber = ContractForDocx.contr_number;

    const contract = {
      daySigned: "15",         // День подписания (строка)
  monthSignedAsText: "мая", // Месяц подписания прописью (строка)
  yearSigned: "24",        // Год подписания (двузначный, строка)
  // или fullYearSigned: "2024" // Год подписания (четырехзначный, строка)
  
  signerName: "Петрова Петра Петровича", // ФИО подписанта со стороны исполнителя (в нужном падеже)
  powerOfAttorneyDate: "10.01.2024",   // Дата доверенности
  powerOfAttorneyNumber: "Д-555/24",   // Номер доверенности
  
  customerFullName: "Сидоров Сидор Сидорович", // ФИО Заказчика
  // ... другие поля для Заказчика (адрес, паспорт и т.д.)
  
  studentFullName: "Сидоров Илья Сидорович", // ФИО Обучающегося
  // ... другие поля для Обучающегося (дата рождения, адрес, паспорт и т.д.)

  programName: "Супер Программа Обучения", // Название программы
  programForm: "очная с применением ДОТ",  // Форма обучения
  programDurationMonths: "6",              // Длительность в месяцах
  programStartDate: "01.09.2024",          // Дата начала
  programEndDate: "28.02.2025",            // Дата окончания
  programVolumeHours: "144",               // Объем в часах

  priceFull: "50000",                      // Полная стоимость цифрами
  priceFullText: "пятьдесят тысяч",        // Полная стоимость прописью

  departmentName: "Центр Инноваций",      // Название подразделения
    }

    const doc = new Document({
    creator: "Python docx_to_docxjs converter",
    title: "Converted Document",
    description: "Document converted from .docx by Python script",
    styles: {
      paragraphStyles: [
        
        {
          id: "ConsPlusNormal",
          name: "ConsPlusNormal",
          basedOn: "Normal", // Упрощение
          next: "Normal",    // Упрощение
          quickFormat: true,
          run: { font: "Calibri" },
          paragraph: { spacing: { line: 240, rule: 'auto' } },
        },

        {
          id: "ConsPlusNonformat",
          name: "ConsPlusNonformat",
          basedOn: "Normal", // Упрощение
          next: "Normal",    // Упрощение
          quickFormat: true,
          run: { font: "Courier New", size: 20 },
          paragraph: { spacing: { line: 240, rule: 'auto' } },
        },

        {
          id: "ConsPlusTitle",
          name: "ConsPlusTitle",
          basedOn: "Normal", // Упрощение
          next: "Normal",    // Упрощение
          quickFormat: true,
          run: { font: "Calibri", bold: true },
          paragraph: { spacing: { line: 240, rule: 'auto' } },
        },

        {
          id: "ConsPlusCell",
          name: "ConsPlusCell",
          basedOn: "Normal", // Упрощение
          next: "Normal",    // Упрощение
          quickFormat: true,
          run: { font: "Courier New", size: 20 },
          paragraph: { spacing: { line: 240, rule: 'auto' } },
        },

        {
          id: "Абзацсписка1",
          name: "Абзац списка1",
          basedOn: "Normal", // Упрощение
          next: "Normal",    // Упрощение
          quickFormat: true,
          run: { size: 28 },
          paragraph: { spacing: { after: 200, line: 276, rule: 'auto' }, indent: { left: 720 } },
        },

        {
          id: "TableParagraph",
          name: "Table Paragraph",
          basedOn: "Normal", // Упрощение
          next: "Normal",    // Упрощение
          quickFormat: true,
          run: { size: 22 },
          paragraph: { spacing: { line: 256, rule: 'exact' } },
        },
      ]
      // characterStyles: [ ... ] // Можно добавить, если парсить стили символов
    },
    sections: [{
      properties: {
         page: {
           margin: {
             top: 706, // 0.49 inches
             bottom: 706, // 0.49 inches
             left: 850, // 0.59 inches
             right: 562, // 0.39 inches
             gutter: 0, // 0 inches
           },
           // Ориентация: Portrait - это по умолчанию, но можно указать явно
           // orientation: PageOrientation.PORTRAIT, // Требуется импорт PageOrientation
         },
         // TODO: Добавить другие свойства секции, если они есть в оригинале (размер бумаги, колонки и т.д.)
      },
      // headers: { default: new Header({...}) },
      // footers: { default: new Footer({...}) },
      children: [
    new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        style: "ConsPlusTitle" 
    }), 
    
    // Paragraph index 0

    new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        style: "ConsPlusTitle", 
        children: [
            new TextRun({ text: `ДОГОВОР N ${contractNumber || "_______"}`, font: "Arial", size: 16 }) 
        ] 
    }), 
    
    // Paragraph index 1

    new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        style: "ConsPlusTitle", 
        children: [
            new TextRun({ text: "об образовании на обучение по дополнительной", font: "Arial", size: 16 })
        ] 
    }), // Paragraph index 2

    new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        style: "ConsPlusTitle", 
        children: [
            new TextRun({ text: "образовательной программе", font: "Arial", size: 16 }) 
            // Объединены "образовательной", "ой", "программе". Табуляция "	" убрана, если она не нужна для особого эффекта.
        ] 
    }), // Paragraph index 3

    new Paragraph({ 
        alignment: AlignmentType.JUSTIFY, // Или AlignmentType.LEFT, если JUSTIFY не нужно
        style: "ConsPlusNormal" 
        // Пустой абзац, возможно для отступа.
    }), // Paragraph index 4

    new Paragraph({
        // alignment: AlignmentType.LEFT, // Рекомендуется для абзацев с табуляцией
        style: "ConsPlusNonformat", // Этот стиль имеет Courier New, но TextRun-ы ниже переопределяют на Arial
        tabStops: [
            {
                type: TabStopType.RIGHT,
                position: 11347, // Примерное значение для A4 и правого поля 0.39". Настройте при необходимости!
                                 // Или TabStopPosition.MAX
            },
        ],
        children: [
            new TextRun({ text: "г. Краснодар", font: "Arial", size: 16 }),
            new TextRun("\t"), // Табуляция
            new TextRun({ text: "«", underline: true, font: "Arial", size: 16 }),
            new TextRun({ text: contract.daySigned || "___", underline: true, font: "Arial", size: 16 }), // Пример: contract.daySigned
            new TextRun({ text: "» ", underline: true, font: "Arial", size: 16 }), // Добавил пробел после кавычки
            new TextRun({ text: contract.monthSignedAsText || "_________ ", underline: true, font: "Arial", size: 16 }), // Пример: contract.monthSignedAsText (название месяца прописью)
            new TextRun({ text: ` 20${contract.yearSigned || "24"}`, font: "Arial", size: 16 }), // Год, если contract.yearSigned двузначный
            // Или new TextRun({ text: ` ${contract.fullYearSigned || "2024"}`, font: "Arial", size: 16 }), // если contract.fullYearSigned четырехзначный
            new TextRun({ text: " г.", font: "Arial", size: 16 })
        ]
    }), // Paragraph index 5

    new Paragraph({ 
        alignment: AlignmentType.JUSTIFY, // Или AlignmentType.LEFT
        style: "ConsPlusNonformat" 
        // Пустой абзац, возможно для отступа.
    }), // Paragraph index 6

    new Paragraph({ 
        alignment: AlignmentType.JUSTIFY, 
        style: "ConsPlusNonformat", 
        children: [
            // Длинный текст, который был разбит на несколько TextRun. Если форматирование везде одинаковое (Arial, 16),
            // его можно объединить в один TextRun для лучшей читаемости и производительности.
            // Я оставлю пока как есть, так как это могло быть сделано скриптом из-за невидимых изменений форматирования в оригинале.
            // Но если вы уверены, что форматирование одинаковое, объединяйте.
            new TextRun({ text: "Федеральное государственное бюджетное образовательное учреждение высшего образования «Кубанский государственный университет», осуществляющее образовательную деятельность на основании лицензии на осуществление образовательной деятельности серии 90Л01 № 0009015, регистрационный номер 1982 от 03.03.2016 г., выданной Федеральной службой по надзору в сфере образования и науки, действующей бессрочно, свидетельства о государственной аккредитации серии 90А01 № 0003197, регистрационный номер 3042 от ", font: "Arial", size: 16 }),
            new TextRun({ text: "27.03.2019 г., выданного ", font: "Arial", size: 16 }),
            new TextRun({ text: "Федеральной службой по надзору в сфере образования и науки, ", font: "Arial", size: 16 }),
            new TextRun({ text: "действующего бессрочно (п.16 ст.136 ФЗ  ", font: "Arial", size: 16 }) // В оригинале был пробел после ФЗ, проверьте, нужен ли он
        ] 
    }), // Paragraph index 7

    new Paragraph({ 
        alignment: AlignmentType.JUSTIFY, 
        style: "ConsPlusNonformat", 
        children: [
            new TextRun({ text: "№ 170-ФЗ от 11.06.2021 г.) ", font: "Arial", size: 16 }),
            new TextRun({ text: "(далее – «Исполнитель»/«Университет»),", font: "Arial", size: 16 }),
            new TextRun({ text: " в лице ", font: "Arial", size: 16 }),
            new TextRun({ text: `проректора по довузовскому и дополнительному профессиональному образованию ${contract.signerName || "Кустова Семена Юрьевича"}, действующего на основании доверенности `, font: "Arial", size: 16 }), // Пример: contract.signerName
            new TextRun({ text: `от ${contract.powerOfAttorneyDate || "09.02.2024"}`, font: "Arial", size: 16 }), // Пример: contract.powerOfAttorneyDate
            new TextRun({ text: ` № ${contract.powerOfAttorneyNumber || "176/01"}`, font: "Arial", size: 16 }), // Пример: contract.powerOfAttorneyNumber
            new TextRun({ text: ", с одной стороны, и ", font: "Arial", size: 16 }), // Объединил ", " и "с одной стороны" и " и"
            // Место для ФИО Заказчика
            new TextRun({ text: contract.customerFullName || "Иванов Иван Иванович", bold: true, underline: true, font: "Arial", size: 16 }),
            // Лишние подчеркивания вокруг ФИО убраны, т.к. само ФИО уже подчеркнуто
            new TextRun({ text: ",", font: "Arial", size: 16 })
        ] 
    }), // Paragraph index 8

    new Paragraph({ 
        alignment: AlignmentType.JUSTIFY, 
        style: "ConsPlusNonformat", 
        children: [
            // Этот абзац содержит много пробелов для отступа. Это плохая практика.
            // Лучше использовать свойство `indent` или `spacing` в абзаце или стиле.
            // Пока оставлю, но рекомендую переделать.
            // new TextRun({ text: "                ", font: "Arial", size: 16 }), // 16pt
            // new TextRun({ text: "                         ", font: "Arial", size: 16 }), // 16pt
            new TextRun({ text: "(фамилия, имя, отчество (при наличии) законного представителя несовершеннолетнего лица, зачисляемого на обучение)", font: "Arial", size: 12 })
        ] 
    }), // Paragraph index 9

    new Paragraph({ 
        alignment: AlignmentType.JUSTIFY, 
        style: "ConsPlusNonformat", 
        children: [
            new TextRun({ text: "именуемый(ая) в дальнейшем «Заказчик», с другой стороны,", font: "Arial", size: 16 }) 
            // Объединил несколько TextRun
        ] 
    }), // Paragraph index 10
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "и ", font: "Arial", size: 16 }),
      new TextRun({ text: "_____________________", font: "Arial", size: 16 }),
      new TextRun({ text: "Иванов Илья Иванович", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "________________________________", font: "Arial", size: 16 }),
      new TextRun({ text: "___________", font: "Arial", size: 16 }),
      new TextRun({ text: "_________", font: "Arial", size: 16 }),
      new TextRun({ text: "_____________________", font: "Arial", size: 16 }),
      new TextRun({ text: ",", font: "Arial", size: 16 })] }), // Paragraph index 11
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "   ", font: "Arial", size: 12 }),
      new TextRun({ text: "                                                                                ", font: "Arial", size: 12 }),
      new TextRun({ text: " ", font: "Arial", size: 12 }),
      new TextRun({ text: "         ", font: "Arial", size: 12 }),
      new TextRun({ text: " (фамилия, имя, отчество (при наличии) лица, зачисляемого на обучение)", font: "Arial", size: 12 })] }), // Paragraph index 12
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "и", font: "Arial", size: 16 }),
      new TextRun({ text: "менуемый", font: "Arial", size: 16 }),
      new TextRun({ text: " (", font: "Arial", size: 16 }),
      new TextRun({ text: "ая", font: "Arial", size: 16 }),
      new TextRun({ text: ") ", font: "Arial", size: 16 }),
      new TextRun({ text: "в дальнейшем «Обучающийся», с ", font: "Arial", size: 16 }),
      new TextRun({ text: "третьей", font: "Arial", size: 16 }),
      new TextRun({ text: " стороны, ", font: "Arial", size: 16 }),
      new TextRun({ text: "совместно ", font: "Arial", size: 16 }),
      new TextRun({ text: "именуемые Стороны, заключили нас", font: "Arial", size: 16 }),
      new TextRun({ text: "тоящий Договор о нижеследующем:", font: "Arial", size: 16 })] }), // Paragraph index 13
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "I. Предмет Договора", font: "Arial", size: 16 })] }), // Paragraph index 14
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [
        new TextRun({ text: "1.1.", font: "Arial", size: 16 }),
        new TextRun({ text: "Исполнитель обязуется предоставить образовательную услугу, а Заказчик обязуется оплатить обучение по дополнительной общеобразовательной (общеразвивающей) программе ", font: "Arial", size: 16 }),
      new TextRun({ text: "«", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "Дополнительные занятия по математике для десятиклассников", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "»", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 })] }), 
      // Paragraph index 15
    new Paragraph({ 
      alignment: AlignmentType.CENTER, 
      style: "ConsPlusNonformat", 
      children: [new TextRun({ text: "  ", font: "Arial", size: 12 }),
      new TextRun({ text: "                                                                                  ", font: "Arial", size: 12 }),
      new TextRun({ text: " ", font: "Arial", size: 12 }),
      new TextRun({ text: "(наименование дополнительной образовательной программы", font: "Arial", size: 12 }),
      new TextRun({ text: ")", font: "Arial", size: 12 })] }), // Paragraph index 16
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "              ", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "      ", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "очная форма обучения с применением дистанционных образовательных технологий", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 })] }), // Paragraph index 17
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "в пределах федеральных государственных требований в соответствии с учебными планами, в том числе индивидуальными, и образовательными программами Исполнителя.", font: "Arial", size: 16 })] }), // Paragraph index 18
    
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", 
    children: [
      new TextRun({ text: "1.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Срок освоения образовательной программы на момент подписания Договора составляет ", font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " месяцев", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	_", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " ", font: "Arial", size: 16 })] }), 
      
      // Paragraph index 19
      new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "(указывается количество дней/месяцев)", font: "Arial", size: 12 })] }), // Paragraph index 20
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "с «", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "» ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "20", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "24", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "года", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: " по «", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "»", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "20", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "25", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " ", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "года", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: " в объеме ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "54", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	 ", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "часов.", bold: true, font: "Arial", size: 16 })] }), // Paragraph index 21
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat" }), // Paragraph index 22
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "Срок освоения образовательной программы по индивидуальному учебному плану, при его наличии, в том числе ускоренному обучению, составляет ", font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: ", ", font: "Arial", size: 16 }),
      new TextRun({ text: "с «", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "» ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " 20", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 20 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "года по «", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	_", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "»", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " 20 ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "года в объеме ", bold: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	 ", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "часов.", bold: true, font: "Arial", size: 16 })] }), // Paragraph index 23
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "(указывается количество дней/месяцев)", font: "Arial", size: 12 })] }), // Paragraph index 24
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "1.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "После освоения Обучающимся образовательной программы ему выдается документ об обучении, установленного Университетом образца, – ", font: "Arial", size: 16 }),
      new TextRun({ text: "Сертификат о дополнительном образовании", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: ".", font: "Arial", size: 16 })] }), // Paragraph index 25
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "                                     (документ об обучении)", font: "Arial", size: 12 })] }), // Paragraph index 26
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "Обучающимся, освоившим часть образовательной программы и (или) отчисленным из образовательного подразделения Университета, выдается справка об обучении или о периоде обучения по образцу, установленному Университетом.", font: "Arial", size: 16 })] }), // Paragraph index 27
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat" }), 
    // Paragraph index 28
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "II. Права Исполнителя, Заказчика и Обучающегося ", font: "Arial", size: 16 })] }), // Paragraph index 29
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 30
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Исполнитель вправе:", font: "Arial", size: 16 })] }), // Paragraph index 31
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.1.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Самостоятельно осуществлять образовательный процесс, устанавливать системы оценок, формы, порядок и периодичность проведения промежуточной аттестации Обучающегося.", font: "Arial", size: 16 })] }), // Paragraph index 32
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.1.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Применять к Обучающемуся меры поощрения и меры дисциплинарного взыскания в соответствии с законодательством ", font: "Arial", size: 16 }),
      new TextRun({ text: "Российской Федерации, учредительными документами Исполнителя, настоящим Договором и локальными нормативными актами Исполнителя.", font: "Arial", size: 16 })] }), // Paragraph index 33
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "2.1.3. Изменять график предоставления образовательных услуг в случае производственной необходимости и в праздничные дни, заблаговременно уведомив Заказчика/Обучающегося об отмене/переносе и возобновлении занятий по телефону или сообщением на электронную почту, указанными в договоре (а также с использованием мессенджеров: ", font: "Arial", size: 16 }),
      new TextRun({ text: "Whatsapp", font: "Arial", size: 16 }),
      new TextRun({ text: ", Telegram).", font: "Arial", size: 16 })] }), // Paragraph index 34
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "2.1.4. Перенести обучение в дистанционный формат вследствие обстоятельств непреодолимой силы, нормативно-правовых актов и Постановлений, регламентирующих изменение формы обучения ", font: "Arial", size: 16 }),
      new TextRun({ text: "для лиц", font: "Arial", size: 16 }),
      new TextRun({ text: " осуществляющих образовательную деятельность, в т.ч. связанных с санитарно-эпидемиологической обстановкой.", font: "Arial", size: 16 })] }), // Paragraph index 35
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.1.5. Самостоятельно определять состав специалистов, оказывающих Услуги.", font: "Arial", size: 16 })] }), // Paragraph index 36
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Заказчик вправе:", font: "Arial", size: 16 })] }), // Paragraph index 37
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.2.1. Получать информацию от Исполнителя по вопросам организации и обеспечения надлежащего предоставления услуг, предусмотренных ", font: "Arial", size: 16 }),
      new TextRun({ text: " настоящего Договора.", font: "Arial", size: 16 })] }), // Paragraph index 38
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", 
    children: [new TextRun({ text: "2.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Обучающийся вправе:", font: "Arial", size: 16 })] }), // Paragraph index 39
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.3.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Получать информацию от Исполнителя по вопросам организации и обеспечения надлежащего предоставления услуг, предусмотренных ", font: "Arial", size: 16 }),
      new TextRun({ text: " настоящего Договора.", font: "Arial", size: 16 })] }), // Paragraph index 40
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.3.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Обращаться к Исполнителю по вопросам, касающимся образовательного процесса.", font: "Arial", size: 16 })] }), // Paragraph index 41
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.3.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Пользоваться в порядке, установленном локальными нормативными актами, имуществом Исполнителя, необходимым для освоения образовательной программы.", font: "Arial", size: 16 })] }), // Paragraph index 42
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.3.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Принимать в порядке, установленном локальными нормативными актами, участие в социально-культурных, оздоровительных и иных ", font: "Arial", size: 16 }),
      new TextRun({ text: "мероприятиях, организованных Исполнителем.", font: "Arial", size: 16 })] }), // Paragraph index 43
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.3.5.", font: "Arial", size: 16 }),
      new TextRun({ text: "Получать полную и достоверную информацию об оценке своих знаний, умений, навыков и компетенций, а также о критериях этой оценки.", font: "Arial", size: 16 })] }), // Paragraph index 44
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "2.3.6.", font: "Arial", size: 16 }),
      new TextRun({ text: " Обучающемуся предоставляются академические права в соответствии с ", font: "Arial", size: 16 }),
      new TextRun({ text: " Федерального закона от 29 декабря 2012 г. N 273-ФЗ «Об образовании в Российской Федерации».", font: "Arial", size: 16 })] }), // Paragraph index 45
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "III. Обязанности Исполнителя, Заказчика и Обучающегося ", font: "Arial", size: 16 })] }), // Paragraph index 46
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Исполнитель обязан:", font: "Arial", size: 16 })] }), // Paragraph index 47
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "3.1.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Зачислить лицо, выполнившее установленные законодательством Российской Федерации, учредительными документами, локальными нормативными актами Исполнителя условия приема, в Кубанский государственный университет в качестве Обучающегося в образовательном подразделении ", font: "Arial", size: 16 }),
      new TextRun({ text: "	              ", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "   ", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "«", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "Макрос", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "»", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "	 ", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "Института тестовых технологий и дополнительного образования.", font: "Arial", size: 16 })] }), // Paragraph index 48
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNonformat", children: [new TextRun({ text: "(наименование образовательного подразделения)", font: "Arial", size: 12 })] }), // Paragraph index 49
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.1.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Довести до Заказчика информацию, содержащую сведения о предоставлении платных образовательных услуг в порядке и объеме, которые предусмотрены ", font: "Arial", size: 16 }),
      new TextRun({ text: " Российской Федерации «О защите прав потребителей» и Федеральным ", font: "Arial", size: 16 }),
      new TextRun({ text: " «Об образовании ", font: "Arial", size: 16 }),
      new TextRun({ text: "\nв Российской Федерации».", font: "Arial", size: 16 })] }), // Paragraph index 50
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.1.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Организовать и обеспечить надлежащее предоставление образовательных услуг, предусмотренных ", font: "Arial", size: 16 }),
      new TextRun({ text: " настоящего Договора. Образовательные услуги оказываются в соответствии с федеральными государственными требованиями, учебным планом, в том числе индивидуальным (при его наличии), и расписанием занятий Исполнителя.", font: "Arial", size: 16 })] }), // Paragraph index 51
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.1.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Обеспечить Обучающемуся предусмотренные выбранной образовательной программой условия ее освоения, а также специальные условия при необходимости.", font: "Arial", size: 16 })] }), // Paragraph index 52
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.1.5.", font: "Arial", size: 16 }),
      new TextRun({ text: "	", font: "Arial", size: 16 }),
      new TextRun({ text: "Сохранить место за Обучающимся в случае пропуска занятий по уважительным причинам (с учетом оплаты услуг, предусмотренных", font: "Arial", size: 16 }),
      new TextRun({ text: " ", font: "Arial", size: 16 }),
      new TextRun({ text: " настоящего Договора).", font: "Arial", size: 16 })] }), // Paragraph index 53
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.1.6.", font: "Arial", size: 16 }),
      new TextRun({ text: "Принимать от Обучающегося и (или) Заказчика плату за образовательные услуги.", font: "Arial", size: 16 })] }), // Paragraph index 54
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.1.7.", font: "Arial", size: 16 }),
      new TextRun({ text: "Обеспечить Обучающемуся уважение человеческого достоинства, защиту от всех форм физического и психического насилия, оскорбления личности, охрану жизни и здоровья.", font: "Arial", size: 16 })] }), // Paragraph index 55
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Заказчик обязан:", font: "Arial", size: 16 })] }), // Paragraph index 56
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.2.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Заказчик обязан своевременно вносить плату за предоставляемые Обучающемуся образовательные услуги, указанные в ", font: "Arial", size: 16 }),
      new TextRun({ text: " настоящего Договора, в размере и порядке, определенных настоящим Договором, а также предоставлять платежные документы, подтверждающие такую оплату (банковская квитанция об оплате, платежное поручение с отметкой банка, чек по операции онлайн банка, чек терминала и др.).", font: "Arial", size: 16 })] }), // Paragraph index 57
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "3.2.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "При зачислении Обучающегося в Университет в образовательное подразделение Института тестовых технологий и дополнительного образования и в процессе его обучения своевременно предоставлять все необходимые документы, предусмотренные локальными нормативными актами Университета.", font: "Arial", size: 16 })] }), // Paragraph index 58
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "3.2.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Незамедлительно сообщать Исполнителю об изменении контактного телефона и места жительства.", font: "Arial", size: 16 })] }), // Paragraph index 59
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "3.2.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Извещать Исполнителя об уважительных причинах отсутствия Обучающегося на занятиях.", font: "Arial", size: 16 })] }), // Paragraph index 60
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "3.2.5.", font: "Arial", size: 16 }),
      new TextRun({ text: "Возмещать ущерб, причиненный Обучающимся имуществу Университета в соответствии с законодательством Российской Федерации.", font: "Arial", size: 16 })] }), // Paragraph index 61
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.2.6. Обеспечивать посещение занятий, своевременное выполнение Обучающимся всех видов учебных заданий.", font: "Arial", size: 16 })] }), // Paragraph index 62
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Обучающийся обязан:", font: "Arial", size: 16 })] }), // Paragraph index 63
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.3.1.Соблюдать требования, установленные в ", font: "Arial", size: 16 }),
      new TextRun({ text: " Федерального закона от 29 декабря 2012 г. N 273-ФЗ ", font: "Arial", size: 16 }),
      new TextRun({ text: "\n«Об образовании в Российской Федерации», в том числе:", font: "Arial", size: 16 })] }), // Paragraph index 64
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: " – посещать занятия согласно расписанию;", font: "Arial", size: 16 })] }), // Paragraph index 65
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: " – выполнять задания для подготовки к занятиям, предусмотренным учебным планом, в том числе индивидуальным;", font: "Arial", size: 16 })] }), // Paragraph index 66
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: " – извещать Исполнителя о причинах отсутствия на занятиях (в случае если не известил Заказчик);", font: "Arial", size: 16 })] }), // Paragraph index 67
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: " – принимать участие в предусмотренных программой обучения массовых, конкурсных и иных мероприятиях;", font: "Arial", size: 16 })] }), // Paragraph index 68
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: " – о", font: "Arial", size: 16 }),
      new TextRun({ text: "бучаться в образовательной организации по образовательной программе с соблюдением требований, установленных ", font: "Arial", size: 16 }),
      new TextRun({ text: "федеральными государственными требованиями и учебным планом, в том числе индивидуальным, Исполнителя.", font: "Arial", size: 16 })] }), // Paragraph index 69
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "3.3.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Соблюдать требования учредительных документов, правила внутреннего распорядка и иные локальные нормативные акты Исполнителя.", font: "Arial", size: 16 })] }), // Paragraph index 70
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal" }), // Paragraph index 71
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "IV. Стоимость услуг, сроки и порядок их оплаты ", font: "Arial", size: 16 })] }), // Paragraph index 72
    new Paragraph({ style: "ConsPlusNormal" }), // Paragraph index 73
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "4.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Полная стоимость платных образовательных услуг за весь период обучения Обучающегося составляет", font: "Arial", size: 16 }),
      new TextRun({ text: " ____", font: "Arial", size: 16 }),
      new TextRun({ text: "24 3", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "00", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "____________", font: "Arial", size: 16 }),
      new TextRun({ text: " ", font: "Arial", size: 16 }),
      new TextRun({ text: "_", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "_", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "(", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "двадцать четыре тысячи триста", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: ")", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "__", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "рублей (НДС не облагается в соответствии с ", font: "Arial", size: 16 }),
      new TextRun({ text: "пп", font: "Arial", size: 16 }),
      new TextRun({ text: ". 14 п. 2 ст. 149 Налогового кодекса РФ).", font: "Arial", size: 16 })] }), // Paragraph index 74
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: " ", font: "Arial", size: 12 }),
      new TextRun({ text: "  сумма прописью", font: "Arial", size: 12 })] }), // Paragraph index 75
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "4.2. Увеличение стоимости образовательных услуг после заключения Договора не допускается, за исключением увеличения стоимости указанных услуг", font: "Arial", size: 16 }),
      new TextRun({ text: " с учетом уровня инфляции, предусмотренного основными характеристиками федерального бюджета на очередной финансовый ", font: "Arial", size: 16 }),
      new TextRun({ text: "год", underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " и плановый период.", font: "Arial", size: 16 })] }), // Paragraph index 76
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "4.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Оплата производится ", font: "Arial", size: 16 }),
      new TextRun({ text: "в безналичном порядке на счет, указанный в разделе ", font: "Arial", size: 16 }),
      new TextRun({ text: "IX", font: "Arial", size: 16 }),
      new TextRun({ text: " настоящего Договора", font: "Arial", size: 16 }),
      new TextRun({ text: ":", font: "Arial", size: 16 })] }), // Paragraph index 77
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "4.3.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Единовременно в полном объеме до начала обучения либо ", font: "Arial", size: 16 }),
      new TextRun({ text: "в размере 60% от полной стоимости образовательных услуг – до издания приказа/распоряжения о зачислении, оставшуюся сумму в размере 40% от стоимости – не позднее ", font: "Arial", size: 16 }),
      new TextRun({ text: "	", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "______", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "_", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " ", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "2024_______", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: " (если продолжительность обучения составляет не менее 6 месяцев).", font: "Arial", size: 16 })] }), // Paragraph index 78
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "4.3.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Оплата образовательных услуг может осуществляться за счет средств материнского (семейного) капитала, при этом оплата производится единовременно не позднее даты завершения обучения.", font: "Arial", size: 16 })] }), // Paragraph index 79
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "4.3.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Оплата, внесенная за обучение, считается авансовым платежом. Право собственности на сумму внесенного авансового платежа переходит к ", font: "Arial", size: 16 }),
      new TextRun({ text: "Исполнителю", font: "Arial", size: 16 }),
      new TextRun({ text: " ", italic: true, font: "Arial", size: 16 }),
      new TextRun({ text: "после завершения обучения. ", font: "Arial", size: 16 })] }), // Paragraph index 80
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "4.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Право собственности на всю сумму внесенного платежа переходит к ", font: "Arial", size: 16 }),
      new TextRun({ text: "Исполнителю", font: "Arial", size: 16 }),
      new TextRun({ text: " ", italic: true, font: "Arial", size: 16 }),
      new TextRun({ text: "после оказания Обучающемуся образовательных услуг в полном объеме. ", font: "Arial", size: 16 })] }), // Paragraph index 81
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "4.5.", font: "Arial", size: 16 }),
      new TextRun({ text: "В случае отчисления Обучающегося из Университета до завершения им обучения по дополнительной общеобразовательной (общеразвивающей) программе в полном объеме в соответствии с п. 3 ст. 781, п. 1 ст. 782 ГК РФ право собственности на внесенный платеж в размере фактически произведенных Исполнителем расходов переходит к Исполнителю с момента отчисления Обучающегося из Университета. Расчет суммы возврата денежных средств ", font: "Arial", size: 16 }),
      new TextRun({ text: "осуществляется с момента отчисления", font: "Arial", size: 16 }),
      new TextRun({ text: " Обучающегося из Университета, перерасчет за пропущенные занятия в период освоения дополнительной общеобразовательной (общеразвивающей) программы ", font: "Arial", size: 16 }),
      new TextRun({ text: "не производится.", font: "Arial", size: 16 })] }), // Paragraph index 82
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "4.6. ", font: "Arial", size: 16 }),
      new TextRun({ text: "В случае ", font: "Arial", size: 16 }),
      new TextRun({ text: "незачисления", font: "Arial", size: 16 }),
      new TextRun({ text: " Обучающегося в ", font: "Arial", size: 16 }),
      new TextRun({ text: "Университет для обучения по дополнительной общеобразовательной (общеразвивающей) программе ", font: "Arial", size: 16 }),
      new TextRun({ text: "денежные средства, уплаченные Заказчиком, возвращаются ему в полном размере.", font: "Arial", size: 16 })] }), // Paragraph index 83
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 84
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "V. Основания, порядок изменения и расторжения договора", font: "Arial", size: 16 })] }), // Paragraph index 85
    new Paragraph({ style: "ConsPlusNormal" }), // Paragraph index 86
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "5.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Условия, на которых заключен настоящий Договор, могут быть изменены по соглашению Сторон или в соответствии с законодательством", font: "Arial", size: 16 }),
      new TextRun({ text: " Российской Федерации.", font: "Arial", size: 16 })] }), // Paragraph index 87
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "5.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Настоящий Договор может быть расторгнут по соглашению Сторон.", font: "Arial", size: 16 })] }), // Paragraph index 88
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "5.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Настоящий Договор может быть расторгнут по инициативе Исполнителя в одностороннем порядке в случаях:", font: "Arial", size: 16 })] }), // Paragraph index 89
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "установления нарушения порядка приема в образовательную организацию, повлекшего по вине Обучающегося его незаконное зачисление в эту образовательную организацию;", font: "Arial", size: 16 })] }), // Paragraph index 90
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "просрочки оплаты стоимости платных образовательных услуг;", font: "Arial", size: 16 })] }), // Paragraph index 91
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "невозможности надлежащего исполнения обязательства по оказанию платных образовательных услуг вследствие действий (бездействия) Обучающегося;", font: "Arial", size: 16 })] }), // Paragraph index 92
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "несоблюдения правил внутреннего распорядка;", font: "Arial", size: 16 })] }), // Paragraph index 93
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "в иных случаях, предусмотренных законодательством Российской Федерации.", font: "Arial", size: 16 })] }), // Paragraph index 94
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "5.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Настоящий Договор расторгается досрочно:", font: "Arial", size: 16 })] }), // Paragraph index 95
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "по инициативе Обучающегося или родителей (законных представителей) несовершеннолетнего Обучающегося, а также Заказчика;", font: "Arial", size: 16 })] }), // Paragraph index 96
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "по инициативе Исполнителя в случае применения к Обучающемуся, достигшему возраста пятнадцати лет, отчисления как меры дисциплинарного взыскания, а также в случае установления нарушения порядка приема в образовательную организацию, повлекшего по вине обучающегося его незаконное зачисление в образовательную организацию;", font: "Arial", size: 16 })] }), // Paragraph index 97
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "–", font: "Arial", size: 16 }),
      new TextRun({ text: "по обстоятельствам, не зависящим от воли Обучающегося или родителей (законных представителей) несовершеннолетнего Обучающегося, Заказчика и Исполнителя, в том числе в случае ликвидации Исполнителя.", font: "Arial", size: 16 })] }), // Paragraph index 98
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "5.5.", font: "Arial", size: 16 }),
      new TextRun({ text: "Исполнитель вправе отказаться от исполнения обязательств по Договору при условии полного возмещения Заказчику убытков.", font: "Arial", size: 16 })] }), // Paragraph index 99
    new Paragraph({ alignment: AlignmentType.JUSTIFY, children: [new TextRun({ text: "5.6.", font: "Arial", size: 16 }),
      new TextRun({ text: "Обучающийся/Заказчик (ненужное вычеркнуть) вправе отказаться от исполнения настоящего Договора при условии оплаты Исполнителю фактически понесенных им расходов, связанных с исполнением обязательств по Договору.", font: "Arial", size: 16 })] }), // Paragraph index 100
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 101
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 102
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "VI. Ответственность Исполнителя, Заказчика и Обучающегося", font: "Arial", size: 16 })] }), // Paragraph index 103
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 104
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "За неисполнение или ненадлежащее исполнение своих обязательств по Договору Стороны несут ответственность, предусмотренную", font: "Arial", size: 16 }),
      new TextRun({ text: " законодательством Российской Федерации и Договором.", font: "Arial", size: 16 })] }), // Paragraph index 105
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "При обнаружении недостатка образовательной услуги, в том числе оказания ее не в полном объеме, предусмотренном образовательными программами (частью образовательной программы), Заказчик вправе по своему выбору потребовать:", font: "Arial", size: 16 })] }), // Paragraph index 106
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.2.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Безвозмездного оказания образовательной услуги;", font: "Arial", size: 16 })] }), // Paragraph index 107
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.2.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Соразмерного уменьшения стоимости оказанной образовательной услуги;", font: "Arial", size: 16 })] }), // Paragraph index 108
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.2.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Возмещения понесенных им расходов по устранению недостатков оказанной образовательной услуги своими силами или третьими лицами.", font: "Arial", size: 16 })] }), // Paragraph index 109
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Заказчик вправе отказаться от исполнения Договора и потребовать полного возмещения убытков, если в разумный срок недостатки образовательной услуги не устранены Исполнителем. Заказчик также вправе отказаться от исполнения Договора, если им обнаружен существенный недостаток оказанной образовательной услуги или иные существенные отступления от условий Договора.", font: "Arial", size: 16 })] }), // Paragraph index 110
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Если Исполнитель нарушил сроки оказания образовательной услуги (сроки начала и (или) окончания оказания образовательной услуги и (или) промежуточные сроки оказания образовательной услуги) либо если во время оказания образовательной услуги стало очевидным, что она не будет осуществлена в срок, Заказчик вправе по своему выбору:", font: "Arial", size: 16 })] }), // Paragraph index 111
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.4.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Назначить Исполнителю новый срок, в течение которого Исполнитель должен приступить к оказанию образовательной услуги ", font: "Arial", size: 16 }),
      new TextRun({ text: "\nи (или) закончить оказание образовательной услуги;", font: "Arial", size: 16 })] }), // Paragraph index 112
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.4.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Поручить оказать образовательную услугу третьим лицам за разумную цену и потребовать от Исполнителя возмещения понесенных расходов;", font: "Arial", size: 16 })] }), // Paragraph index 113
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.4.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Потребовать уменьшения стоимости образовательной услуги;", font: "Arial", size: 16 })] }), // Paragraph index 114
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.4.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Расторгнуть Договор.", font: "Arial", size: 16 })] }), // Paragraph index 115
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "6.5.", font: "Arial", size: 16 }),
      new TextRun({ text: "Заказчик вправе потребовать полного возмещения убытков, причиненных ему в связи с нарушением сроков начала и (или) окончания оказания образовательной услуги, а также в связи с недостатками образовательной услуги.", font: "Arial", size: 16 })] }), // Paragraph index 116
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 117
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "VII. Срок действия Договора", font: "Arial", size: 16 })] }), // Paragraph index 118
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 119
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "7.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Настоящий Договор вступает в силу со дня его заключения Сторонами и действует до полного исполнения Сторонами обязательств.", font: "Arial", size: 16 })] }), // Paragraph index 120
    new Paragraph({ style: "ConsPlusNormal" }), // Paragraph index 121
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal", children: [new TextRun({ text: "VIII. Заключительные положения", font: "Arial", size: 16 })] }), // Paragraph index 122
    new Paragraph({ alignment: AlignmentType.CENTER, style: "ConsPlusNormal" }), // Paragraph index 123
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "8.1.", font: "Arial", size: 16 }),
      new TextRun({ text: "Сведения, указанные в настоящем Договоре, соответствуют информации, размещенной на официальном сайте Исполнителя ", font: "Arial", size: 16 }),
      new TextRun({ text: "\nв сети «Интернет» на дату заключения настоящего Договора.", font: "Arial", size: 16 })] }), // Paragraph index 124
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "8.2.", font: "Arial", size: 16 }),
      new TextRun({ text: "Под периодом предоставления образовательной услуги (периодом обучения) понимается промежуток времени с даты издания приказа/распоряжения о зачислении Обучающегося в образовательную организацию до даты издания приказа/распоряжения об окончании обучения или отчислении Обучающегося из образовательной организации.", font: "Arial", size: 16 })] }), // Paragraph index 125
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "8.3.", font: "Arial", size: 16 }),
      new TextRun({ text: "Настоящий Договор составлен в 3 экземплярах, два находятся у Исполнителя, один – у Заказчика. Все экземпляры имеют одинаковую юридическую силу. Изменения и дополнения настоящего Договора могут производиться только в письменной форме ", font: "Arial", size: 16 }),
      new TextRun({ text: "\nи подписываться уполномоченными представителями Сторон.", font: "Arial", size: 16 })] }), 
      
      // Paragraph index 126
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "8.4.", font: "Arial", size: 16 }),
      new TextRun({ text: "Изменения Договора оформляются дополнительными соглашениями к Договору.", font: "Arial", size: 16 })] }), 
      // Paragraph index 127

    new Paragraph({ alignment: AlignmentType.JUSTIFY, spacing: { line: 240, rule: 'auto' }, style: "Абзацсписка1", children: [new TextRun({ text: "8.5.", font: "Arial", size: 16 }),
      new TextRun({ text: "Обучающийся/Заказчик согласен на обработку своих персональных данных в целях исполнения Сторонами своих обязательств. Обработка персональных данных осуществляется Исполнителем в порядке, установленном законодательством Российской Федерации (приложение 1 к Договору).", font: "Arial", size: 16 })] }), // Paragraph index 128
    
      new Paragraph({ alignment: AlignmentType.JUSTIFY, spacing: { line: 240, rule: 'auto' }, style: "Абзацсписка1", children: [new TextRun({ text: "8.6.", font: "Arial", size: 16 }),
      new TextRun({ text: "Настоящий договор (а также дополнительные соглашения к нему) может быть заключен путем обмена сторонами посредством электронной почты с адресов, указанных в реквизитах сторон настоящего договора, сканированными копиями подписанного соответствующей стороной текста договора. В соответствии со статьей 160 Гражданского кодекса РФ такой обмен стороны признают соблюдением письменной формы сделки и надлежащим подписанием договора.", font: "Arial", size: 16 })] }), // Paragraph index 129
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240 }, children: [new TextRun({ text: "IХ", font: "Arial", size: 16 }),
      new TextRun({ text: ". Адреса и реквизиты ", font: "Arial", size: 16 }),
      new TextRun({ text: "с", font: "Arial", size: 16 }),
      new TextRun({ text: "торон", font: "Arial", size: 16 })] }), // Paragraph index 130
    new Paragraph({ alignment: AlignmentType.CENTER }), 
    
      // Paragraph index 138

    new Table({
      rows: [
        new TableRow({ children: [new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Исполнитель", font: "Arial", size: 16 })] })] }), new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, indent: { left: -114 }, children: [new TextRun({ text: "Заказчик", font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 })] })] }), new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Обучающийся", font: "Arial", size: 16 })] })] })] }),
        new TableRow({ children: [new TableCell({ children: [new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Федеральное государственное бюджетное ", font: "Arial", size: 16 }), new TextRun({ text: "образовательное учреждение высшего образования", font: "Arial", size: 16 }), new TextRun({ text: " «Кубанский государственный университет»", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Место нахождения: ", font: "Arial", size: 16 }), new TextRun({ text: ". Краснодар, ул. Ставропольская, 149 ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "тел.", font: "Arial", size: 16 }), new TextRun({ text: ":", font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 }), new TextRun({ text: "(861)21-99-530", italic: true, font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "e", font: "Arial", size: 16 }), new TextRun({ text: "-", font: "Arial", size: 16 }), new TextRun({ text: "mail", font: "Arial", size: 16 }), new TextRun({ text: ": ", font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Официальный сайт: www.kubsu.ru", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Банковские реквизиты:", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "ИНН 2312038420 КПП 231201001 ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "УФК по Краснодарскому краю ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "(ФГБОУ ВО «КУБАНСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ» ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "л/с 20186Х22950, ", font: "Arial", size: 16 }), new TextRun({ text: "\n", font: "Arial", size: 16 }), new TextRun({ text: "где Х – большая латинская буква)", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "ЕКС 40102810945370000010", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Номер казначейского счета 03214643000000011800", font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "БИК 010349101", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "ЮЖ", font: "Arial", size: 16 }), new TextRun({ text: "НОЕ ГУ Банка России//УФК по Краснодарскому краю г. Краснодар", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "ОКТМО 03701000", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "ОКПО 02067847 ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "ОКОНХ 92100", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Обязательно указать в НП:", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "КБК – 00000000000000000130 ", font: "Arial", size: 16 })] })] }), new TableCell({ children: [new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Фамил", font: "Arial", size: 16 }), new TextRun({ text: "ия, имя, отчество (при наличии)", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "/наименование юридического лица", font: "Arial", size: 16 })] }), new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell" }), new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell", children: [new TextRun({ text: "Иванов Иван Иванович", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 })] }), new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell" }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "А", font: "Arial", size: 16 }), new TextRun({ text: "дрес места жительства", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "г. Краснодар, ул. ", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "Лесная, д.6, кв. 10", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ spacing: { before: 120 }, style: "ConsPlusCell", children: [new TextRun({ text: "Паспорт: серия, номер, ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "когда и кем выдан ", font: "Arial", size: 16 })] }), new Paragraph({ spacing: { before: 50 }, style: "ConsPlusCell", children: [new TextRun({ text: "хххх", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: " ", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "хххххх", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: " выдан ", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "ГУ МВД России по Краснодарскому краю", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: " ", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "17.07.2017", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ spacing: { before: 50 }, style: "ConsPlusCell" }), new Paragraph({ spacing: { before: 50 }, style: "ConsPlusCell", children: [new TextRun({ text: "Банковские реквизиты (при наличии), ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "телефон:", font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 }), new TextRun({ text: "+7(", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "989)042-75-85", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell" })] }), new TableCell({ children: [new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Фамилия, имя, отчество", font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 }), new TextRun({ text: "(при наличии)", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell", children: [new TextRun({ text: "Иванов Илья Иванович", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: " ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "Дата рождения ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "15.10", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: ".2008", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "А", font: "Arial", size: 16 }), new TextRun({ text: "дрес места жительства", font: "Arial", size: 16 })] }), new Paragraph({ indent: { left: -108 }, style: "ConsPlusCell", children: [new TextRun({ text: "г. Краснодар, ул. ", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "Лесная, д.6, кв. 10", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ indent: { left: -108 }, style: "ConsPlusCell" }), new Paragraph({ indent: { left: -108 }, style: "ConsPlusCell", children: [new TextRun({ text: "Паспорт: серия, номер, ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "когда и кем выдан ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "хххх", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: " ", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "хххххх", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: " выдан ГУ МВД России по Краснодарскому краю 22.08.2022", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ indent: { left: -390 }, style: "ConsPlusCell", children: [new TextRun({ text: "Банковские реквизиты (при наличии), ", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell", children: [new TextRun({ text: "телефон: ", font: "Arial", size: 16 }), new TextRun({ text: "+7(", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: "989)042-75-85", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusNormal", children: [new TextRun({ text: "С правилами внутреннего распорядка обучающихся ", font: "Arial", size: 16 }), new TextRun({ text: "Кубанского государственного университета", font: "Arial", size: 16 }), new TextRun({ text: " ознакомлен", font: "Arial", size: 16 }), new TextRun({ text: "(а)", font: "Arial", size: 16 }), new TextRun({ text: ":", font: "Arial", size: 16 })] }), new Paragraph({ style: "ConsPlusCell" }), new Paragraph({ alignment: AlignmentType.JUSTIFY, spacing: { before: 240 }, style: "ConsPlusCell", children: [new TextRun({ text: "__________                    ", italic: true, font: "Arial", size: 16 }), new TextRun({ text: "  ", italic: true, font: "Arial", size: 16 }), new TextRun({ text: "Иванов И.И", bold: true, underline: true, font: "Arial", size: 16 }), new TextRun({ text: ".", bold: true, underline: true, font: "Arial", size: 16 })] }), new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell", children: [new TextRun({ text: "(", italic: true, font: "Arial", size: 12 }), new TextRun({ text: "   ", italic: true, font: "Arial", size: 12 }), new TextRun({ text: " ", italic: true, font: "Arial", size: 12 }), new TextRun({ text: "подпись)                                                  Ф.И.О.", italic: true, font: "Arial", size: 12 })] })] })] })
      ]
      // TODO: Add other table properties like layout, borders if needed
    }), // Table index 0


// Paragraph index 131
    new Paragraph({ alignment: AlignmentType.JUSTIFY, spacing: { before: 360 }, style: "ConsPlusCell", children: [new TextRun({ text: "Проректор", font: "Arial", size: 16 })] }), // Paragraph index 132
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell", children: [new TextRun({ text: "по довузовскому и дополнительному", font: "Arial", size: 16 })] }), // Paragraph index 133
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell", children: [new TextRun({ text: "профессиональному образованию", font: "Arial", size: 16 })] }), // Paragraph index 134
    new Paragraph({ alignment: AlignmentType.JUSTIFY, spacing: { before: 240 }, style: "ConsPlusCell", children: [new TextRun({ text: "_________________________ С.Ю. Кустов", font: "Arial", size: 16 }),
      new TextRun({ text: "	___________ ", font: "Arial", size: 16 }),
      new TextRun({ text: "        ", font: "Arial", size: 16 }),
      new TextRun({ text: "Иванов И.И", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: ".", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: "       ", font: "Arial", size: 16 }),
      new TextRun({ text: "  ", font: "Arial", size: 16 }),
      new TextRun({ text: "                  ", font: "Arial", size: 16 }),
      new TextRun({ text: "     ", font: "Arial", size: 16 }),
      new TextRun({ text: "______", font: "Arial", size: 16 }),
      new TextRun({ text: "____   ", font: "Arial", size: 16 }),
      new TextRun({ text: "  ", font: "Arial", size: 16 }),
      new TextRun({ text: " ", font: "Arial", size: 16 }),
      new TextRun({ text: "      ", font: "Arial", size: 16 }),
      new TextRun({ text: "Иванов И.И", bold: true, underline: true, font: "Arial", size: 16 }),
      new TextRun({ text: ".", bold: true, underline: true, font: "Arial", size: 16 })] }), // Paragraph index 135
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell", children: [new TextRun({ text: "(подпись)", italic: true, font: "Arial", size: 12 }),
      new TextRun({ text: "	", italic: true, font: "Arial", size: 16 }),
      new TextRun({ text: "(подпись)", italic: true, font: "Arial", size: 12 }),
      new TextRun({ text: "	Ф.И.О. ", italic: true, font: "Arial", size: 12 }),
      new TextRun({ text: "	(подпись)", italic: true, font: "Arial", size: 12 }),
      new TextRun({ text: "	Ф.И.О.", italic: true, font: "Arial", size: 12 })] }), // Paragraph index 136
    new Paragraph({ alignment: AlignmentType.JUSTIFY, style: "ConsPlusCell" }), // Paragraph index 137
    new Paragraph({ alignment: AlignmentType.JUSTIFY, indent: { left: 6946 }, style: "ConsPlusCell", children: [new TextRun({ text: "М.П.", font: "Arial", size: 16 }),
      new TextRun({ text: "	", font: "Arial", size: 16 })] }), 


      ],
    }],
  });

    // Generate and save document
    const blob = await Packer.toBlob(doc);
    this.objectType = "docx";
    this.documentTitle = "Предпросмотр договора";
    const respo = await this.uploadGeneratedFile(blob, "contract.docx");
    this.filePath = ReqExec.baseUrl + "/api/Query/downloadFile/" + respo;
    this.docPreview = true;
  },

    
  },
  computed: {
    ...mapState(useContractStore, ["contractList"]),
    ...mapState(useListenerStore, ["listenerList"]),
    ...mapState(usePayerStore, ["payerList"]),
    programOptions() {
      const programStore = useProgramStore();
      return Object.values(programStore.programMap || {})
      .map((item) => ({
        value: item.id,
        label: item.program_name,
      }));
    },
    listenerOptions() {
      const listenerStore = useListenerStore();
      return Object.values(listenerStore.listenerMap || {})
      .filter(item => item.deleted_at === null)
      .map((item) => ({
        value: item.id,
        label: item.full_name,
      }));
    },
    payerOptions() {
      const payerStore = usePayerStore();
      return Object.values(payerStore.payerMap || {})
      .filter(item => item.deleted_at === null)
      .map((item) => ({
        value: item.id,
        label: item.full_name,
      }));
    },
  },
  created() {
    this.loadContractsData();
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
  justify-content: center;
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
  box-shadow: inset 0 1px 1px rgba(6,215,29,0.075),
              0 0 8px rgba(6,215,29,0.6);
}
.form-select:focus {
  border-color: rgba(1,20,8,0.815);
  box-shadow: inset 0 1px 1px rgba(6,215,29,0.075),
              0 0 8px rgba(6,215,29,0.6);
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
  width: 500px;
}

:deep(.p-dialog) {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  top: 0 !important;
  left: 0 !important;
}

:deep(.p-dialog-content) {
  height: calc(100vh - 60px) !important;
  padding: 0 !important;
}

:deep(.p-dialog-header) {
  padding: 0.5rem !important;
}
</style>

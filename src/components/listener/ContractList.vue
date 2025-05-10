<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <!-- Строка заголовка -->
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех договоров</span>
      </div>
    </div>

    <!-- Первая строка: Поиск и Очистка фильтров -->
    <div class="row g-2 mb-2">
      <div class="col ps-0 py-0 pe-3"> <!-- Колонка для поиска занимает оставшееся место -->
        <input
          class="form-control"
          type="text"
          v-model="quickFilterValue"
          id="filter-text-box"
          @input="onFilterTextBoxChanged"
          placeholder="Поиск..."
        />
      </div>
      <div class="col-auto p-0"> <!-- Колонка для кнопки Очистить (авто ширина) -->
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
        @click="deleteContract"
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
import UserService from "../../services/user.service";

import { mapActions, mapState } from "pinia";
import { useContractStore } from "@/store2/listenergroup/contract";
import { useListenerStore } from "@/store2/listenergroup/listener";
import { usePayerStore } from "@/store2/listenergroup/payer";
import { useProgramStore } from "@/store2/listenergroup/program";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, UnderlineType, TabStopType, TabStopPosition, PageNumber, VerticalAlign, Indent, Spacing, Table, TableRow, TableCell, WidthType, convertInchesToTwip, HeightRule } from "docx";
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
          field: "full_name",
          headerName: "Слушатель",
        },
        {
          field: "payer_full_name",
          headerName: "Законный представитель",
        },
        {
          field: "contr_number",
          headerName: "Номер договора",
          maxWidth: 175,
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
      new ComboboxInput({
        key: "listener_id",
        label: "\nСлушатель",
        placeholder: "Выберите слушателя",
        options: this.listenerOptions,
      }),
      new ComboboxInput({
        key: "payer_id",
        label: "Законный представитель",
        placeholder: "Выберите представителя",
        options: this.payerOptions,
      }),
      new TextInput({
        key: "contr_number",
        label: "\nНомер договора",
        placeholder: "Номер договора",
        validation: [requiredRule],
      }),
      new ComboboxInput({
        key: "program_id",
        label: "\nПрограмма",
        placeholder: "Выберите программу",
        options: this.programOptions,
      }),
      new DateInput({
        key: "cert_date",
        label: "Дата выдачи сертификата",
        dateFormat: "dd/mm/yy",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "listened_hours",
        label: "\nПрослушанные часы",
        placeholder: "Часы",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "date_enroll",
        label: "\nДата зачисления",
        dateFormat: "dd/mm/yy",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "date_kick",
        label: "\nДата отчисления",
        dateFormat: "dd/mm/yy",
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
          this.previewContract();
        }
      }
    },
    resetContract() {
      this.contract = new Contract({});
      this.errors = {};
    },
    async previewContract() {
      await this.createContractDocx();
      this.docPreview = true;
    },
    async submit() {
      const currentContract = { ...this.contract };
      try {
        if (currentContract.id) {
          await UserService.putContract(currentContract);
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
    async deleteContract() {
      try {
        await UserService.deleteContract(this.contract.id);
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

       await this.loadDaysData(); 
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

    this.wishesSidebarStyle = {
      width: isScreenWideEnough ? '840px' : '100%', 
      minWidth: isScreenWideEnough ? `${minWidthValue}px` : 'auto', 
      maxHeight: '750px',
      height: 'auto',
      margin: isScreenWideEnough ? 'auto' : '0' 
    };
  },

  async createContractDocx(contract) {
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Тут мог быть договор",
                size: 28,
                bold: true,
              }),
            ],
          }),
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
      return Object.values(programStore.programMap || {}).map((item) => ({
        value: item.id,
        label: item.program_name,
      }));
    },
    listenerOptions() {
      const listenerStore = useListenerStore();
      return Object.values(listenerStore.listenerMap || {}).map((item) => ({
        value: item.id,
        label: item.name,
      }));
    },
    payerOptions() {
      const payerStore = usePayerStore();
      return Object.values(payerStore.payerMap || {}).map((item) => ({
        value: item.id,
        label: item.name,
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

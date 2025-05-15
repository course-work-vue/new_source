<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <!-- Строка заголовка -->
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех плательщиков</span>
      </div>
    </div>

    <!-- Первая строка: Поиск и Очистка фильтров -->
    <div class="row g-2 mb-2">
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
          class="btn btn-primary clear-filters-btn"
          type="button"
        >
          <i class="material-icons-outlined me-1">close</i>Очистить фильтры
        </button>
      </div>
    </div>

    <!-- Строка кнопки Добавить -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0">
        <button
          @click="openSidebar"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить плательщика
        </button>
      </div>
      <div class="col"></div> <!-- Пустая колонка, если кнопка не w-100, для выравнивания -->
    </div>

    <!-- Строка с AG Grid -->
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
      header="Данные плательщика"
      class="custom-sidebar h-auto"
      :style="mainSidebarStyle"
    >
      <div class="card flex flex-row">
        <div class="form card__form"> 
          <auto-form
            v-if="scheme"
            v-model="payer"
            v-model:errors="errors"
            :scheme="scheme"
            class="custom-form"
            item-class="form__item"
          >
          </auto-form>
        </div>
      </div>
      <!-- Обновленная структура кнопок, как в слушателях (без кнопки "Пожелания") -->
      <div class="d-flex justify-content-end align-items-center mt-3">
        <div>
          <Button class="btn btn-primary float-start me-3" @click="submit">
            Сохранить
          </Button>
          <Button class="btn btn-primary float-end" v-if="payer.id" @click="deletePay">
            Удалить
          </Button>
        </div>
      </div>
    </Sidebar>
  </div>
</template>
<script>

import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { usePayerStore } from "@/store2/listenergroup/payer";
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
import Payer from "@/model/listener-group/Payer";

import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

/* eslint-disable vue/no-unused-components */
export default {
  name: "App",
  components: {
    AgGridVue,
    ButtonCell,
    AutoForm,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;

    const gridApi = ref(null); // Optional - for accessing Grid's API
    const gridColumnApi = ref();

    const dataFromApi = ref(null); // This will store the data from the API
    const dataLoaded = ref(false); // This flag will indicate if data is loaded

    const route = useRoute();
    const paginationPageSize = 60;


    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
     
    };
    const navigateToStudent = () => {};

    const rowData = reactive({}); // Set rowData to Array of Objects, one Object per Row

    // Each Column Definition results in one Column.
    const columnDefs = reactive({
      value: [
      {
      sortable: false,
      filter: false,
      headerName: '',
      cellRenderer: 'ButtonCell',
      cellRendererParams: {
        onClick: navigateToStudent,
        label: 'View Details', // Button label
      },
      maxWidth: 50,
      resizable: false

    },
           
           { field: "full_name", headerName: 'ФИО' },
           {
            field: 'email',
            headerName: 'email', hide: true
           },
           {
            field: 'phone_number',
            headerName: 'Телефон'
           }
      ],
    });

    // DefaultColDef sets props common to all Columns
    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
    };

    // Example load data from server
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
      localeText,
      cellWasClicked: (event) => { // Example of consuming Grid Event
        console.log("cell was clicked", event);
      },
      deselectRows: () =>{
        gridApi.value.deselectAll()
      },

      onFilterTextBoxChanged,
      paginationPageSize,
      navigateToStudent,
      dataFromApi,
      dataLoaded,
    };
  },
  data() {
  return {
    showSidebar: false,
    quickFilterValue: '',
    filters:false,
    payer: new Payer(),
    errors: {},
    scheme: null,
    mainSidebarStyle: {},
  };
},

async mounted() {
    try {
    await this.getPayerList();
    this.loadPayersData();
  } catch (error) {
    console.error("Ошибка при загрузке данных слушателей:", error);
  }
  this.scheme = new FormScheme([
  
  new TextInput({
    key: "name",
    label: "\nИмя",
    placeholder: "Имя",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "surname",
    label: "\nФамилия",
    placeholder: "Фамилия",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "lastname",
    label: "\nОтчество",
    placeholder: "Отчество",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "passport",
    label: "Серия и номер паспорта",
    placeholder: "",
    validation: [requiredRule],
  }),
  new DateInput({
    key: "issue_date",
    label: "Дата выдачи",
    dateFormat: "dd/mm/yy",
    size: "sm",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "department_code",
    label: "Код подразделения",
    placeholder: "Код подразделения",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "registration_address",
    label: "Адрес регистрации",
    placeholder: "Адрес регистрации",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "snils",
    label: "СНИЛС",
    placeholder: "СНИЛС",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "phone_number",
    label: "Телефон",
    placeholder: "Номер телефона",
    validation: [requiredRule],
  }),
  new TextInput({
    key: "email",
    label: "Электронная почта",
    placeholder: "Электронная почта",
    validation: [emailRule],
  }),
]);

    this.updateSidebarStyles(); 
    window.addEventListener('resize', this.updateSidebarStyles);

  },

  beforeUnmount() { 
    window.removeEventListener('resize', this.updateSidebarStyles);
  },

  methods: {

    ...mapActions(usePayerStore, [
      "getPayerList",
      "postPayer",
      ,
      "putPayer",
      "deletePayer",
    ]),
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
        this.edit(event);
      }
    },
    resetPayer() {
      this.payer = new Payer();
    },
    edit(event) {
      this.resetPayer();
      this.payer = event.data;
      console.log(this.payer);
      this.showSidebar = true;
    },

    async submit() {

      console.log("Сабмитаю")
let payer = { ...this.payer };

if (payer.id) {
  console.log("До пута")
  console.log(payer)
  await this.putPayer(payer);
  console.log("После пута")
} else {
  console.log("До поста")
  console.log(payer)
  await this.postPayer(payer);
  console.log("После поста")
}
this.showSidebar = false;
this.resetPayer();
this.loadPayersData();
},
async deletePay() {

      let payer = { ...this.payer };

      console.log(payer);

      await this.deletePayer(payer);

      this.showSidebar = false;
      this.resetPayer();
      this.loadPayersData();
    },


    async loadPayersData() {
  try {
    if (Array.isArray(this.payerList)) {
      this.rowData.value = this.payerList
      .filter(payer => payer.deleted_at === null)
    } else if (this.payerList && this.payerList.deleted_at === null) {
      this.rowData.value = [this.payerList];
    } else {
      this.rowData.value = [];
    }
    
  } catch (error) {
    console.error("Ошибка при загрузке данных плательщиков:", error);
    this.rowData.value = [];  // Очистка в случае ошибки
  }
},
      navigateToAddListener() {},

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
},
  clearFilters(){

  
    this.gridApi.setFilterModel();
    this.gridApi.setQuickFilter();
    this.quickFilterValue='';
    this.filters=false;
  },
  openSidebar() {
      this.resetPayer();
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
        width: isScreenWideEnough ? `${minWidthValue}px` : '100%',
        minWidth: isScreenWideEnough ? `${minWidthValue}px` : 'auto',
        maxHeight: '750px', 
        height: 'auto',     
        margin: isScreenWideEnough ? 'auto' : '0' 
      };
    },


    },
    computed:{
    ...mapState(usePayerStore, ["payerList"]),
  },

    created() {
    this.loadPayersData();
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

.skeleton {
  width: 100%;
  height: 1.2em;
  background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 3.5s infinite linear;
  border-radius: 4px;
  margin: 0.2em 0;
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
  .list{
    padding-left: 100px;
    font-size: 10px;
    max-width: 1100px;
  }
}

@media (max-width: 1023px) {



  .list{
    padding-left: 100px;
    font-size: 13px;

  }
}
@media (min-width: 1023px) {



.list{
  padding-left: 100px;
  padding-right: 5px;

}
}
.nmbr{
  height: 44px;
}



.btn-primary{
    --bs-btn-bg: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
    --bs-btn-active-bg: rgb(68,99,52);
    --bs-btn-disabled-bg: rgb(68,99,52);
    display: flex;
  justify-content: center;
  align-items: center;
}
.form-control:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}
.form-select:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}

.form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px; 
  margin-bottom: 10px;


  &__item {
    padding: 5px;

    & > label { 
      display: block; 
      margin-bottom: 4px; 
      font-weight: 500; 
    }
  }

  &__item--passport-label {
    & > label { 
      font-size: 10px; 
      line-height: 1.2; 
    }
  }
}

.btn-primary,
.form-control,
.form-select {
  height: 28px; /* Стандартная высота */
  line-height: 1.2; /* Для лучшего вертикального выравнивания текста в инпутах */
  padding-top: 0.25rem; /* Небольшой паддинг сверху и снизу */
  padding-bottom: 0.25rem;
  font-size: 14px;
}

.btn-primary {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-control,
.form-select {
  padding-top: 0;
  padding-bottom: 0;
}

.page-link{
  height: 40px;
  width: 40px;
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.active{
  .page-link{
    background-color: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
 
  }
}
.disabled{
  .page-link{
    background-color: rgb(57, 79, 46);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
  }
}

</style>
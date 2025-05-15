<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех платежей</span>
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
          <i class="material-icons-outlined me-1">add</i>Добавить платёж
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

    <Sidebar
      v-model:visible="showSidebar"
      position="bottom"
      modal
      header="Данные платежа"
      class="custom-sidebar h-auto"
      :style="mainSidebarStyle"
      @hide="onSidebarHide"
    >
      <div class="card flex flex-row">
        <div class="form card__form">
          <auto-form
            v-if="scheme"
            v-model="payment"
            v-model:errors="errors"
            :scheme="scheme"
            class="custom-form"
          >
          </auto-form>
           <div v-else>Загрузка формы...</div>
        </div>
      </div>

      <Button class="btn btn-primary float-start mt-3" @click="submit">
        Сохранить (Оплатить)
      </Button>
      <Button
        v-if="payment.id"
        class="btn btn-danger float-end mt-3"
        @click="deletePay"
      >
        Удалить
      </Button>
    </Sidebar>

  </div>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import { reactive, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { usePaymentStore } from "@/store2/listenergroup/payment";
import { useContractStore } from "@/store2/listenergroup/contract";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import {
  requiredRule,
} from "@/model/form/validation/rules";
import { TextInput } from "@/model/form/inputs/TextInput";
import { DateInput } from "@/model/form/inputs/DateInput";
import { ComboboxInput } from "@/model/form/inputs/ComboboxInput";

import Payment from "@/model/listener-group/Payment";

import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

const formatDateValue = (params) => {
  const value = params.value;
  if (!value) return '';
  try {
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
      }
    }
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) return value;

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Ошибка форматирования даты:", value, e);
    return value;
  }
};


export default {
  name: "PaymentList",
  components: {
    AgGridVue,
    ButtonCell,
    AutoForm,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;
    const gridApi = ref(null);
    const gridColumnApi = ref(null);
    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const rowData = reactive({});

    const paymentStatusDisplayMap = {
        'not_paid': 'Не оплачен',
        'paid_40': 'Оплачено 40%',
        'paid_100': 'Оплачен полностью'
    };

    const columnDefs = reactive({
      value: [
        {
          sortable: false,
          filter: false,
          headerName: "",
          cellRenderer: "ButtonCell",
          cellRendererParams: { label: "View Details" },
          maxWidth: 50,
          resizable: false,
        },
        { field: "contract_id", headerName: "Номер договора" },
        {
          field: "status",
          headerName: "Статус",
          valueFormatter: params => paymentStatusDisplayMap[params.value] || params.value,
        },
        {
          field: "expiration_date",
          headerName: "Срок оплаты",
          valueFormatter: formatDateValue,
        },
        {
          field: "date_paid_40",
          headerName: "Дата оплаты 40%",
          valueFormatter: formatDateValue,
          hide:true,
        },
        {
          field: "date_paid_100",
          headerName: "Дата полной оплаты",
          valueFormatter: formatDateValue,
          hide:true,
        },
        { field: "all_sum", headerName: "Вся сумма" },
        { field: "deposited_amount", headerName: "Внесено" },
        { field: "left_to_pay", headerName: "Осталось оплатить" },
        { field: "bank", headerName: "Банк", hide: true },
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 100,
    };

    const onFilterTextBoxChanged = () => {
      if (gridApi.value) {
        gridApi.value.setQuickFilter(
          document.getElementById("filter-text-box").value
        );
      }
    };

    return {
      rowData,
      columnDefs,
      defaultColDef,
      localeText,
      onGridReady,
      onFilterTextBoxChanged,
      paginationPageSize,
      gridApi,
    };
  },
  data() {
    return {
      showSidebar: false,
      quickFilterValue: "",
      filters: false,
      payment: new Payment(),
      errors: {},
      scheme: null,
      paymentStatusOptions: [
        { value: 'not_paid', label: 'Не оплачен' },
        { value: 'paid_40', label: 'Оплачено 40%' },
        { value: 'paid_100', label: 'Оплачен полностью' },
      ],
      mainSidebarStyle: {},
    };
  },
  async mounted() {
    try {
      await Promise.all([
        this.getPaymentList(),
        this.getContractList()
      ]);
      this.loadPaymentsData();
      this.updateSidebarStyles();
      window.addEventListener('resize', this.updateSidebarStyles);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateSidebarStyles);
  },
  methods: {
    ...mapActions(usePaymentStore, [
      "getPaymentList",
      "postPayment",
      "putPayment",
      "deletePayment",
    ]),
    ...mapActions(useContractStore, ["getContractList"]),

    onSidebarHide() {
        this.errors = {};
    },

    updatePaymentAmounts() {
      const totalSum = parseFloat(this.payment.all_sum) || 0;

      if (this.payment.status === 'paid_40') {
        this.payment.deposited_amount = (totalSum * 0.4).toFixed(2);
        this.payment.left_to_pay = (totalSum * 0.6).toFixed(2);
      } else if (this.payment.status === 'paid_100') {
        this.payment.deposited_amount = totalSum.toFixed(2);
        this.payment.left_to_pay = (0).toFixed(2);
      } else {
        this.payment.deposited_amount = (0).toFixed(2);
        this.payment.left_to_pay = totalSum.toFixed(2);
      }
    },

    generateScheme() {
      const inputs = [
        new ComboboxInput({
          key: "contract_id",
          label: "Номер договора",
          placeholder: "Выберите договор",
          options: this.contractOptions,
          validation: [requiredRule],
        }),
        new TextInput({
          key: "all_sum",
          label: "Вся сумма",
          placeholder: "Сумма",
          type: "number",
          validation: [requiredRule],
        }),
        new DateInput({
          key: "expiration_date",
          label: "Срок оплаты",
          dateFormat: "dd/mm/yy",
          validation: [requiredRule],
        }),
        new ComboboxInput({
          key: "status",
          label: "Статус платежа",
          options: this.paymentStatusOptions,
          validation: [requiredRule],
        }),
      ];

      // Поле "Дата оплаты 40%"
      if (this.payment.status === 'paid_40' || this.payment.status === 'paid_100') {
        inputs.push(new DateInput({
          key: 'date_paid_40',
          label: 'Дата оплаты 40%',
          dateFormat: 'dd/mm/yy',
          // Обязательно только если статус 'Оплачено 40%'
          validation: (this.payment.status === 'paid_40') ? [requiredRule] : [],
        }));
      }

      // Поле "Дата полной оплаты"
      if (this.payment.status === 'paid_100') {
        inputs.push(new DateInput({
          key: 'date_paid_100',
          label: 'Дата полной оплаты',
          dateFormat: 'dd/mm/yy',
          validation: [requiredRule], // Всегда обязательно для 'Оплачен полностью'
        }));
      }

      inputs.push(
        new TextInput({
          key: "bank",
          label: "Банк",
          placeholder: "Название банка",
        }),
        new TextInput({
          key: "deposited_amount",
          label: "Внесённая сумма",
          readonly: true,
          type: "number",
        }),
        new TextInput({
          key: "left_to_pay",
          label: "Остаточная сумма",
          readonly: true,
          type: "number",
        })
      );

      this.scheme = new FormScheme(inputs);
    },

    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
        this.edit(event);
      }
    },

    edit(event) {
      this.payment = new Payment(event.data);
      this.updatePaymentAmounts();
      this.generateScheme();
      this.showSidebar = true;
    },

    resetPayment() {
      this.payment = new Payment();
      this.updatePaymentAmounts();
    },

    openSidebar() {
      this.resetPayment();
      this.generateScheme();
      this.showSidebar = true;
    },

    async loadPaymentsData() {
      try {
        if (Array.isArray(this.paymentList)) {
          this.rowData.value = this.paymentList.filter(
            (pay) => pay.deleted_at === null
          );
        } else if (this.paymentList && this.paymentList.deleted_at === null) {
          this.rowData.value = [this.paymentList];
        } else {
          this.rowData.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных платежей:", error);
        this.rowData.value = [];
      }
    },

    async submit() {
      this.errors = {};
      let isValid = true;

      // Ручная валидация для дат
      if (this.payment.status === 'paid_40') { // Только если 'Оплачено 40%'
        if (!this.payment.date_paid_40) {
          this.errors.date_paid_40 = 'Дата оплаты 40% обязательна';
          isValid = false;
        }
      }
      
      if (this.payment.status === 'paid_100') { // Только если 'Оплачен полностью'
        if (!this.payment.date_paid_100) {
          this.errors.date_paid_100 = 'Дата полной оплаты обязательна';
          isValid = false;
        }
        // date_paid_40 не проверяется на обязательность здесь, т.к. она не обязательна для paid_100
      }

      if (!isValid) {
        console.warn("Форма не прошла валидацию", this.errors);
        return;
      }

      const currentPayment = { ...this.payment };

      if (currentPayment.status === 'not_paid') {
        currentPayment.date_paid_40 = null;
        currentPayment.date_paid_100 = null;
      } else if (currentPayment.status === 'paid_40') {
        currentPayment.date_paid_100 = null;
      }
      // Для 'paid_100' date_paid_40 останется как есть (null если не заполнена)

      try {
        if (currentPayment.id) {
          await this.putPayment(currentPayment);
        } else {
          await this.postPayment(currentPayment);
        }
        await this.getPaymentList();
        this.loadPaymentsData();
        this.showSidebar = false;
        this.resetPayment();
      } catch (error) {
          console.error("Ошибка при сохранении платежа:", error);
          if (error.response && error.response.data && error.response.data.errors) {
            this.errors = error.response.data.errors;
          } else {
            this.errors.general = "Произошла ошибка при сохранении.";
          }
      }
    },

    async deletePay() {
      if (!this.payment.id) return;
      try {
        await this.deletePayment({ id: this.payment.id });
        await this.getPaymentList();
        this.loadPaymentsData();
        this.showSidebar = false;
        this.resetPayment();
      } catch (error) {
        console.error("Ошибка при удалении платежа:", error);
      }
    },

    onFirstDataRendered(params) {
      const route = useRoute();
      const filterModelQuery = route.query.filterModel;
      if (filterModelQuery) {
        const filterModel = JSON.parse(filterModelQuery);
        if(this.gridApi) this.gridApi.setFilterModel(filterModel);
        this.filters = true;
      }

      const quickFilterQuery = route.query.quickFilter;
      if (quickFilterQuery) {
        const quickFilter = JSON.parse(quickFilterQuery);
         if(this.gridApi) this.gridApi.setQuickFilter(quickFilter);
        this.quickFilterValue = quickFilter;
        this.filters = true;
      }
    },
    onFilterChanged() {
      this.filters = false;
      if (!this.gridApi) return;

      const savedQuickFilter = this.gridApi.getQuickFilter();
      const savedFilterModel = this.gridApi.getFilterModel();
      const queryParams = {};

      if (savedQuickFilter) {
        queryParams.quickFilter = JSON.stringify(savedQuickFilter);
        this.filters = true;
      }
      if (savedFilterModel && Object.keys(savedFilterModel).length > 0) {
        queryParams.filterModel = JSON.stringify(savedFilterModel);
        this.filters = true;
      }
      this.$router.push({ query: queryParams });
    },

    clearFilters() {
      if (!this.gridApi) return;
      this.gridApi.setFilterModel(null);
      this.gridApi.setQuickFilter("");
      this.quickFilterValue = "";
      this.filters = false;
      this.$router.push({ query: {} });
    },
    updateSidebarStyles() {
      const minWidthValue = 850;
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
  watch: {
    'payment.status'() {
      this.updatePaymentAmounts();
      this.generateScheme(); // Это обновит правила валидации для AutoForm
      if (this.payment.status === 'not_paid') {
          this.payment.date_paid_40 = null;
          this.payment.date_paid_100 = null;
      } else if (this.payment.status === 'paid_40') {
          this.payment.date_paid_100 = null;
          // date_paid_40 становится обязательной, если была пуста - AutoForm покажет ошибку
      } else if (this.payment.status === 'paid_100') {
          // date_paid_40 становится НЕ обязательной, если была ошибка - она должна исчезнуть
          // date_paid_100 становится обязательной
      }
    },
    'payment.all_sum'() {
      this.updatePaymentAmounts();
    },
    showSidebar(newValue) {
      if (newValue) {
        this.updatePaymentAmounts();
        this.generateScheme();
      } else {
        this.errors = {};
      }
    }
  },
  computed: {
    ...mapState(usePaymentStore, ["paymentList"]),
    ...mapState(useContractStore, ["contractList", "contractMap"]),
    contractOptions() {
      if (!this.contractMap) return [];
      return Object.values(this.contractMap)
        .filter(item => item.deleted_at === null)
        .map((item) => ({
          value: item.id,
          label: `${item.contr_number}`,
        }));
    }
  },
};
</script>

<style lang="scss" scoped>
.form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  &__item {
    padding: 5px;
    margin-right: 10px;
  }

  &__item:nth-child(2n) {
    margin-right: 0;
    border-right: none;
  }
}

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

.btn-primary {
  --bs-btn-bg: rgb(68, 99, 52);
  border: none;
  --bs-btn-hover-bg: rgb(6 215 29);
  --bs-btn-hover-border-color: rgb(6 215 29);
  --bs-btn-active-bg: rgb(68, 99, 52);
  --bs-btn-disabled-bg: rgb(68, 99, 52);
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-control:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
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

:deep(.p-sidebar) {
}
:deep(.p-sidebar-header) {
}
:deep(.p-sidebar-content) {
}
</style>
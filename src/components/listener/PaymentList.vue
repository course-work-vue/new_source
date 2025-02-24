<template>
  <div class="col col-xs-9 col-lg-12 mt-4 list">
    <div class="col col-12">
      <div class="mb-3 col col-12">
        <div class="col col-6 float-start d-inline-flex align-items-center mb-2">
          <button @click="openSidebar" class="btn btn-primary float-start" type="button">
            <i class="material-icons-outlined">add</i>Добавить платёж
          </button>
        </div>

        <div class="col col-6 float-end d-inline-flex align-items-center mb-2">
          <button
            @click="clearFilters"
            :disabled="!filters"
            class="btn btn-sm btn-primary text-nowrap mx-2"
            type="button"
          >
            <i class="material-icons-outlined">close</i>Очистить фильтры
          </button>
          <input
            class="form-control"
            type="text"
            v-model="quickFilterValue"
            id="filter-text-box"
            @input="onFilterTextBoxChanged()"
            placeholder="Поиск..."
          />
        </div>
      </div>
    </div>

    <br />

    <div style="height: 90vh">
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

    <!-- Sidebar для добавления/редактирования -->
    <Sidebar
      v-model:visible="showSidebar"
      position="bottom"
      modal
      header="Данные платежа"
      class="custom-sidebar h-auto"
      :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
    >
      <div class="card flex flex-row">
        <div class="form card__form">
          <auto-form
            v-model="payment"
            v-model:errors="errors"
            :scheme="scheme"
            class="custom-form"
          >
          </auto-form>
        </div>
      </div>

      <Button class="btn btn-primary float-start" @click="submit">
        Сохранить
      </Button>

      <Button
        v-if="payment.id"
        class="btn btn-primary float-end"
        @click="deletePay"
      >
        Удалить
      </Button>
    </Sidebar>
  </div>
</template>

<script>
/**
 * ВАЖНО: Проверьте пути import'ов и названия store/моделей.
 * Здесь даны примеры. Нужно подкорректировать под вашу структуру.
 */

import { AgGridVue } from "ag-grid-vue3";
import { reactive, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { usePaymentStore } from "@/store2/listenergroup/payment"; // по аналогии с usePayerStore
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

// Модель Payment (примерно как Payer)
import Payment from "@/model/listener-group/Payment"; 

import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default {
  name: "PaymentList",
  components: {
    AgGridVue,
    ButtonCell,
    AutoForm,
  },
  setup() {
    const route = useRoute();

    // Ссылки на Grid API
    const gridApi = ref(null);
    const gridColumnApi = ref(null);

    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    // Данные таблицы
    const rowData = reactive({});

    // Определение колонок
    const columnDefs = reactive({
      value: [
        {
          sortable: false,
          filter: false,
          headerName: "Действия",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            // при клике на кнопку в ячейке
            onClick: () => {},
            label: "View Details",
          },
          maxWidth: 120,
          resizable: false,
        },
        {
          field: "contract_id",
          headerName: "Номер договора",
        },
        {
          field: "expiration_date",
          headerName: "Дата просрочки",
        },
        {
          field: "date_40",
          headerName: "Дата оплаты 40%",
          hide: true,
        },
        {
          field: "all_sum",
          headerName: "Вся сумма",
        },
        {
          field: "deposited_amount",
          headerName: "Внесённая сумма",
          hide: true,
        },
        {
          field: "left_to_pay",
          headerName: "Остаточная сумма",
        },
        {
          field: "bank",
          headerName: "Банк",
          hide: true,
        },
      ],
    });

    // Общие настройки столбцов
    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 300,
    };

    // Поиск (quick filter)
    const onFilterTextBoxChanged = () => {
      gridApi.value.setQuickFilter(
        document.getElementById("filter-text-box").value
      );
    };

    return {
      rowData,
      columnDefs,
      defaultColDef,
      onGridReady,
      cellWasClicked: (event) => {
        // Клик по ячейке
        if (event.colDef && event.colDef.headerName === "Действия") {
          // Редактирование
          // Для примера - вызываем метод edit
          // или обрабатываем как нужно
          edit(event);
        }
      },
      onFilterTextBoxChanged,
      paginationPageSize,
    };
  },
  data() {
    return {
      showSidebar: false,
      quickFilterValue: "",
      filters: false,

      // Модель текущего платёжного объекта для создания/редактирования
      payment: new Payment(),

      // Ошибки валидации AutoForm
      errors: {},

      // Схема формы (аналогично Payer)
      scheme: null,
    };
  },
  async mounted() {
    // Загрузка списка платежей
    try {
      await this.getPaymentList();
      this.loadPaymentsData();
    } catch (error) {
      console.error("Ошибка при загрузке данных платежей:", error);
    }

    // Схема формы (примерная, подставьте поля и правила валидации по вашим требованиям)
    this.scheme = new FormScheme([
      new TextInput({
        key: "contract_id",
        label: "Номер договора",
        placeholder: "Номер договора",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "expiration_date",
        label: "Дата просрочки",
        dateFormat: "dd/mm/yy",
        size: "sm",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "date_40",
        label: "Дата оплаты 40%",
        dateFormat: "dd/mm/yy",
        size: "sm",
      }),
      new TextInput({
        key: "all_sum",
        label: "Вся сумма",
        placeholder: "Сумма",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "deposited_amount",
        label: "Внесённая сумма",
        placeholder: "Сумма",
      }),
      new TextInput({
        key: "left_to_pay",
        label: "Остаточная сумма",
        placeholder: "Сумма",
      }),
      new TextInput({
        key: "bank",
        label: "Банк",
        placeholder: "Название банка",
      }),
    ]);
  },
  methods: {
    // Подключаем методы из Pinia-store (по аналогии с Payer)
    ...mapActions(usePaymentStore, [
      "getPaymentList",    // получить список платежей
      "postPayment",       // добавить платёж
      "putPayment",        // обновить платёж
      "deletePayment",     // удалить платёж
    ]),

    // Способ получить state из Pinia (при желании)
    ...mapState(usePaymentStore, ["paymentList"]),

    // Сброс текущего объекта платежа
    resetPayment() {
      this.payment = new Payment();
    },

    // Клик по кнопке "Добавить платёж"
    openSidebar() {
      this.resetPayment();
      this.showSidebar = true;
    },

    // Закрыть sidebar
    closeSidebar() {
      this.showSidebar = false;
    },

    // Редактирование при клике на ячейку "Действия"
    edit(event) {
      this.resetPayment();
      this.payment = event.data; // загружаем текущие данные в форму
      this.showSidebar = true;
    },

    // Загрузка данных в таблицу
    async loadPaymentsData() {
      try {
        if (Array.isArray(this.paymentList)) {
          // Показываем только не удалённые, если есть логика deleted_at
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

    // Сохранение (новый или существующий)
    async submit() {
      // Определяем, есть ли id
      if (this.payment.id) {
        await this.putPayment({ ...this.payment });
      } else {
        await this.postPayment({ ...this.payment });
      }
      // Закрываем сайдбар и обновляем список
      this.showSidebar = false;
      this.resetPayment();
      this.loadPaymentsData();
    },

    // Удаление
    async deletePay() {
      await this.deletePayment({ ...this.payment });
      this.showSidebar = false;
      this.resetPayment();
      this.loadPaymentsData();
    },

    // AG Grid хуки
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

    onFilterChanged() {
      this.filters = false;
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
      this.gridApi.setFilterModel();
      this.gridApi.setQuickFilter();
      this.quickFilterValue = "";
      this.filters = false;
    },
  },
  created() {
    // При создании сразу грузим данные
    this.loadPaymentsData();
  },
};
</script>

<style lang="scss" scoped>
.list {
  padding-left: 100px;
  padding-right: 5px;
}

/* Кнопки, инпуты и прочее в вашем стиле */
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
</style>

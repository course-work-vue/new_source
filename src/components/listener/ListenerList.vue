<template>
  <div class="col col-xs-9 col-lg-12 mt-4 list">
    <div class="col col-12">
      <div class="mb-3 col col-12">
        <div class="col col-6 float-start d-inline-flex align-items-center mb-2">
          <button
            @click="openSidebar"
            class="btn btn-primary float-start"
            type="button"
          >
            <i class="material-icons-outlined">add</i>Добавить слушателя
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
            v-on:input="onFilterTextBoxChanged()"
            placeholder="Поиск..."
          />
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
    v-model:visible="showSidebar"
    position="bottom"
    modal
    header="Данные слушателя"
    class="custom-sidebar h-auto"
    :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
  >
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form
          v-model="listener"
          v-model:errors="errors"
          :scheme="scheme"
          class="custom-form"
        ></auto-form>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mt-3">
      <Button class="btn btn-secondary d-flex align-items-center" @click="openWishesForm">
        <i class="material-icons-outlined">assignment</i>Пожелания слушателя
      </Button>
      <div>
        <Button class="btn btn-primary float-start me-3" @click="submit">
          Сохранить
        </Button>
        <Button class="btn btn-primary float-end" v-if="listener.id" @click="deleteLst">
          Удалить
        </Button>
      </div>
    </div>
  </Sidebar>

  <Sidebar
    v-model:visible="showWishes"
    position="bottom"
    modal
    header="Пожелания слушателя"
    class="custom-sidebar h-auto"
    :style="{ width: '55%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
  >
    <div class="card flex flex-row">
      <div class="col-5" style="margin-right: auto;">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="min-width: 100px;">День</th>
              <th>Время начала</th>
              <th>Время окончания</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in tableData" :key="index">
              <td>
                <select class="form-select" v-model="entry.day_id">
                  <option v-for="day in days" :key="day.day_id" :value="day.day_id">
                    {{ day.dayofweek }}
                  </option>
                </select>
              </td>
              <td>
                <input class="form-control" type="time" v-model="entry.starttime" />
              </td>
              <td>
                <input class="form-control" type="time" v-model="entry.endtime" />
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-danger"
                  @click="removeRow(index)"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-primary" @click="addRow">+</button>
      </div>
      <div>
        <div class="form2 card__form">
        <auto-form
          v-model="listener"
          v-model:errors="errors"
          :scheme="secondScheme"
          class="custom-form"
        ></auto-form>
      </div>
      <div class="form3">
        <auto-form
          v-model="listener"
          v-model:errors="errors"
          :scheme="thirdScheme"
          class="custom-form"
        ></auto-form>
      </div>
      </div>
    </div>
    <Button class="btn btn-primary" @click="submitWishes">
      Сохранить пожелания
    </Button>
  </Sidebar>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import ListenerHref from "@/components/listener/ListenerHrefCellRenderer.vue";
import ListenerHref2 from "@/components/listener/ListenerHrefCellRenderer2.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { useListenerStore } from "@/store2/listenergroup/listener";
import { useListenergroupStore } from "@/store2/listenergroup/listenergroup";
import { useDayStore } from "@/store2/listenergroup/day";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import {
  emailRule,
  requiredRule,
} from "@/model/form/validation/rules";
import { TextInput } from "@/model/form/inputs/TextInput";
import { DateInput } from "@/model/form/inputs/DateInput";
import { ComboboxInput } from "@/model/form/inputs/ComboboxInput";
import Listener from "@/model/listener-group/Listener";

export default {
  name: "App",
  components: {
    AgGridVue,
    ButtonCell,
    ListenerHref,
    ListenerHref2,
    AutoForm,
  },
  setup() {
    const tableData = ref([]);
    

    const addRow = () => {
      const newRow = { day_id: "", starttime: "", endtime: "" };
      tableData.value.push(newRow);
    };

    const removeRow = (index) => {
      tableData.value.splice(index, 1);
    };

    const gridApi = ref(null);
    const gridColumnApi = ref();
    const route = useRoute();
    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const rowData = reactive({});
    const days = reactive([]);

    const columnDefs = reactive({
      value: [
        {
          sortable: false,
          filter: false,
          headerName: "Действия",
          headerClass: "text-center",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            label: "View Details",
          },
          maxWidth: 120,
          resizable: false,
        },
        {
          field: "full_name",
          headerName: "ФИО",
          cellRenderer: "ListenerHref2",
        },
        {
          field: "listenergroup_number",
          headerName: "Группа",
        },
        {
          field: "people_count",
          headerName: "Желаемое количество человек",
          hide: true,
        },
        {
          field: "days_of_week",
          headerName: "Желаемые дни",
          hide: true,
        },
        {
          field: "phone_number",
          headerName: "Номер телефона",
          hide: true,
        },
        {
          field: "email",
          headerName: "Email",
          hide: true,
        },
        {
          field: "full_name2",
          headerName: "ФИО законного представителя",
          hide: true,
        },
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 300,
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
      days,
      defaultColDef,
      paginationPageSize,
      onFilterTextBoxChanged,
      tableData,
      addRow,
      removeRow,
    };
  },
  data() {
    return {
      showSidebar: false,
      showWishes: false,
      quickFilterValue: "",
      filters: false,
      listener: new Listener(),
      errors: {},
      scheme: null,
      secondScheme: null,
      thirdScheme: null,
    };
  },
  async mounted() {
    try {
      await this.getListenerList();
      await this.getListenergroupList();
      await this.getDayList();
      this.loadListenersData();
      this.loadDaysData();
    } catch (error) {
      console.error("Ошибка при загрузке данных слушателей:", error);
    }

    // Инициализация схем формы (основные поля)
    this.scheme = new FormScheme([
      new TextInput({
        key: "surname",
        label: "Фамилия",
        placeholder: "Фамилия",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "name",
        label: "Имя",
        placeholder: "Имя",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "lastname",
        label: "Отчество",
        placeholder: "Отчество",
        validation: [requiredRule],
      }),
      new ComboboxInput({
        key: "group_id",
        label: "Номер группы",
        options: [
          ...[...this.listenergroupList].map((listenergroup) => ({
            label: listenergroup.group_number,
            value: listenergroup.id,
          })),
        ],
        validation: [requiredRule],
      }),
      new TextInput({
        key: "passport",
        label: "Серия и номер паспорта",
        placeholder: "Серия и номер паспорта",
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
        key: "issued_by",
        label: "Кем выдан",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "phone_number",
        label: "Номер телефона",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "email",
        label: "Электронная почта",
        placeholder: "Электронная почта",
        validation: [emailRule],
      }),
    ]);

    // Вторая схема формы (пожелания)
    this.secondScheme = new FormScheme([
      new TextInput({
        key: "people_count",
        label: "Количество человек",
        placeholder: "Количество человек",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "hours",
        label: "Количество часов",
        placeholder: "Количество часов",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "start_date",
        label: "Начало:",
        dateFormat: "dd/mm/yy",
        size: "sm",
        validation: [requiredRule],
      }),
      new DateInput({
        key: "end_date",
        label: "Конец:",
        dateFormat: "dd/mm/yy",
        size: "sm",
        validation: [requiredRule],
      }),
    ]);
    this.thirdScheme = new FormScheme([
  new TextInput({
    key: "wish_description",
    label: "Комментарий:",
    validation: [requiredRule],
    className: "wish_description",
  }),
]);
  },
  methods: {
    ...mapActions(useListenerStore, [
      "getListenerList",
      "postListener",
      "putListener",
      "deleteListener",
    ]),
    ...mapActions(useListenergroupStore, ["getListenergroupList"]),
    ...mapActions(useDayStore, ["getDayList"]),

    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    resetLst() {
      this.listener = new Listener();
    },
    edit(event) {
      this.resetLst();
      this.listener = event.data;
      this.showSidebar = true;
    },
    async submit() {
      let listener = { ...this.listener };
      if (listener.id) {
        await this.putListener(listener);
      } else {
        await this.postListener(listener);
      }
      this.showSidebar = false;
      this.resetLst();
      this.loadListenersData();
    },
    async deleteLst() {
      let listener = { ...this.listener };
      await this.deleteListener(listener);
      this.showSidebar = false;
      this.resetLst();
      this.loadListenersData();
    },
    async loadDaysData(){
      try {
        if (Array.isArray(this.dayList)) {
          this.days = this.dayList
          console.log("Дни",this.days)
        } else {
          this.days.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных дней:", error);
        this.days.value = [];
      }
    },
    async loadListenersData() {
      try {
        if (Array.isArray(this.listenerList)) {
          this.rowData.value = this.listenerList
            .filter((listener) => listener.deleted_at === null)
            .sort((a, b) => a.full_name.localeCompare(b.full_name));
        } else if (this.listenerList && this.listenerList.deleted_at === null) {
          this.rowData.value = [this.listenerList];
        } else {
          this.rowData.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных слушателей:", error);
        this.rowData.value = [];
      }
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
    openSidebar() {
      this.resetLst();
      this.showSidebar = true;
    },
    openWishesForm() {
      this.showWishes = true;
    },
    closeSidebar() {
      this.showSidebar = false;
    },
    submitWishes() {
      this.showWishes = false;
    },
  },
  computed: {
    ...mapState(useListenerStore, ["listenerList"]),
    ...mapState(useListenergroupStore, ["listenergroupList"]),
    ...mapState(useDayStore, ["dayList"]),
  },
};
</script>

<style lang="scss" scoped>
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
  0%,
  100% {
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
  --bs-btn-bg: rgb(68, 99, 52);
  border: none;
  --bs-btn-hover-bg: rgb(6, 215, 29);
  --bs-btn-hover-border-color: rgb(6, 215, 29);
  --bs-btn-active-bg: rgb(68, 99, 52);
  --bs-btn-disabled-bg: rgb(68, 99, 52);
  display: flex;
  justify-content: center;
  align-items: center;
}
.form-control:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075),
    0 0 8px rgba(6, 215, 29, 0.6);
}
.form-select:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075),
    0 0 8px rgba(6, 215, 29, 0.6);
}
.page-link {
  height: 40px;
  width: 40px;
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.active {
  .page-link {
    background-color: rgb(68, 99, 52);
    border: none;
    --bs-btn-hover-bg: rgb(6, 215, 29);
    --bs-btn-hover-border-color: rgb(6, 215, 29);
  }
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

// Пожелания
.form2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

</style>

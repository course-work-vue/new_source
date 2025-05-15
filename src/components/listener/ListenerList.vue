<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех слушателей</span>
      </div>
    </div>

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

    <div class="row g-2 mb-2">
      <div class="col-4 p-0"> 
        <button
          @click="openSidebar"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить слушателя
        </button>
      </div>
      <div class="col"></div> <!-- Пустая колонка, чтобы кнопка не растягивалась, если не w-100 -->
    </div>

    <!-- Строка с AG Grid -->
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
  </div>

  <Sidebar v-model:visible="showSidebar" position="bottom" modal header="Данные слушателя" class="custom-sidebar h-auto"
    :style="mainSidebarStyle"
  >
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form v-if="scheme" v-model="listener" v-model:errors="errors"
          item-class="form__item" 
          :scheme="scheme"
          class="custom-form"></auto-form>
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

  <Sidebar v-model:visible="showWishes" position="bottom" modal header="Пожелания слушателя"
    class="custom-sidebar h-auto" :style="wishesSidebarStyle">
    <div class="card">
      <div class="row">
        <div class="col-md-5" style="margin-right: auto;">
          <h5>Дни и время</h5>

          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <th style="min-width: 100px;">День</th>
                <th>Время начала</th>
                <th>Время окончания</th>
                <th></th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="(entry, index) in tableData" :key="entry.l_wish_day_id || `new-${index}`">
                <td>
                  <select class="form-select form-select-sm" v-model="entry.day_id">
                    <option :value="null" disabled>Выберите день</option>
                    <option v-for="day in days" :key="day.day_id" :value="day.day_id">
                      {{ day.dayofweek }}
                    </option>
                  </select>
                </td>
                <td>
                  <input class="form-control form-control-sm" type="time" v-model="entry.starttime" />
                </td>
                <td>
                  <input class="form-control form-control-sm" type="time" v-model="entry.endtime" />
                </td>
                <td>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeRow(index)">
                    <i class="material-icons-outlined" style="font-size: 1rem;">delete</i>
                  </button>
                </td>
              </tr>

              <tr v-if="!tableData || tableData.length === 0">
                <td colspan="4" class="text-center text-muted">Нет записей о предпочтительном времени</td>
              </tr>
            </tbody>
          </table>

          <button type="button" class="btn btn-primary btn-sm mt-2" @click="addRowInWishForm">
            <i class="material-icons-outlined" style="font-size: 1rem;">add</i> Добавить время
          </button>
        </div>

        <div class="col-7">
          <h5>Прочие пожелания</h5>
          <div class="form2 card__form mb-3">

            <auto-form v-model="listener_wish" v-model:errors="errorsWish" :scheme="secondScheme"
              class="custom-form"></auto-form>
          </div>
          <div class="form3">

            <auto-form v-model="listener_wish" v-model:errors="errorsWish" :scheme="thirdScheme"
              class="custom-form"></auto-form>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 d-flex justify-content-end">
      <Button class="btn btn-primary" @click="submitWishes">
        Сохранить пожелания
      </Button>
    </div>
  </Sidebar>


</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import { reactive, onMounted, ref, toRaw, watch } from "vue";
import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import ListenerHref from "@/components/listener/ListenerHrefCellRenderer.vue";
import ListenerHref2 from "@/components/listener/ListenerHrefCellRenderer2.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { useListenerStore } from "@/store2/listenergroup/listener";
import { useListenergroupStore } from "@/store2/listenergroup/listenergroup";
import { useProgramStore } from "@/store2/listenergroup/program";
import { useDayStore } from "@/store2/listenergroup/day";
import { useListener_WishStore } from "@/store2/listenergroup/listenerwish";
import { useL_Wish_DayStore } from "@/store2/listenergroup/l_wish_day"

import L_Wish_Day from "@/model/listener-group/L_Wish_Day";
import Listener_Wish from "@/model/listener-group/Listener_Wish";

import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import {
  emailRule,
  requiredRule,
} from "@/model/form/validation/rules";
import { TextInput } from "@/model/form/inputs/TextInput";
import { DateInput } from "@/model/form/inputs/DateInput";
import { ComboboxInput } from "@/model/form/inputs/ComboboxInput";
import { TextareaInput } from "@/model/form/inputs/TextareaInput";
import { MultiSelectInput } from '@/model/form/inputs/MultiSelectInput';
import Listener from "@/model/listener-group/Listener";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

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
    const localeText = AG_GRID_LOCALE_RU;
    const tableData = reactive([]);


    const addRow = (listenerId) => {
      console.log('Adding new wish day row for listener:', listenerId);
      const newRow = new L_Wish_Day({
        l_wish_day_id: null,
        day_id: 1,
        starttime: '09:00',
        endtime: '18:00',
        listener_id: listenerId
      });
      tableData.push(newRow);
      console.log('tableData after add:', tableData.value);
    };

    const removeRow = (index) => {
      console.log('Removing wish day row at index:', index);
      tableData.splice(index, 1);
      console.log('tableData after remove:', tableData.value);
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
          headerName: "",
          headerClass: "text-center",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            label: "View Details",
          },
          maxWidth: 50,
          resizable: false,
        },
        {
          field: "full_name",
          headerName: "ФИО",
          cellRenderer: "ListenerHref2",
        },
        {
          field: "group_names",
          headerName: "Группы",
          cellRenderer: null,       
          valueFormatter: params => params.value || '–', 
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
      paginationPageSize,
      onFilterTextBoxChanged,

      tableData,
      days,
      addRow,
      removeRow,
      toRaw,
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

      listener_wish: new Listener_Wish(),
      errorsWish: {},

      mainSidebarStyle: {},
      wishesSidebarStyle: {}, 
      isSmallScreen: false 
    };
  },
  async mounted() {
    try {
      await this.fetchInitialData();
      this.loadListenersData();
      this.loadListenerWishesData();

      this.updateSidebarStyles();
      window.addEventListener('resize', this.updateSidebarStyles);
    } catch (error) {
      console.error("Ошибка при загрузке данных слушателей:", error);
    }


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
      new TextInput({
        key: "phone_number",
        label: "Номер телефона",
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
      }),
      new TextInput({
        key: "department_code",
        label: "Код подразделения",
        placeholder: "Код подразделения",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "issued_by",
        label: "Кем выдан",
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
        key: "email",
        label: "Электронная почта",
        placeholder: "Электронная почта",
        validation: [emailRule],
      }),
      new MultiSelectInput({
        key: 'program_ids', 
        label: 'Программы обучения',
        options: this.programOptions, 
        validation: [],
        filter: true, 
      }),
      new MultiSelectInput({
        key: 'group_ids', 
        label: 'Группы',
        options: this.groupOptions, 
        validation: [],
        filter: true, 
      }),

    ]);

    this.secondScheme = new FormScheme([
      new TextInput({
        key: "group_size",
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
      }),
      new DateInput({
        key: "end_date",
        label: "Конец:",
      }),
    ]);
    this.thirdScheme = new FormScheme([
      new TextareaInput({
        key: "listener_comment",
        label: "Комментарий слушателя:",
        className: "wish_description",
        rows: 3
      }),
    ]);
  },

  beforeUnmount() {
  window.removeEventListener('resize', this.updateSidebarStyles);
},


  methods: {
    ...mapActions(useListenerStore, [
      "getListenerList",
      "postListener",
      "putListener",
      "deleteListener",
    ]),
    ...mapActions(useListenergroupStore, ["getListenergroupList"]),
    ...mapActions(useListener_WishStore, [
      "getListener_WishList",
      "postListener_Wish",
      "putListener_Wish",
    ]),
    ...mapActions(useDayStore, ["getDayList"]),
    ...mapActions(useL_Wish_DayStore, [
      "getL_Wish_DayList",
      "postL_Wish_Day",
      "putL_Wish_Day",
      "deleteL_Wish_Day",
      "syncWishDays",
    ]),
    ...mapActions(useProgramStore, ["getProgramList"]),

    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
        this.edit(event);
      }
    },
    resetLst() {
      this.listener = new Listener();
    },
    edit(event) {
      this.resetLst();
      this.listener = event.data;
      console.log(event.data);
      this.showSidebar = true;
    },
    async submit() {
      let listener = { ...this.listener };
      console.log(listener)
      if (listener.id) {
        const payload = {
          ...listener,
          group_ids: `{${listener.group_ids.join(',')}}`,
          program_ids: `{${listener.program_ids.join(',')}}`  
        };
        await this.putListener(payload);
      } else {
        const payload = {
          ...listener,
          group_ids: `{${listener.group_ids.join(',')}}`,
          program_ids: `{${listener.program_ids.join(',')}}`  
        };
        await this.postListener(payload);
      }
      this.showSidebar = false;
      this.resetLst();
      await this.getListenerList(),
      this.loadListenersData();
    },
    async deleteLst() {
      let listener = { ...this.listener };
      await this.deleteListener(listener);
      this.showSidebar = false;
      this.resetLst();
      this.loadListenersData();
    },

    async fetchInitialData() {
      console.log("Fetching initial data...");
      try {
        await Promise.all([
          this.getListenerList(),
          this.getListenergroupList(),
          this.getListener_WishList(),
          this.getDayList(),
          this.getL_Wish_DayList(),
          this.getProgramList()
        ]);
        console.log("Initial data fetched successfully.");

        await this.loadDaysData();
      } catch (error) {
        console.error("Ошибка при первичной загрузке данных:", error);
      }
    },

    async loadDaysData() {
      try {
        if (!this.dayList || this.dayList.length === 0) {
          await this.getDayList();
        }
        if (Array.isArray(this.dayList)) {
          this.days = this.dayList
        } else {
          this.days.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных дней:", error);
        this.days.value = [];
      }
    },
    async loadListenerWishesData() {
      try {
        if (Array.isArray(this.listener_wishList)) {
          this.listener_wishes = this.listener_wishList
        } else {
          this.listener_wishes.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных дней:", error);
        this.listener_wishes.value = [];
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
    async openWishesForm() {

      if (!this.listener || !this.listener.id) {
        let listener = { ...this.listener };
        await this.postListener(listener);
        this.resetLst();
        this.loadListenersData();
        this.showWishes = true;
        return;
      }

      console.log("Opening wishes form for listener:", this.listener.id);
      this.errorsWish = {};

      try {
        const existingWish = this.listener_wishList.find(
          (wish) => wish.listener_id === this.listener.id && !wish.deleted_at
        );
        this.listener_wish = new Listener_Wish(existingWish ? JSON.parse(JSON.stringify(existingWish)) : { listener_id: this.listener.id });
        const currentWishDays = this.l_wish_dayList.filter(
          (dayWish) => dayWish.listener_id === this.listener.id && !dayWish.deleted_at
        );
        const newTableDataContent = currentWishDays.map(dw => new L_Wish_Day(JSON.parse(JSON.stringify(dw))));
        this.tableData.length = 0;
        newTableDataContent.forEach(item => this.tableData.push(item));

        console.log("L_Wish_Day data loaded into reactive tableData:", this.tableData)

        this.showWishes = true;
      } catch (error) {
        console.error("Error loading wishes data:", error);
        this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные пожеланий', life: 3000 });
      }
    },

    addRowInWishForm() {
      if (!this.listener || !this.listener.id) {
        console.error("Cannot add row, listener ID is missing.");
        this.$toast.add({ severity: 'warn', summary: 'Внимание', detail: 'Невозможно добавить строку без ID слушателя', life: 3000 });
        return;
      }
      //Метод add Wish_Day
      this.addRow(this.listener.id);
    },


    closeSidebar() {
      this.showSidebar = false;
    },
    async submitWishes() {
      let listener_wish = { ...this.listener_wish };
      listener_wish.listener_id = this.listener.id;
      console.log(listener_wish)
      if (listener_wish.id) {
        await this.syncWishDays(this.listener.id, this.tableData);
        await this.putListener_Wish(listener_wish);
      } else {
        await this.postListener_Wish(listener_wish);
      }
      await this.getL_Wish_DayList();
      try {
      } catch (error) {
        console.error("Error during L_Wish_Day sync, caught in submitWishes:", error);
      }
      this.showWishes = false;
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
      width: isScreenWideEnough ? '900px' : '100%', 
      minWidth: isScreenWideEnough ? `${minWidthValue}px` : 'auto', 
      maxHeight: '750px',
      height: 'auto',
      margin: isScreenWideEnough ? 'auto' : '0' 
    };
  },

    async syncLWishDays(listenerId) {
      console.log(`Starting manual L_Wish_Day sync for listener ${listenerId}...`)
    },

  },
  computed: {
    ...mapState(useListenerStore, ["listenerList"]),
    ...mapState(useListenergroupStore, ["listenergroupList"]),
    ...mapState(useListener_WishStore, ["listener_wishList"]),
    ...mapState(useDayStore, ["dayList"]),
    ...mapState(useL_Wish_DayStore, ["l_wish_dayList"]),
    programOptions() {
      const programStore = useProgramStore();
      return Object.values(programStore.programMap || {}).map((item) => ({
        value: item.id,
        label: item.program_name,
      }));
    },
    groupOptions() {
      const listenergroupStore = useListenergroupStore();
      return Object.values(listenergroupStore.listenergroupMap || {})
        .filter(item => item.deleted_at === null)
        .map((item) => ({
          value: item.id,
          label: item.group_number,
        }));
    },

  },
  watch: {
    'listener.program_ids': {
      handler(newSelectedProgramIds, oldSelectedProgramIds) {
        if (newSelectedProgramIds && Array.isArray(newSelectedProgramIds)) {
          console.log('Выбранные ID программ:', newSelectedProgramIds);

          if (this.programOptions && this.programOptions.length > 0) {
            const selectedPrograms = this.programOptions.filter(option =>
              newSelectedProgramIds.includes(option.value)
            );
            console.log('Выбранные программы:', selectedPrograms);
          } else {
            console.warn('programOptions еще не загружены или пусты, не могу показать полные объекты.');
          }
        }
      },
    },
    'listener.group_ids': {
      handler(newSelectedGroupIds, oldSelectedGroupIds) {
        if (newSelectedGroupIds && Array.isArray(newSelectedGroupIds)) {
          console.log('Выбранные ID программ:', newSelectedGroupIds);

          if (this.groupOptions && this.groupOptions.length > 0) {
            const selectedGroups = this.groupOptions.filter(option =>
              newSelectedGroupIds.includes(option.value)
            );
            console.log('Выбранные программы:', selectedGroups);
          } else {
            console.warn('groupOptions еще не загружены или пусты, не могу показать полные объекты.');
          }
        }
      },
    },
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

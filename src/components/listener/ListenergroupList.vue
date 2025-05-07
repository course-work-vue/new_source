<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <!-- Строка заголовка -->
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех групп</span>
      </div>
    </div>

    <!-- Первая строка: Поиск и Очистка фильтров -->
    <div class="row g-2 mb-2">
      <div class="col ps-0 py-0 pe-3"> <!-- Колонка для поиска -->
        <input
          class="form-control"
          type="text"
          v-model="quickFilterValue"
          id="filter-text-box"
          @input="onFilterTextBoxChanged"
          placeholder="Поиск..."
        />
      </div>
      <div class="col-auto p-0"> <!-- Колонка для кнопки Очистить -->
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

    <!-- Строка кнопки Добавить/Создать -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0"> <!-- Или col-auto, если ширина не должна быть фиксированной -->
        <button
          @click="openGenAddSidebar"
          class="btn btn-primary w-100 position-relative"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Создать группу
          <!-- Значок уведомления остается привязанным к кнопке -->
          <span
            v-if="!canClickButton"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          >
            !
            <span class="visually-hidden">Уведомление</span>
          </span>
        </button>
      </div>
    </div>

    <!-- Строка с основной AG Grid (занимает оставшееся место) -->
    <div class="row g-2 flex-1"> <!-- flex-1 для растягивания -->
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

    <!-- Sidebar для редактирования данных Группы (структура без изменений) -->
    <Sidebar
      v-model:visible="showSidebar"
      position="bottom"
      modal
      header="Данные Группы"
      class="custom-sidebar h-auto"
      :style="{ width: '40%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
    >
      <div class="card flex flex-row">
        <div class="form card__form">
          <auto-form
            v-model="listenergroup"
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
      <Button class="btn btn-primary float-end" v-if="listenergroup.id" @click="deleteLgr">
        Удалить
      </Button>
    </Sidebar>

    <!-- Sidebar для выбора программы перед созданием (структура без изменений) -->
    <Sidebar
      v-model:visible="showGenAddSidebar"
      position="bottom"
      modal
      :header="`Создать группу`"
      class="custom-sidebar h-auto"
      :style="{ width: '20%', maxHeight: '750px', height: 'auto', margin: 'auto' }"
    >
        <div class="form-row-with-button d-flex align-items-end justify-content-between mb-4">
          <auto-form v-model="listenergroup" v-model:errors="errors"
            :scheme="addScheme"
            class="custom-form me-3"
            >
          </auto-form>
          <button type="button" class="btn btn-primary ms-5" @click="openAddSidebar"
          style="white-space: nowrap;"
          :disabled="!listenergroup.program_id">
            Создать
          </button>
        </div>
        <div class="filter-checkbox-container mb-3">
         <div class="form-check">
           <input class="form-check-input" type="checkbox" id="sufficientListenersCheckbox"
             v-model="filterOnlySufficient">
           <label class="form-check-label" for="sufficientListenersCheckbox">
             Показывать все программы
           </label>
         </div>
       </div>
    </Sidebar>

    <!-- Sidebar для детального создания группы со слушателями (структура без изменений) -->
    <Sidebar
      v-model:visible="showAddSidebar"
      position="bottom"
      modal
      :header="`Создать группу по программе ${creatingProgram || '...'}`"
      class="custom-sidebar h-auto"
      :style="{ width: '75%', maxHeight: '85vh', height: 'auto', margin: 'auto' }"
    >
      <!-- Содержимое этого сайдбара остается без изменений -->
      <div class="card flex flex-row gap-4 mb-3">
        <div class="form card__form" style="flex: 1;">
          <auto-form v-model="listenergroup" v-model:errors="errors" :scheme="scheme" class="custom-form">
          </auto-form>
        </div>
        <div class="schedule-section" style="flex: 1;">
          <h5>Расписание</h5>
          <table class="table table-bordered table-sm mb-2">
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
                    <button
                      type="button"
                      class="btn btn-danger btn-sm"
                      @click="removeRow(index)"
                      title="Удалить время"
                    >
                      <i class="material-icons-outlined" style="font-size: 1rem;">delete</i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!tableData || tableData.length === 0">
                      <td colspan="4" class="text-center text-muted">Нет расписания</td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="btn btn-primary btn-sm" @click="addRowInWishForm">
              <i class="material-icons-outlined" style="font-size: 1rem;">add</i> Добавить время
            </button>
        </div>
      </div>

      <div class="d-flex align-items-center mb-2" style="gap: 1rem;">
             <div style="flex: 1;" class="d-flex justify-content-between align-items-center">
                 <h5>Подходящие слушатели</h5>
                 <button class="btn btn-secondary btn-sm" @click="findSuitableListeners">
                   <i class="material-icons-outlined" style="font-size: 1rem; vertical-align: middle;">search</i> Подобрать
                 </button>
             </div>
             <div class="px-2" style="width: auto; flex-shrink: 0;"> </div>
             <div style="flex: 1;" class="d-flex justify-content-between align-items-center">
                 <h5>Слушатели в группе</h5>
                 <span class="fw-bold">Количество: {{ groupListenersCount || 0 }}</span>
             </div>
        </div>

      <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 30px;">

        <div style="flex: 1; height: 50vh">
          <div class="h-100 pt-5">
            <ag-grid-vue class="ag-theme-alpine" style="width: 100%; height: 100%;" :columnDefs="columnDefsAdd.value"
              :rowData="suitableListenersRowData.value" :defaultColDef="defaultColDef" :localeText="localeText" rowSelection="multiple"
              animateRows="true" :rowHeight="40" @cell-clicked="cellWasClicked"
              @grid-ready="onGridReadySuitable"
              @firstDataRendered="onFirstDataRendered" @filter-changed="onFilterChanged" :pagination="true"
              :paginationPageSize="paginationPageSize">
            </ag-grid-vue>
          </div>
          <div class="d-flex align-items-center flex-wrap gap-2 mt-2" style="min-height: 2rem;">
               <span class="field-checkbox d-flex align-items-center">
                   <Checkbox inputId="chk-ignore-count" v-model="ignoreCountWish" :binary="true" />
                   <label for="chk-ignore-count" class="ms-1 small">игнорировать кол-во</label>
               </span>
               <span class="field-checkbox d-flex align-items-center">
                   <Checkbox inputId="chk-ignore-schedule" v-model="ignoreScheduleWish" :binary="true" />
                   <label for="chk-ignore-schedule" class="ms-1 small">игнорировать расписание</label>
               </span>
               <span class="field-checkbox d-flex align-items-center">
                   <Checkbox inputId="chk-ignore-all" v-model="ignoreAllWishes" :binary="true" />
                   <label for="chk-ignore-all" class="ms-1 small">игнорировать всё</label>
               </span>
           </div>
        </div>

        <div class="d-flex flex-column align-items-center justify-content-center px-2" style="align-self: center;">
           <button class="btn btn-light btn-sm mb-2" @click="moveSelectedToGroup" title="Добавить выбранных в группу" :disabled="!canMoveToGroup"><i class="material-icons-outlined">chevron_right</i></button>
           <button class="btn btn-light btn-sm mb-2" @click="moveAllToGroup" title="Добавить всех в группу" :disabled="!canMoveAllToGroup"><i class="material-icons-outlined">double_arrow</i></button>
           <button class="btn btn-light btn-sm mb-2" @click="moveSelectedFromGroup" title="Убрать выбранных из группы" :disabled="!canMoveFromGroup"><i class="material-icons-outlined">chevron_left</i></button>
           <button class="btn btn-light btn-sm" @click="moveAllFromGroup" title="Убрать всех из группы" :disabled="!canMoveAllFromGroup"><i class="material-icons-outlined" style="transform: rotate(180deg);">double_arrow</i></button>
        </div>

        <div style="flex: 1; height: 50vh">
          <div class="h-100 pt-5">
            <ag-grid-vue class="ag-theme-alpine" style="width: 100%; height: 100%;" :columnDefs="columnDefsAdd.value"
              :rowData="groupListenersRowData.value" :defaultColDef="defaultColDef" :localeText="localeText" rowSelection="multiple"
              animateRows="true" :rowHeight="40" @cell-clicked="cellWasClicked"
              @grid-ready="onGridReadyGroup"
              @firstDataRendered="onFirstDataRendered" @filter-changed="onFilterChanged" :pagination="true"
              :paginationPageSize="paginationPageSize">
            </ag-grid-vue>
          </div>
        </div>

      </div>

      <div class="pt-3 mt-3 d-flex justify-content-between">
        <Button class="btn btn-primary" @click="submit">
          Сохранить
        </Button>
        <Button class="btn btn-danger" v-if="listenergroup.id" @click="deleteLgr">
          Удалить
        </Button>
      </div>
    </Sidebar>

  </div> <!-- Закрывающий тег для container-fluid -->
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import { computed, reactive, onMounted, ref, getCurrentInstance } from "vue";
import ListenerHref2 from "@/components/listener/ListenerHrefCellRenderer2.vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { useListenergroupStore } from "@/store2/listenergroup/listenergroup";
import { useProgramStore } from "@/store2/listenergroup/program";
import { useL_Ready_GroupStore } from "@/store2/listenergroup/l_ready_group";
import { useL_Group_StatusStore } from "@/store2/listenergroup/l_group_status";
import { useListenerStore } from "@/store2/listenergroup/listener";
import L_Wish_Day from "@/model/listener-group/L_Wish_Day"; 

import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import { TextInput } from "@/model/form/inputs/TextInput";
import { TimePickerInput } from "@/model/form/inputs/TimePickerInput";
import { DateInput } from "@/model/form/inputs/DateInput";
import { ComboboxInput } from "@/model/form/inputs/ComboboxInput";
import ButtonCell from "@/components/listener/ListenerButtonCell.vue";
import Listenergroup from "../../model/listener-group/Listenergroup";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";

export default {
  name: "App",
  components: {
    AgGridVue,
    ButtonCell,
    ListenerHref2,
    AutoForm,
  },
  setup() {

    const listenerStore = useListenerStore();
    const listenergroup = ref(new Listenergroup());
    const groupListenersRowData = ref([]);

     const suitableListenersRowData = computed(() => {
     const currentProgramId = listenergroup.value?.group_program_id;
     console.log(`[Computed] Фильтруем подходящих для программы ID: ${currentProgramId}`);

    // 1. Если программа не выбрана в форме группы, не можем найти подходящих
    if (!currentProgramId) {
      console.log("[Computed] Программа не выбрана, результат: []");
      return [];
    }

    // 2. Получаем ID слушателей, которые УЖЕ добавлены в правую таблицу (в этой сессии)
    const idsInCurrentGroup = new Set(groupListenersRowData.value.map(listener => listener.id));
    console.log("[Computed] ID слушателей уже в группе:", Array.from(idsInCurrentGroup));

    const allListeners = listenerStore.listenerList || [];
    console.log(`[Computed] Всего слушателей для проверки: ${allListeners.length}`);

    // 4. Фильтруем общий список
    const filteredListeners = allListeners.filter(listener => {
      // а) Слушатель не удален?
      const isNotDeleted = listener.deleted_at === null;

      // б) Слушатель СВОБОДЕН (не состоит в ДРУГОЙ группе)?
      //    !!! ВАЖНО: Адаптируйте 'listener.group_id === null' под вашу модель !!!
      //    Возможно, поле называется иначе или логика проверки другая.
      //const hasNoGroup = listener.group_id === null; // <-- ПРОВЕРЬТЕ ЭТО ПОЛЕ В ВАШЕЙ МОДЕЛИ СЛУШАТЕЛЯ

      // в) Программа слушателя совпадает с программой ГРУППЫ?
      //    !!! ВАЖНО: Адаптируйте 'listener.program_id === currentProgramId' под вашу модель !!!
      //    Возможно, у слушателя массив program_ids, или связь идет через заявку (wish).
      //const matchesProgram = listener.program_id === currentProgramId; // <-- ПРОВЕРЬТЕ ЭТО ПОЛЕ/ЛОГИКУ

      const notInCurrentGroup = !idsInCurrentGroup.has(listener.id);

      //
      //return isNotDeleted && hasNoGroup && matchesProgram && notInCurrentGroup;
      
      return isNotDeleted;
    });

    console.log(`[Computed] Найдено подходящих слушателей: ${filteredListeners.length}`);

    return filteredListeners.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  });

    const instance = getCurrentInstance();
    const localeText = AG_GRID_LOCALE_RU;

    const tableData = reactive([]);

    const addRow = (listenerId) => {
      console.log('Adding new wish day row for listener:', listenerId); 
      const newRow = new L_Wish_Day({
          l_wish_day_id: null,
          day_id: null,
          starttime: '09:00', 
          endtime: '18:00', 
          listener_id: listenerId 
      });
      tableData.push(newRow);
      console.log('tableData after add:', tableData.value); 
    };

    const gridApi = ref(null);
    const gridColumnApi = ref(null);

    const gridApiSuitable = ref(null); 
    const gridApiGroup = ref(null);   
    const gridColumnApiSuitable = ref(null); 
    const gridColumnApiGroup = ref(null);

    const dataFromApi = ref(null);
    const dataLoaded = ref(false);
    const route = useRoute();
    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const rowData = reactive({});
    const rowDataAdd = reactive({})
    const l_group_status = reactive([]);

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
        { field: "group_number", headerName: "Номер группы" },
        { field: "program_name", headerName: "Программа" },
      ],
    });

    const columnDefsAdd = reactive({
      value: [
        {
          field: "full_name",
          headerName: "ФИО",
          cellRenderer: "ListenerHref2",
        },
      ],
    });

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
    };

    const canClickButton = computed(() => {
      return Array.isArray(l_group_status.value) &&
        l_group_status.value.length &&
        l_group_status.value[0]?.group_formed !== undefined
        ? !l_group_status.value[0].group_formed
        : false;
    });

    onMounted(async () => {
    });

    const onFilterTextBoxChanged = () => {
      gridApi.value.setQuickFilter(
        document.getElementById("filter-text-box").value
      );
    };

    const loadL_Group_StatusData = async () => {
      try {
        const store = useL_Group_StatusStore();
        await store.getL_Group_StatusList();
        l_group_status.value = store.l_group_statusList;
        //console.log(l_group_status.value[0]?.group_formed);
      } catch (error) {
        console.error("Ошибка при загрузке статуса группы:", error);
      }
    };

    const onGridReadySuitable = (params) => {
    console.log("Grid API для Подходящих слушателей готов.");
    gridApiSuitable.value = params.api;
    gridColumnApiSuitable.value = params.columnApi; // Опционально
  };

  // Функция для установки API правой таблицы
  const onGridReadyGroup = (params) => {
    console.log("Grid API для Слушателей в группе готов.");
    gridApiGroup.value = params.api;
    gridColumnApiGroup.value = params.columnApi; // Опционально
  };

    return {
      onGridReady,
      columnDefs,
      columnDefsAdd,
      rowData,
      rowDataAdd,
      groupListenersRowData,
      l_group_status,
      defaultColDef,
      localeText,
      cellWasClicked: (event) => {
        console.log("cell was clicked", event);
      },
      deselectRows: () => {
        gridApi.value.deselectAll();
      },
      onFilterTextBoxChanged,
      paginationPageSize,
      canClickButton,
      dataFromApi,
      dataLoaded,

      addRow,
      tableData,

      gridApiSuitable, 
      gridApiGroup,   
      onGridReadySuitable, 
      onGridReadyGroup,    

      listenergroup,
      suitableListenersRowData,
      groupListenersRowData,
    };
  },
  data() {
    return {
      showSidebar: false,
      showAddSidebar: false,
      showGenAddSidebar: false,
      
      quickFilterValue: "",
      filters: false,
      errors: {},

      filterOnlySufficient: false,
      scheme: null,
      creatingProgram: '',
      tableData: [],
      days: [],
    };
  },
  async mounted() {
    try {
      await this.fetchInitialData();
      this.loadListenergroupData();
      this.loadListenersData();
      //this.loadL_Group_StatusData();
      //console.log(this.l_group_status[0].group_formed);
    } catch (error) {
      console.error("Ошибка при загрузке данных слушателей:", error);
    }

    this.scheme = new FormScheme([
      new TextInput({
        key: "group_number",
        label: "Номер группы",
        placeholder: "Введите номер группы",
      }),
      new TextInput({
        key: "hours",
        label: "Часы",
        placeholder: "Введите количество часов",
      }),
      new DateInput({
        key: "start_date",
        label: "Дата начала",
      }),
      new DateInput({
        key: "end_date",
        label: "Дата окончания",
      }),

    ]);
  },
  methods: {
    ...mapActions(useListenergroupStore, [
      "getListenergroupList",
      "postListenergroup",
      "putListenergroup",
      "deleteListenergroup",
    ]),
    ...mapActions(useListenerStore, [
    "getListenerList",
    "getReady_ListenerList"
  ]),
    ...mapActions(useProgramStore, ["getProgramList"]),
    ...mapActions(useL_Group_StatusStore, ["getL_Group_StatusList"]),
    ...mapActions(useL_Ready_GroupStore, [
      "getL_Ready_GroupList",
    ]),

    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
        this.edit(event);
      }
    },
    resetLgr() {
      this.listenergroup = new Listenergroup();
      this.errors = {};
      this.creatingProgram = '';
    },
    edit(event) {
      this.resetLgr();
      this.listenergroup = event.data;
      console.log(this.listenergroup);
      this.showAddSidebar = true;
    },
    async submit() {
      console.log("Сабмитаю");
      let listenergroup = { ...this.listenergroup };
      if (listenergroup.id) {
        console.log("До обновления (PUT):", listenergroup);
        await this.putListenergroup(listenergroup);
      } else {
        console.log("До создания (POST):", listenergroup);
        console.log("Часы:", listenergroup.hours);
        console.log("Номер группы:", listenergroup.group_number);
        await this.postListenergroup(listenergroup);
      }
      this.showSidebar = false;
      this.resetLgr();
      this.loadListenergroupData();
    },
    async deleteLgr() {
      let listenergroup = { ...this.listenergroup };
      console.log("Удаляем:", listenergroup);
      await this.deleteListenergroup(listenergroup);
      this.showSidebar = false;
      this.resetLgr();
      this.loadListenergroupData();
    },

    async fetchInitialData() {
   console.log("Fetching initial data...");
   try {
       await Promise.all([
          this.getListenergroupList(),
          this.getProgramList(),
          this.getListenerList(),
          //this.getReady_ListenerList(),
          this.getL_Group_StatusList(),
          this.getL_Ready_GroupList(),
       ]);
       console.log("Initial data fetched successfully.");
   } catch (error) {
       console.error("Ошибка при первичной загрузке данных:", error);
   }
},

    async loadListenergroupData() {
      try {
        if (Array.isArray(this.listenergroupList)) {
          this.rowData.value = this.listenergroupList.filter(
            (lgr) => lgr.deleted_at === null
          );
          //console.log("Все файлы (включая дубликаты):", this.rowData);;
        } else if (
          this.listenergroupList &&
          this.listenergroupList.deleted_at === null
        ) {
          this.rowData.value = [this.listenergroupList];
        } else {
          this.rowData.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных групп:", error);
        this.rowData.value = [];
      }
    },
    async loadListenersData() {
      try {
        console.log(this.listenerList)
        if (Array.isArray(this.listenerList)) {
          this.rowDataAdd.value = this.listenerList
            .filter((listener) => listener.deleted_at === null)
            .sort((a, b) => a.full_name.localeCompare(b.full_name));
          console.log(this.rowDataAdd.value)
        } else if (this.listenerList && this.listenerList.deleted_at === null) {
          this.rowDataAdd.value = [this.listenerList];
        } else {
          this.rowDataAdd.value = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных слушателей:", error);
        this.rowData.value = [];
      }
    },

    addRowInWishForm() {
    this.addRow(this.listenergroup.id);
 },

    navigateToAddGroup() { },
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
      if (
        savedFilterModel &&
        Object.keys(savedFilterModel).length > 0
      ) {
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
      this.resetLgr();
      this.showSidebar = true;
    },
    openAddSidebar() {

      const selectedProgramId = this.listenergroup.program_id;
      
      if (!selectedProgramId) {
        console.error("Ошибка: Невозможно продолжить без выбранной программы!");
        return; 
      }

      const programStore = useProgramStore();
      const programMap = programStore.programMap;
      let programName = 'Не найдена'; 

      if (programMap && programMap[selectedProgramId]) {
        programName = programMap[selectedProgramId].program_name; 
      } else {
        console.warn(`Программа с ID ${selectedProgramId} не найдена в programMap.`);
      }

      console.log(`Переход к созданию группы для программы: "${programName}" (ID: ${selectedProgramId})`);
      this.creatingProgram = programName;
      console.log(this.creatingProgram)

      this.showAddSidebar = true; 
    },
    openGenAddSidebar() {
      this.showGenAddSidebar = true;
    },
    closeSidebar() {
      this.showSidebar = false;
      this.showAddSidebar = false;
    },
  },
  computed: {
    ...mapState(useListenergroupStore, ["listenergroupList"]),
    ...mapState(useL_Group_StatusStore, ["l_group_statusList"]),
    ...mapState(useProgramStore, ["programMap"]),
    ...mapState(useL_Ready_GroupStore, ["l_ready_groupList"]),
    ...mapState(useListenerStore, [
      "listenerList"
    ]),

    allProgramOptions() {
    const programStore = useProgramStore();
    console.log("Генерация опций ВСЕХ программ из:", programStore.programMap);
    return Object.values(programStore.programMap || {})
      .map(item => ({
        value: item.id, // ID программы
        label: item.program_name, // Название программы
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Сортировка по названию
  },

  readyProgramOptions() {
  const readyGroupStore = useL_Ready_GroupStore();
  const programStore = useProgramStore();

  // 1. Получаем список объектов готовых групп.
  const readyGroups = readyGroupStore.l_ready_groupList || [];
  console.log("1. Список объектов готовых групп (из store):", readyGroups);
  // Дополнительный лог для проверки структуры первого объекта
  if (readyGroups.length > 0) {
    console.log("DEBUG: Структура первого объекта L_Ready_Group:", readyGroups[0]);
  }

  // 2. Создаем МАССИВ ID готовых программ.
  //    !!! ВНИМАНИЕ: ЭТА СТРОКА ОЖИДАЕТ НАЛИЧИЕ 'program_id' В ОБЪЕКТАХ 'readyGroups' !!!
  const readyProgramIdsArray = readyGroups.map(rg => {
    // Если program_id отсутствует, rg.program_id вернет undefined.
    if (rg.program_id === undefined) {
       // Это сообщение появится, если данные не содержат program_id
       console.warn(`ОШИБКА ДАННЫХ: Объект L_Ready_Group не содержит 'program_id'. Объект:`, rg);
    }
    return rg.program_id;
  }).filter(id => id !== undefined && id !== null); // Добавим фильтр, чтобы убрать undefined/null ID

  // Если на предыдущем шаге не нашлось ни одного program_id, массив будет пуст.
  console.log("2. Массив ID готовых программ (после извлечения и фильтрации undefined):", readyProgramIdsArray);

  // 3. Получаем все программы.
  const allPrograms = Object.values(programStore.programMap || {});

  // 4. Фильтруем, форматируем и сортируем.
  //    Фильтрация будет работать корректно ТОЛЬКО ЕСЛИ readyProgramIdsArray содержит актуальные ID.
  const options = allPrograms
    .filter(program => {
        // Убедимся, что у программы есть ID для сравнения
        if (program.id === undefined || program.id === null) {
            console.warn("Проблема с данными Program: отсутствует id. Программа:", program);
            return false;
        }
        // Проверяем, есть ли ID программы в нашем списке ID готовых программ
        return readyProgramIdsArray.includes(program.id);
    })
    .map(item => ({
      value: item.id,
      label: item.program_name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label)); // Сортировка

  console.log("3. Сгенерированные опции ГОТОВЫХ программ:", options);
  return options;
},

  dynamicProgramOptions() {
    if (this.filterOnlySufficient) {
      // Если чекбокс НАЖАТ - возвращаем ВСЕ программы
      console.log("Используем ВСЕ опции программ");
      return this.allProgramOptions;
    } else {
      // Если чекбокс НЕ НАЖАТ - возвращаем только ГОТОВЫЕ
      console.log("Используем опции ГОТОВЫХ программ");
      return this.readyProgramOptions;
    }
  },

  addScheme() {
    console.log("Пересчет addScheme, используемые опции:", this.dynamicProgramOptions);
    return new FormScheme([
      new ComboboxInput({
        key: "program_id",
        label: "Программа",
        placeholder: "Выберите программу",
        options: this.dynamicProgramOptions, // <-- Самое важное: используем динамические опции!
        required: true // Делаем выбор программы обязательным
      }),
      // Здесь могут быть другие поля для этого сайдбара, если нужно
    ]);
  },

    programOptions() {
      const programStore = useProgramStore();
      //const allPrograms = Object.values(this.programStore.programMap || {});
      //console.log(allPrograms);
  
      return Object.values(programStore.programMap || {}).map((item) => ({
        value: item.id,
        label: item.program_name,
      }));
    },
  },
  created() {
    this.loadListenergroupData();
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

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.custom-sidebar .p-sidebar-content {
  padding: 1rem; /* Пример */
}

/* Стили для формы: располагаем поля в 3 колонки */
.custom-form {
  display: grid;
  gap: 1rem;
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
  --bs-btn-hover-bg: rgb(6 215 29);
  --bs-btn-hover-border-color: rgb(6 215 29);
  --bs-btn-active-bg: rgb(68, 99, 52);
  --bs-btn-disabled-bg: rgb(68, 99, 52);
  display: flex;
  justify-content: center;
  align-items: center;
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 10px;
}

.form-control:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}

.form-select:focus {
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

.page-link {
  height: 40px;
  width: 40px;
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.active .page-link {
  background-color: rgb(68, 99, 52);
  border: none;
  --bs-btn-hover-bg: rgb(6 215 29);
  --bs-btn-hover-border-color: rgb(6 215 29);
}

.disabled .page-link {
  background-color: rgb(57, 79, 46);
  border: none;
  --bs-btn-hover-bg: rgb(6 215 29);
  --bs-btn-hover-border-color: rgb(6 215 29);
}
</style>

<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>Список всех групп</span>
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

    <div class="row g-2 mb-2">
      <div class="col-4 p-0"> 
        <button
          @click="openGenAddSidebar"
          class="btn btn-primary w-100 position-relative"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Создать группу
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
          :disabled="!listenergroup.group_program_id">
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

    <Sidebar
      v-model:visible="showAddSidebar"
      position="bottom"
      modal
      :header="`Создать группу по программе ${creatingProgram || '...'}`"
      class="custom-sidebar h-auto"
      :style="{ width: '75%', maxHeight: '85vh', height: 'auto', margin: 'auto' }"
    >
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
              :rowData="suitableListeners" :defaultColDef="defaultColDef" :localeText="localeText" rowSelection="multiple"
              animateRows="true" :rowHeight="40" @cell-clicked="cellWasClicked"
              @grid-ready="onGridReadySuitable"
              @firstDataRendered="onFirstDataRendered" @filter-changed="onFilterChanged" :pagination="true"
              :paginationPageSize="paginationPageSize">
            </ag-grid-vue>
          </div>

          <div class="d-flex align-items-center flex-wrap gap-2 mt-2" style="min-height: 2rem;">
               <span class="field-checkbox d-flex align-items-center">
                   <Checkbox inputId="chk-ignore-count" v-model="ignoreCountWish" :binary="true" />
                   <label for="chk-ignore-count" class="ms-1 small">игнорировать желания</label>
               </span>
               <span class="field-checkbox d-flex align-items-center">
                   <Checkbox inputId="chk-ignore-schedule" v-model="ignoreScheduleWish" :binary="true" />
                   <label for="chk-ignore-schedule" class="ms-1 small">игнорировать расписание</label>
               </span>
              
           </div>
        </div>

        <div class="d-flex flex-column align-items-center justify-content-center px-2" style="align-self: center;">
           <button class="btn btn-light btn-sm mb-2" @click="moveSelectedToGroup" title="Добавить выбранных в группу" ><i class="material-icons-outlined">chevron_right</i></button>
           <button class="btn btn-light btn-sm mb-2" @click="moveAllToGroup" title="Добавить всех в группу" ><i class="material-icons-outlined">double_arrow</i></button>
           <button class="btn btn-light btn-sm mb-2" @click="moveSelectedFromGroup" title="Убрать выбранных из группы"><i class="material-icons-outlined">chevron_left</i></button>
           <button class="btn btn-light btn-sm" @click="moveAllFromGroup" title="Убрать всех из группы"><i class="material-icons-outlined" style="transform: rotate(180deg);">double_arrow</i></button>
        </div>

        <div style="flex: 1; height: 50vh">
          <div class="h-100 pt-5">
            <ag-grid-vue class="ag-theme-alpine" style="width: 100%; height: 100%;" :columnDefs="columnDefsAdd.value"
              :rowData="groupListenersInOpenGroup" 
              :defaultColDef="defaultColDef" :localeText="localeText" rowSelection="multiple"
              animateRows="true" :rowHeight="40" @cell-clicked="cellWasClicked"
              @grid-ready="onGridReadyGroup"
              @firstDataRendered="onFirstDataRendered" @filter-changed="onFilterChanged" :pagination="true"
              :paginationPageSize="paginationPageSize">
            </ag-grid-vue>
          </div>
        </div>

      </div>

      <br>

      <div class="pt-3 mt-3 d-flex justify-content-between">
        <Button class="btn btn-primary" @click="submit">
          Сохранить
        </Button>
        <Button class="btn btn-danger" v-if="listenergroup.id" @click="deleteLgr">
          Удалить
        </Button>
      </div>
    </Sidebar>

  </div>
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
import { useL_Wish_DayStore } from "@/store2/listenergroup/l_wish_day"
import { useListener_WishStore } from "@/store2/listenergroup/listenerwish";
import L_Wish_Day from "@/model/listener-group/L_Wish_Day"; 
import { useDayStore } from "@/store2/listenergroup/day";

import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import { TextInput } from "@/model/form/inputs/TextInput";
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

    const tableData = reactive([]);

    const addRow = () => { // listenerId не используется, берем из listenergroup.value.id
      const currentListenerGroupId = listenergroup.value ? listenergroup.value.id : null; // ID группы, а не слушателя
      console.log('Adding new wish day row for group:', currentListenerGroupId); 
      const newRow = new L_Wish_Day({
          l_wish_day_id: null,
          day_id: null,
          starttime: '09:00', 
          endtime: '18:00', 
      });
      tableData.push(newRow);
      console.log('tableData after add:', tableData); 
    };

    const removeRow = (index) => {
      console.log('Removing wish day row at index:', index);
      tableData.splice(index, 1);
      console.log('tableData after remove:', tableData.value);
    };

    const listenergroup = ref(new Listenergroup());

    const instance = getCurrentInstance();
    const localeText = AG_GRID_LOCALE_RU;



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
    
    
    const suitableListenersRowData = ref([]);
    const groupListenersRowData = ref([]);

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
      const groupStatuses = l_group_status.value || [];
      return groupStatuses.some(status => status.group_formed === false);
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
        console.log("MEOW!")
        console.log(l_group_status.value[0]?.group_formed);
      } catch (error) {
        console.error("Ошибка при загрузке статуса группы:", error);
      }
    };

    const onGridReadySuitable = (params) => {
    console.log("Grid API для Подходящих слушателей готов.");
    gridApiSuitable.value = params.api;
    gridColumnApiSuitable.value = params.columnApi; 
  };

  const onGridReadyGroup = (params) => {
    console.log("Grid API для Слушателей в группе готов.");
    gridApiGroup.value = params.api;
    gridColumnApiGroup.value = params.columnApi; 
  };

  const ignoreCountWish = ref(false); // Используем ref()
  const ignoreScheduleWish = ref(false); // Используем ref()

    return {
      onGridReady,
      columnDefs,
      columnDefsAdd,
      rowData,
      suitableListenersRowData,
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
      removeRow,
      tableData,

      gridApiSuitable, 
      gridApiGroup,   
      onGridReadySuitable, 
      onGridReadyGroup,    

      listenergroup,
      groupListenersRowData,
      loadL_Group_StatusData,

      ignoreCountWish,       
      ignoreScheduleWish,    
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
      creatingProgramId: null,
      days: [],

      justMovedFromGroupIds: new Set(),
    };
  },
  async mounted() {
    try {
      await this.fetchInitialData();
      await this.loadL_Group_StatusData();
      this.loadListenergroupData();
      this.loadListenersData();
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
        dateFormat: "dd/mm/yy",
        size: "sm",
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
  ...mapActions(useListener_WishStore, [
      "getListener_WishList",
    ]),
    ...mapActions(useProgramStore, ["getProgramList"]),
    ...mapActions(useL_Group_StatusStore, ["getL_Group_StatusList"]),
    ...mapActions(useL_Ready_GroupStore, [
      "getL_Ready_GroupList",
    ]),
    ...mapActions(useDayStore, ["getDayList"]),

    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
        this.edit(event);
      }
    },
    resetLgr() {
      this.listenergroup = new Listenergroup();
      this.errors = {};
      this.creatingProgram = '';
      this.creatingProgramId = null;
      this.tableData.splice(0, this.tableData.length); 
      this.justMovedFromGroupIds.clear();
    },
    edit(event) {
      this.resetLgr();
      this.listenergroup = event.data;

      const selectedProgramId = this.listenergroup.group_program_id;
      
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

      this.creatingProgram = programName;
      this.creatingProgramId = selectedProgramId;
      console.log(this.creatingProgram)
      
      this.showAddSidebar = true;
    },
    async submit() {
      let listenergroup = { ...this.listenergroup };
      if (listenergroup.id) {
        await this.putListenergroup(listenergroup);
      } else {
        await this.postListenergroup(listenergroup);
      }
      this.showAddSidebar = false;
      this.showGenAddSidebar = false;
      this.resetLgr();
      this.loadListenergroupData();
    },
    async deleteLgr() {
      let listenergroup = { ...this.listenergroup };
      console.log("Удаляем:", listenergroup);
      await this.deleteListenergroup(listenergroup);
      this.showAddSidebar = false;
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
          this.getListener_WishList(),
          this.getL_Group_StatusList(),
          this.getL_Ready_GroupList(),
          this.getDayList(),
       ]);
       console.log("Initial data fetched successfully.");
       await this.loadDaysData();
   } catch (error) {
       console.error("Ошибка при первичной загрузке данных:", error);
   }
},

    async loadListenergroupData() {
      try {
        if (Array.isArray(this.listenergroupList)) {
          // Получаем статусы групп
          const groupStatuses = this.l_group_statusList || [];
          const statusMap = new Map(groupStatuses.map(status => [status.group_id, status.group_formed]));
          
          // Получаем мапу программ
          const programStore = useProgramStore();
          const programMap = programStore.programMap || {};

          this.rowData.value = this.listenergroupList
            .filter(lgr => lgr.deleted_at === null)
            .map(lgr => ({
              ...lgr,
              group_formed: statusMap.get(lgr.id) || null,
              program_name: programMap[lgr.group_program_id]?.program_name || 'Не указана'
            }));
        } else if (this.listenergroupList && this.listenergroupList.deleted_at === null) {
          const status = this.l_group_statusList?.find(s => s.group_id === this.listenergroupList.id);
          const programStore = useProgramStore();
          const programName = programStore.programMap[this.listenergroupList.group_program_id]?.program_name || 'Не указана';
          
          this.rowData.value = [{
            ...this.listenergroupList,
            group_formed: status?.group_formed || null,
            program_name: programName
          }];
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

          this.suitableListenersRowData.value = this.listenerList
            .filter((listener) => listener.deleted_at === null)
            .sort((a, b) => a.full_name.localeCompare(b.full_name));

          console.log(this.suitableListenersRowData.value)

        } else if (this.listenerList && this.listenerList.deleted_at === null) {
          this.suitableListenersRowData.value = [this.listenerList];
        } else {
          this.suitableListenersRowData.value = [];
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
      const selectedProgramId = this.listenergroup.group_program_id;;
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

      this.creatingProgramId = selectedProgramId; // <--- КРИТИЧЕСКИ ВАЖНО

  console.log(`[openAddSidebar] Установлен creatingProgramId: ${this.creatingProgramId} (${this.creatingProgram})`);

      this.showAddSidebar = true; 
    },
    openGenAddSidebar() {
      this.resetLgr();
      this.showGenAddSidebar = true;
    },
    closeSidebar() {
      this.showSidebar = false;
      this.showAddSidebar = false;
    },
    async loadDaysData() {
      try {
        if (!this.dayList || this.dayList.length === 0) {
          await this.getDayList();
        }
        if (Array.isArray(this.dayList)) {
          this.days = this.dayList;
        } else {
          this.days = [];
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных дней:", error);
        this.days = [];
      }
    },

    findOriginalListener(listenerId) {
    if (!this.listenerList || !Array.isArray(this.listenerList)) {
      console.error("Исходный список слушателей (listenerList) не доступен или не массив.");
      return null;
    }
    return this.listenerList.find(listener => listener.id === listenerId);
  },

  moveSelectedToGroup() {
    console.log("НАЖАЛОСЬ");
    const currentGroupId = this.listenergroup.id;
    if (!currentGroupId) {
      console.error("Невозможно добавить в группу: ID текущей группы не определен.");
      return;
    }
    if (!this.gridApiSuitable) { // Или gridApiSuitable.value в setup
       console.error("API таблицы 'Подходящие слушатели' не готово.");
       return;
    }

    const selectedNodes = this.gridApiSuitable.getSelectedNodes(); // Или .value.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length === 0) {
      console.log("Нет выбранных слушателей для перемещения в группу.");
      return;
    }

    console.log(`Перемещение ${selectedNodes.length} слушателей в группу ID: ${currentGroupId}`);

    selectedNodes.forEach(node => {
      const listenerData = node.data; // Данные выбранной строки
      if (!listenerData || !listenerData.id) return;

      const originalListener = this.findOriginalListener(listenerData.id);
      if (originalListener) {
        // Убедимся, что group_ids существует и это массив
        if (!Array.isArray(originalListener.group_ids)) {
          originalListener.group_ids = [];
        }
        // Добавляем ID группы, если его еще нет
        if (!originalListener.group_ids.includes(currentGroupId)) {
          originalListener.group_ids.push(currentGroupId);
          console.log(` - Слушателю ${originalListener.id} добавлена группа ${currentGroupId}`);
        }
      } else {
          console.warn(`Не найден оригинальный слушатель с ID ${listenerData.id} в listenerList.`);
      }
    });

    this.gridApiSuitable.deselectAll(); // Или .value.deselectAll()

    console.log("Перемещение в группу завершено.");
    // Таблицы должны обновиться автоматически из-за реактивности computed properties
  },

  /**
   * Перемещает ВСЕХ слушателей из списка "Подходящие" в "Группу".
   */
  moveAllToGroup() {
    const currentGroupId = this.listenergroup.id;
     if (!currentGroupId) {
      console.error("Невозможно добавить в группу: ID текущей группы не определен.");
      return;
    }
     if (!this.gridApiSuitable) { // Или gridApiSuitable.value в setup
       console.error("API таблицы 'Подходящие слушатели' не готово.");
       return;
    }

    // Получаем данные ВСЕХ строк, отображаемых в таблице "Подходящие"
    const allSuitableListenersData = [];
    this.gridApiSuitable.forEachNode(node => { // Или .value.forEachNode
        if(node.data) {
            allSuitableListenersData.push(node.data);
        }
    });
    // Альтернативно, если suitableListeners доступен: const allSuitableListenersData = this.suitableListeners;

    if (allSuitableListenersData.length === 0) {
        console.log("Нет слушателей в списке 'Подходящие' для перемещения.");
        return;
    }

    console.log(`Перемещение ВСЕХ (${allSuitableListenersData.length}) слушателей в группу ID: ${currentGroupId}`);

    allSuitableListenersData.forEach(listenerData => {
      if (!listenerData || !listenerData.id) return;

      const originalListener = this.findOriginalListener(listenerData.id);
      if (originalListener) {
        if (!Array.isArray(originalListener.group_ids)) {
          originalListener.group_ids = [];
        }
        if (!originalListener.group_ids.includes(currentGroupId)) {
          originalListener.group_ids.push(currentGroupId);
           console.log(` - Слушателю ${originalListener.id} добавлена группа ${currentGroupId}`);
        }
      } else {
          console.warn(`Не найден оригинальный слушатель с ID ${listenerData.id} в listenerList.`);
      }
    });

    console.log("Перемещение всех в группу завершено.");
     // Таблицы должны обновиться автоматически
  },

  /**
   * Перемещает выбранных слушателей из "Группы" обратно в "Подходящие".
   */
  moveSelectedFromGroup() {
    const currentGroupId = this.listenergroup.id;
    if (!currentGroupId) {
      console.error("Невозможно убрать из группы: ID текущей группы не определен.");
      return;
    }
     if (!this.gridApiGroup) { // Или gridApiGroup.value в setup
       console.error("API таблицы 'Слушатели в группе' не готово.");
       return;
    }

    const selectedNodes = this.gridApiGroup.getSelectedNodes(); // Или .value.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length === 0) {
      console.log("Нет выбранных слушателей для удаления из группы.");
      return;
    }

     console.log(`Удаление ${selectedNodes.length} слушателей из группы ID: ${currentGroupId}`);

    selectedNodes.forEach(node => {
      const listenerData = node.data;
      if (!listenerData || !listenerData.id) return;

      const originalListener = this.findOriginalListener(listenerData.id);
      if (originalListener && Array.isArray(originalListener.group_ids)) {
        const index = originalListener.group_ids.indexOf(currentGroupId);
        if (index > -1) {
        originalListener.group_ids.splice(index, 1); // Удаляем ID группы
        console.log(` - У слушателя ${originalListener.id} удалена группа ${currentGroupId}`);
        // ---> ДОБАВЛЯЕМ ID ВО ВРЕМЕННОЕ ХРАНИЛИЩЕ <---
        this.justMovedFromGroupIds.add(listenerData.id);
      }
      } else {
          console.warn(`Не найден оригинальный слушатель с ID ${listenerData.id} или у него нет group_ids.`);
      }
    });

    // Опционально: Сбросить выбор
    this.gridApiGroup.deselectAll(); // Или .value.deselectAll()

    console.log("Удаление из группы завершено.");
    // Таблицы должны обновиться автоматически
  },

  /**
   * Перемещает ВСЕХ слушателей из "Группы" обратно в "Подходящие".
   */
  moveAllFromGroup() {
     const currentGroupId = this.listenergroup.id;
     if (!currentGroupId) {
      console.error("Невозможно убрать из группы: ID текущей группы не определен.");
      return;
    }
    if (!this.gridApiGroup) { // Или gridApiGroup.value в setup
       console.error("API таблицы 'Слушатели в группе' не готово.");
       return;
    }

    // Получаем данные ВСЕХ строк, отображаемых в таблице "Группа"
    const allGroupListenersData = [];
     this.gridApiGroup.forEachNode(node => { // Или .value.forEachNode
        if(node.data) {
            allGroupListenersData.push(node.data);
        }
    });
    // Альтернативно, если groupListenersInOpenGroup доступен: const allGroupListenersData = this.groupListenersInOpenGroup;


     if (allGroupListenersData.length === 0) {
        console.log("Нет слушателей в группе для удаления.");
        return;
    }

     console.log(`Удаление ВСЕХ (${allGroupListenersData.length}) слушателей из группы ID: ${currentGroupId}`);

     allGroupListenersData.forEach(listenerData => {
        if (!listenerData || !listenerData.id) return;

        const originalListener = this.findOriginalListener(listenerData.id);
         if (originalListener && Array.isArray(originalListener.group_ids)) {
            const index = originalListener.group_ids.indexOf(currentGroupId);
            if (index > -1) {
              originalListener.group_ids.splice(index, 1);
               console.log(` - У слушателя ${originalListener.id} удалена группа ${currentGroupId}`);
              this.justMovedFromGroupIds.add(listenerData.id);
              }
         } else {
              console.warn(`Не найден оригинальный слушатель с ID ${listenerData.id} или у него нет group_ids.`);
         }
     });

      console.log("Удаление всех из группы завершено.");
       // Таблицы должны обновиться автоматически
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
    ...mapState(useL_Wish_DayStore, [
      "l_wish_dayList"
    ]),
    
    ...mapState(useDayStore, ["dayList"]),
    
    groupListenersInOpenGroup() {

    console.log("%c[groupListenersInOpenGroup] Вызвано", "color: blue; font-weight: bold;");

    const allListeners = this.listenerList || [];
    console.log(allListeners)

    const currentGroupId = this.listenergroup.id;
    console.log(`[groupListenersInOpenGroup] ID текущей группы для фильтрации (currentGroupId): ${currentGroupId}`);

    let processedCount = 0;
    const filteredListeners = allListeners.filter(listener => {
      processedCount++;
      const isNotDeleted = listener.deleted_at === null;
      const hasValidGroupIds = listener.group_ids && Array.isArray(listener.group_ids);
      const isInCurrentGroup = hasValidGroupIds && listener.group_ids.includes(currentGroupId);


      if (listener.id === 54 || processedCount <= 5) {
          console.log(`[groupListenersInOpenGroup] Проверка слушателя ID ${listener.id} (${listener.full_name || 'N/A'}):
            - deleted_at: ${listener.deleted_at} (isNotDeleted: ${isNotDeleted})
            - groups_ids существует и массив: ${hasValidGroupIds}
            - groups_ids значение: ${JSON.stringify(listener.group_ids)}
            - Состоит в группе ${currentGroupId}: ${isInCurrentGroup}`);
      }
      return isNotDeleted && isInCurrentGroup; 
    });

    const sortedListeners = filteredListeners.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

    return sortedListeners;
  },

  suitableListeners() {
  // 1. Проверка на загрузку данных и наличие listenerList
  if (this.initialDataLoading) {
     console.log("[suitableListeners] Данные еще загружаются. Возвращаем пустой массив.");
     return [];
  }
  if (!this.listenerList || this.listenerList.length === 0) {
     console.log("[suitableListeners] Список слушателей (listenerList) пуст или не загружен. Возвращаем пустой массив.");
     return [];
  }
  // 2. Проверка на наличие creatingProgramId (для новой группы это критично)
  if (!this.creatingProgramId) {
     console.log("[suitableListeners] ID программы для создания (creatingProgramId) не установлен. Возвращаем пустой массив.");
     return [];
  }

  const allListeners = this.listenerList;
  const selectedProgramId = this.creatingProgramId; // Это ID программы, для которой создаем группу
  const currentGroupId = this.listenergroup.value ? this.listenergroup.value.id : null; // Будет null для НОВОЙ группы

  console.log(`[suitableListeners] Фильтрация для программы ID: ${selectedProgramId}. Текущая группа ID (если есть): ${currentGroupId}.`);
  
  const filteredListeners = allListeners.filter(listener => {
    const isNotDeleted = listener.deleted_at === null;

    // Условие 1: Слушатель не должен быть в текущей редактируемой группе (актуально, если currentGroupId есть)
    let isNotInCurrentGroup = true;
    if (currentGroupId !== null) { // Только если группа УЖЕ существует (имеет ID)
        const hasValidGroupIds = listener.group_ids && Array.isArray(listener.group_ids);
        isNotInCurrentGroup = !hasValidGroupIds || !listener.group_ids.includes(currentGroupId);
    }
    
    // Условие 2: Слушатель был только что перемещен из этой группы (актуально при редактировании существующей)
    const wasJustMoved = this.justMovedFromGroupIds.has(listener.id);

    // Условие 3: Слушатель подходит по выбранной программе
    const hasValidProgramIds = listener.program_ids && Array.isArray(listener.program_ids);
    const hasSelectedProgram = hasValidProgramIds && listener.program_ids.includes(selectedProgramId);

    // Итоговое условие:
    // Слушатель должен быть:
    // 1. Не удален
    // 2. Не состоять в текущей группе (если это редактирование существующей группы)
    // 3. ИЛИ (подходить по программе ИЛИ быть только что перемещенным из текущей группы)
    // Для НОВОЙ группы (currentGroupId is null), isNotInCurrentGroup всегда true, 
    // поэтому условие упрощается до: isNotDeleted && (hasSelectedProgram || wasJustMoved)
    // Но wasJustMoved для новой группы тоже маловероятно. Значит, в основном: isNotDeleted && hasSelectedProgram.
    const shouldBeIncluded = isNotDeleted && isNotInCurrentGroup && (hasSelectedProgram || wasJustMoved);
    
    // Для отладки конкретного слушателя:
    // if (listener.id === YOUR_LISTENER_ID_TO_DEBUG) {
    //    console.log(`  Listener ID ${listener.id}: isNotDeleted=${isNotDeleted}, isNotInCurrentGroup=${isNotInCurrentGroup}, hasSelectedProgram=${hasSelectedProgram}, wasJustMoved=${wasJustMoved}, included=${shouldBeIncluded}`);
    // }
    return shouldBeIncluded;
  });

  console.log(`[suitableListeners] Найдено подходящих слушателей: ${filteredListeners.length}`);
  return filteredListeners.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
},

  groupListenersCount() {
    return this.groupListenersInOpenGroup.length;
  },

    allProgramOptions() {
    const programStore = useProgramStore();
    console.log("Генерация опций ВСЕХ программ из:", programStore.programMap);
    return Object.values(programStore.programMap || {})
      .map(item => ({
        value: item.id, 
        label: item.program_name, 
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); 
  },

  readyProgramOptions() {
  const readyGroupStore = useL_Ready_GroupStore();
  const programStore = useProgramStore();

  const readyGroups = readyGroupStore.l_ready_groupList || [];
  console.log("1. Список объектов готовых групп (из store):", readyGroups);

  console.log("MEOW!")
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

  const allPrograms = Object.values(programStore.programMap || {});

  const options = allPrograms
    .filter(program => {
        if (program.id === undefined || program.id === null) {
            console.warn("Проблема с данными Program: отсутствует id. Программа:", program);
            return false;
        }
        return readyProgramIdsArray.includes(program.id);
    })
    .map(item => ({
      value: item.id,
      label: item.program_name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label)); 

  console.log("3. Сгенерированные опции ГОТОВЫХ программ:", options);
  return options;
},

  dynamicProgramOptions() {
    if (this.filterOnlySufficient) {
      console.log("Используем ВСЕ опции программ");
      return this.allProgramOptions;
    } else {
      console.log("Используем опции ГОТОВЫХ программ");
      return this.readyProgramOptions;
    }
  },

  addScheme() {
    console.log("Пересчет addScheme, используемые опции:", this.dynamicProgramOptions);
    return new FormScheme([
      new ComboboxInput({
        key: "group_program_id",
        label: "Программа",
        placeholder: "Выберите программу",
        options: this.dynamicProgramOptions, 
        required: true 
      }),
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

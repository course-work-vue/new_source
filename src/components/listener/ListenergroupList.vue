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
                    <button 
  class="btn btn-sm"
  :class="{ 
    'btn-success': isScheduleFilterActive,
    'btn-secondary': !isScheduleFilterActive 
  }"
  @click="findSuitableListeners"
  title="Включить/выключить подбор по текущему расписанию группы"
>
  {{ isScheduleFilterActive ? 'Подобрано' : 'Подобрать' }}
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
              :rowData="displayedSuitableListeners" 
              :defaultColDef="defaultColDef" :localeText="localeText" rowSelection="multiple"
              animateRows="true" :rowHeight="40" @cell-clicked="cellWasClicked"
              @grid-ready="onGridReadySuitable"
              @firstDataRendered="onFirstDataRendered" @filter-changed="onFilterChanged" :pagination="true"
              :paginationPageSize="paginationPageSize">
            </ag-grid-vue>
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
import { useL_Group_Wish_DayStore } from "@/store2/listenergroup/l_group_wish_day";
import { useListener_WishStore } from "@/store2/listenergroup/listenerwish";
import L_Wish_Day from "@/model/listener-group/L_Wish_Day"; 
import L_Group_Wish_Day from "@/model/listener-group/L_Group_Wish_Day"; 
import { useDayStore } from "@/store2/listenergroup/day";

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

    const tableData = reactive([]);

   const addRow = (groupIdForNewEntry) => { // groupIdForNewEntry может быть null для новой группы
      console.log('[setup/addRow] Adding new group wish day row for l_group_id:', groupIdForNewEntry);
      const newRow = new L_Group_Wish_Day({
          l_group_wish_day_id: null, // Новая запись
          day_id: null,
          starttime: '09:00',
          endtime: '18:00',
          l_group_id: groupIdForNewEntry // Связь с группой
      });
      tableData.push(newRow);
      console.log('[setup/addRow] tableData after add:', JSON.parse(JSON.stringify(tableData)));
    };

    const removeRow = (index) => {
      console.log('[setup/removeRow] Removing group wish day row at index:', index);
      console.log('[setup/removeRow] Row to remove:', JSON.parse(JSON.stringify(tableData[index])));
      tableData.splice(index, 1);
      console.log('[setup/removeRow] tableData after remove:', JSON.parse(JSON.stringify(tableData)));
    };

    const listenerStore = useListenerStore();
    const listenergroup = ref(new Listenergroup());
    

    const instance = getCurrentInstance();
    const localeText = AG_GRID_LOCALE_RU;



    const gridApi = ref(null);
    const gridColumnApi = ref(null);

    const gridApiSuitable = ref(null); 
    const gridApiGroup = ref(null);   
    const gridColumnApiSuitable = ref(null); 
    const gridColumnApiGroup = ref(null);

    const newGroupListenerIds = ref(new Set());

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

    const isScheduleFilterActive = ref(false);
    const scheduleFilterCriteria = ref(null);

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
        { 
          field: "group_number", 
          headerName: "Номер группы", 
          sort: 'asc', // Добавляем сортировку по возрастанию
          sortIndex: 0 // Указываем, что это основной столбец для сортировки
        },
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
        {
          headerName: "Желаемое кол-во", // Изменили заголовок
          field: "id", // По-прежнему используем id слушателя для valueGetter
          valueGetter: params => {
            // Отладочная информация (можно оставить или удалить после проверки)
            // console.log('[Желаемое кол-во VG] Вызван для строки:', JSON.parse(JSON.stringify(params.data)));

            if (!params.data || params.data.id == null) {
              // console.log('[Желаемое кол-во VG] Нет данных или ID слушателя в строке.');
              return '-'; // Или '- (нет ID)'
            }
            const listenerId = params.data.id;
            // console.log(`[Желаемое кол-во VG] ID слушателя: ${listenerId}`);

            const listenerWishStore = useListener_WishStore();
            const wishes = listenerWishStore.listener_wishList;

            if (!wishes || wishes.length === 0) {
              // console.log('[Желаемое кол-во VG] Список listener_wishList пуст или не определен.');
              return '-'; // Или '- (нет пожел. в сторе)'
            }
            
            // Ищем первое активное пожелание для данного слушателя
            const listenerWish = wishes.find(wish => wish.listener_id === listenerId && wish.deleted_at === null);
            
            if (listenerWish) {
              // console.log(`[Желаемое кол-во VG] Найдено активное пожелание для слушателя ID ${listenerId}:`, JSON.parse(JSON.stringify(listenerWish)));
              // console.log(`[Желаемое кол-во VG] Значение group_size: ${listenerWish.group_size}`);
              // Проверяем, что group_size существует и не null/undefined
              return listenerWish.group_size !== null && listenerWish.group_size !== undefined 
                ? listenerWish.group_size 
                : '-'; // Или '- (не указано)'
            } else {
              // console.log(`[Желаемое кол-во VG] Активное пожелание для слушателя ID ${listenerId} не найдено.`);
              return '-';
            }
          },
          minWidth: 80, // Можно настроить ширину
          flex: 0.5,     // Меньший flex
          tooltipField: 'id', // Чтобы при наведении можно было видеть ID, если нужно
          tooltipValueGetter: params => { // Кастомный тултип, если нужно больше информации
             if (!params.data || params.data.id == null) return '';
             const listenerId = params.data.id;
             const listenerWishStore = useListener_WishStore();
             const wishes = listenerWishStore.listener_wishList || [];
             const listenerWish = wishes.find(wish => wish.listener_id === listenerId && wish.deleted_at === null);
             if (listenerWish) {
                 return `Слушатель ID: ${listenerId}\nЖелаемый размер группы: ${listenerWish.group_size !== null && listenerWish.group_size !== undefined ? listenerWish.group_size : 'Не указано'}`;
             }
             return `Слушатель ID: ${listenerId}\nПожелание по размеру группы не найдено.`;
          }
        }
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

      tableData,
      addRow,
      removeRow,
      

      gridApiSuitable, 
      gridApiGroup,   
      onGridReadySuitable, 
      onGridReadyGroup,    

      newGroupListenerIds,
      listenergroup,
      groupListenersRowData,
      loadL_Group_StatusData,

      ignoreCountWish,       
      ignoreScheduleWish,
      isScheduleFilterActive,
      scheduleFilterCriteria,    
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
      originalGroupListenerIds: new Set(),
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
    "getReady_ListenerList",
    "syncGroupListeners"
  ]),
  ...mapActions(useListener_WishStore, [
      "getListener_WishList",
    ]),
    ...mapActions(useL_Group_Wish_DayStore, [ 
      "getL_Group_Wish_DayList",
      "syncGroupWishDays", 
    ]),
    ...mapActions(useL_Wish_DayStore, [
      "getL_Wish_DayList",
      "postL_Wish_Day",
      "putL_Wish_Day",
      "deleteL_Wish_Day",
      "syncWishDays",
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
    findSuitableListeners() {
  this.isScheduleFilterActive = !this.isScheduleFilterActive; 

  if (this.isScheduleFilterActive) {
    console.log("Кнопка 'Подобрать' НАЖАТА. Фильтр по расписанию АКТИВИРОВАН.");
    const currentScheduleForFilter = JSON.parse(JSON.stringify(this.tableData || []));
    this.scheduleFilterCriteria = {
        schedule: currentScheduleForFilter,
    };
  } else {
    console.log("Кнопка 'Подобрать' ОТЖАТА. Фильтр по расписанию ДЕАКТИВИРОВАН.");
    this.scheduleFilterCriteria = null; 
  }
},

    resetLgr() {
      console.trace("resetLgr CALLED");
      this.listenergroup = new Listenergroup();
      this.errors = {};
      this.creatingProgram = '';
      this.creatingProgramId = null;
      this.tableData.splice(0, this.tableData.length);
      
      // Очищаем newGroupListenerIds (если он в data, если в setup, то this.newGroupListenerIds.value.clear())
      // Судя по коду, newGroupListenerIds - это ref из setup, и Vue Options API должен дать к нему доступ
      if (this.newGroupListenerIds && typeof this.newGroupListenerIds.clear === 'function') {
        this.newGroupListenerIds.clear();
      } else if (this.newGroupListenerIds && this.newGroupListenerIds.value && typeof this.newGroupListenerIds.value.clear === 'function') {
         // Если это ref, доступный через .value в Options API (менее вероятно для прямого this.newGroupListenerIds)
        this.newGroupListenerIds.value.clear();
      }


      this.justMovedFromGroupIds.clear();
      this.originalGroupListenerIds.clear(); // <<<<==== ОЧИСТКА ЗДЕСЬ
      this.scheduleFilterCriteria = null;
    },

     edit(event) {
      this.resetLgr(); // resetLgr() уже вызовет originalGroupListenerIds.clear()
      this.listenergroup = { ...event.data }; 

      const selectedProgramId = this.listenergroup.group_program_id;
      console.log('[edit] selectedProgramId:', selectedProgramId);

      if (!selectedProgramId && selectedProgramId !== 0) {
        console.error("[edit] Ошибка: group_program_id не установлен. Невозможно продолжить.");
        // this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Отсутствует ID программы у группы.', life: 5000 });
        return;
      }
      // ... логика установки creatingProgram, creatingProgramId ...
      const programStore = useProgramStore();
      const programMap = programStore.programMap;
      let programName = 'Не найдена';
      if (programMap && programMap[selectedProgramId]) {
        programName = programMap[selectedProgramId].program_name;
      }
      this.creatingProgram = programName;
      this.creatingProgramId = selectedProgramId;


      const groupId = this.listenergroup.id;
      if (groupId) {
          // const listenerStore = useListenerStore(); // Уже есть через mapActions или setup
          this.listenerList.forEach(listener => { // Предполагаем, что listenerList доступен как this.listenerList (из mapState)
              if (listener.group_ids && Array.isArray(listener.group_ids) && listener.group_ids.includes(groupId)) {
                  this.originalGroupListenerIds.add(listener.id);
              }
          });
      }
      console.log('[edit] Исходные ID слушателей для группы', groupId, ':', Array.from(this.originalGroupListenerIds));
      
      // Загрузка существующего расписания для группы
      // l_group_wish_dayList должен быть доступен через mapState или получен ранее
      const groupScheduleRaw = this.l_group_wish_dayList.filter(
        (wish) => wish.l_group_id === this.listenergroup.id && !wish.deleted_at // Фильтруем по ID группы и не удаленные
      );
      console.log('[edit] Найдено существующее расписание для группы ID', this.listenergroup.id, ':', JSON.parse(JSON.stringify(groupScheduleRaw)));

      // Заполняем tableData экземплярами L_Group_Wish_Day
      this.tableData.splice(0, this.tableData.length, ...groupScheduleRaw.map(item => new L_Group_Wish_Day(item)));
      console.log('[edit] tableData после загрузки существующего расписания (длина):', this.tableData.length);
      console.log('[edit] tableData после загрузки (содержимое):', JSON.parse(JSON.stringify(this.tableData)));

      this.showAddSidebar = true;
      console.log('[edit] showAddSidebar установлен в true.');
    },

    async submit() {
      console.log('--- SUBMIT FUNCTION CALLED ---');
      // 1. Подготовка данных группы и расписания
      let groupToSubmit = JSON.parse(JSON.stringify(this.listenergroup)); // Глубокая копия данных группы из формы
      let scheduleToSubmit = JSON.parse(JSON.stringify(this.tableData)).map(item => {
        // Если это существующая группа и l_group_id в расписании почему-то не совпадает, корректируем
        if (groupToSubmit.id && item.l_group_id !== groupToSubmit.id) {
          item.l_group_id = groupToSubmit.id;
        }
        // Для новых записей в новой группе l_group_id будет установлен позже
        return item;
      });

      console.log('[submit] Данные группы для отправки:', JSON.parse(JSON.stringify(groupToSubmit)));
      console.log('[submit] Данные расписания для отправки:', JSON.parse(JSON.stringify(scheduleToSubmit)));

      // 2. Определение ID группы для синхронизации слушателей и исходного списка слушателей
      let groupIdForSyncOperations = groupToSubmit.id; // Изначально ID существующей группы
      
      // Ключевой момент: копируем originalGroupListenerIds ДО любых операций, которые могут их изменить или сбросить
      const initialListenerIdsForGroupSync = new Set(this.originalGroupListenerIds); 
      console.log('[submit] ИСХОДНЫЕ слушатели (до изменений UI) для группы', groupIdForSyncOperations || 'НОВАЯ ГРУППА', ':', Array.from(initialListenerIdsForGroupSync));

      let finalListenerIdsSetForSync; // Сюда запишем финальный набор ID слушателей из UI

      try {
        // 3. Сохранение/обновление основной информации о группе и ее расписания
        if (groupToSubmit.id) { // РЕДАКТИРОВАНИЕ СУЩЕСТВУЮЩЕЙ ГРУППЫ
          console.log(`[submit] Режим обновления. Группа ID: ${groupToSubmit.id}`);
          
          // 3.1 Обновляем группу
          await this.putListenergroup(groupToSubmit);
          console.log('[submit] putListenergroup завершен.');

          // 3.2 Синхронизируем расписание группы
          console.log(`[submit] Вызов syncGroupWishDays для группы ID: ${groupToSubmit.id}`);
          await this.syncGroupWishDays(groupToSubmit.id, scheduleToSubmit);
          console.log('[submit] syncGroupWishDays завершен.');

          // 3.3 Определяем финальный список слушателей для существующей группы
          // groupListenersInOpenGroup (computed) должен отражать текущее состояние слушателей в UI
          finalListenerIdsSetForSync = new Set(this.groupListenersInOpenGroup.map(l => l.id));
          console.log('[submit] ФИНАЛЬНЫЕ слушатели (после изменений UI) для группы', groupToSubmit.id, ':', Array.from(finalListenerIdsSetForSync));

        } else { // СОЗДАНИЕ НОВОЙ ГРУППЫ
          console.log('[submit] Режим создания новой группы.');
          
          // 3.1 Создаем группу, чтобы получить ее ID
          const newGroupResponse = await this.postListenergroup(groupToSubmit);
          console.log('[submit] postListenergroup завершен. Создана группа:', JSON.parse(JSON.stringify(newGroupResponse)));

          if (newGroupResponse && newGroupResponse.id) {
            const newGroupId = newGroupResponse.id;
            groupIdForSyncOperations = newGroupId; // Обновляем ID для последующих операций

            // 3.2 Обновляем l_group_id в записях расписания для новой группы
            const scheduleForNewGroup = scheduleToSubmit.map(entry => ({
              ...entry,
              l_group_id: newGroupId, // Устанавливаем ID созданной группы
              l_group_wish_day_id: null // Явно для создания
            }));
            
            // 3.3 Синхронизируем расписание для новой группы
            console.log(`[submit] Вызов syncGroupWishDays для новой группы ID: ${newGroupId}`);
            await this.syncGroupWishDays(newGroupId, scheduleForNewGroup);
            console.log('[submit] syncGroupWishDays для новой группы завершен.');
            
            // 3.4 Определяем финальный список слушателей для новой группы
            // this.newGroupListenerIds (Set или ref(Set)) содержит ID слушателей, добавленных в новую группу в UI
            finalListenerIdsSetForSync = new Set(this.newGroupListenerIds); 
            // Если newGroupListenerIds - это ref(Set), и вы обращаетесь к нему как this.newGroupListenerIds.value в setup,
            // то в Options API это может быть this.newGroupListenerIds.value или просто this.newGroupListenerIds
            // Проверьте, как вы его используете в методах moveSelectedToGroup и т.д.
            // Обычно Vue "разворачивает" ref из setup для `this` в Options API.
            console.log('[submit] ФИНАЛЬНЫЕ слушатели (после изменений UI) для НОВОЙ группы', newGroupId, ':', Array.from(finalListenerIdsSetForSync));

          } else {
            console.error('[submit] Ошибка: не удалось создать группу или получить ее ID.');
            // this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать группу.', life: 3000 });
            return; // Выходим, если не удалось создать группу
          }
        }

        // 4. Синхронизация слушателей группы (добавление/удаление)
        if (groupIdForSyncOperations && finalListenerIdsSetForSync !== undefined) {
          console.log(`[submit] Вызов syncGroupListeners для группы ID: ${groupIdForSyncOperations}.`);
          // Предполагается, что syncGroupListeners доступен через this (mapActions или прямое определение)
          await this.syncGroupListeners(
            groupIdForSyncOperations,
            finalListenerIdsSetForSync,
            initialListenerIdsForGroupSync // Передаем ИСХОДНЫЙ набор ID
          );
          console.log('[submit] syncGroupListeners завершен.');
        } else {
          console.warn('[submit] Пропуск syncGroupListeners: ID группы или финальный список слушателей не определены.', { 
            groupId: groupIdForSyncOperations, 
            finalListeners: finalListenerIdsSetForSync 
          });
        }
        
      } catch (error) {
        console.error('[submit] Произошла ошибка во время процесса сохранения:', error);
        // this.$toast.add({ severity: 'error', summary: 'Ошибка сохранения', detail: error.message || 'Произошла ошибка.', life: 5000 });
        return; // Прерываем выполнение, чтобы не сбрасывать форму и не закрывать сайдбар
      }

      // 5. Завершение и очистка
      this.showAddSidebar = false;
      this.showGenAddSidebar = false;
      this.resetLgr(); // Сбрасывает форму, tableData, newGroupListenerIds, originalGroupListenerIds и т.д.
      
      // 6. Обновление данных в UI
      try {
        await this.getL_Group_Wish_DayList(); // Перезагружаем расписания всех групп
        this.loadListenergroupData();         // Перезагружаем список групп для основной таблицы
        // Если listenerList (список всех слушателей) не обновляется автоматически после syncGroupListeners
        // (например, если syncGroupListeners не делает this.getListenerList()),
        // и вам нужно немедленно видеть обновленные group_ids слушателей, то раскомментируйте:
        // await this.getListenerList(); 
      } catch (loadError) {
        console.error('[submit] Ошибка при перезагрузке данных после сохранения:', loadError);
      }
      
      // this.$toast.add({ severity: 'success', summary: 'Успешно', detail: 'Данные группы сохранены!', life: 3000 });
      console.log('--- SUBMIT FUNCTION SUCCESSFULLY COMPLETED ---');
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
   try {
       await Promise.all([
          this.getListenergroupList(),
          this.getProgramList(),
          this.getListenerList(),
          this.getListener_WishList(),
          this.getL_Group_StatusList(),
          this.getL_Ready_GroupList(),
          this.getDayList(),
          this.getL_Wish_DayList(),
          this.getL_Group_Wish_DayList(),
       ]);
       console.log("Initial data fetched successfully.");
       await this.loadDaysData();
       console.log('После fetchInitialData, this.dayList из стора:', JSON.parse(JSON.stringify(this.dayList)));
      console.log('После fetchInitialData, this.days локально:', JSON.parse(JSON.stringify(this.days)));
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
      console.log('[addRowInWishForm] Called. Current listenergroup.id:', this.listenergroup.id);
      // Передаем текущий ID группы (может быть null, если группа новая)
      // L_Group_Wish_Day конструктор установит это в l_group_id
      this.addRow(this.listenergroup.id || null);
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
    async openAddSidebar() { 
  const currentListenerGroup = this.listenergroup; // В Options API this.listenergroup уже развернутый ref

  const selectedProgramIdFromForm = currentListenerGroup.group_program_id;
  console.log(`[openAddSidebar] Called. Listenergroup ID: ${currentListenerGroup.id}`);
  console.log(`[openAddSidebar] listenergroup.group_program_id from form: ${selectedProgramIdFromForm}`);

  if (!selectedProgramIdFromForm && selectedProgramIdFromForm !== 0) { // Проверяем на null/undefined, 0 - валидный ID
    console.error("[openAddSidebar] Ошибка: Невозможно продолжить без выбранной программы! (selectedProgramIdFromForm is falsy or not 0)");
    // Можно добавить пользовательское уведомление
    // this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Сначала выберите программу!', life: 3000 });
    return;
  }

  const programStore = useProgramStore();
  const programMap = programStore.programMap;
  let programName = 'Не найдена';

  if (programMap && programMap[selectedProgramIdFromForm]) {
    programName = programMap[selectedProgramIdFromForm].program_name;
  } else {
    console.warn(`[openAddSidebar] Программа с ID ${selectedProgramIdFromForm} не найдена в programMap.`);
  }

  console.log(`[openAddSidebar] Переход к созданию группы для программы: "${programName}" (ID: ${selectedProgramIdFromForm})`);
  this.creatingProgram = programName;
  this.creatingProgramId = selectedProgramIdFromForm; // Это присвоение ключевое

  console.log(`[openAddSidebar] FINISHED: this.creatingProgramId SET TO: ${this.creatingProgramId}, this.creatingProgram NAME: ${this.creatingProgram}`);
  console.log(`[openAddSidebar] this.listenergroup.id at this point: ${currentListenerGroup.id}`);

  // Можно попробовать с this.$nextTick, чтобы убедиться, что данные обновились до показа сайдбара,
  // хотя обычно это не требуется для простых присвоений data-свойств.
  // await this.$nextTick(); 
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
    const currentGroupId = this.listenergroup.id; // this.listenergroup is the ref, so .value in setup, .id in methods/template
    
    if (!this.gridApiSuitable) {
       console.error("API таблицы 'Подходящие слушатели' не готово.");
       return;
    }
    const selectedNodes = this.gridApiSuitable.getSelectedNodes();
    if (!selectedNodes || selectedNodes.length === 0) {
      console.log("Нет выбранных слушателей для перемещения.");
      return;
    }

    if (!currentGroupId) { // CREATING NEW GROUP
        console.log(`Перемещение ${selectedNodes.length} слушателей в НОВУЮ (несохраненную) группу.`);
        selectedNodes.forEach(node => {
            const listenerData = node.data;
            if (!listenerData || !listenerData.id) return;
            this.newGroupListenerIds.add(listenerData.id);
            console.log(` - Слушатель ID ${listenerData.id} добавлен в список для новой группы.`);
        });
    } else { // EDITING EXISTING GROUP
        console.log(`Перемещение ${selectedNodes.length} слушателей в группу ID: ${currentGroupId}`);
        selectedNodes.forEach(node => {
          const listenerData = node.data;
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
    }
    this.gridApiSuitable.deselectAll();
    console.log("Перемещение в группу завершено.");
},

moveAllToGroup() {
    const currentGroupId = this.listenergroup.id;
    if (!this.gridApiSuitable) {
       console.error("API таблицы 'Подходящие слушатели' не готово.");
       return;
    }
    const allSuitableListenersData = [];
    this.gridApiSuitable.forEachNode(node => {
        if(node.data) {
            allSuitableListenersData.push(node.data);
        }
    });

    if (allSuitableListenersData.length === 0) {
        console.log("Нет слушателей в списке 'Подходящие' для перемещения.");
        return;
    }

    if (!currentGroupId) { // CREATING NEW GROUP
        console.log(`Перемещение ВСЕХ (${allSuitableListenersData.length}) слушателей в НОВУЮ (несохраненную) группу.`);
        allSuitableListenersData.forEach(listenerData => {
            if (!listenerData || !listenerData.id) return;
            this.newGroupListenerIds.add(listenerData.id);
            console.log(` - Слушатель ID ${listenerData.id} добавлен в список для новой группы.`);
        });
    } else { // EDITING EXISTING GROUP
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
    }
    console.log("Перемещение всех в группу завершено.");
},

moveSelectedFromGroup() {
    const currentGroupId = this.listenergroup.id;
    if (!this.gridApiGroup) {
       console.error("API таблицы 'Слушатели в группе' не готово.");
       return;
    }
    const selectedNodes = this.gridApiGroup.getSelectedNodes();
    if (!selectedNodes || selectedNodes.length === 0) {
      console.log("Нет выбранных слушателей для удаления из группы.");
      return;
    }

    if (!currentGroupId) { // CREATING NEW GROUP
        console.log(`Удаление ${selectedNodes.length} слушателей из списка НОВОЙ (несохраненной) группы.`);
        selectedNodes.forEach(node => {
            const listenerData = node.data;
            if (!listenerData || !listenerData.id) return;
            this.newGroupListenerIds.delete(listenerData.id);
            // For "create" mode, justMovedFromGroupIds might not be strictly necessary
            // or would need its own temporary counterpart. For now, removing from newGroupListenerIds
            // will make them re-evaluate for the "suitable" list based on program.
            console.log(` - Слушатель ID ${listenerData.id} удален из списка для новой группы.`);
        });
    } else { // EDITING EXISTING GROUP
        console.log(`Удаление ${selectedNodes.length} слушателей из группы ID: ${currentGroupId}`);
        selectedNodes.forEach(node => {
          const listenerData = node.data;
          if (!listenerData || !listenerData.id) return;

          const originalListener = this.findOriginalListener(listenerData.id);
          if (originalListener && Array.isArray(originalListener.group_ids)) {
            const index = originalListener.group_ids.indexOf(currentGroupId);
            if (index > -1) {
              originalListener.group_ids.splice(index, 1);
              console.log(` - У слушателя ${originalListener.id} удалена группа ${currentGroupId}`);
              this.justMovedFromGroupIds.add(listenerData.id); // For existing groups
            }
          } else {
              console.warn(`Не найден оригинальный слушатель с ID ${listenerData.id} или у него нет group_ids.`);
          }
        });
    }
    this.gridApiGroup.deselectAll();
    console.log("Удаление из группы завершено.");
},

moveAllFromGroup() {
    const currentGroupId = this.listenergroup.id;
    if (!this.gridApiGroup) {
       console.error("API таблицы 'Слушатели в группе' не готово.");
       return;
    }
    const allGroupListenersData = [];
    this.gridApiGroup.forEachNode(node => {
        if(node.data) {
            allGroupListenersData.push(node.data);
        }
    });

    if (allGroupListenersData.length === 0) {
        console.log("Нет слушателей в группе для удаления.");
        return;
    }

    if (!currentGroupId) { // CREATING NEW GROUP
        console.log(`Удаление ВСЕХ (${allGroupListenersData.length}) слушателей из списка НОВОЙ (несохраненной) группы.`);
        allGroupListenersData.forEach(listenerData => {
            if (!listenerData || !listenerData.id) return;
            this.newGroupListenerIds.delete(listenerData.id);
            console.log(` - Слушатель ID ${listenerData.id} удален из списка для новой группы.`);
        });
    } else { // EDITING EXISTING GROUP
        console.log(`Удаление ВСЕХ (${allGroupListenersData.length}) слушателей из группы ID: ${currentGroupId}`);
        allGroupListenersData.forEach(listenerData => {
            if (!listenerData || !listenerData.id) return;
            const originalListener = this.findOriginalListener(listenerData.id);
            if (originalListener && Array.isArray(originalListener.group_ids)) {
                const index = originalListener.group_ids.indexOf(currentGroupId);
                if (index > -1) {
                  originalListener.group_ids.splice(index, 1);
                  console.log(` - У слушателя ${originalListener.id} удалена группа ${currentGroupId}`);
                  this.justMovedFromGroupIds.add(listenerData.id); // For existing groups
                }
            } else {
                  console.warn(`Не найден оригинальный слушатель с ID ${listenerData.id} или у него нет group_ids.`);
            }
        });
    }
    console.log("Удаление всех из группы завершено.");
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
    ...mapState(useL_Group_Wish_DayStore, ["l_group_wish_dayList"]),
    ...mapState(useDayStore, ["dayList"]),

    baseSuitableListeners() {
    console.log("%c[baseSuitableListeners] Вызвано", "color: orange; font-weight: bold;");
    const allListeners = this.listenerList || [];
    const selectedProgramId = this.creatingProgramId;
    const currentGroupId = this.listenergroup.id;

    // ... (здесь логика из вашего предыдущего suitableListeners, НО БЕЗ ФИЛЬТРАЦИИ ПО РАСПИСАНИЮ) ...
    // Пример:
    let filteredListeners;
    if (!currentGroupId) { // CREATING A NEW GROUP
        if (!selectedProgramId && selectedProgramId !== 0) {
             return [];
        }
        filteredListeners = allListeners.filter(listener => {
            const isNotDeleted = listener.deleted_at === null;
            const isNotInNewGroupList = !this.newGroupListenerIds.has(listener.id);
            const hasValidProgramIds = listener.program_ids && Array.isArray(listener.program_ids);
            const hasSelectedProgram = hasValidProgramIds && listener.program_ids.includes(selectedProgramId);
            return isNotDeleted && isNotInNewGroupList && hasSelectedProgram;
        });
    } else { // EDITING AN EXISTING GROUP
        filteredListeners = allListeners.filter(listener => {
            const isNotDeleted = listener.deleted_at === null;
            const hasValidGroupIds = listener.group_ids && Array.isArray(listener.group_ids);
            const isNotInCurrentGroup = !hasValidGroupIds || !listener.group_ids.includes(currentGroupId);
            const wasJustMoved = this.justMovedFromGroupIds.has(listener.id);
            const hasValidProgramIds = listener.program_ids && Array.isArray(listener.program_ids);
            const hasSelectedProgram = hasValidProgramIds && listener.program_ids.includes(selectedProgramId);
            return isNotDeleted && (isNotInCurrentGroup || wasJustMoved) && hasSelectedProgram;
        });
    }
    const sortedListeners = filteredListeners.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    console.log(`[baseSuitableListeners] Найдено слушателей (базовая фильтрация): ${sortedListeners.length}`);
    return sortedListeners;
  },

  displayedSuitableListeners() {
    console.log("%c[displayedSuitableListeners] Вызвано", "color: purple; font-weight: bold;");
    let listenersToDisplay = [...this.baseSuitableListeners]; // Копируем базовый список

    if (this.scheduleFilterCriteria) { // Если кнопка "Подобрать" была нажата
      console.log("[displayedSuitableListeners] Применяются сохраненные критерии фильтрации по расписанию:", JSON.parse(JSON.stringify(this.scheduleFilterCriteria))); // Логируем копию
      const { schedule: groupScheduleEntries, ignore: ignoreSchedule } = this.scheduleFilterCriteria;
      const allListenerWishes = this.l_wish_dayList || [];
      console.log("[displayedSuitableListeners] ВСЕ ЗАГРУЖЕННЫЕ ПОЖЕЛАНИЯ (this.l_wish_dayList):", JSON.parse(JSON.stringify(allListenerWishes))); // Логируем все пожелания

      const hasValidGroupSchedule = groupScheduleEntries.some(
          entry => entry.day_id != null && entry.starttime && entry.endtime
      );

      if (!ignoreSchedule && hasValidGroupSchedule) {
        console.log("[displayedSuitableListeners] Применяется фильтрация по сохраненному расписанию.");
        listenersToDisplay = listenersToDisplay.filter(listener => {
          console.log(`[displayedSuitableListeners] --- Проверка слушателя ID: ${listener.id}, ФИО: ${listener.full_name} ---`);
          const listenerWishes = allListenerWishes.filter(w => w.listener_id === listener.id);
          
          // Логируем пожелания текущего слушателя
          console.log(`[displayedSuitableListeners] Пожелания слушателя ID ${listener.id}:`, JSON.parse(JSON.stringify(listenerWishes)));
          // Логируем расписание группы (оно одинаково для всех слушателей на этой итерации)
          // console.log(`[displayedSuitableListeners] Расписание группы для сравнения:`, JSON.parse(JSON.stringify(groupScheduleEntries))); // Можно закомментировать, если уже выведено выше

          if (!listenerWishes.length && groupScheduleEntries.length > 0) {
            console.log(`[displayedSuitableListeners] Слушатель ID ${listener.id} не подходит: нет пожеланий, а у группы есть расписание.`);
            return false;
          }
          if (listenerWishes.length === 0 && groupScheduleEntries.length === 0) {
            console.log(`[displayedSuitableListeners] Слушатель ID ${listener.id} подходит: нет ни пожеланий, ни расписания у группы.`);
            return true;
          }
          if (groupScheduleEntries.length === 0) {
              console.log(`[displayedSuitableListeners] Слушатель ID ${listener.id} подходит: у группы нет расписания.`);
              return true;
          }

          // Каждая ЗАПОЛНЕННАЯ запись в расписании группы должна быть покрыта ХОТЯ БЫ ОДНИМ пожеланием слушателя
          const listenerMatchesAllGroupEntries = groupScheduleEntries.every(groupEntry => {
            // Логируем текущую запись из расписания группы
            console.log(`[displayedSuitableListeners] Сравнение для слушателя ID ${listener.id} с записью группы:`, JSON.parse(JSON.stringify(groupEntry)));

            if (groupEntry.day_id == null || !groupEntry.starttime || !groupEntry.endtime) {
              console.log(`[displayedSuitableListeners] Запись группы неполная, считаем пройденной для слушателя ID ${listener.id}.`);
              return true; // Неполную запись в расписании группы игнорируем
            }

            const matchFoundForGroupEntry = listenerWishes.some(wish => {
              // ----- НАЧАЛО ИЗМЕНЕНИЙ -----
              function timeToMinutes(timeStr) {
                if (!timeStr || typeof timeStr !== 'string') return -1; // Обработка некорректных данных
                const parts = timeStr.split(':');
                if (parts.length < 2) return -1; // Обработка некорректных данных
                return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
              }

              const wishStartMinutes = timeToMinutes(wish.starttime);
              const wishEndMinutes = timeToMinutes(wish.endtime);
              const groupStartMinutes = timeToMinutes(groupEntry.starttime);
              const groupEndMinutes = timeToMinutes(groupEntry.endtime);

              if (wishStartMinutes === -1 || wishEndMinutes === -1 || groupStartMinutes === -1 || groupEndMinutes === -1) {
                  console.warn(`[displayedSuitableListeners] Ошибка парсинга времени для wish:`, wish, `или groupEntry:`, groupEntry);
                  return false; 
              }

              const isMatch = wish.day_id === groupEntry.day_id &&
                              wishStartMinutes <= groupStartMinutes &&
                              wishEndMinutes >= groupEndMinutes;
              
              if (isMatch) {
                console.log(`[displayedSuitableListeners] НАЙДЕНО СООТВЕТСТВИЕ для слушателя ID ${listener.id}: пожелание`, JSON.parse(JSON.stringify(wish)), `покрывает запись группы.`);
              }
              return isMatch;
            });

            if (!matchFoundForGroupEntry) {
              console.log(`[displayedSuitableListeners] НЕТ СООТВЕТСТВИЯ для слушателя ID ${listener.id}: ни одно пожелание не покрывает запись группы`, JSON.parse(JSON.stringify(groupEntry)));
            }
            return matchFoundForGroupEntry;
          });

          if (listenerMatchesAllGroupEntries) {
            console.log(`[displayedSuitableListeners] Слушатель ID ${listener.id} ПОДХОДИТ по всем записям расписания группы.`);
          } else {
            console.log(`[displayedSuitableListeners] Слушатель ID ${listener.id} НЕ ПОДХОДИТ (не все записи расписания группы покрыты).`);
          }
          return listenerMatchesAllGroupEntries;
        });
      } else {
        if (ignoreSchedule) console.log("[displayedSuitableListeners] Фильтрация по сохраненному расписанию ОТКЛЮЧЕНА (чекбокс в критериях).");
        if (!hasValidGroupSchedule) console.log("[displayedSuitableListeners] Фильтрация по сохраненному расписанию не применяется (нет валидных записей в сохраненном расписании группы).");
      }
    } else {
      console.log("[displayedSuitableListeners] Критерии фильтрации по расписанию не установлены. Показываем baseSuitableListeners.");
    }
    console.log(`[displayedSuitableListeners] Итого слушателей для отображения: ${listenersToDisplay.length}`);
    return listenersToDisplay;
  },
    
    groupListenersInOpenGroup() {
    console.log("%c[groupListenersInOpenGroup] Вызвано", "color: blue; font-weight: bold;");
    const allListeners = this.listenerList || [];
    const currentGroupId = this.listenergroup.id; // Accessing .id directly as it's a ref from setup

    console.log(`[groupListenersInOpenGroup] ID текущей группы для фильтрации: ${currentGroupId}`);

    let filteredListeners;

    if (!currentGroupId) { // CREATING A NEW GROUP (NO ID YET)
        console.log("[groupListenersInOpenGroup] Режим создания новой группы. Фильтрация по newGroupListenerIds.");
        console.log("[groupListenersInOpenGroup] newGroupListenerIds:", Array.from(this.newGroupListenerIds));
        filteredListeners = allListeners.filter(listener => {
            const isNotDeleted = listener.deleted_at === null;
            const isInNewGroupList = this.newGroupListenerIds.has(listener.id);
            // Debug specific listener
            // if (listener.id === 54) {
            //    console.log(`[groupListenersInOpenGroup - NEW] Listener ID ${listener.id}: isNotDeleted=${isNotDeleted}, isInNewGroupList=${isInNewGroupList}`);
            // }
            return isNotDeleted && isInNewGroupList;
        });
    } else { // EDITING AN EXISTING GROUP
        console.log("[groupListenersInOpenGroup] Режим редактирования существующей группы. Фильтрация по listener.group_ids.");
        filteredListeners = allListeners.filter(listener => {
            const isNotDeleted = listener.deleted_at === null;
            const hasValidGroupIds = listener.group_ids && Array.isArray(listener.group_ids);
            const isInCurrentGroup = hasValidGroupIds && listener.group_ids.includes(currentGroupId);
            // Debug specific listener
            // if (listener.id === 54) {
            //     console.log(`[groupListenersInOpenGroup - EDIT] Listener ID ${listener.id}: isNotDeleted=${isNotDeleted}, hasValidGroupIds=${hasValidGroupIds}, isInCurrentGroup=${isInCurrentGroup}`);
            // }
            return isNotDeleted && isInCurrentGroup;
        });
    }

    const sortedListeners = filteredListeners.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    console.log(`[groupListenersInOpenGroup] Найдено слушателей в группе: ${sortedListeners.length}`);
    return sortedListeners;
},

suitableListeners() {
    console.log("%c[suitableListeners] Вызвано", "color: green; font-weight: bold;");
    const allListeners = this.listenerList || [];
    const selectedProgramId = this.creatingProgramId;
    const currentGroupId = this.listenergroup.id; // В Options API this.listenergroup - это уже развернутый ref
    
    // Расписание текущей формируемой/редактируемой группы
    const groupScheduleEntries = this.tableData || [];
    const allListenerWishes = this.l_wish_dayList || [];

    console.log(`[suitableListeners] ID выбранной программы: ${selectedProgramId}`);
    console.log(`[suitableListeners] ID текущей группы: ${currentGroupId}`);
    console.log(`[suitableListeners] Расписание группы для фильтрации:`, JSON.parse(JSON.stringify(groupScheduleEntries)));
    console.log(`[suitableListeners] Игнорировать расписание (чекбокс): ${this.ignoreScheduleWish}`);

    let filteredListeners;

    // Базовая фильтрация (программа, не в группе и т.д.)
    if (!currentGroupId) { // CREATING A NEW GROUP
      console.log("[suitableListeners] Режим создания новой группы.");
      if (!selectedProgramId && selectedProgramId !== 0) { // 0 может быть валидным ID
        console.warn("[suitableListeners] Нет выбранной программы для новой группы, подходящих слушателей не будет.");
        return [];
      }
      filteredListeners = allListeners.filter(listener => {
        const isNotDeleted = listener.deleted_at === null;
        const isNotInNewGroupList = !this.newGroupListenerIds.has(listener.id); // newGroupListenerIds из setup
        const hasValidProgramIds = listener.program_ids && Array.isArray(listener.program_ids);
        const hasSelectedProgram = hasValidProgramIds && listener.program_ids.includes(selectedProgramId);
        return isNotDeleted && isNotInNewGroupList && hasSelectedProgram;
      });
    } else { // EDITING AN EXISTING GROUP
      console.log("[suitableListeners] Режим редактирования существующей группы.");
      filteredListeners = allListeners.filter(listener => {
        const isNotDeleted = listener.deleted_at === null;
        const hasValidGroupIds = listener.group_ids && Array.isArray(listener.group_ids);
        const isNotInCurrentGroup = !hasValidGroupIds || !listener.group_ids.includes(currentGroupId);
        const wasJustMoved = this.justMovedFromGroupIds.has(listener.id);
        const hasValidProgramIds = listener.program_ids && Array.isArray(listener.program_ids);
        // Для существующей группы, программа уже зафиксирована, но для "подходящих" можно проверять,
        // если вдруг логика позволяет добавлять из других программ (хотя обычно нет).
        // Здесь selectedProgramId берется из this.creatingProgramId, которое устанавливается при открытии сайдбара редактирования.
        const hasSelectedProgram = hasValidProgramIds && listener.program_ids.includes(selectedProgramId);

        // Слушатель подходит, если он не удален, не в текущей группе (ИЛИ только что удален оттуда), И имеет нужную программу.
        return isNotDeleted && (isNotInCurrentGroup || wasJustMoved) && hasSelectedProgram;
      });
    }

    // Фильтрация по расписанию, если НЕ стоит галочка "игнорировать расписание"
    // и если в расписании группы есть хотя бы одна валидная запись
    const hasValidGroupSchedule = groupScheduleEntries.some(
        entry => entry.day_id != null && entry.starttime && entry.endtime
    );

    if (!this.ignoreScheduleWish && hasValidGroupSchedule) {
      console.log("[suitableListeners] Применяется фильтрация по расписанию.");
      filteredListeners = filteredListeners.filter(listener => {
        const listenerWishes = allListenerWishes.filter(w => w.listener_id === listener.id);

        if (!listenerWishes.length) { // Если у слушателя вообще нет пожеланий, он не подходит
          return false;
        }

        // Каждая ЗАПОЛНЕННАЯ запись в расписании группы должна быть покрыта ХОТЯ БЫ ОДНИМ пожеланием слушателя
        return groupScheduleEntries.every(groupEntry => {
          // Если запись в расписании группы неполная, пропускаем ее (или считаем, что слушатель ей не соответствует)
          if (groupEntry.day_id == null || !groupEntry.starttime || !groupEntry.endtime) {
            return true; // или false, в зависимости от того, как обрабатывать неполные строки расписания группы
          }

          return listenerWishes.some(wish => {
            // Проверяем, что пожелание слушателя полностью покрывает временной слот группы
            return wish.day_id === groupEntry.day_id &&
                   wish.starttime <= groupEntry.starttime &&
                   wish.endtime >= groupEntry.endtime;
          });
        });
      });
    } else {
        if(this.ignoreScheduleWish) console.log("[suitableListeners] Фильтрация по расписанию ОТКЛЮЧЕНА (чекбокс).");
        if(!hasValidGroupSchedule) console.log("[suitableListeners] Фильтрация по расписанию не применяется (нет валидных записей в расписании группы).");
    }

    const sortedListeners = filteredListeners.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    console.log(`[suitableListeners] Найдено подходящих слушателей (после всех фильтров): ${sortedListeners.length}`);
    return sortedListeners;
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
  grid-template-columns: repeat(3, 1fr);
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

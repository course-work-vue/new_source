<template>
  <div class="col col-xs-9 col-lg-12 mt-4 list">
    <div class="col col-12">
      <div class="mb-3 col col-12">
        <div class="col col-6 float-start d-inline-flex align-items-center mb-2">
          <button
            @click="openSidebar"
            class="btn btn-primary me-2 float-start"
            type="button"
          >
            <i class="material-icons-outlined"></i>Создать пустую группу
          </button>
          <button
            @click="openAddSidebar"
            class="btn btn-primary float-start"
            type="button"
            :disabled="canClickButton"
          >
            <i class="material-icons-outlined">add</i>Сформировать группу
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
            @input="onFilterTextBoxChanged"
            placeholder="Поиск..."
          />
        </div>
      </div>
    </div>

    <div style="height: 95vh">
      <div class="h-100 pt-5">
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 100%;"
          :columnDefs="columnDefs.value"
          :rowData="rowData.value"
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
      <Button
        class="btn btn-primary float-end"
        v-if="listenergroup.id"
        @click="deleteLgr"
      >
        Удалить
      </Button>
    </Sidebar>

    <Sidebar
      v-model:visible="showAddSidebar"
      position="bottom"
      modal
      :header="`Создать группу по программе ${creatingProgram}`"
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

      <div style="height: 30vh">
        <div class="h-100 pt-5">
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 100%;"
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

      <Button class="btn btn-primary float-start" @click="submit">
        Сохранить
      </Button>
      <Button
        class="btn btn-primary float-end"
        v-if="listenergroup.id"
        @click="deleteLgr"
      >
        Удалить
      </Button>
    </Sidebar>
  </div>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import { computed, reactive, onMounted, ref } from "vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { useListenergroupStore } from "@/store2/listenergroup/listenergroup";
import { useProgramStore } from "@/store2/listenergroup/program";
import { useL_Group_StatusStore } from "@/store2/listenergroup/l_group_status";
import { useListenerStore } from "@/store2/listenergroup/listener";
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
    AutoForm,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;

    const gridApi = ref(null);
    const gridColumnApi = ref(null);
    const dataFromApi = ref(null);
    const dataLoaded = ref(false);
    const route = useRoute();
    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const rowData = reactive({});
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

    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 300,
    };

    const canClickButton = computed(() => {
  return Array.isArray(l_group_status.value) &&
    l_group_status.value.length &&
    l_group_status.value[0]?.group_formed !== undefined
    ? !l_group_status.value[0].group_formed
    : false;
});

    onMounted(async () => {
      await loadL_Group_StatusData();
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
    console.log(l_group_status.value[0]?.group_formed);
  } catch (error) {
    console.error("Ошибка при загрузке статуса группы:", error);
  }
};

    return {
      onGridReady,
      columnDefs,
      rowData,
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
    };
  },
  data() {
    return {
      showSidebar: false,
      showAddSidebar: false,
      quickFilterValue: "",
      filters: false,
      listenergroup: new Listenergroup(),
      errors: {},
      scheme: null,
    };
  },
  async mounted() {
    try {
      await this.getListenergroupList();
      await this.getProgramList();
      await this.getL_Group_StatusList();
      await this.getReady_ListenerList();
      this.loadListenergroupData();
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
    ...mapActions(useProgramStore, ["getProgramList"]),
    ...mapActions(useL_Group_StatusStore, ["getL_Group_StatusList"]),
    ...mapActions(useListenerStore, [
      "getReady_ListenerList",
    ]),

    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "") {
        this.edit(event);
      }
    },
    resetLgr() {
      this.listenergroup = new Listenergroup();
    },
    edit(event) {
      this.resetLgr();
      this.listenergroup = event.data;
      console.log(this.listenergroup);
      this.showSidebar = true;
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
    async loadListenergroupData() {
      try {
        if (Array.isArray(this.listenergroupList)) {
          this.rowData.value = this.listenergroupList.filter(
            (lgr) => lgr.deleted_at === null
          );
          console.log("Все файлы (включая дубликаты):", this.rowData);;
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
    navigateToAddGroup() {},
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
      console.log("Открываю!");
      this.resetLgr();
      this.showSidebar = true;
    },
    openAddSidebar() {
      console.log("Открываю!");
      this.resetLgr();
      this.showAddSidebar = true;
    },
    closeSidebar() {
      this.showSidebar = false;
      this.showAddSidebar = false;
    },
  },
  computed: {
    ...mapState(useListenergroupStore, ["listenergroupList"]),
    ...mapState(useL_Group_StatusStore, ["l_group_statusList"]),
    programOptions() {
      const programStore = useProgramStore();
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
/* Стили для скелетона и других элементов остаются без изменений */
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
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes skeletonFade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Стили для формы: располагаем поля в 3 колонки */
.custom-form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  --bs-btn-bg: rgb(68,99,52);
  border: none;
  --bs-btn-hover-bg: rgb(6 215 29);
  --bs-btn-hover-border-color: rgb(6 215 29);
  --bs-btn-active-bg: rgb(68,99,52);
  --bs-btn-disabled-bg: rgb(68,99,52);
  display: flex;
  justify-content: center;
  align-items: center;
}

.form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

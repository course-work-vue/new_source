<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span v-if="!pr">Список всех групп</span>
        <span v-if="pr">Список всех групп с профилем {{ pr_n }}</span>
      </div>
    </div>

    <!-- First row: Search and Clear Filters -->
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

    <!-- Add Group Button -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0">
        <button
          @click="openCreatingForm"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить группу
        </button>
      </div>
    </div>

    <!-- AG Grid Row -->
    <div class="row g-2 flex-1">
      <div class="col-12 p-0 h-100">
        <div class="grid-container">
          <ag-grid-vue
            class="ag-theme-alpine"
            :columnDefs="columnDefs.value"
            :rowData="rowData.value"
            :rowHeight="40"
            :defaultColDef="defaultColDef"
            rowSelection="multiple"
            animateRows="true"
            @cell-clicked="cellWasClicked"
            @grid-ready="onGridReady"
            @firstDataRendered="onFirstDataRendered"
            @filter-changed="onFilterChanged"
          >
          </ag-grid-vue>
        </div>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="formVisible" modal header="Форма группы">
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form
          v-model="group"
          v-model:valid="valid"
          v-model:errors="errors"
          item-class="form__item"
          :scheme="scheme"
        >
        </auto-form>
      </div>
    </div>

    <Button
      class="btn btn-primary float-start"
      :disabled="!valid"
      @click="submit"
    >
      Сохранить
    </Button>
    <Button
      class="btn btn-primary float-end"
      v-if="this.group.group_id"
      @click="deleteGr"
    >
      Удалить
    </Button>
  </Dialog>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3"; // the AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/student/GroupButtonCell.vue";
import GroupHref from "@/components/student/GroupHrefCellRenderer.vue";
import GroupHref2 from "@/components/student/GroupHrefCellRenderer2.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { mapState, mapActions } from "pinia";
import Group from "@/model/student-group/Group";
import { useDirectionStore } from "@/store2/studentgroup/direction";
import { useProfileStore } from "@/store2/studentgroup/profile";
import { useGroupStore } from "@/store2/studentgroup/group";
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
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";
/* eslint-disable vue/no-unused-components */
export default {
  name: "App",
  components: {
    AgGridVue,
    ButtonCell,
    GroupHref,
    GroupHref2,
    AutoForm,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;
    const gridApi = ref(null); // Optional - for accessing Grid's API
    const gridColumnApi = ref();
    // Obtain API from grid's onGridReady event

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
          headerName: "Действия",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            onClick: navigateToStudent,
            label: "View Details", // Button label
          },
          maxWidth: 120,
          resizable: false,
        },
        {
          field: "group_number",
          headerName: "Номер группы",
          cellRenderer: "GroupHref",
          maxWidth: 179,
        },
        { field: "course", headerName: "Курс", maxWidth: 129 },
        {
          field: "prof_name",
          headerName: "Название профиля",
          cellRenderer: "GroupHref2",
        },
        { field: "dir_code", headerName: "Код направления", hide: true },
        {
          field: "dir_name",
          filter: "agDateColumnFilter",
          headerName: "Название Направления",
          hide: true,
        },
      ],
    });

    // DefaultColDef sets props common to all Columns
    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 300,
    };

    // Example load data from server
    onMounted(() => {});

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
      navigateToStudent,
    };
  },
  data() {
    return {
      quickFilterValue: "",
      filters: false,
      pr: false,
      pr_n: null,
      group: new Group(),
      errors: {},
      valid: false,
      scheme: null,
      formVisible: false,
    };
  },
  async mounted() {
    await this.getDirectionList(); // Получение списка направлений
    await this.getProfileList(); // Получение списка профилей
    await this.getGroupList(); // Получение списка групп

    this.loadGroupsData(); // Загрузка данных групп
  },
  computed: {
    ...mapState(useDirectionStore, ["directionList"]),
    ...mapState(useProfileStore, ["profileList"]),
    ...mapState(useGroupStore, ["groupList"]),

    scheme() {
      return new FormScheme([
        new TextInput({
          key: "group_number",
          label: "Номер группы",
          placeholder: "Номер группы",
          icon: "pi pi-hashtag",
          validation: [requiredRule],
          types: "text",
        }),
        new ComboboxInput({
          key: "group_dir_id",
          label: "Направление",
          options: this.directionList.map((direction) => ({
            label: direction.dir_name,
            value: direction.dir_id,
          })),
          validation: [requiredRule],
        }),
        new ComboboxInput({
          key: "group_prof_id",
          label: "Профиль",
          options: this.profileList
            .filter(
              (profile) => profile.prof_dir_id === this.group.group_dir_id
            )
            .map((profile) => ({
              label: profile.prof_name,
              value: profile.prof_id,
            })),
          validation: [requiredRule],
        }),
        new TextInput({
          key: "course",
          label: "Курс",
          placeholder: "Курс",
          icon: "pi pi-graduation-cap",
          validation: [requiredRule],
          types: "number",
        }),
      ]);
    },
  },
  methods: {
    ...mapActions(useDirectionStore, ["getDirectionList"]),
    ...mapActions(useProfileStore, ["getProfileList"]),
    ...mapActions(useGroupStore, [
      "getGroupList",
      "postGroup",
      ,
      "putGroup",
      "deleteGroup",
    ]),
    async deleteGr() {
      let group = { ...this.group };

      await this.deleteGroup(group);
      this.formVisible = false;
      this.resetGroup();
      this.loadGroupsData();
    },
    openCreatingForm() {
      this.resetGroup();
      this.formVisible = true;
    },
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        console.log(event);
        this.edit(event);
      }
    },
    async validateForm() {
      let isValid = true;
      const errors = {};

      for (const item of this.scheme?.items || []) {
        const result = item.validate(this.group[item.key]);

        if (result !== true) {
          errors[item.key] = result;
          isValid = false;
        }
      }

      this.errors = errors;
      this.valid = isValid;
      return isValid;
    },
    resetGroup() {
      this.group = new Group();
    },
    edit(event) {
      this.resetGroup();
      this.group = event.data;
      this.formVisible = true;
    },
    async submit() {
      const isValid = await this.validateForm();
      if (!isValid) {
        console.error("Form validation failed", this.errors);
        return;
      }
      let group = { ...this.group };

      if (group.group_id) {
        await this.putGroup(group);
      } else {
        await this.postGroup(group);
      }
      this.formVisible = false;
      this.resetGroup();
      this.loadGroupsData();
    },
    async loadGroupsData() {
      try {
        if (Array.isArray(this.groupList)) {
          this.rowData.value = this.groupList
            .filter((group) => group.deleted_at === null)
            .sort((a, b) => a.group_number.localeCompare(b.group_number));
        } else {
          if (this.groupList.deleted_at === null) {
            this.rowData.value = [this.groupList];
          } else {
            this.rowData.value = [];
          }
        }
        this.loading = false;
      } catch (error) {
        console.error("Error loading groups data:", error);
      }
    },

    onFirstDataRendered(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      // Check if filterModel exists in the route query
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
      // This function will be called whenever filters change.
      // You can perform your desired action here.
      // For example, you can get the current filter model:
      this.filters = false;
      const savedQuickFilter = this.gridApi.getQuickFilter();
      const savedFilterModel = this.gridApi.getFilterModel();

      // Initialize an empty object for queryParams
      const queryParams = {};

      // Check if savedQuickFilter is not empty, then add it to queryParams
      if (savedQuickFilter) {
        queryParams.quickFilter = JSON.stringify(savedQuickFilter);
        this.filters = true;
      }

      // Check if savedFilterModel is not empty, then add it to queryParams
      if (savedFilterModel && Object.keys(savedFilterModel).length > 0) {
        queryParams.filterModel = JSON.stringify(savedFilterModel);
        this.filters = true;
        if (savedFilterModel.prof_name) {
          this.pr = true;
          this.pr_n = savedFilterModel.prof_name.filter;
        } else {
          this.pr = false;
        }
      } else {
        this.pr = false;
      }

      // Push the query parameters to the router
      this.$router.push({ query: queryParams });

      // Do something with the filterModel or trigger other actions as needed.
    },
    clearFilters() {
      this.gridApi.setFilterModel();
      this.gridApi.setQuickFilter();
      this.quickFilterValue = "";
      this.filters = false;
    },
  },
};
</script>

<style lang="scss" scoped>
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

.ag-theme-alpine {
  flex: 1;
}

.clear-filters-btn {
  white-space: nowrap;
  min-width: 165px;
}

.form-label {
  white-space: nowrap;
  margin-bottom: 0;
  margin-right: 10px;
  font-size: 14px;
}

.form-check-input,
.form-check-label {
  cursor: pointer;
}

.form-check {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.form-check-label {
  margin-left: 4px;
  line-height: 1;
  padding-top: 1px;
  font-size: 14px;
}

.ag-row .ag-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Consistent height for all form elements */
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
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075),
    0 0 8px rgba(6, 215, 29, 0.6);
}

.form-select:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075),
    0 0 8px rgba(6, 215, 29, 0.6);
}
</style>

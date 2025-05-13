<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1" v-if="!loading">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span v-if="!dirc">Список всех профилей</span>
        <span v-if="dirc">Список профилей с направлением {{ dir_c_n }}</span>
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

    <!-- Add Profile Button -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0">
        <button
          @click="openCreatingForm"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить профиль
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
            :rowHeight="40"
            :rowData="rowData.value"
            :defaultColDef="defaultColDef"
            :localeText="localeText"
            rowSelection="multiple"
            animateRows="true"
            includeHiddenColumnsInQuickFilter="true"
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

  <Dialog v-model:visible="formVisible" modal header="Форма профиля">
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form
          v-model="profile"
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
      v-if="this.profile.prof_id"
      @click="deleteProf"
    >
      Удалить
    </Button>
  </Dialog>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3"; // the AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/student/ProfileButtonCell.vue";
import ProfileHref from "@/components/student/ProfileHrefCellRenderer.vue";
import ProfileHref2 from "@/components/student/ProfileHrefCellRenderer2.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import { mapState, mapActions } from "pinia";
import { useDirectionStore } from "@/store2/studentgroup/direction";
import { useProfileStore } from "@/store2/studentgroup/profile";
import Profile from "@/model/student-group/Profile";
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
  name: "ProfileManagement",
  components: {
    AgGridVue,
    ButtonCell,
    ProfileHref,
    ProfileHref2,
    AutoForm,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;
    const gridApi = ref(null); // Optional - for accessing Grid's API
    const gridColumnApi = ref();

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
            label: "View Details", // Button label
          },
          maxWidth: 120,
          resizable: false,
        },

        {
          field: "prof_name",
          headerName: "Название профиля",
          cellRenderer: "ProfileHref2",
        },
        {
          field: "dir_code",
          headerName: "Код направления",
          cellRenderer: "ProfileHref",
        },
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

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

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
      onFilterTextBoxChanged,
      localeText,
    };
  },
  data() {
    return {
      quickFilterValue: "",
      filters: false,
      dirc: false,
      dir_c_n: null,
      dir_list: [],
      profile: new Profile(),
      errors: {},
      valid: false,
      scheme: null,
      formVisible: false,
    };
  },
  async mounted() {
    await this.getDirectionList();
    await this.getProfileList();

    this.loadProfilesData(); // Загрузка данных профилей
    this.scheme = new FormScheme([
      new ComboboxInput({
        key: "prof_dir_id",
        label: "Направление",
        options: [
          ...[...this.directionList].map((direction) => ({
            label: direction.dir_name,
            value: direction.dir_id,
          })),
        ],
        validation: [requiredRule],
      }),
      new TextInput({
        key: "prof_name",
        label: "Название профиля",
        placeholder: "Название профиля",
        icon: "pi pi-user",
        validation: [requiredRule],
      }),
    ]);
  },
  computed: {
    ...mapState(useDirectionStore, ["directionList"]),
    ...mapState(useProfileStore, ["profileList"]),
  },
  methods: {
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
    ...mapActions(useDirectionStore, ["getDirectionList"]),
    ...mapActions(useProfileStore, [
      "getProfileList",
      "postProfile",
      ,
      "putProfile",
      "deleteProfile",
    ]),
    async deleteProf() {
      let profile = { ...this.profile };

      await this.deleteProfile(profile);
      this.formVisible = false;
      this.resetProf();
      this.loadProfilesData();
    },
    openCreatingForm() {
      this.resetProf();
      this.formVisible = true;
    },
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    async validateForm() {
      let isValid = true;
      const errors = {};

      for (const item of this.scheme.items) {
        const result = item.validate(this.profile[item.key]);

        if (result !== true) {
          errors[item.key] = result;
          isValid = false;
        }
      }

      this.errors = errors;
      this.valid = isValid;
      return isValid;
    },
    resetProf() {
      this.profile = new Profile();
    },
    edit(event) {
      this.resetProf();
      this.profile = event.data;
      this.formVisible = true;
    },
    async submit() {
      const isValid = await this.validateForm();
      if (!isValid) {
        console.error("Form validation failed", this.errors);
        return;
      }
      let profile = { ...this.profile };

      if (profile.prof_id) {
        await this.putProfile(profile);
      } else {
        await this.postProfile(profile);
      }
      this.formVisible = false;
      this.resetProf();
      this.loadProfilesData();
    },
    async loadProfilesData() {
      try {
        if (Array.isArray(this.profileList)) {
          // Фильтруем профили, где deleted_at равен null, и сортируем по prof_name
          this.rowData.value = this.profileList
            .filter((profile) => profile.deleted_at === null)
            .sort((a, b) => a.prof_name.localeCompare(b.prof_name));
        } else {
          // Обработка случая, когда profileList не является массивом
          if (this.profileList.deleted_at === null) {
            this.rowData.value = [this.profileList];
          } else {
            this.rowData.value = [];
          }
        }
        this.loading = false;
      } catch (error) {
        console.error("Error loading profiles data:", error);
      }
    },
    async loadDirectionsData() {
      try {
        if (Array.isArray(this.directionList)) {
          this.dir_list = this.directionList
            .filter((direction) => direction.deleted_at === null)
            .sort((a, b) => a.dir_name.localeCompare(b.dir_name));
        } else {
          if (this.directionList.deleted_at === null) {
            this.dir_list = [this.directionList];
          } else {
            this.dir_list = [];
          }
        }
        this.loading = false;
      } catch (error) {
        console.error("Error loading directions data:", error);
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
      this.dirc = false;
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

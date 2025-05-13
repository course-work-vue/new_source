<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1">
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span>{{ directionText }} </span>
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

    <!-- Second row: Checkboxes and Direction Code Filter on the same line -->
    <div class="row g-2 mb-2">
      <div class="col-6 p-0 pe-3">
        <div class="d-flex align-items-center compact-checks">
          <div class="form-check form-check-inline mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              id="bachelor-checkbox"
              v-model="bachelorFilter"
              @change="applyEducationFilters"
            />
            <label class="form-check-label" for="bachelor-checkbox">
              Бакалавриат
            </label>
          </div>
          <div class="form-check form-check-inline mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              id="specialist-checkbox"
              v-model="specialistFilter"
              @change="applyEducationFilters"
            />
            <label class="form-check-label" for="specialist-checkbox">
              Специалитет
            </label>
          </div>
          <div class="form-check form-check-inline mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              id="magister-checkbox"
              v-model="magisterFilter"
              @change="applyEducationFilters"
            />
            <label class="form-check-label" for="magister-checkbox">
              Магистратура
            </label>
          </div>
        </div>
      </div>
      <div class="col-6 p-0">
        <div class="form-group d-flex align-items-center">
          <label class="form-label me-2" for="dir_id"> Фильтр по коду: </label>
          <select
            class="form-select"
            id="dir_id"
            v-model="dirValue"
            @change="handleSelectChange(dirValue)"
          >
            <option selected="selected" value="">Нет</option>
            <option
              v-for="dir in this.directionList.sort(
                (a, b) => a.dir_code - b.dir_code
              )"
              :key="dir.dir_code"
              :value="dir.dir_code"
            >
              {{ dir.dir_code }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Third row: Add Direction Button (30% width) -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0">
        <button
          @click="openCreatingForm"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить направление
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
            rowSelection="multiple"
            animateRows="true"
            :localeText="localeText"
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

  <div class="test" v-if="test">
    <label>Количество бюджета:</label>
    <div class="form-group d-inline-flex align-items-center mb-2 col-1 mx-1">
      <input
        class="form-control"
        v-model="event.data.total_budget_count"
        disabled
      />
    </div>
    <label>Количество договоров:</label>
    <div class="form-group d-inline-flex align-items-center mb-2 col-1 mx-1">
      <input
        class="form-control"
        v-model="event.data.total_not_budget_count"
        disabled
      />
    </div>
  </div>

  <Dialog v-model:visible="formVisible" modal header="Форма направления">
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form
          v-model="direction"
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
      v-if="this.direction.dir_id"
      @click="deleteDir"
    >
      Удалить
    </Button>
  </Dialog>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3"; // the AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/student/DirectionButtonCell.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import DirectionHref2 from "@/components/student/DirectionHrefCellRenderer2.vue";
import DirectionHref from "@/components/student/DirectionHrefCellRenderer.vue";
import { useDirectionStore } from "@/store2/studentgroup/direction";
import { mapState, mapActions } from "pinia";
import Direction from "@/model/student-group/Direction";

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
import { useRoute } from "vue-router";
/* eslint-disable vue/no-unused-components */
export default {
  name: "App",
  components: {
    AgGridVue,
    ButtonCell,
    DirectionHref,
    DirectionHref2,
    AutoForm,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;
    const gridApi = ref(null); // Optional - for accessing Grid's API
    const gridColumnApi = ref();
    // Obtain API from grid's onGridReady event
    const route = useRoute();
    const paginationPageSize = 60;

    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
    };

    const navigateToDirection = () => {};

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
          maxWidth: 120, // Adjust the width as needed
          cellClass: "grid-cell-centered",
          resizable: false,
        },

        { field: "dir_name", headerName: "Название направления", cellRenderer: "DirectionHref2", },
        {
          field: "dir_code",
          headerName: "Код направления",
          cellRenderer: "DirectionHref",
        },
        {
          field: "magister",
          headerName: "Магистратура",
          hide: true,
        },
        {
          field: "specialist",
          headerName: "Специалитет",
          hide: true,
        },
        {
          field: "bachelor",
          headerName: "Бакалавриат",
          hide: true,
        },
      ],
    });
    const handleSelectChange = async (dir_code) => {
      restoreFromHardCoded(dir_code);
    };

    const restoreFromHardCoded = (dir_code) => {
      const filterModelQuery = route.query.filterModel;
      if (filterModelQuery) {
        // Parse the filterModel from the query parameter
        const filterModel = JSON.parse(filterModelQuery);

        // Your hardcoded filter
        const hardcodedFilter = {
          dir_code: { type: "equals", filter: dir_code },
        };

        // Merge the filterModel and hardcodedFilter using the spread operator
        const mergedFilter = {
          ...filterModel,
          ...hardcodedFilter,
        };

        // Now 'mergedFilter' contains the combined filters
        gridApi.value.setFilterModel(mergedFilter);
      } else {
        const hardcodedFilter = {
          dir_code: { type: "equals", filter: dir_code },
        };
        gridApi.value.setFilterModel(hardcodedFilter);
      }
    };

    // DefaultColDef sets props common to all Columns
    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 300,
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
      localeText,
      deselectRows: () => {
        gridApi.value.deselectAll();
      },
      onFilterTextBoxChanged,
      paginationPageSize,
      navigateToDirection,
      handleSelectChange,
    };
  },
  data() {
    return {
      test: false,
      quickFilterValue: "", // Initialize with an empty string
      filters: false,
      event: null,
      direction: new Direction(),
      errors: {},
      valid: false,
      scheme: null,
      formVisible: false,
      dirValue: null,
      bachelorFilter: false,
      specialistFilter: false,
      magisterFilter: false,
    };
  },
  watch: {
    'direction.bachelor': function(newVal) {
      if (newVal) {
        this.direction.magister = false;
        this.direction.specialist = false;
      }
    },
    'direction.magister': function(newVal) {
      if (newVal) {
        this.direction.bachelor = false;
        this.direction.specialist = false;
      }
    },
    'direction.specialist': function(newVal) {
      if (newVal) {
        this.direction.bachelor = false;
        this.direction.magister = false;
      }
    }
  },
  computed: {
    ...mapState(useDirectionStore, ["directionList"]),
    directionText() {
      let baseText = "Список всех направлений";
      let educationTypes = [];

      if (this.bachelorFilter) {
        educationTypes.push("бакалавриата");
      }
      if (this.specialistFilter) {
        educationTypes.push("специалитета");
      }
      if (this.magisterFilter) {
        educationTypes.push("магистратуры");
      }

      if (educationTypes.length > 0) {
        // Join with commas and "и" for the last item if multiple types are selected
        if (educationTypes.length === 1) {
          baseText += " " + educationTypes[0];
        } else if (educationTypes.length === 2) {
          baseText += " " + educationTypes[0] + " и " + educationTypes[1];
        } else {
          baseText +=
            " " +
            educationTypes.slice(0, -1).join(", ") +
            " и " +
            educationTypes[educationTypes.length - 1];
        }
      } else {
        // Default if no checkboxes are selected
        baseText += " бакалавриата";
      }

      if (this.dirValue !== null && this.dirValue !== "") {
        baseText += ` (код направления: ${this.dirValue})`;
      }

      return baseText;
    },
  },
  async mounted() {
    await this.getDirectionList(); // Fetch the list of directions

    this.loadDirectionsData();
    this.scheme = new FormScheme([
      new TextInput({
        key: "dir_name",
        label: "Название направления",
        placeholder: "Введите название направления",
        icon: "pi pi-book",
        validation: [requiredRule], // Assuming name is a required field
      }),
      new TextInput({
        key: "dir_code",
        label: "Код направления",
        placeholder: "Введите код направления",
        icon: "pi pi-tag",
        validation: [requiredRule], // Assuming code is a required field
      }),
      new CheckboxInput({
        key: "bachelor",
        label: "Бакалавр",
        binary: true,
      }),
      new CheckboxInput({
        key: "magister",
        label: "Магистратура",
        binary: true,
      }),
      new CheckboxInput({
        key: "specialist",
        label: "Специалитет",
        binary: true,
      }),
    ]);
  },
  methods: {
    ...mapActions(useDirectionStore, [
      "getDirectionList",
      "postDirection",
      ,
      "putDirection",
      "deleteDirection",
    ]),
    applyEducationFilters() {
      // Get current filter model
      const currentFilterModel = this.gridApi.getFilterModel() || {};

      // Create new filter for education level fields
      const educationFilters = {};

      if (this.bachelorFilter) {
        educationFilters.bachelor = { filterType: "text", type: "true" };
      }

      if (this.specialistFilter) {
        educationFilters.specialist = { filterType: "text", type: "true" };
      }

      if (this.magisterFilter) {
        educationFilters.magister = { filterType: "text", type: "true" };
      }

      // Merge with existing filters
      const mergedFilter = {
        ...currentFilterModel,
        ...educationFilters,
      };

      // Remove education filters if no checkboxes are selected
      if (
        !this.bachelorFilter &&
        !this.specialistFilter &&
        !this.magisterFilter
      ) {
        delete mergedFilter.bachelor;
        delete mergedFilter.specialist;
        delete mergedFilter.magister;
      }

      // Apply the filter
      this.gridApi.setFilterModel(mergedFilter);
      this.filters = Object.keys(mergedFilter).length > 0;
    },
    async deleteDir() {
      let direction = { ...this.direction };

      await this.deleteDirection(direction);
      this.formVisible = false;
      this.resetDir();
      this.loadDirectionsData();
    },
    openCreatingForm() {
      this.resetDir();
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
        const result = item.validate(this.direction[item.key]);

        if (result !== true) {
          // Check for `true`, which means the field is valid
          errors[item.key] = result; // Store the error message if validation fails
          isValid = false;
        }
      }

      this.errors = errors; // Store errors in the component's state
      this.valid = isValid; // Set the valid flag based on the results
      return isValid; // Return the validity of the form
    },
    resetDir() {
      this.direction = new Direction();
    },
    edit(event) {
      this.resetDir();
      this.direction = event.data;

      this.formVisible = true;
    },
    async submit() {
      const isValid = await this.validateForm();
      if (!isValid) {
        console.error("Form validation failed", this.errors);
        return;
      }
      let direction = { ...this.direction };

      if (direction.dir_id) {
        await this.putDirection(direction);
      } else {
        await this.postDirection(direction);
      }
      this.formVisible = false;
      this.resetDir();
      this.loadDirectionsData();
    },
    async loadDirectionsData() {
      try {
        if (Array.isArray(this.directionList)) {
          // Filter out directions where deleted_at is not null and sort by dir_name
          this.rowData.value = this.directionList
            .filter((direction) => direction.deleted_at === null)
            .sort((a, b) => a.dir_name.localeCompare(b.dir_name));
        } else {
          // Handle case where directionList is not an array
          if (this.directionList.deleted_at === null) {
            this.rowData.value = [this.directionList];
          } else {
            this.rowData.value = [];
          }
        }
        this.loading = false;
      } catch (error) {
        console.error("Error loading directions data:", error);
      }
    },

    navigateToAddDirection() {
      this.$router.push(`/addDirection`); // Navigate to the AddDirection route
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
        if (filterModel.dir_code) {
          this.dirValue = filterModel.dir_code.filter;
        }
        if (filterModel.magister) {
          this.magisterFilter = filterModel.magister.type === "true";
        }
        if (filterModel.bachelor) {
          this.bachelorFilter = filterModel.bachelor.type === "true";
        }
        if (filterModel.specialist) {
          this.specialistFilter = filterModel.specialist.type === "true";
        }
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
      }

      // Push the query parameters to the router
      this.$router.push({ query: queryParams });

      // Do something with the filterModel or trigger other actions as needed.
    },
    clearFilters() {
      this.gridApi.setFilterModel();
      this.gridApi.setQuickFilter();
      this.bachelorFilter = false;
      this.specialistFilter = false;
      this.magisterFilter = false;
      this.dirValue = null;
      this.quickFilterValue = "";
      this.filters = false;
    },
  },

  created() {
    this.loadDirectionsData();
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

.compact-checks {
  margin: 0;
  padding: 0;
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

.form-check-input {
  height: 16px;
  width: 16px;
  margin-top: 0;
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

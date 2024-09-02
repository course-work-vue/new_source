<template>
  <div v-if="!loading">
    <div class="col col-xs-9 col-lg-12 list">
      <div class="col col-12">
        <div class="d-inline-flex">
          <div v-if="!spisok">
            <h1>Список всех студентов</h1>
          </div>
          <h1 v-if="spisok">Список студентов {{ groupn }} группы</h1>
          <h1 class="m-0" v-if="subg">, {{ subgn }} подгруппы</h1>
        </div>

        <div class="col col-12">
          <button
            @click="openCreatingForm"
            class="btn btn-primary float-start"
            type="button"
          >
            <i class="material-icons-outlined">add</i>Добавить студента
          </button>
          <button
            @click="previewDocx"
            class="mx-2 btn btn-primary float-start"
            type="button"
          >
            Отчёт о формах обучения
          </button>
          <div class="col col-6 float-end d-inline-flex align-items-center">
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
      <div>
        <div class="col col-6 float-start">
          <div class="form-group d-inline-flex align-items-center">
            <label class="bigger form-label" for="group_id"
              >Фильтр по группе:</label
            >

            <select
              class="form-select"
              id="group_id"
              v-model="myValue"
              @change="handleSelectChange(myValue)"
            >
              <option selected="selected" value="">Нет</option>
              <option
                v-for="group in this.groupList"
                :key="group.group_number"
                :value="group.group_number"
              >
                {{ group.group_number }}
              </option>
            </select>
          </div>
        </div>
        <div class="col col-6 float-start">
          <div class="form-group d-inline-flex align-items-center">
            <label class="bigger form-label" for="subgroup_id"
              >Фильтр по подгруппе:</label
            >

            <select
              class="form-select"
              id="subgroup_id"
              v-model="myValue4"
              @change="handleSelectChange2(myValue4)"
            >
              <option selected="selected" value="">Нет</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
        </div>
      </div>
      <div style="height: 90vh">
        <div class="h-100 pt-5">
          <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 100%"
            :columnDefs="columnDefs.value"
            :rowData="rowData.value"
            :defaultColDef="defaultColDef"
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
    <div class="container mt-3">
      <table class="table table-striped">
        Список отстающих студентов
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Sum</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dataFromApi" :key="index">
            <th scope="row">{{ index }}</th>
            <td>{{ item.first_name }}</td>
            <td>{{ item.last_name }}</td>
            <td>{{ item.sum }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <Dialog v-model:visible="formVisible" modal header="Форма студента">
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form
          v-model="student"
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
      v-if="this.student.student_id"
      @click="deleteStd"
    >
      Удалить
    </Button>
  </Dialog>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import { AgGridVue } from "ag-grid-vue3"; // the AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/student/StudentButtonCell.vue";
import StudentHref from "@/components/student/StudentHrefCellRenderer.vue";
import StudentHref2 from "@/components/student/StudentHrefCellRenderer2.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { useStudentStore } from "@/store2/studentgroup/student";
import { useGroupStore } from "@/store2/studentgroup/group";
import AutoForm from "@/components/form/AutoForm.vue";
import { FormScheme } from "@/model/form/FormScheme";
import users from "@/mock/users";

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
import Student from "@/model/student-group/Student";
/* eslint-disable vue/no-unused-components */
export default {
  name: "App",
  components: {
    AgGridVue,
    ButtonCell,
    StudentHref,
    StudentHref2,
    Form,
    Field,
    ErrorMessage,
    AutoForm,
  },
  setup() {
    const gridApi = ref(null); // Optional - for accessing Grid's API
    const gridColumnApi = ref();

    const dataFromApi = ref(null); // This will store the data from the API
    const dataLoaded = ref(false); // This flag will indicate if data is loaded
    // Obtain API from grid's onGridReady event
    const route = useRoute();
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
          headerClass: "text-center",
          cellRenderer: "ButtonCell",
          cellRendererParams: {
            onClick: navigateToStudent,
            label: "View Details", // Button label
          },
          maxWidth: 120,
          resizable: false,
        },

        {
          field: "full_name",
          headerName: "ФИО",
          minWidth: 250,
          cellRenderer: "StudentHref2",
        },
        { field: "group_number", headerName: "Группа", maxWidth: 129 },
        { field: "subgroup", headerName: "Подгруппа", maxWidth: 129 },
        {
          field: "enrollment_order",
          headerName: "Приказ о зачислении",
          minWidth: 200,
          hide: true,
        },
        {
          field: "formatted_enrolled_date",
          filter: "agDateColumnFilter",
          filterParams: filterParams,
          headerName: "Дата зачисления",
          minWidth: 170,
          hide: true,
        },

        {
          field: "formatted_date_of_birth",
          filter: "agDateColumnFilter",
          filterParams: filterParams,
          headerName: "Дата рождения",
          minWidth: 170,
          hide: true,
        },
      ],
    });
    const restoreFromHardCoded2 = (myValue3) => {
      const filterModelQuery = route.query.filterModel;
      if (filterModelQuery) {
        // Parse the filterModel from the query parameter
        const filterModel = JSON.parse(filterModelQuery);

        // Your hardcoded filter
        const hardcodedFilter = {
          subgroup: { type: "equals", filter: myValue3 },
        };

        // Merge the filterModel and hardcodedFilter using the spread operator
        const mergedFilter = {
          ...filterModel,
          ...hardcodedFilter,
        };

        // Now 'mergedFilter' contains the combined filters
        console.log(mergedFilter);
        gridApi.value.setFilterModel(mergedFilter);
      } else {
        const hardcodedFilter = {
          subgroup: { type: "equals", filter: myValue3 },
        };
        gridApi.value.setFilterModel(hardcodedFilter);
      }
    };

    const handleSelectChange2 = async (myValue3) => {
      restoreFromHardCoded2(myValue3);
    };

    const restoreFromHardCoded = (myValue2) => {
      const filterModelQuery = route.query.filterModel;
      if (filterModelQuery) {
        // Parse the filterModel from the query parameter
        const filterModel = JSON.parse(filterModelQuery);

        // Your hardcoded filter
        const hardcodedFilter = {
          group_number: { type: "equals", filter: myValue2 },
        };

        // Merge the filterModel and hardcodedFilter using the spread operator
        const mergedFilter = {
          ...filterModel,
          ...hardcodedFilter,
        };

        // Now 'mergedFilter' contains the combined filters
        console.log(mergedFilter);
        gridApi.value.setFilterModel(mergedFilter);
      } else {
        const hardcodedFilter = {
          group_number: { type: "equals", filter: myValue2 },
        };
        gridApi.value.setFilterModel(hardcodedFilter);
      }
    };

    const handleSelectChange = async (myValue2) => {
      // dataFromApi.value = (
      //    await UserService.getRetardsByGroupId(myValue2)
      //  ).data;
      dataLoaded.value = true;
      restoreFromHardCoded(myValue2);
    };

    // DefaultColDef sets props common to all Columns
    const defaultColDef = {
      sortable: true,
      filter: true,
      flex: 1,
      resizable: true,
      minWidth: 150,
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

      deselectRows: () => {
        gridApi.value.deselectAll();
      },

      onFilterTextBoxChanged,
      paginationPageSize,
      navigateToStudent,
      restoreFromHardCoded,
      restoreFromHardCoded2,
      handleSelectChange,
      handleSelectChange2,
      dataFromApi,
      dataLoaded,
    };
  },
  data() {
    return {
      quickFilterValue: "",
      filters: false,
      groups: ["Нет"],
      myValue: "",
      myValue4: "",
      spisok: false,
      subg: false,
      groupn: null,
      subgn: null,
      formVisible: false,
      users,
      user: {
        id: "",
        username: "",
        email: "",
        gender: null,
        phone: "",
        outstaff: false,
        fired: false,
        start_work_dt: null,
        stack: null,
        timezone: null,
      },
      student: new Student(),
      errors: {},
      valid: false,
      scheme: null,
    };
  },
  async mounted() {
    await this.getGroupList();
    await this.getStudentList();

    this.loadStudentsData();
    this.scheme = new FormScheme([
      new DateInput({
        key: "date_of_birth",
        label: "Дата рождения",
        dateFormat: "dd/mm/yy",
        size: "sm",
        showIcon: true,
        validation: [],
      }),
      new DateInput({
        key: "enrolled_date",
        label: "Дата зачисления",
        dateFormat: "dd/mm/yy",
        size: "sm",
        showIcon: true,
        validation: [],
      }),

      new ComboboxInput({
        key: "group_id",
        label: "Номер группы",
        options: [
          ...[...this.groupList].map((group) => ({
            label: group.group_number,
            value: group.group_id,
          })),
        ],
        validation: [requiredRule],
      }),
      new CheckboxInput({
        key: "is_budget",
        label: "Бюджет",
        binary: true,
      }),
      new TextInput({
        key: "INN",
        label: "ИНН",
        placeholder: "ИНН",
        icon: "pi pi-credit-card",
        validation: [],
      }),
      new TextInput({
        key: "SNILS",
        label: "СНИЛС",
        placeholder: "СНИЛС",
        icon: "pi pi-credit-card",
        validation: [],
      }),
      new TextInput({
        key: "place_of_birth",
        label: "Место рождения",
        placeholder: "Место рождения",
        icon: "pi pi-map-marker",
        validation: [],
      }),
      new TextInput({
        key: "email",
        label: "Электронная почта",
        placeholder: "Электронная почта",
        icon: "pi pi-send",
        validation: [emailRule],
      }),
      new TextInput({
        key: "student_login",
        label: "Логин студента",
        placeholder: "Логин студента",
        icon: "pi pi-user",
        validation: [],
      }),
      new TextInput({
        key: "enrollment_order",
        label: "Приказ о зачислении",
        placeholder: "Приказ о зачислении",
        icon: "pi pi-file",
        validation: [],
      }),
      new TextInput({
        key: "phone_number",
        label: "Номер телефона",
        icon: "pi pi-phone",
        placeholder: "Номер телефона",
        validation: [],
      }),
      new TextInput({
        key: "phone_number_rod",
        label: "Номер телефона (РОД)",
        icon: "pi pi-phone",
        placeholder: "Номер телефона (РОД)",
        validation: [],
      }),
      new TextInput({
        key: "zachetka_number",
        label: "Номер зачётки",
        placeholder: "Номер зачётки",
        icon: "pi pi-credit-card",
        validation: [],
      }),
      new TextInput({
        key: "first_name",
        label: "Имя",
        placeholder: "Имя",
        icon: "pi pi-user",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "last_name",
        label: "Фамилия",
        placeholder: "Фамилия",
        icon: "pi pi-user",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "patronymic",
        label: "Отчество",
        placeholder: "Отчество",
        icon: "pi pi-user",
        validation: [],
      }),
      new RadioInput({
        key: "gender",
        label: "Пол",
        validation: [requiredRule],
        options: [
          {
            label: "Мужчина",
            value: "m",
          },
          {
            label: "Женщина",
            value: "f",
          },
        ],
      }),
      new RadioInput({
        key: "subgroup",
        label: "Подгруппа",
        placeholder: "Подгруппа",
        icon: "pi pi-users",
        validation: [requiredRule],
        options: [
          {
            label: "Нет",
            value: "Нет",
          },
          {
            label: "1",
            value: "1",
          },
          {
            label: "2",
            value: "2",
          },
        ],
      }),
      new TextInput({
        key: "passport_series_and_number",
        label: "Серия и номер паспорта",
        placeholder: "Серия и номер паспорта",
        icon: "pi pi-id-card",
        validation: [],
      }),
    ]);
  },
  methods: {
    ...mapActions(useStudentStore, [
      "getStudentList",
      "postStudent",
      ,
      "putStudent",
      "deleteStudent",
    ]),
    ...mapActions(useGroupStore, ["getGroupList"]),
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    resetStd() {
      this.student = new Student();
    },
    edit(event) {
      this.resetStd();
      this.student = event.data;
      console.log(this.student);

      this.formVisible = true;
    },
    previewDocx() {
      window.open(
        `https://docs.google.com/viewerng/viewer?url=http://195.93.252.168:5050/api/Students/Export`
      );
    },
    openCreatingForm() {
      this.resetStd();
      this.formVisible = true;
    },
    async validateForm() {
      let isValid = true;
      const errors = {};

      for (const item of this.scheme.items) {
        const result = item.validate(this.student[item.key]);

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

    async submit() {
      const isValid = await this.validateForm();
      if (!isValid) {
        console.error("Form validation failed", this.errors);
        return;
      }
      let student = { ...this.student };

      if (student.student_id) {
        await this.putStudent(student);
      } else {
        await this.postStudent(student);
      }
      this.formVisible = false;
      this.resetStd();
      this.loadStudentsData();
    },

    async deleteStd() {
      let student = { ...this.student };
      console.log(student);
      await this.deleteStudent(student);
      this.formVisible = false;
      this.resetStd();
      this.loadStudentsData();
    },

    async loadStudentsData() {
      try {
        if (Array.isArray(this.studentList)) {
          // Filter out students where deleted_at is not null and sort by full_name
          this.rowData.value = this.studentList
            .filter((student) => student.deleted_at === null)
            .sort((a, b) => a.full_name.localeCompare(b.full_name));
        } else {
          // Handle case where studentList is not an array
          if (this.studentList.deleted_at === null) {
            this.rowData.value = [this.studentList];
          } else {
            this.rowData.value = [];
          }
        }
        this.loading = false;
      } catch (error) {
        console.error("Error loading students data:", error);
      }
    },

    navigateToAddStudent() {
      if (this.groupn) {
        this.$router.push(`/addStudent/` + this.groupn);
      } else {
        this.$router.push(`/addStudent`);
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
        if (filterModel.group_number) {
          this.myValue = filterModel.group_number.filter;
          this.groupn = filterModel.group_number.filter;
          if (this.groupn) {
            this.spisok = true;
          }
        }

        if (filterModel.subgroup) {
          this.myValue4 = filterModel.subgroup.filter;
          this.subgn = filterModel.subgroup.filter;

          if (this.subgn) {
            this.subg = true;
          }
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
        if (savedFilterModel.group_number) {
          this.myValue = savedFilterModel.group_number.filter;
          this.groupn = savedFilterModel.group_number.filter;
          if (this.groupn) {
            this.spisok = true;
          }
        } else {
          this.spisok = false;
        }
        if (savedFilterModel.subgroup) {
          this.myValue4 = savedFilterModel.subgroup.filter;
          this.subgn = savedFilterModel.subgroup.filter;

          if (this.subgn) {
            this.subg = true;
          }
        } else {
          this.subg = false;
        }
      } else {
        this.spisok = false;
        this.subg = false;
      }

      // Push the query parameters to the router
      this.$router.push({ query: queryParams });

      // Do something with the filterModel or trigger other actions as needed.
    },
    clearFilters() {
      this.gridApi.setFilterModel();
      this.gridApi.setQuickFilter();
      this.quickFilterValue = "";
      this.myValue = "";
      this.myValue4 = "";
      this.subg = false;
      this.spisok = false;
      this.filters = false;
    },
  },
  computed: {
    ...mapState(useStudentStore, ["studentList"]),
    ...mapState(useGroupStore, ["groupList"]),
  },
  async created() {},
};
var filterParams = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    var dateAsString = cellValue;
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split("/");
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
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
  justify-content: center; /* align horizontal */
  align-items: center;
}

.skeleton {
  width: 100%;
  height: 1.2em;
  background-image: linear-gradient(
    125deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
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
    --bs-btn-hover-bg: rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
  }
}
.disabled {
  .page-link {
    background-color: rgb(57, 79, 46);
    border: none;
    --bs-btn-hover-bg: rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
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

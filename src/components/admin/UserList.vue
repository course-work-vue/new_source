<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1" v-if="!loading">
    <!-- Title Row -->
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span v-if="!spisok">Список всех пользователей</span>
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

    <!-- Add User Button Row -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0">
        <button
          @click="openCreatingForm"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить пользователя
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

  <Dialog
    v-model:visible="formVisible"
    class="dialog"
    modal
    header="Форма пользователей"
    :style="{ flex: 1 }"
  >
    <div class="card flex flex-row">
      <div class="form flex flex-1 flex-row card__form">
        <auto-form
          v-model="user"
          v-model:valid="valid"
          v-model:errors="errors"
          item-class="form__item"
          :scheme="scheme"
        >
        </auto-form>
        <div class="form__item" v-if="user.id">
          <button class="btn btn-primary" @click="deauthUserWithId(user.id)">
            Отозвать токен
          </button>
        </div>
        <!-- Only show roles when editing an existing user -->
        <div class="form__item role-selection" v-if="user.id">
          <h3>Роли</h3>
          <div class="role-list">
            <div v-for="role in roleList" :key="role.roleid" class="role-item">
              <label class="role-label">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :value="role.roleid"
                  v-model="selectedRoles"
                  :disabled="isOwnRole(role.roleid)"
                />
                <span :class="{'own-role': isOwnRole(role.roleid)}">{{ role.rolename }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Button class="btn btn-primary float-start" @click="submit">
      Сохранить
    </Button>
    <Button
      class="btn btn-primary float-end"
      v-if="this.user.id"
      @click="deleteR"
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
import { useRoleStore } from "@/store2/admingroup/role";

import { useUserStore } from "@/store2/admingroup/user";
import { useUserRoleStore } from "@/store2/admingroup/userRole";
import { useStudentStore } from "@/store2/studentgroup/student";
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
import Student from "@/model/student-group/Student";
import Role from "@/model/admin-group/Role";
import User from "@/model/admin-group/User";
import UserRole from "@/model/admin-group/UserRole";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

import OnlyDocumentEditor from "@/components/base/OnlyDocumentEditor.vue";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";
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
    OnlyDocumentEditor,
  },
  setup() {
    const localeText = AG_GRID_LOCALE_RU;
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
    const maxDialog = ref();

    function biggifyDialog() {
      maxDialog.value.maximized = true;
    }
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
          field: "username",
          headerName: "Пользователь",
          minWidth: 250,
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
      localeText,
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
      biggifyDialog,
      maxDialog,
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
      student: new Student(),
      role: new Role(),
      user: new User(),
      errors: {},
      valid: false,
      scheme: null,
      scheme2: null,
      docPreview: false,
      filePath: null,
      selectedRoles: [],
    };
  },
  async mounted() {
    await this.getRoleList();
    await this.getUserRoleList();
    await this.getUserList();

    this.loadUserssData();
    this.scheme = new FormScheme([
      new TextInput({
        key: "username",
        label: "Имя пользователя",
        icon: "pi pi-id-card",
        validation: [],
      }),
      new TextInput({
        key: "password",
        label: "Пароль",
        placeholder: "*********",
        icon: "pi pi-id-card",
        validation: [],
      }),
    ]);
  },
  methods: {
    ...mapActions(useRoleStore, [
      "getRoleList",
      "postRole",
      ,
      "putRole",
      "deleteRole",
      "uploadGeneratedFile",
    ]),
    ...mapActions(useUserStore, [
      "getUserList",
      "postUser",
      ,
      "putUser",
      "deleteUser",
      "uploadGeneratedFile",
      "deauthUser",
    ]),
    ...mapActions(useUserRoleStore, [
      "getUserRoleList",
      "postUserRole",
      "getUserRoleList",
      "putUserRole",
      "deleteUserRole",
      "uploadGeneratedFile",
      "deleteUserRoleByUserId",
    ]),
    ...mapActions(useStudentStore, [
      "getStudentList",
      "postStudent",
      ,
      "putStudent",
      "deleteStudent",
      "uploadGeneratedFile",
    ]),
    ...mapActions(useGroupStore, ["getGroupList"]),
    // Check if the role belongs to this user's initial roles
    isOwnRole(roleId) {
      if (!this.user.id) return false;
      
      // Find the initial roles this user had before editing
      const initialRoles = this.userRoleList
        .filter(ur => ur.userid === this.user.id)
        .map(ur => ur.roleid);
        
      return initialRoles.includes(roleId);
    },
    async deauthUserWithId(userId) {
      await this.deauthUser(userId);
    },
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    resetUser() {
      this.user = new User();
    },
    edit(event) {
      this.resetUser();
      this.user = event.data;

      // Find all roles for this user
      this.selectedRoles = this.userRoleList
        .filter((ur) => ur.userid === this.user.id)
        .map((ur) => ur.roleid);
        
      console.log("User roles:", this.selectedRoles);
      this.formVisible = true;
    },
    async previewDocx() {
      await this.createDocx();

      this.docPreview = true;
    },
    openCreatingForm() {
      this.resetUser();
      this.selectedRoles = [];
      this.formVisible = true;
    },
    async validateForm() {
      let isValid = true;
      const errors = {};

      for (const item of this.scheme.items) {
        const result = item.validate(this.user[item.key]);

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
      let user = { ...this.user };
      let userId;
      if (user.id) {
        await this.putUser(user);
        userId = user.id;
        
        // Get the user's original roles
        const originalRoles = this.userRoleList
          .filter(ur => ur.userid === user.id)
          .map(ur => ur.roleid);
        
        // Clear this user's previous roles if any, while preserving the original roles
        await this.deleteUserRoleByUserId({id: user.id});
        
        // Make sure all original roles are included in selectedRoles
        for (const roleId of originalRoles) {
          if (!this.selectedRoles.includes(roleId)) {
            this.selectedRoles.push(roleId);
          }
        }
      } else {
        const resp = await this.postUser(user);
        userId = resp.id;
        
        // For new users, don't assign any roles selected in the UI
        // since the role selection is hidden for new users
        this.selectedRoles = [];
      }
      
      // Assign roles
      for (const roleId of this.selectedRoles) {
        const userRole = new UserRole();
        userRole.userid = userId;
        userRole.roleid = roleId;
        await this.postUserRole(userRole);
      }
      
      await this.getUserRoleList();
      await this.getRoleList();
      this.formVisible = false;
      this.resetUser();
      this.selectedRoles = [];
      this.loadUserssData();
    },

    async deleteR() {
      let user = { ...this.user };

      await this.deleteUser(user);
      this.formVisible = false;
      this.resetUser();
      this.loadUserssData();
    },

    async loadUserssData() {
      try {
        this.rowData.value = this.userList;
        this.loading = false;
      } catch (error) {
        console.error("Error loading users data:", error);
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
    ...mapState(useStudentStore, ["studentList", "activeSortedStudents"]),
    ...mapState(useRoleStore, ["roleList"]),
    ...mapState(useUserStore, ["userList", "userMap"]),
    ...mapState(useUserRoleStore, ["userRoleList", "userRoleMap"]),
    ...mapState(useUserStore, ["userList"]),
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

.text-center * {
  justify-content: center;
  display: flex;
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

.dialog {
  flex: 1;
  :deep(p-dialog p-component dialog) {
    flex: 1;
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
  grid-template-columns: repeat(5, 1fr);
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

/* Role selection styling */
.role-selection {
  min-width: 250px;
  max-width: 350px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 10px !important;
  background-color: #f8f9fa;
}

.role-selection h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.role-list {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 5px;
}

.role-item {
  margin-bottom: 8px;
}

.role-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.role-label input {
  margin-right: 8px;
}

.own-role {
  font-weight: bold;
  color: #446334;
}

/* Style disabled checkboxes */
.form-check-input:disabled {
  opacity: 0.7;
  background-color: #e9ecef;
  cursor: not-allowed;
}
</style>

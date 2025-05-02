<template>
  <div class="container-fluid p-0 d-flex flex-column flex-1" v-if="!loading">
    <!-- Title Row -->
    <div class="row g-2">
      <div class="col-12 p-0 title-container">
        <span v-if="!spisok">Список всех таблиц</span>
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

    <!-- Add Table Button Row -->
    <div class="row g-2 mb-2">
      <div class="col-4 p-0">
        <button
          @click="openCreatingForm"
          class="btn btn-primary w-100"
          type="button"
        >
          <i class="material-icons-outlined me-1">add</i>Добавить таблицу
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
    header="Форма таблиц"
    :style="{ flex: 1 }"
    @hide="onDialogHide"
  >
    <div class="card flex flex-row">
      <div class="form flex flex-1 flex-row card__form">
        <TabView class="w-100">
          <TabPanel header="Визуальный редактор">
            <div class="table-editor">
              <div class="form-group mb-3">
                <label class="form-label">Название таблицы</label>
                <input 
                  v-model="tableEditor.tableName" 
                  class="form-control" 
                  placeholder="Имя таблицы"
                  @input="updateSqlFromVisualEditor"
                />
              </div>
              
              <div class="table-columns mb-3">
                <h4>Колонки</h4>
                <div class="column-list">
                  <div v-for="(column, index) in tableEditor.columns" :key="index" class="column-item p-2 mb-2 border rounded">
                    <div class="d-flex mb-2 align-items-center">
                      <div class="flex-grow-1">
                        <label class="form-label mb-1">Имя колонки</label>
                        <input 
                          v-model="column.name" 
                          class="form-control" 
                          placeholder="Имя колонки"
                          @input="updateSqlFromVisualEditor"
                        />
                      </div>
                      <button class="btn btn-danger ms-2" style="height: auto" @click="removeColumn(index)">
                        <i class="material-icons-outlined">delete</i>
                      </button>
                    </div>
                    
                    <div class="row mb-2">
                      <div class="col-md-4">
                        <label class="form-label mb-1">Тип данных</label>
                        <select 
                          v-model="column.type" 
                          class="form-select"
                          @change="updateSqlFromVisualEditor"
                        >
                          <option v-for="type in postgresTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                          </option>
                        </select>
                      </div>
                      
                      <div class="col-md-4" v-if="column.type.includes('character') || column.type.includes('varchar')">
                        <label class="form-label mb-1">Размер</label>
                        <input 
                          v-model="column.length" 
                          type="number" 
                          class="form-control"
                          placeholder="255" 
                          @input="updateSqlFromVisualEditor"
                        />
                      </div>

                      <div class="col-md-4">
                        <label class="form-label mb-1">Значение по умолчанию</label>
                        <input 
                          v-model="column.defaultValue" 
                          class="form-control" 
                          placeholder="Значение"
                          @input="updateSqlFromVisualEditor"
                        />
                      </div>
                    </div>
                    
                    <div class="row constraints">
                      <div class="col-md-3">
                        <div class="form-check">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            v-model="column.primaryKey"
                            @change="updateSqlFromVisualEditor"
                          >
                          <label class="form-check-label">Primary Key</label>
                        </div>
                      </div>
                      
                      <div class="col-md-3">
                        <div class="form-check">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            v-model="column.notNull"
                            @change="updateSqlFromVisualEditor"
                          >
                          <label class="form-check-label">Not Null</label>
                        </div>
                      </div>
                      
                      <div class="col-md-3">
                        <div class="form-check">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            v-model="column.unique"
                            @change="updateSqlFromVisualEditor"
                          >
                          <label class="form-check-label">Unique</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button class="btn btn-primary mt-2" @click="addColumn">
                  <i class="material-icons-outlined me-1">add</i>Добавить колонку
                </button>
              </div>

              <div class="foreign-keys mb-3">
                <h4>Внешние ключи</h4>
                <div class="fk-list">
                  <div v-for="(fk, index) in tableEditor.foreignKeys" :key="index" class="fk-item p-2 mb-2 border rounded">
                    <div class="row mb-2">
                      <div class="col-md-5">
                        <label class="form-label mb-1">Колонка</label>
                        <select 
                          v-model="fk.columnName" 
                          class="form-select"
                          @change="updateSqlFromVisualEditor"
                        >
                          <option value="">Выберите колонку</option>
                          <option v-for="column in tableEditor.columns" :key="column.name" :value="column.name">
                            {{ column.name }}
                          </option>
                        </select>
                      </div>
                      
                      <div class="col-md-5">
                        <label class="form-label mb-1">Ссылка на таблицу</label>
                        <select 
                          v-model="fk.referencedTable" 
                          class="form-select"
                          @change="onForeignTableChanged(index)"
                        >
                          <option value="">Выберите таблицу</option>
                          <option v-for="table in tableUserList" :key="table.table_name" :value="table.table_name">
                            {{ table.table_name }}
                          </option>
                        </select>
                      </div>
                      
                      <div class="col-md-2">
                        <button class="btn btn-danger ms-2 mt-4" @click="removeForeignKey(index)">
                          <i class="material-icons-outlined">delete</i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="row">
                      <div class="col-md-5">
                        <label class="form-label mb-1">Ссылка на колонку</label>
                        <select 
                          v-model="fk.referencedColumn" 
                          class="form-select"
                          @change="updateSqlFromVisualEditor"
                          :disabled="!fk.referencedTable"
                        >
                          <option value="">Выберите колонку</option>
                          <option v-for="column in getColumnsForTable(fk.referencedTable)" :key="column" :value="column">
                            {{ column }}
                          </option>
                        </select>
                      </div>
                      <div class="col-md-7">
                        <div v-if="fk.referencedTable && getColumnsForTable(fk.referencedTable).length === 0" 
                             class="alert alert-warning mt-2">
                          Не удалось извлечь колонки из таблицы. Введите имя колонки вручную:
                          <input 
                            v-model="fk.referencedColumn" 
                            class="form-control mt-1" 
                            placeholder="Имя колонки"
                            @input="updateSqlFromVisualEditor"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <!-- Foreign Key Behavior Options -->
                    <div class="row mt-2" v-if="fk.columnName && fk.referencedTable && fk.referencedColumn">
                      <div class="col-md-4">
                        <label class="form-label mb-1">MATCH</label>
                        <select 
                          v-model="fk.matchType" 
                          class="form-select"
                          @change="updateSqlFromVisualEditor"
                        >
                          <option value="SIMPLE">SIMPLE</option>
                          <option value="FULL">FULL</option>
                          <option value="PARTIAL">PARTIAL</option>
                        </select>
                      </div>
                      
                      <div class="col-md-4">
                        <label class="form-label mb-1">ON UPDATE</label>
                        <select 
                          v-model="fk.onUpdate" 
                          class="form-select"
                          @change="updateSqlFromVisualEditor"
                        >
                          <option value="NO ACTION">NO ACTION</option>
                          <option value="RESTRICT">RESTRICT</option>
                          <option value="CASCADE">CASCADE</option>
                          <option value="SET NULL">SET NULL</option>
                          <option value="SET DEFAULT">SET DEFAULT</option>
                        </select>
                      </div>
                      
                      <div class="col-md-4">
                        <label class="form-label mb-1">ON DELETE</label>
                        <select 
                          v-model="fk.onDelete" 
                          class="form-select"
                          @change="updateSqlFromVisualEditor"
                        >
                          <option value="NO ACTION">NO ACTION</option>
                          <option value="RESTRICT">RESTRICT</option>
                          <option value="CASCADE">CASCADE</option>
                          <option value="SET NULL">SET NULL</option>
                          <option value="SET DEFAULT">SET DEFAULT</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button class="btn btn-primary mt-2" @click="addForeignKey">
                  <i class="material-icons-outlined me-1">add</i>Добавить внешний ключ
                </button>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel header="SQL код">
            <Textarea
              v-model="tableUser.table_definition"
              rows="30"
              class="flex-1"
              @input="onSqlChanged"
            ></Textarea>
          </TabPanel>
          
          <TabPanel header="Разрешения" v-if="tableUser.id">
            <div class="permissions-editor p-3">
              <h3 class="mb-3">Управление разрешениями</h3>
              
              <div class="form-group mb-4">
                <label class="form-label">Выберите роль</label>
                <Dropdown
                  v-model="selectedRoleId"
                  :options="roleList"
                  optionLabel="rolename"
                  optionValue="roleid"
                  placeholder="Выберите роль"
                  class="w-100"
                  @change="loadPermissions"
                />
              </div>
              
              <div v-if="selectedRoleId" class="permissions-table mb-4">
                <h4 class="mb-3">Разрешения для {{ getSelectedRoleName }}</h4>
                <DataTable :value="operations" class="permissions-datatable">
                  <Column field="label" header="Операция"></Column>
                  <Column header="Разрешено" class="text-center" style="width: 150px">
                    <template #body="slotProps">
                      <Checkbox 
                        v-model="selectedPermissions" 
                        :value="slotProps.data.value" 
                        :binary="false"
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>
              
              <div v-if="!selectedRoleId" class="p-3 bg-light rounded mb-4">
                <p class="mb-0">Выберите роль для настройки разрешений.</p>
              </div>
              
              <Button 
                v-if="selectedRoleId"
                label="Сохранить разрешения" 
                icon="pi pi-save" 
                class="p-button-primary" 
                @click="submitPermissions"
              />
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
    
    <div class="dialog-footer mt-3">
      <Button 
        label="Сохранить" 
        icon="pi pi-check" 
        class="p-button-primary" 
        @click="submit"
        :disabled="!hasChanges"
      />
      <Button 
        v-if="tableUser.id"
        label="Удалить" 
        icon="pi pi-trash" 
        class="p-button-danger ml-2" 
        @click="deleteR"
      />
    </div>
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
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

import { useRoute } from "vue-router";
import { mapState, mapActions } from "pinia";
import { useRoleStore } from "@/store2/admingroup/role";
import { useTableUserStore } from "@/store2/admingroup/tableUser";
import { usePermissionStore } from "@/store2/admingroup/permission";
import { useUserStore } from "@/store2/admingroup/user";
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
import TableUser from "@/model/admin-group/TableUser";
import Permission from "@/model/admin-group/Permission";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { AG_GRID_LOCALE_RU } from "@/ag-grid-russian.js";
import OnlyDocumentEditor from "@/components/base/OnlyDocumentEditor.vue";

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
    TabView,
    TabPanel,
    Dropdown,
    DataTable,
    Column,
    Checkbox,
    Button,
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
          field: "table_name",
          headerName: "Название таблицы",
          minWidth: 250,
        },
        {
          field: "username",
          headerName: "Владелец",
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
      localeText,
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
      tableUser: new TableUser(),
      originalTableDefinition: null, // Store original definition for comparison
      hasChanges: false, // Track if changes were made
      errors: {},
      valid: false,
      scheme: null,
      scheme2: null,
      docPreview: false,
      filePath: null,
      permissions: {},
      operations: [
        { label: "INSERT", value: 0 },
        { label: "SELECT", value: 1 },
        { label: "UPDATE", value: 2 },
        { label: "DELETE", value: 3 },
        { label: "ALTER", value: 4 },
        { label: "DROP", value: 5 },
        { label: "TRIGGER", value: 6 },
        { label: "INDEX", value: 7 },
        { label: "VACUUM", value: 8 },
        { label: "ANALYZE", value: 9 },
        { label: "ALL PRIVILEGES", value: 10 },
      ],
      selectedPermissions: [],
      selectedRoleId: null,
      tableEditor: {
        tableName: "",
        columns: [],
        foreignKeys: []
      },
      postgresTypes: [
        { label: "integer", value: "integer" },
        { label: "bigint", value: "bigint" },
        { label: "smallint", value: "smallint" },
        { label: "character varying", value: "character varying" },
        { label: "varchar", value: "varchar" },
        { label: "text", value: "text" },
        { label: "date", value: "date" },
        { label: "timestamp", value: "timestamp" },
        { label: "timestamp without time zone", value: "timestamp without time zone" },
        { label: "timestamp with time zone", value: "timestamp with time zone" },
        { label: "boolean", value: "boolean" },
        { label: "decimal", value: "decimal" },
        { label: "numeric", value: "numeric" },
        { label: "real", value: "real" },
        { label: "double precision", value: "double precision" },
        { label: "json", value: "json" },
        { label: "jsonb", value: "jsonb" },
        { label: "uuid", value: "uuid" },
        { label: "character", value: "character" },
        { label: "bytea", value: "bytea" },
        { label: "time", value: "time" },
        { label: "time with time zone", value: "time with time zone" },
        { label: "interval", value: "interval" },
        { label: "cidr", value: "cidr" },
        { label: "inet", value: "inet" },
        { label: "macaddr", value: "macaddr" },
        { label: "bit", value: "bit" },
        { label: "bit varying", value: "bit varying" },
        { label: "money", value: "money" },
        { label: "xml", value: "xml" },
        { label: "serial", value: "serial" },
        { label: "bigserial", value: "bigserial" },
        { label: "smallserial", value: "smallserial" },
        { label: "point", value: "point" },
        { label: "line", value: "line" },
        { label: "lseg", value: "lseg" },
        { label: "box", value: "box" },
        { label: "path", value: "path" },
        { label: "polygon", value: "polygon" },
        { label: "circle", value: "circle" },
      ]
    };
  },
  async mounted() {
    await this.getRoleList();
    await this.getTableUserList();
    await this.getPermissionList();
    await this.getUserList();
    this.loadTablesData();
    this.scheme = new FormScheme([
      new TextInput({
        key: "tabledefinition",
        label: "Определение функции",
        placeholder: "Определение функции",
        icon: "pi pi-id-card",
        validation: [],
      }),
    ]);
  },
  methods: {
    addColumn() {
      this.tableEditor.columns.push({
        name: "",
        type: "character varying",
        length: "255",
        defaultValue: "",
        primaryKey: false,
        notNull: false,
        unique: false
      });
      this.updateSqlFromVisualEditor();
    },
    
    removeColumn(index) {
      this.tableEditor.columns.splice(index, 1);
      // Also remove foreign keys that reference this column
      this.tableEditor.foreignKeys = this.tableEditor.foreignKeys.filter(
        fk => fk.columnName !== this.tableEditor.columns[index]?.name
      );
      this.updateSqlFromVisualEditor();
    },
    
    addForeignKey() {
      if (this.tableEditor.columns.length > 0) {
        this.tableEditor.foreignKeys.push({
          columnName: this.tableEditor.columns[0].name,
          referencedTable: "",
          referencedColumn: "",
          matchType: "SIMPLE",
          onUpdate: "NO ACTION",
          onDelete: "NO ACTION"
        });
        this.updateSqlFromVisualEditor();
      }
    },
    
    removeForeignKey(index) {
      this.tableEditor.foreignKeys.splice(index, 1);
      this.updateSqlFromVisualEditor();
    },
    
    updateSqlFromVisualEditor() {
      let sql = `CREATE TABLE ${this.tableEditor.tableName} (\n`;
      
      // Add columns
      const columnDefs = this.tableEditor.columns.map(column => {
        // Handle column name (add quotes if needed)
        const columnName = column.name.includes(' ') || /[A-Z]/.test(column.name) ? 
          `"${column.name}"` : column.name;
        
        let colDef = `    ${columnName} ${column.type}`;
        
        // Add length for character types
        if ((column.type.includes('character') || column.type.includes('varchar')) && column.length) {
          colDef += `(${column.length})`;
        }
        
        // Add default value if present
        if (column.defaultValue) {
          colDef += ` DEFAULT ${column.defaultValue}`;
        }
        
        // Add constraints
        if (column.notNull) {
          colDef += ' NOT NULL';
        }
        
        // Add UNIQUE constraint directly to the column definition
        if (column.unique && !column.primaryKey) {
          colDef += ' UNIQUE';
        }
        
        return colDef;
      });
      
      // Add primary key constraint if any column is marked as PK
      const pkColumns = this.tableEditor.columns
        .filter(c => c.primaryKey)
        .map(c => c.name.includes(' ') || /[A-Z]/.test(c.name) ? `"${c.name}"` : c.name);
      
      if (pkColumns.length > 0) {
        columnDefs.push(`    CONSTRAINT ${this.getTableBaseName()}_pkey PRIMARY KEY (${pkColumns.join(', ')}) NOT DEFERRABLE INITIALLY IMMEDIATE`);
      }
      
      // Add foreign key constraints
      const fkDefs = this.tableEditor.foreignKeys
        .filter(fk => fk.columnName && fk.referencedTable && fk.referencedColumn)
        .map((fk, index) => {
          const constraintName = `fk_${fk.columnName}_${index}`;
          return `    CONSTRAINT ${constraintName} FOREIGN KEY (${fk.columnName}) REFERENCES ${fk.referencedTable}(${fk.referencedColumn}) MATCH ${fk.matchType || 'SIMPLE'} ON UPDATE ${fk.onUpdate || 'NO ACTION'} ON DELETE ${fk.onDelete || 'NO ACTION'} NOT DEFERRABLE INITIALLY IMMEDIATE`;
        });
      
      // Combine all definitions
      sql += [...columnDefs, ...fkDefs].join(',\n');
      sql += '\n);\n';
      
      // Add basic index for primary key
      if (pkColumns.length > 0) {
        sql += `\nCREATE UNIQUE INDEX ${this.getTableBaseName()}_pkey ON ${this.tableEditor.tableName} USING btree (${pkColumns.join(', ')});\n`;
      }
      
      this.tableUser.table_definition = sql;
      this.checkForChanges(); // Check if changes were made
    },
    
    // Helper method to get the base table name without schema
    getTableBaseName() {
      const parts = this.tableEditor.tableName.split('.');
      return parts.length > 1 ? parts[1] : parts[0];
    },
    
    parseTableDefinition() {
      try {
        const sql = this.tableUser.table_definition;
        if (!sql || !sql.toLowerCase().includes('create table')) {
          return;
        }
        
        // Reset the editor
        this.tableEditor = {
          tableName: "",
          columns: [],
          foreignKeys: []
        };
        
        // Extract table name - now handling schema qualification (public.table_name)
        const tableNameMatch = sql.match(/CREATE\s+TABLE\s+(?:(\w+)\.)?([^\s(]+)\s*\(/i);
        if (tableNameMatch) {
          // Use the full name (with schema if present)
          this.tableEditor.tableName = tableNameMatch[1] ? 
            `${tableNameMatch[1]}.${tableNameMatch[2]}` : 
            tableNameMatch[2];
        }
        
        // Extract the CREATE TABLE statement
        const createTableMatch = sql.match(/(CREATE\s+TABLE\s+.+?);/is);
        if (!createTableMatch) return;
        
        const createTableStatement = createTableMatch[1];
        
        // Extract column definitions and constraints
        const tableBodyMatch = createTableStatement.match(/\(([\s\S]*)\)$/i);
        if (!tableBodyMatch || !tableBodyMatch[1]) return;
        
        const tableBody = tableBodyMatch[1];
        
        // Split by commas but be careful with commas in parentheses (for types)
        let depth = 0;
        let currentStatement = '';
        const statements = [];
        
        for (let i = 0; i < tableBody.length; i++) {
          const char = tableBody[i];
          if (char === '(') {
            depth++;
            currentStatement += char;
          } else if (char === ')') {
            depth--;
            currentStatement += char;
          } else if (char === ',' && depth === 0) {
            statements.push(currentStatement.trim());
            currentStatement = '';
          } else {
            currentStatement += char;
          }
        }
        
        if (currentStatement) {
          statements.push(currentStatement.trim());
        }
        
        // Process each statement
        for (const statement of statements) {
          if (statement.toLowerCase().includes('constraint') && statement.toLowerCase().includes('primary key')) {
            // Primary key constraint
            const pkMatch = statement.match(/PRIMARY\s+KEY\s+\(([^)]+)\)/i);
            if (pkMatch && pkMatch[1]) {
              const pkColumns = pkMatch[1].split(',').map(col => col.trim().replace(/"/g, ''));
              
              // Mark columns as PKs
              for (const col of this.tableEditor.columns) {
                if (pkColumns.includes(col.name) || pkColumns.includes(col.name.replace(/"/g, ''))) {
                  col.primaryKey = true;
                }
              }
            }
          } else if (statement.toLowerCase().includes('constraint') && statement.toLowerCase().includes('foreign key')) {
            // Foreign key constraint - now with more complex match for PostgreSQL's enhanced FK syntax
            const fkMatch = statement.match(/FOREIGN\s+KEY\s+\(([^)]+)\)\s+REFERENCES\s+(?:(\w+)\.)?([^\s(]+)\s*\(([^)]+)\)/i);
            if (fkMatch) {
              const columnName = fkMatch[1].trim().replace(/"/g, '');
              let referencedTable = fkMatch[3].trim();
              
              // Add schema qualification if present
              if (fkMatch[2]) {
                referencedTable = `${fkMatch[2]}.${referencedTable}`;
              }
              
              const referencedColumn = fkMatch[4].trim().replace(/"/g, '');
              
              // Extract MATCH type
              let matchType = "SIMPLE"; // Default
              const matchMatch = statement.match(/MATCH\s+(SIMPLE|FULL|PARTIAL)/i);
              if (matchMatch) {
                matchType = matchMatch[1].toUpperCase();
              }
              
              // Extract ON UPDATE action
              let onUpdate = "NO ACTION"; // Default
              const onUpdateMatch = statement.match(/ON\s+UPDATE\s+(NO\s+ACTION|RESTRICT|CASCADE|SET\s+NULL|SET\s+DEFAULT)/i);
              if (onUpdateMatch) {
                onUpdate = onUpdateMatch[1].toUpperCase();
              }
              
              // Extract ON DELETE action
              let onDelete = "NO ACTION"; // Default
              const onDeleteMatch = statement.match(/ON\s+DELETE\s+(NO\s+ACTION|RESTRICT|CASCADE|SET\s+NULL|SET\s+DEFAULT)/i);
              if (onDeleteMatch) {
                onDelete = onDeleteMatch[1].toUpperCase();
              }
              
              this.tableEditor.foreignKeys.push({
                columnName,
                referencedTable,
                referencedColumn,
                matchType,
                onUpdate,
                onDelete
              });
            }
          } else {
            // Regular column definition
            // Handle quoted identifiers with regex that accepts either quoted or unquoted names
            const columnNameMatch = statement.match(/^\s*(?:"([^"]+)"|(\w+))\s+/);
            if (!columnNameMatch) continue;
            
            // Get column name, preferring the quoted version if present
            const columnName = columnNameMatch[1] || columnNameMatch[2];
            
            // Get the remaining part after column name - adjust for quoted identifiers
            let remainingDef = statement.slice(columnNameMatch[0].length).trim();
            
            // Extract data type - handle special cases for types with spaces
            let dataType = "";
            let length = "";
            
            // Common constraints to identify where the data type ends
            const constraintKeywords = [
              "NOT NULL", "NULL", "DEFAULT", "UNIQUE", "PRIMARY KEY", 
              "CHECK", "REFERENCES", "CONSTRAINT"
            ];
            
            // Find where the data type ends by looking for constraint keywords
            let typeEndIndex = remainingDef.length;
            for (const keyword of constraintKeywords) {
              // Check for keyword with space before it
              const keywordIndex = remainingDef.toUpperCase().indexOf(` ${keyword}`);
              if (keywordIndex > 0 && keywordIndex < typeEndIndex) {
                typeEndIndex = keywordIndex;
              }
              
              // Also check for keyword at the start (for cases without space)
              if (remainingDef.toUpperCase().startsWith(keyword)) {
                typeEndIndex = 0;
                break;
              }
            }
            
            // Extract just the data type part
            const dataTypePart = remainingDef.substring(0, typeEndIndex).trim();
            
            // Try to match a type with a length specification: "type(length)"
            const typeWithLengthMatch = dataTypePart.match(/^(\w+(?:\s+\w+)*)\(([^)]+)\)/);
            if (typeWithLengthMatch) {
              dataType = typeWithLengthMatch[1].trim();
              length = typeWithLengthMatch[2];
            } else {
              // If no length is specified, the whole string is the data type
              dataType = dataTypePart;
            }
            
            // Find the best matching PostgreSQL type from our list
            const matchedType = this.findMatchingPostgresType(dataType);
            if (matchedType) {
              dataType = matchedType;
            }
            
            // Check for constraints
            const notNull = statement.toLowerCase().includes('not null');
            const unique = statement.toLowerCase().includes('unique');
            
            // Extract default value if present - handle complex default expressions
            let defaultValue = "";
            const defaultMatch = statement.match(/DEFAULT\s+([^,]+?)(?:\s+(?:NOT NULL|NULL|UNIQUE|PRIMARY KEY|CHECK|REFERENCES|CONSTRAINT)|$)/i);
            if (defaultMatch) {
              defaultValue = defaultMatch[1].trim();
            }
            
            // Check if this column is explicitly mentioned in any UNIQUE constraint
            const isPartOfUniqueConstraint = statements.some(stmt => {
              return stmt.toLowerCase().includes('unique') && 
                     (stmt.toLowerCase().includes(`(${columnName.toLowerCase()})`) ||
                      stmt.toLowerCase().includes(`( ${columnName.toLowerCase()} )`) ||
                      stmt.toLowerCase().includes(`("${columnName.toLowerCase()}")`));
            });
            
            this.tableEditor.columns.push({
              name: columnName,
              type: dataType,
              length: length,
              defaultValue: defaultValue,
              primaryKey: false, // Will be set in PK constraint processing
              notNull: notNull,
              unique: unique || isPartOfUniqueConstraint
            });
          }
        }
        
        // Check if changes were made
        this.checkForChanges();
      } catch (error) {
        console.error('Error parsing SQL:', error);
      }
    },
    
    async loadPermissions() {
      // Загружаем разрешения для выбранной роли
      const rolePermissions = this.permissionList.filter(
        (perm) =>
          perm.roleid === this.selectedRoleId &&
          perm.tablename === this.tableUser.table_name
      );

      this.selectedPermissions = rolePermissions.map((perm) => perm.operation);
    },

    async submitPermissions() {
      // Удаляем старые разрешения для выбранной роли
      const existingPermissions = this.permissionList.filter(
        (perm) =>
          perm.roleid === this.selectedRoleId &&
          perm.tablename === this.tableUser.table_name
      );

      for (const perm of existingPermissions) {
        await this.deletePermission(perm);
      }

      // Добавляем новые разрешения для выбранной роли
      for (const operation of this.selectedPermissions) {
        const newPermission = new Permission({
          roleid: this.selectedRoleId,
          tablename: this.tableUser.table_name,
          operation,
        });
        await this.postPermission(newPermission);
      }

      this.formVisible = false;
      this.resetTableUser();
      this.loadTablesData();
    },

    getPermissionsForTable(tableName) {
      const permissions = this.permissionList
        .filter((perm) => perm.tablename === tableName)
        .map((perm) => perm.operation);
      return permissions;
    },
    ...mapActions(useRoleStore, [
      "getRoleList",
      "postRole",
      ,
      "putRole",
      "deleteRole",
      "uploadGeneratedFile",
    ]),
    ...mapActions(useTableUserStore, [
      "getTableUserList",
      "postTableUser",
      ,
      "putTableUser",
      "deleteTableUser",
      "uploadGeneratedFile",
    ]),
    ...mapActions(useUserStore, ["getUserList"]),
    ...mapActions(usePermissionStore, [
      "getPermissionList",
      "postPermission",
      ,
      "putPermission",
      "deletePermission",
      "uploadGeneratedFile",
    ]),
    ...mapActions(useGroupStore, ["getGroupList"]),
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    resetTableUser() {
      this.role = new Role();
      this.tableUser = new TableUser();
      this.selectedRoleId = null;
      this.tableEditor = {
        tableName: "",
        columns: [],
        foreignKeys: []
      };
      this.originalTableDefinition = null;
      this.hasChanges = false;
    },
    edit(event) {
      this.resetTableUser();
      this.tableUser = event.data;
      this.originalTableDefinition = event.data.table_definition;
      this.hasChanges = false;
      this.formVisible = true;
      // Parse the SQL to populate the visual editor
      this.$nextTick(() => {
        this.parseTableDefinition();
      });
    },
    async previewDocx() {
      await this.createDocx();

      this.docPreview = true;
    },
    openCreatingForm() {
      this.resetTableUser();
      // Initialize with an empty table structure
      this.tableEditor = {
        tableName: "new_table",
        columns: [{
          name: "id",
          type: "integer",
          length: "",
          defaultValue: "",
          primaryKey: true,
          notNull: true,
          unique: false
        }],
        foreignKeys: []
      };
      this.updateSqlFromVisualEditor();
      this.originalTableDefinition = null; // New table doesn't have original definition
      this.hasChanges = true; // For new tables, always enable saving
      this.formVisible = true;
    },
    async validateForm() {
      let isValid = true;
      const errors = {};

      for (const item of this.scheme.items) {
        const result = item.validate(this.role[item.key]);

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
      let tableUser = { ...this.tableUser };
      if (tableUser.id) {
        await this.putTableUser(tableUser.table_definition);
      } else {
        await this.postTableUser(tableUser.table_definition);
      }
      this.formVisible = false;
      this.resetTableUser();
      this.loadTablesData();
    },

    async deleteR() {
      let tableUser = { ...this.tableUser };

      await this.deleteTableUser(tableUser);
      this.formVisible = false;
      this.resetTableUser();
      this.loadTablesData();
    },

    async loadTablesData() {
      try {
        if (Array.isArray(this.roleList)) {
          // Filter out roles where deleted_at is not null and sort by full_name
          this.rowData.value = this.tableUserList;
        } else {
          // Handle case where roleList is not an array

          this.rowData.value = [];
        }
        this.loading = false;
      } catch (error) {
        console.error("Error loading roles data:", error);
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
      // This table will be called whenever filters change.
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
    onForeignTableChanged(index) {
      const fk = this.tableEditor.foreignKeys[index];
      // Reset referenced column when table changes
      fk.referencedColumn = "";
      
      // Force Vue to refresh columns by cloning and reassigning the foreign key object
      this.$nextTick(() => {
        // This helps trigger reactivity for the column dropdown
        this.tableEditor.foreignKeys[index] = { ...fk };
      });
      
      this.updateSqlFromVisualEditor();
    },
    
    getColumnsForTable(tableName) {
      if (!tableName) return [];
      
      console.log("Getting columns for table:", tableName);
      console.log("Available tables:", this.tableUserList.map(t => t.table_name));
      
      // Find the referenced table in the tableUserList
      // Handle schema-qualified names by comparing just the table part if needed
      const referencedTable = this.tableUserList.find(t => {
        if (tableName.includes('.')) {
          // If the searched table has a schema, compare full names
          const match = t.table_name === tableName || 
                 // Or try comparing with "public." prefix
                 `public.${t.table_name}` === tableName;
          if (match) console.log("Found table by qualified name:", t.table_name);
          return match;
        } else {
          // If no schema in search, match either simple name or extract from schema.table
          const match = t.table_name === tableName || 
                 t.table_name.split('.').pop() === tableName;
          if (match) console.log("Found table by simple name:", t.table_name);
          return match;
        }
      });
      
      if (!referencedTable) {
        console.warn("Referenced table not found:", tableName);
        return [];
      }
      
      if (!referencedTable.table_definition) {
        console.warn("Table definition missing for:", tableName);
        return [];
      }
      
      console.log("Table definition:", referencedTable.table_definition);
      
      // Parse the table definition to extract columns
      try {
        const sqlDef = referencedTable.table_definition;
        // Extract anything between the first ( and the last ) in the CREATE TABLE statement
        let tableBody = "";
        const simpleMatch = sqlDef.match(/\(([^]*)\)/s);
        if (simpleMatch && simpleMatch[1]) {
          tableBody = simpleMatch[1];
          console.log("Extracted table body using simple regex");
        } else {
          console.warn("Failed to extract table body with regex");
          return [];
        }

        // Split table body by commas, taking care of parentheses
        let depth = 0;
        let currentStatement = '';
        const statements = [];
        
        for (let i = 0; i < tableBody.length; i++) {
          const char = tableBody[i];
          if (char === '(') {
            depth++;
            currentStatement += char;
          } else if (char === ')') {
            depth--;
            currentStatement += char;
          } else if (char === ',' && depth === 0) {
            statements.push(currentStatement.trim());
            currentStatement = '';
          } else {
            currentStatement += char;
          }
        }
        
        if (currentStatement) {
          statements.push(currentStatement.trim());
        }
        
        // Extract column names
        const columns = [];
        for (const statement of statements) {
          // Skip constraints, only look for column definitions
          if (!statement.toLowerCase().includes('constraint')) {
            // Extract the column name, supporting both quoted and unquoted names
            const columnNameMatch = statement.match(/^\s*(?:"([^"]+)"|([a-zA-Z0-9_]+))\s+/);
            if (columnNameMatch) {
              // Use the match from either the quoted or unquoted group
              const columnName = columnNameMatch[1] || columnNameMatch[2];
              if (columnName) {
                columns.push(columnName);
              }
            }
          }
        }
        
        console.log(`Found ${columns.length} columns for ${tableName}:`, columns);
        return columns;
      } catch (error) {
        console.error('Error parsing table for columns:', error);
        return [];
      }
    },
    findMatchingPostgresType(dataType) {
      // Normalize the dataType by trimming and converting to lowercase
      const normalizedType = dataType.trim().toLowerCase();
      
      // First try for exact match
      const exactMatch = this.postgresTypes.find(type => type.value.toLowerCase() === normalizedType);
      if (exactMatch) {
        return exactMatch.value;
      }
      
      // If no exact match, try partial match
      const partialMatch = this.postgresTypes.find(type => 
        normalizedType.includes(type.value.toLowerCase()) || 
        type.value.toLowerCase().includes(normalizedType)
      );
      
      return partialMatch ? partialMatch.value : dataType;
    },
    onDialogHide() {
      this.resetTableUser();
    },
    // Check if changes were made compared to original
    checkForChanges() {
      if (!this.originalTableDefinition) {
        // If no original definition (new table), always has changes
        this.hasChanges = true;
        return;
      }
      
      // Compare current with original
      this.hasChanges = this.tableUser.table_definition !== this.originalTableDefinition;
    },
    onSqlChanged() {
      // Called when SQL is directly edited in the textarea
      this.parseTableDefinition();
      this.checkForChanges();
    },
  },
  computed: {
    ...mapState(useStudentStore, ["studentList", "activeSortedStudents"]),
    ...mapState(useRoleStore, ["roleList"]),
    ...mapState(usePermissionStore, ["permissionList"]),
    ...mapState(useTableUserStore, ["tableUserList", "tableUserMap"]),
    ...mapState(useUserStore, ["userList"]),
    ...mapState(useGroupStore, ["groupList"]),
    getSelectedRoleName() {
      const role = this.roleList.find((r) => r.roleid === this.selectedRoleId);
      return role ? role.rolename : null;
    },
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

.table-editor {
  .column-item, .fk-item {
    background-color: #f8f9fa;
    transition: all 0.2s;
    
    &:hover {
      background-color: #e9ecef;
    }
  }
  
  .column-list, .fk-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  h4 {
    margin-bottom: 0.75rem;
    font-size: 1.15rem;
  }
  
  .btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
    
    &:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }
  }
}

// Make sure TabView takes full width
:deep(.p-tabview) {
  width: 100%;
  
  .p-tabview-panels {
    padding: 1.25rem;
  }
}

// Make Textarea take full width
:deep(.p-inputtextarea) {
  width: 100%;
}

// Permissions editor styling
.permissions-editor {
  .permissions-datatable {
    :deep(.p-datatable-header) {
      background-color: #f8f9fa;
    }
  }
}

// Dialog footer styling
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}
</style>

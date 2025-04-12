<template>
  <div class="col col-xs-9 col-lg-12 mt-4 list">
    <div v-if="!pr">
      <h1>Список всех квалификационных работ</h1>
    </div>
    <div v-if="pr">
      <h1>Список квалификационных работ с ФИО {{ pr_n }}</h1>
    </div>
    <div class="col col-12">
      <div class="mb-3 col col-12">
        <div class="col col-12">
          <button
            @click="openCreatingForm"
            class="btn btn-primary float-start"
            type="button"
          >
            <i class="material-icons-outlined">add</i>Добавить квал. работу
          </button>
          <button
            @click="previewDocx"
            class="mx-2 btn btn-primary float-start"
            type="button"
          >
            Отчёт о научных руководителях
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
        <br />
      </div>
    </div>
    <br />

    <br />
    <div style="height: 95vh">
      <div class="h-100 pt-5">
        <ag-grid-vue
          class="ag-theme-alpine"
          style="width: 100%; height: 100%"
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
  </div>
  <Dialog
    v-model:visible="formVisible"
    modal
    header="Форма квалификационных работ"
  >
    <div class="card flex flex-row">
      <div class="form card__form">
        <auto-form
          v-model="courseWork"
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
      v-if="this.courseWork.course_work_id"
      @click="deleteCW"
    >
      Удалить
    </Button>
  </Dialog>

  <Dialog
    v-model:visible="docPreview"
    header="Предпросмотр документа отчёт по научным руководителям"
    maximizable
    ref="maxDialog"
    @show="biggifyDialog"
    :header="props.name"
    class="w-full h-full md:w-5/6"
  >
    <OnlyDocumentEditor
      v-if="filePath"
      :documentUrl="filePath"
      documentTitle="Отчёт по научным руководителям"
      :objectType="objectType"
    />
  </Dialog>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3"; // the AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/student/CWButtonCell.vue";
import GroupHref from "@/components/student/GroupHrefCellRenderer.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import CourseWork from "@/model/student-group/CourseWork";
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
import { mapState, mapActions } from "pinia";
import { useCourseWorkStore } from "@/store2/studentgroup/courseWork";
import { useDepartamentStore } from "@/store2/teachergroup/departament";
import { useTeacherStore } from "@/store2/teachergroup/teacher";
import { useStudentStore } from "@/store2/studentgroup/student";
import * as XLSX from "xlsx";
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
    GroupHref,
    AutoForm,
    OnlyDocumentEditor,
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
          cellClass: "grid-cell-centered",
        },
        { field: "dep_name", headerName: "Кафедра" },
        { field: "course_work_theme", headerName: "Тема" },
        { field: "student_name", headerName: "ФИО студента" },
        { field: "teacher_name", headerName: "ФИО преподавателя" },
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
    const maxDialog = ref();
    function biggifyDialog() {
      maxDialog.value.maximized = true;
    }
    return {
      onGridReady,
      columnDefs,
      rowData,
      defaultColDef,
      maxDialog,
      localeText,
      deselectRows: () => {
        gridApi.value.deselectAll();
      },

      onFilterTextBoxChanged,
      paginationPageSize,
      biggifyDialog,
    };
  },
  data() {
    return {
      quickFilterValue: "",
      filters: false,
      pr: false,
      pr_n: null,
      courseWork: new CourseWork(),
      errors: {},
      valid: false,
      scheme: null,
      formVisible: false,
      docPreview: false,
      objectType: "excel",
    };
  },
  computed: {
    ...mapState(useCourseWorkStore, ["courseWorkList"]),
    ...mapState(useTeacherStore, ["teacherList"]),
    ...mapState(useDepartamentStore, ["departamentList"]),
    ...mapState(useStudentStore, ["activeSortedStudents"]),
  },
  async mounted() {
    await this.getTeacherList();

    await this.getDepartamentList();
    await this.getStudentList();
    await this.getCourseWorkList();
    this.loadCourseWorksData();
    this.scheme = new FormScheme([
      new TextInput({
        key: "course_work_theme",
        label: "Тема квал. работы",
        placeholder: "Введите тему квал. работы",
        icon: "pi pi-book",
        validation: [requiredRule],
      }),
      new ComboboxInput({
        key: "course_work_teacher_id",
        label: "Преподаватель",
        options: [
          ...[...this.teacherList].map((teacher) => ({
            label: `${teacher.first_name} ${teacher.last_name}`,
            value: teacher.teacher_id,
          })),
        ],
        validation: [requiredRule],
      }),
      new ComboboxInput({
        key: "course_work_student_id",
        label: "Студент",
        options: [
          ...[...this.activeSortedStudents].map((student) => ({
            label: `${student.first_name} ${student.last_name}`,
            value: student.student_id,
          })),
        ],
        validation: [requiredRule],
      }),
      new ComboboxInput({
        key: "course_work_kafedra",
        label: "Кафедра",
        options: [
          ...[...this.departamentList].map((departament) => ({
            label: departament.dep_name,
            value: departament.dep_id,
          })),
        ],
        validation: [requiredRule],
      }),
      new TextInput({
        key: "course_work_year",
        label: "Год квал. работы",
        placeholder: "Введите год",
        icon: "pi pi-calendar",
        validation: [requiredRule],
      }),
      new TextInput({
        key: "semester",
        label: "Семестер",
        placeholder: "Введите семестер",
        icon: "pi pi-calendar",
        validation: [requiredRule],
      }),
      new ComboboxInput({
        key: "course_work_ocenka",
        label: "Оценка",
        options: [
          { label: "Отлично", value: 5 },
          { label: "Хорошо", value: 4 },
          { label: "Удовлетворительно", value: 3 },
          { label: "Неудовлетворительно", value: 2 },
        ],
      }),
      new CheckboxInput({
        key: "course_work_vipysk",
        label: "Выпускная работа",
        binary: true,
      }),
    ]);
  },

  methods: {
    ...mapActions(useCourseWorkStore, [
      "getCourseWorkList",
      "postCourseWork",
      ,
      "putCourseWork",
      "deleteCourseWork",
      "uploadGeneratedFile",
    ]),
    ...mapActions(useTeacherStore, ["getTeacherList"]),
    ...mapActions(useDepartamentStore, ["getDepartamentList"]),
    ...mapActions(useStudentStore, ["getStudentList"]),
    cellWasClicked(event) {
      if (event.colDef && event.colDef.headerName === "Действия") {
        this.edit(event);
      }
    },
    async generateTeacherReport() {
      // Получаем список курсовых работ из стора
      const courseWorkStore = useCourseWorkStore();
      const courseWorks = courseWorkStore.courseWorkList;

      // Группируем работы по преподавателям, затем годам и семестрам
      const courseWorksByTeacher = courseWorks.reduce((acc, cw) => {
        const teacherName = cw.teacher_name;
        const year = cw.course_work_year;
        const semester = cw.semester;

        if (!acc[teacherName]) acc[teacherName] = {};
        if (!acc[teacherName][year]) acc[teacherName][year] = {};
        if (!acc[teacherName][year][semester])
          acc[teacherName][year][semester] = [];

        acc[teacherName][year][semester].push(cw);
        return acc;
      }, {});

      // Создаем новую книгу Excel
      const wb = XLSX.utils.book_new();

      // Для каждого преподавателя создаем отдельный лист
      Object.entries(courseWorksByTeacher).forEach(([teacherName, years]) => {
        // Формируем массив данных для рабочего листа
        const sheetData = [];

        // Добавляем строку заголовков столбцов (ручная шапка)
        sheetData.push({
          Год: "Год",
          Семестр: "Семестр",
          "№": "№",
          Студент: "Студент",
          Оценка: "Оценка",
          Тема: "Тема",
        });

        // Перебираем года в отсортированном порядке для удобства
        Object.keys(years)
          .sort()
          .forEach((year) => {
            const semesters = years[year];
            // Перебираем семестры (также сортированно)
            Object.keys(semesters)
              .sort()
              .forEach((semester) => {
                const courseWorksList = semesters[semester];
                courseWorksList.forEach((cw, idx) => {
                  sheetData.push({
                    Год: year,
                    Семестр: semester,
                    "№": idx + 1,
                    Студент: cw.student_name,
                    Оценка: cw.course_work_ocenka || "",
                    Тема: cw.course_work_theme || "",
                  });
                });
              });
          });

        // Преобразуем данные в рабочий лист Excel
        // Опция skipHeader: true запрещает автоматическую генерацию строки заголовка
        const ws = XLSX.utils.json_to_sheet(sheetData, {
          header: ["Год", "Семестр", "№", "Студент", "Оценка", "Тема"],
          skipHeader: true,
        });

        // Задаем ширину столбцов для лучшего отображения
        ws["!cols"] = [
          { wch: 10 }, // Год
          { wch: 10 }, // Семестр
          { wch: 5 }, // №
          { wch: 30 }, // Студент
          { wch: 10 }, // Оценка
          { wch: 50 }, // Тема
        ];

        // Обеспечиваем соответствие имени листа требованиям Excel
        let sheetName = teacherName;
        if (sheetName.length > 31) {
          sheetName = sheetName.substring(0, 31);
        }
        sheetName = sheetName.replace(/[:\\\/\?\*\[\]]/g, "_");

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      // Генерируем книгу Excel в виде ArrayBuffer
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      // Создаем Blob
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Устанавливаем необходимые параметры и отправляем Blob на сервер
      this.objectType = "excel";
      this.documentTitle = "Отчет по научным руководителям";
      this.filePath = await this.uploadGeneratedFile(
        blob,
        "teacher_report.xlsx"
      );
      this.docPreview = true;
    },

    resetCW() {
      this.courseWork = new CourseWork();
    },
    edit(event) {
      this.resetCW();
      this.courseWork = event.data;

      this.formVisible = true;
    },
    openCreatingForm() {
      this.resetCW();
      this.formVisible = true;
    },
    async validateForm() {
      let isValid = true;
      const errors = {};

      for (const item of this.scheme.items) {
        const result = item.validate(this.courseWork[item.key]);

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
    async previewDocx() {
      await this.generateTeacherReport();

      this.docPreview = true;
    },
    async submit() {
      const isValid = await this.validateForm();
      if (!isValid) {
        console.error("Form validation failed", this.errors);
        return;
      }
      let courseWork = { ...this.courseWork };

      if (courseWork.course_work_id) {
        await this.putCourseWork(courseWork);
      } else {
        await this.postCourseWork(courseWork);
      }
      this.formVisible = false;
      this.resetCW();
      this.loadCourseWorksData();
    },

    async deleteCW() {
      let courseWork = { ...this.courseWork };

      await this.deleteCourseWork(courseWork);
      this.formVisible = false;
      this.resetCW();
      this.loadCourseWorksData();
    },

    async loadCourseWorksData() {
      try {
        if (Array.isArray(this.courseWorkList)) {
          this.rowData.value = this.courseWorkList
            .filter((courseWorkList) => courseWorkList.deleted_at === null)
            .sort((a, b) => a.student_name.localeCompare(b.student_name));
        } else {
          if (this.courseWorkList.deleted_at === null) {
            this.rowData.value = [this.courseWorkList];
          } else {
            this.rowData.value = [];
          }
        }
        this.loading = false;
      } catch (error) {
        console.error("Error loading students data:", error);
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
        if (savedFilterModel.full_name) {
          this.pr = true;
          this.pr_n = savedFilterModel.full_name.filter;
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

  created() {},
};
</script>

<style lang="scss" scoped>
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

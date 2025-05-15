<template>
  <div class="journal-list-container">
    <div v-if="loading" class="loading-state">Загрузка журнала...</div>
    <div v-else>
      <!-- Заголовок журнала -->
      <div class="journal-title">
        <h1>Преподаватель: {{ meta.teacher.fullName }}</h1>
        <h2>Группа: {{ meta.group.code }}</h2>
        <h2>Дисциплина: «{{ meta.subject.name }}»</h2>
      </div>

      <!-- Панель управления -->
      <div class="controls d-flex flex-wrap align-items-center mb-3">
        <!-- Добавить дату занятия или выбор даты -->
        <div class="me-2 mb-2">
          <template v-if="!datePickerVisible">
            <button class="btn btn-primary" @click="openAddDate">
              <i class="material-icons-outlined me-1">calendar_today</i>
              Добавить дату занятия
            </button>
          </template>
          <template v-else>
            <div class="input-group">
              <input
                type="date"
                v-model="newDate"
                class="form-control"
              />
              <button class="btn btn-primary" @click="confirmAddDate">OK</button>
              <button class="btn btn-secondary" @click="datePickerVisible = false">
                Отмена
              </button>
            </div>
          </template>
        </div>

        <div class="me-2 mb-2">
  <button class="btn btn-success" @click="openParamsModal">
    <i class="material-icons-outlined me-1">insights</i>
    Аналитика
  </button>
</div>
<div class="me-2 mb-2">
  <button class="btn btn-warning" @click="openNotifyModal">
    <i class="material-icons-outlined me-1">notifications</i>
    Сформировать уведомление
  </button>
</div>
        <!-- Переключатель подсветки -->
        <div class="form-check form-switch me-4 mb-2">
          <input
  class="form-check-input"
  type="checkbox"
  id="highlightToggle"
  v-model="highlightGrades"
  @change="onToggleHighlight"    
/>
          <label class="form-check-label" for="highlightToggle">
            Подсветка оценок
          </label>
        </div>

        <!-- Фильтр журнала -->
        <div class="filter-group d-flex align-items-center mb-2">
          <label class="me-2 mb-0" for="filterType">Фильтры журнала:</label>
          <select
            v-model="filterType"
            @change="onFilterChange"
            class="form-select"
            id="filterType"
          >
            <option value="all">Показать всё</option>
            <option value="attendance">Только посещаемость</option>
            <option value="grades">Только оценки</option>
          </select>
        </div>
      </div>

      <!-- Таблица журнала -->
      <div class="grid-container">
        <ag-grid-vue
          class="ag-theme-alpine"
          :columnDefs="columnDefs"
          :rowData="rowData"
          :defaultColDef="defaultColDef"
          :frameworkComponents="frameworkComponents"
          @frameworkcomponents-open-manage-types="onOpenManageTypes"
          :getRowId="getRowId"
          immutableColumns
          @grid-ready="onGridReady"
          style="width: 100%; height: 70vh;"
        />
      </div>
      
      <Dialog
    v-model:visible="paramsModalVisible"
    header="Параметры"
    modal
    :style="{ width: '400px' }"
  >
    <div class="p-4 space-y-4">
      <!-- 1) Выбор контингента -->
      <div>
        <label class="form-label">Контингент</label>
        <select v-model="params.contingentType" class="form-select">
          <option disabled value="">– Выберите –</option>
          <option value="group">Группа</option>
          <option value="course">Курс</option>
          <option value="direction">Направление</option>
        </select>
      </div>

      <!-- 1.1) Если курс – показать список курсов -->
      <!-- Если курс -->
      <div v-if="params.contingentType === 'course'">
  <label class="form-label">Курс</label>
  <select v-model="params.contingentId" class="form-select">
    <option disabled value="">– Выберите курс –</option>
    <option
      v-for="c in availableCourses"
      :key="c.course + c.label"
      :value="c.course"
    >
      {{ c.label }}
    </option>
  </select>
</div>

      <!-- 1.2) Если направление – список направлений -->
      <div v-if="params.contingentType === 'direction'">
  <label class="form-label">Направление</label>
  <select v-model="params.contingentId" class="form-select">
    <option disabled value="">– Выберите направление –</option>
    <option
      v-for="dir in availableDirections"
      :key="dir.id"
      :value="dir.id"
    >
      {{ dir.label }}
    </option>
  </select>
</div>

      <!-- 1.3) Если группа – сразу берём текущую группу -->
      <div v-if="params.contingentType === 'group'">
        <label class="form-label">Группа</label>
        <input class="form-control" :value="meta.group.code" disabled />
        <!-- и сохраняем её в params.contingentId автоматически -->
      </div>

      <!-- 2) Тип отчёта -->
      <div>
        <label class="form-label">Тип отчёта</label>
        <select v-model="params.reportType" class="form-select">
          <option disabled value="">– Выберите тип –</option>
          <option value="attendance">По посещаемости</option>
          <option value="grades">По оценкам</option>
          <option value="full">Полный</option>
        </select>
      </div>
    </div>
    <template #footer>
      <Button label="Отмена" class="p-button-text" @click="paramsModalVisible = false"/>
      <Button
        label="Сформировать"
        class="p-button-primary"
        :disabled="!params.contingentType || !params.contingentId || !params.reportType"
        @click="confirmParams"
      />
    </template>

  </Dialog>
      
      <!-- Модалка комментария -->
      <Dialog
        v-model:visible="commentModalVisible"
        :header="`Комментарий на дату ${formatDate(currentCommentDateStr)}`"
        modal
        :style="{ width: '400px' }"
      >
        <textarea
          v-model="commentText"
          rows="6"
          class="comment-textarea"
          placeholder="Введите комментарий..."
        />
        <template #footer>
          <Button label="Отмена" class="p-button-text" @click="closeCommentModal" />
          <Button label="Сохранить" class="p-button-primary" @click="saveComment" />
        </template>
      </Dialog>

      <ReportModal
   v-model:visible="reportModalVisible"
  :contingent="params.contingentType"
  :contingent-id="params.contingentId"
  :wl-id="Number(wl_id)"            
  :report-type="params.reportType"
/>
      <!-- Модалка управления типами оценок -->
      <Dialog
        v-model:visible="manageTypesModalVisible"
        header="Добавить тип оценки"
        modal
        :style="{ width: '420px' }"
      >
        <div class="p-4 space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium">Тип работ</label>
            <select v-model="selectedGradeType" class="form-select w-full">
              <option disabled value="">–</option>
              <option v-for="gt in gradeTypesList" :key="gt.id" :value="gt.id">
                {{ gt.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Метод оценивания</label>
            <select
              v-model="selectedEvalMethod"
              class="form-select w-full"
              @change="onEvalMethodChange"
            >
              <option value="standard">Стандартный (2,3,4,5)</option>
              <option value="custom">Иной (0–100 и т.п.)</option>
            </select>
          </div>
          <h3 class="mt-4 mb-2 text-sm font-semibold text-gray-700">
            Критерии <span class="text-xs text-gray-500">(необязательно)</span>
          </h3>
          <div>
            <label class="block mb-1 text-sm font-medium">Диапазон</label>
            <div class="flex items-center space-x-2">
              <input
                type="number"
                v-model.number="criteria.minValue"
                :min="0"
                class="form-input w-16 text-center"
                placeholder="от"
              />
              <span>—</span>
              <input
                type="number"
                v-model.number="criteria.maxValue"
                :min="criteria.minValue"
                class="form-input w-16 text-center"
                placeholder="до"
              />
            </div>
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Проходной балл</label>
            <input
              type="number"
              v-model.number="criteria.passScore"
              :min="criteria.minValue"
              :max="criteria.maxValue"
              class="form-input w-28"
              placeholder="баллы"
            />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Вес оценки</label>
            <input
              type="number"
              v-model.number="criteria.weight"
              step="0.01"
              min="1.00"
              class="form-input w-24"
              placeholder="веса"
            />
          </div>
        </div>
        <template #footer>
          <Button label="Отмена" class="p-button-text" @click="onCloseManageTypes" />
          <Button
            label="OK"
            class="p-button-primary"
            :disabled="!selectedGradeType"
            @click="onConfirmManageTypes"
          />
        </template>
      </Dialog>
      <Dialog
  v-model:visible="notifyModalVisible"
  header="Отправка уведомления"
  modal
  :style="{ width: '400px' }"
>
  <div class="p-4">
    <div class="mb-3">
      <label class="form-label">Тип уведомления</label>
      <select v-model="notify.type" class="form-select">
        <option disabled value="">– Выберите –</option>
        <option value="grades">Успеваемость</option>
        <option value="attendance">Посещаемость</option>
      </select>
    </div>
  </div>
  <template #footer>
    <Button
  label="Скачать Excel"
  icon="pi pi-file-excel"
  class="p-button-text"
  @click="exportFilteredReport"
  :disabled="!students.length"
/>

    <Button label="Закрыть" class="p-button-text" @click="closeNotifyModal"/>
  </template>
</Dialog>
    </div>
  </div>
</template>



<script>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { AgGridVue } from 'ag-grid-vue3';
import DateHeader from '@/components/newjournal/DateHeader.vue';
import PsHeader   from '@/components/newjournal/PsHeader.vue';
import StatsHeader from '@/components/newjournal/StatsHeader.vue';
import api        from '@/api/api';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import ReportModal from '@/components/reports/ReportModal.vue';
import * as XLSX from 'xlsx';

export default {
  name: 'JournalListNew',
  components: { AgGridVue, DateHeader, PsHeader, Dialog, Button, StatsHeader,ReportModal },
  props: {
    wl_id: { type: [String, Number], required: true }
  },
  data() {
    return {
      meta:            { teacher: {}, group: {}, subject: {} },
      students:        [],
      dates:           [],
      dateGradeTypes:  [],
      details:         [],
      gradeTypesList:  [],
      loading:         false,

      columnDefs:      [],
      rowData:         [],
      
      filterType: 'all',
      selectedEvalMethod: 'standard',  // 'standard' или 'custom'
      criteria: {
        minValue: 2,
        maxValue: 5,
        passScore: null,
        weight: 1.0
      },
      manageTypesModalVisible: false,
      currentDateForManage: null,
      selectedGradeType: '',
      criteria: {
      minValue: 0,
      maxValue: 100,
      passScore: null,
      weight: 1.0
    },
    paramsModalVisible: false,
    params: {
      contingentType: '',
      contingentId: null,
      reportType: ''
    },
    availableCourses: [], // можно получить из API или вычислить из meta.group.course
    availableDirections: [],          // загрузить из API при created()
    // флаг показа ReportModal
    reportModalVisible: false,


    notifyModalVisible: false,
      notify: {
        type: '',
        email: ''
      },

      commentModalVisible: false,
      currentCommentDate: null,
      currentCommentDateStr: '',
      commentText: '',

      datePickerVisible: false,
      newDate: '',
      highlightGrades: false,
      selectedReport: ''
    };
  },
  computed: {

    getRowId(params) {
  // если данных нет — пропускаем
  if (!params.data || params.data.student_id == null) {
    return;
  }
  // возвращаем строку, чтобы гарантированно уникально
  return String(params.data.student_id);
},
    defaultColDef() {
      return { sortable: true, filter: true, resizable: true };
    },
    frameworkComponents() {
      return { DateHeader, PsHeader,StatsHeader };
    }

  },
  
  methods: {
    exportFilteredReport() {
    // 1) Метаданные
    const groupCode    = this.meta.group.code;
    const teacherName  = this.meta.teacher.fullName;
    const subjectName  = this.meta.subject.name;
    const totalClasses = this.dates.length || 1;

    // 2) Собираем статистику из rowData
    const stats = this.rowData.map(r => ({
      fullName:    r.fullName,
      absences:    r.absencesCount,
      totalClasses,
      absencePct:  +(100 * r.absencesCount / totalClasses).toFixed(1),
      avgGrade:    parseFloat(r.avgScore) || 0
    }));

    // 3) В зависимости от типа уведомления фильтруем
    const sheets = [];

    if (this.notify.type === 'attendance') {
      // Только посещаемость ≥70%
      const absenters = stats.filter(s => s.absencePct >= 50);
      const sheet1 = [
        ['Группа', groupCode],
        ['Преподаватель', teacherName],
        ['Дисциплина', subjectName],
        [],
        ['ФИО студента', 'Пропусков', '% пропусков']
      ];
      absenters.forEach(s => {
        sheet1.push([ s.fullName, s.absences, s.absencePct ]);
      });
      sheets.push({ name: 'Посещаемость', data: sheet1 });
    }

    if (this.notify.type === 'grades') {
      // Только успеваемость 0<avg<2.5
      const lowPerf = stats.filter(s => s.avgGrade > 0 && s.avgGrade < 2.5);
      const sheet2 = [
        ['Группа', groupCode],
        ['Преподаватель', teacherName],
        ['Дисциплина', subjectName],
        [],
        ['ФИО студента', 'Ср. балл']
      ];
      lowPerf.forEach(s => {
        sheet2.push([ s.fullName, s.avgGrade ]);
      });
      sheets.push({ name: 'Успеваемость', data: sheet2 });
    }

    // 4) Создаём книгу и добавляем необходимые листы
    const wb = XLSX.utils.book_new();
    sheets.forEach(({name, data}) => {
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name);
    });

    // 5) Скачиваем
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob  = new Blob([wbout], { type: 'application/octet-stream' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `Report_${groupCode}_${this.notify.type}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },
openNotifyModal() {
    this.notifyModalVisible = true;
  },
  closeNotifyModal() {
    this.notifyModalVisible = false;
  },
    onEvalMethodChange() {
    if (this.selectedEvalMethod === 'standard') {
      this.criteria.minValue = 2;
      this.criteria.maxValue = 5;
    } else {
      this.criteria.minValue = 0;
      this.criteria.maxValue = 100;
    }
  },
    onFilterChange() {
  // при изменении фильтра просто перестраиваем колонки
  this.rebuildGrid();
  if (this.gridApi && !this.gridApi.destroyed) {
  this.gridApi.setColumnDefs(this.columnDefs);
  this.gridApi.setRowData(this.rowData);
}
},
onOpenManageTypes(dateId) {
  this.currentDateForManage = dateId;
  this.selectedGradeType   = '';
  this.selectedEvalMethod  = 'standard';
  // сразу ставим 2–5
  Object.assign(this.criteria, { minValue: 2, maxValue: 5, passScore: null, weight: 1.0 });
  this.manageTypesModalVisible = true;
},
    onCloseManageTypes() {
      this.manageTypesModalVisible = false;
      this.currentDateForManage = null;
    },
    // вызываем именно тот метод API, который описан в api.js
    async onConfirmManageTypes() {
  if (!this.selectedGradeType) return;
  this.loading = true;
  try {
    await api.addGradeTypeToDate({            // или upsertJournalDateGradeType
      journal_date_id: this.currentDateForManage,
      grade_type_id:   this.selectedGradeType,
      min_value:       this.criteria.minValue,
      max_value:       this.criteria.maxValue,
      pass_score:      this.criteria.passScore,
      weight:          this.criteria.weight
    });
    await this.loadJournal();
  } finally {
    this.loading = false;
    this.onCloseManageTypes();
  }
},
    
    // Загрузка списка типов оценок
    
    async loadGradeTypes() {
      try {
        const res = await api.getGradeTypes();
        this.gradeTypesList = Array.isArray(res.data ?? res) ? (res.data ?? res) : [];
      } catch {
        this.gradeTypesList = [];
      }
    },

    // Загрузка всех данных журнала
    async loadJournal() {
      this.loading = true;
      try {
        const res = await api.getJournal(Number(this.wl_id));
        const p   = res.data ?? res;
        this.meta           = p.meta;
        this.students       = p.students       || [];
        this.dates          = p.dates          || [];
        this.dateGradeTypes = p.dateGradeTypes || [];
        this.details        = p.details        || [];
        this.rebuildGrid();
        if (this.gridApi && !this.gridApi.destroyed) {
  this.gridApi.setColumnDefs(this.columnDefs);
  this.gridApi.setRowData(this.rowData);
}
      } catch (err) {
        console.error('Ошибка загрузки журнала:', err);
        alert('Не удалось загрузить журнал');
      } finally {
        this.loading = false;
      }
    },

    async loadAvailableLists() {
  console.log('>>> loadAvailableLists start');
  try {
    // ———————————————— Курсы ————————————————
    const coursesRes = await api.getCoursesList();
    // Поддерживаем оба варианта: либо coursesRes.data, либо сам массив
    const courses = Array.isArray(coursesRes)
      ? coursesRes
      : Array.isArray(coursesRes.data)
        ? coursesRes.data
        : [];
    console.log('courses:', courses);
    this.availableCourses = courses;

    // —————————————— Направления ——————————————
    const dirsRes = await api.getDirectionsList();
    const directions = Array.isArray(dirsRes)
      ? dirsRes
      : Array.isArray(dirsRes.data)
        ? dirsRes.data
        : [];
    console.log('directions:', directions);
    this.availableDirections = directions;

  } catch (err) {
    console.error('Ошибка загрузки списков курсов/направлений', err);
    this.availableCourses    = [];
    this.availableDirections = [];
  }
},

    openCommentModal(dateId, dateStr, existingComment) {
  this.currentCommentDate = dateId;
  this.currentCommentDateStr = dateStr;   // сохраняем строку даты
  this.commentText = existingComment || '';
  this.commentModalVisible = true;
},
closeCommentModal() {
  this.commentModalVisible = false;
  this.commentText = '';
  this.currentCommentDate = null;
  this.currentCommentDateStr = '';
},
async saveComment() {
  this.loading = true;
  try {
    await api.upsertDateComment(this.currentCommentDate, this.commentText);
    // обновляем локальную модель и перерисовываем хэдер
    const d = this.dates.find(x => x.id === this.currentCommentDate);
    if (d) d.comment = this.commentText;
    this.gridApi.refreshHeader();
    this.closeCommentModal();
  } catch {
    alert('Ошибка при сохранении комментария');
  } finally {
    this.loading = false;
  }
},


    // Собрать columnDefs и rowData
    rebuildGrid() {
      console.log('>>>> rebuildGrid, highlightGrades =', this.highlightGrades);
  // собираем детали по студентам и датам
  const dm = {};
  this.details.forEach(d => {
    dm[d.student_id] = dm[d.student_id] || {};
    dm[d.student_id][d.date_id] = { status: d.status, grades: d.grades };
  });

  // начальные колонки: ФИО
  const cols = [
    { field: 'fullName', headerName: 'ФИО студента', pinned: 'left', width: 200 }
  ];

  // для каждой даты — группа колонок
  this.dates.forEach(d => {
    const types = this.dateGradeTypes.find(x => x.date_id === d.id)?.grade_types || [];
    const children = [];
     
    // === посещаемость ===
    if (this.filterType === 'all' || this.filterType === 'attendance') {
      children.push({
        field: `att_${d.id}`,
        headerComponent: 'PsHeader',
        headerComponentParams: {
          label: 'П/c',
          dateId: d.id,
          currentGradeTypes: types,
          onOpenManageTypes: dateId => this.onOpenManageTypes(dateId),
          onDeleteGradeType: (dateId, gradeTypeId) =>
            this.handleDeleteGradeType(dateId, gradeTypeId),
          initialWidth: 60,
          expandedWidth: 218,
          gradeTypesList: this.gradeTypesList,
          onGradeTypeAdded: async (dateId, gradeTypeId) => {
            this.loading = true;
            try {
              await api.addGradeTypeToDate(dateId, gradeTypeId);
              await this.loadJournal();
              this.gridApi.refreshHeader();
            } catch {
              alert('Ошибка сервера при добавлении типа оценки');
            } finally {
              this.loading = false;
            }
          }
        },
        cellRenderer: params => params.value || '',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['', 'н', 'уп', 'б'] },
        width: 65,
        minWidth: 65,
        onCellValueChanged: e =>
          this.updateAttendance(e.data.student_id, d.id, e.newValue)
      });
    }

    // === оценки ===
    if (this.filterType === 'all' || this.filterType === 'grades') {
      types.forEach(gt => {
        const min = gt.minValue ?? gt.min_value;
        const max = gt.maxValue ?? gt.max_value;
        const field = `grade_${d.id}_${gt.id}`;
        const pass = this.selectedEvalMethod === 'custom' ? (gt.passScore ?? 50) : gt.passScore;
        children.push({
          field,
          headerComponent: 'PsHeader',
          headerComponentParams: {
            label: gt.name,
            dateId: d.id,
            gradeTypeId: gt.id,
            onDeleteGradeType: (dateId, gradeTypeId) =>
              this.handleDeleteGradeType(dateId, gradeTypeId)
          },
          cellStyle: params => {
            if (!this.highlightGrades) return null;
  // если пустая строка или null — не закрашиваем
  if (params.value === '' || params.value == null) {
    return null;
  }
  const value = Number(params.value);
  // рассчитываем порог
  const min = gt.minValue ?? gt.min_value;
  const max = gt.maxValue ?? gt.max_value;
  const pass = this.selectedEvalMethod==='custom'
    ? (gt.passScore ?? 50)
    : gt.passScore;

  if (isNaN(value)) return null;

  if (value < (pass ?? 3)) {
    return { backgroundColor: '#f8d7da' };
  } else if (value >= (pass ?? 3) && value < ((min + max) / 2)) {
    return { backgroundColor: '#fff3cd' };
  } else if (value >= ((min + max) / 2) && value < max) {
    return { backgroundColor: '#b4ceff' };
  } else if (value >= max) {
    return { backgroundColor: '#d4edda' };
  }
  return null;
},
          editable: true,
          cellEditor: 'agTextCellEditor',
          valueParser: params => params.newValue,
          onCellValueChanged: e => {
            const raw = e.newValue;
            if (raw === '') {
              e.node.setDataValue(field, '');
              return;
            }
            const val = Number(raw);
            if (isNaN(val) || val < min || val > max) {
              alert(`Ошибка: значение должно быть от ${min} до ${max}`);
              e.node.setDataValue(field, e.oldValue);
              return;
            }
            this.updateGrade(e.data.student_id, d.id, gt.id, val);
          },
          filter: 'agNumberColumnFilter',
          width: 65,
          minWidth: 65,
          maxWidth: 70
        });
      });
    }
    if (children.length) {
    const last = children[children.length - 1];
    last.headerClass = 'date-separator';
    last.cellClass   = 'date-separator';
  }
    cols.push({
      headerGroupComponent: 'DateHeader',
      headerGroupComponentParams: {
        date: d.date,
        dateId: d.id,
        dateStr: d.date,
        comment: d.comment,
        onDeleteDate: () => this.deleteDate(d.id),
        onComment: (dateId, dateStr, comment) =>
          this.openCommentModal(dateId, dateStr, comment)
      },
      children
    });
  });

  // две колонки статистики, всегда прикреплены справа
  cols.push({
  headerGroupComponent: 'StatsHeader',
  marryChildren: true,
  children: [
   
    {
      field: 'avgScore',
      headerName: 'Ср.\nБалл',
      pinned: 'right',
      width: 110,

      cellStyle: params => {
    if (!this.highlightGrades) return null;
  // если пустая строка или null — не закрашиваем
  if (params.value === '' || params.value == null) {
    return null;
  }
    const v = Number(params.value);
    if (isNaN(v)) return null;
    if (v < 2.5) {
      return { backgroundColor: '#f8d7da' };
    } else if (v < 3.5) {
      return { backgroundColor: '#fff3cd' };
    } else if (v < 4.5) {
      return { backgroundColor: '#b4ceff' };
    } else {
      return { backgroundColor: '#d4edda' };
    }
  }
    },
    {
      field: 'absencesCount',
      headerName: 'Кол-во\nПропусков',
      pinned: 'right',
      width: 140,
      cellClass: 'text-center'
    }
  ]
});
  this.columnDefs = cols;

  // собираем rowData и считаем статистику
  this.rowData = this.students.map(s => {
    const row = { fullName: s.fullName, student_id: s.id };
    let totalWeighted = 0, totalWeight = 0, absencesCount = 0;

    this.dates.forEach(d => {
      const cell = dm[s.id]?.[d.id] || { status: '', grades: [] };
      row[`att_${d.id}`] = cell.status;
      if (cell.status === 'н' || cell.status === 'уп' || cell.status === 'б') absencesCount++;

      const types = this.dateGradeTypes.find(x => x.date_id === d.id)?.grade_types || [];
      types.forEach(gt => {
  const field = `grade_${d.id}_${gt.id}`;
  const rawVal = cell.grades.find(x => x.grade_type_id === gt.id)?.value;
  const val = Number(rawVal);
  row[field] = isNaN(val) ? '' : val;

  // считаем только «стандартные» оценки 2–5
  const minVal = gt.minValue ?? gt.min_value;      // проверьте оба варианта
const maxVal = gt.maxValue ?? gt.max_value;
const weight = gt.weight      // если gt.weight есть
             ?? gt.weightValue // или camelCase
             ?? gt.weight_value // или snake_case
             ?? 1;

if (!isNaN(val) &&
    minVal >= 2 &&
    maxVal <= 5 &&
    val >= minVal &&
    val <= maxVal
) {
  totalWeighted += val * weight;
  totalWeight   += weight;
}
});
    });

    row.avgScore      = totalWeight ? (totalWeighted / totalWeight).toFixed(2) : '';
    row.absencesCount = absencesCount;
    
    return row;
  });
  console.log('DEBUG avgScores:', this.rowData.map(r => r.avgScore));
  console.log('rowData for avg:', this.rowData.map(r => r.avgScore));
},


    onGridReady(params) {
      this.gridApi = params.api;
      this.rebuildGrid();
    },

    // Сохранение посещаемости
    updateAttendance(studentId, dateId, status) {
  api.updateAttendance(studentId, dateId, status)
    .then(r => {
      if (!(r.data?.success ?? r.success)) {
        alert('Ошибка сохранения посещаемости');
      } else {
        // **Патч:** меняем локальную модель деталей**
        const rec = this.details.find(d =>
          d.student_id === studentId && d.date_id === dateId
        );
        if (rec) {
          rec.status = status;
        } else {
          // если ещё не было записи — добавляем
          this.details.push({ student_id: studentId, date_id: dateId, status, grades: [] });
        }
        // теперь пересобираем грид, и статистика подтянется
        this.rebuildGrid();
        this.gridApi.setRowData(this.rowData);
      }
    })
    .catch(() => alert('Ошибка сервера при сохранении посещаемости'));
},

    // Сохранение оценки
    updateGrade(studentId, dateId, gradeTypeId, value) {
  api.updateGrade(studentId, dateId, gradeTypeId, value)
    .then(res => {
      const ok = (res.data?.success ?? res.success) === true;
      if (!ok) {
        alert('Ошибка сохранения оценки');
        return;
      }
      // --- обновляем локальную модель ---
      let rec = this.details.find(d =>
        d.student_id === studentId && d.date_id === dateId
      );
      if (!rec) {
        // ЗДЕСЬ: явно указываем ключи student_id и date_id
        rec = {
          student_id: studentId,
          date_id: dateId,
          status: '',
          grades: []
        };
        this.details.push(rec);
      }
      let g = rec.grades.find(x => x.grade_type_id === gradeTypeId);
      if (g) {
        g.value = value;
      } else {
        rec.grades.push({ grade_type_id: gradeTypeId, value });
      }

      // --- пересобираем грид и форсируем перерисовку ---
      this.rebuildGrid();
      this.gridApi.setColumnDefs(this.columnDefs);
      this.gridApi.setRowData(this.rowData);
      this.gridApi.refreshCells({ force: true });
    })
    .catch(err => {
      console.error('Ошибка при updateGrade:', err);
      if (err.response) {
        alert('Ошибка сервера при сохранении оценки:\n' +
              (err.response.data.error || JSON.stringify(err.response.data)));
      } else {
        alert('Ошибка при сохранении оценки: ' + err.message);
      }
    });
},


    // Добавление новой даты
    openAddDate() {
      this.newDate = '';
      this.datePickerVisible = true;
    },
    async confirmAddDate() {
      if (!this.newDate) { alert('Выберите дату'); return; }
      if (this.dates.some(d => d.date === this.newDate)) {
        alert('Эта дата уже добавлена');
        this.datePickerVisible = false;
        return;
      }
      this.loading = true;
      try {
        await api.createJournalDate(Number(this.wl_id), this.newDate);
        await this.loadJournal();
      } catch {
        alert('Ошибка сервера при добавлении даты');
      } finally {
        this.loading = false;
        this.datePickerVisible = false;
      }
    },
    async handleDeleteGradeType(dateId, gradeTypeId) {
  if (!confirm('Удалить этот тип оценки?')) return;
  this.loading = true;
  try {
    await api.deleteGradeTypeFromDate(dateId, gradeTypeId);
    // перезагружаем контент
    await this.loadJournal();
    // прокидываем гриду новую схему колонок и данные
    this.gridApi.setColumnDefs(this.columnDefs);
    this.gridApi.setRowData(this.rowData);
  } catch (err) {
    console.error(err);
    alert('Ошибка сервера при удалении типа оценки');
  } finally {
    this.loading = false;
  }
},
    // Удаление даты
    async deleteDate(dateId) {
      if (!confirm('Удалить дату занятия?')) return;
  try {
    console.log('Calling deleteJournalDate', dateId);
    const resArr = await api.deleteJournalDate(dateId);
    console.log('Raw delete response:', resArr);
    // PostgREST возвращает массив из одного объекта
    const res = Array.isArray(resArr) ? resArr[0] : resArr;
        if (res.success) {
          this.dates = this.dates.filter(d => d.id !== dateId);
          this.rebuildGrid();
          this.gridApi.setColumnDefs(this.columnDefs);
          this.gridApi.setRowData(this.rowData);
        } else {
      alert('Не удалось удалить дату: ' + (res.message || ''));
    }
  } catch (err) {
    console.error('Ошибка сервера при удалении даты', err);
    alert('Ошибка сервера при удалении даты');
  }
    },
    
    formatDate(iso) {
  if (typeof iso !== 'string') {
    return '';  // или возвращать iso.toString(), как нужно
  }
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y.slice(-2)}`;
},
openParamsModal() {
  this.paramsModalVisible = true;
  // Сразу подтянем актуальные списки
  this.loadAvailableLists();
  // сбросим предыдущий выбор
  this.params.contingentType = '';
  this.params.contingentId   = null;
  this.params.reportType     = '';
},
confirmParams() {
    // если групповой отчёт — сразу проставляем ID текущей группы
    if (this.params.contingentType === 'group') {
      this.params.contingentId = this.meta.group.id;
    }
    // сначала закрываем малую модалку, потом открываем большую
    this.paramsModalVisible = false;
    this.reportModalVisible = true;
  },
  },
  watch: {
    highlightGrades() {
    if (this.gridApi) {
      this.rebuildGrid();
      this.gridApi.setColumnDefs(this.columnDefs);
      this.gridApi.setRowData(this.rowData);
      this.gridApi.refreshCells({ force: true });
    }
  },
 'params.contingentType'(newType) {
    if (newType === 'group') {
      // сразу подтянем ID текущей группы
      this.params.contingentId = this.meta.group.id;
    } else {
      // сброс при смене на другой тип
      this.params.contingentId = null;
    }
  }
  // новый watch для загрузки списков при выборе типа
  
},
  async created() {
    await this.loadGradeTypes();
    await this.loadJournal();
   // await this.loadAvailableLists();
  }
};
</script>

<style scoped lang="scss">
::v-deep .ag-theme-alpine .ag-cell {
  border: 1px solid #ccc;
}

::v-deep .ag-theme-alpine .ag-header-cell {
  border: 1px solid #ccc;
}

/* чтобы у корня грида не было двойных границ */
::v-deep .ag-theme-alpine .ag-root-wrapper {
  border-collapse: collapse;
}

::v-deep .ag-theme-alpine .ag-header-cell.date-separator,
::v-deep .ag-theme-alpine .ag-cell.date-separator {
  border-right: 1px solid #666;
}

.journal-list-container {
  padding: 20px;
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

.journal-title {
  text-align: left;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  h2 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: normal;
  }
}

.controls {
  /* выравнивание через flexbox */
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.controls .btn {
  display: flex;
  align-items: center;
  height: 36px;
}

.controls .input-group {
  display: flex;
  align-items: center;
}

.controls .form-check {
  display: flex;
  align-items: center;
}

.controls .form-check-input {
  margin-top: 0;
}

.controls .filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.grid-container {
  height: 70vh;
  width: 100%;
}

.ag-theme-alpine {
  flex: 1;
}

.loading-state {
  text-align: center;
  font-style: italic;
  color: #666;
  padding: 20px;
}

/* Стили модальных окон и textarea без изменений */
.comment-modal { background: #fff; padding: 20px; border-radius: 8px; width: 320px; }
.comment-textarea { width: 100%; height: 100px; margin: 10px 0; padding: 8px; }

.grade-red    { background-color: #f8d7da !important; }
.grade-yellow { background-color: #fff3cd !important; }
.grade-orange { background-color: #ffe5b4 !important; }
.grade-green  { background-color: #d4edda !important; }
</style>


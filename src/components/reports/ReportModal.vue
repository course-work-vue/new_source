<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="modalTitle"
    modal
    closable
    :style="{ width: '90%', maxWidth: '1200px' }"
  >

    <!-- загрузка / пусто -->
    <div v-if="loading" class="p-4 text-center">
      <ProgressSpinner/>
    </div>
    <div v-else-if="!allStudents.length" class="p-4 text-center">
      <i class="pi pi-info-circle text-xl text-color-secondary"></i>
      <p>Нет данных для отображения</p>
    </div>

    <div v-else class="p-grid p-fluid">

      <!-- 1) Пропуски -->
      <div v-if="showAttendanceChart" class="p-col-12 p-md-6">
        <div class="card mb-4">
          <h3>Пропуски по диапазонам (%)</h3>
          <Chart
            type="bar"
            :data="attendanceChartData"
            :options="chartOptions('Диапазон %','Студентов')"
            @data-select="onAttendanceClick"
          />
        </div>
      </div>

      <!-- 2) Средний балл по студентам (только для группы) -->
      <div v-if="contingent==='group' && showAvgChart" class="p-col-12 p-md-6">
        <div class="card mb-4">
          <h3>Средний балл по студентам</h3>
          <Chart
            type="bar"
            :data="avgStudentChartData"
            :options="chartOptions('Студент','Ср. балл')"
            @data-select="onAvgStudentClick"
          />
        </div>
      </div>

      <!-- 3) Распределение среднего балла -->
      <div v-if="showAvgChart" class="p-col-12 p-md-6">
        <div class="card mb-4" style="height: 500px;">
          <h3>Распределение среднего балла</h3>
          <Chart
            type="pie"
            :data="avgDistributionChartData"
            :options="pieOptions"
            @data-select="onAvgDistClick"
            style="height:100%;"
          />
        </div>
      </div>

      <!-- 4) Таблица -->
      <div class="p-col-12">
        <div class="card">
          <h3>Список студентов</h3>
          <DataTable
            :value="filteredStudents"
            paginator
            rows="10"
            responsiveLayout="stack"
          >
            <Column field="fullName" header="Студент" sortable />

            <Column
              v-if="showAttendanceChart"
              field="absencePct"
              header="Пропуски, %"
              :body="absenceBody"
              sortable
              sortField="absencePct"
              :bodyStyle="attendanceCellStyle"
            />

            <Column
              v-if="showGradesChart"
              field="avgGrade"
              header="Ср. балл"
              sortable
              :bodyStyle="gradeCellStyle"
            />
          </DataTable>
        </div>
      </div>

    </div>

    <template #footer>
      
      <Button
        label="Закрыть"
        class="p-button-text"
        @click="$emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<script>
import { ref, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import api from '@/api/api';

export default {
  name: 'ReportModal',
  components: { Dialog, Button, ProgressSpinner, Chart, DataTable, Column },
  props: {
    visible:      { type: Boolean, required: true },
    contingent:   { type: String,  required: true },
    contingentId: { type: [Number,String], required: true },
    wlId:         { type: [Number,String], required: true },
    reportType:   { type: String,  required: true }
  },
  setup(props, { emit }) {
    const loading     = ref(false);
    const allStudents = ref([]);
    const filterRange = ref(null);

    const showAttendanceChart = computed(() =>
      ['attendance','full'].includes(props.reportType)
    );
    const showGradesChart = computed(() =>
      ['grades','full'].includes(props.reportType)
    );
    const showAvgChart = computed(() =>
      ['grades','full'].includes(props.reportType)
    );

    const modalTitle = computed(() => {
      const names = {
        attendance: 'По посещаемости',
        grades:     'По оценкам',
        full:       'Полный отчёт'
      };
      return `${names[props.reportType]} — ${props.contingent}`;
    });

    // 1) bins для пропусков
    const attendanceBins = computed(() => {
      const bins = {};
      for (let lo = 0; lo <= 90; lo += 10) bins[lo] = 0;

      allStudents.value.forEach(s => {
        const abs   = Number(s.absences) || 0;
        const total = Number(s.totalClasses) || 1;
        const pct   = Math.min(100, (100 * abs / total));
        const bucket = Math.min(90, Math.floor(pct/10)*10);
        bins[bucket]++;
      });

      return Object.entries(bins)
        .map(([lo, c]) => ({ range: [+lo, +lo + 10], count: c }))
        .sort((a, b) => a.range[0] - b.range[0]);
    });
    const attendanceChartData = computed(() => ({
      labels: attendanceBins.value.map(d => `${d.range[0]}–${d.range[1]}%`),
      datasets: [{ label: 'Студентов', data: attendanceBins.value.map(d => d.count) }]
    }));

    // 2) средний балл по студентам (bar)
    const avgStudentChartData = computed(() => ({
      labels: allStudents.value.map(s => s.fullName),
      datasets: [{ label: 'Ср. балл', data: allStudents.value.map(s => Number(s.avgGrade)||0) }]
    }));

    // 3) распределение среднего балла (pie)
    const avgDistributionChartData = computed(() => {
      const total = allStudents.value.length||1;
      const buckets = [], counts = [];
      for (let lo = 2.0; lo < 4.7; lo += 0.3) {
        const hi  = +(lo + 0.3).toFixed(1);
        const cnt = allStudents.value.filter(s =>
          Number(s.avgGrade) >= lo && Number(s.avgGrade) < hi
        ).length;
        buckets.push(`${lo.toFixed(1)}–${hi.toFixed(1)}`);
        counts.push(+(100*cnt/total).toFixed(1));
      }
      return { labels: buckets, datasets: [{ data: counts }] };
    });
    const pieOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: { legend: { position: 'bottom' } }
    };

    // таблица
    const filteredStudents = computed(() => {
      if (!filterRange.value) return allStudents.value;
      const { lo, hi, field } = filterRange.value;
      return allStudents.value.filter(s => {
        const v = Number(s[field]||0);
        return v >= lo && v < hi;
      });
    });
    function absenceBody(row) {
      return row.absencePct.toFixed(1) + '%';
    }

    // стили ячеек через bodyStyle
    function attendanceCellStyle({ data }) {
      return (data.absencePct||0) > 70
        ? { backgroundColor: 'rgba(255,0,0,0.1)' }
        : {};
    }
    function gradeCellStyle({ data }) {
      const v = Number(data.avgGrade)||0;
      if (v < 3)    return { backgroundColor: 'rgba(255,0,0,0.1)' };
      if (v < 4)    return { backgroundColor: 'rgba(255,255,0,0.1)' };
      if (v <= 5)   return { backgroundColor: 'rgba(0,255,0,0.1)' };
      return {};
    }

    function chartOptions(x, y) {
      return {
        scales: {
          x: { title: { display: true, text: x } },
          y: { title: { display: true, text: y }, beginAtZero: true }
        }
      };
    }

    // клики
    function onAttendanceClick(evt) {
      const idx = evt.element._index, r = attendanceBins.value[idx].range;
      filterRange.value = { lo: r[0], hi: r[1], field: 'absencePct' };
    }
    function onAvgStudentClick() {}
    function onAvgDistClick()    {}

    // загрузка
    async function loadReport() {
      loading.value = true;
      filterRange.value = null;
      const params = {
        wl_id:           Number(props.wlId),
        contingent_type: props.contingent,
        contingent_id:   Number(props.contingentId),
        report_type:     props.reportType
      };
      try {
        const res = await api.getReport(params);
        const p   = res.data ?? res;
        allStudents.value = (p.students||[]).map(s => ({
          ...s,
          absencePct: +(100 * (Number(s.absences)||0) / ((Number(s.totalClasses)||1))).toFixed(1)
        }));
      } catch (e) {
        console.error('Ошибка загрузки', e);
      } finally {
        loading.value = false;
      }
    }
    watch(() => props.visible, val => { if (val) loadReport(); });

    return {
      loading, allStudents,
      attendanceChartData, avgStudentChartData, avgDistributionChartData,
      showAttendanceChart, showGradesChart, showAvgChart,
      modalTitle, filteredStudents,
      absenceBody, chartOptions, pieOptions,
      onAttendanceClick, onAvgStudentClick, onAvgDistClick,
      attendanceCellStyle, gradeCellStyle
    };
  }
};
</script>

<style scoped>
.card {
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: var(--surface-card);
}
h3 {
  margin-bottom: 1rem;
}
</style>

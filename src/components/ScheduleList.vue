<template>
  <div class="main">
    <h2>Расписание по направлению</h2>

    <!-- Выбор направления -->
    <select v-model="selectedDirection" @change="onFilterChange" class="direction-select">
      <option v-for="dir in directions" :key="dir.id" :value="dir.id">
        {{ dir.dir_name }} ({{ dir.text }})
      </option>
    </select>

    <!-- Радиокнопки курсов -->
    <div class="course-select">
      <label v-for="course in [1, 2, 3, 4]" :key="course">
        <input type="radio" :value="course" v-model="selectedCourse" @change="onFilterChange" />
        {{ course }} курс
      </label>
    </div>

    <!-- Контейнер таблицы и предметов -->
    <div class="content-container">
      <!-- Таблица -->
      <div class="scrollable-table">
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="day-cell sticky-col">День</th>
              <th class="pair-cell">Пара</th>
              <th v-for="group in groups" :key="group.group_id" class="group-column">
                {{ group.group_number }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="day in daysOfWeek">
              <tr v-for="pair in pairs" :key="day.day_id + '-' + pair">
                <td v-if="pair === 1" :rowspan="8" class="day-cell sticky-col">{{ day.dayofweek }}</td>
                <td class="pair-cell">{{ pair }}</td>
                <td
                  v-for="group in groups"
                  :key="group.group_id + '-' + day.day_id + '-' + pair"
                  class="schedule-cell"
                  :class="{ 'drag-over': isDragOver(group.group_id, day.day_id, pair) }"
                  @dragover.prevent="setDragOver(group.group_id, day.day_id, pair)"
                  @dragleave="clearDragOver"
                  @drop="onDrop($event, group.group_id, day.day_id, pair)"
                  @dblclick="onCellDoubleClick(group.group_id, day.day_id, pair)"
                >
                  {{ getLesson(group.group_id, day.day_id, pair) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Панель предметов -->
      <div class="workload-panel">
        <h3>Предметы:</h3>
        <div
          v-for="lesson in workload"
          :key="lesson.wl_id"
          class="draggable-item"
          draggable="true"
          @dragstart="onDragStart(lesson)"
        >
          {{ lesson.subject_name }} — {{ lesson.full_name }} ({{ lesson.group_number }})
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "../services/user.service";

export default {
  data() {
    return {
      directions: [],
      selectedDirection: null,
      selectedCourse: 1,
      groups: [],
      workload: [],
      scheduleMap: {},
      draggedLesson: null,
      dragOverKey: null,
      daysOfWeek: [
        { day_id: 1, dayofweek: "Понедельник" },
        { day_id: 2, dayofweek: "Вторник" },
        { day_id: 3, dayofweek: "Среда" },
        { day_id: 4, dayofweek: "Четверг" },
        { day_id: 5, dayofweek: "Пятница" },
        { day_id: 6, dayofweek: "Суббота" },
      ],
      pairs: [1, 2, 3, 4, 5, 6, 7, 8],
    };
  },
  methods: {
    async loadDirection() {
      try {
        const response = await UserService.getDirectionsAsIdText();
        this.directions = response.data;
        if (this.directions.length > 0) {
          this.selectedDirection = this.directions[0].id;
          this.onFilterChange();
        }
      } catch (error) {
        console.error("Ошибка загрузки направлений:", error);
      }
    },

    async onFilterChange() {
      try {
        const response = await UserService.getGroupByDirAndCourse(
          this.selectedDirection,
          this.selectedCourse
        );
        this.groups = response.data;
        const groupIds = this.groups.map((g) => g.group_id);
        await this.loadWorkload(groupIds);
        await this.loadSchedules(groupIds);
      } catch (error) {
        console.error("Ошибка загрузки групп:", error);
      }
    },

    async loadWorkload(groupIds) {
      try {
        const response = await UserService.getWorkloadByGroupIds(groupIds);
        this.workload = response.data;
      } catch (error) {
        console.error("Ошибка загрузки workload:", error);
      }
    },

    async loadSchedules(groupIds) {
      const scheduleMap = {};
      for (const group_id of groupIds) {
        try {
          const response = await UserService.getTeachSchedule(group_id);
          response.data.forEach((lesson) => {
            const key = `${group_id}-${lesson.day_id}-${lesson.time}`;
            scheduleMap[key] = {
              subject_name: lesson.subject_name,
              full_name: lesson.full_name,
              lesson_id: lesson.lesson_id // сохраняем lesson_id
            };
          });
        } catch (error) {
          console.error("Ошибка при загрузке расписания:", error);
        }
      }
      this.scheduleMap = scheduleMap;
    },

    getLesson(group_id, day_id, pair) {
      const key = `${group_id}-${day_id}-${pair}`;
      const lesson = this.scheduleMap[key];
      return lesson ? `${lesson.subject_name} (${lesson.full_name})` : "";
    },

    onDragStart(lesson) {
      this.draggedLesson = lesson;
      console.log(lesson);
    },

    setDragOver(group_id, day_id, pair) {
      this.dragOverKey = `${group_id}-${day_id}-${pair}`;
    },

    clearDragOver() {
      this.dragOverKey = null;
    },

    isDragOver(group_id, day_id, pair) {
      return this.dragOverKey === `${group_id}-${day_id}-${pair}`;
    },

    async onDrop(event, group_id, day_id, pair) {
      this.clearDragOver();
      if (!this.draggedLesson) return;

      const key = `${group_id}-${day_id}-${pair}`;
      this.scheduleMap[key] = {
        subject_name: this.draggedLesson.subject_name,
        full_name: this.draggedLesson.full_name,
        lesson_id: this.draggedLesson.lesson_id
      };

      try {
        await UserService.assignLesson({
          wl_id: this.draggedLesson.wl_id,
          day_id,
          time: pair
        });

        
        await this.loadSchedules(group_id)
      } catch (error) {
        console.error("Ошибка при добавлении занятия:", error);
      }

      this.draggedLesson = null;
    },

    async onCellDoubleClick(group_id, day_id, pair) {
      const key = `${group_id}-${day_id}-${pair}`;
      if (!this.scheduleMap[key]) return;

      const confirmDelete = window.confirm("Удалить занятие?");
      if (!confirmDelete) return;

      try {
        const lessonData = this.scheduleMap[key];
        const lesson_id = lessonData.lesson_id;

        // Удаляем занятие через UserService
        await UserService.deleteLesson(lesson_id);

        const groupIds = this.groups.map(g => g.group_id);
        await this.loadSchedules(groupIds)

        // Очищаем запись из расписания
        this.scheduleMap[key] = null;
      } catch (error) {
        console.error("Ошибка при удалении занятия:", error);
      }
    },
  },
  created() {
    this.loadDirection();
  },
};
</script>

<style scoped>
.main {
  padding: 80px;
}

.direction-select {
  margin-bottom: 10px;
  padding: 6px;
  font-size: 16px;
  width: 800px;
}

.course-select {
  margin-bottom: 15px;
}

.course-select label {
  margin-right: 15px;
  font-weight: bold;
}

.content-container {
  display: flex;
  gap: 20px;
}

/* Таблица */
.scrollable-table {
  max-height: 550px;
  overflow: auto;
  border: 1px solid #ccc;
}

.schedule-table {
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 800px;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: center;
  min-width: 120px;
  vertical-align: middle;
}

.schedule-table thead th {
  position: sticky;
  top: 0;
  background-color: #f2f2f2;
  z-index: 2;
}

.day-cell {
  width: 120px;
  background-color: #f9f9f9;
  left: 0;
  z-index: 1;
  border: 1px solid #ccc;
}

.pair-cell {
  width: 50px;
  background-color: #f9f9f9;
}

.sticky-col {
  position: sticky;
  left: 0;
  background-color: #f9f9f9;
  z-index: 3;
}

.schedule-cell {
  min-height: 80px;
  background-color: #fff;
  transition: background-color 0.2s;
  cursor: pointer;
}

/* Подсветка при наведении */
.drag-over {
  background-color: #cde9ff !important;
  border: 2px dashed #3399ff;
}

/* Панель предметов */
.workload-panel {
  width: 300px;
  max-height: 550px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f7f9fc;
  flex-shrink: 0;
}

.draggable-item {
  padding: 8px;
  margin-bottom: 8px;
  background-color: #eef;
  border: 1px solid #ccd;
  cursor: grab;
  user-select: none;
}
</style>
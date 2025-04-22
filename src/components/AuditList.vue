<template>
  <div class="container mt-4" style="margin-left: 70px;">
    <h4>Аудитории</h4>

      <table class="table table-bordered">
        <thead>
          <tr>
            <!-- Номер -->
            <th>
              <div class="dropdown">
                <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  Номер
                </button>
                <ul class="dropdown-menu">
                  <li v-for="number in uniqueNumbers" :key="number">
                    <label class="dropdown-item">
                      <input type="checkbox" :value="number" v-model="filters.number" /> {{ number }}
                    </label>
                  </li>
                </ul>
              </div>
              <span @click="sortBy('text')" style="cursor: pointer;">Номер</span>
            </th>

            <!-- Тип -->
            <th>
              <div class="dropdown">
                <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  Тип
                </button>
                <ul class="dropdown-menu">
                  <li v-for="type in uniqueTypes" :key="type">
                    <label class="dropdown-item">
                      <input type="checkbox" :value="type" v-model="filters.type" /> {{ type }}
                    </label>
                  </li>
                </ul>
              </div>
              <span @click="sortBy('type')" style="cursor: pointer;">Тип</span>
            </th>

            <!-- Вместимость -->
            <th>
              <div class="dropdown">
                <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  Вместимость
                </button>
                <ul class="dropdown-menu">
                  <li v-for="count in uniqueCounts" :key="count">
                    <label class="dropdown-item">
                      <input type="checkbox" :value="count" v-model="filters.count" /> {{ count }}
                    </label>
                  </li>
                </ul>
              </div>
              <span @click="sortBy('count')" style="cursor: pointer;">Вместимость</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="auditorium in filteredAuditoriums" :key="auditorium.id">
            <td>{{ auditorium.text }}</td>
            <td>{{ auditorium.type }}</td>
            <td>{{ auditorium.count }}</td>
          </tr>
        </tbody>
      </table>

      <button @click="resetFilters" class="btn btn-secondary btn-sm">Сбросить фильтры</button>

      <!-- Таблица -->
      


  <div class="form-group">
    <label for="viewModeSelect">Выберите режим:</label>
    <div class="radio-group">
      <label>
        <input type="radio" v-model="viewMode" value="group" class="radio-input">
        По группам
      </label>
      <label>
        <input type="radio" v-model="viewMode" value="teacher" class="radio-input">
        По преподавателям
      </label>
    </div>
  </div>

<div class="form-group">
  <div v-if="viewMode === 'group'">
    <label for="groupSelect">Выберите группу:</label>
    <select v-model="selectedGroup" @change="onGroupChange" class="form-control small-select" id="groupSelect">
      <option value="" disabled>Выберите группу</option>
      <option v-for="group in groups" :key="group.id" :value="group.id">
        {{ group.text }}
      </option>
    </select>
  </div>

  <div v-if="viewMode === 'teacher'">
    <label for="teacherSelect">Выберите преподавателя:</label>
    <select v-model="selectedTeacher" @change="onTeacherChange" class="form-control small-select" id="teacherSelect">
      <option value="" disabled>Выберите преподавателя</option>
      <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
        {{ teacher.text }}
      </option>
    </select>
  </div>
</div>

    
    <h3>
      Расписание {{ viewMode === 'group' ? 'группы' : 'преподавателя' }} 
      {{ viewMode === 'group' ? (groups.find(group => group.id === selectedGroup)?.text ) : 
                                (teachers.find(teacher => teacher.id === selectedTeacher)?.text ) }}
    </h3>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Пара</th>
            <th v-for="day in daysOfWeek" :key="day.day_id">{{ day.dayofweek }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pair in pairs" :key="pair">
            <td>{{ pair }} Пара</td>
            <td v-for="day in daysOfWeek" :key="day.day_id">
              <div v-if="getSchedule(day.day_id, pair)">
                <!-- Преподаватель, дисциплина и группа -->
                <div @click="openModal(day.day_id, pair)" class="schedule-cell"
                  :style="{
                    backgroundColor: getSchedule(day.day_id, pair).number && getSchedule(day.day_id, pair).number !== ' ' ? '#32c454' : 'yellow'
                  }">
                <strong>{{ getSchedule(day.day_id, pair).full_name }}</strong> <br>
                {{ getSchedule(day.day_id, pair).subject_name }} <br>
                {{ getSchedule(day.day_id, pair).group_number }} гр. <br>
                {{ getSchedule(day.day_id, pair).number || ' ' }} ауд.<br>
                </div>
              </div>
              
            </td>
          </tr>
        </tbody>
      </table>

    <!-- Модальное окно -->
    <div v-if="showModal" class="modal" tabindex="-1" role="dialog" style="display: block;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Назначить аудиторию</h5>
            <button type="button" class="close" @click="closeModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <h5 class="mb-3">Назначение аудитории</h5>

            <ul class="list-group mb-3">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar3 me-2"></i>День</span>
                <span class="fw-semibold">{{ getDayName(currentDay) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="bi bi-clock me-2"></i>Пара</span>
                <span class="fw-semibold">{{ currentPair }} пара</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-if="currentScheduleItem">
                <span><i class="bi bi-person-badge me-2"></i>Преподаватель</span>
                <span class="fw-semibold">{{ currentScheduleItem.full_name }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-if="currentScheduleItem">
                <span><i class="bi bi-book me-2"></i>Дисциплина</span>
                <span class="fw-semibold">{{ currentScheduleItem.subject_name }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-if="currentScheduleItem">
                <span><i class="bi bi-people me-2"></i>Группа</span>
                <span class="fw-semibold">{{ currentScheduleItem.group_number }} гр.</span>
              </li>
            </ul>

            <label for="audSelect" class="form-label">Выберите аудиторию:</label>
            <select id="audSelect" v-model="selAud" class="form-select">
              <option v-for="auditorium in auditoriums" :key="auditorium.id" :value="auditorium.id">
                {{ auditorium.text }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="assignAuditorium">Сохранить</button>
            <button type="button" class="btn btn-secondary" @click="closeModal">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "../services/user.service"; // Подключаем user.service для запросов

export default {
  data() {
    return {
      daysOfWeek: [],
      pairs: [1, 2, 3, 4, 5, 6, 7, 8],
      schedule: [],
      teachschedule: [],
      auditoriums: [],
      groups: [], // Добавляем массив для групп
      teachers: [],
      selectedTeacher: null,
      selectedGroup: null, // Выбранная группа
      viewMode: 'group',
      showModal: false,
      currentDay: null,
      currentPair: null,
      selectedAuditorium: null,
      selAud: null,
      currentScheduleItem: null,
      selectedLesson: null,
      sortKey: '',
      sortAsc: true,
      filters: {
        number: [],
        type: [],
        count: []
    }
    };
  },
  computed: {
    uniqueNumbers() {
      return [...new Set(this.auditoriums.map(a => a.text))].sort();
    },
    uniqueTypes() {
      return [...new Set(this.auditoriums.map(a => a.type))].sort();
    },
    uniqueCounts() {
      return [...new Set(this.auditoriums.map(a => a.count))].sort((a, b) => a - b);
    },
    filteredAuditoriums() {
      let result = this.auditoriums;

      if (this.filters.number.length)
        result = result.filter(a => this.filters.number.includes(a.text));

      if (this.filters.type.length)
        result = result.filter(a => this.filters.type.includes(a.type));

      if (this.filters.count.length)
        result = result.filter(a => this.filters.count.includes(a.count));

      if (this.sortKey) {
        result = result.slice().sort((a, b) => {
          let valA = a[this.sortKey];
          let valB = b[this.sortKey];

          if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
          }

          return this.sortAsc ? valA > valB ? 1 : -1 : valA < valB ? 1 : -1;
        });
      }

      return result;
    }
  },
  methods: {
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
    },
    resetFilters() {
      this.filters = { number: [], type: [], count: [] };
    },
  
    getDayName(day_id) {
      const day = this.daysOfWeek.find(day => day.day_id === day_id);
      return day ? day.dayofweek : 'Неизвестный день';
    },
    getAuditoriumClass(schedule) {
      // Если аудитория пуста, окрашиваем в желтый, если нет — в зеленый
      return schedule.number ? 'occupied' : 'vacant';
    },
    openModal(day_id, pair) {
      this.currentDay = day_id;
      this.currentPair = pair;
      this.currentScheduleItem = this.getSchedule(day_id, pair);
      this.showModal = true;
    },
    closeModal() {

      this.showModal = false;
      this.currentDay = null;
      this.currentPair = null;
      this.selAud = null;
      this.currentScheduleItem = null;
    },
    selectAuditorium(auditorium) {
    // Проверяем, если та же аудитория уже выбрана, то скрываем информацию
      if (this.selectedAuditorium && this.selectedAuditorium.id === auditorium.id) {
        this.selectedAuditorium = null; // Скрываем информацию
      } else {
        // Если выбрана другая аудитория, отображаем информацию о новой аудитории
        this.selectedAuditorium = auditorium;
      }
    },
    async assignAuditorium() {
      console.log('аудитория ', this.selAud,this.currentScheduleItem.lesson_id,this.currentDay, this.currentPair)
        if (!this.selAud) {
          alert("Пожалуйста, выберите аудиторию.");
          return;
        }

        try {
          // Получаем данные о текущем расписании
          const lesson_id = this.currentScheduleItem.lesson_id;
          const aud_id = this.selAud;

          // Вызов функции для назначения аудитории в расписании
          await UserService.assignAuditoriumToSchedule(lesson_id, aud_id);

          // Перезагружаем расписание после обновления
          this.loadSchedule();

          // Закрываем модалку
          this.closeModal();
        } catch (error) {
          console.error('Ошибка при назначении аудитории:', error);
        }
      },
    async loadSchedule() {
      if (!this.selectedGroup && !this.selectedTeacher) return; // Проверка выбора группы или преподавателя
      
      try {
        let response;
        if (this.viewMode === 'group') {
          if (!this.selectedGroup) return; // Проверка, выбрана ли группа
          response = await UserService.getTeachSchedule(this.selectedGroup);
        } else if (this.viewMode === 'teacher') {
          if (!this.selectedTeacher) return; // Проверка, выбран ли преподаватель
          response = await UserService.getGroupSchedule(this.selectedTeacher);
        }

        // Убедимся, что данные всегда в формате массива
        this.teachschedule = Array.isArray(response.data) ? response.data : [response.data];
        
        console.log('schedule: ', this.teachschedule); // Выводим расписание в консоль
      } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
      }
    },
    async loadAuditoriums() {
      try {
        const response = await UserService.getAuditAsIdText();
        this.auditoriums = Array.isArray(response.data) ? response.data : [response.data];
      } catch (error) {
        console.error('Ошибка загрузки аудиторий:', error);
      }
    },
    async loadGroups() {
      try {
        const response = await UserService.getGroupsAsIdText(); // Запрос для получения списка групп
        this.groups = response.data;
        if (this.groups.length > 0) {
          this.selectedGroup = this.groups[0].id; // Устанавливаем первую группу по умолчанию
          this.loadSchedule(); // Загружаем расписание для первой группы
        }
      } catch (error) {
        console.error('Ошибка загрузки групп:', error);
      }
    },
    async loadTeachers() {
      try {
        const response = await UserService.getTeachersAsIdText(); // Запрос для получения списка преподавателей
        this.teachers = response.data;
        if (this.teachers.length > 0) {
          this.selectedTeacher = this.teachers[0].id; // Устанавливаем первого преподавателя по умолчанию
          this.loadSchedule(); // Загружаем расписание для первого преподавателя
        }
      } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
      }
    },
    getSchedule(day_id, pair) {
      
      const scheduleArray = JSON.parse(JSON.stringify(this.teachschedule)); // Преобразуем Proxy в обычный массив
      const scheduleItem = scheduleArray.find(item => {
        const dayComparison = Number(item.day_id) === Number(day_id);
        const timeComparison = Number(item.time) === Number(pair);
        return dayComparison && timeComparison;
      });
      if (scheduleItem) {
        if (typeof scheduleItem.number === 'object' && !Array.isArray(scheduleItem.number) && Object.keys(scheduleItem.number).length === 0) {
          scheduleItem.number = ' ';  
        }
      }
      console.log("расписание ", scheduleItem)
      if (!scheduleItem) {
        console.log("Элемент не найден.");
      } else {
        console.log("Найденный элемент:", scheduleItem);
      }

      return scheduleItem || null;
    },
    onGroupChange() {
      this.loadSchedule(); 
    },
    onTeacherChange() {
      this.loadSchedule(); 
    }
  },
  created() {
    this.loadGroups(); // Загружаем группы при создании компонента
    this.loadAuditoriums();
    this.loadTeachers();
    this.daysOfWeek = [
      { day_id: 1, dayofweek: "Понедельник" },
      { day_id: 2, dayofweek: "Вторник" },
      { day_id: 3, dayofweek: "Среда" },
      { day_id: 4, dayofweek: "Четверг" },
      { day_id: 5, dayofweek: "Пятница" },
      { day_id: 6, dayofweek: "Суббота" }
    ];
  }
};
</script>

<style scoped>

.occupied {
  background-color: #32c454; /* Зеленый для занятых */
  color: white;
}

.vacant {
  background-color: #ffc107; /* Желтый для пустых */
  color: black;
}

.small-select{
  max-width: 300px;
}
.form-group{
  margin-top: 15px;
}
.radio-group {
  display: flex;
  flex-direction: column;
}

.radio-group label {
  margin-bottom: 10px; /* Отступ между радио-кнопками */
}

.radio-input {
  margin-right: 8px; /* Отступ между радио-кнопкой и текстом */
}
.d-flex {
  display: flex;
  align-items: flex-start; /* Выравниваем по верхней части */
}

.ml-4 {
  margin-left: 1.5rem; /* Отступ слева для блока информации */
}
.schedule-cell {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  text-align: center;
}
.modal {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-dialog {
  width: 500px;
  margin: 10% auto;
}

.filters {
  display: flex;
  gap: 30px;
}
.filters label {
  font-weight: bold;
}


</style>

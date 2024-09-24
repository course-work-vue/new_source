<template>
  <div class="container mt-4">
  <div class="d-flex">
    <!-- Список аудиторий -->
    <div class="col-md-4">
      <div class="list-group">
        <a v-for="auditorium in auditoriums" 
           :key="auditorium.id" 
           @click="selectAuditorium(auditorium)" 
           class="list-group-item list-group-item-action">
          Ауд. {{ auditorium.text }}
        </a>
      </div>
    </div>

    <!-- Информация об аудитории -->
    <div v-if="selectedAuditorium" class="col-md-4 ml-4">
      <h5>Информация об аудитории</h5>
      <p>Номер: {{ selectedAuditorium.text }}</p>
      <p>Тип: {{ selectedAuditorium.type }}</p>
      <p>Мест: {{ selectedAuditorium.count }}</p>
    </div>
  </div>

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
                                (teachers.find(teacher => teacher.id === selectedTeacher)?.full_name ) }}
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
                <div @click="openModal(day.day_id, pair)" class="schedule-cell">
                  <strong>{{ getSchedule(day.day_id, pair).full_name }}</strong> <br>
                  {{ getSchedule(day.day_id, pair).subject_name }} <br>
                  {{ getSchedule(day.day_id, pair).group_number }} гр. <br>
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
            <p>Назначить аудиторию для:</p>
            <p>День: {{ getDayName(currentDay) }}</p>
            <p>Пара: {{ currentPair }} Пара</p>
            <select v-model="selectedAuditorium" class="form-control">
              <option v-for="auditorium in auditoriums" :key="auditorium.aud_id" :value="auditorium.aud_id">
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
      selectedAuditorium: null
    };
  },
  methods: {
    
    getDayName(day_id) {
      const day = this.daysOfWeek.find(day => day.day_id === day_id);
      return day ? day.dayofweek : 'Неизвестный день';
    },
    openModal(day_id, pair) {
      this.currentDay = day_id;
      this.currentPair = pair;
      this.showModal = true;
    },
    closeModal() {

      this.showModal = false;
      this.currentDay = null;
      this.currentPair = null;
      this.selectedAuditorium = null;
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
      if (!this.selectedAuditorium) {
        alert("Пожалуйста, выберите аудиторию.");
        return;
      }

      try {
        const response = await UserService.assignAuditorium({
          aud_id: this.selectedAuditorium,
          day_id: this.currentDay,
          timerange: this.currentPair
        });
        this.loadSchedule(); // Обновляем расписание после назначения
        this.closeModal(); // Закрываем модалку
      } catch (error) {
        console.error('Ошибка назначения аудитории:', error);
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

</style>

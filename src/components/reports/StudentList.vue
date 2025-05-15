<template>
    <div class="student-list">
      <table class="student-table">
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Посещаемость %</th>
            <th>Ср. балл</th>
            <th v-if="showExamColumn">Экзамен</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id">
            <td>{{ student.fullName }}</td>
            <td>{{ student.attendancePct }}</td>
            <td>{{ student.avgGrade }}</td>
            <td v-if="showExamColumn">{{ student.exam }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StudentList',
    props: {
      students: {
        type: Array,
        required: true
      },
      showExamColumn: {
        type: Boolean,
        default: false
      }
    }
  };
  </script>
  
  <style scoped>
  .student-list {
    overflow-y: auto;
    max-height: 400px;
  }
  .student-table {
    width: 100%;
    border-collapse: collapse;
  }
  .student-table th,
  .student-table td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  .student-table th {
    background-color: #f5f5f5;
    position: sticky;
    top: 0;
  }
  .student-table tbody tr:nth-child(odd) {
    background-color: #fafafa;
  }
  </style>
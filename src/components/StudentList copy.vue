
<template>
  <div class="col col-xs-9 col-lg-12 mt-4 list">
    <div class="col col-12">
    <div class="mb-3 col col-12">
      <button @click="navigateToAddStudent" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined">add</i>Добавить студента</button>
      <div class="col col-3 float-end">
      <input class="form-control" v-model="searchQuery" @input="updateSearchQuery" placeholder="Поиск..."> 
    </div>
  </div>
      <!-- список студентов -->
      <table v-if="loading" class="table">
        <tbody>
        <tr v-for="n in studentsPerPage" :key="n">
          <td><div class="skeleton skeleton-animate"></div></td>
          <td><div class="skeleton skeleton-animate"></div></td>
          <td><div class="skeleton skeleton-animate"></div></td>
          <td><div class="skeleton skeleton-animate"></div></td>
          <td><div class="skeleton skeleton-animate"></div></td>
          <td><div class="skeleton skeleton-animate"></div></td>
        </tr>
      </tbody>
    </table>
    <table v-else class="table">
        <!-- таблица -->
        <thead>
          <!-- колонки -->
          <tr>
            <th>ID студента</th>
            <th>ФИО</th>
            <th>Группа</th>
            <th>Приказ о зачислении</th>
            <th>Дата зачисления</th>
            <th>Дата рождения</th>
          </tr>
        </thead>
        <!-- тело таблицы -->
        <tbody>
          <!-- цикл по строкам студентов -->
          <tr v-for="student in paginatedStudents" :key="student.student_id">
            <td>{{ student.student_id }}</td>
            <td>{{ student.full_name }}</td>
            <td>{{ student.group_name }}</td>
            <td>{{ student.enrollment_order }}</td>
            <td>{{ student.formatted_enrolled_date }}</td>
            <td>{{ student.formatted_date_of_birth }}</td> <!-- тест перевода даты -->
            <td>
              <!-- кнопошка -->
              <button @click="viewStudentDetail(student.student_id)" class="btn btn-primary btn-sm"><i class="material-icons-outlined">visibility</i>Детали</button>
             
            </td>
          </tr>
        </tbody>
      </table>


      <!-- странички -->
      <nav class="float-start">
        <ul class=" pagination">
          <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
            <button @click="prevPage" class="btn page-link btn-sm"><i class="material-icons-outlined">chevron_left</i></button>
          </li>
          <li class="page-item" v-for="pageNumber in pageRange" :key="pageNumber" :class="{ 'active': pageNumber == currentPage }">
            <button @click="changePage(pageNumber)" class="btn page-link nmbr btn-sm">{{ pageNumber }}</button>
          </li>
          <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
            <button @click="nextPage" class="btn page-link btn-sm"><i class="material-icons-outlined">chevron_right</i></button>
          </li>
        </ul>
      </nav>
      <div class="float-end"> <button @click="viewRightsDetail()" class="btn btn-primary btn-sm">Права ролей</button>
      </div>
    </div>
  </div>
  </template>
  
  <script>

  import UserService from "../services/user.service";




  export default {
  

    data() {




      return {

        
        students: [], // массив всех студентов
        currentPage: 1, // теущий номер страницы
        studentsPerPage: 10, // кол-во студентов на странице
        maxPageButtons: 3,
        loading: true,
        searchQuery: ''
      };
    },
    computed: {
      // подсчет страниц

  totalPages() {
    const filteredStudents = this.filterStudents();
    return Math.ceil(filteredStudents.length / this.studentsPerPage);
  },
  paginatedStudents() {
    const startIndex = (this.currentPage - 1) * this.studentsPerPage;
    const endIndex = startIndex + this.studentsPerPage;

    const filteredStudents = this.filterStudents();
    return filteredStudents.slice(startIndex, endIndex);
  },
  pageRange() {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const maxButtons = this.maxPageButtons;
    const ellipsis = '...';

    if (totalPages <= maxButtons) {
      // If total pages are less than or equal to the max buttons, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate the start and end page numbers for the limited display
    const halfMaxButtons = Math.floor(maxButtons / 2);
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Ensure that we always show maxButtons, if possible
    if (endPage - startPage + 1 < maxButtons) {
      startPage = endPage - maxButtons + 1;
    }

    // Insert an ellipsis and the last page when appropriate
    const pageRange = [];

    if (startPage > 1) {
      pageRange.push(1, ellipsis);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageRange.push(i);
    }

    if (endPage < totalPages) {
      pageRange.push(ellipsis, totalPages);
    }

    return pageRange;
  },
    },
    methods: {
      filterStudents() {
    const queryString = this.searchQuery.toLowerCase();
    return this.students.filter(student => {
      return (
        String(student.full_name).toLowerCase().includes(queryString) ||
        String(student.group_name).toLowerCase().includes(queryString) ||
        String(student.formatted_date_of_birth).includes(queryString) ||
        String(student.enrollment_order).includes(queryString)
      );
    });
  },
      // грузим данные
      async loadStudentsData() {
        try {
          const response = await UserService.getAllFormattedStudents(); // Replace with your API endpoint
          this.students = Array.isArray(response.data) ? response.data : [response.data];
          this.loading=false;
        } catch (error) {
          console.error('Error loading students data:', error);
        }
      },

      updateSearchQuery() {
  const query = { page: 1 }; // когда меняется фильтр летим на первую страницу
  if (this.searchQuery.trim() !== '') {
    query.search = this.searchQuery;
  }
  this.currentPage = 1; 
  this.$router.replace({ query });
},
      // смена страницы
      changePage(pageNumber) {
  const query = { ...this.$route.query, page: pageNumber };
  if (this.searchQuery.trim() !== '') {
    query.search = this.searchQuery;
  }
  this.$router.replace({ query });
},
      prevPage() {
        if (this.currentPage > 1) {
        this.changePage(this.currentPage - 1);
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.changePage(this.currentPage + 1);
        }
      },
      // смотрим детали о студенте
      viewStudentDetail(studentId) {
        this.$router.push(`/students/${studentId}`);
      },
      viewRightsDetail(){
        this.$router.push(`/Rights/students`);
      },

      navigateToAddStudent() {
    
        this.$router.push(`/addStudent`); // Navigate to the AddStudent route
    },
    },

    beforeRouteUpdate(to, from, next) {
  // берём филтр из роутера
  this.searchQuery = to.query.search || '';
  // берём страницу из роутера
  this.currentPage = parseInt(to.query.page) || 1;
  next();
},

    created() {
    const query = this.$route.query;
    this.currentPage = parseInt(query.page) || 1;
    this.searchQuery = query.search || '';
    this.loadStudentsData();
    },
  };
  </script>

<style lang="scss" scoped>
.skeleton {
  width: 100%;
  height: 1.2em;
  background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
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
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }

  
}

@media (max-width: 769px) {
  .list{
    padding-left: 100px;
    font-size: 10px;
    max-width: 1100px;
  }
}

@media (max-width: 1023px) {



  .list{
    padding-left: 100px;
    font-size: 13px;

  }
}
@media (min-width: 1023px) {



.list{
  padding-left: 100px;
  padding-right: 5px;

}
}
.nmbr{
  height: 44px;
}



.btn-primary{
    --bs-btn-bg: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
    --bs-btn-active-bg: rgb(68,99,52);
    --bs-btn-disabled-bg: rgb(68,99,52);
    display: flex;
  justify-content: center;
  align-items: center;
}
.form-control:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}
.form-select:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}
.page-link{
  height: 40px;
  width: 40px;
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.active{
  .page-link{
    background-color: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
 
  }
}
.disabled{
  .page-link{
    background-color: rgb(57, 79, 46);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
  }
}
</style>
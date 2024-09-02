<template>
  <div class="col-md-12 list">
    <div v-if="student" >
      <Form  @submit="updateStudent" :validation-schema="schema" v-slot="{ errors }">
        
        <div>

          <div class="form-group d-inline-flex align-items-center float-none mb-2 col-3">
            <label for="course">Подгруппа:</label>
            <Field name="course" type="text" class="form-control" :class="{'is-invalid': errors.course}" v-model="editedCourse.course"/>
            <ErrorMessage name="course" class="error-feedback" />
            
          </div>
          <div class="d-flex flex-wrap">
          <div class="form-group d-inline-flex align-items-center mb-2">
            <label for="group_id">Группа:</label>
            
            <Select2 :class="{'form-control is-invalid': errors.group_id}" v-model="editedCourse.group_id" 
            :options="groups" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="group_id" as="select" v-model="editedCourse.group_id" hidden>
              <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.text }}</option>
            </Field>
            <ErrorMessage name="group_id" class="error-feedback" />
          </div>

         
        </div>
          <div class="form-group  mt-3">
            
            <router-link to="/courses" class="mx-2 btn btn-secondary  float-start">Отмена</router-link>
          </div>
          <div class="form-group float-end">
            <button class="btn btn-danger float-end" @click="deleteCourse">
              Удалить студента
            </button>
          </div>
          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить курс
            </button>
        
          </div>
     
        
        </div>
      </Form>

    </div>
    <div v-else>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>

    </div>
      
      
   
      <div
        v-if="message"
        class="alert"
        :class="successful ? 'alert-success' : 'alert-danger'"
      >
        {{ message }}
      </div>
    </div>

</template>

  <script>

import { Form, Field, ErrorMessage } from "vee-validate";
  import * as yup from "yup";
  import UserService from "../services/user.service";
  import { useToast } from "vue-toastification";
  export default {

    setup() {
      const toast = useToast();
      return { toast }
    },
    components: {
      Form,
      Field,
      ErrorMessage,

      
    },


    data() {
      const schema = yup.object().shape({
        
        email: yup
          .string()
          .required("Email is required!")
          .email("Email is invalid!")
          .max(50, "Must be maximum 50 characters!"),


          group_id: yup
          .string()
          .required("Email is required!")
          
       
      });

      return {
        schema,
        loading:false,
        student: null, // заглушка для данных студента
        editedStudent: null, // заглушка для новых данных студента
        groups: null,

      };
    },
    methods: {
      // грузим студента из psql по id 
      async loadCourseDetail() {
        const courseId = this.$route.params.courseId;
        try {
          const response = await UserService.getCourseById(courseId);
          this.student = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedCourse = { ...response.data };
        } catch (error) {
          console.error('Error loading student details:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updateCourse() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateCourseById(this.course.course_id, this.editedCourse.course, this.editedCourse.group_id);
          response.data;
          this.course = { ...this.editedCourse };
          this.loading=false;
          this.toast.success("Успешно обновили студента!");
        } catch (error) {
          console.error('Ошибка загрузки данных о студенте:', error);
        }
      },
      async deleteCourse() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteStudentById(this.student.student_id);
          response.data;
          this.student = { ...this.editedStudent };
          this.loading=false;
          this.toast.success("Успешно удалили курс!");
        } catch (error) {
          console.error('Ошибка загрузки данных о курс:', error);
        }
      },
      async loadGroupsData() {
        try {
          const response = await UserService.getGroupsAsIdText(); 
          this.groups = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error('Ошибка загрузки данных о курсе:', error);
        }
      }
    },
    created() {
      this.loadCourseDetail();
      this.loadStudentDetail();
     
    },
  };
  </script>

<style lang="scss" scoped>
label{
  margin-right: 15px;
  white-space: nowrap;
}
.form-group{
  margin-right: 20px;
}
.skeleton-text {
  width: 15%;
  height: 1.0em;
  background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 3.5s infinite linear;
  border-radius: 4px;
  margin: 0.2em 0;
}

.skeleton {
  width: 100%;
  height: 2.2em;
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

  justify-content: center;
  align-items: center;
}

.btn-primary:active{
  --bs-btn-bg: rgb(68,99,52);
  
}
.form-control:focus, .select2-container--bootstrap-5.select2-container--focus,.select2-container--bootstrap-5.select2-container--open .select2-selection {
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
.form-check-input:checked{
  background-color: rgb(68,99,52);
    border: none;
}
</style>
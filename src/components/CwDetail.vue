<template>
  <div class="col-md-12 list">
    <div v-if="Cw" >
      <Form @submit="updateCw" :validation-schema="schema" v-slot="{ errors }">
        
        <div >
          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="course_work_theme">Тема работы:</label>
              <Field name="course_work_theme" type="text" class="form-control" :class="{'is-invalid': errors.course_work_theme}" v-model="editedCw.course_work_theme"/>
              <ErrorMessage name="course_work_theme" class="error-feedback" />
              
            </div>

          <div class="form-group d-inline-flex align-items-center col-6 mb-2">
              <label for="course_work_teacher_id">Руководитель:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.course_work_teacher_id}" v-model="editedCw.course_work_teacher_id" 
              :options="teachers" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course_work_teacher_id" as="select" v-model="editedCw.course_work_teacher_id" hidden>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">{{ teacher.text }}</option>
              </Field>
              <ErrorMessage name="course_work_teacher_id" class="error-feedback" />
            </div>


            <div class="form-group d-inline-flex align-items-center col-10 mb-2">
              <label for="course_work_student_id">Исполнитель:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.course_work_student_id}" v-model="editedCw.course_work_student_id" 
              :options="students" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course_work_student_id" as="select" v-model="editedCw.course_work_student_id" hidden>
                <option v-for="student in students" :key="student.id" :value="student.id">{{ student.text }}</option>
              </Field>
              <ErrorMessage name="course_work_student_id" class="error-feedback" />
            </div>


            <div class="form-group d-inline-flex align-items-center col-6 mb-2">
              <label for="course_work_kafedra">Кафедра:</label>
              
              <Select2 class="col-6" :class="{'form-control is-invalid': errors.course_work_kafedra}" v-model="editedCw.course_work_kafedra" 
              :options="departaments" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course_work_kafedra" as="select" v-model="editedCw.course_work_kafedra" hidden>
                <option v-for="departament in departaments" :key="departament.id" :value="departament.id">{{ departament.text }}</option>
              </Field>
              <ErrorMessage name="course_work_kafedra" class="error-feedback" />
            </div>

            <div class="form-group d-inline-flex align-items-center col-5 mb-2">

              <Field v-slot="{ field2 }" name="course_work_vipysk" type="radio" :value="true">
                <label>
                  <input type="radio" name="course_work_vipysk" v-bind="field2" value="false" class="form-check-input mt-0 ml-5" v-model="editedCw.course_work_vipysk" :checked="editedCw.course_work_vipysk == false" />
                  Курсовая работа
                </label>
              </Field>
              <ErrorMessage name="course_work_vipysk" class="error-feedback" />
              <Field v-slot="{ field }" name="editedCw.course_work_vipysk" type="radio" :value="true">
                <label>
                  <input type="radio" name="editedCw.course_work_vipysk" v-bind="field" value="true" class="form-check-input mt-0 ml-5" v-model="editedCw.course_work_vipysk" :checked="editedCw.course_work_vipysk == true" />
                  Выпускная работа
                </label>
              </Field>
            </div>


            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="course_work_year">Год:</label>
              <Field name="course_work_year" type="number" class="form-control" :class="{'is-invalid': errors.course_work_year}" v-model="editedCw.course_work_year"/>
              <ErrorMessage name="course_work_year" class="error-feedback" />
            </div>
            <div class="form-group d-inline-flex align-items-center col-3 mb-2">
              <label for="course_work_ocenka">Оценка:</label>
              <Field name="course_work_ocenka" type="number" class="form-control" :class="{'is-invalid': errors.course_work_ocenka}" v-model="editedCw.course_work_ocenka"/>
              <ErrorMessage name="course_work_ocenka" class="error-feedback" />
            </div>
             
             

             
          
          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block float-start" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить работу
            </button>
            <button type="button" class="btn btn-danger mx-2 float-end" @click="deleteCW">
              Удалить работу
            </button>
            <router-link to="/courseworks" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
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
        
      
       
      });

      return {
        schema,
        loading:false,
        Cw: null, // заглушка для данных студента
        editedCw: null, // заглушка для новых данных студента
        profiles: null,
        directions: null,

      };
    },
    methods: {
      // грузим студента из psql по id 
      async deleteCW() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteCwById(this.Cw.course_work_id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/courseworks');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      async updateCw() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateCwById(this.Cw.course_work_id,this.editedCw.course_work_theme, this.editedCw.course_work_teacher_id, this.editedCw.course_work_student_id,this.editedCw.course_work_kafedra,this.editedCw.course_work_vipysk,this.editedCw.course_work_year,this.editedCw.course_work_ocenka);
          response.data;
          this.Cw = { ...this.editedCw };
          this.loading=false;
          this.toast.success("Успешно обновили работу!");
        } catch (error) {
          console.error('Ошибка загрузки данных о работе:', error);
        }
      },
      async loadCwDetail() {
        const CwId = this.$route.params.CwId;
        try {
          const response = await UserService.getCwById(CwId);
          this.Cw = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedCw = { ...response.data };
        } catch (error) {
          console.error('Error', error);
        }
      },
      // Метод для обновления данных о студенте
      async loadTeachersData() {
        try {
          const response = await UserService.getTeachersAsIdText(); 
          this.teachers = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error('Error:', error);
        }
      },

      async loadStudentsData() {
        try {
          const response = await UserService.getStudentsAsIdText(); 
          this.students = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error('Error:', error);
        }
      },
    
      async loadDepartamentsData() {
        try {
          const response = await UserService.getDepartamentsAsIdText(); 
          this.departaments = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Error:', error);
        }
      },
    },
    async created() {
     await this.loadDepartamentsData();
     await  this.loadTeachersData();
     await this.loadStudentsData();

     await this.loadCwDetail();
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
    display: flex;
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
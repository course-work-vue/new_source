<template>
  <div class="list">
  <div v-if="dataLoading">
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
    <div v-else class="col-md-12">
      <Form @submit="addCw" :validation-schema="schema" v-slot="{ errors }">
          <div>

          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="course_work_theme">Тема работы:</label>
              <Field name="course_work_theme" type="text" class="form-control" :class="{'is-invalid': errors.course_work_theme}"/>
              <ErrorMessage name="course_work_theme" class="error-feedback" />
              
            </div>

          
           

            <div class="form-group d-inline-flex align-items-center col-6 mb-2">
              <label for="course_work_teacher_id">Руководитель:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.course_work_teacher_id}" v-model="myValue" 
              :options="teachers" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course_work_teacher_id" as="select" v-model="myValue" hidden>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">{{ teacher.text }}</option>
              </Field>
              <ErrorMessage name="course_work_teacher_id" class="error-feedback" />
            </div>


            <div class="form-group d-inline-flex align-items-center col-10 mb-2">
              <label for="course_work_student_id">Исполнитель:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.course_work_student_id}" v-model="myValue2" 
              :options="students" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course_work_student_id" as="select" v-model="myValue2" hidden>
                <option v-for="student in students" :key="student.id" :value="student.id">{{ student.text }}</option>
              </Field>
              <ErrorMessage name="course_work_student_id" class="error-feedback" />
            </div>


            <div class="form-group d-inline-flex align-items-center col-6 mb-2">
              <label for="course_work_kafedra">Кафедра:</label>
              
              <Select2 class="col-6" :class="{'form-control is-invalid': errors.course_work_kafedra}" v-model="myValue3" 
              :options="departaments" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course_work_kafedra" as="select" v-model="myValue3" hidden>
                <option v-for="departament in departaments" :key="departament.id" :value="departament.id">{{ departament.text }}</option>
              </Field>
              <ErrorMessage name="course_work_kafedra" class="error-feedback" />
            </div>

            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <Field name="course_work_vipysk" type="radio" id="course_work_vipysk1" value="false" class="form-check-input mt-0 ml-5" :class="{'is-invalid': errors.course_work_vipysk}"/>
              <label for="course_work_vipysk1">Курсовая работа</label>
              <Field name="course_work_vipysk" type="radio" id="course_work_vipysk2" value="true" class="form-check-input mt-0" :class="{'is-invalid': errors.course_work_vipysk}"/>
              <label for="course_work_vipysk2">Выпускная работа</label>
             
              <ErrorMessage name="magister" class="error-feedback" />
              
            </div>
            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="course_work_year">Год:</label>
              <Field name="course_work_year" type="number" class="form-control" :class="{'is-invalid': errors.course_work_year}"/>
              <ErrorMessage name="course_work_year" class="error-feedback" />
            </div>
            <div class="form-group d-inline-flex align-items-center col-3 mb-2">
              <label for="course_work_ocenka">Оценка:</label>
              <Field name="course_work_ocenka" type="number" class="form-control" :class="{'is-invalid': errors.course_work_ocenka}"/>
              <ErrorMessage name="course_work_ocenka" class="error-feedback" />
            </div>

            <div class="form-group mt-3">
             
             <router-link to="/courseworks" class="btn btn-secondary ml-2 float-start">Отмена</router-link>
             <button class="btn btn-primary btn-block float-end" :disabled="loading">
               <span
                 v-show="loading"
                 class="spinner-border spinner-border-sm"
               ></span>
               Добавить работу
             </button>
           </div>
          </div>
        </Form>
  
        <div
          v-if="message"
          class="alert"
          :class="successful ? 'alert-success' : 'alert-danger'"
        >
          {{ message }}
        </div>
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

    name: "AddGroup",
    components: {
      Form,
      Field,
      ErrorMessage,

      
    },
    data() {
      const schema = yup.object().shape({
        
       
       
      });
  
      return {
        successful: false,
        loading: false,
        dataLoading:true,
        message: "",
        schema,
        groups: null,
        profiles: null,
        directions: null,
        teachers:null,
        students:null,
        departaments:null,
        myValue: '',
      };
    },
    computed: {

    },
    mounted() {
    
    },
    methods: {

      async addCw(cw) {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.addCw(cw.course_work_theme,cw.course_work_teacher_id,cw.course_work_student_id,cw.course_work_kafedra,cw.course_work_vipysk,cw.course_work_year,cw.course_work_ocenka);
          response.data;
          this.loading=false;
          this.successful=true;

          this.toast.success("Успешно добавили работу!");
        } catch (error) {
          this.message="Ошибка";
          this.toast.error("Ошибка добавления работы");
          console.error('Error:', error);
        }
      },
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

    created() {

    this.loadTeachersData();
    this.loadStudentsData();
    this.loadDepartamentsData();
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
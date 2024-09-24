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
          <Form @submit="addTegrsu" :validation-schema="schema" v-slot="{ errors }">
            <div>
              
              
              
              <div class="d-flex flex-wrap">
             
                <div class="form-group col-12 d-inline-flex align-items-center mb-2">
                <label for="teacher_id">Преподаватель:</label>
                
                <Select2 :class="{'form-control is-invalid': errors.teacher_id}" v-model="myValue" 
                :options="teachers" 
                :settings=" { theme: 'bootstrap-5', width: '300%'}"
                
                 />
  
                 <Field  name="teacher_id" as="select" v-model="myValue" hidden>
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">{{ teacher.text }}</option>
                </Field>
                <ErrorMessage name="teacher_id" class="error-feedback" />
              </div>
  
              <div class="form-group d-inline-flex align-items-center mb-2">
                <label for="group_id">Группа:</label>
                
                <Select2 :class="{'form-control is-invalid': errors.group_id}" v-model="myValue2" 
                :options="groups" 
                :settings=" { theme: 'bootstrap-5', width: '100%'}"
                
                 />
  
                 <Field  name="group_id" as="select" v-model="myValue2" hidden>
                  <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.text }}</option>
                </Field>
                <ErrorMessage name="group_id" class="error-feedback" />
              </div>

              <div class="form-group col-12 d-inline-flex align-items-center mb-2">
                <label for="subject_id">Предмет:</label>
                
                <Select2 :class="{'form-control is-invalid': errors.subject_id}" v-model="myValue3" 
                :options="subjects" 
                :settings=" { theme: 'bootstrap-5', width: '400%'}"
                
                 />
  
                 <Field  name="subject_id" as="select" v-model="myValue3" hidden>
                  <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.text }}</option>
                </Field>
                <ErrorMessage name="subject_id" class="error-feedback" />
              </div>
              
            </div>
              <div class="form-group mt-3">
               
                <router-link to="/tegrsus" class="btn btn-secondary ml-2 float-start">Отмена</router-link>
                <button class="btn btn-primary btn-block float-end" :disabled="loading">
                  <span
                    v-show="loading"
                    class="spinner-border spinner-border-sm"
                  ></span>
                  Добавить связь
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
  
      name: "AddTegrsu",
      components: {
        Form,
        Field,
        ErrorMessage,
  
        
      },
      data() {
        const schema = yup.object().shape({
    
    group_id: yup.string().required('Требуется указать группу'),
    subject_id: yup.string().required('Требуется указать предмет'),
  
  
  });
    
        return {
          successful: false,
          loading: false,
          dataLoading:true,
          message: "",
          schema,
          groups: null,
  
          myValue: '',
        };
      },
      computed: {
  
      },
      mounted() {
      
      },
      methods: {
  
        async addTegrsu(tegrsu) {
          try {
            // запрос в psql
            this.loading=true;
  
            const response = await UserService.addTegrsu(tegrsu.tegrsu_teacher_id,tegrsu.tegrsu_group_id,tegrsu.tegrsu_subject_id);
            response.data;
            this.loading=false;
            this.successful=true;
  
            this.toast.success("Успешно добавили связь!");
          } catch (error) {
            this.message="Ошибка";
            this.toast.error("Ошибка добавления связи");
            console.error('Error updating student details:', error);
          }
        },
  
        async loadTeachersData() {
          try {
            const response = await UserService.getTeachersAsIdText(); 
            this.teachers = Array.isArray(response.data) ? response.data : [response.data];
            this.dataLoading=false;
          } catch (error) {
            console.error('Error loading groups data:', error);
          }
        },
        async loadGroupsData() {
          try {
            const response = await UserService.getGroupsAsIdText(); 
            this.groups = Array.isArray(response.data) ? response.data : [response.data];
            this.dataLoading=false;
          } catch (error) {
            console.error('Error loading groups data:', error);
          }
        },
        async loadSubjectsData() {
          try {
            const response = await UserService.getSubjectsAsIdText(); 
            this.subjects = Array.isArray(response.data) ? response.data : [response.data];
            this.dataLoading=false;
          } catch (error) {
            console.error('Error loading subjects data:', error);
          }
        },
  
  
      },
  
      created() {
      this.loadTeachersData();
      this.loadGroupsData();
      this.loadSubjectsData();
      },
    };
    </script>
  
  <style lang="scss" scoped>
  
  .error-feedback{
    white-space: nowrap;
    margin-left:5px;
  }
  
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
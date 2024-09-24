<template>
    <div class="col-md-12 list">
      <div v-if="tegrsu" >
        <Form  @submit="updateTegrsu" :validation-schema="schema" v-slot="{ errors }">
          
          <div>
            <div class="form-group d-inline-flex align-items-center col-12 mb-2">
              <label for="tegrsu_teacher_id">Преподаватель</label>
              <Field name="tegrsu_teacher_id" type="text" class="form-control" value="" :class="{'is-invalid': errors.tegrsu_teacher_id}" v-model="editedTergsu.tegrsu_teacher_id"/>
              <ErrorMessage name="tegrsu_teacher_id" class="error-feedback" />
            </div>
            <div class="form-group d-inline-flex align-items-center col-12 mb-2">
              <label class="col-form-label" for="tegrsu_group_id">Группа</label>
              <Field name="tegrsu_group_id" id="tegrsu_group_id" type="text" value="" class="form-control" :class="{'is-invalid': errors.tegrsu_group_id}" v-model="editedTegrsu.tegrsu_group_id"/>
              <ErrorMessage name="tegrsu_group_id" class="error-feedback" />
            </div>
            <div class="form-group d-inline-flex align-items-center col-12 mb-2">
              <label for="tegrsu_subject_id">Предмет</label>
              <Field name="tegrsu_subject_id" type="text" class="form-control" value="" :class="{'is-invalid': errors.tegrsu_subject_id}" v-model="editedTergsu.tegrsu_subject_id"/>
              <ErrorMessage name="tegrsu_subject_id" class="error-feedback" />
            </div>
       
            
            
          
            <div class="form-group  mt-3">
              
              <router-link to="#/tegrsus?filterModel="  class="mx-2 btn btn-secondary  float-start">Отмена</router-link>
            </div>
            <div class="form-group float-end">
              <button class="btn btn-danger float-end" @click="deleteTegrsu">
                Удалить связь с преподавателем
              </button>
            </div>
            <div class="form-group mt-3">
              <button class="btn btn-primary btn-block" :disabled="loading">
                <span
                  v-show="loading"
                  class="spinner-border spinner-border-sm"
                ></span>
                Обновить связь
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
          tegrsu: null, // заглушка для данных студента
          editedTegrsu: null, // заглушка для новых данных студента
          groups: null,
  
        };
      },
      methods: {
        // грузим студента из psql по id 
        async loadTegrsuDetail() {
          const tegrsuId = this.$route.params.tegrsuId;
          try {
            const response = await UserService.getTegrsuById(tegrsuId);
            this.tegrsu = response.data;
            // Клонирование объекта, для избежание редактирования данных сразу
            this.editedTegrsu = { ...response.data };
          } catch (error) {
            console.error('Error loading tegrsu details:', error);
          }
        },
        // Метод для обновления данных о студенте
        async updateTegrsu() {
          try {
            // запрос в psql
            this.loading=true;
  
            const response = await UserService.updateTegrsuById(this.tegrsu.tegrsu_id,this.tegrsu.tegrsu_teacher_id, this.editedTegrsu.tegrsu_group_id, this.editedTegrsu.tegrsu_subject_id);
            response.data;
            this.tegrsu = { ...this.editedTegrsu };
            this.loading=false;
            this.toast.success("Успешно обновили связь!");
          } catch (error) {
            console.error('Ошибка загрузки данных о связи:', error);
          }
        },
        async deleteTegrsu() {
          try {
            // запрос в psql
            this.loading=true;
  
            const response = await UserService.deleteTegrsuById(this.tegrsu.tegrsu_id);
            response.data;
            this.tegrsu = { ...this.editedTegrsu };
            this.loading=false;
            this.toast.success("Успешно удалили связь!");
          } catch (error) {
            console.error('Ошибка загрузки данных о связи:', error);
          }
        },
        async loadTeachersData() {
          try {
            const response = await UserService.getTeachersAsIdText(); 
            this.teachers = Array.isArray(response.data) ? response.data : [response.data];
          } catch (error) {
            console.error('Ошибка загрузки данных о преподавателе:', error);
          }
        },
        async loadGroupsData() {
          try {
            const response = await UserService.getGroupsAsIdText(); 
            this.groups = Array.isArray(response.data) ? response.data : [response.data];
          } catch (error) {
            console.error('Ошибка загрузки данных о преподавателе:', error);
          }
        },
        async loadSubjectsData() {
          try {
            const response = await UserService.getSubjectsAsIdText(); 
            this.subjects = Array.isArray(response.data) ? response.data : [response.data];
          } catch (error) {
            console.error('Ошибка загрузки данных о преподавателе:', error);
          }
        }
      },
      created() {
        this.loadGroupsData();
        this.loadSubjectsData();
        this.loadTegrsuDetail();
       
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
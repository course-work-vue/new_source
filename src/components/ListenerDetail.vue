<template>
  <div class="col-md-12 list">
    <div v-if="listener" >
      <Form @submit="updateListener" :validation-schema="schema" v-slot="{ errors }">
        <h2>Данные слушателя</h2>
        <div >
          <div class="form-group d-inline-flex align-items-center col-12 mb-2">
            <label for="lastname">Фамилия</label>
            <Field name="lastname" type="text" value="" class="form-control" :class="{'is-invalid': errors.lastname}" v-model="editedListener.lastname"/>
            <ErrorMessage name="lastname" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center col-12 mb-2">
            <label for="name">Имя</label>
            <Field name="name" type="text" class="form-control" value="" :class="{'is-invalid': errors.name}" v-model="editedListener.name"/>
            <ErrorMessage name="name" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center col-12 mb-2">
            <label for="surname">Отчество</label>
            <Field name="surname" type="text" class="form-control" value="" :class="{'is-invalid': errors.patronymic}" v-model="editedListener.surname"/>
            <ErrorMessage name="surname" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-6">
              <label for="group_id">Группа:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_id}" v-model="editedListener.group_id"
              :options="groups" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />
            
               <Field  name="group_id" as="select" v-model="editedListener.group_id" hidden>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.text }}</option>
              </Field>
              <ErrorMessage name="group_id" class="error-feedback" />
            </div>
     
            <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="passport ">Серия и номер паспорта</label>
            <Field name="passport " type="text" class="form-control" value="" :class="{'is-invalid': errors.passport }" v-model="editedListener.passport "/>
            <ErrorMessage name="passport " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="issue_date">Дата выдачи</label>
            <Field name="issue_date" type="date" class="form-control" value="" :class="{'is-invalid': errors.date}" v-model="editedListener.issue_date "/>
         
            <ErrorMessage name="issue_date " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="department_code ">Код подразделения</label>
            <Field name="department_code " type="text" class="form-control" value="" :class="{'is-invalid': errors.department_code }" v-model="editedListener.department_code "/>
            <ErrorMessage name="department_code " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="registration_address ">Адрес регистрации</label>
            <Field name="registration_address " type="text" class="form-control" value="" :class="{'is-invalid': errors.registration_address }" v-model="editedListener.registration_address "/>
            <ErrorMessage name="registration_address " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="SNILS">СНИЛС</label>
            <Field name="SNILS" type="text" class="form-control" value="" :class="{'is-invalid': errors.SNILS}" v-model="editedListener.snils "/>
            <ErrorMessage name="SNILS" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="phone_number ">Телефон</label>
            <Field name="phone_number " type="text" class="form-control" value="" :class="{'is-invalid': errors.phone_number }" v-model="editedListener.phone_number "/>
            <ErrorMessage name="phone_number " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="email">Email</label>
            <Field name="email" type="text" class="form-control"  value="" :class="{'is-invalid': errors.email}"  v-model="editedListener.email"/>
            <ErrorMessage name="email" class="error-feedback" />
          </div>

          <hr  size="2"  />
<h2>Пожелания слушателя</h2>
<div class="col-5">
    <table class="table table-bordered col col-3">
      <thead>
      <tr>
        <th>День</th>
        <th>Время начала</th>
        <th>Время окончания</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, index) in tableData" :key="index" >
        
        <td>
          <select class="form-select" v-model="entry.day_id">
            <option v-for="day in days" :key="day.value" :value="day.id">
              {{ day.text }}
            </option>
          </select>
        </td>
        <td>
          <input class="form-control" type="time" v-model="entry.starttime">
        </td>
        <td>
          <input class="form-control" type="time" v-model="entry.endtime">
        </td>
      
      </tr>
    </tbody>
    </table>
    <button type="button" class="btn btn-primary" @click="addRow">+</button>
  </div>
    
            <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="people_count">Количество человек:</label>
            <Field name="people_count" type="number" class="form-control" value="" :class="{'is-invalid': errors.people_count }" v-model="editedListener.people_count"/>
            <ErrorMessage name="people_count" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="hours">Количество часов:</label>
            <Field name="hours" type="number" class="form-control" value="" :class="{'is-invalid': errors.hours }" v-model="editedListener.hours" />
            <ErrorMessage name="hours" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="start_date">Начало:</label>
            <Field name="start_date" type="date" class="form-control" value="" :class="{'is-invalid': errors.start_date }" v-model="editedListener.start_date" />
            <ErrorMessage name="start_date" class="error-feedback" />
          </div>


          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="end_date">Конец:</label>
            <Field name="end_date" type="date" class="form-control" value="" :class="{'is-invalid': errors.end_date }" v-model="editedListener.end_date"/>
            <ErrorMessage name="end_date" class="error-feedback" />
          </div>
          
          <div class="form-group d-inline-flex align-items-center mb-2 col-12">
            <label for="wish_description">Дополнительный комментарий:</label>
            <Field name="wish_description" type="text" class="form-control" value="" :class="{'is-invalid': errors.wish_description}" v-model="editedListener.wish_description"/>
            <ErrorMessage name="wish_description" class="error-feedback" />
          </div>



          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block float-start" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить слушателя
            </button>
            <button type="button" class="btn btn-danger mx-2 float-end" @click="deleteListener">
              Удалить слушателя
            </button>
            <router-link to="/listeners" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
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
        listener: null, // заглушка для данных студента
        editedListener: null, // заглушка для новых данных студента
        days_of_week: null,
        groups: null,
        tableData: [],
        table_new_rows:false,
      };
    },
    methods: {
      async deleteListener() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteListenerById(this.listener.id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/listeners');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      addRow() {
    
    const newRow = { day_id: '', starttime: '', endtime: '' }; // ensure this is a new object
    this.tableData.push(newRow);
    this.table_new_rows=true;
  },
      async loadListenerDetail() {
        const listenerId = this.$route.params.listenerId;
        try {
          const response = await UserService.getListenerById(listenerId);
          this.listener = response.data;
          console.log(this.listener);
          console.log(this.listener.group_id);
          if (this.listener.group_id>0){
           console.log();
          }
          else{
  
            this.listener.group_id='NULL';
          }
          console.log(this.listener.group_id);
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedListener = { ...response.data };
        } catch (error) {
          console.error('Error loading listener details:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updateListener() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateListenerById(this.listener.id, this.editedListener.name , this.editedListener.surname  , this.editedListener.lastname  , this.editedListener.group_id,
          this.editedListener.snils , this.editedListener.passport , this.editedListener.issued_by , this.editedListener.issue_date , this.editedListener.department_code , this.editedListener.registration_address , this.editedListener.phone_number ,
          this.editedListener.email,this.editedListener.people_count, this.editedListener.hours, this.editedListener.start_date, this.editedListener.end_date,this.editedListener.wish_description, this.tableData,this.table_new_rows);
          response.data;
          this.listener = { ...this.editedListener };
          this.loading=false;
          this.toast.success("Успешно обновили слушателя!");
        } catch (error) {
          console.error('Ошибка :', error);
        }
      },
      async loadGroupsData() {
        try {
          const response = await UserService.getLgroupsAsIdText(); 
          this.groups = Array.isArray(response.data) ? response.data : [response.data];
          this.groups.unshift({ id: 'NULL', text: 'Нет' });
          this.dataLoading=false;
        } catch (error) {
          console.error('Error loading students data:', error);
        }
      },
      async loadDaysData() {
        try {
          const response = await UserService.getDaysAsIdText(); 
          this.days = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Error loading data:', error);
        }
      },
      async load_wishes() {
        try {
          const listenerId = this.$route.params.listenerId;
          const response = await UserService.getWishDaysById(listenerId); 
          this.tableData = Array.isArray(response.data) ? response.data : [response.data];
          console.log(this.tableData);
          this.dataLoading=false;
        } catch (error) {
          console.error('Error loading data:', error);
        }
      },
    },
    created() {
      this.load_wishes();
      this.loadGroupsData();
      this.loadDaysData();
      this.loadListenerDetail();
     
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
<template>
  <div class="col-md-12 list">
    <div v-if="payer" >
      <Form @submit="updatePayer" :validation-schema="schema" v-slot="{ errors }">
        
        <div >
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="lastname">Фамилия</label>
            <Field name="lastname" type="text" value="" class="form-control" :class="{'is-invalid': errors.lastname}" v-model="editedPayer.lastname "/>
            <ErrorMessage name="lastname" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="name">Имя</label>
            <Field name="name" type="text" class="form-control" value="" :class="{'is-invalid': errors.name}" v-model="editedPayer.name "/>
            <ErrorMessage name="name" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="surname">Отчество</label>
            <Field name="surname" type="text" class="form-control" value="" :class="{'is-invalid': errors.patronymic}" v-model="editedPayer.surname "/>
            <ErrorMessage name="surname" class="error-feedback" />
          </div>
         
     
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="passport ">Серия и номер паспорта</label>
            <Field name="passport " type="text" class="form-control" value="" :class="{'is-invalid': errors.passport }" v-model="editedPayer.passport "/>
            <ErrorMessage name="passport " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="issue_date">Дата выдачи</label>
            <Field name="issue_date" type="date" class="form-control" value="" :class="{'is-invalid': errors.date}" v-model="editedPayer.issue_date "/>
         
            <ErrorMessage name="issue_date " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="department_code ">Код подразделения</label>
            <Field name="department_code " type="text" class="form-control" value="" :class="{'is-invalid': errors.department_code }" v-model="editedPayer.department_code "/>
            <ErrorMessage name="department_code " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="registration_address ">Адрес регистрации</label>
            <Field name="registration_address " type="text" class="form-control" value="" :class="{'is-invalid': errors.registration_address }" v-model="editedPayer.registration_address "/>
            <ErrorMessage name="registration_address " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="SNILS">СНИЛС</label>
            <Field name="SNILS" type="text" class="form-control" value="" :class="{'is-invalid': errors.SNILS}" v-model="editedPayer.snils "/>
            <ErrorMessage name="SNILS" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="phone_number ">Телефон</label>
            <Field name="phone_number " type="text" class="form-control" value="" :class="{'is-invalid': errors.phone_number }" v-model="editedPayer.phone_number "/>
            <ErrorMessage name="phone_number " class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="email">Email</label>
            <Field name="email" type="text" class="form-control"  value="" :class="{'is-invalid': errors.email}"  v-model="editedPayer.email"/>
            <ErrorMessage name="email" class="error-feedback" />
          </div>

         



          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block float-start" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить законного представителя
            </button>
            <button type="button" class="btn btn-danger mx-2 float-end" @click="deletePayer">
              Удалить плательщика
            </button>
            <router-link to="/payers" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
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
        payer: null, // заглушка для данных студента
        editedPayer: null, // заглушка для новых данных студента
        groups: null,

      };
    },
    methods: {
      async deletePayer() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deletePayerById(this.payer.id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/payers');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      // грузим студента из psql по id 
      async loadPayerDetail() {
        const payerId = this.$route.params.payerId;
        try {
          const response = await UserService.getPayerById(payerId);
          this.payer = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedPayer = { ...response.data };
        } catch (error) {
          console.error('Error loading payer details:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updatePayer() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updatePayerById(this.payer.id, this.editedPayer.name , this.editedPayer.surname  , this.editedPayer.lastname  , 
          this.editedPayer.snils , this.editedPayer.passport , this.editedPayer.issued_by , this.editedPayer.issue_date , this.editedPayer.department_code , this.editedPayer.registration_address , this.editedPayer.phone_number ,
          this.editedPayer.email);
          response.data;
          this.payer = { ...this.editedPayer };
          this.loading=false;
          this.toast.success("Успешно обновили плательщика!");
        } catch (error) {
          console.error('Ошибка :', error);
        }
      },
      async loadGroupsData() {
        try {
          const response = await UserService.getGroupsAsIdText(); 
          this.groups = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error('Ошибка :', error);
        }
      }
    },
    created() {
      this.loadGroupsData();
      this.loadPayerDetail();
     
    },
  };
  </script>

<style lang="scss" scoped>

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
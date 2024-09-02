<template>
  <div class="col-md-12 list">
    <div v-if="payment" >
      <Form @submit="updatePayment" :validation-schema="schema" v-slot="{ errors }">
        
        <div >
          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
            <label for="contract_id">Номер договора</label>
            
            <Select2 class="col-5" :class="{'form-control is-invalid': errors.contract_id}" v-model="editedPayment.contract_id" 
            :options="contracts" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="contract_id" as="select" v-model="contract_id" hidden>
              <option v-for="contract in contracts" :key="contract.id" :value="contract.id">{{ contract.text }}</option>
            </Field>
            <ErrorMessage name="contract_id" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2">
              <label for="expiration_date">Дата просрочки:</label>
              <Field name="expiration_date" type="date"  class="form-control" value="" :class="{'is-invalid': errors.expiration_date}" v-model="editedPayment.expiration_date"/>
              <ErrorMessage name="expiration_date" class="error-feedback" />
            </div>

            <div class="form-group d-inline-flex align-items-center mb-2">
              <label for="date_40">Дата оплаты 40%:</label>
              <Field name="date_40" type="date"  class="form-control" value="" :class="{'is-invalid': errors.date_40}" v-model="editedPayment.date_40"/>
              <ErrorMessage name="date_40" class="error-feedback" />
            </div>


            <div class="form-group d-inline-flex align-items-center mb-2 col-6">
              <label for="all_sum">Вся сумма:</label>
              <Field name="all_sum" type="text" class="form-control" value="" :class="{'is-invalid': errors.all_sum}" v-model="editedPayment.all_sum"/>
              <ErrorMessage name="all_sum" class="error-feedback" />
            </div>
            <div class="form-group d-inline-flex align-items-center mb-2 col-5">
              <label for="deposited_amount">Внесённая сумма:</label>
              <Field name="deposited_amount" type="number" class="form-control" value="" :class="{'is-invalid': errors.deposited_amount}" v-model="editedPayment.deposited_amount"/>
              <ErrorMessage name="deposited_amount" class="error-feedback" />
            </div>

            <div class="form-group d-inline-flex align-items-center mb-2 col-5">
              <label for="left_to_pay">Остаточная сумма:</label>
              <Field name="left_to_pay" type="number" class="form-control" value="" :class="{'is-invalid': errors.left_to_pay}" v-model="editedPayment.left_to_pay"/>
              <ErrorMessage name="left_to_pay" class="error-feedback" />
            </div>

            <div class="form-group d-inline-flex align-items-center mb-2 col-6">
              <label for="bank">Банк:</label>
              <Field name="bank" type="text" class="form-control" value="" :class="{'is-invalid': errors.bank}" v-model="editedPayment.bank"/>
              <ErrorMessage name="bank" class="error-feedback" />
            </div>

         



          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block float-start" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить платёж
            </button>

            <button type="button" class="btn btn-danger mx-2 float-end" @click="deletePayment">
              Удалить платёж
            </button>
            <router-link to="/payments" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
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
        payment: null, // заглушка для данных студента
        editedPayment: null, // заглушка для новых данных студента
        groups: null,
        contracts:null

      };
    },
    methods: {

      async deletePayment() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deletePaymentById(this.payment.id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/payments');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      // грузим студента из psql по id 
      async loadPaymentDetail() {
        const paymentID = this.$route.params.paymentID;
        try {
          const response = await UserService.getPaymentById(paymentID);
          this.payment = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedPayment = { ...response.data };
        } catch (error) {
          console.error('Error loading payer details:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updatePayment() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updatePaymentById(this.payment.id, this.editedPayment.contract_id, this.editedPayment.expiration_date,this.editedPayment.date_40, this.editedPayment.all_sum, this.editedPayment.deposited_amount, this.editedPayment.left_to_pay, this.editedPayment.bank);
          response.data;
          this.payer = { ...this.editedPayer };
          this.loading=false;
          this.toast.success("Успешно обновили плательщика!");
        } catch (error) {
          console.error('Ошибка :', error);
        }
      },
      async loadContractsData() {
        try {
          const response = await UserService.getContractsAsIdText(); 
          this.contracts = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      },
    },
    created() {
      this.loadPaymentDetail();
     this.loadContractsData();
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
<template>
  <div class="col-md-12 list">
    <div v-if="contract" >
      <Form @submit="updateContract" :validation-schema="schema" v-slot="{ errors }">
        
        <div >

          
          <div class="form-group">
            <label for="listener_id">Слушатель</label>
            
            <Select2 :class="{'form-control is-invalid': errors.listener_id}" v-model="editedContract.listener_id" 
            :options="listeners" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="listener_id" as="select" v-model="editedContract.listener_id" hidden>
              <option v-for="listener in listeners" :key="listener.id" :value="listener.id">{{ listener.text }}</option>
            </Field>
            <ErrorMessage name="listener_id" class="error-feedback" />
          </div>

          <div class="form-group">
            <label for="payer_id">Законный представитель</label>
            
            <Select2 :class="{'form-control is-invalid': errors.payer_id}" v-model="editedContract.payer_id" 
            :options="payers" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="payer_id" as="select" v-model="editedContract.payer_id" hidden>
              <option v-for="payer in payers" :key="payer.id" :value="payer.id">{{ payer.text }}</option>
            </Field>
            <ErrorMessage name="payer_id" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center float-none mb-2 col-5">
            <label for="contr_number">Номер договра</label>
            <Field name="contr_number" type="text" value="" class="form-control" :class="{'is-invalid': errors.contr_number}" v-model="editedContract.contr_number"/>
            <ErrorMessage name="contr_number" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center float-none mb-2 col-5">
            <label for="program_id">Программа</label>
            
            <Select2 :class="{'form-control is-invalid': errors.program_id}" v-model="editedContract.program_id" 
            :options="programs" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="program_id" as="select" v-model="editedContract.program_id" hidden>
              <option v-for="program in programs" :key="program.id" :value="program.id">{{ program.text }}</option>
            </Field>
            <ErrorMessage name="program_id" class="error-feedback" />
            <div class="form-group d-inline-flex align-items-center col-5 mb-2">

<Field v-slot="{ field2 }" name="course_work_vipysk" type="radio" :value="true">
  <label>
    <input type="radio" name="course_work_vipysk" v-bind="field2" value="false" class="form-check-input mt-0 ml-5"  />
    Закончил курс
  </label>
</Field>
<ErrorMessage name="course_work_vipysk" class="error-feedback" />
<Field v-slot="{ field }" name="editedCw.course_work_vipysk" type="radio" :value="true">
  <label>
    <input type="radio" name="editedCw.course_work_vipysk" v-bind="field" value="true" class="form-check-input mt-0 ml-5"  />
    Закончил курс с документом
  </label>
</Field>
<Field v-slot="{ field }" name="editedCw.course_work_vipysk" type="radio" :value="true">
  <label>
    <input type="radio" name="editedCw.course_work_vipysk" v-bind="field" value="true" class="form-check-input mt-0 ml-5"   />
    Не закончил
  </label>
</Field>
</div>
          </div>


          <div class="form-group d-inline-flex align-items-center float-none mb-2 col-5">
            <button class="btn btn-primary btn-block float-start" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить договор
            </button>
            <button type="button" class="btn btn-danger mx-2 float-end" @click="deleteContract">
              Удалить договор
            </button>
            <router-link to="/contracts" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
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
        contract: null, // заглушка для данных студента
        editedContract: null, // заглушка для новых данных студента
        listeners: null,
        payers: null,
        programs:null

      };
    },
    methods: {

      async deleteContract() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteContractById(this.contract.id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/contracts');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      // грузим студента из psql по id 
      async loadContractDetail() {
        const contractId = this.$route.params.contractId;
        try {
          const response = await UserService.getContractById(contractId);
          this.contract = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedContract = { ...response.data };
        } catch (error) {
          console.error('Error loading contract details:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updateContract() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateContractById(this.contract.id, this.editedContract.listener_id, this.editedContract.payer_id, this.editedContract.contr_number, 
          this.editedContract.program_id);
          response.data;
          this.contract = { ...this.editedContract };
          this.loading=false;
          this.toast.success("Успешно обновили!");
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      },
      async loadListenersData() {
        try {
          const response = await UserService.getListenersAsIdText(); 
          this.listeners = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      },

      async loadPayersData() {
        try {
          const response = await UserService.getPayersAsIdText(); 
          this.payers = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      },
      async loadProgramsData() {
        try {
          const response = await UserService.getProgramsAsIdText(); 
          this.programs = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      }
    },
    created() {
      this.loadContractDetail();
      this.loadListenersData();
      this.loadPayersData();
      this.loadProgramsData();

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
label{
  margin-right: 15px;
  white-space: nowrap;
}
</style>
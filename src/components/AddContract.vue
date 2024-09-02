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
    <div v-else class="col-md-12">
        <Form @submit="addContract" :validation-schema="schema" v-slot="{ errors }">
          <div>
                      
          <div class="form-group d-inline-flex align-items-center mb-2 col-8">
            <label  for="listener_id">Слушатель</label>
            
            <Select2 class="col-5" :class="{'form-control is-invalid': errors.listener_id}" v-model="myValue" 
            :options="listeners" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="listener_id" as="select" v-model="myValue" hidden>
              <option v-for="listener in listeners" :key="listener.id" :value="listener.id">{{ listener.text }}</option>
            </Field>
            <ErrorMessage name="listener_id" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2 col-6">
            <label for="payer_id">Законный представитель</label>
            
            <Select2 class="col-5" :class="{'form-control is-invalid': errors.payer_id}" v-model="myValue2" 
            :options="payers" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="payer_id" as="select" v-model="myValue2" hidden>
              <option v-for="payer in payers" :key="payer.id" :value="payer.id">{{ payer.text }}</option>
            </Field>
            <ErrorMessage name="payer_id" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="contr_number">Номер договора</label>
            <Field name="contr_number" type="text" value="" class="form-control" :class="{'is-invalid': errors.contr_number}" />
            <ErrorMessage name="contr_number" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="program_id">Программы</label>
            
            <Select2 class="col-5" :class="{'form-control is-invalid': errors.program_id}" v-model="myValue3" 
            :options="programs" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="program_id" as="select" v-model="myValue3" hidden>
              <option v-for="program in programs" :key="program.id" :value="program.id">{{ program.text }}</option>
            </Field>
            <ErrorMessage name="program_id" class="error-feedback" />
          </div>
  

          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="cert_date">Дата выдачи сертификата</label>
            <Field name="cert_date" type="date" value="NULL" class="form-control" :class="{'is-invalid': errors.cert_date}" />
            <ErrorMessage name="cert_date" class="error-feedback" />
          </div>
          
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="listened_hours">Прослушанные часы</label>
            <Field name="listened_hours" type="number" value="NULL" class="form-control" :class="{'is-invalid': errors.listened_hours}" />
            <ErrorMessage name="listened_hours" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="date_enroll">Дата зачисления</label>
            <Field name="date_enroll" type="date" value="" class="form-control" :class="{'is-invalid': errors.date_enroll}" />
            <ErrorMessage name="date_enroll" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center mb-2 col-5">
            <label for="date_kick">Дата отчисления</label>
            <Field name="date_kick" type="date" class="form-control" :class="{'is-invalid': errors.dadate_kickte_enroll}" />
            <ErrorMessage name="date_kick" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2 col-6">
              <label for="group_to_move">Группа для перевода:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_to_move}" v-model="myValueq" 
              :options="groups" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="group_to_move" as="select" v-model="myValueq" hidden>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.text }}</option>
              </Field>
              <ErrorMessage name="group_to_move" class="error-feedback" />
            </div>

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
    <input type="radio" name="course_work_vipysk" v-bind="field" value="true" class="form-check-input mt-0 ml-5"  />
    Закончил курс с документом
  </label>
</Field>
<Field v-slot="{ field3 }" name="editedCw.course_work_vipysk" type="radio" :value="true">
  <label>
    <input type="radio" name="course_work_vipysk" v-bind="field3" value="true" class="form-check-input mt-0 ml-5"   />
    Не закончил
  </label>
</Field>
</div>
          </div>
          <div class="form-group mt-3">
              <button class="btn btn-primary btn-block" :disabled="loading">
                <span
                  v-show="loading"
                  class="spinner-border spinner-border-sm"
                ></span>
                Добавить договор
              </button>
              <router-link to="/contracts" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
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

    name: "AddContract",
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
        listeners: null,
        payers: null,
        programs: null,
        groups:null,
      };
    },
    computed: {

    },
    mounted() {
    
    },
    methods: {

      async addContract(contract) {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.addContract(contract.listener_id, contract.payer_id, contract.contr_number, 
          contract.program_id, contract.cert_date, contract.listened_hours, contract.date_enroll, contract.date_kick,contract.group_to_move);
          response.data;
          this.loading=false;
          this.successful=true;

          this.toast.success("Успешно добавили договор!");
        } catch (error) {
          this.message="Ошибка";
          this.toast.error("Ошибка добавления договор");
          console.error('Error updating contract details:', error);
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
      async loadGroupsData() {
        try {
          const response = await UserService.getLgroupsAsIdText(); 
          this.groups = Array.isArray(response.data) ? response.data : [response.data];
          this.groups.unshift({ id: 'NULL', text: 'Нет' });
          console.log(this.groups)
          this.dataLoading=false;
        } catch (error) {
          console.error('Error loading data:', error);
        }
      },

      async loadProgramsData() {
        try {
          const response = await UserService.getProgramsAsIdText(); 
          this.programs = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      },

    },

    created() {
      this.loadListenersData();
      this.loadPayersData();
      this.loadProgramsData();
      this.loadGroupsData();
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